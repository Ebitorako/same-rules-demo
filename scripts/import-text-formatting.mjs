import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const snapshotPath = 'docs/source/2026-11-05-sheet-formatting.json';
export const companyName = text => text.replace(/\bfreedom\b/gi, 'FreeDom');

function validOffset(text, offset) {
  return Number.isInteger(offset) && offset >= 0 && offset <= text.length
    && !(offset > 0 && offset < text.length && /[\uD800-\uDBFF]/.test(text[offset - 1]) && /[\uDC00-\uDFFF]/.test(text[offset]));
}

export function sourceSpans(text, format = {}) {
  // Each run inherits the cell format, not the preceding run. An empty run resets it.
  const runs = format.runs?.length ? format.runs : [{ startIndex: 0, format: {} }];
  const ordered = runs.map(run => ({ startIndex: run.startIndex ?? 0, format: run.format ?? {} }));
  if (ordered[0].startIndex > 0) ordered.unshift({ startIndex: 0, format: {} });
  const result = [];
  ordered.forEach((run, index) => {
    const start = run.startIndex, end = ordered[index + 1]?.startIndex ?? text.length;
    if (!validOffset(text, start) || !validOffset(text, end) || end < start) throw new Error('Invalid source text-format run.');
    const bold = run.format.bold ?? format.bold ?? false;
    const italic = run.format.italic ?? format.italic ?? false;
    if (end > start && (bold || italic)) result.push({ start, end, ...(bold ? { bold: true } : {}), ...(italic ? { italic: true } : {}) });
  });
  return result;
}

export function quotedRanges(text) {
  // This only enumerates candidates for the explicit source decisions below; it is never a runtime heuristic.
  const patterns = [/"[^"\n]+"/g, /“[^”]+”/g, /‘[^’]+’/g, /(?<![\p{L}\p{N}])'(?=\S)[\s\S]+?'(?=$|[\s.,;:!?])/gu];
  const spans = patterns.flatMap(pattern => [...text.matchAll(pattern)].map(match => ({ start: match.index, end: match.index + match[0].length, quote: match[0] })));
  return spans.filter(span => !spans.some(other => other !== span && other.start <= span.start && other.end >= span.end))
    .sort((a, b) => a.start - b.start);
}

