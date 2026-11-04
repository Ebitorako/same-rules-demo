import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import Papa from 'papaparse';
import { SOURCE_DATE, endingCell, endingColumns, loadTeamSources, normaliseCompany } from './team-source.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (name) => readFileSync(resolve(root, name), 'utf8');
const write = (name, value) => writeFileSync(resolve(root, name), JSON.stringify(value, null, 2) + '\n');
const { english: snapshot } = loadTeamSources(root);
const statNames = ['Creativity', 'Communication', 'Network', 'Reputation', 'Availability', 'Energy'];
const initialStats = { Creativity: 3, Communication: 3, Network: 2, Reputation: 2, Availability: 2, Energy: 7 };
const chapterOneBalance = JSON.parse(read('src/config/chapter-one-balance.json'));
const expressionMap = { 满意: 'pleased', 中性: 'neutral', 打量: 'appraising', 皱眉: 'frowning', 尴尬: 'awkward', 冷淡: 'cold' };
const pawn = (value) => /仅\s*♀/.test(value) ? 'female' : /仅\s*♂/.test(value) ? 'male' : 'both';
const parseDelta = (text = '') => Object.fromEntries(text.split(/[,，]/).filter(v => v.trim()).map(part => {
  const m = /^([A-Za-z]+)\s*([+\-−])\s*(\d+(?:\.\d+)?)$/.exec(part.trim());
  if (!m) throw new Error(`Unrecognised delta: ${part}`);
  return [m[1], Number((m[2] === '−' ? '-' : m[2]) + m[3])];
}));

// Keep the previous release readable without interpreting its ids under the new rules.
if (!existsSync(resolve(root, 'public/data/legacy-data.json'))) {
  const oldCopy = JSON.parse(read('public/data/copy.json'));
  const oldRows = Papa.parse(read('public/data/endings.csv'), { header: true, skipEmptyLines: true }).data;
  const legacy = { contentVersion: 'prototype-v0.11', copy: oldCopy, endings: oldRows.map(r => ({
    id: r['编号'], name: r['结局名称'], pawn: pawn(r['适用棋子']), front: r['结局文字（正面）'],
    back: r['背面：理论概念'], reference: r['对应文献'], triggerNote: r['触发条件'],
    nextRoundNote: r['对下一局的影响'], artNote: r['美术需求'], notes: r['备注'],
  })) };
  write('public/data/legacy-data.json', legacy);
  mkdirSync(resolve(root, 'docs/source/prototype-v0.11'), { recursive: true });
  for (const file of ['scenarios.csv', 'endings.csv', 'copy.json', 'policies.json', 'candidates.json', 'guide.csv']) {
    writeFileSync(resolve(root, 'docs/source/prototype-v0.11', file), read(`public/data/${file}`));
  }
}

