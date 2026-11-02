import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialStats, RULES } from '../config/rules';
import { BOARD } from './board';
import { matchesCondition, parseCondition } from './conditions';
import { isValidState, loadState, resetStorage, saveState } from './persistence';
import { advance, chooseOption, createInitialState, getOptions, getOptionAvailability, startCareer, updateSettings } from './state';
import { atCard, fresh, loadTeamData, play } from './test-helpers';
import type { AppState, Pawn } from './types';

function memoryStorage() {
  const records = new Map<string, string>();
  const storage = { getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => { records.set(key, value); },
    removeItem: (key: string) => { records.delete(key); } };
  vi.stubGlobal('localStorage', storage);
  return storage;
}
afterEach(() => vi.unstubAllGlobals());

describe('authored career structure', () => {
  it('retains 22 board tiles and 20 fixed card slots while starting six equal abilities', () => {
    expect(BOARD).toHaveLength(22);
    expect(BOARD.filter((tile) => tile.cardId)).toHaveLength(20);
    expect(new Set(BOARD.map((tile) => tile.row + '/' + tile.col)).size).toBe(22);
    expect(fresh('female').run!.stats).toEqual(fresh('male').run!.stats);
    expect(initialStats()).toEqual({ Creativity: 3, Communication: 3, Network: 2, Reputation: 2, Availability: 2, Energy: 7 });
  });

  it.each(['female', 'male'] as const)('plays all authored chapters with %s, preserves every phase and loops with an approved policy', (pawn) => {
    memoryStorage();
    const data = loadTeamData();
    const seen = new Set<string>();
    const finished = play(fresh(pawn, data), data, {}, undefined, (state) => {
      seen.add(state.run!.phase);
      expect(isValidState(state), JSON.stringify({ phase: state.run!.phase, position: state.run!.position })).toBe(true);
      expect(saveState(state)).toBe(true);
      expect(loadState()).toEqual(state);
    });
    expect(finished.run).toMatchObject({ phase: 'ending', position: 0, endingId: 'E14', policiesSet: ['transparent'], reachedDirector: true });
    expect(Object.keys(finished.run!.choices)).toHaveLength(20);
    expect(seen.has('chapter')).toBe(true);
    expect(seen.has('milestone')).toBe(true);
    expect(seen.has('promotion')).toBe(true);
    expect(finished.lineage).toHaveLength(1);
    const nextPawn: Pawn = pawn === 'female' ? 'male' : 'female';
    const next = startCareer(finished, nextPawn, data);
    expect(next.run!.character.pawn).toBe(nextPawn);
    expect(next.run!.gatekeeper).toEqual(finished.run!.character);
    expect(next.run!.activePolicies).toEqual(['transparent']);
    expect(next.run!.stats).toEqual(initialStats());
    expect(play(next, data).lineage).toHaveLength(2);
  });

  it('does not allow duplicate choices, restarts or bypassing the promotion', () => {
    const data = loadTeamData();
    const start = fresh('female', data);
    expect(startCareer(start, 'male', data)).toBe(start);
    expect(chooseOption(start, 1, data)).toBe(start);
    const card = atCard('C1-01', 'female', {}, data);
    expect(advance(card, data)).toBe(card);
    expect(chooseOption(card, 4, data)).toBe(card);
    const chosen = chooseOption(card, 1, data);
    expect(chooseOption(chosen, 2, data)).toBe(chosen);
    const ideal = atCard('C3-B', 'female', {}, data);
    const passed = chooseOption(ideal, 1, data);
    const promotion = advance(advance(passed, data), data);
    expect(promotion.run).toMatchObject({ position: 17, phase: 'promotion', reachedDirector: true });
    const forged = { ...ideal, run: { ...ideal.run!, phase: 'board' as const } };
    expect(advance(forged, data)).toBe(forged);
    const fourth = advance(advance(promotion, data), data);
    expect(fourth.run!.position).toBe(18);
    expect(getOptions({ ...fourth.run!, reachedDirector: false }, data)).toEqual([]);
  });
});

