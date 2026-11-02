import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fresh } from '../game/test-helpers';
import { BOARD } from '../game/board';

vi.mock('./assets', () => ({ assetPath: (key: string) => `assets/${key}.m4a` }));
const playing: FakeAudio[] = [];
const loadedAudio: (typeof import('./audio'))[] = [];
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
  removeAttribute = vi.fn();
  load = vi.fn();
  addEventListener(type: string, listener: ()=>void) { this.listeners.set(type, [...(this.listeners.get(type)??[]), listener]); }
  emit(type: string) { this.listeners.get(type)?.forEach(listener=>listener()); }
}
beforeEach(() => { vi.resetModules(); playing.length=0; vi.stubGlobal('Audio', FakeAudio); });
afterEach(() => { loadedAudio.splice(0).forEach(audio => audio.disposeAudio()); vi.unstubAllGlobals(); });

describe('optional music and effects', () => {
  it('waits for a gesture, switches contextual music, and resumes muted music without replaying effects', async () => {
    const audio = await import('./audio');
    loadedAudio.push(audio);
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
    loadedAudio.push(audio);
    const state = fresh(); state.settings.sound=false;
    audio.syncAudio(state,true);
    audio.playSound('card');
    expect(playing).toHaveLength(0);
    expect(audio.audioStatus()).toBe('Sound: muted');
  });
  it('fades the excerpt edges and does not let an old track restart after switching', async () => {
    const audio=await import('./audio');const state=fresh();state.settings.sound=true;
    loadedAudio.push(audio);
    audio.syncAudio(state,true);const intro=playing[0];
    intro.currentTime=.35;intro.emit('timeupdate');expect(intro.volume).toBeCloseTo(.085);
    intro.currentTime=119.65;intro.emit('timeupdate');expect(intro.volume).toBeCloseTo(.085);
    state.run!.phase='board';audio.syncAudio(state);const main=playing[1];
    expect(intro.removeAttribute).toHaveBeenCalledWith('src');
    expect(intro.load).toHaveBeenCalledOnce();
    intro.paused=false;intro.emit('playing');expect(intro.paused).toBe(true);
    main.currentTime=20;intro.emit('ended');expect(main.currentTime).toBe(20);
    main.currentTime=120;main.emit('ended');expect(main.currentTime).toBe(0);expect(main.volume).toBe(0);
    expect(main.play).toHaveBeenCalledTimes(2);
  });
});

class FakeDocument extends EventTarget {
  visibilityState = 'visible';
  getElementById() { return null; }
  visibility(value: string) { this.visibilityState=value;this.dispatchEvent(new Event('visibilitychange')); }
}
class FakeChannel extends EventTarget {
  static instances: FakeChannel[] = [];
  closed = false;
  messages: unknown[] = [];
  constructor(readonly name: string) { super();FakeChannel.instances.push(this); }
  postMessage(data: unknown) {
    this.messages.push(data);
    for(const other of FakeChannel.instances) if(other !== this && !other.closed && other.name===this.name) {
      other.dispatchEvent(new MessageEvent('message',{data}));
    }
  }
  close() { this.closed=true; }
}
async function page(withChannel = true) {
  vi.resetModules();
  const document = new FakeDocument(), window = new EventTarget();
  vi.stubGlobal('document',document);vi.stubGlobal('window',window);
  vi.stubGlobal('BroadcastChannel',withChannel ? FakeChannel : undefined);
  const audio = await import('./audio');loadedAudio.push(audio);
  return {audio,document,window};
}

