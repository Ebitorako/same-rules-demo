import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { localizeData, localizeState, parseTranslationCatalog } from '../data/localize';
import { BOARD } from '../game/board';
import { chooseOption, createInitialState, getOptions, startCareer } from '../game/state';
import type { AppState, GameData, Pawn } from '../game/types';
import { richText } from './dom';
import { choiceHistoryDialog } from './history';
import { setLocale, t } from './i18n';

vi.mock('virtual:art-index', () => ({ default: [] }));
const translations = parseTranslationCatalog(readFileSync('public/data/zh-CN.json', 'utf8'));
afterEach(() => setLocale('en'));

function fixture(pawn: Pawn = 'female'): { state: AppState; data: GameData } {
  const data: GameData = JSON.parse(readFileSync('public/data/team-content.json', 'utf8'));
  const state = startCareer(createInitialState(), pawn, data);
  state.run!.phase = 'board';
  state.run!.flags = { ...state.run!.flags, c2_branch: 'A', policy: 'transparent' };
  return { state, data };
}

function record(state: AppState, data: GameData, id: string, option: number): AppState {
  const positioned = structuredClone(state);
  positioned.run!.phase = 'card';
  positioned.run!.position = BOARD.findIndex(tile => tile.cardId === id);
  positioned.run!.reachedDirector = BOARD[positioned.run!.position].chapter === 4;
  return chooseOption(positioned, option, data);
}

