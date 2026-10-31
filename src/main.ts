import './styles/main.css';
import './styles/metal.css';
import './styles/guide.css';
import './styles/endings.css';
import './styles/history.css';
import { RULES } from './config/rules';
import { loadData, loadGuideData } from './data/load';
import type { GuideData } from './data/guide';
import { validateData } from './data/validate';
import { BOARD } from './game/board';
import { getChoiceHistory } from './game/history';
import { advance, chooseOption, createInitialState, startCareer, updateSettings } from './game/state';
import { loadState, resetStorage, saveState } from './game/persistence';
import type { AppState, GameData, Pawn } from './game/types';
import { loadAssets } from './ui/assets';
import { boardScreen } from './ui/board';
import { scenarioDialog } from './ui/card';
import { button, escape } from './ui/dom';
import { endingScreen, galleryScreen } from './ui/gallery';
import { settingsScreen } from './ui/settings';
import { introScreen, titleScreen } from './ui/title';
import { guidePanel } from './ui/guide';
import { choiceHistoryDialog } from './ui/history';

const app = document.querySelector<HTMLDivElement>('#app')!;
const debug = new URLSearchParams(location.search).get('debug') === '1';
let state: AppState = loadState();
let data: GameData;
let guide: GuideData;
let view: 'title' | 'game' | 'gallery' | 'settings' = state.run ? 'game' : 'title';
let returnView: 'title' | 'game' = view;
let selectingPawn = false;
let confirmingReset = false;
let endingBack = false;
let savingFailed = false;
let busy = false;
let showingReturn = false;
let historyCardId: string | null = null;
let historyTriggerId: string | null = null;
const galleryFlips = new Set<string>();
const reduced = () => state.settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;

