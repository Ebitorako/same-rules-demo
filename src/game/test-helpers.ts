import { readFileSync } from 'node:fs';
import { BOARD } from './board';
import { advance, chooseOption, createInitialState, startCareer } from './state';
import type { AppState, GameData, Pawn } from './types';

export const femalePlan = [1, 1, 1, 1, 1, 2, 2, 2, 3, 2, 1, 2, 1, 1, 3, 1, 3, 3, 3, 1];
export const malePlan = [1, 1, 3, 1, 1, 1, 1, 2, 3, 2, 1, 2, 1, 3, 3, 1, 1, 2, 3, 1];
export function loadTeamData(): GameData { return JSON.parse(readFileSync('public/data/team-content.json', 'utf8')) as GameData; }
export function planFor(pawn: Pawn, changes: Record<string, number> = {}): Record<string, number> {
  const plan = pawn === 'female' ? femalePlan : malePlan;
  return { ...Object.fromEntries(BOARD.flatMap((tile) => tile.cardId ? [tile.cardId] : []).map((id, i) => [id, plan[i]])), ...changes };
}
export function fresh(pawn: Pawn = 'female', data = loadTeamData()): AppState { return startCareer(createInitialState(), pawn, data); }
export function play(state: AppState, data: GameData, changes: Record<string, number> = {}, target?: string,
  check?: (state: AppState) => void): AppState {
  const plan = planFor(state.run!.character.pawn, changes);
  for (let step = 0; step < 150; step++) {
    check?.(state);
    if (state.run!.phase === 'ending') {
      if (target) throw new Error('Ended at ' + state.run!.endingId + ' before ' + target);
      return state;
    }
    const id = BOARD[state.run!.position].cardId;
    if (target && state.run!.phase === 'card' && id === target) return state;
    const next = state.run!.phase === 'card' ? chooseOption(state, plan[id!], data) : advance(state, data);
    if (next === state) throw new Error('No progress at ' + id + ' / ' + state.run!.phase);
    state = next;
  }
  throw new Error('Career did not finish');
}
export function atCard(target: string, pawn: Pawn = 'female', changes: Record<string, number> = {}, data = loadTeamData()): AppState {
  return play(fresh(pawn, data), data, changes, target);
}
