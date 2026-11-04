import { afterEach, describe, expect, it } from 'vitest';
import { escape, richText } from './dom';
import { normalizeCompanyName, parseTextFormatting, renderRichText, setTextFormatting } from './rich-text';

afterEach(() => setTextFormatting({ entries: {} }));

describe('source-based text emphasis', () => {
  it('escapes author text while adding only the configured formatting tags', () => {
    const text = '<img src=x onerror="alert(1)"> & \'quote\'\n**literal markdown**';
    setTextFormatting({ entries: { [text]: [{ start: 0, end: text.indexOf('\n'), bold: true }] } });
    const html = richText(text);
    expect(html).toBe('<strong>&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quote&#39;</strong><br>**literal markdown**');
    expect(html).not.toContain('<img');
    expect(escape('assets/freeDOM.png')).toBe('assets/freeDOM.png');
  });

  it('nests overlapping speech and emphasis spans without malformed HTML', () => {
    const text = 'Say: "A bold idea."';
    setTextFormatting({ entries: { [text]: [
      { start: 5, end: text.length, italic: true },
      { start: 8, end: 12, bold: true },
      { start: 8, end: 10, bold: true },
    ] } });
    expect(renderRichText(text)).toBe('Say: <em>&quot;A </em><strong><em>bold</em></strong><em> idea.&quot;</em>');
  });

  it('preserves UTF-16 offsets and newlines in Chinese dialogue with supplementary characters', () => {
    const text = '她说：“好呀😀！”\n继续。';
    setTextFormatting({ entries: { [text]: [{ start: 3, end: 10, italic: true }, { start: 4, end: 6, bold: true }] } });
    expect(richText(text)).toBe('她说：<em>“</em><strong><em>好呀</em></strong><em>😀！”</em><br>继续。');
  });

  it('does not infer dialogue or treat a near-match as the approved passage', () => {
    setTextFormatting({ entries: { 'A source sentence.': [{ start: 2, end: 8, bold: true }] } });
    expect(richText('A source sentence. Older continuation.')).toBe('A source sentence. Older continuation.');
    expect(richText('She says "Hello".')).toBe('She says &quot;Hello&quot;.');
    expect(richText('')).toBe('');
    expect(richText('Line one.\r\nLine two.')).toBe('Line one.<br>Line two.');
  });

  it('normalizes company casing without changing text or saved ranges', () => {
    const source = 'Welcome to FreeDom!';
    const ranges = [{ start: 11, end: 18, bold: true }];
    const catalog = { entries: { [source]: ranges } };
    setTextFormatting(catalog);
    expect(richText('Welcome to freeDOM!')).toBe('Welcome to <strong>FreeDom</strong>!');
    expect(catalog.entries[source]).toEqual(ranges);
    expect(normalizeCompanyName('FreeDOM freeDOM freeDom FreeDom freeDoms myfreedom')).toBe('FreeDom FreeDom FreeDom FreeDom freeDoms myfreedom');
    setTextFormatting({ entries: { 'Welcome to freeDOM!': ranges } });
    expect(richText(source)).toBe('Welcome to <strong>FreeDom</strong>!');
  });

  it('parses prototype-like text keys as data and keeps the registered copy independent', () => {
    const parsed = parseTextFormatting('{"entries":{"__proto__":[{"start":0,"end":9,"bold":true}]}}');
    setTextFormatting(parsed);
    parsed.entries.__proto__[0].end = 1;
    expect(richText('__proto__')).toBe('<strong>__proto__</strong>');
    expect(richText('constructor')).toBe('constructor');
  });

  it.each([
    '{', '{}', '{"entries":[]}', '{"entries":{"":[]}}',
    '{"entries":{"abc":true}}', '{"entries":{"abc":[null]}}',
    '{"entries":{"abc":[{"start":-1,"end":2}]}}',
    '{"entries":{"abc":[{"start":0,"end":4}]}}',
    '{"entries":{"abc":[{"start":1,"end":1}]}}',
    '{"entries":{"abc":[{"start":0.5,"end":2}]}}',
    '{"entries":{"abc":[{"start":0,"end":2,"italic":"true"}]}}',
    '{"entries":{"abc":[{"start":0,"end":2,"bold":1}]}}',
    '{"entries":{"😀":[{"start":0,"end":1,"bold":true}]}}',
  ])('rejects invalid formatting instead of silently clipping ranges: %s', json => {
    expect(() => parseTextFormatting(json)).toThrow();
  });
});
