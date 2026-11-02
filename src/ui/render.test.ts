import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { chooseOption, createInitialState, getOptions, startCareer } from '../game/state';
import { BOARD } from '../game/board';
import type { AppState, GameData, Pawn } from '../game/types';
import { art, loadAssets, npcArt } from './assets';
import { boardScreen } from './board';
import { scenarioDialog } from './card';
import { galleryScreen } from './gallery';
import { introScreen } from './title';
import { richText } from './dom';

vi.mock('virtual:art-index', () => ({ default: ['assets/npc/old_boys_network_neutral.png', 'assets/ui/gallery_frame.png', 'assets/characters/final/female.png'] }));
const fixture = (): GameData => JSON.parse(readFileSync('public/data/team-content.json', 'utf8'));
beforeAll(async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({
    'characters/pawn_female': ['assets/characters/missing.svg','assets/characters/final/female.png'],
    'npc/old_boys_network_neutral': ['assets/npc/old_boys_network_neutral.png'],
    'ui/gallery_frame': ['assets/ui/gallery_frame.png'],
  }) })));
  await loadAssets();
});
afterAll(() => vi.unstubAllGlobals());
function atCard(id: string, data: GameData, pawn: Pawn = 'female'): AppState {
  const state = startCareer(createInitialState(), pawn, data);
  state.run!.phase = 'card';
  state.run!.position = BOARD.findIndex(tile => tile.cardId === id);
  state.run!.reachedDirector = BOARD[state.run!.position].chapter === 4;
  state.run!.flags = { ...state.run!.flags, c2_branch: 'A', policy: 'transparent' };
  return state;
}

describe('rendered formal story connections', () => {
  it('honours relocated assets and preserves underscore NPC ids', () => {
    expect(art('characters/pawn_female','pawn')).toContain('assets/characters/final/female.png');
    expect(npcArt('old_boys_network','neutral')).toContain('src="/assets/npc/old_boys_network_neutral.png"');
    expect(npcArt('Senior Producer','cold')).toContain('ART<br>PLACEHOLDER');
  });

  it('renders the real first chapter and three ordinary choices while keeping numbers hidden', () => {
    const data = fixture();
    const state = atCard('C1-01', data);
    const html = scenarioDialog(state, data);
    expect(html.match(/data-action="choose"/g)).toHaveLength(3);
    expect(html).toContain('Dress to Impress');
    expect(html).toContain('Why does this happen?');
    expect(html).not.toContain('Final values');
    expect(html).not.toContain('Reputation+1');
    expect(html).not.toContain('PLACEHOLDER]');
    expect(boardScreen(state, data).match(/data-tile=/g)).toHaveLength(22);
    expect(introScreen(startCareer(createInitialState(), 'male', data), data)).toContain(richText(data.chapters![0].scene));
  });

  it('supports the source’s fourth D option and female-only resignation option', () => {
    const data = fixture();
    const drinks = scenarioDialog(atCard('C2-03', data), data);
    expect(drinks.match(/data-action="choose"/g)).toHaveLength(4);
    expect(drinks).toContain('<span class="option-number">D</span>');
    expect(drinks).toContain('4 / D');
    const female = scenarioDialog(atCard('C2-04', data), data);
    const male = scenarioDialog(atCard('C2-04', data, 'male'), data);
    expect(female.match(/data-action="choose"/g)).toHaveLength(4);
    expect(male.match(/data-action="choose"/g)).toHaveLength(3);
    expect(female).toContain('Resign and leave the company.');
    expect(male).not.toContain('Resign and leave the company.');
  });

  it('shows locked boss options as thoughts without allowing a choice or leaking thresholds', () => {
    const data = fixture();
    const state = atCard('C2-B', data);
    const before = JSON.stringify(state);
    const normal = scenarioDialog(state, data);
    const buttons = normal.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? [];
    const lockedChoices = buttons.filter(button => /\sdisabled(?:\s|>)/.test(button));
    const thoughtHelpers = buttons.filter(button => button.includes('option-thoughts'));
    expect(lockedChoices).toHaveLength(2);
    expect(lockedChoices.every(button => button.includes('aria-disabled="true"') && button.includes('Not available'))).toBe(true);
    expect(thoughtHelpers).toHaveLength(2);
    expect(thoughtHelpers.every(button => !/\sdisabled(?:\s|>)/.test(button) && button.includes('data-action="unavailable"'))).toBe(true);
    expect(thoughtHelpers[0]).toContain('Read your thoughts about option 1');
    expect(thoughtHelpers[1]).toContain('Read your thoughts about option 2');
    expect(normal.match(/data-action="choose"/g)).toHaveLength(1);
    expect(normal).not.toContain('Maybe I');
    const thoughts = scenarioDialog(state, data, '', 1);
    expect(thoughts).toContain('role="status"');
    expect(thoughts).toContain('Maybe I&#39;m just not likeable enough.');
    expect(thoughts).not.toContain('Network ≥ 5');
    expect(thoughts).not.toContain('Network&gt;=5');
    expect(chooseOption(state, 1, data)).toBe(state);
    expect(JSON.stringify(state)).toBe(before);
  });

  it('uses pawn-specific scenes and the actual chosen result', () => {
    const data = fixture();
    const female = atCard('C1-03', data);
    const male = atCard('C1-03', data, 'male');
    expect(scenarioDialog(female, data)).toContain('do you have any plans to start a family?');
    expect(scenarioDialog(male, data)).toContain('How do you feel about working late sometimes?');
    const chosen = chooseOption(female, 3, data);
    expect(scenarioDialog(chosen, data)).toContain(richText(chosen.run!.result!.text));
    expect(scenarioDialog(chosen, data)).not.toContain('data-action="choose"');
  });

  it('renders the authored hiring and policy wording without the former prototype widgets', () => {
    const data = fixture();
    const state = atCard('C4-01', data);
    const html = scenarioDialog(state, { ...data, candidates: [...data.candidates].reverse() });
    const option = getOptions(state.run!, data).find(row => row.option === 1)!;
    expect(html).toContain(richText(option.optionText));
    expect(chooseOption(state, 1, data).run!.hiredIntern).toBe('josh');
    const policy = scenarioDialog(atCard('C4-03', data), data);
    expect(policy).toContain('every role advertised openly, written review criteria');
    expect(policy).not.toContain('POWER TOKEN');
    expect(policy).not.toContain('Skill');
  });

  it('keeps all unearned endings and milestones private', () => {
    const data = fixture();
    const html = galleryScreen(createInitialState(), data);
    expect(html.match(/aria-label="Locked ending"/g)).toHaveLength(13);
    expect(html).not.toContain(data.endings[0].front);
    expect(html).not.toContain(data.milestones![0].front);
    expect(html).toContain('assets/ui/gallery_frame.png');
  });

  it('escapes source titles, choices and unavailable monologues', () => {
    const data = fixture();
    const state = atCard('C2-B', data);
    for (const row of data.scenarios.filter(row => row.cardId === 'C2-B')) {
      row.title = '<script>bad()</script>';
      row.optionText = '<img src=x onerror="bad()">';
      row.unavailableText = { female: '<script>thought()</script>' };
    }
    const html = scenarioDialog(state, data, '', 1);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
    expect(html).toContain('&lt;script&gt;thought()&lt;/script&gt;');
  });
});
