import { BOARD } from '../game/board';
import type { AppState } from '../game/types';

export type SoundCue = 'move' | 'land' | 'card' | 'choose' | 'hired' | 'boss' | 'ending' | 'flip';
export type MusicCue = 'main' | 'intro' | 'bar' | 'party';
export type AudioView = 'title' | 'game' | 'gallery' | 'settings' | 'epilogue';

export function musicFor(state: AppState, view: AudioView = 'game'): MusicCue {
  if (view === 'title' || view === 'epilogue' || !state.run) return 'intro';
  if (view === 'gallery') return 'main';
  const run = state.run;
  if (['intro', 'chapter', 'promotion'].includes(run.phase)) return 'intro';
  if (['card', 'result'].includes(run.phase)) {
    const cardId = BOARD[run.position]?.cardId;
    if (cardId === 'C2-03') return 'bar';
    if (cardId === 'C3-05') return 'party';
  }
  return 'main';
}

export function transitionSounds(before: AppState, after: AppState): { start: SoundCue[]; arrival: SoundCue[] } {
  const previous = before.run, run = after.run;
  if (!previous || !run || previous === run) return { start: [], arrival: [] };
  const moved = previous.position !== run.position;
  const chose = Object.keys(run.choices).length > Object.keys(previous.choices).length;
  const ended = run.phase === 'ending' && previous.phase !== 'ending';
  const hired = chose && run.result?.cardId === 'C1-B'
    && (run.endingId === 'E02' || run.pendingMilestoneId === 'CH1-E01');
  const conclusion: SoundCue[] = hired ? ['hired'] : ended ? ['ending'] : [];
  if (moved) {
    const arrival: SoundCue[] = ['land', ...conclusion];
    if (run.phase === 'card') arrival.push(BOARD[run.position]?.kind === 'boss' ? 'boss' : 'card');
    return { start: ['move'], arrival };
  }
  return { start: conclusion.length ? conclusion : chose ? ['choose'] : [], arrival: [] };
}
