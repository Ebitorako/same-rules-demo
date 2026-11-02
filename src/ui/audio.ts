import type { AppState } from '../game/types';
import { assetPath } from './assets';
import { musicFor, type AudioView, type SoundCue } from './audio-routes';

let enabled = false;
let activated = false;
let music: HTMLAudioElement | null = null;
let musicPath = '';
let musicVolume = 0.2;
let musicStart = 0;
let lastCue = 'none';
const effects = new Set<HTMLAudioElement>();
const pageDocument = typeof document === 'undefined' ? undefined : document;
const pageWindow = typeof window === 'undefined' ? undefined : window;
let pageActive = true;
let windowActive = pageDocument?.hasFocus?.() ?? true;
let disposed = false;
let ownsAudio = !pageDocument;
let latestState: AppState | undefined;
let latestView: AudioView = 'game';
const channel = (() => {
  try { return pageDocument && typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sameRules.audio') : null; }
  catch { return null; }
})();
const pageId = channel ? crypto.randomUUID() : '';
let latestClaim = { time: 0, owner: '' };
const visible = () => pageActive && pageDocument?.visibilityState !== 'hidden';
const canPlay = () => !disposed && enabled && activated && visible() && windowActive && ownsAudio;

export function audioStatus(): string {
  return !enabled ? 'Sound: muted' : !activated ? 'Sound: waiting for a player gesture'
    : !visible() ? 'Sound: paused in background' : !windowActive ? 'Sound: paused while this window is inactive'
    : !ownsAudio ? 'Sound: another game tab is playing'
    : `Music: ${musicPath.split('/').at(-1) ?? 'none'} · ${music?.paused ? 'paused' : 'playing'} · ${(music?.currentTime ?? 0).toFixed(1)}s · cue: ${lastCue}`;
}
function updateAudioDebug(): void {
  const output = pageDocument?.getElementById('audio-debug');
  if (output) output.textContent = audioStatus();
}

function pauseAll(): void {
  music?.pause();
  effects.forEach(audio => audio.pause());
  effects.clear();
  updateAudioDebug();
}
function retireMusic(): void {
  const previous = music;
  music = null;
  musicPath = '';
  if (!previous) return;
  previous.pause();
  previous.removeAttribute('src');
  previous.load();
}
function claimAudio(): void {
  if (disposed || !activated || !visible() || !windowActive) return;
  ownsAudio = true;
  latestClaim = { time: Math.max(Date.now(), latestClaim.time + 1), owner: pageId };
  channel?.postMessage({ type: 'claim', ...latestClaim });
}
function resumePage(): void {
  if (!latestState || disposed) return;
  claimAudio();
  syncAudio(latestState, false, latestView);
}
function visibilityChanged(): void {
  if (visible()) resumePage();
  else { ownsAudio = false; pauseAll(); }
}
function pageHidden(): void { pageActive = false; ownsAudio = false; pauseAll(); }
function pageShown(): void { pageActive = true; resumePage(); }
function windowBlurred(): void { windowActive = false; ownsAudio = false; pauseAll(); }
function windowFocused(): void { windowActive = true; resumePage(); }
function anotherTabClaimed(event: MessageEvent): void {
  const claim = event.data;
  if (disposed || claim?.type !== 'claim' || typeof claim.owner !== 'string' || !Number.isFinite(claim.time)) return;
  if (claim.time < latestClaim.time || (claim.time === latestClaim.time && claim.owner <= latestClaim.owner)) return;
  latestClaim = { time: claim.time, owner: claim.owner };
  ownsAudio = false;
  pauseAll();
}
channel?.addEventListener('message', anotherTabClaimed);
pageDocument?.addEventListener('visibilitychange', visibilityChanged);
pageWindow?.addEventListener('pagehide', pageHidden);
pageWindow?.addEventListener('pageshow', pageShown);
pageWindow?.addEventListener('blur', windowBlurred);
pageWindow?.addEventListener('focus', windowFocused);

export function disposeAudio(): void {
  if (disposed) return;
  disposed = true;
  pauseAll();
  retireMusic();
  channel?.removeEventListener('message', anotherTabClaimed);
  channel?.close();
  pageDocument?.removeEventListener('visibilitychange', visibilityChanged);
  pageWindow?.removeEventListener('pagehide', pageHidden);
  pageWindow?.removeEventListener('pageshow', pageShown);
  pageWindow?.removeEventListener('blur', windowBlurred);
  pageWindow?.removeEventListener('focus', windowFocused);
  latestState = undefined;
}
import.meta.hot?.dispose(disposeAudio);

function playMusic(): void {
  const track = music;
  if (!track || !canPlay()) return;
  void track.play().then(() => { if (track !== music || !canPlay()) track.pause(); })
    .catch(() => { /* Await the next player gesture if playback is blocked. */ });
}

function setMusicEnvelope(): void {
  if (!music || !Number.isFinite(music.duration)) return;
  const fade = Math.min(1, (music.currentTime - musicStart) / 0.7, Math.max(0, music.duration - music.currentTime) / 0.7);
  music.volume = musicVolume * Math.max(0, fade);
  updateAudioDebug();
}

export function syncAudio(state: AppState, userGesture = false, view: AudioView = 'game'): void {
  if (disposed) return;
  latestState = state;
  latestView = view;
  activated ||= userGesture;
  enabled = state.settings.sound;
  if (userGesture && visible()) windowActive = true;
  if (userGesture) claimAudio();
  if (!canPlay()) { pauseAll(); return; }
  const context = musicFor(state, view);
  const nextPath = assetPath(`audio/bgm_${context}`) ?? assetPath('audio/bgm_main');
  musicVolume = { main: 0.23, intro: 0.17, bar: 0.35, party: 0.2 }[context];
  musicStart = context === 'party' ? 3 : 0;
  if (!nextPath) { retireMusic(); return; }
  if (musicPath !== nextPath) {
    retireMusic();
    music = new Audio(import.meta.env.BASE_URL + nextPath);
    const track = music;
    const start = musicStart;
    music.preload = 'metadata';
    music.volume = 0;
    music.addEventListener('timeupdate', () => { if (track === music) setMusicEnvelope(); });
    music.addEventListener('loadedmetadata', () => { if (track === music && start) track.currentTime = start; });
    music.addEventListener('playing', () => {
      if (track !== music || !canPlay()) track.pause();
      updateAudioDebug();
    });
    music.addEventListener('pause', updateAudioDebug);
    music.addEventListener('ended', () => {
      if (canPlay() && track === music) { track.currentTime = start; track.volume = 0; playMusic(); }
    });
    musicPath = nextPath;
  }
  if (music?.paused) playMusic();
}

export function playSound(key: SoundCue): void {
  if (!canPlay()) return;
  const path = assetPath(`audio/sfx_${key}`);
  if (!path) return;
  const audio = new Audio(import.meta.env.BASE_URL + path);
  audio.volume = { move: 0.3, land: 0.6, card: 0.23, choose: 0.24, hired: 0.3, boss: 0.8, ending: 0.7, flip: 0.5 }[key];
  lastCue = key;
  updateAudioDebug();
  effects.add(audio);
  const release = () => effects.delete(audio);
  audio.addEventListener('playing', () => { if (!canPlay() || !effects.has(audio)) audio.pause(); });
  audio.addEventListener('ended', release, { once: true });
  audio.addEventListener('error', release, { once: true });
  void audio.play().then(() => { if (!canPlay() || !effects.has(audio)) audio.pause(); }).catch(release);
}

export function hasAudio(): boolean {
  return ['bgm_main', 'bgm_intro', 'bgm_bar', 'bgm_party', 'sfx_move', 'sfx_land', 'sfx_card', 'sfx_choose', 'sfx_hired', 'sfx_boss', 'sfx_ending', 'sfx_flip'].some(key => Boolean(assetPath(`audio/${key}`)));
}
