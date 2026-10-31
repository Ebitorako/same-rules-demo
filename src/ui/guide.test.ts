import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RULES } from '../config/rules';
import { parseGuide, type GuideData } from '../data/guide';
import { parseEndings, parseScenarios } from '../data/parse';
import { BOARD } from '../game/board';
import { isValidState, loadState, saveState } from '../game/persistence';
import { advance, chooseOption, createInitialState, startCareer, updateSettings } from '../game/state';
import type { AppState, GameData } from '../game/types';
import { currentGuideNote, guidePanel } from './guide';

vi.mock('virtual:art-index', () => ({ default: [] }));

const read = (name: string) => readFileSync(`public/data/${name}`, 'utf8');
const policyData = JSON.parse(read('policies.json'));
const data: GameData = {
  scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')),
  candidates: JSON.parse(read('candidates.json')).candidates,
  policies: policyData.policies, powerTokens: policyData.powerTokens, copy: JSON.parse(read('copy.json')),
};
const config = { name: 'The Guide', role: 'Your studio companion', portrait: 'npc/guide_neutral' };
const general = ['GENERAL', 'General advice', 'General context', '', '', 'Internal writer note'];

function csv(rows: string[][]): string {
  return [['卡号', '选择前建议', '行业背景', '理论解释', '对应文献', '备注'], ...rows]
    .map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
}

function guideWith(...rows: string[][]): GuideData {
  return parseGuide(csv([general, ...rows]), config);
}

function reachCard(cardId: string): AppState {
  let state = startCareer(createInitialState(), 'female', data);
  for (let step = 0; step < 100; step++) {
    if (state.run!.phase === 'card' && BOARD[state.run!.position].cardId === cardId) return state;
    state = state.run!.phase === 'card' ? chooseOption(state, 1, data) : advance(state, data);
  }
  throw new Error(`Could not reach ${cardId}`);
}

function memoryStorage() {
  const entries = new Map<string, string>();
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
  };
  vi.stubGlobal('localStorage', storage);
  return storage;
}

afterEach(() => vi.unstubAllGlobals());

describe('editable guide validation', () => {
  it('rejects repeated card ids with an actionable CSV error', () => {
    expect(() => guideWith(['C1-01', 'First', '', '', '', ''], ['C1-01', 'Second', '', '', '', '']))
      .toThrow(/guide\.csv.*C1-01.*重复/);
  });

  it.each(['', 'C1-05', 'C4-04', 'C5-01'])('rejects a card id absent from the board: %s', cardId => {
    expect(() => guideWith([cardId, 'Advice', '', '', '', ''])).toThrow(/guide\.csv.*卡号.*无效/);
  });

  it('requires a GENERAL row with non-blank fallback advice', () => {
    expect(() => parseGuide(csv([['C1-01', 'Card advice', '', '', '', '']]), config)).toThrow(/GENERAL/);
    expect(() => parseGuide(csv([['GENERAL', '   ', '', '', '', '']]), config)).toThrow(/GENERAL/);
  });
});

