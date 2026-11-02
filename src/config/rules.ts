import type { Pawn, Stats, StatName } from '../game/types';

export interface BossCheck {
  stats: StatName[]; minimum: Record<Pawn, number>; optionModifiers: Record<number, number>;
}

export const CONTENT_VERSION = 'team-2026-11-03';

// Starting values and gates come from the team's chapter sheets. The existing
// 0–10 bounds remain until the writers specify a different scale.
export const RULES = {
  firstCareerPawn: 'choose' as 'choose' | 'random',
  stats: { initial: 5, minimum: 0, maximum: 10 },
  startingStats: { Creativity: 3, Communication: 3, Network: 2, Reputation: 2, Availability: 2, Energy: 7 } as Stats,
  burnoutAtZero: true,
  lowEnergyWarning: 1,
  powerTokens: 0,
  hiring: { cardId: 'C4-01', candidates: {} as Record<number, string> },
  policy: { cardId: 'C4-03', options: { 1: 'zero_tolerance', 2: 'coordinator', 3: 'transparent' } as Record<number, string>, formalRecruitment: 'transparent', tokenCost: 0 },
  gatekeeperFitPenalty: { female: 0, male: 0 } as Record<Pawn, number>,
  gates: { creativityEntry: 5, communicationEntry: 5, networkPromotion: 5, creativityPromotion: 6, idealAvailability: 3, transparentReputation: 5, coordinatorReputation: 4 },
  bosses: {} as Record<string, BossCheck[]>,
  endings: { coordinator: 'E02', gatekeeper: 'E03', family: 'E04', balanced: 'E05', idealWorker: 'E06', childfree: 'E07', resignation: 'E08', network: 'E09', official: 'E10', burnout: 'E11', completed: 'E12', limitedPolicy: 'E13', policy: 'E14' },
  animation: { hopMs: 450, flipHalfMs: 150, lightMs: 400, idleMs: 600 },
  storagePrefix: 'sameRules.',
} as const;

export function initialStats(): Stats { return { ...RULES.startingStats }; }
