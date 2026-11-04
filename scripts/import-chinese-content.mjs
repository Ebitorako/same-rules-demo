import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SOURCE_DATE, endingCell, endingColumns, loadTeamSources, normaliseCompany } from './team-source.mjs';

const root = resolve(import.meta.dirname, '..');
const read = name => JSON.parse(readFileSync(resolve(root, name), 'utf8'));
const write = (name, value) => writeFileSync(resolve(root, name), JSON.stringify(value, null, 2) + '\n');
const { english, chinese, previousEnglish, previousChinese } = loadTeamSources(root);
const runtime = read('public/data/team-content.json');
const translations = Object.create(null);
const mappings = [], corrections = [], interfaceTranslations = [];
const warnings = [];
const historicalConflicts = [];
const value = cell => String(cell ?? '');
const cellRef = (sheet, row, column) => `${sheet}!${String.fromCharCode(65 + column)}${row}`;

function add(en, zh, source, kind = 'sheet') {
  en = value(en); zh = normaliseCompany(zh);
  if (!en) return;
  if (!zh) throw new Error(`Missing Chinese text for ${source}: ${en}`);
  for (const key of new Set([en, normaliseCompany(en)])) {
    if (translations[key] !== undefined && translations[key] !== zh) {
      if (kind === 'historical-sheet') { historicalConflicts.push({ source, english: key }); continue; }
      throw new Error(`Conflicting Chinese translations for ${source}: ${key}`);
    }
    translations[key] = zh;
  }
  mappings.push({ english: en, chinese: zh, source, kind });
}
function pair(sheet, row, column, enSource = english, zhSource = chinese, kind = 'sheet') {
  const en = value(enSource.sheets[sheet].values[row - 1]?.[column]);
  const tab = sheet + '中文版';
  let zh = value(zhSource.sheets[tab].values[row - 1]?.[column]);
  if (sheet === 'ch2' && row === 14 && column === 6 && zh === '去') {
    const identicalRows = [11, 12, 13, 15, 16];
    const context = identicalRows.map(n => value(zhSource.sheets[tab].values[n - 1]?.[column]));
    if (!context[0] || !context.every(t => t === context[0])) throw new Error('The documented G14 context repair no longer has unanimous source support.');
    zh = context[0];
    if (kind !== 'historical-sheet') corrections.push({ cell: `${tab}!G14`, sourceValue: '去', displayedValue: zh,
      copiedFrom: identicalRows.map(n => `${tab}!G${n}`), reason: 'The same scene repeats one complete background in five sibling rows; use that authored text instead of the isolated character. The source sheet and snapshot are unchanged.' });
  }
  add(en, zh, cellRef(tab, row, column), kind);
}

let sourceOptions = 0;
function pairedRows(enSource, zhSource, kind = 'sheet') {
for (const sheet of ['ch1', 'ch2', 'ch3', 'ch4']) {
  const rows = enSource.sheets[sheet].values;
  const zhRows = zhSource.sheets[sheet + '中文版'].values;
  const enHeader = endingColumns(rows), zhHeader = endingColumns(zhRows);
  if (rows.length !== zhRows.length) throw new Error(`${sheet}: source row counts differ; review alignment before importing.`);
  rows.forEach((r, i) => {
    const z = zhRows[i] ?? [], row = i + 1;
    if (!/^C[1-4]-/.test(r[0] ?? '') && !/^E\d+$/.test(r[0] ?? '') && r[0] !== '终章') return;
    if (r[0] !== z[0]) throw new Error(`${sheet}:${row}: card ids do not align.`);
    if (/^C[1-4]-/.test(r[0])) {
      // Only text is imported. Mechanics stay in the approved English runtime dataset.
      for (const column of [1, 2, 3, 8, 9, 10, 14, 15, 16, 17]) {
        if (value(r[column]) !== value(z[column])) throw new Error(`${sheet}:${row}:${column}: mechanical/source identity field differs between languages.`);
      }
      for (const column of [4, 5, 6, 7, 11, 12, 13, 18, 20]) pair(sheet, row, column, enSource, zhSource, kind);
      if (kind !== 'historical-sheet' && !/^C[1-4]-00$/.test(r[0])) sourceOptions++;
    } else {
      for (const field of ['结局名称', '结局文字（正面）', '背面：理论概念', '对应文献', '规则书（可选）']) {
        const en = endingCell(r, enHeader, field);
        // Author names and years are shared across languages when the older Chinese layout has no citation column.
        const zh = endingCell(z, zhHeader, field) || (field === '对应文献' ? en : '');
        add(en, zh, `${sheet + '中文版'}!row ${row} ${field}`, kind);
      }
    }
  });
}
}
pairedRows(english, chinese);
pairedRows(previousEnglish, previousChinese, 'historical-sheet');

