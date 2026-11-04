import { defineConfig } from 'vitest/config';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const assetRoot = join(process.cwd(), 'public', 'assets');
const dataRoot = join(process.cwd(), 'public', 'data');
const dataHash = createHash('sha256');
for (const filename of readdirSync(dataRoot).filter(name => /\.(json|csv)$/.test(name)).sort()) {
  dataHash.update(filename).update('\0').update(readFileSync(join(dataRoot, filename))).update('\0');
}
function assetFiles(directory: string): string[] {
  try {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? assetFiles(path) : /\.(svg|png|webp|jpe?g|woff2?|mp3|wav|ogg|m4a)$/i.test(entry.name)
        ? [relative(join(process.cwd(), 'public'), path).replaceAll('\\', '/')] : [];
    });
  } catch { return []; }
}

export default defineConfig({
  base: './',
  define: { __DATA_VERSION__: JSON.stringify(dataHash.digest('hex').slice(0, 16)) },
  plugins: [{
    name: 'local-art-index',
    resolveId(id) { if (id === 'virtual:art-index') return '\0virtual:art-index'; },
    load(id) { if (id === '\0virtual:art-index') return `export default ${JSON.stringify(assetFiles(assetRoot))};`; },
    configureServer(server) {
      server.watcher.on('all', (_event, path) => {
        if (path.replaceAll('\\', '/').includes('/public/assets/')) {
          const module = server.moduleGraph.getModuleById('\0virtual:art-index');
          if (module) server.moduleGraph.invalidateModule(module);
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  }],
  test: { include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'], environment: 'node' },
});