// Reviewed against the 5 November snapshot. These cells contain only spoken lines,
// quoted messages/letters, or the words the player's action would say.
const allDialogue = new Set(`
ch1!M5 ch1!N5 ch1!M6 ch1!N7 ch1!F8 ch1!M8 ch1!N8 ch1!M9 ch1!N9 ch1!M10 ch1!N10
ch1!F11 ch1!M11 ch1!M12 ch1!M13 ch1!F14 ch1!N14 ch1!N15 ch1!N16 ch1!F17 ch1!M17 ch1!M20
ch2!F5 ch2!L5 ch2!M5 ch2!F8 ch2!L8 ch2!F11 ch2!M11 ch2!M13 ch2!F14 ch2!L17 ch2!M17
ch2!L18 ch2!L20 ch2!F25 ch2!M26 ch2!N26 ch2!N27 ch2!M30 ch2!F33 ch2!L35 ch2!E47
ch3!F5 ch3!L5 ch3!M5 ch3!N5 ch3!L6 ch3!M6 ch3!N6 ch3!L7 ch3!N7 ch3!M8 ch3!N8 ch3!M9 ch3!M10
ch3!F11 ch3!M12 ch3!N12 ch3!M13 ch3!N13 ch3!F14 ch3!N15 ch3!M16 ch3!N16 ch3!M17 ch3!M18
ch3!N20 ch3!N22 ch3!M23 ch3!N23 ch3!M25 ch3!N25 ch3!M27 ch3!M28 ch3!M36 ch3!N37
ch3!M38 ch3!N38 ch3!M39 ch3!M40 ch3!N41
ch4!F5 ch4!L5 ch4!L6 ch4!M7 ch4!N7 ch4!F8 ch4!M9 ch4!N9 ch4!L11 ch4!M11 ch4!L12 ch4!N12
ch4!L13 ch4!M13 ch4!M14 ch4!M16 ch4!F17 ch4!M17 ch4!N17 ch4!M18 ch4!N18 ch4!M19 ch4!N19
ch4!N20 ch4!M23 ch4!M24 ch4!E37
ch1中文版!M5 ch1中文版!N5 ch1中文版!M6 ch1中文版!N7 ch1中文版!F8 ch1中文版!M8 ch1中文版!N8
ch1中文版!M9 ch1中文版!N9 ch1中文版!M10 ch1中文版!N10 ch1中文版!F11 ch1中文版!M11 ch1中文版!M12
ch1中文版!M13 ch1中文版!F14 ch1中文版!N14 ch1中文版!N15 ch1中文版!N16 ch1中文版!F17 ch1中文版!M17 ch1中文版!M20
ch2中文版!F5 ch2中文版!L5 ch2中文版!M5 ch2中文版!F8 ch2中文版!L8 ch2中文版!F11 ch2中文版!M11
ch2中文版!M13 ch2中文版!F14 ch2中文版!L17 ch2中文版!M17 ch2中文版!L18 ch2中文版!L20 ch2中文版!F25
ch2中文版!M26 ch2中文版!N26 ch2中文版!N27 ch2中文版!M30 ch2中文版!F33 ch2中文版!L35 ch2中文版!E47
ch3中文版!F5 ch3中文版!L5 ch3中文版!M5 ch3中文版!N5 ch3中文版!L6 ch3中文版!M6 ch3中文版!N6
ch3中文版!L7 ch3中文版!N7 ch3中文版!M8 ch3中文版!N8 ch3中文版!M9 ch3中文版!M10 ch3中文版!F11
ch3中文版!M12 ch3中文版!N12 ch3中文版!M13 ch3中文版!N13 ch3中文版!F14 ch3中文版!N15 ch3中文版!M16
ch3中文版!N16 ch3中文版!M17 ch3中文版!M18 ch3中文版!N20 ch3中文版!N22 ch3中文版!M23 ch3中文版!N23
ch3中文版!M24 ch3中文版!M25 ch3中文版!N25 ch3中文版!M27 ch3中文版!M28 ch3中文版!M36 ch3中文版!N37
ch3中文版!M38 ch3中文版!N38 ch3中文版!M39 ch3中文版!M40 ch3中文版!N41
ch4中文版!F5 ch4中文版!L5 ch4中文版!L6 ch4中文版!M7 ch4中文版!N7 ch4中文版!F8 ch4中文版!M9
ch4中文版!N9 ch4中文版!L11 ch4中文版!M11 ch4中文版!L12 ch4中文版!N12 ch4中文版!L13 ch4中文版!M13
ch4中文版!M14 ch4中文版!M16 ch4中文版!F17 ch4中文版!M17 ch4中文版!N17 ch4中文版!M18 ch4中文版!N18
ch4中文版!M19 ch4中文版!N19 ch4中文版!N20 ch4中文版!M23 ch4中文版!M24 ch4中文版!E37
`.trim().split(/\s+/));

