import { STAT_NAMES, type Pawn, type Stats, type StatName } from '../game/types';

export interface BossCheck {
  stats: StatName[];
  minimum: Record<Pawn, number>;
  optionModifiers: Record<number, number>;
}

// These are prototype balancing values, kept together for the team's rules pass.
export const RULES = {
  firstCareerPawn: 'choose' as 'choose' | 'random',
  bossFailure: 'exit' as 'exit' | 'continue',
  stats: { initial: 5, minimum: 0, maximum: 10 },
  burnoutAtZero: true,
  powerTokens: 1,
  hiring: { cardId: 'C4-01', candidates: { 1: 'cand_a', 2: 'cand_b', 3: 'cand_c' } as Record<number, string> },
  policy: { cardId: 'C4-02', options: { 1: 'formal_recruitment' } as Record<number, string>, formalRecruitment: 'formal_recruitment', tokenCost: 1 },
  gatekeeperFitPenalty: { female: 2, male: 0 } as Record<Pawn, number>,
  bosses: {
    'C1-B': [{ stats: ['Skill', 'Reputation'], minimum: { female: 9, male: 9 }, optionModifiers: { 1: 2, 2: 0, 3: 1 } }],
    'C2-B': [
      { stats: ['Skill'], minimum: { female: 5, male: 5 }, optionModifiers: { 1: 1, 2: 0, 3: 1 } },
      { stats: ['Network'], minimum: { female: 6, male: 5 }, optionModifiers: { 1: 1, 2: 2, 3: 0 } },
    ],
    'C3-B': [
      { stats: ['Energy'], minimum: { female: 4, male: 4 }, optionModifiers: { 1: 0, 2: 1, 3: 0 } },
      { stats: ['Availability'], minimum: { female: 6, male: 5 }, optionModifiers: { 1: 1, 2: -1, 3: 0 } },
    ],
    'C4-B': [],
  } as Record<string, BossCheck[]>,
  endings: { idealWorker: 'E01', completed: 'E02', gatekeeper: 'E03', network: 'E04', burnout: 'E05', policy: 'E06' },
  litTileColors: ['#B9705F', '#CBAA5A', '#6F8DA6'],
  animation: { hopMs: 450, flipHalfMs: 150, lightMs: 400, idleMs: 600 },
  storagePrefix: 'sameRules.',
} as const;

export function initialStats(): Stats {
  return Object.fromEntries(STAT_NAMES.map((name) => [name, RULES.stats.initial])) as Stats;
}
