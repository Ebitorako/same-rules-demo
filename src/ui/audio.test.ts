import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fresh } from '../game/test-helpers';
import { BOARD } from '../game/board';

vi.mock('./assets', () => ({ assetPath: (key: string) => `assets/${key}.m4a` }));
const playing: FakeAudio[] = [];
class FakeAudio {
  paused = true;
  currentTime = 0;
  duration = 120;
  volume = 1;
  preload = '';
  listeners = new Map<string, (()=>void)[]>();
  constructor(readonly src: string) { playing.push(this); }
  play = vi.fn(() => { this.paused = false; return Promise.resolve(); });
  pause = vi.fn(() => { this.paused = true; });
  addEventListener(type: string, listener: ()=>void) { this.listeners.set(type, [...(this.listeners.get(type)??[]), listener]); }
  emit(type: string) { this.listeners.get(type)?.forEach(listener=>listener()); }
}
beforeEach(() => { vi.resetModules(); playing.length=0; vi.stubGlobal('Audio', FakeAudio); });
afterEach(() => vi.unstubAllGlobals());

describe('optional music and effects', () => {
  it('waits for a gesture, switches contextual music, and resumes muted music without replaying effects', async () => {
    const audio = await import('./audio');
    const state = fresh(); expect(state.settings.sound).toBe(true);
    audio.syncAudio(state); expect(playing).toHaveLength(0);
    expect(audio.audioStatus()).toBe('Sound: waiting for a player gesture');
    audio.syncAudio(state,true); expect(playing[0].src).toContain('bgm_intro');
    state.run!.phase='card'; state.run!.position=BOARD.findIndex(tile=>tile.cardId==='C2-03');
    audio.syncAudio(state); expect(playing[0].paused).toBe(true); expect(playing[1].src).toContain('bgm_bar');
    audio.playSound('choose'); expect(playing[2].paused).toBe(false);
    const bar = playing[1], effect = playing[2];
    bar.currentTime = 24.5;
    state.settings.sound=false; audio.syncAudio(state);
    expect(playing.every(item=>item.paused)).toBe(true);
    audio.playSound('card'); expect(playing).toHaveLength(3);
    state.settings.sound=true; audio.syncAudio(state,true);
    expect(playing).toHaveLength(3);
    expect(bar.paused).toBe(false);
    expect(bar.currentTime).toBe(24.5);
    expect(bar.play).toHaveBeenCalledTimes(2);
    expect(playing[0].paused).toBe(true);
    expect(effect.paused).toBe(true);
    expect(effect.play).toHaveBeenCalledTimes(1);
  });
  it('does not create audio when the first player gesture is already muted', async () => {
    const audio = await import('./audio');
    const state = fresh(); state.settings.sound=false;
    audio.syncAudio(state,true);
    audio.playSound('card');
    expect(playing).toHaveLength(0);
    expect(audio.audioStatus()).toBe('Sound: muted');
  });
  it('fades the excerpt edges and does not let an old track restart after switching', async () => {
    const audio=await import('./audio');const state=fresh();state.settings.sound=true;
    audio.syncAudio(state,true);const intro=playing[0];
    intro.currentTime=.35;intro.emit('timeupdate');expect(intro.volume).toBeCloseTo(.085);
    intro.currentTime=119.65;intro.emit('timeupdate');expect(intro.volume).toBeCloseTo(.085);
    state.run!.phase='board';audio.syncAudio(state);const main=playing[1];
    main.currentTime=20;intro.emit('ended');expect(main.currentTime).toBe(20);
    main.currentTime=120;main.emit('ended');expect(main.currentTime).toBe(0);expect(main.volume).toBe(0);
    expect(main.play).toHaveBeenCalledTimes(2);
  });
});
