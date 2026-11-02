import { BOARD } from '../game/board';
import { getChoiceHistory } from '../game/history';
import type { AppState, GameData } from '../game/types';
import { art, pawnArt } from './assets';
import { button, escape } from './dom';
import { t, tf } from './i18n';

const bossKeys: Record<string, string> = { 'C1-B': 'gatekeeper', 'C2-B': 'old_boys_network', 'C3-B': 'ideal_worker', 'C4-B': 'the_system' };
const bossMetals: Record<string, string> = { 'C1-B': 'red', 'C2-B': 'green', 'C3-B': 'blue', 'C4-B': 'purple' };
export function boardScreen(state: AppState, data: GameData): string {
  const run = state.run!;
  const selected = Object.keys(run.choices).length;
  const role = run.reachedDirector ? 'Creative Director' : typeof run.flags?.role === 'string' ? run.flags.role.replaceAll('_', ' ').replace(/\b[a-z]/g, letter => letter.toUpperCase()) : 'New Hire';
  const history = getChoiceHistory(run, data);
  const chosenCards = history.map(entry => {
    const title = entry.scenario?.title ?? 'Recorded choice';
    const number = String(entry.order).padStart(2,'0');
    const metal = bossMetals[entry.cardId];
    return `<button type="button" class="chosen-card${metal ? ` chosen-boss metal-${metal}` : ''}" style="--card-order:${entry.order}" data-action="review-choice" data-card="${escape(entry.cardId)}" ${metal ? '' : `title="${escape(title)}"`} aria-label="${escape(tf('Review choice {number}: {title}', { number: entry.order, title }))}" aria-haspopup="dialog">${metal ? '' : `<span class="chosen-number" aria-hidden="true">${number}</span>`}</button>`;
  }).join('') || `<i>${t('Waiting for your first card')}</i>`;
  return `<section class="game-screen"><div class="career-strip"><div><span class="eyebrow">${t('CAREER')} ${String(run.round).padStart(2,'0')}</span><h1>${escape(run.character.name)} <span>/ ${escape(t(role))}</span></h1></div><span class="career-count">${String(selected).padStart(2,'0')} / 20 ${t('CARDS')}</span></div>
    <div class="board" role="group" aria-label="${t('Career board, 22 spaces')}">${BOARD.map((tile,index) => {
      const walked = run.visited.includes(index);
      const here = run.position === index;
      const startHidden = tile.kind === 'start' && (run.position !== 0 || run.visited.length > 1);
      const special = tile.kind === 'director' || (tile.kind === 'start' && !startHidden);
      const metal = tile.kind === 'boss' ? bossMetals[tile.cardId!] : tile.kind === 'start' ? 'gold' : tile.kind === 'director' ? 'silver' : '';
      const metalVisited = Boolean(metal) && walked && tile.kind !== 'start';
      let inner = `<span class="tile-question" aria-hidden="true">?</span><span class="tile-index">${String(index).padStart(2,'0')}</span>`;
      if (tile.kind === 'boss') inner = `${tile.cardId === 'C1-B' && run.gatekeeper ? pawnArt(run.gatekeeper.pawn, 'boss-art') : art(`bosses/${bossKeys[tile.cardId!]}`, tile.label, 'boss-art')}<span class="boss-name">${tile.cardId === 'C1-B' && run.gatekeeper ? escape(run.gatekeeper.name) : escape(t(tile.label))}</span>`;
      else if (special) inner = `<span class="special-symbol">${tile.kind === 'start' ? '→' : '☆'}</span><span class="special-name">${tile.kind === 'start' ? `${t('START')}<br>${t('NEW HIRE')}` : t('CREATIVE<br>DIRECTOR', '创意总监')}</span>`;
      else if (walked && tile.kind !== 'start') inner = `<span class="tile-number">${String(index).padStart(2,'0')}</span><span class="walked-mark">${t('CHAPTER')} ${tile.chapter}</span>`;
      return `<div data-tile="${index}" class="tile ${tile.kind} ${walked && !startHidden && !special ? 'walked' : ''} ${special ? 'special' : ''} ${metal ? `metal-tile metal-${metal}` : ''} ${metalVisited ? 'metal-visited' : ''} ${here ? 'current' : ''}" style="grid-row:${tile.row};grid-column:${tile.col}" ${here ? 'aria-current="location"' : ''} aria-label="${escape(t(tile.label))}${here ? t(', current position') : ''}${walked ? t(', visited') : ''}">${inner}${metalVisited ? '<span class="tile-visit-mark" aria-hidden="true">✓</span>' : ''}${here ? `<div class="board-pawn">${pawnArt(run.character.pawn)}<span class="you-label">${t('YOU')}</span></div>` : ''}</div>`;
    }).join('')}
    <div class="board-centre"><div class="centre-topline"><span>${t('THE STUDIO')}</span><span>${t('EST. EVERY DAY')}</span></div><h2>${escape(data.copy.companyName)}</h2><p class="centre-subtitle">${t('THE CREATIVE CAREER GAME')}</p><div class="deck-row">${[1,2,3].map(n=>`<div class="deck" aria-label="${tf('Face-down card pile {number}', { number: n })}">${art('cards/card_back','card back','deck-art')}<span class="deck-question" aria-hidden="true">?</span></div>`).join('')}</div><div class="chosen-pile"><span>${t('YOUR CHOICES')}</span><div class="chosen-cards" style="--choice-gaps:${Math.max(1, history.length - 1)}" role="group" aria-label="${t('Your recorded choices')}">${chosenCards}</div></div><div class="board-next">${button('Next', 'advance', 'primary', 'data-enter="true"')}<span>${t('ONE STEP FORWARD')}</span></div><p class="keyboard-note">${t('ENTER · NEXT')} &nbsp; / &nbsp; ${t('NUMBER KEYS · CHOOSE')}</p></div>
    </div><p class="board-footer">${t('Progress is saved in this browser after every choice.')}</p></section>`;
}
