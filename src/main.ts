import './styles/main.css';
import './styles/metal.css';
import './styles/guide.css';
import './styles/endings.css';
import './styles/history.css';
import './styles/story.css';
import './styles/language.css';
import { RULES } from './config/rules';
import { loadChineseCatalog, loadData, loadGuideData } from './data/load';
import { localizeData, localizeGuide, localizeState, type TranslationCatalog } from './data/localize';
import type { GuideData } from './data/guide';
import { validateData } from './data/validate';
import { BOARD } from './game/board';
import { getChoiceHistory } from './game/history';
import { advance, chooseOption, createInitialState, startCareer, updateSettings } from './game/state';
import { loadState, resetStorage, saveState } from './game/persistence';
import { archiveEndingRecap } from './game/recap';
import type { AppState, GameData, Pawn } from './game/types';
import { loadAssets } from './ui/assets';
import { audioStatus, playSound, syncAudio } from './ui/audio';
import { transitionSounds } from './ui/audio-routes';
import { boardScreen } from './ui/board';
import { scenarioDialog } from './ui/card';
import { button, escape } from './ui/dom';
import { endingScreen, epilogueScreen, galleryDetailDialog, galleryScreen, milestoneScreen } from './ui/gallery';
import { settingsScreen } from './ui/settings';
import { introScreen, titleScreen } from './ui/title';
import { guidePanel } from './ui/guide';
import { choiceHistoryDialog } from './ui/history';
import { setLocale, setStoryTranslations, t } from './ui/i18n';

const app = document.querySelector<HTMLDivElement>('#app')!;
const debug = new URLSearchParams(location.search).get('debug') === '1';
const requestedLocale = new URLSearchParams(location.search).get('lang');
let state: AppState = loadState();
let data: GameData;
let guide: GuideData;
let chinese: TranslationCatalog;
let view: 'title' | 'game' | 'gallery' | 'settings' = state.run ? 'game' : 'title';
let returnView: 'title' | 'game' = view;
let selectingPawn = false;
let confirmingReset = false;
let endingBack = false;
let epilogueVisible = false;
let unavailableOption: number | null = null;
let savingFailed = false;
let busy = false;
let showingReturn = false;
let historyCardId: string | null = null;
let historyTriggerId: string | null = null;
let galleryEndingId: string | null = null;
let galleryBack = false;
let galleryNoticeTimer: number | undefined;
const reduced = () => state.settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;

