import { BOARD } from '../game/board';
import { getChapterIntro, getOptionAvailability, getOptions } from '../game/state';
import type { AppState, GameData } from '../game/types';
import { pawnArt, storyArt } from './assets';
import { button, escape, richText } from './dom';

export function scenarioDialog(state: AppState, data: GameData, guide = '', unavailableOption: number | null = null): string {
  const run = state.run!;
  if (run.phase === 'promotion' || run.phase === 'chapter') {
    const chapter = getChapterIntro(run, data);
    return `<div class="sheet-scrim"><section class="story-card promotion paper-card" role="dialog" aria-modal="true" aria-labelledby="card-heading" tabindex="-1"><p class="eyebrow">CHAPTER ${String(chapter?.chapter ?? 4).padStart(2, '0')}</p>${run.phase === 'promotion' ? '<span class="promotion-star">☆</span>' : ''}<h2 id="card-heading">${escape(chapter?.title ?? data.copy.promotionTitle)}</h2><p>${richText(chapter?.scene ?? data.copy.promotionText)}</p>${guide}${button('Continue', 'advance', 'primary', 'data-enter="true"')}</section></div>`;
  }
  const options = getOptions(run, data);
  const card = run.phase === 'result' ? run.chosenScenarios?.[run.result!.cardId] ?? options[0] : options[0];
  const current = card ?? data.scenarios.find(row => row.cardId === BOARD[run.position].cardId)!;
  const isResult = run.phase === 'result';
  const expression = isResult ? run.result!.expression : 'neutral';
  const isGatekeeper = current.cardId === 'C1-B';
  const npc = isGatekeeper ? run.gatekeeper?.name ?? current.npc : current.npc;
  const image = isGatekeeper && run.gatekeeper ? pawnArt(run.gatekeeper.pawn, 'npc-art') : storyArt(current.cardId, current.npc, expression);
  const directorLine = isGatekeeper && run.gatekeeper ? `<p class="returning-director">${escape(data.copy.gatekeeperReturning.replaceAll('{name}', run.gatekeeper.name))}</p>` : '';
  const keys = options.length === 1 && options[0].optionLabel === 'Continue' ? 'ENTER' : options.map(option => option.optionLabel === 'D' ? '4 / D' : option.option).join(' / ');
  return `<div class="sheet-scrim"><section class="story-card paper-card ${isResult ? 'result-card' : guide ? 'with-guide' : ''}" role="dialog" aria-modal="true" aria-labelledby="card-heading" tabindex="-1"><div class="card-meta"><span>${escape(current.chapter)} / ${current.type === 'boss' ? 'AT THE THRESHOLD' : 'IN THE STUDIO'}</span><span>CAREER ${String(run.round).padStart(2, '0')}</span></div><div class="story-body"><div class="portrait-column">${image}<span class="npc-label">${escape(npc)}</span></div><div class="story-copy"><p class="eyebrow">${isResult ? 'YOUR CHOICE HAS BEEN MADE' : 'MAKE YOUR NEXT MOVE'}</p><h2 id="card-heading">${escape(current.title)}</h2><p class="scene-text">${richText(isResult ? run.result!.text : current.scene)}</p>${!isResult ? directorLine : ''}${isResult || !current.background ? '' : `<details class="background-note"><summary>Why does this happen?</summary><p>${richText(current.background)}</p></details>`}</div></div>
    ${!isResult && guide ? `<div class="decision-layout">${guide}<div class="decision-choices">` : ''}${isResult ? `<div class="result-actions">${button('Continue', 'advance', 'primary', 'data-enter="true"')}<span>ENTER TO CONTINUE</span></div>` : `<div class="options">${options.map(option => {
      const availability = getOptionAvailability(run, option);
      const automatic = option.optionLabel === 'Continue' || option.optionLabel === '自动';
      const label = automatic ? '→' : option.optionLabel ?? String(option.option);
      return `<div class="option-wrap"><button type="button" class="option ${availability.enabled ? '' : 'option-unavailable'}" data-action="${availability.enabled ? 'choose' : 'unavailable'}" data-option="${option.option}" ${availability.enabled ? '' : 'disabled aria-disabled="true"'} ${options.length === 1 && availability.enabled ? 'data-enter="true"' : ''}><span class="option-number">${escape(label)}</span><span>${automatic ? 'Continue' : richText(option.optionText)}${availability.enabled ? '' : '<small class="option-lock-label">Not available</small>'}</span><span class="option-arrow" aria-hidden="true">${availability.enabled ? '→' : '—'}</span></button>${!availability.enabled && availability.reason ? `<button type="button" class="text-button option-thoughts" data-action="unavailable" data-option="${option.option}">Read your thoughts about option ${escape(label)}</button>` : ''}${!availability.enabled && availability.reason && unavailableOption === option.option ? `<div class="unavailable-note" role="status" tabindex="-1"><p>${richText(availability.reason)}</p>${button('Close', 'close-unavailable', 'text-button')}</div>` : ''}</div>`;
    }).join('')}</div>`}
    ${!isResult && guide ? '</div></div>' : ''}<div class="card-bottom"><span>NO TAKE-BACKS. JUST THE NEXT STEP.</span><span>${isResult ? 'CHOICE RECORDED' : `KEYS ${escape(keys)}`}</span></div></section></div>`;
}
