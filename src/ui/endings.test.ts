import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { parseEndings, parseScenarios } from '../data/parse';
import { createInitialState, startCareer } from '../game/state';
import type { AppState, GameData } from '../game/types';
import { endingScreen, galleryScreen } from './gallery';

vi.mock('virtual:art-index', () => ({ default: [] }));

function fixture(): { state: AppState; data: GameData } {
  const read = (file: string) => readFileSync(`public/data/${file}`, 'utf8');
  const policies = JSON.parse(read('policies.json'));
  const data: GameData = {
    scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')),
    candidates: JSON.parse(read('candidates.json')).candidates,
    policies: policies.policies, powerTokens: policies.powerTokens, copy: JSON.parse(read('copy.json')),
  };
  const state = startCareer(createInitialState(), 'female', data);
  state.run!.phase = 'ending';
  state.run!.endingId = 'E01';
  state.gallery = [{ endingId: 'E01', pawn: 'female', name: 'Alex', round: 1 }];
  return { state, data };
}

describe('ending card theory and references', () => {
  it('uses the same labelled back and original CSV writing on both screens', () => {
    const { state, data } = fixture();
    const end = endingScreen(state, data, true);
    const gallery = galleryScreen(state, data, new Set(['E01']));
    const reading = (html: string) => html.match(/<div class="ending-reading-scroll"[\s\S]*?<\/div>/)?.[0];
    expect(reading(end)).toBeTruthy();
    expect(reading(gallery)).toBe(reading(end));
    for (const html of [end, gallery]) {
      expect(html).toContain('<h3>Theory</h3>');
      expect(html).toContain('<h3>References</h3>');
      expect(html).toContain(data.endings[0].back);
      expect(html).toContain(data.endings[0].reference);
      expect(html).not.toContain(data.endings[0].front);
    }
    expect(end).toContain('data-action="flip-ending"');
    expect(gallery).toContain('data-action="flip-gallery" data-ending="E01"');
  });

  it('keeps line breaks while escaping writer-supplied HTML and URL text', () => {
    const { state, data } = fixture();
    data.endings[0].back = 'First paragraph.\r\nSecond <script>not executable</script>.';
    data.endings[0].reference = 'Author & Co. (2026).\n<img src=x onerror="bad()">\rjavascript:bad()';
    for (const html of [endingScreen(state, data, true), galleryScreen(state, data, new Set(['E01']))]) {
      expect(html).toContain('First paragraph.<br>Second &lt;script&gt;');
      expect(html).toContain('Author &amp; Co. (2026).<br>&lt;img');
      expect(html).toContain('&quot;bad()&quot;&gt;<br>javascript:bad()');
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img src=x');
      expect(html).not.toContain('href="javascript:');
    }
  });

  it('does not render locked ending details even if their IDs are marked flipped', () => {
    const { data } = fixture();
    const html = galleryScreen(createInitialState(), data, new Set(data.endings.map(ending => ending.id)));
    expect(html.match(/aria-label="Locked ending"/g)).toHaveLength(data.endings.length);
    for (const ending of data.endings) {
      expect(html).not.toContain(ending.name);
      expect(html).not.toContain(ending.front);
      expect(html).not.toContain(ending.back);
      expect(html).not.toContain(ending.reference);
    }
    expect(html).not.toContain('ending-reading-scroll');
    expect(html).not.toContain('data-action="flip-gallery"');
  });

  it('preserves front/back actions and all pawn unlock records', () => {
    const { state, data } = fixture();
    state.gallery.push({ endingId: 'E01', pawn: 'male', name: '<Sam>', round: 2 });
    for (const flipped of [new Set<string>(), new Set(['E01'])]) {
      const html = galleryScreen(state, data, flipped);
      expect(html).toContain('Alex · ♀ · career 1<br>&lt;Sam&gt; · ♂ · career 2');
      expect(html).toContain('data-action="flip-gallery" data-ending="E01"');
    }
    const front = endingScreen(state, data, false);
    expect(front).toContain(data.endings[0].front);
    expect(front).not.toContain('ending-reading-scroll');
    expect(front).toContain('data-action="gallery"');
    expect(front).toContain('data-action="next-career"');
  });

  it('retains the end of long notes in a named, keyboard-focusable reading region', () => {
    const { state, data } = fixture();
    data.endings[0].back = 'Long theory paragraph.\n'.repeat(200) + 'THEORY END';
    data.endings[0].reference = 'Long reference entry.\n'.repeat(200) + 'REFERENCE END';
    for (const html of [endingScreen(state, data, true), galleryScreen(state, data, new Set(['E01']))]) {
      expect(html).toContain('role="region" tabindex="0" aria-label="Theory and references for ');
      expect(html).toContain('THEORY END');
      expect(html).toContain('REFERENCE END');
    }
  });

  it('identifies missing references without inventing a citation', () => {
    const { state, data } = fixture();
    data.endings[0].reference = ' \n ';
    const html = endingScreen(state, data, true);
    expect(html).toContain('<h3>References</h3>');
    expect(html).toContain('References have not been added to this card yet.');
    expect(html).not.toContain('Dent (2020)');
  });
});
