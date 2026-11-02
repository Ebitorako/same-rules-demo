import { initialStats, RULES } from '../config/rules';
import { BOARD } from './board';
import { passesBoss } from './bosses';
import { matchesCondition } from './conditions';
import { selectEnding } from './endings';
import { getEndingRecap, recordStatChange } from './recap';
import { STAT_NAMES, type AppState, type GameData, type Pawn, type Run, type ScenarioOption, type Settings } from './types';

export function createInitialState(): AppState {
  return { version: 1, run: null, lineage: [], gallery: [], settings: { reducedMotion: false, sound: false } };
}

export function startCareer(state: AppState, pawn: Pawn, data: GameData): AppState {
  if (state.run && state.run.phase !== 'ending') return state;
  const previous = state.lineage.at(-1);
  const director = previous?.reachedDirector ? previous : null;
  const intern = director ? data.candidates.find((candidate) => candidate.id === director.hiredIntern) : null;
  const character = intern ? { name: intern.name, pawn: intern.pawn } : { name: data.copy.defaultNames[pawn], pawn };
  const stats = initialStats();
  return {
    ...state,
    run: {
      round: (previous?.round ?? 0) + 1, character, stats,
      position: 0, visited: [0], phase: 'intro', choices: {},
      activePolicies: [...(director?.policiesSet ?? [])], policiesSet: [], hiredIntern: null,
      reachedDirector: false, gatekeeper: director ? { ...director.character } : null,
      result: null, endingId: null, exitReason: null,
      statHistory: { version: 1, initialStats: { ...stats },
        bounds: { minimum: RULES.stats.minimum, maximum: RULES.stats.maximum }, steps: [] },
    },
  };
}

export function getOptions(run: Run, data: GameData): ScenarioOption[] {
  const tile = BOARD[run.position];
  if (tile?.chapter === 4 && !run.reachedDirector) return [];
  const cardId = tile?.cardId;
  const eligible = data.scenarios.filter((row) => row.cardId === cardId
    && (row.pawn === 'both' || row.pawn === run.character.pawn)
    && matchesCondition(row.condition, run));
  return [1, 2, 3].flatMap((number) => {
    const candidates = eligible.filter((row) => row.option === number);
    const conditional = candidates.filter((row) => row.condition.trim() !== '');
    const matches = conditional.length ? conditional : candidates;
    // Validation normally catches ambiguity; never silently show an arbitrary variant.
    return matches.length === 1 ? [matches[0]] : [];
  });
}

function finishCareer(state: AppState, run: Run, data?: GameData): AppState {
  const endingId = selectEnding(run);
  const finished: Run = { ...run, phase: 'ending', endingId };
  if (state.lineage.some((career) => career.round === run.round)) return { ...state, run: finished };
  return {
    ...state, run: finished,
    lineage: [...state.lineage, {
      round: run.round, character: { ...run.character }, endingId, reachedDirector: run.reachedDirector,
      policiesSet: [...run.policiesSet], hiredIntern: run.hiredIntern,
      recap: getEndingRecap(finished, data),
    }],
    gallery: state.gallery.some((unlock) => unlock.endingId === endingId && unlock.pawn === run.character.pawn)
      ? state.gallery : [...state.gallery, { endingId, pawn: run.character.pawn, round: run.round, name: run.character.name }],
  };
}

// Earlier saves stopped on a failed boss's result screen before recording the exit.
export function completePendingBossExit(state: AppState): AppState {
  const run = state.run;
  return run?.phase === 'result' && run.result?.passed === false && run.exitReason !== null
    ? finishCareer(state, run) : state;
}

function canReachDirector(run: Run): boolean {
  const directorPosition = BOARD.findIndex((tile) => tile.kind === 'director');
  const bossId = BOARD[directorPosition - 1]?.cardId;
  const chosenOption = bossId ? run.choices[bossId] : undefined;
  return Boolean(bossId && chosenOption !== undefined && run.exitReason === null
    && passesBoss(run, bossId, chosenOption));
}

