import assetFiles from 'virtual:art-index';
import { escape } from './dom';

let manifest: Record<string, string[]> = {};
const available = new Set(assetFiles);
export async function loadAssets(): Promise<void> {
  const response = await fetch(`${import.meta.env.BASE_URL}assets/manifest.json`);
  if (!response.ok) throw new Error('资源路径表 assets/manifest.json 无法读取。');
  const parsed: unknown = await response.json();
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)
    || Object.values(parsed).some(paths => !Array.isArray(paths) || paths.some(path => typeof path !== 'string' || !path.startsWith('assets/') || path.includes('..') || path.includes(':')))) {
    throw new Error('assets/manifest.json 格式有误：每个资源名称应对应一个路径列表，路径须以 assets/ 开头。');
  }
  manifest = parsed as Record<string, string[]>;
  for (const [family, file] of [['Limelight', 'limelight.woff2'], ['Josefin Sans', 'josefin-sans.woff2']]) {
    const path = `assets/fonts/${file}`;
    if (available.has(path)) {
      const face = new FontFace(family, `url("${import.meta.env.BASE_URL}${path}")`);
      try { document.fonts.add(await face.load()); } catch { /* An optional font must never prevent a career from loading. */ }
    }
  }
}
export function art(key: string, label: string, className = ''): string {
  const paths = manifest[key] ?? ['svg', 'png', 'webp'].map(ext => `assets/${key}.${ext}`);
  const path = paths.find(path => !path.includes('..') && !path.includes(':') && available.has(path));
  if (path) return `<figure class="art ${className}"><img src="${escape(import.meta.env.BASE_URL + path)}" alt="${escape(label)}"><figcaption class="failed-art" hidden>ART PLACEHOLDER<br>${escape(label)}</figcaption></figure>`;
  return `<figure class="art art-placeholder ${className}" role="img" aria-label="Art placeholder: ${escape(label)}"><span>ART<br>PLACEHOLDER</span><figcaption>${escape(label)}</figcaption></figure>`;
}
export function pawnArt(pawn: string, className = ''): string { return art(`characters/pawn_${pawn}`, `${pawn} pawn`, className); }
export function npcArt(npc: string, expression: string): string {
  const id = npc.toLowerCase().replace(/[^a-z0-9_]+/g, '-').replace(/^-|-$/g, '');
  return art(`npc/${id}_${expression || 'neutral'}`, `${npc} · ${expression || 'neutral'}`, 'npc-art');
}
