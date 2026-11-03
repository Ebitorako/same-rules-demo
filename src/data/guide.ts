import { BOARD } from '../game/board';
import type { Locale } from '../game/types';
import { readCsv } from './parse';

export interface GuideNote {
  cardId: string; advice: string; background: string; theory: string; reference: string; notes: string;
}
export interface GuideData {
  name: string; role: string; portrait: string; notes: GuideNote[];
  energyReminder?: Record<Locale, string>;
}
const HEADERS = ['卡号', '选择前建议', '行业背景', '理论解释', '对应文献', '备注'];

export function parseGuide(csv: string, config: unknown): GuideData {
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('guide.json 应为包含 name、role、portrait 的对象。');
  const value = config as Record<string, unknown>;
  for (const field of ['name', 'role', 'portrait']) {
    if (typeof value[field] !== 'string' || !value[field].trim()) throw new Error(`guide.json：${field} 不能为空。`);
  }
  if (!/^npc\/[a-z0-9_-]+$/.test(String(value.portrait))) throw new Error('guide.json：portrait 应为 npc/guide_neutral 这样的资源名称，不含扩展名。');
  let energyReminder: GuideData['energyReminder'];
  if (value.energyReminder !== undefined) {
    const reminder = value.energyReminder as Record<string, unknown>;
    if (!reminder || typeof reminder !== 'object' || Array.isArray(reminder)
      || ['en', 'zh-CN'].some(locale => typeof reminder[locale] !== 'string' || !String(reminder[locale]).trim())) {
      throw new Error('guide.json：energyReminder 需要包含非空的 en 和 zh-CN 提醒。');
    }
    energyReminder = { en: String(reminder.en).trim(), 'zh-CN': String(reminder['zh-CN']).trim() };
  }
  const notes = readCsv(csv, HEADERS, 'guide.csv').map(row => ({
    cardId: row['卡号'], advice: row['选择前建议'], background: row['行业背景'],
    theory: row['理论解释'], reference: row['对应文献'], notes: row['备注'],
  }));
  const allowed = new Set(['GENERAL', 'PROMOTION', ...BOARD.flatMap(tile => tile.cardId ? [tile.cardId] : [])]);
  const seen = new Set<string>();
  for (const note of notes) {
    if (!allowed.has(note.cardId)) throw new Error(`guide.csv：卡号 ${note.cardId || '（空白）'} 无效，请用棋盘卡号、GENERAL 或 PROMOTION。`);
    if (seen.has(note.cardId)) throw new Error(`guide.csv：卡号 ${note.cardId} 重复，每个卡号只需要一行。`);
    seen.add(note.cardId);
  }
  if (!notes.some(note => note.cardId === 'GENERAL' && note.advice)) throw new Error('guide.csv：需要 GENERAL 行，并填写“选择前建议”，供空白卡号提示使用。');
  return { name: String(value.name).trim(), role: String(value.role).trim(), portrait: String(value.portrait), notes, energyReminder };
}