// Mixed cells: select actual utterances, not neighbouring labels or categories.
const selectedQuotes = {
  'ch2!M28': ['"Wishing you all the best."'],
  'ch2!M34': ['"actually harmed"'],
  'ch2!E46': ['"We value every employee\'s voice."'],
  'ch3!M7': ['"That makes things easier."', '"Of course, plans change. If anything does, make sure I\'m the first to know."'],
  'ch3!M14': ['"That\'s valuable experience. It\'ll come in handy when it\'s your turn."'],
  'ch3!M15': ['"Didn\'t I just say? It\'s only temporary."'],
  'ch3!M19': ['"No problem, totally understand."'],
  'ch4!M8': ['"take it seriously"'],
  'ch4!M15': ['"From a risk management point of view, that makes sense."'],
  'ch4!M20': ['"We\'ll approve one year of budget and review the results next year."'],
  'ch4!M21': ['"Something everyone can live with."'],
  'ch4!N24': ['"Fair point. A statement alone isn\'t enough."'],
  'ch4!E36': ['"Sorry, I think I need to take some time off."'],
  'ch2中文版!M28': ['“祝你一切顺利。”'],
  'ch2中文版!M34': ['“真的受到了伤害”'],
  'ch2中文版!F39': ['“这个人已经准备好了。”'],
  'ch2中文版!E46': ['“我们重视每一位员工的声音。”'],
  'ch3中文版!M7': ['“那就好办了。”', '“当然，计划总赶不上变化，有变化记得第一个告诉我。”'],
  'ch3中文版!M14': ['“这可是宝贵的经验，等轮到你的时候会派上用场的。”'],
  'ch3中文版!M15': ['“我刚才不是说了吗，只是临时的。”'],
  'ch3中文版!M19': ['“没问题，理解理解。”'],
  'ch4中文版!M8': ['“认真处理”'],
  'ch4中文版!M15': ['“从风险管理的角度，这个说得通。”'],
  'ch4中文版!M20': ['“预算先批一年，明年看效果再说。”'],
  'ch4中文版!M21': ['“这样大家都能接受。”'],
  'ch4中文版!N24': ['“有道理，光有声明确实不够。”'],
  'ch4中文版!E36': ['“对不起，我可能需要休息一段时间。”'],
};

// These interview choices are the protagonist's actual answer to the immediately
// preceding question, although the authors did not surround them with quotation marks.
// Other options (including "Say...", "Ask...", "You choose...") remain action descriptions.
const unquotedReplies = {
  'ch1!L8': 'I came up with the original concept and developed the visual storytelling.',
  'ch1!L9': 'I helped lead the team, assigned tasks, and kept the project on track.',
  'ch1!L10': 'I communicated with clients and partner companies to keep everything running smoothly.',
  'ch1!L11': "I'm focused on work right now, and I don't have any immediate family plans.",
  'ch1!L12': "My family situation won't affect my work. I'm available whenever needed.",
  'ch1!L13': "I'd prefer to focus on my professional experience and keep my personal life private.",
  'ch1!L14': "I understand that deadlines can be tight in this industry. I'm happy to stay late occasionally when a project really needs it.",
  'ch1!L15': "I believe I can do my best work when I have a healthy work-life balance. I'd prefer to finish my tasks during regular working hours.",
  'ch1!L16': "Absolutely! I'm fully committed to my career, and I'm willing to put in whatever hours it takes to get the job done.",
  'ch1中文版!L8': '我提出了最初的创意，并负责视觉叙事的开发。',
  'ch1中文版!L9': '我协助带领团队，分配任务，确保项目按计划推进。',
  'ch1中文版!L10': '我负责和客户及合作公司沟通，确保一切顺利运转。',
  'ch1中文版!L11': '我现在专注于工作，近期没有成家的计划。',
  'ch1中文版!L12': '我的家庭情况不会影响工作。只要需要，我随时都可以。',
  'ch1中文版!L13': '我更希望聊聊我的专业经历，个人生活还是想保留隐私。',
  'ch1中文版!L14': '我理解这个行业的截止日期很紧。如果项目真的需要，我很乐意偶尔加班。',
  'ch1中文版!L15': '我相信健康的工作与生活平衡能让我发挥出最好的状态。我更希望在正常工作时间内完成任务。',
  'ch1中文版!L16': '当然！我会全身心投入事业，需要多少时间都愿意付出。',
};

