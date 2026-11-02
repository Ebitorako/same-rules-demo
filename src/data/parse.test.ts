import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDelta, parseEndings, parseScenarios } from './parse';

const read = (name: string): string => readFileSync(resolve('docs/source/prototype-v0.11', name), 'utf8');

describe('writer-facing CSV parser', () => {
  it('keeps the supplied scenario wording, quotes and pawn-specific option intact', () => {
    const sample = parseScenarios(readFileSync(resolve('docs/starter-data/scenarios.csv'), 'utf8'));
    const current = parseScenarios(read('scenarios.csv')).filter((row) => row.cardId === 'C2-03');
    expect(current).toEqual(sample);
    expect(current[0].results.female).toContain('"You look very sharp tonight."');
    expect(current.find((row) => row.pawn === 'male' && row.option === 2)?.deltas.male).toEqual({ Network: 2, Energy: -1, Money: -1 });
  });

  it('preserves the original ending texts and accepts their explanatory pawn label', () => {
    const sample = parseEndings(readFileSync(resolve('docs/starter-data/endings.csv'), 'utf8'));
    expect(parseEndings(read('endings.csv')).slice(0, 2)).toEqual(sample);
    expect(sample[0].pawn).toBe('both');
  });

  it('reads a UTF-8 BOM and ignores only empty option-text rows', () => {
    expect(parseScenarios('\uFEFF' + read('scenarios.csv'))).toHaveLength(61);
    const csv = read('scenarios.csv').split('\n')[0] + '\nC1-01,Ch1,1,情境,,,,,,1,都可,,,,,,,,,\n';
    expect(parseScenarios(csv)).toEqual([]);
  });

  it('refuses unknown stats, malformed changes and repeated stats', () => {
    expect(() => parseDelta('Talent+1')).toThrow('未知数值');
    expect(() => parseDelta('Energy drops')).toThrow('格式无效');
    expect(() => parseDelta('Energy-1,')).toThrow('格式无效');
    expect(() => parseDelta('Energy-1, Energy+2')).toThrow('重复');
    expect(parseDelta('Network + 1，Energy - 2')).toEqual({ Network: 1, Energy: -2 });
  });

  it('refuses missing headers and invalid pawn values', () => {
    expect(() => parseScenarios('Card ID,Option\nC1-01,1')).toThrow('缺少表头');
    expect(() => parseScenarios(read('scenarios.csv').replace(',都可,', ',未知,'))).toThrow('适用棋子');
  });
});
