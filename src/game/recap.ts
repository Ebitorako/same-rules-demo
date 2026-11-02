import { initialStats, RULES } from '../config/rules';
import { BOARD } from './board';
import { getChoiceHistory } from './history';
import { STAT_NAMES, type AppState, type Career, type EndingRecap, type GameData, type RecapIssue, type RecapStep,
  type Run, type ScenarioOption, type StatBounds, type StatChangeSnapshot, type StatHistory, type Stats } from './types';

const cardIds = BOARD.flatMap((tile) => tile.cardId ? [tile.cardId] : []);
const issueIds: RecapIssue[] = ['reconstructed-from-current-data', 'legacy-initial-values', 'missing-choice-history',
  'content-unavailable', 'final-stats-mismatch', 'legacy-career-no-stats'];
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;
export const sameStats = (a: Stats, b: Stats): boolean => STAT_NAMES.every((name) => near(a[name], b[name]));
const fullDelta = (delta: Partial<Stats>): Stats => Object.fromEntries(STAT_NAMES.map((name) => [name, delta[name] ?? 0])) as Stats;
const copy = <T>(value: T): T => structuredClone(value);
const currentBounds = (): StatBounds => ({ minimum: RULES.stats.minimum, maximum: RULES.stats.maximum });
const applyDelta = (before: Stats, delta: Stats, bounds: StatBounds): Stats => Object.fromEntries(STAT_NAMES.map((name) =>
  [name, Math.max(bounds.minimum, Math.min(bounds.maximum, before[name] + delta[name]))])) as Stats;

export function isStats(value: unknown): value is Stats {
  return object(value) && Object.keys(value).length === STAT_NAMES.length
    && STAT_NAMES.every((name) => typeof value[name] === 'number' && Number.isFinite(value[name]));
}
function isBounds(value: unknown): value is StatBounds {
  return object(value) && typeof value.minimum === 'number' && Number.isFinite(value.minimum)
    && typeof value.maximum === 'number' && Number.isFinite(value.maximum) && value.minimum < value.maximum;
}
function isSnapshot(value: unknown): value is StatChangeSnapshot {
  if (!object(value) || typeof value.cardId !== 'string' || !cardIds.includes(value.cardId)
    || value.order !== cardIds.indexOf(value.cardId) + 1 || ![1, 2, 3].includes(Number(value.choice))
    || typeof value.choice !== 'number' || typeof value.title !== 'string' || typeof value.optionText !== 'string'
    || !isStats(value.before) || !isStats(value.after) || !isStats(value.requestedDelta)
    || !isStats(value.actualDelta) || !isBounds(value.bounds)) return false;
  const step = value as unknown as StatChangeSnapshot;
  return sameStats(applyDelta(step.before, step.requestedDelta, step.bounds), step.after)
    && STAT_NAMES.every((name) => near(step.after[name] - step.before[name], step.actualDelta[name]));
}
export function isStatHistory(value: unknown): value is StatHistory {
  if (!object(value) || value.version !== 1 || !(value.initialStats === null || isStats(value.initialStats))
    || !isBounds(value.bounds) || !Array.isArray(value.steps) || !value.steps.every(isSnapshot)) return false;
  const history = value as unknown as StatHistory;
  if (history.steps.some((step, index) => index > 0 && (step.order !== history.steps[index - 1].order + 1
    || !sameStats(step.before, history.steps[index - 1].after)))) return false;
  return !history.initialStats || !history.steps.length || history.steps[0].order !== 1
    || sameStats(history.initialStats, history.steps[0].before);
}
export function hasConsistentStatHistory(run: Pick<Run, 'statHistory' | 'choices' | 'stats'>): boolean {
  if (run.statHistory === undefined) return true;
  if (!isStatHistory(run.statHistory)) return false;
  const steps = run.statHistory.steps;
  if (!steps.length) return Object.keys(run.choices).length === 0;
  return steps.every((step) => run.choices[step.cardId] === step.choice)
    && steps.at(-1)!.order === Object.keys(run.choices).length && sameStats(steps.at(-1)!.after, run.stats);
}
export function isEndingRecap(value: unknown): value is EndingRecap {
  if (!object(value) || value.version !== 1 || !Number.isSafeInteger(value.round) || Number(value.round) < 1
    || !object(value.character) || typeof value.character.name !== 'string' || !value.character.name
    || !['female', 'male'].includes(String(value.character.pawn))
    || !(value.finalStats === null || isStats(value.finalStats)) || !(value.initialStats === null || isStats(value.initialStats))
    || !(value.bounds === null || isBounds(value.bounds))
    || !['recorded', 'reconstructed', 'partial', 'unavailable'].includes(String(value.status))
    || !Array.isArray(value.issues) || !value.issues.every((issue) => issueIds.includes(issue))
    || !Array.isArray(value.steps)) return false;
  const report = value as unknown as EndingRecap;
  if (!report.steps.every((step, index) => {
    if (!object(step) || step.order !== index + 1 || step.cardId !== cardIds[index]
      || ![1, 2, 3].includes(step.choice)) return false;
    if (step.source === 'missing') return step.title === null && step.optionText === null
      && step.before === null && step.after === null && step.requestedDelta === null
      && step.actualDelta === null && step.bounds === null;
    return ['recorded', 'reconstructed'].includes(step.source) && isSnapshot(step);
  })) return false;
  if (report.steps.some((step, index) => index > 0 && step.before && report.steps[index - 1].after
    && !sameStats(step.before, report.steps[index - 1].after!))) return false;
  if (report.steps[0]?.before && report.initialStats && !sameStats(report.steps[0].before, report.initialStats)) return false;
  if (report.steps.at(-1)?.after && report.finalStats && !sameStats(report.steps.at(-1)!.after!, report.finalStats)) return false;
  if (report.status === 'recorded' && report.steps.some((step) => step.source !== 'recorded')) return false;
  if (report.status === 'reconstructed' && (report.steps.some((step) => step.source === 'missing')
    || !report.steps.some((step) => step.source === 'reconstructed'))) return false;
  if (report.status === 'partial' && (!report.steps.some((step) => step.source === 'missing')
    || !report.steps.some((step) => step.source === 'recorded'))) return false;
  if (report.status === 'unavailable' && report.steps.some((step) => step.source !== 'missing')) return false;
  return report.finalStats !== null || (report.status === 'unavailable' && report.steps.length === 0);
}

