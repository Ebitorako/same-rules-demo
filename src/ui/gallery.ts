import type { AppState, GameData, Ending, Pawn } from '../game/types';
import { getCareerRecap, getEndingRecap } from '../game/recap';
import { art, assetPath } from './assets';
import { button, escape, richText } from './dom';
import { finalValues, numericalReview } from './recap';
import { t, tf } from './i18n';

function endingFace(ending: Ending, back: boolean, recap = '', pawn?: Pawn, headingId?: string): string {
  const milestone = ending.kind === 'milestone';
  const heading = `<h2${headingId ? ` id="${escape(headingId)}"` : ''}>${escape(ending.name)}</h2>`;
  const label = milestone ? `${t('A CHAPTER MILESTONE')} · ${ending.name}` : tf('ending {id}', { id: ending.sourceId ?? ending.id });
  const eyebrow = milestone ? t('A CHAPTER MILESTONE') : `${escape(ending.sourceId ?? ending.id)} / ${t('A CAREER REMEMBERED')}`;
  if (!back) return `${art(`cards/ending_${ending.id}`,label,'ending-art')}<p class="eyebrow">${eyebrow}</p>${heading}<p>${richText(pawn ? ending.frontByPawn?.[pawn] ?? ending.front : ending.front)}</p>${ending.guideAdvice ? `<aside class="ending-guide"><span>${t('THE RULEBOOK')}</span><p>${richText(ending.guideAdvice)}</p></aside>` : ''}${recap}`;
  const text = (value: string) => richText(value.replace(/\r\n?/g, '\n'));
  return `<p class="eyebrow">${t('BEHIND THE CAREER')}</p>${heading}
    <div class="ending-reading-scroll" role="region" tabindex="0" aria-label="${escape(tf('Theory, references and numerical review for {ending}', { ending: ending.name }))}">
      <section class="ending-reading-section"><h3>${t('Theory')}</h3><p class="ending-theory">${text(ending.back)}</p></section>
      <section class="ending-reading-section ending-references"><h3>${t('References')}</h3>${ending.reference.trim()
        ? `<p class="ending-reference-text">${text(ending.reference)}</p>`
        : `<p class="ending-empty-note">${t('References have not been added to this card yet.')}</p>`}</section>${recap}
    </div>`;
}
export function endingScreen(state: AppState, data: GameData, back: boolean): string {
  if (state.run?.phase !== 'ending') return '';
  const ending = data.endings.find(ending=>ending.id===state.run!.endingId)!;
  const career = state.lineage.find(career => career.round === state.run!.round && career.endingId === state.run!.endingId
    && career.character.name === state.run!.character.name && career.character.pawn === state.run!.character.pawn);
  const report = career?.recap ?? getEndingRecap(state.run, data);
  const finalDecision = state.run.exitReason && state.run.result?.text ? `<details class="ending-last-decision"><summary>${t('Your final decision')}</summary><p>${richText(state.run.result.text)}</p></details>` : '';
  const hasEpilogue = data.epilogue?.eligibleEndings?.includes(ending.id);
  return `<section class="ending-screen"><p class="eyebrow">${t('CAREER')} ${state.run.round} / ${escape(state.run.character.name)}</p><article class="ending-card paper-card ${back ? 'back-face' : ''}" aria-live="polite">${endingFace(ending,back,back ? numericalReview(report,data.copy) : finalDecision + finalValues(report), state.run.character.pawn)}${button(back ? 'See the front' : 'Turn the card over', 'flip-ending','text-button')}</article><div class="ending-actions">${button('Gallery','gallery')}${hasEpilogue ? button('Continue', 'epilogue', 'primary') : button('Next career','next-career','primary')}</div><p class="keyboard-note">${t('THIS CAREER IS NOW PART OF THE STUDIO.')}</p></section>`;
}

