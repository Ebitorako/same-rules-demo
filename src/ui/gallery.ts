import type { AppState, GameData, Ending, Pawn } from '../game/types';
import { getCareerRecap, getEndingRecap } from '../game/recap';
import { art } from './assets';
import { button, escape, richText } from './dom';
import { finalValues, numericalReview } from './recap';

function endingFace(ending: Ending, back: boolean, recap = '', pawn?: Pawn): string {
  if (!back) return `${art(`cards/ending_${ending.id}`,`ending ${ending.sourceId ?? ending.id}`,'ending-art')}<p class="eyebrow">${escape(ending.sourceId ?? ending.id)} / ${ending.kind === 'milestone' ? 'A CHAPTER MILESTONE' : 'A CAREER REMEMBERED'}</p><h2>${escape(ending.name)}</h2><p>${richText(pawn ? ending.frontByPawn?.[pawn] ?? ending.front : ending.front)}</p>${ending.guideAdvice ? `<aside class="ending-guide"><span>THE RULEBOOK</span><p>${richText(ending.guideAdvice)}</p></aside>` : ''}${recap}`;
  const text = (value: string) => richText(value.replace(/\r\n?/g, '\n'));
  return `<p class="eyebrow">BEHIND THE CAREER</p><h2>${escape(ending.name)}</h2>
    <div class="ending-reading-scroll" role="region" tabindex="0" aria-label="${escape(`Theory, references and numerical review for ${ending.name}`)}">
      <section class="ending-reading-section"><h3>Theory</h3><p class="ending-theory">${text(ending.back)}</p></section>
      <section class="ending-reading-section ending-references"><h3>References</h3>${ending.reference.trim()
        ? `<p class="ending-reference-text">${text(ending.reference)}</p>`
        : '<p class="ending-empty-note">References have not been added to this card yet.</p>'}</section>${recap}
    </div>`;
}
export function endingScreen(state: AppState, data: GameData, back: boolean): string {
  if (state.run?.phase !== 'ending') return '';
  const ending = data.endings.find(ending=>ending.id===state.run!.endingId)!;
  const career = state.lineage.find(career => career.round === state.run!.round && career.endingId === state.run!.endingId
    && career.character.name === state.run!.character.name && career.character.pawn === state.run!.character.pawn);
  const report = career?.recap ?? getEndingRecap(state.run, data);
  const finalDecision = state.run.exitReason && state.run.result?.text ? `<details class="ending-last-decision"><summary>Your final decision</summary><p>${richText(state.run.result.text)}</p></details>` : '';
  const hasEpilogue = data.epilogue?.eligibleEndings?.includes(ending.id);
  return `<section class="ending-screen"><p class="eyebrow">CAREER ${state.run.round} / ${escape(state.run.character.name)}</p><article class="ending-card paper-card ${back ? 'back-face' : ''}" aria-live="polite">${endingFace(ending,back,back ? numericalReview(report,data.copy) : finalDecision + finalValues(report), state.run.character.pawn)}${button(back ? 'See the front' : 'Turn the card over', 'flip-ending','text-button')}</article><div class="ending-actions">${button('Gallery','gallery')}${hasEpilogue ? button('Continue', 'epilogue', 'primary') : button('Next career','next-career','primary')}</div><p class="keyboard-note">THIS CAREER IS NOW PART OF THE STUDIO.</p></section>`;
}

export function milestoneScreen(state: AppState, data: GameData, back: boolean): string {
  const run = state.run!;
  const milestone = data.milestones?.find(item => item.id === run.milestoneId);
  if (!milestone) return '';
  return `<section class="ending-screen"><p class="eyebrow">CAREER ${run.round} / YOUR CAREER CONTINUES</p><article class="ending-card paper-card ${back ? 'back-face' : ''}">${endingFace(milestone, back, '', run.character.pawn)}${button(back ? 'See the front' : 'Turn the card over', 'flip-ending', 'text-button')}</article>${button('Continue to the next chapter', 'advance', 'primary', 'data-enter="true"')}</section>`;
}

