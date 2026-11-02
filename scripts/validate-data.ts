import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDataWarnings } from '../src/data/validate';
import { parseTeamContent } from '../src/data/team';
import { parseGuide } from '../src/data/guide';
import { parseTranslationCatalog } from '../src/data/localize';

try {
  const read = (file: string): string => {
    try { return readFileSync(join(process.cwd(), 'public', 'data', file), 'utf8'); }
    catch { throw new Error(`无法读取 public/data/${file}。请确认文件存在，并在 Game Demo 文件夹运行检查。`); }
  };
  const json = (file: string) => {
    const text = read(file);
    try { return JSON.parse(text); }
    catch { throw new Error(`${file} 格式无效，请检查英文双引号、逗号和括号是否完整。`); }
  };
  const data = parseTeamContent(read('team-content.json'));
  const guide = parseGuide(read('guide.csv'), json('guide.json'));
  const chinese = parseTranslationCatalog(read('zh-CN.json'));
  console.log(`正式资料检查通过：${new Set(data.scenarios.map(r => r.cardId)).size} 个卡槽、${data.scenarios.length} 行选项、${data.endings.length} 个终局、${data.milestones?.length} 个章节里程碑、${data.chapters?.length} 段开场。`);
  console.log(`指引资料检查通过：${guide.name}；正式建议来自剧情行的规则书列。`);
  console.log(`中文资料检查通过：${Object.keys(chinese.translations).length} 条原文对应；语言切换共用正式规则。`);
  for (const warning of getDataWarnings(data)) console.warn(`提醒：${warning}`);
} catch (error) {
  console.error(`资料检查未通过：\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