// Runtime splits the Gatekeeper's three automatic outcomes into individual paragraphs.
for (const [enSource, zhSource, kind] of [[english, chinese, 'derived-sheet'], [previousEnglish, previousChinese, 'historical-sheet']]) {
for (const pawn of ['female', 'male']) {
  const column = pawn === 'female' ? 12 : 13;
  const en = enSource.sheets.ch1.values[19][column].split(/【[^】]+】/).map(t => t.trim()).filter(Boolean);
  const zh = zhSource.sheets['ch1中文版'].values[19][column].split(/【[^】]+】/).map(t => t.trim()).filter(Boolean);
  if (en.length !== 3 || zh.length !== 3) throw new Error('Gatekeeper outcomes must contain exactly three paired paragraphs.');
  en.forEach((text, index) => add(text, zh[index], `ch1中文版!${pawn === 'female' ? 'M' : 'N'}20 outcome ${index + 1}`, kind));
}
}

// Read the actual Chinese thoughts from the authors' notes, not new story translations.
for (const scenario of runtime.scenarios.filter(r => r.unavailableText)) {
  const tab = scenario.sourceSheet + '中文版';
  const note = value(chinese.sheets[tab].values[scenario.sourceRow - 1]?.[19]);
  for (const [pawn, text] of Object.entries(scenario.unavailableText)) {
    const genderMark = pawn === 'female' ? '♀' : '♂';
    const quote = note.match(new RegExp(`${genderMark}：?[“\"]([^”\"]+)[”\"]`))
      ?? note.match(/独白：[“\"]([^”\"]+)[”\"]/);
    if (!quote) throw new Error(`Missing source thought: ${tab}!T${scenario.sourceRow} / ${pawn}`);
    add(text, quote[1], `${tab}!T${scenario.sourceRow} ${genderMark} thought`, 'derived-sheet');
  }
}
const maleEnding = runtime.endings.find(e => e.id === 'E04').frontByPawn.male;
const maleNote = chinese.sheets['ch3中文版'].values[44][9];
const maleQuote = maleNote.match(/♂ 触发时改为：[“\"]([^”\"]+)[”\"]/);
if (!maleQuote) throw new Error('Missing Chinese male E04 ending.');
add(maleEnding, maleQuote[1], 'ch3中文版!J45 male E04', 'derived-sheet');

const familyNote = chinese.sheets['ch3中文版'].values[45][7];
const familyQuote = familyNote.match(/说：[“\"]([^”\"]+)[”\"]/);
if (!familyQuote) throw new Error('Missing Chinese next-career Family Man sentence.');
for (const row of runtime.scenarios.filter(r => r.condition === 'flag:previous_family_man=true')) {
  const baseScene = chinese.sheets['ch3中文版'].values[row.sourceRow - 1][5];
  add(row.scene, `${baseScene}\n\n“${familyQuote[1]}”`, `ch3中文版!F${row.sourceRow} + H46`, 'derived-sheet');
  const oldEnglishScene = previousEnglish.sheets.ch3.values[row.sourceRow - 1][5];
  const oldChineseScene = previousChinese.sheets.ch3中文版.values[row.sourceRow - 1][5];
  add(`${oldEnglishScene}\n\n“We assumed you'd want to slow down.”`, `${oldChineseScene}\n\n“${familyQuote[1]}”`, `2026-11-03 ch3中文版!F${row.sourceRow} + H46`, 'historical-sheet');
}

// These are interface descriptions already present in the game, not newly authored plot.
const interfaceCopy = {
  'One career. Another turn.': '一段职业生涯。又一次选择。',
  'The Director': '创意总监',
  'Story and rules supplied by the team. Art placeholders will be replaced with the prepared assets.': '剧情与规则由项目组提供。美术占位图将逐步替换为正式素材。',
  'Developing original ideas and creative contributions.': '提出原创想法并作出创意贡献的能力。',
  'Communicating ideas and working with others.': '表达想法、与他人协作的能力。',
  'Access to professional contacts and opportunities.': '获得行业人脉与工作机会的渠道。',
  'How others in the workplace regard your work.': '职场中的其他人对你工作的评价。',
  'The time and flexibility you can offer the workplace.': '你能够投入工作的时间与灵活程度。',
  'The energy available to sustain work and recover.': '维持工作与恢复状态所需的精力。',
  'The workplace assumes you may become a mother. Availability is reduced on entering this chapter, whether or not you later have children.': '职场预设你可能成为母亲。因此进入本章时，可投入工作的时间受到扣减，无论你之后是否选择生育。',
  'The Guide': '指引人',
  'Your studio companion': '你的工作室同行者',
  'Take a moment to read the scene. I can offer some context, but you decide what to do. You can hide my advice and ask for it again whenever you like.': '先花一点时间阅读情境。我可以补充背景，但如何行动由你决定。你可以隐藏建议，也可以随时再次向我寻求提示。',
  'Move with Next. Read the situation and choose an available option. After the result, Continue takes you back to the board.': '点击“下一步”前进，阅读情境并选择一个可用选项。查看结果后，点击“继续”回到棋盘。',
  'Select Next to move forward. Read the situation and choose from the available options. After seeing the result, select Continue to return to the board.': '点击“下一步”前进，阅读情境并从可用选项中作出选择。查看结果后，点击“继续”回到棋盘。',
  'Zero tolerance statement': '零容忍声明',
  'Dedicated coordinator': '专职协调员',
  'Transparent hiring and flexible working': '透明招聘与弹性工作制',
  'Statement only': '仅发布声明',
  'A dedicated role': '设立专职岗位',
  'Change hiring, review and working arrangements': '改变招聘、评审和工作安排',
  'No change in the next career.': '下一段职业生涯的规则不变。',
  'Removes the negative Reputation change for women in the applicable C2-04 conversations.': '取消下一段职业生涯中，女性在对应 C2-04 对话里的声誉扣减。',
  'Changes the next career’s C2-02 decision process, C2-B recognition and Chapter 3 entry penalty.': '改变下一段职业生涯的 C2-02 决策流程、C2-B 认可方式及第三章入场扣减。',
};
for (const [en, zh] of Object.entries(interfaceCopy)) {
  add(en, zh, 'existing-interface-description', 'interface');
  interfaceTranslations.push(en);
}
const energyRule = english.sheets['ch3相关规则说明'].values.find(r => r[0] === 'Energy 规则')?.[1];
const energyQuote = energyRule?.match(/提示：[“\"]([^”\"]+)[”\"]/);
if (!energyQuote) throw new Error('Missing source low-energy advice.');
add(runtime.copy.lowEnergyAdvice, energyQuote[1], 'ch3相关规则说明!B10', 'derived-sheet');
const candidateScene = chinese.sheets['ch4中文版'].values[4][5];
for (const candidate of runtime.candidates) {
  const quote = candidateScene.match(new RegExp(`（${candidate.name}）：[“\"]([^”\"]+)[”\"]`));
  if (!quote) throw new Error(`Missing source candidate description: ${candidate.name}`);
  add(candidate.blurb, quote[1], 'ch4中文版!F5', 'derived-sheet');
}
for (const policy of runtime.policies) {
  const index = ['zero_tolerance', 'coordinator', 'transparent'].indexOf(policy.id);
  const source = chinese.sheets['ch4中文版'].values[13 + index][11];
  // The transparent policy benefit omits the introductory label in the English UI.
  const zh = policy.id === 'transparent' ? source.slice(source.indexOf('：') + 1) : source;
  add(policy.benefit, zh, `ch4中文版!L${14 + index}`, 'derived-sheet');
}

// Assert every user-visible source field is covered, including frozen result snapshots.
const missing = [];
const check = (text, path) => { if (text && translations[text] === undefined) missing.push({ path, text }); };
for (const row of runtime.scenarios) {
  for (const key of ['title', 'scene', 'background', 'npc', 'optionText', 'guideAdvice', 'reference']) check(row[key], `${row.sourceSheet}:${row.sourceRow}.${key}`);
  for (const pawn of ['female', 'male']) {
    check(row.results[pawn], `${row.sourceSheet}:${row.sourceRow}.results.${pawn}`);
    check(row.unavailableText?.[pawn], `${row.sourceSheet}:${row.sourceRow}.unavailableText.${pawn}`);
    for (const effect of row.effects ?? []) check(effect.resultText?.[pawn], `${row.sourceSheet}:${row.sourceRow}.effects.resultText.${pawn}`);
  }
}
for (const row of [...runtime.chapters, ...runtime.endings, ...runtime.milestones, runtime.epilogue]) {
  for (const key of ['title', 'name', 'scene', 'front', 'back', 'background', 'guideAdvice', 'reference', 'recapText']) check(row[key], `${row.id}.${key}`);
  for (const text of Object.values(row.frontByPawn ?? {})) check(text, `${row.id}.frontByPawn`);
}
if (missing.length) throw new Error(`Untranslated runtime story fields:\n${JSON.stringify(missing, null, 2)}`);
warnings.push('ch2中文版!G14 只有“去”；显示时采用同一场景 G11:G13、G15:G16 一致的完整背景。原表和快照未改。');
warnings.push('中文页保留的职位英文、人物姓名和文献引用按组员原文显示。第一章结局引用采用英文页新增的同一作者年份；男性 Ideal Worker 缺失独白仍为空。公司名称在显示文字中统一为FreeDom，原始快照不变。');
warnings.push('中文版本只替换显示文字，共用现有数值规则及已批准的 C1-04 调平；不重置或重算存档。');
const source = { spreadsheetId: chinese.spreadsheetId, url: chinese.url, retrievedDate: chinese.retrievedDate,
  tabs: ['ch1中文版', 'ch2中文版', 'ch3中文版', 'ch4中文版'] };
write('public/data/zh-CN.json', { locale: 'zh-CN', source, translations, warnings });
write(`docs/source/${SOURCE_DATE}-chinese-import-report.json`, { source, options: sourceOptions, runtimeOptions: runtime.scenarios.length,
  chapters: runtime.chapters.length, endings: runtime.endings.length, milestones: runtime.milestones.length,
  translationCount: Object.keys(translations).length, mappingCount: mappings.length, corrections, interfaceTranslations, historicalConflicts, missing, warnings,
  sourceLocations: [...new Set(mappings.filter(m => m.kind !== 'interface').map(m => m.source))] });
console.log(`Chinese display content: ${sourceOptions} source choices, ${Object.keys(translations).length} exact text translations, ${corrections.length} documented source-cell repair.`);