// These are deliberate matching Chinese highlights, not sheet-authored formatting.
// Existing Chapter 3 Chinese emphasis is preserved as authored.
const chineseEmphasis = {
  'ch1中文版!F4': ['准备好迈出通往梦想职业的第一步了吗？'],
  'ch1中文版!F5': ['纠结明天该穿什么', '给人留下好的第一印象'],
  'ch1中文版!F8': ['自己在这些项目里最大的贡献是什么'],
  'ch1中文版!F11': ['你有成家生孩子的打算吗'],
  'ch1中文版!F14': ['你对偶尔加班怎么看'],
  'ch1中文版!F17': ['诚邀你参加为期一周的无薪试用', '你打算怎么表现自己'],
  'ch1中文版!F20': ['你能拿到初级制片人（Junior Producer）的职位吗'],
  'ch2中文版!F4': ['办公室里似乎还运行着另一套规则'],
  'ch2中文版!F5': ['怀疑自己是不是表达不清，或者这个点子根本不够好'],
  'ch2中文版!F8': ['但没有人回应'],
  'ch2中文版!F11': ['你看见 Creative Director 再次打开提案文件'],
  'ch2中文版!F14': ['再次打开提案文件，开始讨论'],
  'ch2中文版!F17': ['比较公司里几位女性员工的身材与性吸引力，还给她们打分'],
  'ch2中文版!F21': ['比较公司里几位女性员工的身材与性吸引力，还给她们打分', '仿佛在等你也加入'],
  'ch2中文版!F29': ['这种事情一直都在发生', '但请你不要提到她的名字'],
  'ch2中文版!F37': ['正在调查“未经授权的录音”', '“职业信任关系的严重破裂”', '因此暂停你的工作'],
  'ch2中文版!F39': ['每位候选人都需要房间里有人说：“这个人已经准备好了。”'],
  'ch4中文版!F5': ['两人学历相同，作品集水平也差不多'],
  'ch4中文版!F8': ['实习还有两个月结束，转正名额由 Daniel 决定'],
  'ch4中文版!F14': ['“多元与包容（DEI）承诺”', '通过后再交董事会审议'],
};

function displayCells(snapshot) {
  const cells = [];
  for (const [sheet, tab] of Object.entries(snapshot.sheets)) {
    tab.values.forEach((row, index) => {
      const id = row[0] ?? '';
      const scenario = /^C[1-4]-(?:0[0-5][FMABCDab]?|B)$/.test(id);
      const ending = /^E\d+$/.test(id) || id === '终章';
      if (!scenario && !ending) return;
      const chapterOne = sheet.startsWith('ch1');
      const columns = scenario ? [5, 6, 11, 12, 13, 18, 20] : [4, 5, ...(chapterOne ? [9] : [6, 10])];
      for (const column of columns) {
        const text = String(row[column] ?? '');
        if (!text) continue;
        const address = `${String.fromCharCode(65 + column)}${index + 1}`;
        const narrative = scenario ? [5, 11, 12, 13, 20].includes(column) : [4, chapterOne ? 9 : 10].includes(column);
        cells.push({ source: `${sheet}!${address}`, text, format: tab.formats[address], narrative, id });
      }
    });
  }
  return cells;
}

function mergeSpans(text, spans) {
  const points = [...new Set(spans.flatMap(span => [span.start, span.end]))].sort((a, b) => a - b);
  const merged = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i], end = points[i + 1];
    const active = spans.filter(span => span.start <= start && span.end >= end);
    const bold = active.some(span => span.bold), italic = active.some(span => span.italic);
    if (!bold && !italic) continue;
    if (!validOffset(text, start) || !validOffset(text, end) || end <= start) throw new Error('Invalid generated formatting span.');
    const previous = merged.at(-1);
    if (previous?.end === start && Boolean(previous.bold) === bold && Boolean(previous.italic) === italic) previous.end = end;
    else merged.push({ start, end, ...(bold ? { bold: true } : {}), ...(italic ? { italic: true } : {}) });
  }
  return merged;
}

