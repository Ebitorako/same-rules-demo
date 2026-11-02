import { CONTENT_VERSION, initialStats, RULES } from '../config/rules';
import { BOARD } from './board';
import { matchesCondition } from './conditions';
import { selectEnding } from './endings';
import { getEndingRecap, recordStatChange, recordSystemChange } from './recap';
import { STAT_NAMES, type AppState, type ChapterOpening, type GameData, type Pawn, type Run, type ScenarioOption,
  type Settings, type Stats, type StoryEffect } from './types';

export function createInitialState(): AppState {
  return { version: 1, contentVersion: CONTENT_VERSION, run: null, lineage: [], gallery: [],
    settings: { reducedMotion: false, sound: false } };
}

export function startCareer(state: AppState, pawn: Pawn, data: GameData): AppState {
  if (state.run && state.run.phase !== 'ending') return state;
  const previous = state.lineage.at(-1);
  const director = previous && (previous.reachedDirector || previous.gatekeeperEligible) ? previous : null;
  const character = { name: data.copy.defaultNames[pawn], pawn };
  const stats = initialStats();
  return {
    ...state, contentVersion: CONTENT_VERSION, migrationNotice: false,
    run: {
      contentVersion: CONTENT_VERSION,
      round: (previous?.round ?? 0) + 1, character, stats,
      position: 0, visited: [0], phase: 'intro', choices: {},
      activePolicies: [...(director?.policiesSet ?? [])], policiesSet: [], hiredIntern: null,
      reachedDirector: false, gatekeeper: director ? { ...director.character } : null,
      result: null, endingId: null, exitReason: null,
      flags: { has_child: false, maternal_assumption: false, promised_no_kids: false, partner_primary: false,
        previous_family_man: previous?.endingId === 'E05' },
      shownChapters: [1], openingChapter: 1, milestoneId: null, pendingMilestoneId: null, chosenScenarios: {},
      statHistory: { version: 1, initialStats: { ...stats },
        bounds: { minimum: RULES.stats.minimum, maximum: RULES.stats.maximum }, steps: [] },
    },
  };
}

export function getOptions(run: Run, data: GameData): ScenarioOption[] {
  const tile = BOARD[run.position];
  if (tile?.chapter === 4 && !run.reachedDirector) return [];
  const eligible = data.scenarios.filter((row) => row.cardId === tile?.cardId
    && (row.pawn === 'both' || row.pawn === run.character.pawn)
    && matchesCondition(row.condition, run));
  return [...new Set(eligible.map((row) => row.option))].sort((a, b) => a - b).flatMap((number) => {
    const candidates = eligible.filter((row) => row.option === number);
    const conditional = candidates.filter((row) => row.condition.trim() !== '');
    const matches = conditional.length ? conditional : candidates;
    return matches.length === 1 ? [matches[0]] : [];
  });
}

export function getOptionAvailability(run: Run, option: ScenarioOption): { enabled: boolean; reason: string } {
  const enabled = matchesCondition(option.availableWhen ?? '', run);
  return { enabled, reason: enabled ? '' : option.unavailableText?.[run.character.pawn] ?? '' };
}

export function getChapterIntro(run: Run, data: GameData): ChapterOpening | null {
  const chapter = run.phase === 'promotion' ? 4 : run.openingChapter ?? (run.phase === 'intro' ? 1 : 0);
  return data.chapters?.find((item) => item.chapter === chapter) ?? null;
}

function matchedEffects(run: Run, effects?: StoryEffect[]): StoryEffect[] {
  return (effects ?? []).filter((effect) => (!effect.pawn || effect.pawn === run.character.pawn)
    && matchesCondition(effect.when ?? '', run));
}

function applyEffects(run: Run, effects: StoryEffect[], baseDelta: Partial<Stats>): { run: Run; delta: Partial<Stats> } {
  const updated: Run = { ...run, flags: { ...run.flags }, policiesSet: [...run.policiesSet] };
  const delta = { ...baseDelta };
  for (const effect of effects) {
    Object.assign(updated.flags!, effect.setFlags);
    Object.assign(delta, effect.deltaOverride);
    for (const name of STAT_NAMES) if (effect.delta?.[name] !== undefined) delta[name] = (delta[name] ?? 0) + effect.delta[name]!;
    if (effect.endingId) { updated.endingId = effect.endingId; updated.exitReason = effect.endingId; }
    if (effect.milestoneId) updated.pendingMilestoneId = effect.milestoneId;
    if (effect.policy !== undefined) updated.policiesSet = effect.policy === 'none' ? [] : [effect.policy];
    if (effect.hiredIntern !== undefined) updated.hiredIntern = effect.hiredIntern;
  }
  updated.stats = Object.fromEntries(STAT_NAMES.map((name) => [name,
    Math.max(RULES.stats.minimum, Math.min(RULES.stats.maximum, run.stats[name] + (delta[name] ?? 0)))])) as Stats;
  return { run: updated, delta };
}

function finishCareer(state: AppState, run: Run, data?: GameData): AppState {
  const endingId = selectEnding(run);
  const finished: Run = { ...run, phase: 'ending', endingId, milestoneId: null, pendingMilestoneId: null };
  if (state.lineage.some((career) => career.round === run.round)) return { ...state, run: finished };
  return {
    ...state, run: finished,
    lineage: [...state.lineage, {
      round: run.round, character: { ...run.character }, endingId, reachedDirector: run.reachedDirector,
      gatekeeperEligible: run.reachedDirector || endingId === 'E05',
      policiesSet: [...run.policiesSet], hiredIntern: run.hiredIntern, recap: getEndingRecap(finished, data),
    }],
    gallery: state.gallery.some((unlock) => unlock.endingId === endingId && unlock.pawn === run.character.pawn)
      ? state.gallery : [...state.gallery, { endingId, pawn: run.character.pawn, round: run.round, name: run.character.name }],
  };
}

