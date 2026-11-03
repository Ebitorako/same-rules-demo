import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState, startCareer } from '../game/state';
import type { AppState, GameData } from '../game/types';
import { endingScreen, galleryDetailDialog, galleryScreen, milestoneScreen } from './gallery';
import { richText } from './dom';
import { setLocale } from './i18n';

vi.mock('virtual:art-index', () => ({ default: [
  'assets/cards/ending_CH1-E01.png',
  'assets/cards/ending_CH2-E07_male.png',
  'assets/cards/ending_CH2-E07_female.png',
] }));
afterEach(() => setLocale('en'));

function fixture(): { state: AppState; data: GameData } {
  const read = (file: string) => readFileSync(`public/data/${file}`, 'utf8');
  const policies = JSON.parse(read('policies.json'));
  const data: GameData = {
    ...JSON.parse(read('team-content.json')),
    scenarios: JSON.parse(read('team-content.json')).scenarios, endings: JSON.parse(read('team-content.json')).endings,
    candidates: JSON.parse(read('candidates.json')).candidates,
    policies: policies.policies, powerTokens: policies.powerTokens, copy: JSON.parse(read('copy.json')),
  };
  const state = startCareer(createInitialState(), 'female', data);
  state.run!.phase = 'ending';
  state.run!.endingId = 'E02';
  state.gallery = [{ endingId: 'E02', pawn: 'female', name: 'Alex', round: 1 }];
  return { state, data };
}

