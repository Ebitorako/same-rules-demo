import { RULES } from '../config/rules';
import { BOARD } from '../game/board';
import { parseCondition, type ConditionClause } from '../game/conditions';
import { ENDING_IDS } from '../game/endings';
import { STAT_NAMES, type GameData, type Pawn, type ScenarioOption } from '../game/types';
import { EXPRESSIONS } from './parse';

const PAWNS: Pawn[] = ['female', 'male'];
const COPY_FIELDS = ['title', 'companyName', 'subtitle', 'introduction', 'promotionTitle', 'promotionText', 'defaultDirector', 'gatekeeperReturning', 'gatekeeperFormal', 'gatekeeperUnchanged', 'placeholderNotice'] as const;
const COLUMN_NAMES: Record<string, string> = { chapter: '章节', tile: '格子', type: '类型', title: '场景标题', scene: '场景描述', background: '背景信息（游戏内可翻看）', npc: 'NPC', optionText: '选项文字', id: '编号', name: '结局名称', front: '结局文字（正面）', back: '背面：理论概念' };
const applies = (row: ScenarioOption, pawn: Pawn): boolean => row.pawn === 'both' || row.pawn === pawn;
const nonempty = (value: unknown): value is string => typeof value === 'string' && !!value.trim();

function conditionsOverlap(a: ConditionClause[], b: ConditionClause[]): boolean {
  const choices = new Map<string, number>();
  for (const clause of [...a, ...b]) {
    if (clause.kind !== 'choice') continue;
    const existing = choices.get(clause.cardId);
    if (existing !== undefined && existing !== clause.option) return false;
    choices.set(clause.cardId, clause.option);
  }
  // Positive policy flags and lower round bounds can all be true together.
  return true;
}