export function completePendingBossExit(state: AppState): AppState {
  const run = state.run;
  return run?.phase === 'result' && run.exitReason !== null ? finishCareer(state, run) : state;
}

function enterChapter(state: AppState, chapter: number, data: GameData, phase: 'chapter' | 'promotion' = 'chapter'): AppState {
  const run = state.run!;
  if (run.shownChapters?.includes(chapter)) return { ...state, run: { ...run, phase: 'board', result: null } };
  const opening = data.chapters?.find((item) => item.chapter === chapter);
  let updated: Run = { ...run, phase, openingChapter: chapter, result: null, milestoneId: null,
    shownChapters: [...(run.shownChapters ?? []), chapter] };
  if (opening) {
    const applied = applyEffects(updated, matchedEffects(run, opening.effects), {});
    updated = applied.run;
    if (STAT_NAMES.some((name) => applied.delta[name])) {
      updated.statHistory = recordSystemChange(run, opening, updated.stats, applied.delta);
    }
  }
  return { ...state, run: updated };
}

function afterBoss(state: AppState, data: GameData): AppState {
  const run = state.run!;
  const id = BOARD[run.position]?.cardId;
  if (id === 'C1-B') return enterChapter(state, 2, data);
  if (id === 'C2-B') return enterChapter(state, 3, data);
  return { ...state, run: { ...run, phase: 'board', result: null, milestoneId: null } };
}

export function advance(state: AppState, data: GameData): AppState {
  const run = state.run;
  if (!run) return state;
  if (run.phase === 'intro' || run.phase === 'chapter') return { ...state, run: { ...run, phase: 'board' } };
  if (run.phase === 'milestone') return afterBoss(state, data);
  if (run.phase === 'promotion') {
    if (BOARD[run.position]?.kind !== 'director' || !run.reachedDirector || !run.flags?.ideal_worker_passed) return state;
    return { ...state, run: { ...run, phase: 'board' } };
  }
  if (run.phase === 'result') {
    if (run.exitReason) return finishCareer(state, run, data);
    if (run.pendingMilestoneId) return { ...state, run: { ...run, phase: 'milestone',
      milestoneId: run.pendingMilestoneId, pendingMilestoneId: null, result: null } };
    return afterBoss(state, data);
  }
  if (run.phase !== 'board') return state;
  const position = (run.position + 1) % BOARD.length;
  if (position === 0) return finishCareer(state, { ...run, position, result: null }, data);
  const tile = BOARD[position];
  if (tile.kind === 'director' && !run.flags?.ideal_worker_passed) return state;
  if (tile.chapter === 4 && tile.kind !== 'director' && !run.reachedDirector) return state;
  const moved: AppState = { ...state, run: { ...run, position, visited: [...run.visited, position], result: null,
    reachedDirector: run.reachedDirector || tile.kind === 'director', phase: 'card' } };
  return tile.kind === 'director' ? enterChapter(moved, 4, data, 'promotion') : moved;
}

export function chooseOption(state: AppState, optionNumber: number, data: GameData): AppState {
  const run = state.run;
  if (!run || run.phase !== 'card' || ![1, 2, 3, 4].includes(optionNumber)) return state;
  const option = getOptions(run, data).find((candidate) => candidate.option === optionNumber);
  if (!option || !getOptionAvailability(run, option).enabled || run.choices[option.cardId] !== undefined) return state;
  const effects = matchedEffects(run, option.effects);
  const applied = applyEffects(run, effects, option.deltas[run.character.pawn]);
  const updated: Run = { ...applied.run, phase: 'result',
    choices: { ...run.choices, [option.cardId]: optionNumber } };
  const results = { ...option.results };
  const expressions = { ...option.expressions };
  for (const effect of effects) {
    Object.assign(results, effect.resultText);
    Object.assign(expressions, effect.expression);
  }
  if (option.cardId === 'C3-B' && optionNumber === 1 && !updated.exitReason) updated.flags = { ...updated.flags, ideal_worker_passed: true };
  if (RULES.burnoutAtZero && updated.stats.Energy <= 0) {
    updated.exitReason = 'burnout';
    updated.endingId = RULES.endings.burnout;
  }
  const resolved: ScenarioOption = { ...option, results, expressions,
    deltas: { ...option.deltas, [run.character.pawn]: applied.delta } };
  updated.chosenScenarios = { ...run.chosenScenarios, [option.cardId]: structuredClone(resolved) };
  updated.result = { cardId: option.cardId, option: optionNumber, text: results[run.character.pawn],
    expression: expressions[run.character.pawn], npc: option.npc,
    passed: option.type === 'boss' ? !updated.exitReason : null };
  updated.statHistory = recordStatChange(run, resolved, updated.stats, data);
  return updated.exitReason ? finishCareer(state, updated, data) : { ...state, run: updated };
}

export function updateSettings(state: AppState, partial: Partial<Settings>): AppState {
  return { ...state, settings: {
    ...state.settings,
    reducedMotion: typeof partial.reducedMotion === 'boolean' ? partial.reducedMotion : state.settings.reducedMotion,
    sound: typeof partial.sound === 'boolean' ? partial.sound : state.settings.sound,
    ...(typeof partial.guideHidden === 'boolean' ? { guideHidden: partial.guideHidden } : {}),
  } };
}