function choiceText(option: ScenarioOption, data: GameData, run?: Run): string {
  if (option.cardId === RULES.hiring.cardId) {
    const id = run?.hiredIntern ?? RULES.hiring.candidates[option.option];
    const candidate = data.candidates.find((item) => item.id === id);
    if (candidate) return `${candidate.name} — ${candidate.blurb}`;
  }
  if (option.cardId === RULES.policy.cardId) {
    const policy = data.policies.find((item) => item.id === RULES.policy.options[option.option]);
    if (policy) return `${policy.name} — ${option.optionText}`;
  }
  return option.optionText;
}
function makeSnapshot(option: ScenarioOption, order: number, before: Stats, after: Stats, bounds: StatBounds,
  data: GameData, run: Run): StatChangeSnapshot {
  return { cardId: option.cardId, order, choice: option.option, title: option.title, optionText: choiceText(option, data, run),
    before: { ...before }, after: { ...after }, requestedDelta: fullDelta(option.deltas[run.character.pawn]),
    actualDelta: Object.fromEntries(STAT_NAMES.map((name) => [name, after[name] - before[name]])) as Stats,
    bounds: { ...bounds } };
}
export function recordStatChange(run: Run, option: ScenarioOption, after: Stats, data: GameData): StatHistory {
  const history = run.statHistory ?? { version: 1 as const,
    initialStats: Object.keys(run.choices).length === 0 ? { ...run.stats } : null, bounds: currentBounds(), steps: [] };
  return { ...history, steps: [...history.steps,
    makeSnapshot(option, Object.keys(run.choices).length + 1, run.stats, after, currentBounds(), data, run)] };
}

