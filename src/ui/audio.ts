import type { AppState } from '../game/types';
import { BOARD } from '../game/board';
import { assetPath } from './assets';

let enabled = false;
let activated = false;
let music: HTMLAudioElement | null = null;
let musicPath = '';
const effects = new Set<HTMLAudioElement>();

export function syncAudio(state: AppState, userGesture = false): void {
  activated ||= userGesture;
  enabled = state.settings.sound;
  if (!enabled || !activated) {
    music?.pause();
    effects.forEach(audio => audio.pause());
    effects.clear();
    return;
  }
  const run = state.run;
  const boss = run && ['card', 'result'].includes(run.phase) && BOARD[run.position]?.kind === 'boss';
  const nextPath = (boss ? assetPath('audio/bgm_boss') : undefined) ?? assetPath('audio/bgm_main');
  if (!nextPath) return;
  if (musicPath !== nextPath) {
    music?.pause();
    music = new Audio(import.meta.env.BASE_URL + nextPath);
    music.loop = true;
    music.volume = 0.25;
    musicPath = nextPath;
  }
  if (music?.paused) void music.play().catch(() => { /* Await the next user gesture if playback is blocked. */ });
}

export function playSound(key: 'move' | 'card' | 'choose' | 'ending'): void {
  if (!enabled || !activated) return;
  const path = assetPath(`audio/sfx_${key}`);
  if (!path) return;
  const audio = new Audio(import.meta.env.BASE_URL + path);
  audio.volume = 0.5;
  effects.add(audio);
  const release = () => effects.delete(audio);
  audio.addEventListener('ended', release, { once: true });
  audio.addEventListener('error', release, { once: true });
  void audio.play().catch(release);
}

export function hasAudio(): boolean {
  return ['bgm_main', 'bgm_boss', 'sfx_move', 'sfx_card', 'sfx_choose', 'sfx_ending'].some(key => Boolean(assetPath(`audio/${key}`)));
}
