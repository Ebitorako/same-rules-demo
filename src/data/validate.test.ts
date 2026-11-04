import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { GameData } from '../game/types';
import { getDataWarnings, validateData } from './validate';
import { parseDelta } from './parse';
import { parseTeamContent } from './team';

const read = (name: string): string => readFileSync(resolve(name), 'utf8');
const fixture = (): GameData => JSON.parse(read('public/data/team-content.json'));
const source = JSON.parse(read('docs/source/2026-11-05-sheet-formatting.json')) as {
  sheets: Record<string, { values: string[][] }>;
};
const normaliseCompany = (value = '') => value.replace(/\bfreedom\b/gi, 'FreeDom');

describe('the team’s published story content', () => {
  it('covers every card slot, chapter opening, terminal ending and milestone', () => {
    const data = parseTeamContent(read('public/data/team-content.json'));
    expect(validateData(data)).toEqual([]);
    expect(new Set(data.scenarios.map(row => row.cardId)).size).toBe(20);
    expect(data.chapters).toHaveLength(4);
    expect(data.endings).toHaveLength(13);
    expect(data.milestones?.map(e => e.id)).toEqual(['CH1-E01', 'CH2-E07']);
    expect(data.epilogue?.eligibleEndings).toEqual(['E12', 'E13', 'E14']);
  });

  it('preserves all 111 source choices and texts with only the approved C1-04 communication adjustment', () => {
    const data = fixture();
    let sourceCount = 0;
    let adjustedRows = 0;
    for (const sheet of ['ch1', 'ch2', 'ch3', 'ch4']) source.sheets[sheet].values.forEach((r, index) => {
      if (!/^C[1-4]-(?:0[1-5][FMABCDab]?|B)$/.test(r[0] ?? '')) return;
      sourceCount++;
      const row = data.scenarios.find(item => item.sourceSheet === sheet && item.sourceRow === index + 1 && item.condition !== 'flag:previous_family_man=true')!;
      expect(row, `${sheet}:${index + 1}`).toBeDefined();
      expect([row.title, row.scene, row.background, row.npc, row.optionText]).toEqual([r[4], r[5], r[6], r[7], r[11]].map(normaliseCompany));
      expect(row.results).toEqual({ female: normaliseCompany(r[12]), male: normaliseCompany(r[13]) });
      const expectedDeltas = { female: parseDelta(r[16] ?? ''), male: parseDelta(r[17] ?? '') };
      if (sheet === 'ch1' && index + 1 === 19 && r[0] === 'C1-04' && r[9] === '3') {
        expect(expectedDeltas.female.Communication).toBe(1);
        expect(expectedDeltas.male.Communication).toBe(1);
        expectedDeltas.female.Communication = 0;
        expectedDeltas.male.Communication = 0;
        adjustedRows++;
      }
      expect(row.deltas).toEqual(expectedDeltas);
      expect([row.reference, row.notes, row.guideAdvice, row.sourceCardId]).toEqual([r[18], r[19], r[20], r[0]].map(normaliseCompany));
    });
    expect(sourceCount).toBe(111);
    expect(adjustedRows).toBe(1);
  });

  it('uses six authored starting values and removes the two temporary abilities', () => {
    const data = fixture();
    expect(data.initialStats).toEqual({ Creativity: 3, Communication: 3, Network: 2, Reputation: 2, Availability: 2, Energy: 7 });
    expect(data.statNames).toEqual(['Creativity', 'Communication', 'Network', 'Reputation', 'Availability', 'Energy']);
    expect(Object.keys(data.copy.statDescriptions!)).toEqual(data.statNames);
    expect(JSON.stringify(data.scenarios)).not.toMatch(/"(?:Skill|Money)"/);
  });

  it('keeps the fourth choice, forced exit and fixed-size board-slot mappings', () => {
    const data = fixture();
    expect(data.scenarios.filter(row => row.cardId === 'C2-03' && row.optionLabel === 'D')).toHaveLength(2);
    expect(data.scenarios.filter(row => row.sourceCardId === 'C2-04D').every(row => row.cardId === 'C2-04' && row.automatic && row.effects?.[0].endingId === 'E10')).toBe(true);
    expect(data.scenarios.filter(row => row.sourceCardId === 'C3-03a').every(row => row.cardId === 'C3-03' && row.condition === 'flag:has_child=true')).toBe(true);
  });

  it('separates visible branches from numeric locks and preserves the authored monologues', () => {
    const data = fixture();
    const child = data.scenarios.find(row => row.cardId === 'C3-B' && row.option === 1 && row.pawn === 'female' && row.condition.includes('true'))!;
    expect(child.condition).toBe('flag:has_child=true');
    expect(child.availableWhen).toBe('stat:Availability>=3');
    expect(child.unavailableText?.female).toBe("Every other mum seems to manage it. Why can't I? Maybe I just can't do it.");
    const strict = data.scenarios.find(row => row.cardId === 'C4-B' && row.option === 1 && row.condition === 'flag:policy=transparent')!;
    expect(strict.availableWhen).toBe('stat:Reputation>5');
  });

  it('imports the added CH1 reference column without shifting notes or inventing still-missing citations', () => {
    const data = fixture();
    for (const row of [...data.endings, ...data.milestones!].filter(row => row.sourceSheet === 'ch1')) {
      const cells = source.sheets.ch1.values[row.sourceRow! - 1];
      expect(row.reference).toBe(cells[6]);
      expect(row.nextRoundNote).toBe(cells[7]);
      expect(row.artNote).toBe(cells[8]);
      expect(row.notes).toBe(cells[9] ?? '');
      expect(row.guideAdvice).toBe(cells[10]);
    }
    expect(data.chapters?.find(row => row.id === 'C1-00')?.reference).toBe('');
    expect(data.chapters?.find(row => row.id === 'C3-00')?.reference).toBe('Dent');
    expect(data.endings.find(row => row.id === 'E14')?.reference).toContain('; Sørensen');
  });

  it('does not change the contradictory +1 or append optional ending text', () => {
    const data = fixture();
    const b = data.scenarios.find(row => row.sourceCardId === 'C2-04B' && row.option === 2)!;
    expect(b.deltas.female.Reputation).toBe(1);
    expect(b.effects).toBeUndefined();
    expect(data.endings.find(row => row.id === 'E14')?.front).not.toContain('diversity');
    expect(getDataWarnings(data).join('\n')).toContain('Q30 实际为 Reputation+1');
  });

  it('keeps the male ending text and the next-career Family Man line distinct from generic text', () => {
    const data = fixture();
    expect(data.endings.find(row => row.id === 'E04')?.frontByPawn?.male).toBe("You chose to leave. Everyone was surprised, and plenty of people asked you to stay, but you politely turned them down. Was it the right choice? You don't know. But the world outside is a big place anyway.");
    const variants = data.scenarios.filter(row => row.cardId === 'C3-01' && row.condition === 'flag:previous_family_man=true');
    expect(variants).toHaveLength(3);
    expect(variants.every(row => row.pawn === 'female' && row.scene.endsWith('“We assumed you\'d want to slow down.”'))).toBe(true);
  });

  it('isolates the previous release’s ending ids and text for archived saves', () => {
    const old = JSON.parse(read('public/data/legacy-data.json'));
    const current = fixture();
    expect(old.contentVersion).toBe('prototype-v0.11');
    expect(old.endings.find((e: { id: string }) => e.id === 'E02').name).toBe('Nothing Needed to Change');
    expect(current.endings.find(e => e.id === 'E02')?.name).toBe('A Different Door');
  });
});