function debugPanel(): string {
  const run = state.run;
  if (!debug || !run) return '';
  return `<aside class="debug-panel"><strong>DEBUG · hidden from normal play</strong><p>Round ${run.round} · ${escape(run.phase)} · ${escape(BOARD[run.position].cardId ?? BOARD[run.position].id)}</p><dl>${Object.entries(run.stats).map(([name,value])=>`<dt>${name}</dt><dd>${value}</dd>`).join('')}</dl><p>Policies: ${escape(run.activePolicies.join(', ') || 'none')}</p><p>Boss: ${run.result?.passed ?? '—'}</p><p id="audio-debug">${escape(audioStatus())}</p></aside>`;
}
function render(focus = true): void {
  const locale = state.settings.locale ?? 'en';
  setLocale(locale);
  document.documentElement.lang = locale;
  const displayState = localizeState(state, chinese, locale);
  const displayData = localizeData(data, chinese, locale);
  const displayGuide = localizeGuide(guide, chinese, locale);
  syncAudio(state, false, view === 'game' && epilogueVisible ? 'epilogue' : view);
  document.body.classList.toggle('reduced-motion', reduced());
  const run = state.run;
  const scenarioOpen = view === 'game' && run && ['card','result','promotion','chapter'].includes(run.phase);
  const historyMarkup = view === 'game' && run?.phase === 'board' && historyCardId
    ? choiceHistoryDialog(displayState, displayData, historyCardId) : '';
  const galleryMarkup = view === 'gallery' && galleryEndingId
    ? galleryDetailDialog(displayState, displayData, galleryEndingId, galleryBack) : '';
  const storyOpen = scenarioOpen || Boolean(historyMarkup) || Boolean(galleryMarkup);
  document.body.classList.toggle('story-open', Boolean(storyOpen));
  let content: string;
  if (view === 'title') content = titleScreen(displayState,displayData,selectingPawn);
  else if (view === 'gallery') content = galleryScreen(displayState,displayData) + galleryMarkup
    + '<p id="gallery-notice" class="gallery-toast" role="status" aria-live="polite" hidden></p>';
  else if (view === 'settings') content = settingsScreen(state.settings,confirmingReset);
  else if (!run) { view = 'title'; content = titleScreen(displayState,displayData,selectingPawn); }
  else if (run.phase === 'intro') content = introScreen(displayState,displayData,guidePanel(displayState,displayData,displayGuide,'intro-guide'));
  else if (run.phase === 'milestone') content = milestoneScreen(displayState,displayData,endingBack);
  else if (run.phase === 'ending' && !showingReturn) content = epilogueVisible && displayData.epilogue ? epilogueScreen(displayData) : endingScreen(displayState,displayData,endingBack);
  else content = `<div class="game-with-guide" ${storyOpen ? 'inert' : ''}>${boardScreen(displayState,displayData)}${guidePanel(displayState,displayData,displayGuide,'board-guide')}</div>${scenarioOpen ? scenarioDialog(displayState,displayData,run.phase !== 'result' ? guidePanel(displayState,displayData,displayGuide,'choice-guide') : '',unavailableOption) : historyMarkup}`;
  if (state.migrationNotice) content = `<aside class="migration-notice" role="status"><strong>${t('The team’s completed story is ready.','组员的正式剧情已准备就绪。')}</strong><p>${t('This version uses six values and new story branches. Your earlier prototype records are preserved in Gallery. Start a new career to play the updated story.','本版本使用六项能力值和新的剧情分支。早期原型记录已保留在结局收藏中，开始新的职业生涯即可体验更新后的剧情。')}</p>${button(t('Got it','知道了'), 'dismiss-migration', 'text-button')}</aside>${content}`;
  const languageButton = `<button type="button" class="language-switch" data-action="language" lang="${locale === 'en' ? 'zh-CN' : 'en'}" aria-label="${locale === 'en' ? '切换为中文' : 'Switch to English'}">${locale === 'en' ? '中文' : 'English'}</button>`;
  app.innerHTML = `<header class="app-header" ${storyOpen || confirmingReset ? 'inert' : ''}><button class="brand" data-action="home">${escape(data.copy.title)}</button><nav class="header-nav" aria-label="${t('Main navigation','主导航')}"><span class="prototype-stamp">${t('PROTOTYPE','试玩版')}</span>${view !== 'game' && state.run ? button('Resume','resume') : ''}${button('Gallery','gallery')}${button('Settings','settings')}${languageButton}</nav></header><main id="main-content">${content}</main>${savingFailed ? `<p class="save-warning" role="status">${t('This browser could not save progress. Keep this tab open; refreshing may lose this career.','当前浏览器无法保存进度。请保持本页打开，刷新可能会丢失这次职业生涯。')}</p>` : ''}${debugPanel()}`;
  const dialog = app.querySelector<HTMLElement>('[role=alertdialog], [role=dialog]');
  if (dialog) dialog.insertAdjacentHTML('afterbegin', `<div class="dialog-language">${languageButton}</div>`);
  if (galleryMarkup) app.querySelectorAll<HTMLElement>('#main-content > :not(.gallery-scrim)').forEach(item => item.inert = true);
  if (confirmingReset) app.querySelectorAll<HTMLElement>('.settings-screen > :not(.reset-confirm)').forEach(item=>item.inert=true);
  if (focus) {
    const target = dialog ?? app.querySelector<HTMLElement>('#main-content h1, #main-content h2');
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  }
}
function persist(): void { savingFailed = !saveState(state); }
function closeGallery(): void {
  const id = galleryEndingId;
  galleryEndingId = null;
  galleryBack = false;
  render(false);
  document.getElementById(`gallery-ending-${id}`)?.focus({ preventScroll: true });
}
function showLockedEndingNotice(): void {
  const notice = document.getElementById('gallery-notice');
  if (!notice) return;
  window.clearTimeout(galleryNoticeTimer);
  notice.textContent = t('This ending has not been unlocked yet.', '这个结局还未解锁。');
  notice.hidden = false;
  galleryNoticeTimer = window.setTimeout(() => { notice.hidden = true; notice.textContent = ''; }, 2400);
}
function closeHistory(): void {
  const cardId = historyTriggerId;
  historyCardId = null;
  historyTriggerId = null;
  render(false);
  app.querySelector<HTMLElement>(`[data-action="review-choice"][data-card="${cardId}"]`)?.focus();
}
function start(pawn: Pawn): void {
  state = startCareer(state,pawn,data);
  view = 'game'; selectingPawn = false; endingBack = false; epilogueVisible = false; unavailableOption = null; persist(); render();
}
function newCareer(): void {
  const previous = state.lineage.at(-1);
  if (!data.contentVersion && previous?.reachedDirector && previous.hiredIntern) start('female');
  else if (RULES.firstCareerPawn === 'random') start(Math.random() < .5 ? 'female' : 'male');
  else { view = 'title'; selectingPawn = true; render(); }
}
async function makeMove(action: () => AppState): Promise<void> {
  const previousState = state;
  const oldPosition = state.run?.position;
  const oldRect = app.querySelector('.board-pawn')?.getBoundingClientRect();
  state = action(); endingBack = false; unavailableOption = null; persist();
  syncAudio(state, true, view);
  const sounds = transitionSounds(previousState, state);
  sounds.start.forEach(playSound);
  const hop = oldRect && oldPosition !== state.run?.position && !reduced();
  showingReturn = Boolean(hop && state.run?.phase === 'ending' && state.run.position === 0);
  if (hop) { busy = true; app.classList.add('moving'); }
  render(!hop);
  if (hop) {
    if (oldPosition === 0) app.querySelector('[data-tile="0"]')?.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:RULES.animation.flipHalfMs*2});
    const pawn = app.querySelector<HTMLElement>('.board-pawn');
    if (pawn) {
      const rect = pawn.getBoundingClientRect();
      const dx = oldRect.left - rect.left, dy = oldRect.top - rect.top;
      const animation = pawn.animate([
        { transform: `translate(${dx}px,${dy}px)` },
        { transform: `translate(${dx/2}px,${dy/2 - 25}px)` },
        { transform: 'translate(0,0) scaleY(.9)' },
        { transform: 'translate(0,0) scaleY(1)' },
      ], { duration: RULES.animation.hopMs, easing: 'ease-in-out' });
      await animation.finished.catch(()=>{});
    }
    app.querySelector(`[data-tile="${state.run!.position}"]`)?.classList.add('just-walked');
    if (showingReturn) {
      await app.querySelector('[data-tile="0"]')?.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}],{duration:RULES.animation.flipHalfMs}).finished.catch(()=>{});
      showingReturn = false; render();
      app.querySelector('.ending-card')?.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:RULES.animation.flipHalfMs});
    }
    app.classList.remove('moving'); busy = false;
    app.querySelector<HTMLElement>('[role=dialog]')?.focus({preventScroll:true});
  }
  sounds.arrival.forEach(playSound);
}
async function flip(target: HTMLElement, change: () => void): Promise<void> {
  playSound('flip');
  busy = true;
  const card = target.closest<HTMLElement>('.ending-card,.gallery-card');
  if (card && !reduced()) await card.animate([{ transform: 'scaleX(1)' },{ transform: 'scaleX(0)' }], {duration:RULES.animation.flipHalfMs}).finished.catch(()=>{});
  change(); render(false);
  busy = false;
  const action = target.dataset.action;
  const replacement = app.querySelector<HTMLElement>(`[data-action="${action}"]${target.dataset.ending ? `[data-ending="${target.dataset.ending}"]` : ''}`);
  const nextCard = replacement?.closest('.ending-card,.gallery-card');
  if (nextCard && !reduced()) nextCard.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:RULES.animation.flipHalfMs});
  replacement?.focus({preventScroll:true});
}
app.addEventListener('click', event => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target || busy) return;
  syncAudio(state, true, view);
  const action = target.dataset.action;
  if (target.closest('[inert]')) return;
  if (historyCardId && action !== 'review-choice' && action !== 'close-history' && action !== 'language') return;
  if (galleryEndingId && !['close-gallery', 'flip-gallery', 'language'].includes(action ?? '')) return;
  if (action === 'language') {
    state = updateSettings(state, { locale: state.settings.locale === 'zh-CN' ? 'en' : 'zh-CN' });
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', state.settings.locale!);
      history.replaceState(null, '', url);
    }
    persist(); render(false);
    app.querySelector<HTMLElement>('[data-action="language"]:not([inert] *)')?.focus();
    return;
  }
  if (action === 'dismiss-migration') { state = { ...state, migrationNotice: false }; persist(); render(); return; }
  if (action === 'epilogue') { epilogueVisible = true; render(); return; }
  if (action === 'unavailable') { unavailableOption = Number(target.dataset.option); render(false); app.querySelector<HTMLElement>('.unavailable-note')?.focus(); return; }
  if (action === 'close-unavailable') { const option = unavailableOption; unavailableOption = null; render(false); app.querySelector<HTMLElement>(`[data-option="${option}"]:not(:disabled)`)?.focus(); return; }
  if (action === 'review-choice') {
    const cardId = target.dataset.card;
    if (view === 'game' && state.run?.phase === 'board'
      && getChoiceHistory(state.run, data).some(entry => entry.cardId === cardId)) {
      if (!historyCardId) historyTriggerId = cardId!;
      historyCardId = cardId!;
      playSound('card');
      render();
    }
    return;
  }
  if (action === 'close-history') return closeHistory();
  if (action === 'open-ending' && view === 'gallery') {
    const id = target.dataset.ending;
    if (!id || !data.endings.some(ending => ending.id === id)) return;
    if (!state.gallery.some(entry => entry.endingId === id)) { showLockedEndingNotice(); return; }
    window.clearTimeout(galleryNoticeTimer);
    galleryEndingId = id;
    galleryBack = false;
    playSound('card');
    render();
    return;
  }
  if (action === 'close-gallery') return closeGallery();
  if (action === 'toggle-guide') {
    state = updateSettings(state, { guideHidden: !state.settings.guideHidden });
    persist(); render(false);
    app.querySelector<HTMLElement>('[data-action="toggle-guide"]:not([inert] *)')?.focus();
    return;
  }
  if (action === 'select-pawn' || action === 'next-career') return newCareer();
  if (action === 'start-female' || action === 'start-male') return start(action.slice(6) as Pawn);
  if (action === 'advance') return void makeMove(()=>advance(state,data));
  if (action === 'choose') return void makeMove(()=>chooseOption(state,Number(target.dataset.option),data));
  if (action === 'flip-ending') return void flip(target,()=>{ endingBack = !endingBack; });
  if (action === 'flip-gallery' && galleryEndingId) return void flip(target,()=>{ galleryBack = !galleryBack; });
  if (action === 'home') { view = 'title'; selectingPawn = false; }
  if (action === 'resume') { view = 'game'; selectingPawn = false; }
  if (action === 'gallery' || action === 'settings') { if (view === 'game' || view === 'title') returnView = view; view = action; }
  if (action === 'back') { view = returnView; confirmingReset = false; }
  if (action === 'confirm-reset') confirmingReset = true;
  if (action === 'cancel-reset') confirmingReset = false;
  if (action === 'reset') { resetStorage(); state = createInitialState(); confirmingReset = false; selectingPawn = false; endingBack = false; view = 'title'; galleryEndingId = null; persist(); }
  render();
});
app.addEventListener('change', event => {
  const input = event.target as HTMLInputElement;
  if (!['reducedMotion','sound'].includes(input.dataset.setting ?? '')) return;
  state = updateSettings(state,{[input.dataset.setting!]:input.checked}); persist();
  if (input.dataset.setting === 'sound') syncAudio(state, true, view);
  render(false);
  app.querySelector<HTMLElement>(`[data-setting="${input.dataset.setting}"]`)?.focus();
});
app.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement) {
    event.target.hidden = true;
    event.target.parentElement?.classList.add('art-placeholder');
    const caption = event.target.nextElementSibling as HTMLElement | null;
    if (caption) caption.hidden = false;
  }
}, true);
document.addEventListener('keydown', event => {
  if (busy || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target as HTMLElement;
  const dialog = app.querySelector<HTMLElement>('[role=alertdialog], [role=dialog]');
  if (event.key === 'Tab' && dialog) {
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled),summary,input,[tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0 && !element.closest('[hidden], [inert]'));
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && (target === first || target === dialog)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (target === last || target === dialog)) { event.preventDefault(); first?.focus(); }
  }
  if (historyCardId) {
    if (event.key === 'Escape') { event.preventDefault(); closeHistory(); }
    return;
  }
  if (galleryEndingId) {
    if (event.key === 'Escape') { event.preventDefault(); closeGallery(); }
    return;
  }
  if (target.matches('input,textarea,select')) return;
  if (view === 'game' && state.run?.phase === 'card' && /^[1234dD]$/.test(event.key)) {
    event.preventDefault(); app.querySelector<HTMLButtonElement>(`[data-option="${/d/i.test(event.key) ? 4 : event.key}"]:not(:disabled)`)?.click();
  }
  if (event.key === 'Enter' && !target.closest('button,summary')) {
    const next = dialog?.querySelector<HTMLButtonElement>('[data-enter]') ?? app.querySelector<HTMLButtonElement>('[data-enter]:not([inert] *)');
    if (next && view === 'game') { event.preventDefault(); next.click(); }
  }
});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>document.body.classList.toggle('reduced-motion',reduced()));

async function boot(): Promise<void> {
  try {
    [data, guide, chinese] = await Promise.all([loadData(),loadGuideData(),loadChineseCatalog(),loadAssets()]);
    setStoryTranslations(chinese.translations);
    const issues = validateData(data);
    if (issues.length) throw new Error(issues.join('\n'));
    if (requestedLocale === 'en' || requestedLocale === 'zh-CN') {
      state = updateSettings(state, { locale: requestedLocale });
      persist();
    }
    const archived = archiveEndingRecap(state, data);
    if (archived !== state) { state = archived; persist(); }
    document.title = data.copy.title;
    document.documentElement.style.setProperty('--idle-ms',`${RULES.animation.idleMs}ms`);
    document.documentElement.style.setProperty('--light-ms',`${RULES.animation.lightMs}ms`);
    render();
  } catch (error) {
    app.innerHTML = `<section class="data-error" role="alert"><h1>项目数据需要检查</h1><p>请检查下列位置，修正文件后刷新。已有游戏进度会保留。</p><pre>${escape(error instanceof Error ? error.message : error)}</pre></section>`;
  }
}
void boot();
