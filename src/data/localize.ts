import type { AppState, ChapterOpening, CopyData, Ending, GameData, Locale, RecapStep,
  Run, ScenarioOption, StatChangeSnapshot, StoryEffect } from '../game/types';
import type { GuideData } from './guide';

export type { Locale } from '../game/types';
export interface TranslationCatalog {
  locale: 'zh-CN';
  translations: Record<string, string>;
  source?: { spreadsheetId?: string; url?: string; retrievedDate?: string };
  warnings?: string[];
}

export function parseTranslationCatalog(text: string): TranslationCatalog {
  let value: unknown;
  try { value = JSON.parse(text); }
  catch { throw new Error('zh-CN.json 格式无效。'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('中文文本目录应为对象。');
  const catalog = value as TranslationCatalog;
  if (catalog.locale !== 'zh-CN' || !catalog.translations || typeof catalog.translations !== 'object'
    || Array.isArray(catalog.translations)
    || Object.entries(catalog.translations).some(([key, translation]) => !key || typeof translation !== 'string')
    || (catalog.warnings !== undefined && (!Array.isArray(catalog.warnings)
      || catalog.warnings.some(warning => typeof warning !== 'string')))) throw new Error('中文文本目录缺少有效的 translations。');
  return catalog;
}

// Exact text matching preserves saved wording when it has no corresponding translation.
// Never substitute inside identifiers, conditions or an older, differently authored passage.
export function localizeText(text: string, catalog: TranslationCatalog, locale: Locale): string {
  return locale === 'zh-CN' && Object.hasOwn(catalog.translations, text) ? catalog.translations[text] : text;
}

type Translate = (text: string) => string;
function mapTextRecord(record: Partial<Record<string, string>> | undefined, translate: Translate): void {
  if (!record) return;
  for (const key of Object.keys(record)) if (typeof record[key] === 'string') record[key] = translate(record[key]!);
}
function effectText(effects: StoryEffect[] | undefined, translate: Translate): void {
  for (const effect of effects ?? []) mapTextRecord(effect.resultText, translate);
}
function scenarioText(row: ScenarioOption, translate: Translate): void {
  for (const key of ['title', 'scene', 'background', 'optionText', 'reference', 'notes'] as const) row[key] = translate(row[key]);
  if (row.guideAdvice !== undefined) row.guideAdvice = translate(row.guideAdvice);
  mapTextRecord(row.results, translate);
  mapTextRecord(row.unavailableText, translate);
  effectText(row.effects, translate);
}
function endingText(ending: Ending, translate: Translate): void {
  for (const key of ['name', 'front', 'back', 'reference', 'triggerNote', 'nextRoundNote', 'artNote', 'notes'] as const) ending[key] = translate(ending[key]);
  if (ending.guideAdvice !== undefined) ending.guideAdvice = translate(ending.guideAdvice);
  mapTextRecord(ending.frontByPawn, translate);
}
function chapterText(chapter: ChapterOpening, translate: Translate): void {
  for (const key of ['title', 'scene', 'background', 'reference', 'guideAdvice'] as const) chapter[key] = translate(chapter[key]);
  if (chapter.recapText !== undefined) chapter.recapText = translate(chapter.recapText);
  effectText(chapter.effects, translate);
}
function copyText(copy: CopyData, translate: Translate): void {
  for (const key of ['subtitle', 'introduction', 'promotionTitle', 'promotionText', 'gatekeeperReturning',
    'gatekeeperFormal', 'gatekeeperUnchanged', 'placeholderNotice'] as const) copy[key] = translate(copy[key]);
  if (copy.lowEnergyAdvice !== undefined) copy.lowEnergyAdvice = translate(copy.lowEnergyAdvice);
  mapTextRecord(copy.statDescriptions, translate);
}
function stepText(step: StatChangeSnapshot | RecapStep, translate: Translate): void {
  if (step.title !== null) step.title = translate(step.title);
  if (step.optionText !== null) step.optionText = translate(step.optionText);
  if (step.resultText !== undefined) step.resultText = translate(step.resultText);
}
function runText(run: Run, translate: Translate): void {
  if (run.result) run.result.text = translate(run.result.text);
  for (const row of Object.values(run.chosenScenarios ?? {})) scenarioText(row, translate);
  for (const step of run.statHistory?.steps ?? []) stepText(step, translate);
}

/** Display projection only. Decisions and persistence must continue using canonical data. */
export function localizeData(data: GameData, catalog: TranslationCatalog, locale: Locale): GameData {
  if (locale === 'en') return data;
  const result = structuredClone(data);
  const translate = (text: string) => localizeText(text, catalog, locale);
  result.scenarios.forEach(row => scenarioText(row, translate));
  result.endings.forEach(ending => endingText(ending, translate));
  result.milestones?.forEach(ending => endingText(ending, translate));
  result.chapters?.forEach(chapter => chapterText(chapter, translate));
  if (result.epilogue) endingText(result.epilogue, translate);
  result.candidates.forEach(candidate => { candidate.blurb = translate(candidate.blurb); });
  result.policies.forEach(policy => {
    for (const key of ['name', 'benefit', 'cost', 'nextRoundEffect'] as const) policy[key] = translate(policy[key]);
  });
  copyText(result.copy, translate);
  // Earlier prototype stories have different meanings and no paired Chinese source.
  return result;
}

/** Translate frozen text, never reconstruct a past branch or alter its recorded numbers. */
export function localizeState(state: AppState, catalog: TranslationCatalog, locale: Locale): AppState {
  if (locale === 'en') return state;
  const result = structuredClone(state);
  const translate = (text: string) => localizeText(text, catalog, locale);
  if (result.run) runText(result.run, translate);
  for (const career of result.lineage) for (const step of career.recap?.steps ?? []) stepText(step, translate);
  return result;
}

export function localizeGuide(guide: GuideData, catalog: TranslationCatalog, locale: Locale): GuideData {
  if (locale === 'en') return guide;
  const result = structuredClone(guide);
  const translate = (text: string) => localizeText(text, catalog, locale);
  result.name = translate(result.name);
  result.role = translate(result.role);
  result.notes.forEach(note => {
    for (const key of ['advice', 'background', 'theory', 'reference', 'notes'] as const) note[key] = translate(note[key]);
  });
  return result;
}
