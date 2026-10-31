import { RULES } from '../config/rules';
import { BOARD } from '../game/board';
import { getChoiceHistory, type ChoiceHistoryEntry } from '../game/history';
import type { AppState, GameData, Run } from '../game/types';
import { npcArt, pawnArt } from './assets';
import { button, escape, richText } from './dom';

const text = (value: string): string => richText(value.replace(/\r\n?/g, '\n'));

function selectedChoice(entry: ChoiceHistoryEntry, run: Run, data: GameData): string {
  if (!entry.scenario) return '<p class="history-missing">The text for this recorded choice is currently unavailable.</p>';
  if (entry.cardId === RULES.hiring.cardId) {
    const id = run.hiredIntern ?? RULES.hiring.candidates[entry.choice];
    const candidate = data.candidates.find(item => item.id === id);
    return candidate
      ? `<p class="history-chosen-text"><strong>${escape(candidate.name)}</strong></p><p>${text(candidate.blurb)}</p>`
      : '<p class="history-missing">The candidate information for this recorded choice is currently unavailable.</p>';
  }
  const policyId = entry.cardId === RULES.policy.cardId ? RULES.policy.options[entry.choice] : undefined;
  if (policyId) {
    const policy = data.policies.find(item => item.id === policyId);
    return policy
      ? `<p class="history-chosen-text"><strong>${escape(policy.name)}</strong></p><p>${text(entry.scenario.optionText)}</p>`
      : '<p class="history-missing">The policy information for this recorded choice is currently unavailable.</p>';
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
  const portrait = scenario ? (director ? pawnArt(director.pawn, 'npc-art') : npcArt(scenario.npc, scenario.expressions[run.character.pawn])) : '';
  const npc = director?.name ?? (cardId === 'C1-B' ? data.copy.defaultDirector : scenario?.npc);
  return `<div class="sheet-scrim history-scrim"><section class="story-card paper-card history-card" role="dialog" aria-modal="true" aria-labelledby="history-heading" tabindex="-1">
    <header class="history-header"><div><p class="eyebrow">YOUR CHOICES</p><p class="history-meta">CHOICE ${String(entry.order).padStart(2, '0')} · ${escape(chapter)} · CAREER ${run.round}</p></div>${button('Close', 'close-history', 'history-close')}</header>
    <div class="history-content" role="region" aria-label="Recorded scene, choice and result" tabindex="0">
      <h2 id="history-heading">${escape(scenario?.title ?? 'Recorded choice')}</h2>
      ${scenario ? `<div class="history-scene"><div class="portrait-column">${portrait}<span class="npc-label">${escape(npc)}</span></div><section><h3>The scene</h3><p>${text(scenario.scene)}</p></section></div>` : ''}
      <section class="history-selection"><h3>Your choice · Option ${entry.choice}</h3>${selectedChoice(entry, run, data)}</section>
      ${scenario ? `<section class="history-result"><h3>What followed</h3><p>${scenario.results[run.character.pawn].trim() ? text(scenario.results[run.character.pawn]) : '<span class="history-missing">The result text for this recorded choice is currently unavailable.</span>'}</p></section>` : ''}
    </div>
    <footer class="history-footer"><p>Reviewing this choice does not change your career.</p>${previous || next ? `<nav class="history-navigation" aria-label="Recorded choice navigation">${previous ? button('Previous choice', 'review-choice', 'history-previous', `data-card="${escape(previous.cardId)}"`) : ''}${next ? button('Next choice', 'review-choice', 'history-next', `data-card="${escape(next.cardId)}"`) : ''}</nav>` : ''}</footer>
  </section></div>`;
}
