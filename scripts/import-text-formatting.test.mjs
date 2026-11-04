import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildCatalog, companyName, quotedRanges, sourceSpans } from './import-text-formatting.mjs';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const snapshot = read('docs/source/2026-11-05-sheet-formatting.json');
const runtime = read('public/data/team-content.json');
const translations = read('public/data/zh-CN.json');
const { catalog, report } = buildCatalog(snapshot, runtime, translations);
const styles = (text, fragment) => {
  const start = text.indexOf(fragment);
  expect(start).toBeGreaterThanOrEqual(0);
  return (catalog.entries[companyName(text)] ?? []).filter(span => span.start <= start && span.end > start);
};

describe('sheet text-format import', () => {
  it('honors cell defaults, independent empty runs, and explicit false resets', () => {
    expect(sourceSpans('abcdefgh', { bold: true, runs: [
      {}, { startIndex: 2, format: { bold: false, italic: true } }, { startIndex: 4 },
      { startIndex: 6, format: { bold: false, italic: false } },
    ] })).toEqual([{ start: 0, end: 2, bold: true }, { start: 2, end: 4, italic: true }, { start: 4, end: 6, bold: true }]);
    expect(sourceSpans('abcdef', { runs: [{}, { startIndex: 2, format: { bold: true } }, { startIndex: 4 }] }))
      .toEqual([{ start: 2, end: 4, bold: true }]);
  });

  it('keeps UTF-16 indices without splitting surrogate pairs', () => {
    expect(sourceSpans('A😀中', { runs: [{}, { startIndex: 1, format: { bold: true } }, { startIndex: 3 }] }))
      .toEqual([{ start: 1, end: 3, bold: true }]);
    expect(() => sourceSpans('A😀中', { runs: [{}, { startIndex: 2, format: { bold: true } }] })).toThrow();
  });

  it('does not treat English apostrophes as quotation marks', () => {
    const text = `He's late. The message says: 'Her temperature's up again.' "Can't you help?"`;
    expect(quotedRanges(text).map(span => span.quote)).toEqual(["'Her temperature's up again.'", '"Can\'t you help?"']);
  });

  it('combines actual source bold and reviewed dialogue while leaving quoted labels upright', () => {
    const scene = snapshot.sheets.ch1.values[7][5];
    expect(styles(scene, 'your biggest contribution')).toContainEqual(expect.objectContaining({ bold: true, italic: true }));
    const policy = snapshot.sheets.ch4.values[13][5];
    expect(styles(policy, 'DEI commitment').some(span => span.bold)).toBe(true);
    expect(styles(policy, 'DEI commitment').some(span => span.italic)).toBe(false);
    const labelled = snapshot.sheets.ch3.values[6][12];
    expect(styles(labelled, 'Acting Series Producer').some(span => span.italic)).toBe(false);
    expect(report.exclusions).toContainEqual(expect.objectContaining({ quote: '"DEI commitment"' }));
  });

  it('records Chinese equivalent emphasis separately and keeps authored Chinese formatting', () => {
    const scene = snapshot.sheets['ch1中文版'].values[7][5];
    expect(styles(scene, '自己在这些项目里最大的贡献是什么')).toContainEqual(expect.objectContaining({ bold: true, italic: true }));
    expect(report.manualEmphasis).toContainEqual(expect.objectContaining({ source: 'ch1中文版!F8' }));
    expect(report.sourceFormatting).toContainEqual(expect.objectContaining({ source: 'ch3中文版!F5' }));
  });

  it('styles explicit unquoted interview replies in both languages without italicizing action instructions', () => {
    for (const sheet of ['ch1', 'ch1中文版']) {
      for (let index = 7; index <= 15; index++) {
        const text = snapshot.sheets[sheet].values[index][11];
        expect(catalog.entries[companyName(text)]).toEqual([{ start: 0, end: text.length, italic: true }]);
      }
      const action = snapshot.sheets[sheet].values[16][11];
      expect(catalog.entries[companyName(action)]?.some(span => span.italic) ?? false).toBe(false);
    }
    const indirectAnswer = snapshot.sheets.ch2.values[12][11];
    expect(catalog.entries[companyName(indirectAnswer)]?.some(span => span.italic) ?? false).toBe(false);
    const narrativeDecision = snapshot.sheets.ch3.values[34][11];
    expect(catalog.entries[companyName(narrativeDecision)]?.some(span => span.italic) ?? false).toBe(false);
    const prefixedDialogue = snapshot.sheets.ch3.values[4][11];
    const quotedStart = prefixedDialogue.indexOf('"');
    expect(catalog.entries[companyName(prefixedDialogue)]).toEqual([{ start: quotedStart, end: prefixedDialogue.length, italic: true }]);
    expect(report.unquotedDialogue).toHaveLength(18);
  });

  it('styles each split Gatekeeper mail and the separately appended Family Man line', () => {
    for (const sheet of ['ch1', 'ch1中文版']) {
      const parts = snapshot.sheets[sheet].values[19][12].split(/【[^】]+】/).map(text => text.trim()).filter(Boolean);
      for (const text of parts) expect(catalog.entries[companyName(text)]).toEqual([{ start: 0, end: text.length, italic: true }]);
    }
    const text = runtime.scenarios.find(row => row.condition === 'flag:previous_family_man=true').scene;
    const translated = translations.translations[text];
    for (const paragraph of [text, translated]) {
      const line = paragraph.slice(paragraph.lastIndexOf('\n\n') + 2);
      expect(styles(paragraph, line)).toContainEqual(expect.objectContaining({ italic: true }));
    }
  });

  it('repairs only the reviewed incomplete-word bold boundary', () => {
    const text = snapshot.sheets.ch3.values[4][5];
    expect(styles(text, 'Before getting')).toContainEqual(expect.objectContaining({ bold: true }));
    expect(report.repairs).toHaveLength(1);
  });

  it('emits valid spans for every catalog entry without mutating source or story data', () => {
    const before = JSON.stringify([snapshot, runtime, translations]);
    const result = buildCatalog(snapshot, runtime, translations);
    expect(JSON.stringify([snapshot, runtime, translations])).toBe(before);
    for (const [text, spans] of Object.entries(result.catalog.entries)) {
      let end = 0;
      for (const span of spans) {
        expect(span.start).toBeGreaterThanOrEqual(end);
        expect(span.end).toBeGreaterThan(span.start);
        expect(span.end).toBeLessThanOrEqual(text.length);
        expect(Boolean(span.bold || span.italic)).toBe(true);
        end = span.end;
      }
    }
    expect(Object.keys(result.catalog.entries).length).toBeGreaterThan(250);
    expect(result.catalog.entries['An older saved passage with different wording.']).toBeUndefined();
  });
});
