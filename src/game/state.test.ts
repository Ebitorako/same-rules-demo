import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialStats, RULES } from '../config/rules';
import { BOARD } from './board';
import { passesBoss } from './bosses';
import { matchesCondition, parseCondition } from './conditions';
import { ENDING_IDS } from './endings';
import { isValidState, loadState, resetStorage, saveState } from './persistence';
import { advance, chooseOption, createInitialState, getOptions, startCareer, updateSettings } from './state';
import type { AppState, GameData, ScenarioOption } from './types';

function fixture(): GameData {
  return {
    scenarios: BOARD.flatMap((tile) => !tile.cardId ? [] : [1, 2, 3].map((option): ScenarioOption => ({
      cardId: tile.cardId!, chapter: `Ch${tile.chapter}`, tile: tile.kind === 'boss' ? 'Boss' : '1',
      type: tile.kind === 'boss' ? 'boss' : 'scenario', title: 'Test title', scene: 'Test scene',
      background: 'Test theory', npc: 'colleague', condition: '', option, pawn: 'both',
      optionText: `Test option ${option}`, results: { female: 'Her result', male: 'His result' },
      expressions: { female: 'neutral', male: 'pleased' }, deltas: { female: {}, male: {} }, reference: '', notes: '',
    }))),
    endings: ENDING_IDS.map((id) => ({ id, name: id, pawn: 'both', front: 'Test ending', back: 'Test theory', reference: '', triggerNote: '', nextRoundNote: '', artNote: '', notes: '' })),
    candidates: [
      { id: 'cand_a', name: 'Mei', pawn: 'female', blurb: 'A', stats: { Skill: 9, Creativity: 8 } },
      { id: 'cand_b', name: 'Tom', pawn: 'male', blurb: 'B', stats: { Skill: 2 } },
      { id: 'cand_c', name: 'Lin', pawn: 'female', blurb: 'C', stats: { Skill: 7 } },
    ],
    policies: [{ id: 'formal_recruitment', name: 'Formal recruitment', benefit: 'Written criteria', cost: 'Hiring takes longer.', nextRoundEffect: 'Removes fit', mvp: true }],
    powerTokens: 1,
    copy: { title: 'Same Rules?', subtitle: '', introduction: '', promotionTitle: '', promotionText: '',
      defaultNames: { female: 'Alex F', male: 'Alex M' }, defaultDirector: 'Director', gatekeeperReturning: '',
      gatekeeperFormal: '', gatekeeperUnchanged: '', placeholderNotice: '' },
  };
}

function atCard(state: AppState, target: string, data: GameData): AppState {
  for (let step = 0; step < 100; step++) {
    if (state.run?.phase === 'card' && BOARD[state.run.position].cardId === target) return state;
    state = state.run?.phase === 'card' ? chooseOption(state, 1, data) : advance(state, data);
  }
  throw new Error(`Did not reach ${target}`);
}

function complete(state: AppState, data: GameData, options: Record<string, number> = {}): AppState {
  for (let step = 0; step < 100; step++) {
    if (state.run?.phase === 'ending') return state;
    state = state.run?.phase === 'card'
      ? chooseOption(state, options[BOARD[state.run.position].cardId!] ?? 1, data) : advance(state, data);
  }
  throw new Error('Career did not finish');
}

function memoryStorage() {
  const records = new Map<string, string>();
  const storage = { getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => { records.set(key, value); },
    removeItem: (key: string) => { records.delete(key); }, clear: () => records.clear(),
    key: (index: number) => [...records.keys()][index] ?? null, get length() { return records.size; } };
  vi.stubGlobal('localStorage', storage);
  return storage;
}

afterEach(() => vi.unstubAllGlobals());

