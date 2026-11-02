import { describe, expect, it } from 'vitest';
import { advance, chooseOption, getOptions } from './state';
import { atCard, loadTeamData } from './test-helpers';

describe('inherited authored policies', () => {
  it('transparent policy cancels the specified female Network penalty and makes the written-criteria result match the male result', () => {
    const data = loadTeamData();
    const card = atCard('C2-02');
    card.run!.activePolicies = ['transparent'];
    const before = card.run!.stats.Network;
    const chosen = chooseOption(card, 2, data);
    expect(chosen.run!.stats.Network).toBe(before);
    const boss = atCard('C2-B');
    boss.run!.activePolicies = ['transparent'];
    const source = getOptions(boss.run!, data).find((row) => row.option === 2)!;
    const passed = chooseOption(boss, 2, data);
    expect(passed.run!.result!.text).toBe(source.results.male);
    expect(passed.run!.statHistory!.steps.at(-1)!.requestedDelta).toMatchObject({ Communication: 1, Reputation: 1, Creativity: 0 });
  });

  it('coordinator removes only the authored negative Reputation penalty; branch B remains its written +1', () => {
    const data = loadTeamData();
    for (const branch of [1, 2, 3]) {
      const card = atCard('C2-04', 'female', { 'C2-03': branch });
      card.run!.activePolicies = ['coordinator'];
      const before = card.run!.stats.Reputation;
      const chosen = chooseOption(card, 2, data);
      expect(chosen.run!.stats.Reputation).toBe(before + (branch === 2 ? 1 : 0));
    }
  });

  it('records the hidden maternal entry change once and transparent policy prevents it', () => {
    const data = loadTeamData();
    for (const transparent of [false, true]) {
      const card = atCard('C2-B');
      if (transparent) card.run!.activePolicies = ['transparent'];
      const before = card.run!.stats.Availability;
      let state = chooseOption(card, 2, data);
      state = advance(advance(state, data), data);
      expect(state.run!.phase).toBe('chapter');
      expect(state.run!.stats.Availability).toBe(before - (transparent ? 0 : 1));
      expect(state.run!.statHistory!.steps.filter((step) => step.kind === 'system')).toHaveLength(transparent ? 0 : 1);
      expect(advance(state, data).run!.stats.Availability).toBe(state.run!.stats.Availability);
    }
  });

  it('blind hiring cancels only the female transparent-proposal penalty', () => {
    const data = loadTeamData();
    const card = atCard('C4-03');
    const before = card.run!.stats.Reputation;
    expect(card.run!.flags!.hire).toBe('blind');
    expect(chooseOption(card, 3, data).run!.stats.Reputation).toBe(before);
    card.run!.flags!.hire = 'support';
    expect(chooseOption(card, 3, data).run!.stats.Reputation).toBe(before - 1);
  });
});
