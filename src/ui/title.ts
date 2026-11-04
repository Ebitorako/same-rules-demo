import type { AppState, GameData } from '../game/types';
import { art, assetPath, pawnArt } from './assets';
import { button, escape, richText } from './dom';
import { t } from './i18n';

export function titleScreen(state: AppState, data: GameData, selecting: boolean): string {
  const titleArt = !assetPath('ui/title') && assetPath('characters/pawn_female') && assetPath('characters/pawn_male')
    ? `<div class="title-pawn-pair">${pawnArt('female')}${pawnArt('male')}</div>`
    : art('ui/title', 'title illustration', 'title-art');
  return `<section class="title-screen" aria-labelledby="title-heading">
    <div class="edition"><span>${t('NMC5369 · MEDIA PROJECT')}</span><span>${t('PLAYABLE PROTOTYPE / 01')}</span></div>
    <div class="title-layout"><div class="title-copy"><p class="eyebrow">${t('A CAREER IN THE CREATIVE INDUSTRIES')}</p>
    <h1 id="title-heading">${escape(data.copy.title)}</h1><p class="title-subtitle">${escape(data.copy.subtitle)}</p>
    <div class="title-rule"></div><p class="title-description">${richText(data.copy.introduction)}</p>
    ${selecting ? `<div class="pawn-selection" aria-label="${t('Choose a pawn')}">${(['female','male'] as const).map(pawn => `<button class="pawn-choice" data-action="start-${pawn}">${pawnArt(pawn)}<span>${t(pawn === 'female' ? 'Female pawn' : 'Male pawn')}</span></button>`).join('')}</div>` : `<div class="title-actions">${button(state.run ? 'Continue career' : 'Start a career', state.run ? 'resume' : 'select-pawn', 'primary')}${button('Gallery', 'gallery')}${button('Settings', 'settings')}</div>`}
    <p class="keyboard-note">${t('ONE CAREER AT A TIME · EVERY CHOICE STAYS')}</p></div>
    <div class="title-art-panel">${titleArt}<span class="art-caption">${t('NEW HIRE → CREATIVE DIRECTOR → ?')}</span></div></div>
    <section class="title-chapters" aria-labelledby="career-chapters-heading"><h2 id="career-chapters-heading">${t('Your Career Chapters')}</h2><div class="title-bottom"><span>${t('01 / BREAKING IN')}</span><span>${t('02 / GETTING AHEAD')}</span><span>${t('03 / THE CAREER CLIFF')}</span><span>${t('04 / THE OTHER SIDE')}</span></div></section>
    <p class="prototype-note">${escape(data.copy.placeholderNotice)}</p>
  </section>`;
}

export function introScreen(state: AppState, data: GameData, guide = ''): string {
  const run = state.run!;
  const chapter = data.chapters?.find(chapter => chapter.chapter === 1);
  return `<section class="intro-screen paper-card" aria-labelledby="intro-heading"><p class="eyebrow">${t('CAREER')} ${String(run.round).padStart(2,'0')} · ${escape(run.character.name)}</p>${pawnArt(run.character.pawn, 'intro-pawn')}<h1 id="intro-heading">${escape(chapter?.title ?? run.character.name)}</h1><p>${richText(chapter?.scene ?? data.copy.introduction)}</p>${guide}${button('Enter the studio', 'advance', 'primary', 'data-enter="true"')}<p class="keyboard-note">${t('PRESS ENTER TO BEGIN')}</p></section>`;
}