describe('career structure and loop', () => {
  it('has the exact 22-cell ring and 20 unique cards', () => {
    expect(BOARD).toHaveLength(22);
    expect(BOARD.filter((tile) => tile.cardId)).toHaveLength(20);
    expect(new Set(BOARD.map((tile) => `${tile.row},${tile.col}`)).size).toBe(22);
    expect(BOARD[0]).toMatchObject({ id: 'b0', row: 6, col: 2 });
    expect(BOARD[17]).toMatchObject({ id: 'l0', row: 2, col: 1, kind: 'director' });
    expect(BOARD.filter((tile) => tile.kind === 'boss').map((tile) => [tile.row, tile.col])).toEqual([[6, 7], [1, 7], [1, 1], [6, 1]]);
  });

  it('starts both pawns equally and never uses candidate descriptive stats as starting ability', () => {
    const data = fixture();
    const female = startCareer(createInitialState(), 'female', data);
    const male = startCareer(createInitialState(), 'male', data);
    expect(female.run!.stats).toEqual(male.run!.stats);
    expect(female.run!.stats).toEqual(initialStats());
    const ending = complete(male, data);
    const next = startCareer(ending, 'male', data);
    expect(next.run!.character).toEqual({ name: 'Mei', pawn: 'female' });
    expect(next.run!.stats).toEqual(initialStats());
    expect(next.run!.stats.Skill).not.toBe(data.candidates[0].stats.Skill);
  });

  it('completes 20 cards, records one ending, and makes the previous director the next Gatekeeper', () => {
    const data = fixture();
    const initial = startCareer(createInitialState(), 'female', data);
    const ending = complete(initial, data, { 'C4-01': 2 });
    expect(ending.run).toMatchObject({ phase: 'ending', position: 0, reachedDirector: true, endingId: 'E06', hiredIntern: 'cand_b', policiesSet: ['formal_recruitment'] });
    expect(Object.keys(ending.run!.choices)).toHaveLength(20);
    expect(ending.run!.visited).toHaveLength(22);
    expect(ending.lineage).toHaveLength(1);
    expect(ending.gallery).toEqual([{ endingId: 'E06', pawn: 'female', round: 1, name: 'Alex F' }]);
    expect(advance(ending, data)).toBe(ending);
    const next = startCareer(ending, 'female', data);
    expect(next.run).toMatchObject({ round: 2, character: { name: 'Tom', pawn: 'male' },
      gatekeeper: { name: 'Alex F', pawn: 'female' }, activePolicies: ['formal_recruitment'] });
    expect(initial.run!.choices).toEqual({});
  });

  it('records completion without a policy and allows no restart or duplicate action mid-career', () => {
    const data = fixture();
    const start = startCareer(createInitialState(), 'male', data);
    expect(startCareer(start, 'female', data)).toBe(start);
    expect(chooseOption(start, 1, data)).toBe(start);
    const card = atCard(start, 'C1-01', data);
    expect(advance(card, data)).toBe(card);
    expect(chooseOption(card, 4, data)).toBe(card);
    const result = chooseOption(card, 1, data);
    expect(chooseOption(result, 2, data)).toBe(result);
    const ending = complete(result, data, { 'C4-02': 2 });
    expect(ending.run!.endingId).toBe('E02');
    expect(ending.run!.policiesSet).toEqual([]);
  });
});

describe('conditional content and per-pawn effects', () => {
  it('parses AND clauses, matches history and policies, and rejects unsupported syntax', () => {
    const context = { choices: { 'C1-02': 2 }, activePolicies: ['formal_recruitment'], round: 2 };
    expect(parseCondition('')).toEqual([]);
    expect(matchesCondition('C1-02=2; policy:formal_recruitment; round>=2', context)).toBe(true);
    expect(matchesCondition('C1-02=1;round>=2', context)).toBe(false);
    expect(matchesCondition('policy:flexible_working', context)).toBe(false);
    expect(matchesCondition('round>=3', context)).toBe(false);
    for (const invalid of ['C1-02=4', 'round>2', 'round>=0', 'unknown', 'round>=2;']) {
      expect(() => parseCondition(invalid)).toThrow();
    }
  });

  it('selects a matching conditional variant over its fallback and refuses ambiguous variants', () => {
    const data = fixture();
    const fallback = data.scenarios.find((row) => row.cardId === 'C1-02' && row.option === 1)!;
    data.scenarios.push({ ...fallback, condition: 'C1-01=1', optionText: 'Conditional option' });
    const state = atCard(startCareer(createInitialState(), 'female', data), 'C1-02', data);
    expect(getOptions(state.run!, data)).toHaveLength(3);
    expect(getOptions(state.run!, data)[0].optionText).toBe('Conditional option');
    expect(getOptions({ ...state.run!, choices: { 'C1-01': 2 } }, data)[0]).toBe(fallback);
    data.scenarios.push({ ...fallback, condition: 'round>=1', optionText: 'Ambiguous option' });
    expect(getOptions(state.run!, data)).toHaveLength(2);
    expect(chooseOption(state, 1, data)).toBe(state);
  });

  it('applies data-driven results, expressions and bounded stat changes', () => {
    const data = fixture();
    const row = data.scenarios[0];
    row.deltas = { female: { Skill: 20, Money: -20 }, male: { Skill: -1 } };
    const female = chooseOption(atCard(startCareer(createInitialState(), 'female', data), 'C1-01', data), 1, data);
    const male = chooseOption(atCard(startCareer(createInitialState(), 'male', data), 'C1-01', data), 1, data);
    expect(female.run!.result).toMatchObject({ text: 'Her result', expression: 'neutral' });
    expect(male.run!.result).toMatchObject({ text: 'His result', expression: 'pleased' });
    expect(female.run!.stats).toMatchObject({ Skill: 10, Money: 0 });
    expect(male.run!.stats.Skill).toBe(4);
  });
});

