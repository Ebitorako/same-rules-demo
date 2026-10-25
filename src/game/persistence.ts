import { RULES } from '../config/rules';
import { BOARD } from './board';
import { ENDING_IDS } from './endings';
import { createInitialState } from './state';
import { STAT_NAMES, type AppState, type Career, type Character, type Run } from './types';

const prefix = RULES.storagePrefix;
const keys = ['snapshot', 'currentRun', 'lineage', 'gallery', 'settings'];
const cardIds = new Set(BOARD.flatMap((tile) => tile.cardId ? [tile.cardId] : []));
const phases = ['intro', 'board', 'card', 'result', 'promotion', 'ending'];
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isPawn = (value: unknown) => value === 'female' || value === 'male';
const isRound = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 1;
const isEnding = (value: unknown): value is string => typeof value === 'string' && ENDING_IDS.includes(value);
const isPolicies = (value: unknown): value is string[] => Array.isArray(value)
  && value.every((item) => typeof item === 'string' && /^[a-z][a-z0-9_]*$/.test(item))
  && new Set(value).size === value.length;
const isCharacter = (value: unknown): value is Character => isObject(value) && isText(value.name) && isPawn(value.pawn);
const isIntern = (value: unknown) => value === null || (typeof value === 'string' && Object.values(RULES.hiring.candidates).includes(value));

function isCareer(value: unknown): value is Career {
  return isObject(value) && isRound(value.round) && isCharacter(value.character)
    && isEnding(value.endingId) && typeof value.reachedDirector === 'boolean'
    && isPolicies(value.policiesSet) && isIntern(value.hiredIntern)
    && (value.reachedDirector || (value.policiesSet.length === 0 && value.hiredIntern === null));
}

function isRun(value: unknown): value is Run {
  if (!isObject(value) || !isRound(value.round) || !isCharacter(value.character)
    || !isObject(value.stats) || !STAT_NAMES.every((name) => typeof value.stats === 'object' && value.stats !== null
      && typeof (value.stats as Record<string, unknown>)[name] === 'number'
      && Number.isFinite((value.stats as Record<string, unknown>)[name])
      && Number((value.stats as Record<string, unknown>)[name]) >= RULES.stats.minimum
      && Number((value.stats as Record<string, unknown>)[name]) <= RULES.stats.maximum)
    || !Number.isInteger(value.position) || Number(value.position) < 0 || Number(value.position) >= BOARD.length
    || typeof value.phase !== 'string' || !phases.includes(value.phase)
    || !Array.isArray(value.visited) || !value.visited.length || value.visited.some((position, index) => position !== index)
    || value.visited.length > BOARD.length || !isObject(value.choices)
    || !Object.entries(value.choices).every(([cardId, option]) => cardIds.has(cardId) && [1, 2, 3].includes(Number(option)) && typeof option === 'number')
    || !isPolicies(value.activePolicies) || !isPolicies(value.policiesSet)
    || typeof value.reachedDirector !== 'boolean' || !isIntern(value.hiredIntern)
    || !(value.gatekeeper === null || isCharacter(value.gatekeeper))
    || !(value.endingId === null || isEnding(value.endingId))
    || !(value.exitReason === null || ['burnout', 'C1-B', 'C2-B', 'C3-B'].includes(String(value.exitReason)))) return false;

  const run = value as unknown as Run;
  const completed = run.phase === 'ending' && run.exitReason === null;
  if (run.visited.length !== (completed ? BOARD.length : run.position + 1)) return false;
  if (completed && run.position !== 0) return false;
  if (run.reachedDirector !== run.visited.includes(17)) return false;
  if (!run.reachedDirector && (run.hiredIntern !== null || run.policiesSet.length !== 0)) return false;
  if ((run.phase === 'ending') !== (run.endingId !== null)) return false;
  if (run.exitReason !== null && !['result', 'ending'].includes(run.phase)) return false;
  if (run.phase === 'intro' && run.position !== 0) return false;
  if (run.phase === 'promotion' && BOARD[run.position].kind !== 'director') return false;
  if (run.phase === 'card' && !BOARD[run.position].cardId) return false;

  const expectedChoices = run.visited.flatMap((position) => {
    const cardId = BOARD[position].cardId;
    return cardId && !(run.phase === 'card' && run.position === position) ? [cardId] : [];
  });
  if (Object.keys(run.choices).length !== expectedChoices.length || expectedChoices.some((id) => run.choices[id] === undefined)) return false;
  const expectsResult = run.phase === 'result' || (run.phase === 'ending' && run.exitReason !== null);
  if (!expectsResult) return run.result === null;
  const result = value.result;
  return isObject(result) && result.cardId === BOARD[run.position].cardId
    && result.option === run.choices[String(result.cardId)] && typeof result.text === 'string'
    && typeof result.expression === 'string' && typeof result.npc === 'string'
    && (result.passed === null || typeof result.passed === 'boolean');
}

