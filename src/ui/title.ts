import type { AppState, GameData } from '../game/types';
import { art, pawnArt } from './assets';
import { button, escape, richText } from './dom';

export function titleScreen(state: AppState, data: GameData, selecting: boolean): string {
  return `<section class="title-screen" aria-labelledby="title-heading">
    <div class="edition"><span>NMC5369 · MEDIA PROJECT</span><span>PLAYABLE PROTOTYPE / 01</span></div>
    <div class="title-layout"><div class="title-copy"><p class="eyebrow">A CAREER IN THE CREATIVE INDUSTRIES</p>
    <h1 id="title-heading">${escape(data.copy.title)}</h1><p class="title-subtitle">${escape(data.copy.subtitle)}</p>
    <div class="title-rule"></div><p class="title-description">${escape(data.copy.introduction)}</p>
    ${selecting ? `<div class="pawn-selection" aria-label="Choose a pawn">${(['female','male'] as const).map(pawn => `<button class="pawn-choice" data-action="start-${pawn}">${pawnArt(pawn)}<span>${pawn === 'female' ? 'Female pawn' : 'Male pawn'}</span></button>`).join('')}</div>` : `<div class="title-actions">${button(state.run ? 'Continue career' : 'Start a career', state.run ? 'resume' : 'select-pawn', 'primary')}${button('Gallery', 'gallery')}${button('Settings', 'settings')}</div>`}
    <p class="keyboard-note">ONE CAREER AT A TIME · EVERY CHOICE STAYS</p></div>
    <div class="title-art-panel">${art('ui/title', 'title illustration', 'title-art')}<span class="art-caption">NEW HIRE → CREATIVE DIRECTOR → ?</span></div></div>
    <div class="title-bottom"><span>01 / BREAKING IN</span><span>02 / GETTING AHEAD</span><span>03 / THE CAREER CLIFF</span><span>04 / THE OTHER SIDE</span></div>
    <p class="prototype-note">${escape(data.copy.placeholderNotice)}</p>
  </section>`;
}

export function introScreen(state: AppState, data: GameData, guide = ''): string {
  const run = state.run!;
  const chapter = data.chapters?.find(chapter => chapter.chapter === 1);
  return `<section class="intro-screen paper-card" aria-labelledby="intro-heading"><p class="eyebrow">CAREER ${String(run.round).padStart(2,'0')} · ${escape(run.character.name)}</p>${pawnArt(run.character.pawn, 'intro-pawn')}<h1 id="intro-heading">${escape(chapter?.title ?? run.character.name)}</h1><p>${richText(chapter?.scene ?? data.copy.introduction)}</p>${guide}${button('Enter the studio', 'advance', 'primary', 'data-enter="true"')}<p class="keyboard-note">PRESS ENTER TO BEGIN</p></section>`;
}