describe('recorded formal story dialog', () => {
  it.each(['en', 'zh-CN'] as const)('shows saved source D as option 4 in %s without rewriting the recorded choice', locale => {
    setLocale(locale);
    for (const pawn of ['female', 'male'] as const) {
      const { state, data } = fixture(pawn);
      const saved: AppState = JSON.parse(JSON.stringify(record(state, data, 'C2-03', 4)));
      expect(saved.run!.chosenScenarios!['C2-03'].optionLabel).toBe('D');
      expect(saved.run!.flags!.c2_branch).toBe('D');
      const before = JSON.stringify(saved);
      const shown = localizeState(saved, translations, locale);
      const html = choiceHistoryDialog(shown, localizeData(data, translations, locale), 'C2-03');
      expect(html).toContain(`${t('Your choice · Option')} 4</h3>`);
      expect(html).not.toContain(`${t('Your choice · Option')} D`);
      expect(html).toContain(richText(shown.run!.chosenScenarios!['C2-03'].optionText));
      expect(html).toContain(richText(shown.run!.chosenScenarios!['C2-03'].results[pawn]));
      expect(JSON.stringify(saved)).toBe(before);
    }
  });

  it.each(['en', 'zh-CN'] as const)('keeps the forced exit acknowledgement as Continue in %s history', locale => {
    setLocale(locale);
    const { state, data } = fixture();
    const chosen = record(record(state, data, 'C2-03', 4), data, 'C2-04', 1);
    expect(chosen.run!.endingId).toBe('E10');
    // The automatic flag is sufficient even if an earlier save lacks the source label.
    delete chosen.run!.chosenScenarios!['C2-04'].optionLabel;
    const shown = localizeState(chosen, translations, locale);
    const html = choiceHistoryDialog(shown, localizeData(data, translations, locale), 'C2-04');
    expect(html).toContain(`${t('Your choice · Option')} ${t('Continue')}</h3>`);
    expect(html).toContain(`<p class="history-chosen-text">${t('Continue')}</p>`);
    expect(html).not.toContain(`${t('Your choice · Option')} 1`);
  });

  it.each(['female', 'male'] as const)('shows the selected %s response without exposing other results or numerical changes', pawn => {
    const { state, data } = fixture(pawn);
    const chosen = record(state, data, 'C2-03', 2);
    const row = chosen.run!.chosenScenarios!['C2-03'];
    const html = choiceHistoryDialog(chosen, data, 'C2-03');
    expect(html).toContain(richText(row.scene));
    expect(html).toContain(richText(row.optionText));
    expect(html).toContain(richText(row.results[pawn]));
    const otherPawn = pawn === 'female' ? 'male' : 'female';
    if (row.results[otherPawn] && row.results[otherPawn] !== row.results[pawn]) expect(html).not.toContain(richText(row.results[otherPawn]));
    expect(html).toContain('Your choice · Option 2');
    expect(html).not.toContain('data-action="choose"');
    expect(html).not.toContain('data-action="advance"');
    expect(html).not.toContain('Network+');
    expect(html).not.toContain('Numerical review');
  });

  it('navigates only through recorded choices in board order', () => {
    const { state, data } = fixture();
    let chosen = record(state, data, 'C1-01', 1);
    chosen = record(chosen, data, 'C1-02', 2);
    chosen = record(chosen, data, 'C1-03', 3);
    const middle = choiceHistoryDialog(chosen, data, 'C1-02');
    expect(middle).toContain('CHOICE 02 · Ch1');
    expect(middle).toContain('data-card="C1-01"');
    expect(middle).toContain('data-card="C1-03"');
    expect(middle).not.toContain('data-card="C1-04"');
    expect(choiceHistoryDialog(chosen, data, 'C1-01')).not.toContain('Previous choice');
    expect(choiceHistoryDialog(chosen, data, 'C1-03')).not.toContain('Next choice');
    expect(choiceHistoryDialog(chosen, data, 'C1-04')).toBe('');
  });

  it('freezes conditional scene and actual policy-adjusted result even after flags and the source change', () => {
    const { state, data } = fixture();
    state.run!.activePolicies = ['transparent'];
    state.run!.stats.Creativity = 6;
    const chosen = record(state, data, 'C2-B', 2);
    const saved = structuredClone(chosen.run!.chosenScenarios!['C2-B']);
    expect(saved.results.female).toBe(data.scenarios.find(r => r.cardId === 'C2-B' && r.option === 2)!.results.male);
    chosen.run!.flags = { ...chosen.run!.flags, policy: 'none', c2_branch: 'C' };
    chosen.run!.activePolicies = [];
    for (const row of data.scenarios.filter(r => r.cardId === 'C2-B')) {
      row.scene = 'A newly rewritten scene.';
      row.optionText = 'A new option after this career.';
      row.results.female = 'A new result after this career.';
    }
    const html = choiceHistoryDialog(chosen, data, 'C2-B');
    expect(html).toContain(richText(saved.scene));
    expect(html).toContain(richText(saved.results.female));
    expect(html).not.toContain('newly rewritten');
    expect(html).not.toContain('new option after');
    expect(html).not.toContain('new result after');
  });

  it('does not borrow future choices when resolving a record without a snapshot', () => {
    const { state, data } = fixture();
    state.run!.choices = { 'C1-01': 2, 'C1-02': 2, 'C1-03': 3 };
    const original = data.scenarios.find(row => row.cardId === 'C1-02' && row.option === 2)!;
    data.scenarios.push(
      { ...structuredClone(original), condition: 'C1-01=2', optionText: 'The earlier opportunity.', results: { female: 'The earlier response.', male: 'Other response.' } },
      { ...structuredClone(original), condition: 'C1-03=3', optionText: 'A later alternative.' },
    );
    const html = choiceHistoryDialog(state, data, 'C1-02');
    expect(html).toContain('The earlier opportunity.');
    expect(html).toContain('The earlier response.');
    expect(html).not.toContain('A later alternative.');
  });

  it('preserves the actual hiring choice instead of substituting a candidate widget after data is reordered', () => {
    const { state, data } = fixture();
    const chosen = record(state, data, 'C4-01', 3);
    const row = chosen.run!.chosenScenarios!['C4-01'];
    data.candidates.reverse();
    data.candidates[0].name = 'Changed later';
    const html = choiceHistoryDialog(chosen, data, 'C4-01');
    expect(html).toContain(richText(row.optionText));
    expect(html).toContain(richText(row.results.female));
    expect(html).not.toContain('Changed later');
    expect(html).not.toContain('candidate information');
    expect(chosen.run!.hiredIntern).toBe('chloe');
  });

  it('preserves C2-04’s selected A branch instead of showing a later branch', () => {
    const { state, data } = fixture();
    const chosen = record(state, data, 'C2-04', 2);
    const oldScene = chosen.run!.chosenScenarios!['C2-04'].scene;
    chosen.run!.flags!.c2_branch = 'D';
    const html = choiceHistoryDialog(chosen, data, 'C2-04');
    expect(html).toContain(richText(oldScene));
    expect(html).not.toContain('The forced-exit route triggers automatically.');
    expect(chosen.run!.chosenScenarios!['C2-04'].sourceCardId).toBe('C2-04A');
  });

  it('shows a missing-record notice instead of inventing absent content', () => {
    const { state, data } = fixture();
    state.run!.choices = { 'C1-01': 1, 'C1-02': 2, 'C1-03': 3 };
    data.scenarios = data.scenarios.filter(row => row.cardId !== 'C1-02');
    const html = choiceHistoryDialog(state, data, 'C1-02');
    expect(html).toContain('id="history-heading">Recorded choice');
    expect(html).toContain('currently unavailable');
    expect(html).not.toContain('What followed');
    expect(html).toContain('data-action="close-history"');
  });

  it('escapes saved source content, preserves multiline text and never changes the career', () => {
    const { state, data } = fixture();
    state.run!.phase = 'card';
    state.run!.position = BOARD.findIndex(tile => tile.cardId === 'C1-02');
    const row = getOptions(state.run!, data).find(item => item.option === 2)!;
    row.title = '<script>unsafe()</script>';
    row.optionText = '<img src=x onerror="unsafe()">';
    row.scene = 'A long scene.\r\n'.repeat(100) + 'SCENE END';
    row.results.female = 'Result first line.\nResult second line.\nRESULT END';
    const chosen = chooseOption(state, 2, data);
    const before = JSON.stringify(chosen);
    const html = choiceHistoryDialog(chosen, data, 'C1-02');
    expect(html).toContain('role="dialog" aria-modal="true" aria-labelledby="history-heading" tabindex="-1"');
    expect(html).toContain('role="region" aria-label="Recorded scene, choice and result" tabindex="0"');
    expect(html).toContain('&lt;script&gt;unsafe()&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img src=x onerror=&quot;unsafe()&quot;&gt;');
    expect(html).toContain('A long scene.<br>');
    expect(html).toContain('SCENE END');
    expect(html).toContain('Result first line.<br>Result second line.<br>RESULT END');
    expect(html).not.toContain('data-enter');
    expect(JSON.stringify(chosen)).toBe(before);
  });
});
