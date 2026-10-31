import { BOARD } from '../game/board';
import { RULES } from '../config/rules';
import { getOptions } from '../game/state';
import type { AppState, GameData } from '../game/types';
import { npcArt, pawnArt } from './assets';
import { button, escape, richText } from './dom';

export function scenarioDialog(state: AppState, data: GameData, guide = ''): string {
  const run = state.run!;
  if (run.phase === 'promotion') return `<div class="sheet-scrim"><section class="story-card promotion paper-card" role="dialog" aria-modal="true" aria-labelledby="card-heading" tabindex="-1"><p class="eyebrow">CHAPTER 04 · THE OTHER SIDE OF THE TABLE</p><span class="promotion-star">☆</span><h2 id="card-heading">${escape(data.copy.promotionTitle)}</h2><p>${richText(data.copy.promotionText)}</p>${guide}${button('Continue', 'advance', 'primary', 'data-enter="true"')}</section></div>`;
  const options = getOptions(run, data);
  const card = options[0] ?? data.scenarios.find(row=>row.cardId === BOARD[run.position].cardId)!;
  const isResult = run.phase === 'result';
  const expression = isResult ? run.result!.expression : 'neutral';
  const isGatekeeper = card.cardId === 'C1-B';
  const npc = isGatekeeper ? run.gatekeeper?.name ?? data.copy.defaultDirector : card.npc;
  const image = isGatekeeper && run.gatekeeper ? pawnArt(run.gatekeeper.pawn,'npc-art') : npcArt(card.npc, expression);
  const directorLine = isGatekeeper && run.gatekeeper ? `<p class="returning-director">${escape(data.copy.gatekeeperReturning.replaceAll('{name}',run.gatekeeper.name))} ${escape(run.activePolicies.includes('formal_recruitment') ? data.copy.gatekeeperFormal : data.copy.gatekeeperUnchanged)}</p>` : '';
  return `<div class="sheet-scrim"><section class="story-card paper-card ${isResult ? 'result-card' : guide ? 'with-guide' : ''}" role="dialog" aria-modal="true" aria-labelledby="card-heading" tabindex="-1"><div class="card-meta"><span>${escape(card.chapter)} / ${card.type === 'boss' ? 'AT THE THRESHOLD' : 'IN THE STUDIO'}</span><span>CAREER ${String(run.round).padStart(2,'0')}</span></div><div class="story-body"><div class="portrait-column">${image}<span class="npc-label">${escape(npc)}</span></div><div class="story-copy"><p class="eyebrow">${isResult ? 'YOUR CHOICE HAS BEEN MADE' : 'MAKE YOUR NEXT MOVE'}</p><h2 id="card-heading">${escape(card.title)}</h2><p class="scene-text">${richText(isResult ? run.result!.text : card.scene)}</p>${!isResult ? directorLine : ''}${isResult ? '' : `<details class="background-note"><summary>Why does this happen?</summary><p>${richText(card.background)}</p></details>`}</div></div>
    ${!isResult && guide ? `<div class="decision-layout">${guide}<div class="decision-choices">` : ''}${isResult ? `<div class="result-actions">${button('Continue', 'advance', 'primary','data-enter="true"')}<span>ENTER TO CONTINUE</span></div>` : `${card.cardId === RULES.policy.cardId ? `<p class="policy-budget">${Math.min(data.powerTokens,RULES.powerTokens)} POWER TOKEN · CHOOSE ONCE</p>` : ''}<div class="options">${options.map(option=> {
      const candidate = card.cardId === RULES.hiring.cardId ? data.candidates.find(candidate => candidate.id === RULES.hiring.candidates[option.option]) : null;
      const policy = card.cardId === RULES.policy.cardId ? data.policies.find(policy => policy.id === RULES.policy.options[option.option]) : null;
      return `<button type="button" class="option" data-action="choose" data-option="${option.option}"><span class="option-number">${option.option}</span><span>${candidate ? `<strong>${escape(candidate.name)}</strong><span class="candidate-pawn">${candidate.pawn === 'female' ? '♀' : '♂'}</span><small>${escape(candidate.blurb)}</small><small>${Object.entries(candidate.stats).map(([stat,value])=>`${escape(stat)} ${value}`).join(' · ')}</small>` : `${escape(option.optionText)}${policy ? `<small>${escape(policy.name)} · ${RULES.policy.tokenCost} token</small><small>${escape(policy.benefit)} ${escape(policy.cost)}</small>` : ''}`}</span><span class="option-arrow" aria-hidden="true">→</span></button>`;
    }).join('')}</div>`}
    ${!isResult && guide ? '</div></div>' : ''}<div class="card-bottom"><span>NO TAKE-BACKS. JUST THE NEXT STEP.</span><span>${isResult ? 'CHOICE RECORDED' : 'KEYS 1 / 2 / 3'}</span></div></section></div>`;
}
