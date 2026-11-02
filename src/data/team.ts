import { BOARD } from '../game/board';
import { matchesCondition, parseCondition } from '../game/conditions';
import { STAT_NAMES, type GameData, type Pawn, type Run, type ScenarioOption, type StoryEffect } from '../game/types';
import { EXPRESSIONS } from './parse';

const PAWNS: Pawn[] = ['female', 'male'];
const nonempty = (value: unknown): value is string => typeof value === 'string' && Boolean(value.trim());
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function parseTeamContent(text: string): GameData {
  let data: GameData;
  try { data = JSON.parse(text); }
  catch { throw new Error('team-content.json 格式无效，请检查引号、逗号和括号。'); }
  const errors = validateTeamData(data);
  if (errors.length) throw new Error(`正式剧情资料需要修正：\n${errors.join('\n')}`);
  return data;
}

export function validateTeamData(data: GameData): string[] {
  const errors: string[] = [];
  if (!isObject(data)) return ['正式剧情资料应为对象。'];
  for (const field of ['scenarios', 'endings', 'candidates', 'policies', 'chapters', 'milestones'] as const) {
    if (!Array.isArray(data[field])) errors.push(`${field} 资料缺失或不是列表。`);
  }
  if (errors.length) return errors;
  if (data.contentVersion !== 'team-2026-11-03') errors.push('正式内容版本不匹配。');
  const endingIds = new Set(data.endings.map(e => e.id));
  const milestoneIds = new Set(data.milestones!.map(e => e.id));
  const policyIds = new Set(data.policies.map(e => e.id));
  const candidateIds = new Set(data.candidates.map(e => e.id));
  const boardCards = BOARD.filter(tile => tile.cardId);
  const sources = new Set<string>();
  const stats = (value: unknown, label: string) => {
    if (!isObject(value)) { errors.push(`${label} 的数值变化无效。`); return; }
    for (const [name, amount] of Object.entries(value)) {
      if (!(STAT_NAMES as readonly string[]).includes(name) || typeof amount !== 'number' || !Number.isFinite(amount)) errors.push(`${label}：未知或无效数值 ${name}。`);
    }
  };
  const condition = (text: string | undefined, label: string) => {
    try { parseCondition(text ?? ''); }
    catch { errors.push(`${label} 条件无效：${text}`); }
  };
  const effects = (items: StoryEffect[] | undefined, label: string) => {
    for (const effect of items ?? []) {
      condition(effect.when, label);
      if (effect.delta) stats(effect.delta, label);
      if (effect.deltaOverride) stats(effect.deltaOverride, label);
      if (effect.endingId && !endingIds.has(effect.endingId)) errors.push(`${label} 引用不存在的结局 ${effect.endingId}。`);
      if (effect.milestoneId && !milestoneIds.has(effect.milestoneId)) errors.push(`${label} 引用不存在的章节卡 ${effect.milestoneId}。`);
      if (effect.policy && effect.policy !== 'none' && !policyIds.has(effect.policy)) errors.push(`${label} 引用不存在的政策 ${effect.policy}。`);
      if (effect.hiredIntern && !candidateIds.has(effect.hiredIntern)) errors.push(`${label} 引用不存在的候选人 ${effect.hiredIntern}。`);
    }
  };
  for (const row of data.scenarios) {
    const label = `${row.sourceSheet ?? 'scenarios'} 第 ${row.sourceRow ?? '?'} 行（${row.sourceCardId ?? row.cardId}）`;
    const tile = boardCards.find(t => t.cardId === row.cardId);
    if (!tile) errors.push(`${label}：卡号不属于棋盘。`);
    else if (row.chapter !== `Ch${tile.chapter}` || row.type !== (tile.kind === 'boss' ? 'boss' : 'scenario')) errors.push(`${label}：章节或卡片类型与棋盘不符。`);
    if (!Number.isInteger(row.option) || row.option < 1 || row.option > 4) errors.push(`${label}：选项编号必须为 1–4。`);
    if (!['female', 'male', 'both'].includes(row.pawn)) errors.push(`${label}：棋子类型无效。`);
    for (const key of ['title', 'scene', 'background', 'npc', 'optionText', 'sourceSheet', 'sourceCardId'] as const) if (!nonempty(row[key])) errors.push(`${label}：${key} 不能为空。`);
    const source = `${row.sourceSheet}:${row.sourceRow}:${row.condition}:${row.pawn}`;
    if (sources.has(source)) errors.push(`${label}：同一来源行重复导入。`);
    sources.add(source);
    condition(row.condition, label);
    condition(row.availableWhen, label);
    effects(row.effects, label);
    for (const pawn of PAWNS) {
      stats(row.deltas?.[pawn], `${label} ${pawn}`);
      if (row.pawn === 'both' || row.pawn === pawn) {
        if (!nonempty(row.results?.[pawn])) errors.push(`${label}：${pawn === 'female' ? '♀' : '♂'} 的结果文字不能为空。`);
        if (!(EXPRESSIONS as readonly string[]).includes(row.expressions?.[pawn])) errors.push(`${label}：${pawn === 'female' ? '♀' : '♂'} 的 NPC 表情无效。`);
      }
    }
  }

  // Check every authored visible branch, including locked options. A locked option still occupies its slot.
  for (const tile of boardCards) {
    const rows = data.scenarios.filter(r => r.cardId === tile.cardId);
    if (!rows.length) { errors.push(`${tile.cardId} 缺少全部选项。`); continue; }
    for (const pawn of PAWNS) for (const hasChild of [false, true]) for (const branch of ['A', 'B', 'C', 'D']) for (const policy of ['zero_tolerance', 'coordinator', 'transparent']) for (const previousFamilyMan of [false, true]) {
      if (tile.chapter >= 3 && branch === 'D') continue;
      const run = { character: { name: 'Validation', pawn }, choices: {}, activePolicies: [], round: 1,
        flags: { has_child: hasChild, c2_branch: branch, policy, previous_family_man: previousFamilyMan }, stats: { Creativity: 3, Communication: 3, Network: 2, Reputation: 2, Availability: 2, Energy: 7 } } as unknown as Run;
      let visible: ScenarioOption[];
      try {
        const eligible = rows.filter(r => (r.pawn === 'both' || r.pawn === pawn) && matchesCondition(r.condition, run));
        visible = [...new Set(eligible.map(r => r.option))].flatMap(number => {
          const candidates = eligible.filter(r => r.option === number);
          const conditional = candidates.filter(r => r.condition.trim() !== '');
          return conditional.length ? conditional : candidates;
        });
      }
      catch { continue; }
      const expected = tile.cardId === 'C1-B' || tile.cardId === 'C2-04' && branch === 'D' ? 1
        : tile.cardId === 'C2-03' || tile.cardId === 'C2-04' && pawn === 'female' ? 4 : 3;
      const ids = visible.map(r => r.option);
      if (ids.length !== expected || new Set(ids).size !== ids.length) errors.push(`${tile.cardId} / ${pawn} / has_child=${hasChild} / branch=${branch} / policy=${policy}：应有 ${expected} 个互不重复的选项。`);
      if (tile.cardId === 'C2-04' && branch === 'D' && visible.some(r => !r.automatic)) errors.push('C2-04D 应为自动终止路线。');
    }
  }
  for (const [collection, entries] of [['结局', data.endings], ['章节卡', data.milestones!]] as const) {
    const seen = new Set<string>();
    for (const ending of entries) {
      if (seen.has(ending.id)) errors.push(`${collection}编号重复：${ending.id}。`);
      seen.add(ending.id);
      for (const key of ['id', 'name', 'front', 'back'] as const) if (!nonempty(ending[key])) errors.push(`${collection} ${ending.id} 的 ${key} 不能为空。`);
      if (!['both', 'female', 'male'].includes(ending.pawn)) errors.push(`${collection} ${ending.id} 的棋子类型无效。`);
    }
  }
  for (let n = 2; n <= 14; n++) if (!endingIds.has(`E${String(n).padStart(2, '0')}`)) errors.push(`缺少正式结局 E${String(n).padStart(2, '0')}。`);
  for (let n = 1; n <= 4; n++) {
    const opening = data.chapters!.filter(c => c.chapter === n);
    if (opening.length !== 1 || !nonempty(opening[0].scene) || !nonempty(opening[0].guideAdvice)) errors.push(`Ch${n} 需要一段完整开场。`);
    else effects(opening[0].effects, `Ch${n} 开场`);
  }
  if (!data.epilogue || !nonempty(data.epilogue.front)) errors.push('缺少终章正文。');
  if (!data.copy || !nonempty(data.copy.title) || !nonempty(data.copy.companyName)) errors.push('缺少游戏和公司名称。');
  const descriptions = data.copy?.statDescriptions;
  if (descriptions !== undefined) {
    if (!isObject(descriptions)) errors.push('statDescriptions 应为对象。');
    else for (const [name, value] of Object.entries(descriptions)) if (!(STAT_NAMES as readonly string[]).includes(name) || !nonempty(value)) errors.push(`statDescriptions.${name} 无效。`);
  }
  return [...new Set(errors)];
}
