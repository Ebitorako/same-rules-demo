import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { GameData } from '../game/types';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const current = read('public/data/team-content.json') as GameData;
const english = read('docs/source/2026-11-03-team-sheet.json') as { sheets: Record<string, { values: (string | null)[][] }> };
const source = read('docs/source/2026-11-03-chinese-sheet.json') as typeof english;
const catalog = read('public/data/zh-CN.json') as { locale: string; translations: Record<string, string> };
const report = read('docs/source/2026-11-03-chinese-import-report.json');
const translate = (text = '') => catalog.translations[text] ?? text;
const text = (cell: string | null | undefined) => cell ?? '';

describe('the team’s Chinese story', () => {
  it('uses every authored source choice with the same branch identity and numerical cells', () => {
    let choices = 0;
    for (const sheet of ['ch1', 'ch2', 'ch3', 'ch4']) {
      english.sheets[sheet].values.forEach((en, i) => {
        if (!/^C[1-4]-(?:0[1-5][FMABCDab]?|B)$/.test(text(en[0]))) return;
        choices++;
        const zh = source.sheets[sheet + '中文版'].values[i];
        for (const column of [0, 1, 2, 3, 8, 9, 10, 14, 15, 16, 17]) expect(text(zh[column]), `${sheet}:${i + 1}:${column}`).toBe(text(en[column]));
        const row = current.scenarios.find(r => r.sourceSheet === sheet && r.sourceRow === i + 1 && r.condition !== 'flag:previous_family_man=true')!;
        expect(row).toBeDefined();
        expect([translate(row.title), translate(row.scene), translate(row.npc), translate(row.optionText), translate(row.guideAdvice)])
          .toEqual([zh[4], zh[5], zh[7], zh[11], zh[20]]);
        expect(translate(row.results.female)).toBe(text(zh[12]));
        expect(translate(row.results.male)).toBe(text(zh[13]));
        const background = sheet === 'ch2' && i === 13 ? source.sheets.ch2中文版.values[10][6] : zh[6];
        expect(translate(row.background)).toBe(background);
      });
    }
    expect(choices).toBe(111);
    expect(catalog.locale).toBe('zh-CN');
    expect(report.options).toBe(111);
    expect(report.missing).toEqual([]);
    for (const key of ['female', 'male', 'C1-01', 'transparent', 'stat:Availability>=3']) expect(catalog.translations[key]).toBeUndefined();
  });

  it('covers all four openings, both milestones, thirteen endings and the epilogue from their own rows', () => {
    for (const opening of current.chapters!) {
      const row = source.sheets[opening.sourceSheet! + '中文版'].values[opening.sourceRow! - 1];
      expect([translate(opening.title), translate(opening.scene), translate(opening.background), translate(opening.guideAdvice)])
        .toEqual([row[4], row[5], row[6], row[20]]);
    }
    const cards = [...current.endings, ...current.milestones!, current.epilogue!];
    expect(cards).toHaveLength(16);
    for (const card of cards) {
      const row = source.sheets[card.sourceSheet! + '中文版'].values[card.sourceRow! - 1];
      expect([translate(card.name), translate(card.front), translate(card.back)]).toEqual([row[1], row[4], row[5]]);
      expect(translate(card.guideAdvice)).toBe(row[card.sourceSheet === 'ch1' ? 9 : 10]);
      expect(translate(card.reference)).toBe(card.sourceSheet === 'ch1' ? '' : row[6]);
    }
  });

  it('retains the actual automatic outcomes, gender-specific ending and inherited dialogue', () => {
    const gatekeeper = current.scenarios.find(r => r.cardId === 'C1-B')!;
    const outcomes = gatekeeper.effects!.map(e => translate(e.resultText?.female));
    expect(outcomes).toHaveLength(3);
    expect(outcomes[0]).toContain('初级制片人职位的录用通知');
    expect(outcomes[1]).toContain('制作协调（Production Coordinator）');
    expect(outcomes[2]).toContain('你未能获得该职位');
    outcomes.forEach(result => expect(source.sheets.ch1中文版.values[19][12]).toContain(result));
    const maleFront = translate(current.endings.find(e => e.id === 'E04')!.frontByPawn!.male);
    expect(source.sheets.ch3中文版.values[44][9]).toContain(maleFront);
    expect(maleFront).toContain('所有人都对此表示惊讶');
    for (const row of current.scenarios.filter(r => r.condition === 'flag:previous_family_man=true')) {
      expect(translate(row.scene)).toBe(`${source.sheets.ch3中文版.values[row.sourceRow! - 1][5]}\n\n“我们以为你会想放慢节奏。”`);
    }
    for (const row of current.scenarios) for (const thought of Object.values(row.unavailableText ?? {})) {
      expect(source.sheets[row.sourceSheet! + '中文版'].values[row.sourceRow! - 1][19]).toContain(translate(thought));
    }
    expect(current.scenarios.find(r => r.cardId === 'C3-B' && r.option === 1 && r.pawn === 'male')!.unavailableText).toBeUndefined();
  });

  it('documents the single incomplete background cell without altering its source snapshot', () => {
    expect(source.sheets.ch2中文版.values[13][6]).toBe('去');
    expect(report.corrections).toHaveLength(1);
    expect(report.corrections[0].cell).toBe('ch2中文版!G14');
    expect(report.corrections[0].displayedValue).toBe(source.sheets.ch2中文版.values[10][6]);
    expect(report.corrections[0].copiedFrom).toEqual(['ch2中文版!G11', 'ch2中文版!G12', 'ch2中文版!G13', 'ch2中文版!G15', 'ch2中文版!G16']);
    expect(translate(current.copy.lowEnergyAdvice)).toContain('小提示：精力耗尽，你就会离开这个行业。');
  });
});
