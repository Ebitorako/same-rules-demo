import type { AppState, GameData, Ending } from '../game/types';
import { art } from './assets';
import { button, escape, richText } from './dom';

function endingFace(ending: Ending, back: boolean): string {
  if (!back) return `${art(`cards/ending_${ending.id}`,`ending ${ending.id}`,'ending-art')}<p class="eyebrow">${escape(ending.id)} / A CAREER REMEMBERED</p><h2>${escape(ending.name)}</h2><p>${richText(ending.front)}</p>`;
  const text = (value: string) => richText(value.replace(/\r\n?/g, '\n'));
  return `<p class="eyebrow">BEHIND THE CAREER</p><h2>${escape(ending.name)}</h2>
    <div class="ending-reading-scroll" role="region" tabindex="0" aria-label="${escape(`Theory and references for ${ending.name}`)}">
      <section class="ending-reading-section"><h3>Theory</h3><p class="ending-theory">${text(ending.back)}</p></section>
      <section class="ending-reading-section ending-references"><h3>References</h3>${ending.reference.trim()
        ? `<p class="ending-reference-text">${text(ending.reference)}</p>`
        : '<p class="ending-empty-note">References have not been added to this card yet.</p>'}</section>
    </div>`;
}
export function endingScreen(state: AppState, data: GameData, back: boolean): string {
  const ending = data.endings.find(ending=>ending.id===state.run!.endingId)!;
  return `<section class="ending-screen"><p class="eyebrow">CAREER ${state.run!.round} / ${escape(state.run!.character.name)}</p><article class="ending-card paper-card ${back ? 'back-face' : ''}" aria-live="polite">${endingFace(ending,back)}${button(back ? 'See the front' : 'Turn the card over', 'flip-ending','text-button')}</article><div class="ending-actions">${button('Gallery','gallery')}${button('Next career','next-career','primary')}</div><p class="keyboard-note">THIS CAREER IS NOW PART OF THE STUDIO.</p></section>`;
}
export function galleryScreen(state: AppState, data: GameData, flipped: Set<string>): string {
  const unlocked = new Set(state.gallery.map(item=>item.endingId));
  return `<section class="gallery-screen"><div class="page-heading"><div><p class="eyebrow">THE CAREERS WE KEEP</p><h1>Gallery</h1></div><p>${unlocked.size} / ${data.endings.length} DISCOVERED</p></div><div class="gallery-grid">${data.endings.map(ending=> {
    const entries = state.gallery.filter(item=>item.endingId===ending.id);
    const frame = art('ui/gallery_frame','gallery frame','gallery-frame-art');
    if (!entries.length) return `<article class="gallery-card locked paper-card" aria-label="Locked ending">${frame}<span class="locked-mark">?</span><h2>???</h2><p>ANOTHER CAREER, ANOTHER STORY.</p></article>`;
    return `<article class="gallery-card paper-card ${flipped.has(ending.id) ? 'back-face' : ''}">${frame}${endingFace(ending,flipped.has(ending.id))}<p class="unlocked-by">${entries.map(entry=>`${escape(entry.name)} · ${entry.pawn === 'female' ? '♀' : '♂'} · career ${entry.round}`).join('<br>')}</p>${button(flipped.has(ending.id) ? 'See the front' : 'Turn over', 'flip-gallery', 'text-button', `data-ending="${escape(ending.id)}"`)}</article>`;
  }).join('')}</div>${button('Back', 'back', 'page-back')}</section>`;
}
