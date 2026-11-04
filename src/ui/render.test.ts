import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { localizeData, parseTranslationCatalog } from '../data/localize';
import { chooseOption, createInitialState, getOptions, startCareer } from '../game/state';
import { BOARD } from '../game/board';
import type { AppState, GameData, Pawn } from '../game/types';
import { art, loadAssets, npcArt } from './assets';
import { boardScreen } from './board';
import { scenarioDialog } from './card';
import { galleryScreen } from './gallery';
import { introScreen } from './title';
import { richText } from './dom';
import { setLocale, t } from './i18n';

vi.mock('virtual:art-index', () => ({ default: ['assets/npc/old_boys_network_neutral.png', 'assets/ui/gallery_frame.png', 'assets/characters/final/female.png'] }));
const fixture = (): GameData => JSON.parse(readFileSync('public/data/team-content.json', 'utf8'));
const translations = parseTranslationCatalog(readFileSync('public/data/zh-CN.json', 'utf8'));
afterEach(() => setLocale('en'));
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

  it.each(['en', 'zh-CN'] as const)('keeps authored citations beside the background even without the guide in %s', locale => {
    setLocale(locale);
    const data = localizeData(fixture(), translations, locale);
    const html = scenarioDialog(atCard('C1-01', data), data);
    const background = html.match(/<details class="background-note">[\s\S]*?<\/details>/)?.[0];
    expect(background).toContain(`<h4>${t('References')}</h4>`);
    expect(background).toContain('Warhurst et al. (2000); Dellinger &amp; Williams (1997)');
    expect(html).not.toContain('class="guide-panel');
  });

  it.each(['en', 'zh-CN'] as const)('shows four numeric choices in %s while preserving the source D branch and female-only resignation option', locale => {
    setLocale(locale);
    const data = localizeData(fixture(), translations, locale);
    const drinks = scenarioDialog(atCard('C2-03', data), data);
    expect(drinks.match(/data-action="choose"/g)).toHaveLength(4);
    expect(drinks.match(/<span class="option-number">[^<]+<\/span>/g)).toEqual(
      [1, 2, 3, 4].map(number => `<span class="option-number">${number}</span>`));
    expect(drinks).toContain(`${t('KEYS')} 1 / 2 / 3 / 4`);
    expect(drinks).not.toContain('4 / D');
    expect(data.scenarios.filter(row => row.cardId === 'C2-03' && row.option === 4).every(row => row.optionLabel === 'D')).toBe(true);
    const female = scenarioDialog(atCard('C2-04', data), data);
    const male = scenarioDialog(atCard('C2-04', data, 'male'), data);
    expect(female.match(/data-action="choose"/g)).toHaveLength(4);
    expect(male.match(/data-action="choose"/g)).toHaveLength(3);
    const resignation = data.scenarios.find(row => row.sourceCardId === 'C2-04A' && row.option === 4)!;
    expect(female).toContain(richText(resignation.optionText));
    expect(male).not.toContain(richText(resignation.optionText));
  });

  it.each(['en', 'zh-CN'] as const)('keeps numeric badges consistent across all authored branches in %s', locale => {
    setLocale(locale);
    const data = localizeData(fixture(), translations, locale);
    const rendered = new Set<string>();
    for (const tile of BOARD.filter(tile => tile.cardId)) {
      for (const pawn of ['female', 'male'] as const) for (const child of [false, true])
        for (const branch of ['A', 'B', 'C', 'D']) for (const policy of ['zero_tolerance', 'coordinator', 'transparent'])
          for (const previousFamilyMan of [false, true]) {
            if (tile.chapter >= 3 && branch === 'D') continue;
            const state = atCard(tile.cardId!, data, pawn);
            state.run!.flags = { has_child: child, c2_branch: branch, policy, previous_family_man: previousFamilyMan };
            const options = getOptions(state.run!, data);
            const key = `${pawn}:${options.map(row => row.sourceSheet + ':' + row.sourceRow).join(',')}`;
            if (rendered.has(key)) continue;
            rendered.add(key);
            const html = scenarioDialog(state, data);
            const badges = [...html.matchAll(/<span class="option-number">([^<]+)<\/span>/g)].map(match => match[1]);
            expect(badges, key).toEqual(tile.cardId === 'C2-04' && branch === 'D' ? ['→']
              : Array.from({ length: options.length }, (_, index) => String(index + 1)));
          }
    }
    expect(rendered.size).toBeGreaterThan(40);
  });

  it.each(['en', 'zh-CN'] as const)('keeps automatic acknowledgements distinct from genuine single choices in %s', locale => {
    setLocale(locale);
    for (const marker of [
      { automatic: true, optionLabel: undefined },
      { automatic: false, optionLabel: 'Continue' },
      { automatic: false, optionLabel: '自动' },
    ]) {
      const data = localizeData(fixture(), translations, locale);
      for (const row of data.scenarios.filter(row => row.sourceCardId === 'C2-04D')) Object.assign(row, marker);
      const state = atCard('C2-04', data);
      state.run!.flags!.c2_branch = 'D';
      const html = scenarioDialog(state, data);
      expect(html).toContain('<span class="option-number">→</span>');
      expect(html).toContain(`<span>${t('Continue')}</span>`);
      expect(html).toContain('data-enter="true"');
      expect(html).toContain(`${t('KEYS')} ENTER`);
      expect(html).not.toContain(`${t('KEYS')} 1`);
    }
    const data = localizeData(fixture(), translations, locale);
    const gatekeeper = scenarioDialog(atCard('C1-B', data), data);
    expect(gatekeeper).toContain('<span class="option-number">1</span>');
    expect(gatekeeper).toContain(`${t('KEYS')} 1 / ENTER`);
    expect(gatekeeper).toContain('data-enter="true"');
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