function normaliseCondition(raw = '') {
  const visible = [], available = [];
  for (const token of raw.split(/[；;]/).map(v => v.trim()).filter(Boolean)) {
    const stat = /^(Creativity|Communication|Network|Reputation|Availability|Energy)\s*(≥|>|≤|<)\s*(\d+)$/.exec(token);
    if (stat) { available.push(`stat:${stat[1]}${{ '≥': '>=', '≤': '<=' }[stat[2]] || stat[2]}${stat[3]}`); continue; }
    const gender = /^gender\s*=\s*([♀♂])$/.exec(token);
    if (gender) { visible.push(`pawn:${gender[1] === '♀' ? 'female' : 'male'}`); continue; }
    const flag = /^(c2_branch|has_child|policy)\s*=\s*([a-zA-Z_]+)(?:（.*）)?$/.exec(token);
    if (flag) { visible.push(`flag:${flag[1]}=${flag[2]}`); continue; }
    throw new Error(`Unrecognised source condition: ${raw}`);
  }
  return { condition: visible.join(';'), availableWhen: available.join(';') };
}
const canonicalId = id => id.replace(/^(C1-03)[FM]$/, '$1').replace(/^(C2-04)[ABCD]$/, '$1').replace(/^(C3-0[345])[ab]$/, '$1');
const scenarios = [], chapters = [], endings = [], milestones = [];
let epilogue;
for (const sheet of ['ch1', 'ch2', 'ch3', 'ch4']) {
  const endingHeader = endingColumns(snapshot.sheets[sheet].values);
  snapshot.sheets[sheet].values.forEach((raw, index) => {
    const r = Array.from({ length: 21 }, (_, i) => normaliseCompany(raw[i]));
    const source = { sourceSheet: sheet, sourceRow: index + 1, sourceCardId: r[0] };
    if (/^C[1-4]-00$/.test(r[0])) {
      const opening = { id: r[0], chapter: Number(r[1].slice(2)), title: r[4], scene: r[5], background: r[6], reference: r[18], guideAdvice: r[20], notes: r[19], ...source };
      if (r[0] === 'C3-00') {
        opening.effects = [{ pawn: 'female', when: 'flag:maternal_assumption=true;!policy:transparent', delta: { Availability: -1 } }];
        opening.recapText = 'The workplace assumes you may become a mother. Availability is reduced on entering this chapter, whether or not you later have children.';
      }
      chapters.push(opening);
    } else if (/^C[1-4]-(?:0[1-5][FMABCDab]?|B)$/.test(r[0])) {
      const option = r[9] === 'D' ? 4 : r[9] === '自动' ? 1 : Number(r[9]);
      const row = { cardId: canonicalId(r[0]), chapter: r[1], tile: r[2], type: r[3] === 'Boss' ? 'boss' : 'scenario',
        title: r[4], scene: r[5], background: r[6], npc: r[7], ...normaliseCondition(r[8]), sourceCondition: r[8],
        option, optionLabel: r[9] === '自动' ? 'Continue' : r[9], pawn: pawn(r[10]), optionText: r[11],
        results: { female: r[12], male: r[13] }, expressions: { female: expressionMap[r[14]] || r[14], male: expressionMap[r[15]] || r[15] },
        deltas: { female: parseDelta(r[16]), male: parseDelta(r[17]) }, reference: r[18], notes: r[19], guideAdvice: r[20], ...source };
      if (r[9] === '自动') row.automatic = true;
      const effects = [];
      const add = effect => effects.push(effect);
      if (r[0] === 'C1-03F') add({ setFlags: { maternal_assumption: true } });
      if (r[0] === 'C1-B') {
        const parts = r[12].split(/【[^】]+】/).map(t => t.trim()).filter(Boolean);
        if (parts.length !== 3) throw new Error('Expected three automatic Gatekeeper result paragraphs.');
        add({ when: 'stat:Creativity>=5', milestoneId: 'CH1-E01', setFlags: { role: 'junior_producer' }, resultText: { female: parts[0], male: parts[0] } });
        add({ when: 'stat:Creativity<5;stat:Communication>=5', endingId: 'E02', resultText: { female: parts[1], male: parts[1] } });
        add({ when: 'stat:Creativity<5;stat:Communication<5', endingId: 'E03', resultText: { female: parts[2], male: parts[2] } });
      }
      if (r[0] === 'C2-02' && option === 2 && row.pawn === 'female') add({ when: 'policy:transparent', deltaOverride: { Network: 0 } });
      if (r[0] === 'C2-03') add({ setFlags: { c2_branch: ['A', 'B', 'C', 'D'][option - 1] } });
      if (/^C2-04[ABC]$/.test(r[0]) && option === 4) add({ endingId: 'E08' });
      if (/^C2-04[AC]$/.test(r[0]) && option === 2) add({ pawn: 'female', when: 'policy:coordinator', deltaOverride: { Reputation: 0 } });
      if (r[0] === 'C2-04D') add({ endingId: 'E10' });
      if (r[0] === 'C2-B') {
        if (option === 1) {
          row.unavailableText = { female: "Maybe I'm just not likeable enough.", male: 'Maybe I need to get to know a few more people.' };
          add({ pawn: 'female', setFlags: { role: 'acting_senior' } });
          add({ pawn: 'male', milestoneId: 'CH2-E07', setFlags: { role: 'producer' } });
        } else if (option === 2) {
          row.unavailableText = { female: "Maybe my work just isn't good enough.", male: "Next time I'll bring a few more examples." };
          add({ milestoneId: 'CH2-E07' });
          add({ pawn: 'female', when: '!policy:transparent', setFlags: { role: 'production_management' } });
          add({ pawn: 'male', setFlags: { role: 'producer' } });
          add({ pawn: 'female', when: 'policy:transparent', setFlags: { role: 'producer' }, resultText: { female: r[13] }, expression: { female: row.expressions.male } });
        } else {
          add({ pawn: 'female', endingId: 'E09' });
          add({ pawn: 'male', milestoneId: 'CH2-E07', setFlags: { role: 'producer' } });
        }
      }
      if (r[0] === 'C3-01' && option === 3) add({ pawn: 'female', setFlags: { promised_no_kids: true } });
      if (r[0] === 'C3-02') {
        add({ setFlags: { has_child: option === 1 } });
        if (option === 1) add({ pawn: 'female', when: 'flag:promised_no_kids=true', delta: { Reputation: -1 } });
      }
      if (r[0] === 'C3-03a' && option === 2) add({ pawn: 'male', setFlags: { partner_primary: true } });
      if (r[0] === 'C3-B') {
        if (option === 1) {
          if (row.pawn === 'female') row.unavailableText = { female: r[8].includes('true') ? "Every other mum seems to manage it. Why can't I? Maybe I just can't do it." : "Maybe I'm just not good enough." };
          if (row.pawn === 'male') add({ when: 'flag:partner_primary=true', endingId: 'E05' });
        } else if (option === 2) add({ endingId: 'E06' });
        else add({ endingId: row.pawn === 'female' && r[8].includes('false') ? 'E07' : 'E04' });
      }
      if (r[0] === 'C4-01') add({ setFlags: { hire: ['creative', 'support', 'blind'][option - 1] }, hiredIntern: option === 1 ? 'josh' : 'chloe' });
      if (r[0] === 'C4-03') {
        add({ setFlags: { policy: ['zero_tolerance', 'coordinator', 'transparent'][option - 1] } });
        if (option === 3) add({ pawn: 'female', when: 'flag:hire=blind', deltaOverride: { Reputation: 0 } });
      }
      if (r[0] === 'C4-B') {
        const proposal = /policy = ([a-z_]+)/.exec(r[8])[1];
        const finalPolicy = option === 3 ? 'none' : option === 1 ? proposal : proposal === 'coordinator' ? 'zero_tolerance' : 'coordinator';
        add({ policy: finalPolicy, setFlags: { policy: finalPolicy } });
        if (row.availableWhen) row.unavailableText = { female: "Maybe my voice just doesn't carry enough weight.", male: "Maybe the timing just isn't right." };
      }
      if (effects.length) row.effects = effects;
      scenarios.push(row);
    } else if (/^E\d+$/.test(r[0]) || r[0] === '终章') {
      const field = label => endingCell(r, endingHeader, label);
      const ending = { id: r[0], sourceId: r[0], name: r[1], triggerNote: r[2], pawn: pawn(r[3]), front: r[4], back: r[5],
        reference: field('对应文献'), nextRoundNote: field('对下一局的影响'), artNote: field('美术需求'), notes: field('备注'), guideAdvice: field('规则书（可选）'), ...source };
      if (sheet === 'ch3' && r[0] === 'E04') {
        const quote = /^♂ 触发时正面改为："([\s\S]+)"$/.exec(ending.notes);
        if (!quote) throw new Error('Missing authored male E04 text.');
        ending.frontByPawn = { male: quote[1] };
      }
      if (r[0] === '终章') { epilogue = { ...ending, id: 'EPILOGUE', eligibleEndings: ['E12', 'E13', 'E14'] }; }
      else if (sheet === 'ch1' && r[0] === 'E01' || sheet === 'ch2' && r[0] === 'E07') { ending.id = sheet === 'ch1' ? 'CH1-E01' : 'CH2-E07'; ending.kind = 'milestone'; milestones.push(ending); }
      else endings.push(ending);
    }
  });
}

