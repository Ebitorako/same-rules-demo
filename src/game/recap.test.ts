import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialStats } from '../config/rules';
import { BOARD } from './board';
import { ENDING_IDS } from './endings';
import { archiveEndingRecap, getCareerRecap, getEndingRecap } from './recap';
import { isValidState, loadState, saveState } from './persistence';
import { advance, chooseOption, createInitialState, startCareer } from './state';
import { STAT_NAMES, type AppState, type GameData, type Pawn, type Run, type ScenarioOption } from './types';

function fixture(): GameData {
  return {
    scenarios: BOARD.flatMap((tile) => tile.cardId ? [1, 2, 3].map((option): ScenarioOption => ({
      cardId: tile.cardId!, chapter: `Ch${tile.chapter}`, tile: tile.kind === 'boss' ? 'Boss' : '1',
      type: tile.kind === 'boss' ? 'boss' : 'scenario', title: `Original ${tile.cardId}`, scene: 'Fixture scene',
      background: 'Fixture background', npc: 'Colleague', condition: '', option, pawn: 'both',
      optionText: `Original option ${option}`, results: { female: 'F result', male: 'M result' },
      expressions: { female: 'neutral', male: 'neutral' }, deltas: { female: {}, male: {} }, reference: '', notes: '',
    })) : []),
    endings: ENDING_IDS.map((id) => ({ id, name: id, pawn: 'both', front: 'Ending', back: 'Theory', reference: '', triggerNote: '', nextRoundNote: '', artNote: '', notes: '' })),
    candidates: [
      { id: 'cand_a', name: 'Original Mei', pawn: 'female', blurb: 'Original A', stats: { Skill: 9 } },
      { id: 'cand_b', name: 'Original Tom', pawn: 'male', blurb: 'Original B', stats: { Skill: 2 } },
      { id: 'cand_c', name: 'Original Lin', pawn: 'female', blurb: 'Original C', stats: { Skill: 7 } },
    ],
    policies: [{ id: 'formal_recruitment', name: 'Original formal recruitment', benefit: 'Criteria', cost: 'Time', nextRoundEffect: 'Fit', mvp: true }],
    powerTokens: 1,
    copy: { title: 'Genderpoly', companyName: 'FreeDOM', subtitle: '', introduction: '', promotionTitle: '', promotionText: '',
      defaultNames: { female: 'Female player', male: 'Male player' }, defaultDirector: 'Director', gatekeeperReturning: '',
      gatekeeperFormal: '', gatekeeperUnchanged: '', placeholderNotice: '' },
  };
}

function start(data: GameData, pawn: Pawn = 'female'): AppState {
  return startCareer(createInitialState(), pawn, data);
}

function atCard(state: AppState, cardId: string, data: GameData): AppState {
  for (let step = 0; step < 100; step++) {
    if (state.run!.phase === 'card' && BOARD[state.run!.position].cardId === cardId) return state;
    state = state.run!.phase === 'card' ? chooseOption(state, 1, data) : advance(state, data);
  }
  throw new Error(`Unable to reach ${cardId}`);
}

function complete(state: AppState, data: GameData, choices: Record<string, number> = {}): AppState {
  for (let step = 0; step < 100; step++) {
    if (state.run!.phase === 'ending') return state;
    state = state.run!.phase === 'card' ? chooseOption(state, choices[BOARD[state.run!.position].cardId!] ?? 1, data) : advance(state, data);
  }
  throw new Error('Unable to complete career');
}

function row(data: GameData, cardId: string, option = 1): ScenarioOption {
  return data.scenarios.find((item) => item.cardId === cardId && item.option === option)!;
}

function legacyRun(run: Run): Run {
  const result = structuredClone(run);
  delete result.statHistory;
  return result;
}

