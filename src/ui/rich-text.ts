export interface TextSpan {
  start: number;
  end: number;
  bold?: boolean;
  italic?: boolean;
}

export interface TextFormattingCatalog {
  entries: Record<string, TextSpan[]>;
}

let formatting: Record<string, TextSpan[]> = Object.create(null);

export function normalizeCompanyName(text: string): string {
  return text.replace(/\bfreedom\b/gi, 'FreeDom');
}

export function escapeText(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function splitsSurrogate(text: string, offset: number): boolean {
  return offset > 0 && offset < text.length
    && /[\uD800-\uDBFF]/.test(text[offset - 1]) && /[\uDC00-\uDFFF]/.test(text[offset]);
}

function validateCatalog(value: unknown): TextFormattingCatalog {
  if (!isRecord(value) || !isRecord(value.entries)) throw new Error('text-formatting.json 缺少有效的 entries。');
  const entries: Record<string, TextSpan[]> = Object.create(null);
  for (const [text, ranges] of Object.entries(value.entries)) {
    if (!text || !Array.isArray(ranges)) throw new Error('文本重点格式应按完整文本记录范围。');
    entries[text] = ranges.map((range: unknown) => {
      if (!isRecord(range) || !Number.isInteger(range.start) || !Number.isInteger(range.end)
        || typeof range.start !== 'number' || typeof range.end !== 'number'
        || range.start < 0 || range.end <= range.start || range.end > text.length
        || splitsSurrogate(text, range.start) || splitsSurrogate(text, range.end)
        || (range.bold !== undefined && typeof range.bold !== 'boolean')
        || (range.italic !== undefined && typeof range.italic !== 'boolean')) {
        throw new Error('文本重点格式范围无效，请重新导入文本格式。');
      }
      return { start: range.start, end: range.end,
        ...(range.bold ? { bold: true } : {}), ...(range.italic ? { italic: true } : {}) };
    });
  }
  return { entries };
}

export function parseTextFormatting(text: string): TextFormattingCatalog {
  let value: unknown;
  try { value = JSON.parse(text); }
  catch { throw new Error('text-formatting.json 格式无效。'); }
  return validateCatalog(value);
}

export function setTextFormatting(catalog: TextFormattingCatalog): void {
  formatting = validateCatalog(catalog).entries;
  // Casing is presentation-only, including for wording frozen in an older save.
  for (const [text, ranges] of Object.entries(formatting)) {
    const normalized = normalizeCompanyName(text);
    if (!Object.hasOwn(formatting, normalized)) formatting[normalized] = ranges;
  }
}

export function renderRichText(text: string): string {
  const normalized = normalizeCompanyName(text);
  const ranges = formatting[text] ?? formatting[normalized] ?? [];
  const boundaries = [...new Set([0, text.length, ...ranges.flatMap(range => [range.start, range.end])])]
    .sort((a, b) => a - b);
  let html = '';
  let open: string[] = [];
  for (let index = 0; index < boundaries.length - 1; index++) {
    const start = boundaries[index], end = boundaries[index + 1];
    const active = ranges.filter(range => range.start <= start && range.end >= end);
    const next = [...(active.some(range => range.bold) ? ['strong'] : []),
      ...(active.some(range => range.italic) ? ['em'] : [])];
    let shared = 0;
    while (shared < open.length && shared < next.length && open[shared] === next[shared]) shared++;
    html += open.slice(shared).reverse().map(tag => `</${tag}>`).join('');
    html += next.slice(shared).map(tag => `<${tag}>`).join('');
    // Only this renderer supplies markup. The source's HTML or Markdown stays literal.
    html += escapeText(normalized.slice(start, end)).replace(/\r\n?|\n/g, '<br>');
    open = next;
  }
  return html + open.reverse().map(tag => `</${tag}>`).join('');
}