describe('audio page ownership and lifecycle', () => {
  beforeEach(() => { FakeChannel.instances=[]; });
  it('lets only the latest active visible page play, without passive renders or stale claims taking ownership', async () => {
    const first=await page(), second=await page();
    const menu=fresh(), game=fresh();game.run!.phase='board';
    first.audio.syncAudio(menu,true,'title');const intro=playing[0];
    const oldClaim=FakeChannel.instances[0].messages.at(-1);
    second.audio.syncAudio(game,true,'game');const main=playing[1];
    expect(intro.paused).toBe(true);expect(main.paused).toBe(false);
    expect(first.audio.audioStatus()).toBe('Sound: another game tab is playing');
    first.audio.syncAudio(menu,false,'title');first.audio.playSound('card');
    expect(playing).toHaveLength(2);expect(intro.paused).toBe(true);expect(main.paused).toBe(false);
    FakeChannel.instances[1].dispatchEvent(new MessageEvent('message',{data:oldClaim}));
    expect(main.paused).toBe(false);
    first.audio.syncAudio(menu,true,'title');
    expect(intro.paused).toBe(false);expect(main.paused).toBe(true);
    expect(menu.settings.sound).toBe(true);expect(game.settings.sound).toBe(true);
    expect(playing.filter(track=>!track.paused)).toHaveLength(1);
    expect(FakeChannel.instances.every(channel=>channel.name==='sameRules.audio')).toBe(true);
  });
  it('suspends music and effects while hidden, resumes current music only, and respects mute on return', async () => {
    const {audio,document,window}=await page();const state=fresh();state.run!.phase='board';
    audio.syncAudio(state,true);const music=playing[0];music.currentTime=18;
    audio.playSound('choose');const effect=playing[1];
    document.visibility('hidden');
    expect(playing.every(track=>track.paused)).toBe(true);
    audio.syncAudio(state,true);audio.playSound('land');expect(playing).toHaveLength(2);
    effect.paused=false;effect.emit('playing');expect(effect.paused).toBe(true);
    music.paused=false;music.emit('playing');expect(music.paused).toBe(true);
    document.visibility('visible');
    expect(music.paused).toBe(false);expect(music.currentTime).toBe(18);expect(effect.paused).toBe(true);
    window.dispatchEvent(new Event('pagehide'));
    expect(music.paused).toBe(true);music.emit('ended');expect(music.paused).toBe(true);
    window.dispatchEvent(new Event('pageshow'));expect(music.paused).toBe(false);
    state.settings.sound=false;audio.syncAudio(state,true);
    document.visibility('hidden');document.visibility('visible');window.dispatchEvent(new Event('focus'));
    expect(music.paused).toBe(true);expect(audio.audioStatus()).toBe('Sound: muted');
  });
  it('does not autoplay an unactivated returning page and cleans up listeners and channel on disposal', async () => {
    const {audio,document,window}=await page();const state=fresh();
    audio.syncAudio(state);window.dispatchEvent(new Event('pageshow'));window.dispatchEvent(new Event('focus'));
    expect(playing).toHaveLength(0);
    audio.syncAudio(state,true);const music=playing[0];
    audio.disposeAudio();expect(music.paused).toBe(true);expect(music.load).toHaveBeenCalledOnce();
    expect(FakeChannel.instances[0].closed).toBe(true);
    document.visibility('visible');window.dispatchEvent(new Event('pageshow'));window.dispatchEvent(new Event('focus'));
    audio.syncAudio(state,true);audio.playSound('card');expect(playing).toHaveLength(1);
    music.paused=false;music.emit('playing');expect(music.paused).toBe(true);
  });
  it('retains visibility protection when BroadcastChannel is unavailable', async () => {
    const {audio,document}=await page(false);const state=fresh();
    audio.syncAudio(state,true);expect(playing[0].paused).toBe(false);
    document.visibility('hidden');expect(playing[0].paused).toBe(true);
    document.visibility('visible');expect(playing[0].paused).toBe(false);
  });
  it('pauses an unfocused but still-visible window until focus returns, without changing its preference', async () => {
    const {audio,document,window}=await page();const state=fresh();state.run!.phase='board';
    audio.syncAudio(state,true);const music=playing[0];music.currentTime=12;
    audio.playSound('card');const effect=playing[1];
    window.dispatchEvent(new Event('blur'));
    expect(document.visibilityState).toBe('visible');
    expect(audio.audioStatus()).toBe('Sound: paused while this window is inactive');
    audio.syncAudio(state);audio.playSound('land');document.visibility('visible');
    expect(playing).toHaveLength(2);expect(playing.every(track=>track.paused)).toBe(true);
    music.emit('ended');expect(music.paused).toBe(true);
    window.dispatchEvent(new Event('focus'));
    expect(music.paused).toBe(false);expect(music.currentTime).toBe(12);expect(effect.paused).toBe(true);
    expect(state.settings.sound).toBe(true);
  });
  it('lets an interacted muted page silence another page without changing either saved preference', async () => {
    const first=await page(), second=await page();
    const audible=fresh(), muted=fresh();muted.settings.sound=false;
    first.audio.syncAudio(audible,true,'title');const music=playing[0];
    expect(music.paused).toBe(false);
    second.audio.syncAudio(muted,true,'game');
    expect(playing).toHaveLength(1);expect(music.paused).toBe(true);
    expect(second.audio.audioStatus()).toBe('Sound: muted');
    expect(audible.settings.sound).toBe(true);expect(muted.settings.sound).toBe(false);
    first.audio.syncAudio(audible);expect(music.paused).toBe(true);
    first.audio.syncAudio(audible,true,'title');expect(music.paused).toBe(false);
    expect(muted.settings.sound).toBe(false);
  });
});
