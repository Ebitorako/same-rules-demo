import { CONTENT_VERSION, RULES } from '../config/rules';
import { BOARD } from './board';
import { ENDING_IDS } from './endings';
import { createInitialState } from './state';
import { hasConsistentStatHistory, isEndingRecap, isStats, sameStats } from './recap';
import { STAT_NAMES, LEGACY_STAT_NAMES, type AppState, type Career, type Character, type LegacyArchive, type Run } from './types';

const prefix = RULES.storagePrefix;
const keys = ['snapshot', 'currentRun', 'lineage', 'gallery', 'settings'];
const cardIds = new Set(BOARD.flatMap((tile) => tile.cardId ? [tile.cardId] : []));
const phases = ['intro', 'board', 'card', 'result', 'promotion', 'ending', 'chapter', 'milestone'];
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const pawn = (value: unknown) => value === 'female' || value === 'male';
const round = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 1;
const ending = (value: unknown): value is string => typeof value === 'string' && ENDING_IDS.includes(value);
const policies = (value: unknown): value is string[] => Array.isArray(value)
  && value.every((item) => typeof item === 'string' && /^[a-z][a-z0-9_]*$/.test(item))
  && new Set(value).size === value.length;
const character = (value: unknown): value is Character => object(value) && text(value.name) && pawn(value.pawn);
const intern = (value: unknown) => value === null || (typeof value === 'string' && /^[a-z][a-z0-9_]*$/.test(value));
const flags = (value: unknown) => object(value) && Object.entries(value).every(([key, item]) =>
  /^[a-z][a-z0-9_]*$/.test(key) && (typeof item === 'string' || typeof item === 'boolean'));

function isCareer(value: unknown): value is Career {
  return object(value) && round(value.round) && character(value.character)
    && ending(value.endingId) && typeof value.reachedDirector === 'boolean'
    && policies(value.policiesSet) && intern(value.hiredIntern)
    && (value.gatekeeperEligible === undefined || typeof value.gatekeeperEligible === 'boolean')
    && (value.recap === undefined || (isEndingRecap(value.recap) && value.recap.round === value.round
      && value.recap.character.name === value.character.name && value.recap.character.pawn === value.character.pawn));
}