export function advance(state: AppState, data: GameData): AppState {
  const run = state.run;
  if (!run) return state;
  if (run.phase === 'intro') return { ...state, run: { ...run, phase: 'board' } };
  if (run.phase === 'promotion') {
    if (BOARD[run.position]?.kind !== 'director' || !run.reachedDirector || !canReachDirector(run)) return state;
    return { ...state, run: { ...run, phase: 'board' } };
  }
  if (run.phase === 'result') {
    if (run.exitReason) return finishCareer(state, run, data);
    return { ...state, run: { ...run, phase: 'board', result: null } };
  }
  if (run.phase !== 'board') return state;
  const position = (run.position + 1) % BOARD.length;
  if (position === 0) return finishCareer(state, { ...run, position, result: null }, data);
  const tile = BOARD[position];
  if (tile.kind === 'director' && !canReachDirector(run)) return state;
  if (tile.chapter === 4 && tile.kind !== 'director' && !run.reachedDirector) return state;
  return {
    ...state,
    run: { ...run, position, visited: [...run.visited, position], result: null,
      reachedDirector: run.reachedDirector || tile.kind === 'director',
      phase: tile.kind === 'director' ? 'promotion' : 'card' },
  };
}

export function chooseOption(state: AppState, optionNumber: number, data: GameData): AppState {
  const run = state.run;
  if (!run || run.phase !== 'card' || ![1, 2, 3].includes(optionNumber)) return state;
  const options = getOptions(run, data);
  if (options.length !== 3) return state;
  const option = options.find((candidate) => candidate.option === optionNumber);
  if (!option || run.choices[option.cardId] !== undefined) return state;
  const stats = { ...run.stats };
  for (const name of STAT_NAMES) {
    stats[name] = Math.max(RULES.stats.minimum, Math.min(RULES.stats.maximum, stats[name] + (option.deltas[run.character.pawn][name] ?? 0)));
  }
  const updated: Run = { ...run, stats, phase: 'result', choices: { ...run.choices, [option.cardId]: optionNumber } };
  if (option.cardId === RULES.hiring.cardId && run.reachedDirector) {
    const candidateId = RULES.hiring.candidates[optionNumber];
    updated.hiredIntern = data.candidates.some((candidate) => candidate.id === candidateId) ? candidateId : null;
  }
  if (option.cardId === RULES.policy.cardId && run.reachedDirector) {
    const policyId = RULES.policy.options[optionNumber];
    const policy = data.policies.find((item) => item.id === policyId);
    const availableTokens = Math.min(data.powerTokens, RULES.powerTokens);
    if (policy && RULES.policy.tokenCost <= availableTokens) updated.policiesSet = [policyId];
  }
  const passed = option.type === 'boss' ? passesBoss(updated, option.cardId, optionNumber) : null;
  updated.exitReason = RULES.burnoutAtZero && stats.Energy === RULES.stats.minimum ? 'burnout'
    : passed === false ? option.cardId : null;
  updated.result = { cardId: option.cardId, option: optionNumber, text: option.results[run.character.pawn],
    expression: option.expressions[run.character.pawn], npc: option.npc, passed };
  updated.statHistory = recordStatChange(run, option, stats, data);
  return passed === false ? finishCareer(state, updated, data) : { ...state, run: updated };
}

export function updateSettings(state: AppState, partial: Partial<Settings>): AppState {
  return { ...state, settings: {
    ...state.settings,
    reducedMotion: typeof partial.reducedMotion === 'boolean' ? partial.reducedMotion : state.settings.reducedMotion,
    sound: typeof partial.sound === 'boolean' ? partial.sound : state.settings.sound,
    ...(typeof partial.guideHidden === 'boolean' ? { guideHidden: partial.guideHidden } : {}),
  } };
}