export function getEndingRecap(run: Run, data?: GameData): EndingRecap {
  const ids = cardIds.filter((id) => Object.hasOwn(run.choices, id));
  const history = run.statHistory && hasConsistentStatHistory(run) ? run.statHistory : undefined;
  const recorded = new Map(history?.steps.map((step) => [step.cardId, step]));
  const bounds = history?.bounds ?? currentBounds();
  const storedInitial = history?.initialStats ?? null;
  const assumedInitial = storedInitial ?? initialStats();
  const currentContent = data ? getChoiceHistory(run, data) : [];
  const missing = (id: string, index: number): RecapStep => ({ cardId: id, order: index + 1,
    choice: run.choices[id], title: null, optionText: null, source: 'missing', before: null,
    after: null, requestedDelta: null, actualDelta: null, bounds: null });
  const available: RecapStep[] = ids.map((id, index) => recorded.has(id)
    ? { ...copy(recorded.get(id)!), source: 'recorded' } : missing(id, index));
  const candidate: RecapStep[] = [];
  let current = { ...assumedInitial };
  let contentMissing = false;
  let mismatch = false;
  for (const [index, id] of ids.entries()) {
    const saved = recorded.get(id);
    if (saved) {
      if (!sameStats(current, saved.before)) mismatch = true;
      candidate.push({ ...copy(saved), source: 'recorded' });
      current = { ...saved.after };
      continue;
    }
    const scenario = currentContent.find((entry) => entry.cardId === id)?.scenario;
    if (!scenario || !data) { contentMissing = true; candidate.push(missing(id, index)); continue; }
    const after = applyDelta(current, fullDelta(scenario.deltas[run.character.pawn]), bounds);
    candidate.push({ ...makeSnapshot(scenario, index + 1, current, after, bounds, data, run), source: 'reconstructed' });
    current = after;
  }
  if (!sameStats(current, run.stats)) mismatch = true;
  const hasMissing = available.some((step) => step.source === 'missing');
  const canReconstruct = hasMissing && !contentMissing && !mismatch;
  const steps = canReconstruct ? candidate : available;
  const allRecorded = !hasMissing;
  const status = allRecorded ? 'recorded' : canReconstruct ? 'reconstructed'
    : steps.some((step) => step.source === 'recorded') ? 'partial' : 'unavailable';
  const issues: RecapIssue[] = [];
  if (canReconstruct) {
    issues.push('reconstructed-from-current-data');
    if (!storedInitial) issues.push('legacy-initial-values');
  } else if (hasMissing) {
    issues.push('missing-choice-history');
    if (contentMissing) issues.push('content-unavailable');
    if (mismatch && !contentMissing) issues.push('final-stats-mismatch');
  }
  return { version: 1, round: run.round, character: { ...run.character }, finalStats: { ...run.stats },
    initialStats: storedInitial ? { ...storedInitial } : canReconstruct ? { ...assumedInitial }
      : allRecorded && steps[0]?.before ? { ...steps[0].before } : null,
    bounds: history || canReconstruct ? { ...bounds } : null, status, steps, issues };
}

export function getCareerRecap(career: Career): EndingRecap {
  if (career.recap && isEndingRecap(career.recap) && career.recap.round === career.round
    && career.recap.character.name === career.character.name && career.recap.character.pawn === career.character.pawn) return copy(career.recap);
  return { version: 1, round: career.round, character: { ...career.character }, finalStats: null,
    initialStats: null, bounds: null, status: 'unavailable', steps: [], issues: ['legacy-career-no-stats'] };
}

export function archiveEndingRecap(state: AppState, data: GameData): AppState {
  const run = state.run;
  if (!run || run.phase !== 'ending') return state;
  const index = state.lineage.findIndex((career) => career.round === run.round && career.endingId === run.endingId
    && career.character.name === run.character.name && career.character.pawn === run.character.pawn);
  if (index < 0) return state;
  const career = state.lineage[index];
  // Keep any already archived reconstruction stable when writers later edit CSV text.
  if (career.recap && ['recorded', 'reconstructed'].includes(career.recap.status) && isEndingRecap(career.recap)) return state;
  const recap = getEndingRecap(run, data);
  if (JSON.stringify(career.recap) === JSON.stringify(recap)) return state;
  const lineage = [...state.lineage];
  lineage[index] = { ...career, recap };
  return { ...state, lineage };
}