function isRun(value: unknown): value is Run {
  if (!object(value) || value.contentVersion !== CONTENT_VERSION || !round(value.round) || !character(value.character)
    || !isStats(value.stats) || Object.keys(value.stats).length !== STAT_NAMES.length
    || !STAT_NAMES.every((name) => value.stats && object(value.stats) && Number(value.stats[name]) >= RULES.stats.minimum
      && Number(value.stats[name]) <= RULES.stats.maximum)
    || !Number.isInteger(value.position) || Number(value.position) < 0 || Number(value.position) >= BOARD.length
    || typeof value.phase !== 'string' || !phases.includes(value.phase)
    || !Array.isArray(value.visited) || !value.visited.length || value.visited.some((position, index) => position !== index)
    || value.visited.length > BOARD.length || !object(value.choices)
    || !Object.entries(value.choices).every(([cardId, option]) => cardIds.has(cardId) && [1, 2, 3, 4].includes(Number(option)) && typeof option === 'number')
    || !policies(value.activePolicies) || !policies(value.policiesSet)
    || typeof value.reachedDirector !== 'boolean' || !intern(value.hiredIntern)
    || !(value.gatekeeper === null || character(value.gatekeeper))
    || !(value.endingId === null || ending(value.endingId))
    || !(value.exitReason === null || value.exitReason === 'burnout' || ending(value.exitReason))
    || !flags(value.flags)
    || !Array.isArray(value.shownChapters) || !value.shownChapters.every((chapter) => [1, 2, 3, 4].includes(chapter))
    || new Set(value.shownChapters).size !== value.shownChapters.length
    || (value.openingChapter !== undefined && ![1, 2, 3, 4].includes(Number(value.openingChapter)))
    || ![undefined, null, 'CH1-E01', 'CH2-E07'].includes(value.milestoneId as string | null | undefined)
    || ![undefined, null, 'CH1-E01', 'CH2-E07'].includes(value.pendingMilestoneId as string | null | undefined)) return false;
  const run = value as unknown as Run;
  if (!hasConsistentStatHistory(run)) return false;
  const completed = run.phase === 'ending' && run.exitReason === null;
  if (run.visited.length !== (completed ? BOARD.length : run.position + 1)) return false;
  if (completed && run.position !== 0) return false;
  if (run.reachedDirector !== run.visited.includes(17)) return false;
  if (!run.reachedDirector && (run.hiredIntern !== null || run.policiesSet.length !== 0)) return false;
  if ((run.phase === 'ending') !== (run.endingId !== null)) return false;
  if (run.exitReason !== null && run.phase !== 'ending') return false;
  if (run.phase === 'intro' && run.position !== 0) return false;
  if (run.phase === 'promotion' && BOARD[run.position].kind !== 'director') return false;
  if (run.phase === 'card' && !BOARD[run.position].cardId) return false;
  if (run.phase === 'chapter' && ![5, 10].includes(run.position)) return false;
  if (run.phase === 'milestone' && (!run.milestoneId || ![5, 10].includes(run.position))) return false;
  const expectedChoices = run.visited.flatMap((position) => {
    const cardId = BOARD[position].cardId;
    return cardId && !(run.phase === 'card' && run.position === position) ? [cardId] : [];
  });
  if (Object.keys(run.choices).length !== expectedChoices.length || expectedChoices.some((id) => run.choices[id] === undefined)) return false;
  if (run.chosenScenarios && (!object(run.chosenScenarios) || Object.entries(run.chosenScenarios).some(([id, row]) =>
    !object(row) || row.cardId !== id || row.option !== run.choices[id] || typeof row.scene !== 'string'
    || typeof row.optionText !== 'string' || !object(row.results)))) return false;
  const expectsResult = run.phase === 'result' || (run.phase === 'ending' && run.exitReason !== null);
  if (!expectsResult) return run.result === null;
  const result = value.result;
  return object(result) && result.cardId === BOARD[run.position].cardId
    && result.option === run.choices[String(result.cardId)] && typeof result.text === 'string'
    && typeof result.expression === 'string' && typeof result.npc === 'string'
    && (result.passed === null || typeof result.passed === 'boolean');
}

function legacyCareer(value: unknown): boolean {
  return object(value) && round(value.round) && character(value.character) && /^E0[1-6]$/.test(String(value.endingId))
    && typeof value.reachedDirector === 'boolean' && policies(value.policiesSet) && intern(value.hiredIntern);
}

function isLegacyArchive(value: unknown): value is LegacyArchive {
  if (!object(value) || value.sourceVersion !== 'prototype-v0.11' || !Array.isArray(value.lineage)
    || !value.lineage.every(legacyCareer) || !Array.isArray(value.gallery)) return false;
  if (value.run === null) return true;
  return object(value.run) && character(value.run.character) && round(value.run.round) && isStats(value.run.stats)
    && LEGACY_STAT_NAMES.every((key) => typeof (value.run as Record<string, unknown>).stats === 'object'
      && Number.isFinite(((value.run as Record<string, unknown>).stats as Record<string, number>)[key]));
}

export function isValidState(value: unknown): value is AppState {
  if (!object(value) || value.version !== 1 || value.contentVersion !== CONTENT_VERSION || !object(value.settings)
    || typeof value.settings.reducedMotion !== 'boolean' || typeof value.settings.sound !== 'boolean'
    || (value.settings.guideHidden !== undefined && typeof value.settings.guideHidden !== 'boolean')
    || (value.settings.locale !== undefined && value.settings.locale !== 'en' && value.settings.locale !== 'zh-CN')
    || !Array.isArray(value.lineage) || !value.lineage.every((career, index) => isCareer(career) && career.round === index + 1)
    || !Array.isArray(value.gallery) || !(value.run === null || isRun(value.run))
    || (value.migrationNotice !== undefined && typeof value.migrationNotice !== 'boolean')
    || (value.legacyArchive !== undefined && !isLegacyArchive(value.legacyArchive))) return false;
  const state = value as unknown as AppState;
  const seen = new Set<string>();
  if (!state.gallery.every((unlock) => {
    if (!object(unlock) || !ending(unlock.endingId) || !pawn(unlock.pawn) || !round(unlock.round) || !text(unlock.name)) return false;
    const key = unlock.endingId + '/' + unlock.pawn;
    const career = state.lineage[unlock.round - 1];
    if (seen.has(key) || !career || career.endingId !== unlock.endingId
      || career.character.pawn !== unlock.pawn || career.character.name !== unlock.name) return false;
    seen.add(key);
    return true;
  })) return false;
  if (state.lineage.some((career) => !seen.has(career.endingId + '/' + career.character.pawn))) return false;
  if (!state.run) return state.lineage.length === 0;
  if (state.run.round !== state.lineage.length + (state.run.phase === 'ending' ? 0 : 1)) return false;
  if (state.run.phase === 'ending') {
    const latest = state.lineage.at(-1)!;
    if (latest.endingId !== state.run.endingId || latest.character.name !== state.run.character.name
      || latest.character.pawn !== state.run.character.pawn || latest.reachedDirector !== state.run.reachedDirector
      || latest.hiredIntern !== state.run.hiredIntern || latest.policiesSet.join() !== state.run.policiesSet.join()) return false;
    if (latest.recap?.finalStats && !sameStats(latest.recap.finalStats, state.run.stats)) return false;
  }
  return true;
}

