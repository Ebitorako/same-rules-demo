import { RULES } from '../config/rules';
import type { Run } from './types';

export function passesBoss(run: Run, cardId: string, option: number): boolean {
  const checks = RULES.bosses[cardId];
  if (!checks) return false;
  const fitPenalty = cardId === 'C1-B' && !run.activePolicies.includes(RULES.policy.formalRecruitment)
    ? RULES.gatekeeperFitPenalty[run.character.pawn] : 0;
  return checks.every((check) => {
    const score = check.stats.reduce((total, stat) => total + run.stats[stat], 0)
      + (check.optionModifiers[option] ?? 0) - fitPenalty;
    return score >= check.minimum[run.character.pawn];
  });
}
