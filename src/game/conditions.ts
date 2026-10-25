import type { Run } from './types';

export type ConditionClause =
  | { kind: 'choice'; cardId: string; option: number }
  | { kind: 'policy'; policyId: string }
  | { kind: 'round'; minimum: number };

export function parseCondition(text: string): ConditionClause[] {
  if (!text.trim()) return [];
  return text.split(';').map<ConditionClause>((part) => {
    const token = part.trim();
    const choice = /^(C[1-4]-(?:0[1-5]|B))\s*=\s*([1-3])$/.exec(token);
    if (choice) return { kind: 'choice', cardId: choice[1], option: Number(choice[2]) };
    const policy = /^policy:([a-z][a-z0-9_]*)$/.exec(token);
    if (policy) return { kind: 'policy', policyId: policy[1] };
    const round = /^round\s*>=\s*([1-9]\d*)$/.exec(token);
    if (round && Number.isSafeInteger(Number(round[1]))) return { kind: 'round', minimum: Number(round[1]) };
    throw new Error(`无法识别出现条件「${token}」。请使用 C1-02=2、policy:formal_recruitment 或 round>=2，以分号连接。`);
  });
}

export function matchesCondition(text: string, run: Pick<Run, 'choices' | 'activePolicies' | 'round'>): boolean {
  return parseCondition(text).every((clause) => {
    if (clause.kind === 'choice') return run.choices[clause.cardId] === clause.option;
    if (clause.kind === 'policy') return run.activePolicies.includes(clause.policyId);
    return run.round >= clause.minimum;
  });
}
