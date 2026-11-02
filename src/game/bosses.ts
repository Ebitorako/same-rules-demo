import { RULES } from '../config/rules';
import type { Run } from './types';

// Kept as a pure rule query for diagnostics. Play uses each authored option's
// availability condition before applying its delta.
export function passesBoss(run: Run, cardId: string, option: number): boolean {
  if (cardId === 'C1-B') return option === 1 && run.stats.Creativity >= RULES.gates.creativityEntry;
  if (cardId === 'C2-B') {
    if (option === 1) return run.stats.Network >= RULES.gates.networkPromotion;
    if (option === 2) return run.stats.Creativity >= RULES.gates.creativityPromotion;
    return option === 3 && run.character.pawn === 'male';
  }
  if (cardId === 'C3-B') return option === 1 && run.stats.Availability >= RULES.gates.idealAvailability;
  if (cardId !== 'C4-B') return false;
  const policy = run.flags?.policy;
  if (option === 3) return true;
  if (option === 1 && policy === 'transparent') return run.stats.Reputation > RULES.gates.transparentReputation;
  if (option === 1 && policy === 'coordinator') return run.stats.Reputation > RULES.gates.coordinatorReputation;
  if (option === 2 && policy === 'zero_tolerance') return run.stats.Reputation > RULES.gates.transparentReputation;
  return option === 1 || option === 2;
}