export function isValidState(value: unknown): value is AppState {
  if (!isObject(value) || value.version !== 1 || !isObject(value.settings)
    || typeof value.settings.reducedMotion !== 'boolean' || typeof value.settings.sound !== 'boolean'
    || !Array.isArray(value.lineage) || !value.lineage.every((career, index) => isCareer(career) && career.round === index + 1)
    || !Array.isArray(value.gallery) || !(value.run === null || isRun(value.run))) return false;
  const state = value as unknown as AppState;
  const seen = new Set<string>();
  if (!state.gallery.every((unlock) => {
    if (!isObject(unlock) || !isEnding(unlock.endingId) || !isPawn(unlock.pawn) || !isRound(unlock.round) || !isText(unlock.name)) return false;
    const key = `${unlock.endingId}/${unlock.pawn}`;
    const career = state.lineage[unlock.round - 1];
    if (seen.has(key) || !career || career.endingId !== unlock.endingId
      || career.character.pawn !== unlock.pawn || career.character.name !== unlock.name) return false;
    seen.add(key);
    return true;
  })) return false;
  if (state.lineage.some((career) => !seen.has(`${career.endingId}/${career.character.pawn}`))) return false;
  if (!state.run) return state.lineage.length === 0;
  if (state.run.round !== state.lineage.length + (state.run.phase === 'ending' ? 0 : 1)) return false;
  if (state.run.phase === 'ending') {
    const latest = state.lineage.at(-1)!;
    if (latest.endingId !== state.run.endingId || latest.character.name !== state.run.character.name
      || latest.character.pawn !== state.run.character.pawn || latest.reachedDirector !== state.run.reachedDirector
      || latest.hiredIntern !== state.run.hiredIntern || latest.policiesSet.join() !== state.run.policiesSet.join()) return false;
  }
  return true;
}

export function loadState(): AppState {
  try {
    if (typeof localStorage === 'undefined') return createInitialState();
    const raw = localStorage.getItem(`${prefix}snapshot`);
    if (!raw) return createInitialState();
    const parsed: unknown = JSON.parse(raw);
    return isValidState(parsed) ? parsed : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): boolean {
  try {
    if (typeof localStorage === 'undefined' || !isValidState(state)) return false;
    // One atomic snapshot prevents a refresh from mixing two different careers.
    localStorage.setItem(`${prefix}snapshot`, JSON.stringify(state));
    localStorage.setItem(`${prefix}currentRun`, JSON.stringify(state.run));
    localStorage.setItem(`${prefix}lineage`, JSON.stringify(state.lineage));
    localStorage.setItem(`${prefix}gallery`, JSON.stringify(state.gallery));
    localStorage.setItem(`${prefix}settings`, JSON.stringify(state.settings));
    return true;
  } catch {
    return false;
  }
}

export function resetStorage(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    for (const key of keys) localStorage.removeItem(`${prefix}${key}`);
  } catch {
    // The in-memory reset remains usable even when browser storage is unavailable.
  }
}
