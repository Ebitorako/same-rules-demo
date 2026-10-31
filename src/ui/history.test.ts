import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { RULES } from '../config/rules';
import { parseEndings, parseScenarios } from '../data/parse';
import { createInitialState, startCareer } from '../game/state';
import type { AppState, GameData, Pawn } from '../game/types';
import { escape, richText } from './dom';
import { choiceHistoryDialog } from './history';

vi.mock('virtual:art-index', () => ({ default: [] }));

function fixture(pawn: Pawn = 'female'): { state: AppState; data: GameData } {
  const read = (file: string) => readFileSync(`public/data/${file}`, 'utf8');
  const policies = JSON.parse(read('policies.json'));
  const data: GameData = {
    scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')),
    candidates: JSON.parse(read('candidates.json')).candidates,
    policies: policies.policies, powerTokens: policies.powerTokens, copy: JSON.parse(read('copy.json')),
  };
  const state = startCareer(createInitialState(), pawn, data);
  state.run!.phase = 'board';
  state.run!.choices = { 'C1-01': 1, 'C1-02': 2, 'C1-03': 3 };
  return { state, data };
}

describe('recorded choice dialog', () => {
  it.each(['female', 'male'] as const)('shows only the selected %s option and its result', pawn => {
    const { state, data } = fixture(pawn);
    state.run!.choices = { 'C2-03': 2 };
    const row = data.scenarios.find(item => item.cardId === 'C2-03' && item.option === 2 && item.pawn === pawn)!;
    const html = choiceHistoryDialog(state, data, 'C2-03');
    expect(html).toContain(richText(row.scene));
    expect(html).toContain(richText(row.optionText));
    expect(html).toContain(richText(row.results[pawn]));
    for (const other of data.scenarios.filter(item => item.cardId === 'C2-03' && item !== row)) {
      expect(html).not.toContain(richText(other.optionText));
    }
    expect(html).toContain('Your choice · Option 2');
    expect(html).not.toContain('data-action="choose"');
    expect(html).not.toContain('data-action="advance"');
    expect(html).not.toContain('Network+');
    expect(html).not.toContain('debug-panel');
  });

  it('navigates between recorded neighbours in board order and hides future cards', () => {
    const { state, data } = fixture();
    state.run!.choices = { 'C1-03': 3, 'C1-01': 1, 'C1-02': 2 };
    const middle = choiceHistoryDialog(state, data, 'C1-02');
    expect(middle).toContain('CHOICE 02 · Ch1');
    expect(middle).toContain('data-card="C1-01"');
    expect(middle).toContain('data-card="C1-03"');
    expect(middle).not.toContain('data-card="C1-04"');
    expect(choiceHistoryDialog(state, data, 'C1-01')).not.toContain('Previous choice');
    expect(choiceHistoryDialog(state, data, 'C1-03')).not.toContain('Next choice');
    expect(choiceHistoryDialog(state, data, 'C1-04')).toBe('');
    expect(choiceHistoryDialog(createInitialState(), data, 'C1-01')).toBe('');
  });

  it('uses the historical condition variant without revealing later alternatives', () => {
    const { state, data } = fixture();
    state.run!.choices['C1-01'] = 2;
    state.run!.round = 2;
    state.run!.activePolicies = ['formal_recruitment'];
    const row = data.scenarios.find(item => item.cardId === 'C1-02' && item.option === 2)!;
    data.scenarios.push(
      { ...structuredClone(row), condition: 'C1-01=2;policy:formal_recruitment;round>=2', optionText: 'The earlier opportunity.', results: { female: 'The recorded response.', male: 'Another pawn response.' } },
      { ...structuredClone(row), condition: 'C1-03=3', optionText: 'A later alternative that must stay hidden.' },
    );
    const html = choiceHistoryDialog(state, data, 'C1-02');
    expect(html).toContain('The earlier opportunity.');
    expect(html).toContain('The recorded response.');
    expect(html).not.toContain('A later alternative');
    expect(html).not.toContain('Another pawn response.');
    expect(html).not.toContain(escape(row.optionText));
  });

  it('renders the hired candidate from the saved ID after candidate data is reordered', () => {
    const { state, data } = fixture();
    state.run!.choices = { [RULES.hiring.cardId]: 2 };
    state.run!.reachedDirector = true;
    state.run!.hiredIntern = RULES.hiring.candidates[2];
    const candidate = data.candidates.find(item => item.id === state.run!.hiredIntern)!;
    candidate.name = '<Jun>';
    candidate.blurb = 'The selected candidate.\nNeeds flexible working.';
    data.candidates.reverse();
    const html = choiceHistoryDialog(state, data, RULES.hiring.cardId);
    expect(html).toContain('<strong>&lt;Jun&gt;</strong>');
    expect(html).toContain('The selected candidate.<br>Needs flexible working.');
    expect(html).not.toContain(data.candidates.find(item => item.id !== candidate.id)!.blurb);
    expect(html).not.toContain('Creativity');
    expect(html).not.toContain('Communication');
  });

  it('shows the selected policy name without exposing other policies or hidden numbers', () => {
    const { state, data } = fixture();
    state.run!.choices = { [RULES.policy.cardId]: 1 };
    state.run!.reachedDirector = true;
    const policy = data.policies.find(item => item.id === RULES.policy.options[1])!;
    policy.name = 'Written criteria & transparent recruitment';
    const html = choiceHistoryDialog(state, data, RULES.policy.cardId);
    expect(html).toContain('<strong>Written criteria &amp; transparent recruitment</strong>');
    expect(html).not.toContain(data.policies.find(item => item.id !== policy.id)!.name);
    expect(html).not.toContain('minimum');
    expect(html).not.toContain('fit penalty');
  });

  it('keeps missing or ambiguous content readable without inventing a result', () => {
    const { state, data } = fixture();
    data.scenarios = data.scenarios.filter(item => item.cardId !== 'C1-02');
    const html = choiceHistoryDialog(state, data, 'C1-02');
    expect(html).toContain('id="history-heading">Recorded choice');
    expect(html).toContain('Your choice · Option 2');
    expect(html).toContain('currently unavailable');
    expect(html).not.toContain('What followed');
    expect(html).toContain('data-action="close-history"');
    expect(html).toContain('data-card="C1-03"');
  });

  it('does not replace missing saved candidate or policy data with another choice', () => {
    const { state, data } = fixture();
    state.run!.choices = { [RULES.hiring.cardId]: 1, [RULES.policy.cardId]: 1 };
    state.run!.reachedDirector = true;
    state.run!.hiredIntern = 'missing-candidate';
    expect(choiceHistoryDialog(state, data, RULES.hiring.cardId)).toContain('candidate information for this recorded choice is currently unavailable');
    data.policies = [];
    expect(choiceHistoryDialog(state, data, RULES.policy.cardId)).toContain('policy information for this recorded choice is currently unavailable');
  });

  it('escapes all writer content, retains long multiline text and leaves saved state unchanged', () => {
    const { state, data } = fixture();
    const row = data.scenarios.find(item => item.cardId === 'C1-02' && item.option === 2)!;
    row.title = '<script>unsafe()</script>';
    row.optionText = '<img src=x onerror="unsafe()">';
    row.scene = 'A long scene.\r\n'.repeat(100) + 'SCENE END';
    row.results.female = 'Result first line.\nResult second line.\nRESULT END';
    const before = JSON.stringify(state);
    const html = choiceHistoryDialog(state, data, 'C1-02');
    expect(html).toContain('role="dialog" aria-modal="true" aria-labelledby="history-heading" tabindex="-1"');
    expect(html).toContain('role="region" aria-label="Recorded scene, choice and result" tabindex="0"');
    expect(html).toContain('&lt;script&gt;unsafe()&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img src=x onerror=&quot;unsafe()&quot;&gt;');
    expect(html).toContain('A long scene.<br>');
    expect(html).toContain('SCENE END');
    expect(html).toContain('Result first line.<br>Result second line.<br>RESULT END');
    expect(html).not.toContain('data-enter');
    expect(JSON.stringify(state)).toBe(before);
  });
});