export function buildCatalog(snapshot, runtime, translations) {
  const entries = Object.create(null), sourceFormatting = [], dialogue = [], unquotedDialogue = [], exclusions = [], manualEmphasis = [], repairs = [], derived = [];
  const cells = displayCells(snapshot);
  const bySource = new Map(cells.map(cell => [cell.source, cell]));
  const add = (text, spans) => {
    if (!spans.length) return;
    const normalized = companyName(text);
    if (normalized.length !== text.length) throw new Error('Brand normalization changed source offsets.');
    entries[normalized] = [...(entries[normalized] ?? []), ...spans];
  };
  for (const cell of cells) {
    const spans = sourceSpans(cell.text, cell.format);
    if (spans.length) {
      sourceFormatting.push({ source: cell.source, spans });
      add(cell.text, spans);
    }
  }
  const dialogueByText = new Map();
  for (const source of [...allDialogue, ...Object.keys(selectedQuotes)]) {
    const cell = bySource.get(source);
    if (!cell) throw new Error(`Missing reviewed dialogue cell ${source}`);
    const quotes = quotedRanges(cell.text);
    const selected = allDialogue.has(source) ? quotes : quotes.filter(span => selectedQuotes[source].includes(span.quote));
    if (!selected.length || (selectedQuotes[source] && selected.length !== selectedQuotes[source].length)) throw new Error(`Reviewed dialogue changed in ${source}`);
    dialogueByText.set(cell.text, selected);
    add(cell.text, selected.map(({ start, end }) => ({ start, end, italic: true })));
    dialogue.push({ source, quotes: selected.map(span => span.quote), kind: 'reviewed-dialogue-or-written-message' });
  }
  for (const [source, reply] of Object.entries(unquotedReplies)) {
    const cell = bySource.get(source);
    if (!cell || cell.text !== reply) throw new Error(`Reviewed unquoted interview reply changed in ${source}`);
    add(cell.text, [{ start: 0, end: cell.text.length, italic: true }]);
    unquotedDialogue.push({ source, text: reply, kind: 'direct-interview-answer-without-quotation-marks',
      reason: 'The preceding portfolio/family/work-hours question is answered in the player character’s own spoken words. The whole option is speech; no action prefix is present.' });
  }
  const seenExclusions = new Set();
  for (const cell of cells.filter(cell => cell.narrative)) {
    const selected = dialogueByText.get(cell.text) ?? [];
    const omitted = quotedRanges(cell.text).filter(span => !selected.some(chosen => chosen.start === span.start && chosen.end === span.end));
    for (const span of omitted) {
      const key = cell.text + span.start;
      if (seenExclusions.has(key)) continue;
      seenExclusions.add(key);
      exclusions.push({ source: cell.source, quote: span.quote, reason: 'Quoted label, role, evaluation category, slogan or reported description; not a standalone utterance/message.' });
    }
  }
  for (const [source, phrases] of Object.entries(chineseEmphasis)) {
    const cell = bySource.get(source);
    if (!cell) throw new Error(`Missing Chinese emphasis cell ${source}`);
    const spans = phrases.map(phrase => {
      const start = cell.text.indexOf(phrase);
      if (start < 0 || cell.text.indexOf(phrase, start + 1) >= 0) throw new Error(`Chinese emphasis no longer uniquely matches ${source}: ${phrase}`);
      return { start, end: start + phrase.length, bold: true };
    });
    add(cell.text, spans);
    manualEmphasis.push({ source, englishSource: source.replace('中文版', ''), phrases, reason: 'Chinese equivalent of the English sheet emphasis; Chinese tab has no authored narrative bold here.' });
  }
  const wordRepair = bySource.get('ch3!F5');
  const phrase = 'Before getting to the job, he asks how things are at home,';
  const start = wordRepair.text.indexOf(phrase);
  if (start < 0 || !sourceSpans(wordRepair.text, wordRepair.format).some(span => span.bold && span.start === start + 1)) throw new Error('The reviewed partial-word bold boundary changed.');
  add(wordRepair.text, [{ start, end: start + 1, bold: true }]);
  repairs.push({ source: 'ch3!F5:F7', text: 'Before', reason: 'Include the initial B omitted by the source bold run; the wording is unchanged.' });

  // The runtime splits Gatekeeper mail into separate outcome messages.
  for (const sheet of ['ch1', 'ch1中文版']) {
    for (const column of [12, 13]) {
      const text = String(snapshot.sheets[sheet].values[19][column]);
      const parts = text.split(/【[^】]+】/).map(part => part.trim()).filter(Boolean);
      if (parts.length !== 3) throw new Error('Gatekeeper must retain three outcomes.');
      for (const part of parts) {
        const spans = quotedRanges(part).map(({ start, end }) => ({ start, end, italic: true }));
        if (spans.length !== 1) throw new Error('Each Gatekeeper outcome must remain one quoted message.');
        add(part, spans);
      }
      derived.push({ source: `${sheet}!${column === 12 ? 'M' : 'N'}20`, kind: 'split-gatekeeper-outcomes', count: parts.length });
    }
  }

  // These runtime texts append one authored E05 line to the existing scene. Transfer only
  // exact matching base spans, then style the appended spoken line; never replace old prose.
  for (const scenario of runtime.scenarios.filter(row => row.condition === 'flag:previous_family_man=true')) {
    const texts = [scenario.scene, translations.translations?.[scenario.scene]].filter(Boolean);
    for (const text of texts) {
      const split = text.lastIndexOf('\n\n');
      if (split < 0) throw new Error('Expected a separate Family Man spoken line.');
      const base = companyName(text.slice(0, split));
      if (entries[base]) add(text, entries[base]);
      const quoted = quotedRanges(text.slice(split + 2));
      if (quoted.length !== 1) throw new Error('Expected one Family Man spoken line.');
      add(text, quoted.map(({ start, end }) => ({ start: start + split + 2, end: end + split + 2, italic: true })));
      derived.push({ source: `${scenario.sourceSheet}!F${scenario.sourceRow} + E05 next-career note`, kind: 'appended-family-man-dialogue', language: /[\u4e00-\u9fff]/.test(text) ? 'zh-CN' : 'en' });
    }
  }

  for (const [text, spans] of Object.entries(entries)) entries[text] = mergeSpans(text, spans);
  const catalog = { entries };
  const report = {
    source: snapshotPath, sourceSpreadsheet: snapshot.url, retrievedDate: snapshot.retrievedDate,
    policy: 'Formatting only: exact plain text keys and UTF-16 spans. Sheet text, gameplay data and source snapshots are not rewritten. Rich runs inherit cell style and resets are honored. No runtime quote inference.',
    counts: { entries: Object.keys(entries).length, spans: Object.values(entries).reduce((sum, list) => sum + list.length, 0), authoredCells: sourceFormatting.length,
      authoredEnglishCells: sourceFormatting.filter(item => !item.source.includes('中文版')).length,
      authoredChineseCells: sourceFormatting.filter(item => item.source.includes('中文版')).length,
      reviewedDialogueCells: dialogue.length, reviewedQuotedPassages: dialogue.reduce((sum, item) => sum + item.quotes.length, 0),
      reviewedUnquotedReplyCells: unquotedDialogue.length,
      omittedQuotedLabels: exclusions.length, manualChineseEmphasisCells: manualEmphasis.length },
    sourceFormatting, dialogue, unquotedDialogue, exclusions, manualEmphasis, repairs, derived,
  };
  return { catalog, report };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  const { catalog, report } = buildCatalog(read(snapshotPath), read('public/data/team-content.json'), read('public/data/zh-CN.json'));
  for (const [path, data] of [['public/data/text-formatting.json', catalog], ['docs/source/2026-11-05-text-formatting-report.json', report]]) {
    writeFileSync(resolve(root, path), JSON.stringify(data, null, 2) + '\n');
  }
  console.log(JSON.stringify(report.counts));
}