export function milestoneScreen(state: AppState, data: GameData, back: boolean): string {
  const run = state.run!;
  const milestone = data.milestones?.find(item => item.id === run.milestoneId);
  if (!milestone) return '';
  return `<section class="ending-screen"><p class="eyebrow">${t('CAREER')} ${run.round} / ${t('YOUR CAREER CONTINUES')}</p><article class="ending-card paper-card ${back ? 'back-face' : ''}">${endingFace(milestone, back, '', run.character.pawn)}${button(back ? 'See the front' : 'Turn the card over', 'flip-ending', 'text-button')}</article>${button('Continue to the next chapter', 'advance', 'primary', 'data-enter="true"')}</section>`;
}

export function epilogueScreen(data: GameData): string {
  const epilogue = data.epilogue!;
  return `<section class="intro-screen paper-card epilogue-screen"><p class="eyebrow">${t('AFTER THE CAREER')}</p><h1>${escape(epilogue.name)}</h1><p>${richText(epilogue.front)}</p>${epilogue.guideAdvice ? `<aside class="ending-guide"><span>${t('THE RULEBOOK')}</span><p>${richText(epilogue.guideAdvice)}</p></aside>` : ''}<div class="title-actions">${button('Gallery', 'gallery')}${button('Next career', 'next-career', 'primary')}</div></section>`;
}

function galleryRecaps(state: AppState, data: GameData, ending: Ending, back: boolean): string {
  const careers = state.lineage.filter(career => career.endingId === ending.id);
  const reports = careers.map(career => {
    const run = state.run;
    return !career.recap && run?.phase === 'ending' && run.round === career.round && run.endingId === career.endingId
      && run.character.name === career.character.name && run.character.pawn === career.character.pawn
      ? getEndingRecap(run, data) : getCareerRecap(career);
  });
  if (!reports.length) return '';
  return `<section class="${back ? 'ending-reading-section ' : ''}gallery-recaps"><h3>${t(back ? 'Career reviews' : 'Career values')}</h3>${reports.map((report, index) => `<details class="gallery-career-recap"${index === 0 ? ' open' : ''}><summary>${t('Career')} ${report.round} · ${escape(report.character.name)} · ${tf('{pawn} pawn', { pawn: t(report.character.pawn === 'female' ? 'Female' : 'Male') })}</summary>${back ? numericalReview(report, data.copy) : finalValues(report)}</details>`).join('')}</section>`;
}

function cardArt(key: string, label: string, className: string): string {
  return art(key, label, className).replace(/<(\/?)figure\b/g, '<$1span').replace(/<(\/?)figcaption\b/g, '<$1span');
}

export function galleryScreen(state: AppState, data: GameData): string {
  const unlocked = new Set(state.gallery.map(item=>item.endingId));
  const cards = data.endings;
  return `<section class="gallery-screen"><div class="page-heading"><div><p class="eyebrow">${t('THE CAREERS WE KEEP')}</p><h1>${t('Gallery')}</h1></div><p>${unlocked.size} / ${cards.length} ${t('DISCOVERED')}</p></div><div class="gallery-grid">${cards.map(ending=> {
    const entries = state.gallery.filter(item=>item.endingId===ending.id);
    const frame = assetPath('ui/gallery_frame') ? `<span class="gallery-frame-layer" aria-hidden="true">${cardArt('ui/gallery_frame','gallery frame','gallery-frame-art')}</span>` : '';
    const attributes = `type="button" id="gallery-ending-${escape(ending.id)}" data-action="open-ending" data-ending="${escape(ending.id)}"`;
    if (!entries.length) return `<button ${attributes} class="gallery-card locked paper-card" aria-label="${t('Locked ending')}">${frame}<span class="locked-mark" aria-hidden="true">?</span><span class="gallery-card-title">???</span><span class="gallery-card-description">${t('ANOTHER CAREER, ANOTHER STORY.')}</span></button>`;
    const titleId = `gallery-title-${ending.id}`;
    return `<button ${attributes} class="gallery-card paper-card" aria-haspopup="dialog" aria-labelledby="${escape(titleId)}">${frame}${cardArt(`cards/ending_${ending.id}`, ending.name, 'ending-art gallery-preview-art')}<span class="gallery-card-title" id="${escape(titleId)}">${escape(ending.name)}</span><span class="gallery-card-description">${escape((ending.frontByPawn?.[entries[0].pawn] ?? ending.front).replace(/\s+/g, ' ').trim())}</span></button>`;
  }).join('')}</div>${legacyGallery(state, data)}${button('Back', 'back', 'page-back')}</section>`;
}

