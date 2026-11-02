import { describe, expect, it } from 'vitest';
import { BOARD } from './board';
import { advance, chooseOption } from './state';
import { fresh, loadTeamData, play } from './test-helpers';
import type { Pawn } from './types';

describe('source-rule reachability without numerical rebalancing', () => {
  it('enumerates all 162 first-chapter paths and exposes the authored unreachable rejection ending', () => {
    const data = loadTeamData();
    const counts: Record<Pawn, Record<string, number>> = { female: {}, male: {} };
    for (const pawn of ['female', 'male'] as const) {
      for (let code = 0; code < 81; code++) {
        let n = code;
        const choices = Array.from({ length: 4 }, () => { const choice = n % 3 + 1; n = Math.floor(n / 3); return choice; });
        let state = fresh(pawn, data);
        for (let step = 0; step < 30; step++) {
          const card = BOARD[state.run!.position].cardId;
          if (state.run!.phase === 'card') state = chooseOption(state, card === 'C1-B' ? 1 : choices[Number(card!.slice(-2)) - 1], data);
          else state = advance(state, data);
          if (state.run!.phase === 'ending' || state.run!.pendingMilestoneId === 'CH1-E01') break;
        }
        const outcome = state.run!.endingId ?? state.run!.pendingMilestoneId!;
        counts[pawn][outcome] = (counts[pawn][outcome] ?? 0) + 1;
      }
    }
    expect(Object.values(counts.female).reduce((a, b) => a + b, 0)).toBe(81);
    expect(Object.values(counts.male).reduce((a, b) => a + b, 0)).toBe(81);
    expect(counts.female.E03 ?? 0).toBe(0);
    expect(counts.male.E03 ?? 0).toBe(0);
    expect(counts.female['CH1-E01']).toBeGreaterThan(0);
    expect(counts.male['CH1-E01']).toBeGreaterThan(0);
  });

  it.each([
    ['female', { 'C1-02': 2, 'C1-04': 2 }, 'E02'],
    ['male', { 'C3-B': 3 }, 'E04'],
    ['male', { 'C3-02': 1, 'C3-03': 2, 'C3-04': 3, 'C3-05': 3 }, 'E05'],
    ['female', { 'C3-B': 2 }, 'E06'],
    ['female', { 'C3-B': 3 }, 'E07'],
    ['female', { 'C2-04': 4 }, 'E08'],
    ['female', { 'C2-B': 3 }, 'E09'],
    ['male', { 'C2-03': 4, 'C2-04': 1 }, 'E10'],
    ['female', { 'C2-02': 1, 'C2-03': 3, 'C2-04': 1, 'C3-03': 1, 'C3-04': 1 }, 'E11'],
    ['male', { 'C4-B': 3 }, 'E12'],
    ['female', { 'C4-B': 2 }, 'E13'],
    ['female', {}, 'E14'],
  ] as [Pawn, Record<string, number>, string][])('reaches %s route %j as %s with genuine choices', (pawn, changes, ending) => {
    const data = loadTeamData();
    expect(play(fresh(pawn, data), data, changes).run!.endingId).toBe(ending);
  });
});
