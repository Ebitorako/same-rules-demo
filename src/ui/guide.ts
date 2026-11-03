import { BOARD } from '../game/board';
import { RULES } from '../config/rules';
import { getChapterIntro, getOptions } from '../game/state';
import type { AppState, GameData } from '../game/types';
import type { GuideData, GuideNote } from '../data/guide';
import { art } from './assets';
import { escape, richText } from './dom';
import { getLocale, t } from './i18n';

export function currentGuideNote(state: AppState, data: GameData, guide: GuideData): GuideNote {
  const run = state.run;
  const general = guide.notes.find(note => note.cardId === 'GENERAL')!;
  const card = run?.phase === 'card' ? getOptions(run, data)[0] : undefined;
  const chapter = run && ['intro', 'chapter', 'promotion'].includes(run.phase) ? getChapterIntro(run, data) : null;
  if (data.contentVersion && (card || chapter)) {
    const context = card ?? chapter!;
    return { cardId: card?.cardId ?? chapter!.id, advice: context.guideAdvice || general.advice,
      background: context.background, theory: '', reference: context.reference, notes: '' };
  }
  const id = run?.phase === 'promotion' ? 'PROMOTION' : card?.cardId ?? 'GENERAL';
  const note = guide.notes.find(entry => entry.cardId === id);
  const usesSceneContext = Boolean(card && !note?.background && !note?.theory);
  return {
    cardId: id,
    advice: note?.advice || general.advice,
    background: note?.background || (usesSceneContext ? card?.background : '') || (id === 'GENERAL' ? general.background : '') || '',
    theory: note?.theory || '',
    reference: note?.reference || (usesSceneContext ? card?.reference : '') || '',
    notes: '',
  };
}

export function guidePanel(state: AppState, data: GameData, guide: GuideData, id: string): string {
  const hidden = Boolean(state.settings.guideHidden);
  const note = currentGuideNote(state, data, guide);
  const beforeChoice = state.run?.phase === 'card' && Boolean(BOARD[state.run.position].cardId);
  const tired = state.run && state.run.phase !== 'ending' && state.run.stats.Energy <= RULES.lowEnergyWarning;
  const chapterOpening = state.run && ['intro', 'chapter', 'promotion'].includes(state.run.phase);
  const energyReminder = chapterOpening ? guide.energyReminder?.[getLocale()] : undefined;
  const detail = !hidden && (note.background || note.theory || note.reference)
    ? `<details class="guide-context"><summary>${t('Open the rulebook')}</summary>${note.background ? `<h4>${t('Industry context')}</h4><p>${richText(t(note.background))}</p>` : ''}${note.theory ? `<h4>${t('Theory')}</h4><p>${richText(t(note.theory))}</p>` : ''}${note.reference ? `<h4>${t('References')}</h4><p class="guide-reference">${richText(note.reference)}</p>` : ''}</details>` : '';
  return `<aside class="guide-panel ${hidden ? 'guide-is-hidden' : ''}" aria-labelledby="${id}-heading">
    <div class="guide-identity">${art(guide.portrait, guide.name, 'guide-art')}<div><p class="guide-kicker">${t('THE RULEBOOK')}</p><h3 id="${id}-heading">${escape(t(guide.name))}</h3><p class="guide-role">${escape(t(guide.role))}</p></div></div>
    ${energyReminder ? `<p class="guide-energy-reminder">${richText(energyReminder)}</p>` : ''}
    <button type="button" class="guide-toggle" data-action="toggle-guide" aria-expanded="${!hidden}" aria-controls="${id}-body">${t(hidden ? 'Ask the guide' : 'Hide advice')}</button>
    ${tired && data.copy.lowEnergyAdvice ? `<p class="guide-fatigue" role="status">${richText(data.copy.lowEnergyAdvice)}</p>` : ''}
    <div id="${id}-body" ${hidden ? 'hidden' : ''}>${hidden ? '' : `<p class="guide-timing">${t(beforeChoice ? 'BEFORE YOU CHOOSE' : 'BESIDE THE BOARD')}</p><p class="guide-advice">${richText(t(note.advice))}</p>${detail}<p class="guide-choice">${t('Advice is optional. The choice is yours.')}</p>`}</div>
  </aside>`;
}
