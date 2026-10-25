import { defineConfig } from 'vitest/config';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const assetRoot = join(process.cwd(), 'public', 'assets');
function assetFiles(directory: string): string[] {
  try {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? assetFiles(path) : /\.(svg|png|webp|jpe?g|woff2?)$/i.test(entry.name)
        ? [relative(join(process.cwd(), 'public'), path).replaceAll('\\', '/')] : [];
    });
  } catch { return []; }
}

export default defineConfig({
  base: './',
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
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
