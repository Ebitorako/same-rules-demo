import Papa from 'papaparse';
import { LEGACY_STAT_NAMES, type Ending, type Pawn, type ScenarioOption, type Stats, type StatName } from '../game/types';

const SCENARIO_HEADERS = ['卡号', '章节', '格子', '类型', '场景标题', '场景描述', '背景信息（游戏内可翻看）', 'NPC', '出现条件（可选）', '选项', '适用棋子', '选项文字', '结果 ♀', '结果 ♂', 'NPC 表情 ♀', 'NPC 表情 ♂', '数值变化 ♀', '数值变化 ♂', '对应文献', '备注'];
const ENDING_HEADERS = ['编号', '结局名称', '触发条件', '适用棋子', '结局文字（正面）', '背面：理论概念', '对应文献', '对下一局的影响', '美术需求', '备注'];
export const EXPRESSIONS = ['pleased', 'neutral', 'appraising', 'frowning', 'awkward', 'cold'] as const;
const EXPRESSION_MAP: Record<string, string> = { 满意: 'pleased', 中性: 'neutral', 打量: 'appraising', 皱眉: 'frowning', 尴尬: 'awkward', 冷淡: 'cold' };
type CsvRow = Record<string, string>;

export function readCsv(text: string, required: string[], filename: string): CsvRow[] {
  const cleanText = text.replace(/^\uFEFF/, '');
  const rawHeaders = Papa.parse<string[]>(cleanText, { preview: 1 }).data[0]?.map((header) => header.trim()) ?? [];
  const duplicates = rawHeaders.filter((header, index) => rawHeaders.indexOf(header) !== index);
  if (duplicates.length) throw new Error(`${filename} 表头重复：${[...new Set(duplicates)].join('、')}。`);
  const parsed = Papa.parse<CsvRow>(cleanText, { header: true, skipEmptyLines: 'greedy', transformHeader: (header) => header.trim(), transform: (value) => value.trim() });
  const reasons: Record<string, string> = { TooManyFields: '列数超过表头，请检查包含逗号的文字是否用英文双引号包围。', TooFewFields: '列数少于表头，请保留空白单元格的逗号。', MissingQuotes: '英文双引号没有成对闭合。', InvalidQuotes: '英文双引号的位置不正确。', UndetectableDelimiter: '无法识别 CSV 列，请从表格重新导出逗号分隔的 UTF-8 CSV。' };
  const issues = parsed.errors.map((error) => `${filename} 第 ${(error.row ?? 0) + 2} 行：${reasons[error.code] ?? error.message}`);
  const missing = required.filter((header) => !parsed.meta.fields?.includes(header));
  if (missing.length) issues.push(`${filename} 缺少表头：${missing.join('、')}`);
  if (issues.length) throw new Error(issues.join('\n'));
  return parsed.data;
}

function parsePawn(value: string, label: string): 'both' | Pawn {
  if (value === 'both' || /^都可(?:（.*）)?$/.test(value)) return 'both';
  if (value === '仅♀' || value === 'female') return 'female';
  if (value === '仅♂' || value === 'male') return 'male';
  throw new Error(`${label}：适用棋子“${value}”无效，请填写 都可、仅♀ 或 仅♂。`);
}

export function parseDelta(text: string, label = '数值变化'): Partial<Stats> {
  const result: Partial<Stats> = {};
  if (!text.trim()) return result;
  for (const part of text.split(/[,，]/)) {
    const match = /^([A-Za-z]+)\s*([+-])\s*(\d+(?:\.\d+)?)$/.exec(part.trim());
    if (!match) throw new Error(`${label}：“${part.trim()}”格式无效，例如 Network+1, Energy-1。`);
    const name = match[1] as StatName;
    if (!(LEGACY_STAT_NAMES as readonly string[]).includes(name)) throw new Error(`${label}：未知数值“${name}”，可用 ${LEGACY_STAT_NAMES.join('、')}。`);
    if (name in result) throw new Error(`${label}：“${name}”重复，请合并为一个变化值。`);
    const value = Number(`${match[2]}${match[3]}`);
    if (!Number.isFinite(value)) throw new Error(`${label}：“${part}”不是有限数值。`);
    result[name] = value;
  }
  return result;
}

export function parseScenarios(text: string): ScenarioOption[] {
  return readCsv(text, SCENARIO_HEADERS, 'scenarios.csv').flatMap<ScenarioOption>((row, index) => {
    if (!row['选项文字']) return [];
    const label = `scenarios.csv 第 ${index + 2} 行（${row['卡号']} 选项 ${row['选项']}）`;
    if (!['情境', 'Boss'].includes(row['类型'])) throw new Error(`${label}：类型应为 情境 或 Boss。`);
    if (!/^[1234]$/.test(row['选项'])) throw new Error(`${label}：选项必须为 1、2、3 或 4。`);
    return [{
      cardId: row['卡号'], chapter: row['章节'], tile: row['格子'], type: row['类型'] === 'Boss' ? 'boss' : 'scenario',
      title: row['场景标题'], scene: row['场景描述'], background: row['背景信息（游戏内可翻看）'], npc: row.NPC,
      condition: row['出现条件（可选）'], option: Number(row['选项']), pawn: parsePawn(row['适用棋子'], label), optionText: row['选项文字'],
      results: { female: row['结果 ♀'], male: row['结果 ♂'] },
      expressions: { female: EXPRESSION_MAP[row['NPC 表情 ♀']] ?? row['NPC 表情 ♀'], male: EXPRESSION_MAP[row['NPC 表情 ♂']] ?? row['NPC 表情 ♂'] },
      deltas: { female: parseDelta(row['数值变化 ♀'], `${label} 数值变化 ♀`), male: parseDelta(row['数值变化 ♂'], `${label} 数值变化 ♂`) },
      reference: row['对应文献'], notes: row['备注'],
    }];
  });
}

export function parseEndings(text: string): Ending[] {
  return readCsv(text, ENDING_HEADERS, 'endings.csv').map<Ending>((row, index) => ({
    id: row['编号'], name: row['结局名称'], pawn: parsePawn(row['适用棋子'], `endings.csv 第 ${index + 2} 行`),
    front: row['结局文字（正面）'], back: row['背面：理论概念'], triggerNote: row['触发条件'], reference: row['对应文献'],
    nextRoundNote: row['对下一局的影响'], artNote: row['美术需求'], notes: row['备注'],
  }));
}
