import { BOARD } from '../game/board';
import type { AppState, GameData } from '../game/types';
import { art, pawnArt } from './assets';
import { button, escape } from './dom';

const bossKeys: Record<string, string> = { 'C1-B': 'gatekeeper', 'C2-B': 'old_boys_network', 'C3-B': 'ideal_worker', 'C4-B': 'the_system' };
const bossMetals: Record<string, string> = { 'C1-B': 'red', 'C2-B': 'green', 'C3-B': 'blue', 'C4-B': 'purple' };
export function boardScreen(state: AppState, data: GameData): string {
  const run = state.run!;
  const selected = Object.keys(run.choices).length;
  const chosenCards = Object.keys(run.choices).slice(-8).map((id,index) => {
    const title = data.scenarios.find(row => row.cardId === id)?.title ?? 'Chosen card';
    return `<span title="${escape(title)}" aria-label="${escape(title)}">${String(Math.max(0,selected-8)+index+1).padStart(2,'0')}</span>`;
  }).join('') || '<i>Waiting for your first card</i>';
  return `<section class="game-screen"><div class="career-strip"><div><span class="eyebrow">CAREER ${String(run.round).padStart(2,'0')}</span><h1>${escape(run.character.name)} <span>/ ${run.reachedDirector ? 'Creative Director' : 'New Hire'}</span></h1></div><span class="career-count">${String(selected).padStart(2,'0')} / 20 CARDS</span></div>
    <div class="board" role="group" aria-label="Career board, 22 spaces">${BOARD.map((tile,index) => {
      const walked = run.visited.includes(index);
      const here = run.position === index;
      const startHidden = tile.kind === 'start' && (run.position !== 0 || run.visited.length > 1);
      const special = tile.kind === 'director' || (tile.kind === 'start' && !startHidden);
      const metal = tile.kind === 'boss' ? bossMetals[tile.cardId!] : tile.kind === 'start' ? 'gold' : tile.kind === 'director' ? 'silver' : '';
      const metalVisited = Boolean(metal) && walked && tile.kind !== 'start';
      let inner = `<span class="tile-question" aria-hidden="true">?</span><span class="tile-index">${String(index).padStart(2,'0')}</span>`;
      if (tile.kind === 'boss') inner = `${tile.cardId === 'C1-B' && run.gatekeeper ? pawnArt(run.gatekeeper.pawn, 'boss-art') : art(`bosses/${bossKeys[tile.cardId!]}`, tile.label, 'boss-art')}<span class="boss-name">${tile.cardId === 'C1-B' && run.gatekeeper ? escape(run.gatekeeper.name) : escape(tile.label)}</span>`;
      else if (special) inner = `<span class="special-symbol">${tile.kind === 'start' ? '→' : '☆'}</span><span class="special-name">${tile.kind === 'start' ? 'START<br>NEW HIRE' : 'CREATIVE<br>DIRECTOR'}</span>`;
      else if (walked && tile.kind !== 'start') inner = `<span class="tile-number">${String(index).padStart(2,'0')}</span><span class="walked-mark">CHAPTER ${tile.chapter}</span>`;
      return `<div data-tile="${index}" class="tile ${tile.kind} ${walked && !startHidden && !special ? `walked ${metal ? '' : `lit-${index % 3 + 1}`}` : ''} ${special ? 'special' : ''} ${metal ? `metal-tile metal-${metal}` : ''} ${metalVisited ? 'metal-visited' : ''} ${here ? 'current' : ''}" style="grid-row:${tile.row};grid-column:${tile.col}" ${here ? 'aria-current="location"' : ''} aria-label="${escape(tile.label)}${here ? ', current position' : ''}${walked ? ', visited' : ''}">${inner}${metalVisited ? '<span class="tile-visit-mark" aria-hidden="true">✓</span>' : ''}${here ? `<div class="board-pawn">${pawnArt(run.character.pawn)}<span class="you-label">YOU</span></div>` : ''}</div>`;
    }).join('')}
    <div class="board-centre"><div class="centre-topline"><span>THE STUDIO</span><span>EST. EVERY DAY</span></div><h2>${escape(data.copy.title)}</h2><p class="centre-subtitle">THE CREATIVE CAREER GAME</p><div class="deck-row">${[1,2,3].map(n=>`<div class="deck" aria-label="Face-down card pile ${n}">${art('cards/card_back','card back','deck-art')}<span class="deck-question" aria-hidden="true">?</span></div>`).join('')}</div><div class="chosen-pile"><span>YOUR CHOICES</span><div class="chosen-cards">${chosenCards}</div></div><div class="board-next">${button('Next', 'advance', 'primary', 'data-enter="true"')}<span>ONE STEP FORWARD</span></div><p class="keyboard-note">ENTER · NEXT &nbsp; / &nbsp; 1 2 3 · CHOOSE</p></div>
    </div><p class="board-footer">Progress is saved in this browser after every choice.</p></section>`;
}