describe('guide content for the current situation', () => {
  it('selects the current card and does not carry its advice or theory into a blank next card', () => {
    const guide = guideWith(
      ['C1-01', 'First card advice', 'First card context', 'First card theory', 'First reading', 'Private note'],
      ['C1-02', '   ', '   ', '', '', ''],
    );
    const first = reachCard('C1-01');
    expect(currentGuideNote(first, data, guide)).toMatchObject({
      cardId: 'C1-01', advice: 'First card advice', background: 'First card context',
      theory: 'First card theory', reference: 'First reading', notes: '',
    });

    const next = advance(advance(chooseOption(first, 1, data), data), data);
    const currentScene = data.scenarios.find(row => row.cardId === 'C1-02')!;
    expect(currentGuideNote(next, data, guide)).toMatchObject({
      cardId: 'C1-02', advice: 'General advice', background: currentScene.background,
      theory: '', reference: currentScene.reference,
    });
    const html = guidePanel(next, data, guide, 'guide-test');
    expect(html).not.toContain('First card');
    expect(html).not.toContain('First reading');
    expect(html).not.toContain('Private note');
  });

  it('uses GENERAL outside a choice and when the current card has no guide row', () => {
    const guide = guideWith(['C1-01', 'Only before this choice', 'Only this context', '', '', '']);
    const first = reachCard('C1-01');
    const result = chooseOption(first, 1, data);
    for (const state of [createInitialState(), result, advance(result, data)]) {
      expect(currentGuideNote(state, data, guide)).toMatchObject({
        cardId: 'GENERAL', advice: 'General advice', background: 'General context',
      });
      expect(guidePanel(state, data, guide, 'guide-test')).not.toContain('Only before this choice');
    }
    const next = advance(advance(result, data), data);
    expect(currentGuideNote(next, data, guide)).toMatchObject({ cardId: 'C1-02', advice: 'General advice' });
  });

  it('falls back to an eligible scene variant instead of an unavailable row', () => {
    const first = reachCard('C1-01');
    const source = data.scenarios.find(row => row.cardId === 'C1-01' && row.option === 1)!;
    const variants: GameData = { ...data, scenarios: [
      { ...source, condition: 'round>=2', background: 'Unavailable context', reference: 'Unavailable reading' },
      { ...source, condition: 'round>=1', background: 'Current context', reference: 'Current reading' },
      ...data.scenarios,
    ] };
    expect(currentGuideNote(first, variants, guideWith())).toMatchObject({
      cardId: 'C1-01', advice: 'General advice', background: 'Current context', reference: 'Current reading',
    });
    expect(guidePanel(first, variants, guideWith(), 'guide-test')).not.toContain('Unavailable');
  });

  it('keeps guide theory with its own reference rather than attaching an unrelated scene reference', () => {
    const guide = guideWith(['C1-01', '', '', 'A new theoretical lens', '', '']);
    expect(currentGuideNote(reachCard('C1-01'), data, guide)).toMatchObject({
      advice: 'General advice', background: '', theory: 'A new theoretical lens', reference: '',
    });
  });

  it('escapes editable identity and all displayed guide text while keeping line breaks', () => {
    const guide = parseGuide(csv([general, [
      'C1-01', '<script>bad()</script>\nSecond line', '<img src=x onerror=bad()>',
      '<svg onload=bad()>', 'Reading & "notes"', 'Never display this writer note',
    ]]), { ...config, name: '<b>Guide</b>', role: '<em>Companion</em>' });
    const html = guidePanel(reachCard('C1-01'), data, guide, 'guide-test');
    expect(html).toContain('&lt;b&gt;Guide&lt;/b&gt;');
    expect(html).toContain('&lt;em&gt;Companion&lt;/em&gt;');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;<br>Second line');
    expect(html).toContain('&lt;img src=x onerror=bad()&gt;');
    expect(html).toContain('&lt;svg onload=bad()&gt;');
    expect(html).toContain('Reading &amp; &quot;notes&quot;');
    expect(html).not.toMatch(/<script|<img src=x|<svg|<b>Guide|<em>Companion/);
    expect(html).not.toContain('Never display this writer note');
  });

  it('omits collapsed advice and context but leaves an accessible restore button', () => {
    const guide = guideWith(['C1-01', 'Hidden advice content', 'Hidden context content', 'Hidden theory content', '', '']);
    const state = updateSettings(reachCard('C1-01'), { guideHidden: true });
    const html = guidePanel(state, data, guide, 'guide-test');
    expect(html).toContain('<button type="button" class="guide-toggle" data-action="toggle-guide" aria-expanded="false" aria-controls="guide-test-body">Ask the guide</button>');
    expect(html).toContain('<div id="guide-test-body" hidden></div>');
    expect(html).not.toContain('Hidden advice content');
    expect(html).not.toContain('Hidden context content');
    expect(html).not.toContain('Hidden theory content');
    expect(html).not.toContain('<details');
    const restored = guidePanel(updateSettings(state, { guideHidden: false }), data, guide, 'guide-test');
    expect(restored).toContain('aria-expanded="true"');
    expect(restored).toContain('Hide advice');
    expect(restored).toContain('Hidden advice content');
  });
});

describe('guide preference persistence', () => {
  it('saves both toggle states without changing the current choice, result, or statistics', () => {
    memoryStorage();
    const chosen = chooseOption(reachCard('C1-01'), 3, data);
    const original = structuredClone(chosen);
    const hidden = updateSettings(chosen, { guideHidden: true });
    expect(chosen).toEqual(original);
    expect(hidden.run).toEqual(original.run);
    expect(saveState(hidden)).toBe(true);
    expect(loadState()).toEqual(hidden);

    const otherSetting = updateSettings(loadState(), { sound: true });
    expect(otherSetting.settings.guideHidden).toBe(true);
    const shown = updateSettings(otherSetting, { guideHidden: false });
    expect(saveState(shown)).toBe(true);
    expect(loadState().settings.guideHidden).toBe(false);
    expect(loadState().run).toEqual(original.run);
    expect(loadState().lineage).toEqual(original.lineage);
    expect(loadState().gallery).toEqual(original.gallery);
  });

  it('loads old settings without guideHidden and rejects a non-boolean saved preference', () => {
    const storage = memoryStorage();
    const legacy = chooseOption(reachCard('C1-01'), 2, data);
    delete legacy.settings.guideHidden;
    expect(isValidState(legacy)).toBe(true);
    storage.setItem(`${RULES.storagePrefix}snapshot`, JSON.stringify(legacy));
    expect(loadState()).toEqual(legacy);
    expect(guidePanel(loadState(), data, guideWith(), 'guide-test')).toContain('aria-expanded="true"');
    expect(isValidState({ ...legacy, settings: { ...legacy.settings, guideHidden: 'true' } })).toBe(false);
  });
});
