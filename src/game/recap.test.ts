import { describe, expect, it } from 'vitest';
import { initialStats } from '../config/rules';
import { archiveEndingRecap, getCareerRecap, getEndingRecap, hasConsistentStatHistory, isEndingRecap } from './recap';
import { chooseOption, startCareer } from './state';
import { atCard, fresh, loadTeamData, play } from './test-helpers';

describe('six-stat reports and recorded automatic events', () => {
  it.each(['female', 'male'] as const)('preserves the %s forced-exit result in its ending and archived recap', (pawn) => {
    const data = loadTeamData();
    const finished = play(fresh(pawn, data), data, { 'C2-03': 4, 'C2-04': 1 });
    const result = finished.run!.result!.text;
    const authored = data.scenarios.find((row) => row.sourceCardId === 'C2-04D' && row.pawn === pawn)!;
    expect(finished.run!.endingId).toBe('E10');
    expect(result).toBe(authored.results[pawn]);
    expect(finished.run!.statHistory!.steps.at(-1)!.resultText).toBe(result);
    expect(finished.run!.statHistory!.steps.at(-1)!.optionText).toBe('Continue');
    expect(finished.run!.chosenScenarios!['C2-04'].optionText).toBe(authored.optionText);
    expect(getEndingRecap(finished.run!, data).steps.at(-1)!.resultText).toBe(result);
    expect(getCareerRecap(finished.lineage[0]).steps.at(-1)!.resultText).toBe(result);
    authored.results[pawn] = 'A later edit';
    expect(getCareerRecap(finished.lineage[0]).steps.at(-1)!.resultText).toBe(result);
  });

  it('accepts older snapshots without result text and does not invent result text for system events', () => {
    const finished = play(fresh(), loadTeamData());
    expect(finished.lineage[0].recap!.steps.find((step) => step.kind === 'system')!.resultText).toBeUndefined();
    const older = structuredClone(finished.lineage[0].recap!);
    older.steps.forEach((step) => { delete step.resultText; });
    expect(isEndingRecap(older)).toBe(true);
    expect(getCareerRecap({ ...finished.lineage[0], recap: older })).toEqual(older);
    (older.steps[0] as unknown as { resultText: unknown }).resultText = 123;
    expect(isEndingRecap(older)).toBe(false);
  });

  it.each(['female', 'male'] as const)('archives a complete %s career and reconciles every delta with the actual final values', (pawn) => {
    const data = loadTeamData();
    const finished = play(fresh(pawn), data);
    const report = getEndingRecap(finished.run!, data);
    expect(report.status).toBe('recorded');
    expect(isEndingRecap(report)).toBe(true);
    expect(report.initialStats).toEqual(initialStats());
    expect(report.finalStats).toEqual(finished.run!.stats);
    expect(Object.keys(report.finalStats!)).toHaveLength(6);
    expect(report.steps.filter((step) => step.kind !== 'system')).toHaveLength(20);
    expect(report.steps.filter((step) => step.kind === 'system')).toHaveLength(pawn === 'female' ? 1 : 0);
    expect(getCareerRecap(finished.lineage[0])).toEqual(report);
    expect(archiveEndingRecap(finished, data)).toBe(finished);
  });

  it('distinguishes requested and actual effects at both bounds, including zero-delta choices', () => {
    const data = loadTeamData();
    const card = atCard('C1-01');
    const option = data.scenarios.find((row) => row.cardId === 'C1-01' && row.option === 1)!;
    option.deltas.female = { Reputation: 20, Network: -20 };
    const chosen = chooseOption(card, 1, data);
    expect(chosen.run!.statHistory!.steps[0]).toMatchObject({
      before: { Reputation: 2, Network: 2 }, after: { Reputation: 10, Network: 0 },
      requestedDelta: { Reputation: 20, Network: -20 }, actualDelta: { Reputation: 8, Network: -2 },
    });
    expect(hasConsistentStatHistory(chosen.run!)).toBe(true);
    const zero = chooseOption(atCard('C3-02'), 2, loadTeamData());
    expect(Object.values(zero.run!.statHistory!.steps.at(-1)!.actualDelta).every((value) => value === 0)).toBe(true);
  });

  it('includes the automatic Availability deduction in chronological order without attributing it to the player', () => {
    const data = loadTeamData();
    const finished = play(fresh(), data);
    const report = getEndingRecap(finished.run!, data);
    const index = report.steps.findIndex((step) => step.kind === 'system');
    expect(report.steps[index]).toMatchObject({ cardId: 'C3-00', choice: 0, requestedDelta: { Availability: -1 }, actualDelta: { Availability: -1 } });
    expect(report.steps[index - 1].cardId).toBe('C2-B');
    expect(report.steps[index + 1].cardId).toBe('C3-01');
  });

  it('saves the terminal decision and per-career reports independently', () => {
    const data = loadTeamData();
    const first = play(fresh('male'), data);
    const frozen = structuredClone(first.lineage[0].recap);
    const next = startCareer(first, 'female', data);
    const second = play(next, data, { 'C1-02': 3, 'C1-04': 3 });
    expect(second.run!.endingId).toBe('E03');
    expect(second.lineage).toHaveLength(2);
    expect(second.lineage[0].recap).toEqual(frozen);
    expect(second.lineage[1].recap!.steps.at(-1)!.cardId).toBe('C1-B');
    data.scenarios.forEach((row) => { row.optionText = 'Rewritten'; });
    expect(getCareerRecap(second.lineage[0])).toEqual(frozen);
  });

  it('never fabricates numbers for a legacy career without a saved report', () => {
    const career = { round: 1, character: { name: 'Alex', pawn: 'male' as const }, endingId: 'E02',
      reachedDirector: false, policiesSet: [], hiredIntern: null };
    expect(getCareerRecap(career)).toMatchObject({ initialStats: null, finalStats: null, status: 'unavailable', steps: [] });
  });

  it('detects tampered numerical event snapshots', () => {
    const finished = play(fresh(), loadTeamData());
    const report = structuredClone(finished.lineage[0].recap!);
    report.steps[0].actualDelta!.Reputation = 900;
    expect(isEndingRecap(report)).toBe(false);
    finished.run!.statHistory!.steps[0].after.Reputation = 900;
    expect(hasConsistentStatHistory(finished.run!)).toBe(false);
  });
});