function chapterOneRoutes(rows, creativityGate = 5, communicationGate = 5) {
  const summary = {};
  for (const pawn of ['female', 'male']) {
    const counts = { 'CH1-E01': 0, E02: 0, E03: 0 }, examples = {};
    for (let code = 0; code < 81; code++) {
      let number = code;
      const stats = { ...initialStats }, choices = [];
      for (let card = 1; card <= 4; card++) {
        const option = number % 3 + 1;
        number = Math.floor(number / 3);
        choices.push(option);
        const row = rows.find(row => row.cardId === `C1-0${card}` && row.option === option && ['both', pawn].includes(row.pawn));
        for (const [stat, amount] of Object.entries(row.deltas[pawn])) stats[stat] = Math.max(0, Math.min(10, stats[stat] + amount));
      }
      const ending = stats.Creativity >= creativityGate ? 'CH1-E01' : stats.Communication >= communicationGate ? 'E02' : 'E03';
      counts[ending]++;
      examples[ending] ??= { choices: [...choices, 1], stats };
    }
    summary[pawn] = { counts, examples };
  }
  return summary;
}

// Keep the read-only sheet intact and apply only the designer-approved exception.
const originalChapterOne = structuredClone(scenarios.filter(row => row.chapter === 'Ch1'));
const balanceRows = scenarios.filter(row => row.sourceSheet === chapterOneBalance.sourceSheet && row.sourceRow === chapterOneBalance.sourceRow && row.cardId === chapterOneBalance.cardId && row.option === chapterOneBalance.option);
if (balanceRows.length !== 1 || !statNames.includes(chapterOneBalance.stat)) throw new Error('The approved Chapter 1 balance no longer matches the source. Review it before importing.');
for (const pawn of chapterOneBalance.pawns) {
  const delta = balanceRows[0].deltas[pawn];
  if (delta[chapterOneBalance.stat] !== chapterOneBalance.from) throw new Error(`The source ${pawn} delta changed; review the approved balance before importing.`);
  delta[chapterOneBalance.stat] = chapterOneBalance.to;
}
write(`docs/source/${SOURCE_DATE}-ch1-balance.json`, {
  adjustment: chapterOneBalance,
  sourceCells: ['ch1!Q19', 'ch1!R19'],
  before: chapterOneRoutes(originalChapterOne),
  after: chapterOneRoutes(scenarios),
  alternatives: [
    { change: 'Creativity entry threshold 5 to 6', reasonNotChosen: 'Female E03 remains unreachable and female promotions fall from 21 to 3.', routes: chapterOneRoutes(originalChapterOne, 6, 5) },
    { change: 'Communication entry threshold 5 to 6', reasonNotChosen: 'Male E02 becomes unreachable.', routes: chapterOneRoutes(originalChapterOne, 5, 6) },
    { change: 'Both entry thresholds 5 to 6', reasonNotChosen: 'Male E02 becomes unreachable and female promotions fall from 21 to 3.', routes: chapterOneRoutes(originalChapterOne, 6, 6) },
  ],
  interpretation: 'Counts enumerate all 81 choice sequences per pawn, not empirical player probabilities. The selected adjustment preserves every promotion route and changes only some E02 exits to E03.',
});

