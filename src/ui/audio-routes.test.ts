import { describe, expect, it } from 'vitest';
import { BOARD } from '../game/board';
import { advance, createInitialState, startCareer } from '../game/state';
import { loadTeamData } from '../game/test-helpers';
import { musicFor, transitionSounds } from './audio-routes';

const data = loadTeamData();
function career() { return startCareer(createInitialState(), 'female', data); }

describe('authored audio placement', () => {
  it('switches the actual entry flow from the title/opening track to gameplay before the first choice', () => {
    let state = createInitialState();
    expect(musicFor(state, 'title')).toBe('intro');
    state = startCareer(state, 'female', data);
    expect(musicFor(state, 'game')).toBe('intro');
    state = advance(state, data);
    expect(state.run!.phase).toBe('board');
    expect(musicFor(state, 'game')).toBe('main');
    state = advance(state, data);
    expect(state.run!.phase).toBe('card');
    expect(musicFor(state, 'game')).toBe('main');
  });
  it('keeps introduction music separate and places bar and party music only in their live scenes/results', () => {
    const state = career();
    expect(musicFor(state)).toBe('intro');
    for (const [card, expected] of [['C2-03', 'bar'], ['C3-05', 'party']] as const) {
      state.run!.position = BOARD.findIndex(tile => tile.cardId === card);
      for (const phase of ['card','result'] as const) { state.run!.phase=phase; expect(musicFor(state)).toBe(expected); }
      state.run!.phase='board';expect(musicFor(state)).toBe('main');
      state.run!.phase='card';expect(musicFor(state,'gallery')).toBe('main');expect(musicFor(state,'title')).toBe('intro');
    }
  });
  it('places movement before landing and gives Boss entry its own cue', () => {
    const before=career();before.run!.phase='board';before.run!.position=4;
    const after=structuredClone(before);after.run!.position=5;after.run!.phase='card';
    expect(transitionSounds(before,after)).toEqual({start:['move'],arrival:['land','boss']});
    after.run!.position=1;
    expect(transitionSounds(before,after)).toEqual({start:['move'],arrival:['land','card']});
  });
  it('does not celebrate rejection or burnout and does not replay cues on continuation', () => {
    const before=career();before.run!.phase='card';
    const after=structuredClone(before);after.run!.choices['C1-B']=1;after.run!.phase='ending';
    after.run!.result={cardId:'C1-B',option:1,text:'',expression:'',npc:'',passed:null};
    for (const ending of ['E03','E11']) { after.run!.endingId=ending;expect(transitionSounds(before,after).start).toEqual(['ending']); }
    after.run!.endingId='E02';expect(transitionSounds(before,after).start).toEqual(['hired']);
    after.run!.endingId=null;after.run!.phase='result';after.run!.pendingMilestoneId='CH1-E01';expect(transitionSounds(before,after).start).toEqual(['hired']);
    const next=structuredClone(after);next.run!.phase='milestone';expect(transitionSounds(after,next)).toEqual({start:[],arrival:[]});
    expect(transitionSounds(before,before)).toEqual({start:[],arrival:[]});
  });
});
