import { describe, expect, it } from 'vitest';
import { getChoiceHistory } from './history';
import { chooseOption, getOptions } from './state';
import { atCard, fresh, loadTeamData, play } from './test-helpers';

describe('immutable completed-choice history', () => {
  it('keeps all 20 choices in board order while chapter events stay out of the card hand', () => {
    const data = loadTeamData();
    const finished = play(fresh(), data);
    const history = getChoiceHistory(finished.run!, data);
    expect(history).toHaveLength(20);
    expect(history[0].cardId).toBe('C1-01');
    expect(history.at(-1)!.cardId).toBe('C4-B');
    expect(finished.run!.statHistory!.steps).toHaveLength(21);
  });

  it('keeps the chosen conditional text and resolved policy result after later flags or source content change', () => {
    const data = loadTeamData();
    const card = atCard('C2-B');
    card.run!.activePolicies = ['transparent'];
    const selected = getOptions(card.run!, data).find((row) => row.option === 2)!;
    const state = chooseOption(card, 2, data);
    const text = selected.results.male;
    state.run!.activePolicies = [];
    state.run!.flags!.c2_branch = 'C';
    data.scenarios.forEach((row) => { row.results.female = 'Edited later'; row.optionText = 'Edited later'; });
    const history = getChoiceHistory(state.run!, data);
    expect(history.at(-1)!.scenario!.results.female).toBe(text);
    expect(history.at(-1)!.scenario!.optionText).not.toBe('Edited later');
  });

  it('shows no unchosen future card and never mutates current progress while browsing', () => {
    const data = loadTeamData();
    const state = atCard('C2-04');
    const before = JSON.stringify(state);
    const history = getChoiceHistory(state.run!, data);
    expect(history).toHaveLength(8);
    expect(history.some((entry) => entry.cardId === 'C2-04')).toBe(false);
    expect(getChoiceHistory(state.run!, data)).toEqual(history);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('retains an unavailable older choice without inventing its text', () => {
    const data = loadTeamData();
    const state = atCard('C1-02');
    delete state.run!.chosenScenarios;
    data.scenarios = data.scenarios.filter((row) => row.cardId !== 'C1-01');
    expect(getChoiceHistory(state.run!, data)[0]).toMatchObject({ cardId: 'C1-01', choice: 1, scenario: null });
  });
});
