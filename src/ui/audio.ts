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

export function audioStatus(): string {
  return !enabled ? 'Sound: muted' : !activated ? 'Sound: waiting for a player gesture'
    : `Music: ${musicPath.split('/').at(-1) ?? 'none'} · ${music?.paused ? 'paused' : 'playing'} · ${(music?.currentTime ?? 0).toFixed(1)}s · cue: ${lastCue}`;
}
function updateAudioDebug(): void {
  if (typeof document === 'undefined') return;
  const output = document.getElementById('audio-debug');
  if (output) output.textContent = audioStatus();
}

function setMusicEnvelope(): void {
  if (!music || !Number.isFinite(music.duration)) return;
  const fade = Math.min(1, (music.currentTime - musicStart) / 0.7, Math.max(0, music.duration - music.currentTime) / 0.7);
  music.volume = musicVolume * Math.max(0, fade);
  updateAudioDebug();
}

export function syncAudio(state: AppState, userGesture = false, view: AudioView = 'game'): void {
  activated ||= userGesture;
  enabled = state.settings.sound;
  if (!enabled || !activated) {
    music?.pause();
    effects.forEach(audio => audio.pause());
    effects.clear();
    updateAudioDebug();
    return;
  }
  const context = musicFor(state, view);
  const nextPath = assetPath(`audio/bgm_${context}`) ?? assetPath('audio/bgm_main');
  musicVolume = { main: 0.23, intro: 0.17, bar: 0.35, party: 0.2 }[context];
  musicStart = context === 'party' ? 3 : 0;
  if (!nextPath) { music?.pause(); music = null; musicPath = ''; return; }
  if (musicPath !== nextPath) {
    music?.pause();
    music = new Audio(import.meta.env.BASE_URL + nextPath);
    const track = music;
    const start = musicStart;
    music.preload = 'metadata';
    music.volume = 0;
    music.addEventListener('timeupdate', setMusicEnvelope);
    music.addEventListener('loadedmetadata', () => { if (start) track.currentTime = start; });
    music.addEventListener('playing', updateAudioDebug);
    music.addEventListener('pause', updateAudioDebug);
    music.addEventListener('ended', () => {
      if (enabled && activated && track === music) { track.currentTime = start; track.volume = 0; void track.play().catch(() => {}); }
    });
    musicPath = nextPath;
  }
  if (music?.paused) void music.play().catch(() => { /* Await the next user gesture if playback is blocked. */ });
}

export function playSound(key: SoundCue): void {
  if (!enabled || !activated) return;
  const path = assetPath(`audio/sfx_${key}`);
  if (!path) return;
  const audio = new Audio(import.meta.env.BASE_URL + path);
  audio.volume = { move: 0.3, land: 0.6, card: 0.23, choose: 0.24, hired: 0.3, boss: 0.8, ending: 0.7, flip: 0.5 }[key];
  lastCue = key;
  updateAudioDebug();
  effects.add(audio);
  const release = () => effects.delete(audio);
  audio.addEventListener('ended', release, { once: true });
  audio.addEventListener('error', release, { once: true });
  void audio.play().catch(release);
}

export function hasAudio(): boolean {
  return ['bgm_main', 'bgm_intro', 'bgm_bar', 'bgm_party', 'sfx_move', 'sfx_land', 'sfx_card', 'sfx_choose', 'sfx_hired', 'sfx_boss', 'sfx_ending', 'sfx_flip'].some(key => Boolean(assetPath(`audio/${key}`)));
}