export function galleryDetailDialog(state: AppState, data: GameData, id: string, back: boolean): string {
  const entries = state.gallery.filter(entry => entry.endingId === id);
  const ending = data.endings.find(item => item.id === id);
  if (!entries.length || !ending) return '';
  const variants = !back && ending.frontByPawn ? [...new Set(entries.map(entry => entry.pawn))]
    .filter(pawn => pawn !== entries[0].pawn)
    .map(pawn => `<details class="ending-variant"><summary>${tf('{pawn} pawn’s ending', { pawn: t(pawn === 'female' ? 'Female' : 'Male') })}</summary><p>${richText(ending.frontByPawn?.[pawn] ?? ending.front)}</p></details>`).join('') : '';
  return `<div class="sheet-scrim gallery-scrim"><section class="gallery-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-detail-heading" tabindex="-1">
    <header class="gallery-dialog-toolbar">${button('Close', 'close-gallery', 'gallery-close')}</header>
    <article class="ending-card paper-card ${back ? 'back-face' : ''}">${endingFace(ending, back, galleryRecaps(state, data, ending, back), entries[0].pawn, 'gallery-detail-heading')}${variants}<p class="unlocked-by">${entries.map(entry=>`${escape(entry.name)} · ${entry.pawn === 'female' ? '♀' : '♂'} · ${t('career')} ${entry.round}`).join('<br>')}</p>${button(back ? 'See the front' : 'Turn over', 'flip-gallery', 'text-button', `data-ending="${escape(ending.id)}"`)}</article>
  </section></div>`;
}

function legacyGallery(state: AppState, data: GameData): string {
  const archive = state.legacyArchive;
  if (!archive) return '';
  const copy = data.legacyCopy ?? data.copy;
  const oldRun = archive.run;
  return `<section class="legacy-gallery"><h2>${t('Earlier prototype records')}</h2><p>${t('These careers used the earlier eight-value prototype. Their records are kept separately because the story, ending numbers and rules have changed.')}</p>
    ${oldRun && oldRun.phase !== 'ending' ? `<details class="legacy-record"><summary>${t('Unfinished prototype career')} · ${escape(oldRun.character.name)}</summary><p>${tf('Saved at board space {position}, with {count} choices recorded. Start a new career to play the team’s completed story.', { position: oldRun.position, count: Object.keys(oldRun.choices).length })}</p>${oldRun.statHistory?.steps.filter(step => step.kind !== 'system').map(step => `<p><strong>${escape(step.title)}</strong><br>${richText(step.optionText)}</p>`).join('') ?? ''}</details>` : ''}
    ${archive.lineage.map(career => {
      const ending = data.legacyEndings?.find(item => item.id === career.endingId);
      return `<details class="legacy-record"><summary>${t('Prototype career')} ${career.round} · ${escape(career.character.name)} · ${escape(ending?.name ?? career.endingId)}</summary>${ending ? `<p>${richText(ending.front)}</p><h3>${t('Theory')}</h3><p>${richText(ending.back)}</p><h3>${t('References')}</h3><p>${richText(ending.reference)}</p>` : ''}${career.recap ? finalValues(career.recap) + numericalReview(career.recap, copy) : `<p>${t('Detailed numerical records were not saved for this earlier career.')}</p>`}</details>`;
    }).join('')}</section>`;
}