export function validateData(data: GameData): string[] {
  const issues: string[] = [];
  for (const key of ['scenarios', 'endings', 'candidates', 'policies'] as const) {
    if (!Array.isArray(data[key])) issues.push(`${key} 资料缺失或不是列表，请检查对应 CSV / JSON。`);
  }
  if (issues.length) return issues;
  const cardTiles = BOARD.filter((tile) => tile.cardId);
  const cardIds = cardTiles.map((tile) => tile.cardId!);
  const policyIds = new Set(data.policies.map((policy) => policy?.id));
  const groups = new Map<string, ScenarioOption[]>();
  const conditions = new Map<ScenarioOption, ConditionClause[]>();
  const variantFields = ['chapter', 'tile', 'type', 'title', 'scene', 'background', 'npc'] as const;

  data.scenarios.forEach((row, index) => {
    const label = `scenarios.csv 第 ${index + 2} 行（${row.cardId} 选项 ${row.option}）`;
    if (!cardIds.includes(row.cardId)) issues.push(`${label}：卡号不属于棋盘的 20 个位置。`);
    if (![1, 2, 3].includes(row.option)) issues.push(`${label}：选项编号只能是 1、2、3。`);
    if (!['both', 'female', 'male'].includes(row.pawn)) issues.push(`${label}：适用棋子无效。`);
    for (const field of ['title', 'scene', 'background', 'npc', 'optionText'] as const) {
      if (!nonempty(row[field])) issues.push(`${label}：“${COLUMN_NAMES[field]}”不能为空。`);
    }
    const tile = cardTiles.find((entry) => entry.cardId === row.cardId);
    if (tile) {
      if (row.chapter !== `Ch${tile.chapter}`) issues.push(`${label}：章节应为 Ch${tile.chapter}。`);
      if ((tile.kind === 'boss' ? 'boss' : 'scenario') !== row.type) issues.push(`${label}：类型与棋盘位置不一致。`);
      const expectedTile = tile.kind === 'boss' ? 'Boss' : String(Number(row.cardId.split('-')[1]));
      if (row.tile !== expectedTile) issues.push(`${label}：格子应为 ${expectedTile}。`);
    }
    for (const pawn of PAWNS) {
      if (applies(row, pawn)) {
        if (!nonempty(row.results[pawn])) issues.push(`${label}：${pawn === 'female' ? '♀' : '♂'} 的结果文字不能为空。`);
        if (!(EXPRESSIONS as readonly string[]).includes(row.expressions[pawn])) issues.push(`${label}：${pawn === 'female' ? '♀' : '♂'} 的 NPC 表情无效。可用 满意、中性、打量、皱眉、尴尬、冷淡。`);
      }
      for (const [stat, value] of Object.entries(row.deltas[pawn])) {
        if (!(STAT_NAMES as readonly string[]).includes(stat) || typeof value !== 'number' || !Number.isFinite(value)) issues.push(`${label}：${stat} 的数值变化无效。`);
      }
    }
    try {
      const clauses = parseCondition(row.condition);
      conditions.set(row, clauses);
      const seenChoices = new Map<string, number>();
      for (const clause of clauses) {
        if (clause.kind === 'choice') {
          if (!cardIds.includes(clause.cardId)) issues.push(`${label}：出现条件引用了不存在的卡号 ${clause.cardId}。`);
          else if (cardIds.indexOf(clause.cardId) >= cardIds.indexOf(row.cardId)) issues.push(`${label}：出现条件只能引用前面已经走过的卡，不能引用 ${clause.cardId}。`);
          const earlier = seenChoices.get(clause.cardId);
          if (earlier !== undefined && earlier !== clause.option) issues.push(`${label}：条件相互矛盾，同一卡不能同时选两个选项。`);
          seenChoices.set(clause.cardId, clause.option);
        }
        if (clause.kind === 'policy' && !policyIds.has(clause.policyId)) issues.push(`${label}：出现条件引用了不存在的政策 ${clause.policyId}。`);
      }
    } catch (error) {
      issues.push(`${label}：出现条件无效。${error instanceof Error ? error.message : String(error)}`);
    }
    const group = groups.get(row.cardId) ?? [];
    group.push(row);
    groups.set(row.cardId, group);
  });

  for (const id of cardIds) {
    const rows = groups.get(id) ?? [];
    if (!rows.length) { issues.push(`${id} 缺少全部 3 个选项。`); continue; }
    for (const pawn of PAWNS) {
      for (const option of [1, 2, 3]) {
        const matching = rows.filter((row) => applies(row, pawn) && row.option === option);
        const defaults = matching.filter((row) => !row.condition.trim());
        const label = `${id} / ${pawn === 'female' ? '♀' : '♂'} / 选项 ${option}`;
        if (defaults.length !== 1) issues.push(`${label}：需要且只能有一行无条件版本，现有 ${defaults.length} 行。`);
        const variants = matching.filter((row) => !!row.condition.trim());
        for (let i = 0; i < variants.length; i++) {
          for (let j = i + 1; j < variants.length; j++) {
            const left = conditions.get(variants[i]);
            const right = conditions.get(variants[j]);
            if (left && right && conditionsOverlap(left, right)) issues.push(`${label}：两行条件版本可能同时生效（${variants[i].condition} / ${variants[j].condition}），请使它们互斥。`);
          }
        }
      }
      const variants = new Map<string, ScenarioOption[]>();
      for (const row of rows.filter((entry) => applies(entry, pawn))) {
        const clauses = conditions.get(row);
        const key = clauses ? clauses.map((clause) => JSON.stringify(clause)).sort().join(';') : row.condition;
        const batch = variants.get(key) ?? [];
        batch.push(row);
        variants.set(key, batch);
      }
      for (const batch of variants.values()) {
        for (const field of variantFields) {
          if (new Set(batch.map((row) => row[field])).size > 1) issues.push(`${id} / ${pawn === 'female' ? '♀' : '♂'}：同一条件版本的“${COLUMN_NAMES[field]}”必须重复填写相同内容。`);
        }
      }
    }
  }

  const endingIds = new Set<string>();
  for (const ending of data.endings) {
    if (endingIds.has(ending.id)) issues.push(`endings.csv：结局编号 ${ending.id} 重复。`);
    endingIds.add(ending.id);
    for (const field of ['id', 'name', 'front', 'back'] as const) if (!nonempty(ending[field])) issues.push(`endings.csv ${ending.id}：“${COLUMN_NAMES[field]}”不能为空。`);
    if (!['both', 'female', 'male'].includes(ending.pawn)) issues.push(`endings.csv ${ending.id}：适用棋子无效。`);
  }
  for (const id of Object.values(ENDING_IDS)) if (!endingIds.has(id)) issues.push(`endings.csv 缺少游戏规则使用的结局 ${id}。`);
  const candidateIds = new Set<string>();
  for (const candidate of data.candidates) {
    if (!candidate || !nonempty(candidate.id)) { issues.push('candidates.json：候选人缺少 id。'); continue; }
    if (candidateIds.has(candidate.id)) issues.push(`candidates.json：候选人编号 ${candidate.id} 重复。`);
    candidateIds.add(candidate.id);
    if (!nonempty(candidate.name) || !nonempty(candidate.blurb) || !PAWNS.includes(candidate.pawn)) issues.push(`candidates.json ${candidate.id}：姓名、简介或棋子无效。`);
    if (!candidate.stats || typeof candidate.stats !== 'object') issues.push(`candidates.json ${candidate.id}：缺少 stats 展示资料。`);
    else for (const [stat, value] of Object.entries(candidate.stats)) if (!(STAT_NAMES as readonly string[]).includes(stat) || typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10) issues.push(`candidates.json ${candidate.id}：${stat} 应为 0–10 的数值。`);
  }
  if (!cardIds.includes(RULES.hiring.cardId)) issues.push(`聘用规则引用了不存在的卡 ${RULES.hiring.cardId}。`);
  for (const id of Object.values(RULES.hiring.candidates)) if (!candidateIds.has(id)) issues.push(`candidates.json 缺少聘用选项引用的 ${id}。`);
  if (!Number.isInteger(data.powerTokens) || data.powerTokens < 1) issues.push('policies.json：powerTokens 必须为正整数。');
  const seenPolicies = new Set<string>();
  for (const policy of data.policies) {
    if (!policy || !nonempty(policy.id)) { issues.push('policies.json：政策缺少 id。'); continue; }
    if (seenPolicies.has(policy.id)) issues.push(`policies.json：政策编号 ${policy.id} 重复。`);
    seenPolicies.add(policy.id);
    for (const field of ['name', 'benefit', 'cost', 'nextRoundEffect'] as const) if (!nonempty(policy[field])) issues.push(`policies.json ${policy.id}：${field} 不能为空。`);
    if (typeof policy.mvp !== 'boolean') issues.push(`policies.json ${policy.id}：mvp 必须为 true 或 false。`);
  }
  if (!cardIds.includes(RULES.policy.cardId)) issues.push(`政策规则引用了不存在的卡 ${RULES.policy.cardId}。`);
  for (const id of new Set([...Object.values(RULES.policy.options), RULES.policy.formalRecruitment])) if (!seenPolicies.has(id)) issues.push(`policies.json 缺少政策选项引用的 ${id}。`);
  if (!data.copy || typeof data.copy !== 'object') issues.push('copy.json 缺失。');
  else {
    for (const field of COPY_FIELDS) if (!nonempty(data.copy[field])) issues.push(`copy.json：${field} 不能为空。`);
    for (const pawn of PAWNS) if (!nonempty(data.copy.defaultNames?.[pawn])) issues.push(`copy.json：defaultNames.${pawn} 不能为空。`);
    const descriptions = data.copy.statDescriptions;
    if (descriptions !== undefined) {
      if (!descriptions || typeof descriptions !== 'object' || Array.isArray(descriptions)) issues.push('copy.json：statDescriptions 应为能力名称与说明组成的对象。');
      else for (const [stat, description] of Object.entries(descriptions)) {
        if (!(STAT_NAMES as readonly string[]).includes(stat) || !nonempty(description)) issues.push(`copy.json：statDescriptions.${stat} 的能力名称或说明无效。`);
      }
    }
  }
  return [...new Set(issues)];
}

export function getDataWarnings(data: GameData): string[] {
  const cards = new Set(data.scenarios.filter((row) => /PLACEHOLDER/i.test(`${row.scene} ${row.notes}`)).map((row) => row.cardId));
  const endings = data.endings.filter((ending) => /PLACEHOLDER/i.test(`${ending.front} ${ending.notes}`));
  const warnings: string[] = [];
  if (cards.size) warnings.push(`${cards.size} 张卡仍为 PLACEHOLDER 占位剧情，需要组员替换。`);
  if (endings.length) warnings.push(`${endings.length} 个结局仍为 PLACEHOLDER 占位文字，需要组员替换。`);
  warnings.push('候选人、政策和数值目前为原始示例；通过检查仅代表格式正确，不代表内容已经定稿。');
  return warnings;
}
