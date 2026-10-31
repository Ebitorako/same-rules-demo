import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseEndings, parseScenarios } from '../data/parse';
import { BOARD } from './board';
import { getChoiceHistory } from './history';
import { advance, chooseOption, createInitialState, startCareer } from './state';
import type { AppState, GameData, Pawn, Run } from './types';

function dataFixture(): GameData {
  const read = (file: string) => readFileSync(resolve('public/data', file), 'utf8');
  const policies = JSON.parse(read('policies.json'));
  return {
    scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')),
    candidates: JSON.parse(read('candidates.json')).candidates, policies: policies.policies,
    powerTokens: policies.powerTokens, copy: JSON.parse(read('copy.json')),
  };
}

function finish(data: GameData): AppState {
  let state = startCareer(createInitialState(), 'female', data);
  for (let step = 0; step < 100; step++) {
    if (state.run!.phase === 'ending') return state;
    state = state.run!.phase === 'card' ? chooseOption(state, 1, data) : advance(state, data);
  }
  throw new Error('The test career did not finish.');
}

function partialRun(data: GameData, pawn: Pawn = 'female'): Run {
  return {
    ...startCareer(createInitialState(), pawn, data).run!, round: 2, phase: 'board',
    position: 3, visited: [0, 1, 2, 3], activePolicies: ['formal_recruitment'],
    choices: { 'C1-01': 2, 'C1-02': 2, 'C1-03': 3 },
  };
}

function withVariants(data: GameData): GameData {
  const base = data.scenarios.find((row) => row.cardId === 'C1-02' && row.option === 2)!;
  const others = data.scenarios.filter((row) => !(row.cardId === base.cardId && row.option === base.option));
  return { ...data, scenarios: [...others,
    ...(['female', 'male'] as const).flatMap((pawn) => [
      { ...base, pawn, optionText: `${pawn} fallback` },
      { ...base, pawn, condition: 'C1-01=2;policy:formal_recruitment;round>=2',
        optionText: `${pawn} historical option`, results: { ...base.results, [pawn]: `${pawn} historical result` } },
      { ...base, pawn, condition: 'C1-03=3', optionText: 'Later choice must not rewrite history' },
      { ...base, pawn, condition: 'C1-02=2', optionText: 'The choice itself must not rewrite history' },
    ]),
  ] };
}

function freezeDeep(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  Object.values(value).forEach(freezeDeep);
  Object.freeze(value);
}

describe('read-only choice history', () => {
  it.each(['female', 'male'] as const)('resolves the exact %s option using only conditions available before that choice', (pawn) => {
    const data = withVariants(dataFixture());
    const run = partialRun(data, pawn);
    const entry = getChoiceHistory(run, data)[1];
    expect(entry).toMatchObject({ cardId: 'C1-02', order: 2, choice: 2 });
    expect(entry.scenario?.optionText).toBe(`${pawn} historical option`);
    expect(entry.scenario?.results[pawn]).toBe(`${pawn} historical result`);
    const changedLater = { ...run, choices: { ...run.choices, 'C1-03': 1 } };
    expect(getChoiceHistory(changedLater, data)[1].scenario).toBe(entry.scenario);
  });

  it('uses active policies and the career round, without treating newly adopted policies as already active', () => {
    const data = withVariants(dataFixture());
    const run = partialRun(data);
    const newPolicy = { ...run, activePolicies: [], policiesSet: ['formal_recruitment'] };
    expect(getChoiceHistory(newPolicy, data)[1].scenario?.optionText).toBe('female fallback');
    expect(getChoiceHistory({ ...run, round: 1 }, data)[1].scenario?.optionText).toBe('female fallback');
  });

  it('returns all 20 recorded choices in board order, including entries older than the last eight', () => {
    const data = dataFixture();
    const state = finish(data);
    const run = { ...state.run!, choices: Object.fromEntries(Object.entries(state.run!.choices).reverse()) };
    const history = getChoiceHistory(run, data);
    expect(history).toHaveLength(20);
    expect(history.map((entry) => entry.cardId)).toEqual(BOARD.flatMap((tile) => tile.cardId ? [tile.cardId] : []));
    expect(history.map((entry) => entry.order)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    expect(history.every((entry) => entry.scenario?.option === entry.choice)).toBe(true);
    expect(history[0].cardId).toBe('C1-01');
    expect(history.at(-1)?.cardId).toBe('C4-B');
  });

  it('excludes every card that has not yet been chosen, including the currently open card', () => {
    const data = dataFixture();
    const start = startCareer(createInitialState(), 'female', data);
    expect(getChoiceHistory(start.run!, data)).toEqual([]);
    let state = advance(advance(start, data), data);
    state = chooseOption(state, 1, data);
    state = advance(advance(state, data), data);
    expect(state.run).toMatchObject({ phase: 'card', position: 2 });
    expect(getChoiceHistory(state.run!, data).map((entry) => entry.cardId)).toEqual(['C1-01']);
  });

  it('retains the recorded choice when its content is missing, ambiguous or invalid', () => {
    const data = withVariants(dataFixture());
    const run = partialRun(data);
    const missing = { ...data, scenarios: data.scenarios.filter((row) => row.cardId !== 'C1-02') };
    expect(getChoiceHistory(run, missing)[1]).toEqual({ cardId: 'C1-02', order: 2, choice: 2, scenario: null });
    const variant = data.scenarios.find((row) => row.optionText === 'female historical option')!;
    const ambiguous = { ...data, scenarios: [...data.scenarios, { ...variant, condition: 'round>=2' }] };
    expect(getChoiceHistory(run, ambiguous)[1].scenario).toBeNull();
    const invalid = { ...data, scenarios: [...data.scenarios, { ...variant, condition: 'round>2' }] };
    expect(getChoiceHistory(run, invalid)[1].scenario).toBeNull();
    expect(getChoiceHistory(run, invalid)[0].scenario).not.toBeNull();
  });

  it('preserves the Chapter 4 promotion gate when resolving historical content', () => {
    const data = dataFixture();
    const state = finish(data);
    const unpromoted = { ...state.run!, reachedDirector: false };
    const fourthChapter = getChoiceHistory(unpromoted, data).filter((entry) => entry.cardId.startsWith('C4-'));
    expect(fourthChapter).toHaveLength(4);
    expect(fourthChapter.every((entry) => entry.scenario === null)).toBe(true);
  });

  it('never replays effects or mutates state, choices, stats, career progress or authored content', () => {
    const data = dataFixture();
    const state = finish(data);
    const beforeState = structuredClone(state);
    const beforeData = structuredClone(data);
    freezeDeep(state);
    freezeDeep(data);
    const first = getChoiceHistory(state.run!, data);
    const second = getChoiceHistory(state.run!, data);
    expect(first).toEqual(second);
    expect(state).toEqual(beforeState);
    expect(data).toEqual(beforeData);
  });
});