describe('bosses, exits and policy consequences', () => {
  it('formal recruitment removes only the Gatekeeper fit penalty', () => {
    const run = startCareer(createInitialState(), 'female', fixture()).run!;
    expect(passesBoss(run, 'C1-B', 2)).toBe(false);
    expect(passesBoss({ ...run, activePolicies: ['formal_recruitment'] }, 'C1-B', 2)).toBe(true);
    expect(passesBoss({ ...run, activePolicies: ['childcare_support'] }, 'C1-B', 2)).toBe(false);
    const weak = { ...run, stats: { ...run.stats, Skill: 0 }, activePolicies: ['formal_recruitment'] };
    expect(passesBoss(weak, 'C1-B', 2)).toBe(false);
    expect(passesBoss(run, 'C4-B', 3)).toBe(true);
  });

  it('requires both skill and network, and energy and availability', () => {
    const run = startCareer(createInitialState(), 'female', fixture()).run!;
    expect(passesBoss(run, 'C2-B', 1)).toBe(true);
    expect(passesBoss({ ...run, stats: { ...run.stats, Network: 0, Skill: 10 } }, 'C2-B', 1)).toBe(false);
    expect(passesBoss({ ...run, stats: { ...run.stats, Network: 10, Skill: 0 } }, 'C2-B', 1)).toBe(false);
    expect(passesBoss({ ...run, stats: { ...run.stats, Energy: 1, Availability: 10 } }, 'C3-B', 1)).toBe(false);
  });

  it('shows the failure result before unlocking an exit and resets the next Gatekeeper to default', () => {
    const data = fixture();
    const card = atCard(startCareer(createInitialState(), 'female', data), 'C1-B', data);
    const failed = chooseOption(card, 2, data);
    expect(failed.run).toMatchObject({ phase: 'result', exitReason: 'C1-B', result: { passed: false } });
    expect(failed.lineage).toHaveLength(0);
    const ending = advance(failed, data);
    expect(ending.run!.endingId).toBe('E03');
    const next = startCareer(ending, 'male', data);
    expect(next.run).toMatchObject({ round: 2, character: { name: 'Alex M', pawn: 'male' }, gatekeeper: null, activePolicies: [] });
  });

  it.each([['C2-B', 'E04'], ['C3-B', 'E01']])('maps %s failure to %s', (cardId, endingId) => {
    const data = fixture();
    const card = atCard(startCareer(createInitialState(), 'female', data), cardId, data);
    const failed = chooseOption(card, 3, data);
    expect(failed.run!.result!.passed).toBe(false);
    expect(advance(failed, data).run!.endingId).toBe(endingId);
  });

  it('shows burnout result before the ending and prioritizes burnout over boss failure', () => {
    const data = fixture();
    data.scenarios.find((row) => row.cardId === 'C1-B' && row.option === 2)!.deltas.female.Energy = -10;
    const card = atCard(startCareer(createInitialState(), 'female', data), 'C1-B', data);
    const result = chooseOption(card, 2, data);
    expect(result.run).toMatchObject({ phase: 'result', exitReason: 'burnout', endingId: null, stats: { Energy: 0 } });
    expect(advance(result, data).run!.endingId).toBe('E05');
  });
});

describe('automatic resume and storage resilience', () => {
  it('resumes every phase through two complete careers without rewinding or duplicating unlocks', () => {
    memoryStorage();
    const data = fixture();
    let state = startCareer(createInitialState(), 'female', data);
    for (let career = 0; career < 2; career++) {
      for (let step = 0; step < 100; step++) {
        expect(isValidState(state)).toBe(true);
        expect(saveState(state)).toBe(true);
        expect(loadState()).toEqual(state);
        if (state.run!.phase === 'ending') break;
        state = state.run!.phase === 'card' ? chooseOption(state, 1, data) : advance(state, data);
      }
      expect(state.run!.phase).toBe('ending');
      if (career === 0) state = startCareer(state, 'male', data);
    }
    expect(state.lineage).toHaveLength(2);
    expect(state.gallery).toHaveLength(1);
  });

  it('rejects corrupted snapshots and preserves unrelated browser storage on reset', () => {
    const storage = memoryStorage();
    for (const raw of ['{broken', '{}', JSON.stringify({ ...createInitialState(), version: 2 })]) {
      storage.setItem(`${RULES.storagePrefix}snapshot`, raw);
      expect(loadState()).toEqual(createInitialState());
    }
    const valid = startCareer(createInitialState(), 'female', fixture());
    for (const change of [{ stats: {} }, { position: 99 }, { choices: { 'C1-01': 9 } }, { phase: 'ending', endingId: 'E99' }]) {
      storage.setItem(`${RULES.storagePrefix}snapshot`, JSON.stringify({ ...valid, run: { ...valid.run, ...change } }));
      expect(loadState()).toEqual(createInitialState());
    }
    saveState(valid);
    storage.setItem('unrelated', 'keep');
    resetStorage();
    expect(storage.getItem('unrelated')).toBe('keep');
    expect(loadState()).toEqual(createInitialState());
  });

  it('survives unavailable storage and keeps settings through a career', () => {
    const settings = updateSettings(createInitialState(), { reducedMotion: true, sound: true });
    expect(startCareer(settings, 'male', fixture()).settings).toEqual({ reducedMotion: true, sound: true });
    vi.stubGlobal('localStorage', { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('blocked'); } });
    expect(loadState()).toEqual(createInitialState());
    expect(saveState(settings)).toBe(false);
    expect(() => resetStorage()).not.toThrow();
  });
});