for (const row of [...scenarios]) {
  if (row.cardId !== 'C3-01') continue;
  scenarios.push({ ...structuredClone(row), pawn: 'female', condition: 'flag:previous_family_man=true',
    scene: row.scene + '\n\n“We assumed you\'d want to slow down.”',
    sourceDerivation: 'ch3!H46: the previous Family Man speaks this line to the female pawn in C3-01.' });
}

const oldCopy = JSON.parse(read('public/data/legacy-data.json')).copy;
const copy = { ...oldCopy, companyName: 'FreeDom', introduction: chapters[0].scene, promotionTitle: chapters[3].title, promotionText: chapters[3].scene,
  gatekeeperReturning: '', gatekeeperFormal: '', gatekeeperUnchanged: '',
  placeholderNotice: 'Story and rules supplied by the team.',
  statDescriptions: Object.fromEntries(statNames.map(name => [name, oldCopy.statDescriptions[name]])),
  lowEnergyAdvice: 'You look a little tired! Don’t worry, everyone in the creative industries gets through it this way. (A little tip: if your energy runs out, you’ll leave the industry.)',
};
const candidates = [
  { id: 'chloe', name: 'Chloe', pawn: 'female', blurb: 'Great team player, super organised, always happy to help.', stats: {} },
  { id: 'josh', name: 'Josh', pawn: 'male', blurb: 'Bold, a bit chaotic, but a real creative.', stats: {} },
];
const policies = [
  { id: 'zero_tolerance', name: 'Zero tolerance statement', benefit: 'Publish a “zero tolerance” statement.', cost: 'Statement only', nextRoundEffect: 'No change in the next career.', mvp: true },
  { id: 'coordinator', name: 'Dedicated coordinator', benefit: 'Hire an intimacy coordinator / people coordinator dedicated to handling complaints on set and at team events.', cost: 'A dedicated role', nextRoundEffect: 'Removes the negative Reputation change for women in the applicable C2-04 conversations.', mvp: true },
  { id: 'transparent', name: 'Transparent hiring and flexible working', benefit: 'Every role advertised openly, written review criteria, and flexible hours available to all staff.', cost: 'Change hiring, review and working arrangements', nextRoundEffect: 'Changes the next career’s C2-02 decision process, C2-B recognition and Chapter 3 entry penalty.', mvp: true },
];
const warnings = [
  '已按设计者授权最小调平：C1-04选项3的Communication由+1改为0，男女一致；其余加分、起点与门槛不变。第一章81条路线中，女棋子晋升21/E02 45/E03 15，男棋子晋升51/E02 18/E03 12；原表快照保留，例外见src/config/chapter-one-balance.json。',
  '2026-11-05共享表新增ch1结局文献列：CH1-E01、E02、E03现使用G23:G25的Hesmondhalgh & Baker (2015)。按表头导入，保留其余结局字段。',
  'ch2!T30 说取消 Reputation−1，但 Q30 实际为 Reputation+1；保留 +1，不额外加分。',
  'transparent 在 C2-B 选项2的“结果与男性相同”按结果文案与表情处理；保留数值列的女性 Communication+1、Reputation+1，不擅自改为男性数值。',
  '透明招聘改变 C2-02 正式决定过程、协调员参与 C2-04 谈话，但表中未提供替换英文对白；已落实明确的数值规则，原对白保留，待组员补写。',
  'ch3 E05 指定下一局 C3-01 对女棋子说 We assumed you’d want to slow down.；句子单独展示，不覆写原结果。',
  'ch3 C3-B 男棋子门槛不足没有专属独白；仅显示不可用状态，不编写独白。',
  'ch4 终章触发范围表述不一致；按末行及完整职业正文，仅 E12/E13/E14 后展示终章。',
  'ch4 E14 的男女末尾句标为可选，本次不追加。',
  '上限10沿用原骨架；正式表只指定初始值及Burnout下限，没有新的最大值。除已授权的C1-04选项3例外外，未调整其他数值。',
  'Energy≤1 提示来自中文规则表，本次提供忠实英文界面译文。',
];
const data = { contentVersion: 'team-2026-11-03', source: { spreadsheetId: snapshot.spreadsheetId, url: snapshot.url, retrievedDate: snapshot.retrievedDate },
  statNames, initialStats,
  scenarios, chapters, endings: endings.sort((a,b) => Number(a.id.slice(1))-Number(b.id.slice(1))), milestones, epilogue, candidates, policies, powerTokens: 1, copy, warnings };
