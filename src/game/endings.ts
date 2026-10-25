import { RULES } from '../config/rules';
import type { Run } from './types';

export const ENDING_IDS: string[] = Object.values(RULES.endings);

// Order is intentional: an exit takes precedence over any policy adopted earlier.
const endingRules: { matches: (run: Run) => boolean; id: string }[] = [
  { matches: (run) => run.exitReason === 'burnout', id: RULES.endings.burnout },
  { matches: (run) => run.exitReason === 'C1-B', id: RULES.endings.gatekeeper },
  { matches: (run) => run.exitReason === 'C2-B', id: RULES.endings.network },
  { matches: (run) => run.exitReason === 'C3-B', id: RULES.endings.idealWorker },
  { matches: (run) => run.policiesSet.includes(RULES.policy.formalRecruitment), id: RULES.endings.policy },
  { matches: () => true, id: RULES.endings.completed },
];

export function selectEnding(run: Run): string {
  return endingRules.find((rule) => rule.matches(run))!.id;
}
