import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { GameData } from '../game/types';
import { parseEndings, parseScenarios } from './parse';
import { getDataWarnings, validateData } from './validate';

function fixture(): GameData {
  const read = (name: string): string => readFileSync(resolve('public/data', name), 'utf8');
  const policies = JSON.parse(read('policies.json'));
  return { scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')), candidates: JSON.parse(read('candidates.json')).candidates, policies: policies.policies, powerTokens: policies.powerTokens, copy: JSON.parse(read('copy.json')) };
}

describe('complete game content validation', () => {
  it('accepts the 20-card prototype while reporting placeholders as warnings', () => {
    const data = fixture();
    expect(validateData(data)).toEqual([]);
    expect(getDataWarnings(data).join('\n')).toContain('19 张卡');
    expect(new Set(data.scenarios.map((row) => row.cardId)).size).toBe(20);
  });

  it('requires every board card and all three unconditional options for each pawn', () => {
    const data = fixture();
    data.scenarios = data.scenarios.filter((row) => row.cardId !== 'C1-01');
    expect(validateData(data).join('\n')).toContain('C1-01 缺少');
    const incomplete = fixture();
    incomplete.scenarios = incomplete.scenarios.filter((row) => !(row.cardId === 'C2-03' && row.pawn === 'female'));
    expect(validateData(incomplete).join('\n')).toContain('C2-03 / ♀ / 选项 2');
  });

  it('allows a conditional override but rejects overlapping variants and future references', () => {
    const data = fixture();
    const source = data.scenarios.find((row) => row.cardId === 'C2-01' && row.option === 1)!;
    const variant = { ...structuredClone(source), condition: 'C1-01=1;policy:formal_recruitment;round>=2' };
    data.scenarios.push(variant);
    expect(validateData(data)).toEqual([]);
    data.scenarios.push({ ...structuredClone(source), condition: 'round>=3' });
    expect(validateData(data).join('\n')).toContain('可能同时生效');
    variant.condition = 'C3-01=1';
    expect(validateData(data).join('\n')).toContain('只能引用前面');
  });

  it('accepts mutually exclusive variants but rejects contradictory conditions', () => {
    const data = fixture();
    const source = data.scenarios.find((row) => row.cardId === 'C2-01' && row.option === 1)!;
    data.scenarios.push({ ...structuredClone(source), condition: 'C1-01=1' }, { ...structuredClone(source), condition: 'C1-01=2' });
    expect(validateData(data)).toEqual([]);
    data.scenarios.push({ ...structuredClone(source), condition: 'C1-01=1;C1-01=2' });
    expect(validateData(data).join('\n')).toContain('条件相互矛盾');
  });

  it('validates results and expressions only for the relevant pawn', () => {
    const data = fixture();
    const row = data.scenarios.find((entry) => entry.cardId === 'C2-03' && entry.pawn === 'female')!;
    expect(row.results.male).toBe('');
    expect(validateData(data)).toEqual([]);
    row.results.female = '';
    row.expressions.female = 'happy';
    const errors = validateData(data).join('\n');
    expect(errors).toContain('♀ 的结果文字不能为空');
    expect(errors).toContain('♀ 的 NPC 表情无效');
  });

  it('requires referenced endings, candidates and policies', () => {
    const data = fixture();
    data.endings = data.endings.filter((ending) => ending.id !== 'E06');
    data.candidates = data.candidates.filter((candidate) => candidate.id !== 'cand_b');
    data.policies = data.policies.filter((policy) => policy.id !== 'formal_recruitment');
    const errors = validateData(data).join('\n');
    expect(errors).toContain('结局 E06');
    expect(errors).toContain('cand_b');
    expect(errors).toContain('formal_recruitment');
  });
});