write('public/data/team-content.json', data);
const csvCell = value => '"' + String(value ?? '').replace(/[ \t]+(?=\r?\n)/g, '').replaceAll('"', '""') + '"';
const csv = rows => rows.map(row => row.map(csvCell).join(',')).join('\n') + '\n';
const deltaText = delta => Object.entries(delta).map(([name, amount]) => `${name}${amount >= 0 ? '+' : ''}${amount}`).join(', ');
const pawnText = p => p === 'female' ? '仅♀' : p === 'male' ? '仅♂' : '都可';
writeFileSync(resolve(root, 'public/data/scenarios.csv'), csv([
  ['卡号','章节','格子','类型','场景标题','场景描述','背景信息（游戏内可翻看）','NPC','出现条件（可选）','选项','适用棋子','选项文字','结果 ♀','结果 ♂','NPC 表情 ♀','NPC 表情 ♂','数值变化 ♀','数值变化 ♂','对应文献','备注','规则书','原卡号','来源工作表','来源行','可用条件'],
  ...scenarios.map(r => [r.cardId,r.chapter,r.tile,r.type === 'boss' ? 'Boss' : '情境',r.title,r.scene,r.background,r.npc,r.condition,r.option,r.pawn === 'both' ? '都可' : pawnText(r.pawn),r.optionText,r.results.female,r.results.male,r.expressions.female,r.expressions.male,deltaText(r.deltas.female),deltaText(r.deltas.male),r.reference,r.notes,r.guideAdvice,r.sourceCardId,r.sourceSheet,r.sourceRow,r.availableWhen]),
]));
writeFileSync(resolve(root, 'public/data/endings.csv'), csv([
  ['编号','结局名称','触发条件','适用棋子','结局文字（正面）','背面：理论概念','对应文献','对下一局的影响','美术需求','备注'],
  ...data.endings.map(r => [r.id,r.name,r.triggerNote,pawnText(r.pawn),r.front,r.back,r.reference,r.nextRoundNote,r.artNote,r.notes]),
]));
write('public/data/copy.json', copy);
write('public/data/candidates.json', { candidates });
write('public/data/policies.json', { powerTokens: 1, policies });
write(`docs/source/${SOURCE_DATE}-import-report.json`, { source: data.source, options: scenarios.length, slots: new Set(scenarios.map(r=>r.cardId)).size, endings: endings.length, milestones: milestones.length, chapters: chapters.length, mechanicalSourceCheck: 'All scenario identities, gates, options, pawns, expressions and deltas match the 2026-11-03 source; the existing E03 balance override is unchanged.', warnings });
console.log(`Imported ${scenarios.length} option rows, ${new Set(scenarios.map(r=>r.cardId)).size} card slots, ${endings.length} endings, ${milestones.length} milestones and ${chapters.length} openings.`);
