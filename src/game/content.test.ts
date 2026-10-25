import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseEndings, parseScenarios } from '../data/parse';
import { BOARD } from './board';
import { isValidState } from './persistence';
import { advance, chooseOption, createInitialState, getOptions, startCareer } from './state';
import type { AppState, GameData } from './types';

function localData(): GameData {
  const read = (file: string) => readFileSync(resolve('public/data', file), 'utf8');
  const policies = JSON.parse(read('policies.json'));
  return {
    scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')),
    candidates: JSON.parse(read('candidates.json')).candidates, policies: policies.policies,
    powerTokens: policies.powerTokens, copy: JSON.parse(read('copy.json')),
  };
}

function play(state: AppState, data: GameData): AppState {
  for (let step = 0; step < 100; step++) {
    expect(isValidState(state)).toBe(true);
    if (state.run!.phase === 'ending') return state;
    if (state.run!.phase === 'card') {
      expect(getOptions(state.run!, data), BOARD[state.run!.position].cardId).toHaveLength(3);
      state = chooseOption(state, 1, data);
    } else state = advance(state, data);
  }
  throw new Error('The prototype content did not reach an ending.');
}

describe('real prototype content and game integration', () => {
  it.each(['female', 'male'] as const)('plays all 20 actual cards with %s and carries the director, intern and policy into round two', (pawn) => {
    const data = localData();
    const ending = play(startCareer(createInitialState(), pawn, data), data);
    expect(ending.run!.endingId).toBe('E06');
    expect(Object.keys(ending.run!.choices)).toHaveLength(20);
    expect(data.endings.find((item) => item.id === ending.run!.endingId)).toBeDefined();
    const next = startCareer(ending, pawn, data);
    const intern = data.candidates.find((candidate) => candidate.id === ending.run!.hiredIntern)!;
    expect(next.run!.character).toEqual({ name: intern.name, pawn: intern.pawn });
    expect(next.run!.gatekeeper).toEqual(ending.run!.character);
    expect(next.run!.activePolicies).toEqual(['formal_recruitment']);
    const secondEnding = play(next, data);
    expect(secondEnding.run!.endingId).toBe('E06');
    expect(secondEnding.lineage).toHaveLength(2);
  });
});