describe('formal content validation', () => {
  it('rejects missing cards and incomplete conditional branches', () => {
    const data = fixture();
    data.scenarios = data.scenarios.filter(row => row.cardId !== 'C1-01');
    expect(validateData(data).join('\n')).toContain('C1-01 缺少');
    const branch = fixture();
    branch.scenarios = branch.scenarios.filter(row => !(row.sourceCardId === 'C3-04a' && row.option === 2 && row.pawn === 'male'));
    expect(validateData(branch).join('\n')).toContain('C3-04 / male / has_child=true');
  });

  it('rejects overlapping variants and malformed visibility or availability conditions', () => {
    const data = fixture();
    const row = data.scenarios[0];
    data.scenarios.push({ ...structuredClone(row), sourceRow: 999 });
    expect(validateData(data).join('\n')).toContain('互不重复');
    row.availableWhen = 'Reputation++5';
    expect(validateData(data).join('\n')).toContain('条件无效');
  });

  it('rejects obsolete stats, nonfinite values, missing results and invalid expressions', () => {
    const data = fixture();
    const row = data.scenarios.find(r => r.pawn === 'female')!;
    row.deltas.female.Skill = 1;
    row.deltas.male.Network = Number.NaN;
    row.results.female = '';
    row.expressions.female = 'happy';
    const errors = validateData(data).join('\n');
    expect(errors).toContain('Skill');
    expect(errors).toContain('Network');
    expect(errors).toContain('♀ 的结果文字不能为空');
    expect(errors).toContain('♀ 的 NPC 表情无效');
  });

  it('requires all referenced endings, milestones, candidates and policies', () => {
    const data = fixture();
    data.endings = data.endings.filter(e => e.id !== 'E10');
    data.milestones = [];
    data.candidates = [];
    data.policies = data.policies.filter(p => p.id !== 'coordinator');
    const errors = validateData(data).join('\n');
    expect(errors).toContain('不存在的结局 E10');
    expect(errors).toContain('不存在的章节卡 CH1-E01');
    expect(errors).toContain('不存在的候选人 josh');
    expect(errors).toContain('不存在的政策 coordinator');
  });

  it('accepts optional descriptions but rejects empty or unknown descriptions', () => {
    const data = fixture();
    delete data.copy.statDescriptions;
    expect(validateData(data)).toEqual([]);
    data.copy.statDescriptions = { Creativity: '   ' };
    expect(validateData(data).join('\n')).toContain('statDescriptions.Creativity');
  });

  it('rejects broken JSON and wrongly shaped collections before rendering', () => {
    expect(() => parseTeamContent('{bad')).toThrow('格式无效');
    expect(() => parseTeamContent('{}')).toThrow('scenarios');
  });
});