describe('ending card theory and references', () => {
  it('uses the same labelled back and original CSV writing on both screens', () => {
    const { state, data } = fixture();
    const end = endingScreen(state, data, true);
    const gallery = galleryDetailDialog(state, data, 'E02', true);
    const reading = (html: string) => html.match(/<section class="ending-reading-section(?: ending-references)?">[\s\S]*?<\/section>/g);
    expect(reading(end)).toBeTruthy();
    expect(reading(gallery)).toEqual(reading(end));
    for (const html of [end, gallery]) {
      expect(html).toContain('<h3>Theory</h3>');
      expect(html).toContain('<h3>References</h3>');
      expect(html).toContain(richText(data.endings[0].back));
      expect(html).toContain(richText(data.endings[0].reference));
      expect(html).not.toContain(richText(data.endings[0].front));
    }
    expect(end).toContain('data-action="flip-ending"');
    expect(gallery).toContain('data-action="flip-gallery" data-ending="E02"');
  });

  it('keeps line breaks while escaping writer-supplied HTML and URL text', () => {
    const { state, data } = fixture();
    data.endings[0].back = 'First paragraph.\r\nSecond <script>not executable</script>.';
    data.endings[0].reference = 'Author & Co. (2026).\n<img src=x onerror="bad()">\rjavascript:bad()';
    for (const html of [endingScreen(state, data, true), galleryDetailDialog(state, data, 'E02', true)]) {
      expect(html).toContain('First paragraph.<br>Second &lt;script&gt;');
      expect(html).toContain('Author &amp; Co. (2026).<br>&lt;img');
      expect(html).toContain('&quot;bad()&quot;&gt;<br>javascript:bad()');
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img src=x');
      expect(html).not.toContain('href="javascript:');
    }
  });

  it('does not render locked ending details even when a detail view is requested directly', () => {
    const { data } = fixture();
    const html = galleryScreen(createInitialState(), data);
    expect(html.match(/aria-label="Locked ending"/g)).toHaveLength(data.endings.length);
    for (const ending of data.endings) {
      expect(html).not.toContain(ending.name);
      expect(html).not.toContain(ending.front);
      expect(html).not.toContain(ending.back);
      if (ending.reference) expect(html).not.toContain(ending.reference);
      expect(galleryDetailDialog(createInitialState(), data, ending.id, false)).toBe('');
      expect(galleryDetailDialog(createInitialState(), data, ending.id, true)).toBe('');
    }
    expect(html).not.toContain('ending-reading-scroll');
    expect(html).not.toContain('data-action="flip-gallery"');
  });

  it('preserves front/back actions and all pawn unlock records', () => {
    const { state, data } = fixture();
    state.gallery.push({ endingId: 'E02', pawn: 'male', name: '<Sam>', round: 2 });
    for (const back of [false, true]) {
      const html = galleryDetailDialog(state, data, 'E02', back);
      expect(html).toContain('Alex · ♀ · career 1<br>&lt;Sam&gt; · ♂ · career 2');
      expect(html).toContain('data-action="flip-gallery" data-ending="E02"');
    }
    const front = endingScreen(state, data, false);
    expect(front).toContain(richText(data.endings[0].front));
    expect(front).not.toContain('ending-reading-scroll');
    expect(front).toContain('data-action="gallery"');
    expect(front).toContain('data-action="next-career"');
  });

  it('retains the end of long notes in a named, keyboard-focusable reading region', () => {
    const { state, data } = fixture();
    data.endings[0].back = 'Long theory paragraph.\n'.repeat(200) + 'THEORY END';
    data.endings[0].reference = 'Long reference entry.\n'.repeat(200) + 'REFERENCE END';
    for (const html of [endingScreen(state, data, true), galleryDetailDialog(state, data, 'E02', true)]) {
      expect(html).toContain('role="region" tabindex="0" aria-label="Theory, references and numerical review for ');
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

  it('keeps grid cards compact and exposes full details only in an accessible dialog', () => {
    const { state, data } = fixture();
    const before = JSON.stringify(state);
    const grid = galleryScreen(state, data);
    expect(grid.match(/data-action="open-ending"/g)).toHaveLength(data.endings.length);
    expect(grid).toContain('id="gallery-ending-E02"');
    expect(grid).toContain('aria-haspopup="dialog" aria-labelledby="gallery-title-E02"');
    expect(grid).toContain('class="gallery-card-description"');
    expect(grid).not.toContain('ending-guide');
    expect(grid).not.toContain('gallery-recaps');
    expect(grid).not.toContain('ending-reading-scroll');
    expect(grid).not.toContain('flip-gallery');
    const detail = galleryDetailDialog(state, data, 'E02', false);
    expect(detail).toContain('role="dialog" aria-modal="true" aria-labelledby="gallery-detail-heading" tabindex="-1"');
    expect(detail).toContain('data-action="close-gallery"');
    expect(detail).toContain(richText(data.endings[0].front));
    expect(galleryDetailDialog(state, data, 'not-an-ending', false)).toBe('');
    expect(JSON.stringify(state)).toBe(before);
  });

  it('reveals only earned pawn variants in the full card', () => {
    const { state, data } = fixture();
    data.endings[0].frontByPawn = { female: 'Earned female story.', male: 'Unseen male story.' };
    expect(galleryDetailDialog(state, data, 'E02', false)).toContain('Earned female story.');
    expect(galleryDetailDialog(state, data, 'E02', false)).not.toContain('Unseen male story.');
    state.gallery.push({ endingId: 'E02', pawn: 'male', name: 'Sam', round: 2 });
    expect(galleryDetailDialog(state, data, 'E02', false)).toContain('Unseen male story.');
    expect(galleryScreen(state, data)).not.toContain('Unseen male story.');
  });

  it.each(['en', 'zh-CN'] as const)('hides milestone source numbers and numerical values in %s', locale => {
    const { state, data } = fixture();
    setLocale(locale);
    for (const milestone of data.milestones!) {
      state.run!.phase = 'milestone';
      state.run!.milestoneId = milestone.id;
      for (const back of [false, true]) {
        const html = milestoneScreen(state, data, back);
        const visibleText = html.replace(/<[^>]*>/g, '');
        expect(visibleText).not.toContain(milestone.sourceId!);
        expect(visibleText).not.toContain(milestone.id);
        expect(html).not.toContain('ending-values');
        expect(html).not.toContain('numerical-review');
        expect(html).toContain('data-action="advance"');
      }
      expect(milestoneScreen(state, data, false)).toContain(locale === 'en' ? 'A CHAPTER MILESTONE' : '章节里程碑');
    }
  });

  it.each([
    ['female', 'en'], ['male', 'en'], ['female', 'zh-CN'], ['male', 'zh-CN'],
  ] as const)('shows the approved %s milestone artwork in %s without changing the career', (pawn, locale) => {
    const { state, data } = fixture();
    setLocale(locale);
    state.run!.character.pawn = pawn;
    state.run!.phase = 'milestone';
    for (const [id, file] of [
      ['CH1-E01', 'ending_CH1-E01.png'],
      ['CH2-E07', `ending_CH2-E07_${pawn}.png`],
    ]) {
      state.run!.milestoneId = id;
      const before = JSON.stringify(state);
      const front = milestoneScreen(state, data, false);
      expect(front).toContain(`src="/assets/cards/${file}"`);
      expect(front).not.toContain('class="art art-placeholder');
      expect(front).toContain('data-action="flip-ending"');
      const back = milestoneScreen(state, data, true);
      expect(back).not.toContain('<img');
      expect(back).toContain('class="ending-theory"');
      expect(back).toContain('data-action="advance"');
      expect(back).not.toContain('ending-values');
      expect(back).not.toContain('numerical-review');
      expect(JSON.stringify(state)).toBe(before);
    }
    const collection = galleryScreen(state, data);
    expect(collection.match(/data-action="open-ending"/g)).toHaveLength(13);
    expect(collection).not.toContain('CH1-E01');
    expect(collection).not.toContain('CH2-E07');
  });
});
