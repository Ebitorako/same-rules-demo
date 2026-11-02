import type { CopyData, Ending, GameData } from '../game/types';
import { parseTeamContent } from './team';
import { parseGuide, type GuideData } from './guide';

async function fetchText(filename: string): Promise<string> {
    // Keep a new build from combining its code with cached text from an older release.
    const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}?v=${__DATA_VERSION__}`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`无法读取 data/${filename}（${response.status}），请检查文件是否放在 public/data/。`);
    return response.text();
}
export async function loadData(): Promise<GameData> {
  const [content, legacyText] = await Promise.all([fetchText('team-content.json'), fetchText('legacy-data.json')]);
  const data = parseTeamContent(content);
  let legacy: { endings: Ending[]; copy: CopyData };
  try { legacy = JSON.parse(legacyText); }
  catch { throw new Error('legacy-data.json 格式无效；旧版收藏需要保留。'); }
  return { ...data, legacyEndings: legacy.endings, legacyCopy: legacy.copy };
}

export async function loadGuideData(): Promise<GuideData> {
  const [csv, config] = await Promise.all([fetchText('guide.csv'), fetchText('guide.json')]);
  let parsed: unknown;
  try { parsed = JSON.parse(config); }
  catch { throw new Error('guide.json 格式无效，请检查逗号、引号和括号。'); }
  return parseGuide(csv, parsed);
}