export function epilogueScreen(data: GameData): string {
  const epilogue = data.epilogue!;
  return `<section class="intro-screen paper-card epilogue-screen"><p class="eyebrow">AFTER THE CAREER</p><h1>${escape(epilogue.name)}</h1><p>${richText(epilogue.front)}</p>${epilogue.guideAdvice ? `<aside class="ending-guide"><span>THE RULEBOOK</span><p>${richText(epilogue.guideAdvice)}</p></aside>` : ''}<div class="title-actions">${button('Gallery', 'gallery')}${button('Next career', 'next-career', 'primary')}</div></section>`;
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
  return `<section class="${back ? 'ending-reading-section ' : ''}gallery-recaps"><h3>${back ? 'Career reviews' : 'Career values'}</h3>${reports.map(report => `<details class="gallery-career-recap"><summary>Career ${report.round} · ${escape(report.character.name)} · ${report.character.pawn === 'female' ? 'Female' : 'Male'} pawn</summary>${back ? numericalReview(report, data.copy) : finalValues(report)}</details>`).join('')}</section>`;
}

export function galleryScreen(state: AppState, data: GameData, flipped: Set<string>): string {
  const unlocked = new Set(state.gallery.map(item=>item.endingId));
  const cards = data.endings;
  return `<section class="gallery-screen"><div class="page-heading"><div><p class="eyebrow">THE CAREERS WE KEEP</p><h1>Gallery</h1></div><p>${unlocked.size} / ${cards.length} DISCOVERED</p></div><div class="gallery-grid">${cards.map(ending=> {
    const entries = state.gallery.filter(item=>item.endingId===ending.id);
    const frame = art('ui/gallery_frame','gallery frame','gallery-frame-art');
    if (!entries.length) return `<article class="gallery-card locked paper-card" aria-label="Locked ending">${frame}<span class="locked-mark">?</span><h2>???</h2><p>ANOTHER CAREER, ANOTHER STORY.</p></article>`;
    const back = flipped.has(ending.id);
    const variants = !back && ending.frontByPawn ? [...new Set(entries.map(entry => entry.pawn))].filter(pawn => pawn !== entries[0].pawn).map(pawn => `<details class="ending-variant"><summary>${pawn === 'female' ? 'Female' : 'Male'} pawn’s ending</summary><p>${richText(ending.frontByPawn?.[pawn] ?? ending.front)}</p></details>`).join('') : '';
    return `<article class="gallery-card paper-card ${back ? 'back-face' : ''}">${frame}${endingFace(ending,back,galleryRecaps(state,data,ending,back), entries[0].pawn)}${variants}<p class="unlocked-by">${entries.map(entry=>`${escape(entry.name)} · ${entry.pawn === 'female' ? '♀' : '♂'} · career ${entry.round}`).join('<br>')}</p>${button(back ? 'See the front' : 'Turn over', 'flip-gallery', 'text-button', `data-ending="${escape(ending.id)}"`)}</article>`;
  }).join('')}</div>${legacyGallery(state, data)}${button('Back', 'back', 'page-back')}</section>`;
}

function legacyGallery(state: AppState, data: GameData): string {
  const archive = state.legacyArchive;
  if (!archive) return '';
  const copy = data.legacyCopy ?? data.copy;
  const oldRun = archive.run;
  return `<section class="legacy-gallery"><h2>Earlier prototype records</h2><p>These careers used the earlier eight-value prototype. Their records are kept separately because the story, ending numbers and rules have changed.</p>
    ${oldRun && oldRun.phase !== 'ending' ? `<details class="legacy-record"><summary>Unfinished prototype career · ${escape(oldRun.character.name)}</summary><p>Saved at board space ${oldRun.position}, with ${Object.keys(oldRun.choices).length} choices recorded. Start a new career to play the team’s completed story.</p>${oldRun.statHistory?.steps.filter(step => step.kind !== 'system').map(step => `<p><strong>${escape(step.title)}</strong><br>${richText(step.optionText)}</p>`).join('') ?? ''}</details>` : ''}
    ${archive.lineage.map(career => {
      const ending = data.legacyEndings?.find(item => item.id === career.endingId);
      return `<details class="legacy-record"><summary>Prototype career ${career.round} · ${escape(career.character.name)} · ${escape(ending?.name ?? career.endingId)}</summary>${ending ? `<p>${richText(ending.front)}</p><h3>Theory</h3><p>${richText(ending.back)}</p><h3>References</h3><p>${richText(ending.reference)}</p>` : ''}${career.recap ? finalValues(career.recap) + numericalReview(career.recap, copy) : '<p>Detailed numerical records were not saved for this earlier career.</p>'}</details>`;
    }).join('')}</section>`;
}