function migratePrototype(value: unknown): AppState | null {
  if (!object(value) || value.version !== 1 || value.contentVersion !== undefined || !object(value.settings)
    || typeof value.settings.sound !== 'boolean' || typeof value.settings.reducedMotion !== 'boolean') return null;
  const archive = { sourceVersion: 'prototype-v0.11', run: value.run, lineage: value.lineage, gallery: value.gallery };
  if (!isLegacyArchive(archive)) return null;
  return { ...createInitialState(), settings: { reducedMotion: value.settings.reducedMotion, sound: value.settings.sound,
    ...(typeof value.settings.guideHidden === 'boolean' ? { guideHidden: value.settings.guideHidden } : {}) },
    legacyArchive: structuredClone(archive), migrationNotice: archive.run !== null || archive.lineage.length > 0 };
}

function discardInvalidRecapMetadata(value: unknown): unknown {
  if (!object(value)) return value;
  const state = { ...value };
  if (object(state.run) && state.run.statHistory !== undefined && object(state.run.choices) && isStats(state.run.stats)) {
    const run = { ...state.run };
    if (!hasConsistentStatHistory(run as unknown as Run)) delete run.statHistory;
    state.run = run;
  }
  if (Array.isArray(state.lineage)) state.lineage = state.lineage.map((item) => {
    if (!object(item) || item.recap === undefined) return item;
    const career = { ...item };
    const recap = career.recap;
    const run = object(state.run) ? state.run : null;
    if (!isEndingRecap(recap) || recap.round !== career.round || !character(career.character)
      || recap.character.name !== career.character.name || recap.character.pawn !== career.character.pawn
      || (run?.phase === 'ending' && run.round === career.round && isStats(run.stats)
        && recap.finalStats !== null && !sameStats(recap.finalStats, run.stats))) delete career.recap;
    return career;
  });
  return state;
}

export function loadState(): AppState {
  try {
    if (typeof localStorage === 'undefined') return createInitialState();
    const raw = localStorage.getItem(prefix + 'snapshot');
    if (!raw) return createInitialState();
    const parsed: unknown = JSON.parse(raw);
    const migrated = migratePrototype(parsed);
    if (migrated) return migrated;
    const cleaned = discardInvalidRecapMetadata(parsed);
    return isValidState(cleaned) ? cleaned : createInitialState();
  } catch { return createInitialState(); }
}

export function saveState(state: AppState): boolean {
  try {
    if (typeof localStorage === 'undefined' || !isValidState(state)) return false;
    localStorage.setItem(prefix + 'snapshot', JSON.stringify(state));
    localStorage.setItem(prefix + 'currentRun', JSON.stringify(state.run));
    localStorage.setItem(prefix + 'lineage', JSON.stringify(state.lineage));
    localStorage.setItem(prefix + 'gallery', JSON.stringify(state.gallery));
    localStorage.setItem(prefix + 'settings', JSON.stringify(state.settings));
    return true;
  } catch { return false; }
}

export function resetStorage(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    for (const key of keys) localStorage.removeItem(prefix + key);
  } catch { /* The in-memory reset remains usable when storage is unavailable. */ }
}
