import type { Candidate, CopyData, GameData, Policy } from '../game/types';
import { parseEndings, parseScenarios } from './parse';
import { validateData } from './validate';
import { parseGuide, type GuideData } from './guide';

async function fetchText(filename: string): Promise<string> {
    const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}`);
    if (!response.ok) throw new Error(`无法读取 data/${filename}（${response.status}），请检查文件是否放在 public/data/。`);
    return response.text();
}
export async function loadData(): Promise<GameData> {
  const [scenarios, endings, candidatesText, policiesText, copyText] = await Promise.all([
    fetchText('scenarios.csv'), fetchText('endings.csv'), fetchText('candidates.json'), fetchText('policies.json'), fetchText('copy.json'),
  ]);
  function json<T>(text: string, filename: string): T {
    try { return JSON.parse(text) as T; }
    catch { throw new Error(`${filename} 格式无效，请检查逗号、引号和括号。`); }
  }
  const candidates = json<{ candidates: Candidate[] }>(candidatesText, 'candidates.json');
  const policies = json<{ policies: Policy[]; powerTokens: number }>(policiesText, 'policies.json');
  const data: GameData = {
    scenarios: parseScenarios(scenarios), endings: parseEndings(endings), candidates: candidates?.candidates,
    policies: policies?.policies, powerTokens: policies?.powerTokens, copy: json<CopyData>(copyText, 'copy.json'),
  };
  const issues = validateData(data);
  if (issues.length) throw new Error(`剧情资料需要修正：\n${issues.join('\n')}`);
  return data;
}

export async function loadGuideData(): Promise<GuideData> {
  const [csv, config] = await Promise.all([fetchText('guide.csv'), fetchText('guide.json')]);
  let parsed: unknown;
  try { parsed = JSON.parse(config); }
  catch { throw new Error('guide.json 格式无效，请检查逗号、引号和括号。'); }
  return parseGuide(csv, parsed);
}
