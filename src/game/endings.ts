import { RULES } from '../config/rules';
import type { Run } from './types';

export const ENDING_IDS: string[] = [...new Set(Object.values(RULES.endings))];

// Burnout takes precedence over every route-specific or policy ending.
export function selectEnding(run: Run): string {
  if (run.exitReason === 'burnout' || run.stats.Energy <= 0) return RULES.endings.burnout;
  if (run.endingId && ENDING_IDS.includes(run.endingId)) return run.endingId;
  if (run.exitReason && ENDING_IDS.includes(run.exitReason)) return run.exitReason;
  if (run.policiesSet.includes('transparent')) return RULES.endings.policy;
  if (run.policiesSet.includes('coordinator')) return RULES.endings.limitedPolicy;
  return RULES.endings.completed;
}
