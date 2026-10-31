import { BOARD } from '../game/board';
import { getOptions } from '../game/state';
import type { AppState, GameData } from '../game/types';
import type { GuideData, GuideNote } from '../data/guide';
import { art } from './assets';
import { escape, richText } from './dom';

export function currentGuideNote(state: AppState, data: GameData, guide: GuideData): GuideNote {
  const run = state.run;
  const general = guide.notes.find(note => note.cardId === 'GENERAL')!;
  const card = run?.phase === 'card' ? getOptions(run, data)[0] : undefined;
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
  const detail = !hidden && (note.background || note.theory || note.reference)
    ? `<details class="guide-context"><summary>Open the rulebook</summary>${note.background ? `<h4>Industry context</h4><p>${richText(note.background)}</p>` : ''}${note.theory ? `<h4>Theory</h4><p>${richText(note.theory)}</p>` : ''}${note.reference ? `<h4>References</h4><p class="guide-reference">${richText(note.reference)}</p>` : ''}</details>` : '';
  return `<aside class="guide-panel ${hidden ? 'guide-is-hidden' : ''}" aria-labelledby="${id}-heading">
    <div class="guide-identity">${art(guide.portrait, guide.name, 'guide-art')}<div><p class="guide-kicker">THE RULEBOOK</p><h3 id="${id}-heading">${escape(guide.name)}</h3><p class="guide-role">${escape(guide.role)}</p></div></div>
    <button type="button" class="guide-toggle" data-action="toggle-guide" aria-expanded="${!hidden}" aria-controls="${id}-body">${hidden ? 'Ask the guide' : 'Hide advice'}</button>
    <div id="${id}-body" ${hidden ? 'hidden' : ''}>${hidden ? '' : `<p class="guide-timing">${beforeChoice ? 'BEFORE YOU CHOOSE' : 'BESIDE THE BOARD'}</p><p class="guide-advice">${richText(note.advice)}</p>${detail}<p class="guide-choice">Advice is optional. The choice is yours.</p>`}</div>
  </aside>`;
}