function memoryStorage(): void {
  const items = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => { items.set(key, value); },
    removeItem: (key: string) => { items.delete(key); },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('recorded ending recap', () => {
  it('captures the same starting abilities and the different data-driven effects for each pawn', () => {
    const data = fixture();
    row(data, 'C1-01').deltas = { female: { Creativity: 2 }, male: { Creativity: -1 } };
    const female = chooseOption(atCard(start(data, 'female'), 'C1-01', data), 1, data);
    const male = chooseOption(atCard(start(data, 'male'), 'C1-01', data), 1, data);
    expect(female.run!.statHistory!.initialStats).toEqual(initialStats());
    expect(male.run!.statHistory!.initialStats).toEqual(initialStats());
    expect(female.run!.statHistory!.bounds).toEqual({ minimum: 0, maximum: 10 });
    expect(female.run!.statHistory!.steps[0]).toMatchObject({ before: { Creativity: 5 }, after: { Creativity: 7 }, requestedDelta: { Creativity: 2 }, actualDelta: { Creativity: 2 } });
    expect(male.run!.statHistory!.steps[0]).toMatchObject({ before: { Creativity: 5 }, after: { Creativity: 4 }, requestedDelta: { Creativity: -1 }, actualDelta: { Creativity: -1 } });
  });

  it('separates table deltas from actual changes at both limits and preserves explicit zero-change choices', () => {
    const data = fixture();
    row(data, 'C1-01').deltas.female = { Money: 20, Communication: -20 };
    row(data, 'C1-02').deltas.female = { Money: 3, Communication: -2 };
    const ending = complete(start(data), data);
    const report = getEndingRecap(ending.run!, data);
    expect(report.status).toBe('recorded');
    expect(report.steps[0]).toMatchObject({ before: { Money: 5, Communication: 5 }, after: { Money: 10, Communication: 0 },
      requestedDelta: { Money: 20, Communication: -20 }, actualDelta: { Money: 5, Communication: -5 } });
    expect(report.steps[1]).toMatchObject({ requestedDelta: { Money: 3, Communication: -2 }, actualDelta: { Money: 0, Communication: 0 } });
    expect(STAT_NAMES.every((name) => report.steps[2].requestedDelta![name] === 0 && report.steps[2].actualDelta![name] === 0)).toBe(true);
    expect(report.finalStats).toEqual(ending.run!.stats);
    expect(report.steps).toHaveLength(20);
  });

  it.each([['C1-B', 2, 'E03'], ['C2-B', 3, 'E04'], ['C3-B', 3, 'E01']])('includes the immediately failed %s choice in the ended career report', (cardId, option, endingId) => {
    const data = fixture();
    const ending = chooseOption(atCard(start(data), cardId, data), option, data);
    expect(ending.run!.phase).toBe('ending');
    expect(ending.run!.endingId).toBe(endingId);
    const report = getEndingRecap(ending.run!, data);
    expect(report.steps.at(-1)).toMatchObject({ cardId, choice: option, source: 'recorded' });
    expect(report.finalStats).toEqual(ending.run!.stats);
    expect(ending.lineage[0].recap).toEqual(report);
    expect(isValidState(ending)).toBe(true);
  });

  it('captures the burnout-causing delta before the normal result step ends the career', () => {
    const data = fixture();
    row(data, 'C1-01').deltas.female = { Energy: -20 };
    const result = chooseOption(atCard(start(data), 'C1-01', data), 1, data);
    expect(result.run!.phase).toBe('result');
    expect(result.run!.statHistory!.steps[0]).toMatchObject({ requestedDelta: { Energy: -20 }, actualDelta: { Energy: -5 }, after: { Energy: 0 } });
    const ending = advance(result, data);
    expect(ending.run!.endingId).toBe('E05');
    expect(ending.lineage[0].recap!.steps).toHaveLength(1);
    expect(ending.lineage[0].recap!.finalStats!.Energy).toBe(0);
  });

  it('keeps original scenario, selected candidate and policy names after content is edited', () => {
    const data = fixture();
    const ending = complete(start(data), data, { 'C4-01': 2 });
    const original = getEndingRecap(ending.run!, data);
    expect(original.steps.find((step) => step.cardId === 'C4-01')!.optionText).toContain('Original Tom');
    expect(original.steps.find((step) => step.cardId === 'C4-02')!.optionText).toContain('Original formal recruitment');
    data.scenarios.forEach((item) => { item.title = 'Rewritten scene'; item.optionText = 'Rewritten option'; item.deltas.female = { Money: 9 }; });
    data.candidates.forEach((candidate) => { candidate.name = 'New candidate'; });
    data.policies[0].name = 'New policy';
    expect(getEndingRecap(ending.run!, data)).toEqual(original);
    expect(getCareerRecap(ending.lineage[0])).toEqual(original);
  });

  it('serializes independent career reports and starts the next career with an empty fresh history', () => {
    memoryStorage();
    const data = fixture();
    row(data, 'C1-01').deltas.female = { Money: 2 };
    row(data, 'C1-01').deltas.male = { Money: -1 };
    const first = complete(start(data), data, { 'C4-01': 2 });
    const firstReport = structuredClone(first.lineage[0].recap);
    let next = startCareer(first, 'female', data);
    expect(next.run!.character.pawn).toBe('male');
    expect(next.run!.statHistory!.steps).toEqual([]);
    expect(next.run!.statHistory!.initialStats).toEqual(initialStats());
    next = complete(next, data);
    expect(next.lineage[0].recap).toEqual(firstReport);
    expect(next.lineage[1].recap).toMatchObject({ round: 2, character: { pawn: 'male' }, finalStats: { Money: 4 } });
    expect(next.lineage[0].recap).toMatchObject({ round: 1, character: { pawn: 'female' }, finalStats: { Money: 7 } });
    expect(saveState(next)).toBe(true);
    expect(loadState()).toEqual(next);
  });
});

describe('legacy and partial recap compatibility', () => {
  it('reconstructs an older completed run only when all choices resolve and all final stats agree', () => {
    const data = fixture();
    row(data, 'C1-01').deltas.female = { Money: 2 };
    const ending = complete(start(data), data);
    const run = legacyRun(ending.run!);
    const before = structuredClone(run);
    const report = getEndingRecap(run, data);
    expect(report.status).toBe('reconstructed');
    expect(report.issues).toContain('reconstructed-from-current-data');
    expect(report.steps).toHaveLength(20);
    expect(report.steps.every((step) => step.source === 'reconstructed')).toBe(true);
    expect(report.finalStats).toEqual(run.stats);
    expect(report.steps[0].actualDelta!.Money).toBe(2);
    expect(run).toEqual(before);
  });

  it.each(['changed', 'missing', 'ambiguous'] as const)('does not invent missing historical numbers when current content is %s', (change) => {
    const data = fixture();
    const run = legacyRun(complete(start(data), data).run!);
    if (change === 'changed') row(data, 'C1-01').deltas.female = { Money: 1 };
    if (change === 'missing') data.scenarios = data.scenarios.filter((item) => item.cardId !== 'C1-01');
    if (change === 'ambiguous') data.scenarios.push(structuredClone(row(data, 'C1-01')));
    const report = getEndingRecap(run, data);
    expect(report.status).toBe('unavailable');
    expect(report.finalStats).toEqual(run.stats);
    expect(report.steps).toHaveLength(20);
    expect(report.steps.every((step) => step.source === 'missing' && step.before === null && step.after === null && step.requestedDelta === null && step.actualDelta === null)).toBe(true);
    expect(report.issues).toContain(change === 'changed' ? 'final-stats-mismatch' : 'content-unavailable');
  });

  it('keeps the new recorded suffix when an old missing prefix cannot be reconstructed', () => {
    const data = fixture();
    let state = atCard(start(data), 'C1-03', data);
    state = { ...state, run: legacyRun(state.run!) };
    const ending = complete(state, data);
    expect(ending.run!.statHistory!.steps[0]).toMatchObject({ cardId: 'C1-03', order: 3 });
    const recorded = structuredClone(ending.run!.statHistory!.steps);
    row(data, 'C1-01').deltas.female = { Money: 2 };
    const report = getEndingRecap(ending.run!, data);
    expect(report.status).toBe('partial');
    expect(report.finalStats).toEqual(ending.run!.stats);
    expect(report.steps.slice(0, 2).every((step) => step.source === 'missing' && step.actualDelta === null)).toBe(true);
    expect(report.steps.slice(2).map(({ source: _source, ...step }) => step)).toEqual(recorded);
    expect(report.steps.slice(2).every((step) => step.source === 'recorded')).toBe(true);
  });

  it('treats an old lineage entry without a report as unknown rather than borrowing another career', () => {
    const data = fixture();
    const ending = complete(start(data), data);
    const old = structuredClone(ending.lineage[0]);
    delete old.recap;
    const report = getCareerRecap(old);
    expect(report).toMatchObject({ round: old.round, character: old.character, status: 'unavailable', finalStats: null });
    expect(report.steps).toEqual([]);
    expect(report.issues).toContain('legacy-career-no-stats');
  });

  it('archives only the matching completed current career and leaves earlier careers and active runs alone', () => {
    const data = fixture();
    const first = complete(start(data), data);
    const firstReport = structuredClone(first.lineage[0].recap);
    const active = startCareer(first, 'male', data);
    expect(archiveEndingRecap(active, data)).toBe(active);
    const second = complete(active, data);
    const legacy = structuredClone(second);
    legacy.run = legacyRun(legacy.run!);
    delete legacy.lineage[1].recap;
    const archived = archiveEndingRecap(legacy, data);
    expect(archived.lineage[0].recap).toEqual(firstReport);
    expect(archived.lineage[1].recap).toMatchObject({ round: 2, status: 'reconstructed', finalStats: legacy.run!.stats });
    expect(legacy.lineage[1].recap).toBeUndefined();
    expect(archived.run).toEqual(legacy.run);
  });

  it('rejects corrupt optional recap metadata while loading the otherwise intact career', () => {
    memoryStorage();
    const data = fixture();
    const ending = complete(start(data), data);
    const corrupt = structuredClone(ending);
    corrupt.run!.statHistory!.steps[0].actualDelta.Money = 99;
    corrupt.lineage[0].recap!.round = 999;
    expect(isValidState(corrupt)).toBe(false);
    expect(saveState(corrupt)).toBe(false);
    localStorage.setItem('sameRules.snapshot', JSON.stringify(corrupt));
    const loaded = loadState();
    expect(loaded.run).toMatchObject({ phase: 'ending', stats: ending.run!.stats, choices: ending.run!.choices });
    expect(loaded.lineage).toHaveLength(1);
    expect(loaded.gallery).toEqual(ending.gallery);
    expect(loaded.run!.statHistory).toBeUndefined();
    expect(loaded.lineage[0].recap).toBeUndefined();
  });
});
