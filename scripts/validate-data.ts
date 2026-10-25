import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEndings, parseScenarios } from '../src/data/parse';
import { getDataWarnings, validateData } from '../src/data/validate';
import type { GameData } from '../src/game/types';

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
  const candidates = json('candidates.json');
  const policies = json('policies.json');
  const data: GameData = {
    scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')),
    candidates: candidates?.candidates, policies: policies?.policies, powerTokens: policies?.powerTokens,
    copy: json('copy.json'),
  };
  const issues = validateData(data);
  if (issues.length) {
    console.error(`资料检查未通过，共 ${issues.length} 项：\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`资料检查通过：20 张卡、${data.scenarios.length} 行选项、${data.endings.length} 个结局。`);
    for (const warning of getDataWarnings(data)) console.warn(`提醒：${warning}`);
  }
} catch (error) {
  console.error(`资料检查未通过：\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