function debugPanel(): string {
  const run = state.run;
  if (!debug || !run) return '';
  return `<aside class="debug-panel"><strong>DEBUG · hidden from normal play</strong><p>Round ${run.round} · ${escape(run.phase)} · ${escape(BOARD[run.position].cardId ?? BOARD[run.position].id)}</p><dl>${Object.entries(run.stats).map(([name,value])=>`<dt>${name}</dt><dd>${value}</dd>`).join('')}</dl><p>Policies: ${escape(run.activePolicies.join(', ') || 'none')}</p><p>Boss: ${run.result?.passed ?? '—'}</p></aside>`;
}
function render(focus = true): void {
  document.body.classList.toggle('reduced-motion', reduced());
  const run = state.run;
  const scenarioOpen = view === 'game' && run && ['card','result','promotion'].includes(run.phase);
  const historyMarkup = view === 'game' && run?.phase === 'board' && historyCardId
    ? choiceHistoryDialog(state, data, historyCardId) : '';
  const storyOpen = scenarioOpen || Boolean(historyMarkup);
  let content: string;
  if (view === 'title') content = titleScreen(state,data,selectingPawn);
  else if (view === 'gallery') content = galleryScreen(state,data,galleryFlips);
  else if (view === 'settings') content = settingsScreen(state.settings,confirmingReset);
  else if (!run) { view = 'title'; content = titleScreen(state,data,selectingPawn); }
  else if (run.phase === 'intro') content = introScreen(state,data);
  else if (run.phase === 'ending' && !showingReturn) content = endingScreen(state,data,endingBack);
  else content = `<div class="game-with-guide" ${storyOpen ? 'inert' : ''}>${boardScreen(state,data)}${guidePanel(state,data,guide,'board-guide')}</div>${scenarioOpen ? scenarioDialog(state,data,run.phase !== 'result' ? guidePanel(state,data,guide,'choice-guide') : '') : historyMarkup}`;
  app.innerHTML = `<header class="app-header" ${storyOpen || confirmingReset ? 'inert' : ''}><button class="brand" data-action="home">${escape(data.copy.title)}</button><nav class="header-nav" aria-label="Main navigation"><span class="prototype-stamp">PROTOTYPE</span>${view !== 'game' && state.run ? button('Resume','resume') : ''}${button('Gallery','gallery')}${button('Settings','settings')}</nav></header><main id="main-content">${content}</main>${savingFailed ? '<p class="save-warning" role="status">This browser could not save progress. Keep this tab open; refreshing may lose this career.</p>' : ''}${debugPanel()}`;
  const dialog = app.querySelector<HTMLElement>('[role=alertdialog], [role=dialog]');
  if (confirmingReset) app.querySelectorAll<HTMLElement>('.settings-screen > :not(.reset-confirm)').forEach(item=>item.inert=true);
  if (focus) {
    const target = dialog ?? app.querySelector<HTMLElement>('#main-content h1, #main-content h2');
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  }
}
function persist(): void { savingFailed = !saveState(state); }
function closeHistory(): void {
  const cardId = historyTriggerId;
  historyCardId = null;
  historyTriggerId = null;
  render(false);
  app.querySelector<HTMLElement>(`[data-action="review-choice"][data-card="${cardId}"]`)?.focus();
}
function start(pawn: Pawn): void {
  state = startCareer(state,pawn,data);
  view = 'game'; selectingPawn = false; endingBack = false; persist(); render();
}
function newCareer(): void {
  const previous = state.lineage.at(-1);
  if (previous?.reachedDirector && previous.hiredIntern) start('female');
  else if (RULES.firstCareerPawn === 'random') start(Math.random() < .5 ? 'female' : 'male');
  else { view = 'title'; selectingPawn = true; render(); }
}
async function makeMove(action: () => AppState): Promise<void> {
  const oldPosition = state.run?.position;
  const oldRect = app.querySelector('.board-pawn')?.getBoundingClientRect();
  state = action(); persist();
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
}
async function flip(target: HTMLElement, change: () => void): Promise<void> {
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
  const action = target.dataset.action;
  if (target.closest('[inert]')) return;
  if (historyCardId && action !== 'review-choice' && action !== 'close-history') return;
  if (action === 'review-choice') {
    const cardId = target.dataset.card;
    if (view === 'game' && state.run?.phase === 'board'
      && getChoiceHistory(state.run, data).some(entry => entry.cardId === cardId)) {
      if (!historyCardId) historyTriggerId = cardId!;
      historyCardId = cardId!;
      render();
    }
    return;
  }
  if (action === 'close-history') return closeHistory();
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
  if (action === 'flip-gallery') return void flip(target,()=>{ const id=target.dataset.ending!; galleryFlips.has(id) ? galleryFlips.delete(id) : galleryFlips.add(id); });
  if (action === 'home') { view = 'title'; selectingPawn = false; }
  if (action === 'resume') { view = 'game'; selectingPawn = false; }
  if (action === 'gallery' || action === 'settings') { if (view === 'game' || view === 'title') returnView = view; view = action; }
  if (action === 'back') { view = returnView; confirmingReset = false; }
  if (action === 'confirm-reset') confirmingReset = true;
  if (action === 'cancel-reset') confirmingReset = false;
  if (action === 'reset') { resetStorage(); state = createInitialState(); confirmingReset = false; selectingPawn = false; endingBack = false; view = 'title'; galleryFlips.clear(); persist(); }
  render();
});
app.addEventListener('change', event => {
  const input = event.target as HTMLInputElement;
  if (!['reducedMotion','sound'].includes(input.dataset.setting ?? '')) return;
  state = updateSettings(state,{[input.dataset.setting!]:input.checked}); persist(); render(false);
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
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled),summary,input,[tabindex="0"]')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && (target === first || target === dialog)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (target === last || target === dialog)) { event.preventDefault(); first?.focus(); }
  }
  if (historyCardId) {
    if (event.key === 'Escape') { event.preventDefault(); closeHistory(); }
    return;
  }
  if (target.matches('input,textarea,select')) return;
  if (view === 'game' && state.run?.phase === 'card' && /^[123]$/.test(event.key)) {
    event.preventDefault(); app.querySelector<HTMLButtonElement>(`[data-option="${event.key}"]`)?.click();
  }
  if (event.key === 'Enter' && !target.closest('button,summary')) {
    const next = dialog?.querySelector<HTMLButtonElement>('[data-enter]') ?? app.querySelector<HTMLButtonElement>('[data-enter]:not([inert] *)');
    if (next && view === 'game') { event.preventDefault(); next.click(); }
  }
});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>document.body.classList.toggle('reduced-motion',reduced()));

async function boot(): Promise<void> {
  try {
    [data, guide] = await Promise.all([loadData(),loadGuideData(),loadAssets()]);
    const issues = validateData(data);
    if (issues.length) throw new Error(issues.join('\n'));
    document.title = data.copy.title;
    RULES.litTileColors.forEach((color,index)=>document.documentElement.style.setProperty(`--lit-${index+1}`,color));
    document.documentElement.style.setProperty('--idle-ms',`${RULES.animation.idleMs}ms`);
    document.documentElement.style.setProperty('--light-ms',`${RULES.animation.lightMs}ms`);
    render();
  } catch (error) {
    app.innerHTML = `<section class="data-error" role="alert"><h1>项目数据需要检查</h1><p>请检查下列位置，修正文件后刷新。已有游戏进度会保留。</p><pre>${escape(error instanceof Error ? error.message : error)}</pre></section>`;
  }
}
void boot();