describe('authored branches and numerical gates', () => {
  it.each([
    [{ Creativity: 5, Communication: 2 }, null],
    [{ Creativity: 4, Communication: 5 }, 'E02'],
    [{ Creativity: 4, Communication: 4 }, 'E03'],
  ])('resolves the single Gatekeeper option from pre-choice values %j', (stats, ending) => {
    const data = loadTeamData();
    const state = atCard('C1-B', 'female', {}, data);
    state.run!.stats = { ...state.run!.stats, ...stats };
    delete state.run!.statHistory;
    expect(getOptions(state.run!, data)).toHaveLength(1);
    const result = chooseOption(state, 1, data);
    expect(result.run!.endingId).toBe(ending);
    if (ending === null) {
      expect(result.run!.result!.text).toContain('Junior Producer');
      expect(advance(result, data).run).toMatchObject({ phase: 'milestone', milestoneId: 'CH1-E01' });
    } else expect(result.run!.phase).toBe('ending');
  });

  it('shows four options including D, chooses the next-morning branch, and ends D at E10', () => {
    const data = loadTeamData();
    for (const pawn of ['female', 'male'] as const) {
      const card = atCard('C2-03', pawn, {}, data);
      expect(getOptions(card.run!, data).map((option) => option.option)).toEqual([1, 2, 3, 4]);
      const result = chooseOption(card, 4, data);
      const nextMorning = advance(advance(result, data), data);
      expect(nextMorning.run!.flags!.c2_branch).toBe('D');
      expect(getOptions(nextMorning.run!, data)).toHaveLength(1);
      expect(getOptions(nextMorning.run!, data)[0].automatic).toBe(true);
      expect(chooseOption(nextMorning, 1, data).run!.endingId).toBe('E10');
    }
    const female = atCard('C2-04', 'female');
    const male = atCard('C2-04', 'male');
    expect(getOptions(female.run!, data)).toHaveLength(4);
    expect(getOptions(male.run!, data)).toHaveLength(3);
    expect(chooseOption(female, 4, data).run!.endingId).toBe('E08');
  });

  it('keeps unavailable Boss options visible and checks thresholds before awarding their points', () => {
    const data = loadTeamData();
    const card = atCard('C2-B', 'female', {}, data);
    card.run!.stats = { ...card.run!.stats, Network: 4, Creativity: 5 };
    const options = getOptions(card.run!, data);
    expect(options).toHaveLength(3);
    expect(getOptionAvailability(card.run!, options[0])).toEqual({ enabled: false, reason: "Maybe I'm just not likeable enough." });
    expect(getOptionAvailability(card.run!, options[1]).enabled).toBe(false);
    expect(chooseOption(card, 1, data)).toBe(card);
    expect(chooseOption(card, 2, data)).toBe(card);
    expect(chooseOption(card, 3, data).run!.endingId).toBe('E09');
    const male = atCard('C2-B', 'male', {}, data);
    expect(chooseOption(male, 3, data).run!.endingId).toBeNull();
  });

  it('branches on children and a prior promise, and applies the promised-no-kids penalty only to the female pawn', () => {
    const data = loadTeamData();
    const card = atCard('C3-02', 'female', { 'C3-01': 3 }, data);
    const before = card.run!.stats.Reputation;
    const chosen = chooseOption(card, 1, data);
    expect(chosen.run!.flags).toMatchObject({ has_child: true, promised_no_kids: true });
    expect(chosen.run!.stats.Reputation).toBe(before - 1);
    const next = advance(advance(chosen, data), data);
    expect(getOptions(next.run!, data)[0].sourceCardId).toBe('C3-03a');
    expect(getOptions(atCard('C3-03').run!, data)[0].sourceCardId).toBe('C3-03b');
  });

  it.each([['female', false, 3, 'E07'], ['female', true, 3, 'E04'], ['male', false, 3, 'E04'], ['female', false, 2, 'E06']] as const)(
    'resolves Ideal Worker exit for %s, has_child=%s, option %s', (pawn, hasChild, option, ending) => {
      const data = loadTeamData();
      const state = atCard('C3-B', pawn, {}, data);
      state.run!.flags!.has_child = hasChild;
      expect(chooseOption(state, option, data).run!.endingId).toBe(ending);
    });

  it('ends the partner-primary male route at Family Man, and carries its Gatekeeper/line into the next female career', () => {
    const data = loadTeamData();
    const finished = play(fresh('male', data), data, { 'C3-02': 1, 'C3-03': 2, 'C3-04': 3, 'C3-05': 3 });
    expect(finished.run).toMatchObject({ endingId: 'E05', reachedDirector: false });
    const next = startCareer(finished, 'female', data);
    expect(next.run!.gatekeeper).toEqual(finished.run!.character);
    const talk = play(next, data, {}, 'C3-01');
    expect(getOptions(talk.run!, data)[0].scene).toContain("We assumed you'd want to slow down.");
  });

  it('ends burnout immediately, including when a choice would otherwise award a successful promotion', () => {
    const data = loadTeamData();
    const card = atCard('C3-B', 'female', {}, data);
    card.run!.stats.Energy = 1;
    delete card.run!.statHistory;
    const ended = chooseOption(card, 1, data);
    expect(ended.run).toMatchObject({ phase: 'ending', endingId: 'E11', stats: { Energy: 0 } });
    expect(ended.lineage).toHaveLength(1);
  });

  it('uses a strict System gate and only adopts approved or negotiated policy levels', () => {
    const data = loadTeamData();
    const card = atCard('C4-B', 'female', {}, data);
    card.run!.stats.Reputation = 5;
    const options = getOptions(card.run!, data);
    expect(getOptionAvailability(card.run!, options[0]).enabled).toBe(false);
    expect(chooseOption(card, 1, data)).toBe(card);
    const negotiated = chooseOption(card, 2, data);
    expect(negotiated.run!.policiesSet).toEqual(['coordinator']);
    expect(play(negotiated, data).run!.endingId).toBe('E13');
    const withdrawn = chooseOption(card, 3, data);
    expect(withdrawn.run!.policiesSet).toEqual([]);
    expect(play(withdrawn, data).run!.endingId).toBe('E12');
    const beforeBoss = atCard('C4-B', 'male', {}, data);
    expect(beforeBoss.run!.policiesSet).toEqual([]);
  });

  it('supports flags, pawn, stat and inherited-policy conditions with exact AND semantics', () => {
    const run = fresh().run!;
    run.flags!.has_child = true;
    run.activePolicies = ['transparent'];
    expect(matchesCondition('flag:has_child=true;pawn:female;stat:Energy>=7;policy:transparent', run)).toBe(true);
    expect(matchesCondition('!flag:has_child=true', run)).toBe(false);
    expect(matchesCondition('stat:Energy>7', run)).toBe(false);
    for (const invalid of ['unknown', 'stat:Skill>2', 'C1-01=5', 'round>=0', 'flag:x=true;']) expect(() => parseCondition(invalid)).toThrow();
  });
});

