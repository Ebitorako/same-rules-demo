import { RULES } from '../config/rules';
import { BOARD } from '../game/board';
import { getChoiceHistory, type ChoiceHistoryEntry } from '../game/history';
import type { AppState, GameData, Run } from '../game/types';
import { storyArt, pawnArt } from './assets';
import { isAutomaticChoice } from './choice-label';
import { button, escape, richText } from './dom';
import { t } from './i18n';

const text = (value: string): string => richText(value.replace(/\r\n?/g, '\n'));

function selectedChoice(entry: ChoiceHistoryEntry, run: Run, data: GameData): string {
  if (!entry.scenario) return `<p class="history-missing">${t('The text for this recorded choice is currently unavailable.')}</p>`;
  if (data.contentVersion) return `<p class="history-chosen-text">${isAutomaticChoice(entry.scenario) ? t('Continue') : text(entry.scenario.optionText)}</p>`;
  if (entry.cardId === RULES.hiring.cardId) {
    const id = run.hiredIntern ?? RULES.hiring.candidates[entry.choice];
    const candidate = data.candidates.find(item => item.id === id);
    return candidate
      ? `<p class="history-chosen-text"><strong>${escape(candidate.name)}</strong></p><p>${text(candidate.blurb)}</p>`
      : `<p class="history-missing">${t('The candidate information for this recorded choice is currently unavailable.')}</p>`;
  }
  const policyId = entry.cardId === RULES.policy.cardId ? RULES.policy.options[entry.choice] : undefined;
  if (policyId) {
    const policy = data.policies.find(item => item.id === policyId);
    return policy
      ? `<p class="history-chosen-text"><strong>${escape(policy.name)}</strong></p><p>${text(entry.scenario.optionText)}</p>`
      : `<p class="history-missing">${t('The policy information for this recorded choice is currently unavailable.')}</p>`;
  }
  return `<p class="history-chosen-text">${text(entry.scenario.optionText)}</p>`;
}

export function choiceHistoryDialog(state: AppState, data: GameData, cardId: string): string {
  const run = state.run;
  if (!run) return '';
  const history = getChoiceHistory(run, data);
  const index = history.findIndex(entry => entry.cardId === cardId);
  if (index < 0) return '';
  const entry = history[index];
  const scenario = entry.scenario;
  const chapter = scenario?.chapter ?? `Ch${BOARD.find(tile => tile.cardId === cardId)!.chapter}`;
  const previous = history[index - 1];
  const next = history[index + 1];
  const director = cardId === 'C1-B' ? run.gatekeeper : null;
  const portrait = scenario ? (director ? pawnArt(director.pawn, 'npc-art') : storyArt(cardId, scenario.npc, scenario.expressions[run.character.pawn])) : '';
  const npc = director?.name ?? (cardId === 'C1-B' ? data.copy.defaultDirector : scenario?.npc);
  return `<div class="sheet-scrim history-scrim"><section class="story-card paper-card history-card" role="dialog" aria-modal="true" aria-labelledby="history-heading" tabindex="-1">
    <header class="history-header"><div><p class="eyebrow">${t('YOUR CHOICES')}</p><p class="history-meta">${t('CHOICE')} ${String(entry.order).padStart(2, '0')} · ${escape(t(chapter))} · ${t('CAREER')} ${run.round}</p></div>${button('Close', 'close-history', 'history-close')}</header>
    <div class="history-content" role="region" aria-label="${t('Recorded scene, choice and result')}" tabindex="0">
      <h2 id="history-heading">${escape(scenario?.title ?? t('Recorded choice'))}</h2>
      ${scenario ? `<div class="history-scene"><div class="portrait-column">${portrait}<span class="npc-label">${escape(t(npc ?? ''))}</span></div><section><h3>${t('The scene')}</h3><p>${text(scenario.scene)}</p></section></div>` : ''}
      <section class="history-selection"><h3>${t('Your choice · Option')} ${escape(isAutomaticChoice(scenario) ? t('Continue') : String(entry.choice))}</h3>${selectedChoice(entry, run, data)}</section>
      ${scenario ? `<section class="history-result"><h3>${t('What followed')}</h3><p>${scenario.results[run.character.pawn].trim() ? text(scenario.results[run.character.pawn]) : `<span class="history-missing">${t('The result text for this recorded choice is currently unavailable.')}</span>`}</p></section>` : ''}
    </div>
    <footer class="history-footer"><p>${t('Reviewing this choice does not change your career.')}</p>${previous || next ? `<nav class="history-navigation" aria-label="${t('Recorded choice navigation')}">${previous ? button('Previous choice', 'review-choice', 'history-previous', `data-card="${escape(previous.cardId)}"`) : ''}${next ? button('Next choice', 'review-choice', 'history-next', `data-card="${escape(next.cardId)}"`) : ''}</nav>` : ''}</footer>
  </section></div>`;
}
