import { STAT_NAMES, type Pawn, type Run, type StatName } from './types';

export type ConditionClause =
  | { kind: 'choice'; cardId: string; option: number }
  | { kind: 'policy'; policyId: string; negate: boolean }
  | { kind: 'round'; minimum: number }
  | { kind: 'flag'; key: string; value: string | boolean; negate: boolean }
  | { kind: 'pawn'; pawn: Pawn }
  | { kind: 'stat'; stat: StatName; operator: '>=' | '>' | '<=' | '<' | '='; value: number };

export function parseCondition(text: string): ConditionClause[] {
  if (!text.trim()) return [];
  return text.split(';').map<ConditionClause>((part) => {
    const token = part.trim();
    const choice = /^(C[1-4]-(?:0[1-5]|B))\s*=\s*([1-4])$/.exec(token);
    if (choice) return { kind: 'choice', cardId: choice[1], option: Number(choice[2]) };
    const policy = /^(!?)policy:([a-z][a-z0-9_]*)$/.exec(token);
    if (policy) return { kind: 'policy', policyId: policy[2], negate: Boolean(policy[1]) };
    const round = /^round\s*>=\s*([1-9]\d*)$/.exec(token);
    if (round && Number.isSafeInteger(Number(round[1]))) return { kind: 'round', minimum: Number(round[1]) };
    const flag = /^(!?)flag:([a-z][a-z0-9_]*)=([a-zA-Z0-9_-]+)$/.exec(token);
    if (flag) return { kind: 'flag', key: flag[2], value: flag[3] === 'true' ? true : flag[3] === 'false' ? false : flag[3], negate: Boolean(flag[1]) };
    const pawn = /^pawn:(female|male)$/.exec(token);
    if (pawn) return { kind: 'pawn', pawn: pawn[1] as Pawn };
    const stat = /^stat:([A-Za-z]+)(>=|>|<=|<|=)(-?\d+(?:\.\d+)?)$/.exec(token);
    if (stat && STAT_NAMES.includes(stat[1] as StatName)) return { kind: 'stat', stat: stat[1] as StatName, operator: stat[2] as '>=' | '>' | '<=' | '<' | '=', value: Number(stat[3]) };
    throw new Error('无法识别出现条件「' + token + '」。请检查剧情条件。');
  });
}

type ConditionRun = Pick<Run, 'choices' | 'activePolicies' | 'round'> & Partial<Pick<Run, 'flags' | 'stats' | 'character'>>;
export function matchesCondition(text: string, run: ConditionRun): boolean {
  return parseCondition(text).every((clause) => {
    if (clause.kind === 'choice') return run.choices[clause.cardId] === clause.option;
    if (clause.kind === 'policy') return run.activePolicies.includes(clause.policyId) !== clause.negate;
    if (clause.kind === 'round') return run.round >= clause.minimum;
    if (clause.kind === 'pawn') return run.character?.pawn === clause.pawn;
    if (clause.kind === 'flag') return (run.flags?.[clause.key] === clause.value) !== clause.negate;
    const value = run.stats?.[clause.stat];
    if (value === undefined) return false;
    if (clause.operator === '>=') return value >= clause.value;
    if (clause.operator === '>') return value > clause.value;
    if (clause.operator === '<=') return value <= clause.value;
    if (clause.operator === '<') return value < clause.value;
    return value === clause.value;
  });
}