describe('storage isolation and resilience', () => {
  it('retains completed prototype reports with all eight original values and ending identities', () => {
    const storage = memoryStorage();
    const old = play(fresh('male'), loadTeamData());
    delete old.contentVersion;
    delete old.run!.contentVersion;
    old.run!.endingId = 'E02';
    old.lineage[0].endingId = 'E02';
    old.gallery[0].endingId = 'E02';
    const report = old.lineage[0].recap!;
    for (const values of [old.run!.stats, report.initialStats!, report.finalStats!, old.run!.statHistory!.initialStats!]) {
      values.Skill = 5; values.Money = 4;
    }
    for (const steps of [report.steps, old.run!.statHistory!.steps]) for (const step of steps) {
      for (const values of [step.before!, step.after!]) { values.Skill = 5; values.Money = 4; }
      for (const values of [step.requestedDelta!, step.actualDelta!]) { values.Skill = 0; values.Money = 0; }
    }
    storage.setItem(RULES.storagePrefix + 'snapshot', JSON.stringify(old));
    const migrated = loadState();
    expect(migrated.gallery).toEqual([]);
    expect(migrated.legacyArchive!.lineage[0].endingId).toBe('E02');
    expect(migrated.legacyArchive!.lineage[0].recap).toEqual(report);
    expect(Object.keys(migrated.legacyArchive!.lineage[0].recap!.finalStats!)).toHaveLength(8);
    expect(saveState(migrated)).toBe(true);
    expect(loadState().legacyArchive).toEqual(migrated.legacyArchive);
  });

  it('preserves an old eight-stat run and reports unchanged without importing old ending meanings', () => {
    const storage = memoryStorage();
    const old = fresh();
    delete old.contentVersion;
    delete old.run!.contentVersion;
    old.run!.stats = { ...old.run!.stats, Skill: 5, Money: 5 };
    delete old.run!.statHistory;
    storage.setItem(RULES.storagePrefix + 'snapshot', JSON.stringify(old));
    const migrated = loadState();
    expect(migrated.run).toBeNull();
    expect(migrated.migrationNotice).toBe(true);
    expect(migrated.legacyArchive!.run).toEqual(old.run);
    expect(saveState(migrated)).toBe(true);
    expect(loadState()).toEqual(migrated);
    const next = startCareer(migrated, 'male', loadTeamData());
    expect(next.legacyArchive).toEqual(migrated.legacyArchive);
    expect(next.run!.stats).toEqual(initialStats());
    expect(next.migrationNotice).toBe(false);
  });

  it('rejects invalid progress but discards only corrupt optional recap data', () => {
    const storage = memoryStorage();
    const valid = atCard('C2-01');
    const broken = structuredClone(valid);
    broken.run!.statHistory!.steps[0].actualDelta.Energy = 99;
    storage.setItem(RULES.storagePrefix + 'snapshot', JSON.stringify(broken));
    const recovered = loadState();
    expect(recovered.run!.choices).toEqual(valid.run!.choices);
    expect(recovered.run!.statHistory).toBeUndefined();
    for (const raw of ['{broken', '{}', JSON.stringify({ ...valid, run: { ...valid.run, position: 99 } })]) {
      storage.setItem(RULES.storagePrefix + 'snapshot', raw);
      expect(loadState()).toEqual(createInitialState());
    }
  });

  it('preserves unrelated browser keys, settings and unavailable-storage behavior', () => {
    const storage = memoryStorage();
    const changed = updateSettings(createInitialState(), { sound: true, reducedMotion: true, guideHidden: true });
    expect(startCareer(changed, 'male', loadTeamData()).settings).toEqual(changed.settings);
    saveState(changed);
    storage.setItem('unrelated', 'keep');
    resetStorage();
    expect(storage.getItem('unrelated')).toBe('keep');
    vi.stubGlobal('localStorage', { getItem() { throw Error('blocked'); }, setItem() { throw Error('full'); }, removeItem() { throw Error('blocked'); } });
    expect(loadState()).toEqual(createInitialState());
    expect(saveState(changed)).toBe(false);
    expect(() => resetStorage()).not.toThrow();
  });
});
