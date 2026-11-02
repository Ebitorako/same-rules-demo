import { afterEach, describe, expect, it, vi } from 'vitest';
import { BOARD } from '../game/board';
import { getChoiceHistory } from '../game/history';
import { isValidState, loadState, saveState } from '../game/persistence';
import { chooseOption, updateSettings } from '../game/state';
import { atCard, fresh, loadTeamData, play } from '../game/test-helpers';
import type { AppState } from '../game/types';
import { localizeData, localizeGuide, localizeState, localizeText, parseTranslationCatalog, type TranslationCatalog } from './localize';

const catalog = (translations: Record<string, string>): TranslationCatalog => ({ locale: 'zh-CN', translations });
function useMemoryStorage(): void {
  const items = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => { items.set(key, value); },
    removeItem: (key: string) => { items.delete(key); },
  });
}
afterEach(() => vi.unstubAllGlobals());

describe('language display projection', () => {
  it('requires a valid Chinese catalogue and leaves unmatched saved wording intact', () => {
    const text = JSON.stringify(catalog({ 'The original sentence.': '原文对应的中文。' }));
    const translations = parseTranslationCatalog(text);
    expect(localizeText('The original sentence.', translations, 'zh-CN')).toBe('原文对应的中文。');
    expect(localizeText('The original sentence. Older continuation.', translations, 'zh-CN')).toBe('The original sentence. Older continuation.');
    expect(localizeText('The original sentence.', translations, 'en')).toBe('The original sentence.');
    expect(localizeText('constructor', translations, 'zh-CN')).toBe('constructor');
    expect(() => parseTranslationCatalog('{')).toThrow();
    expect(() => parseTranslationCatalog('{"locale":"en","translations":{}}')).toThrow();
    expect(() => parseTranslationCatalog('{"locale":"zh-CN","translations":{"x":3}}')).toThrow();
  });

  it('switches an active result and frozen history without changing or resaving the decision', () => {
    useMemoryStorage();
    const data = loadTeamData();
    const chosen = chooseOption(atCard('C1-01', 'female', {}, data), 1, data);
    const row = chosen.run!.chosenScenarios!['C1-01'];
    const translations = catalog({ [row.scene]: '原场景的中文', [row.optionText]: '原选择的中文',
      [row.results.female]: '该选择的中文结果', [row.npc]: '人物中文显示名' });
    const state = updateSettings(chosen, { locale: 'zh-CN' });
    const before = JSON.stringify(state);
    const shown = localizeState(state, translations, 'zh-CN');
    const shownData = localizeData(data, translations, 'zh-CN');
    expect(shown.run!.result!.text).toBe('该选择的中文结果');
    expect(getChoiceHistory(shown.run!, shownData)[0].scenario!.scene).toBe('原场景的中文');
    expect(shown.run!.statHistory!.steps[0].optionText).toBe('原选择的中文');
    expect(shown.run!.chosenScenarios!['C1-01'].npc).toBe(row.npc);
    expect(shown.run!.result!.npc).toBe(chosen.run!.result!.npc);
    expect(shown.run!.stats).toEqual(state.run!.stats);
    expect(shown.run!.choices).toEqual(state.run!.choices);
    expect(shown.run!.flags).toEqual(state.run!.flags);
    expect(shown.run!.phase).toBe('result');
    expect(JSON.stringify(state)).toBe(before);
    expect(localizeState(state, translations, 'en')).toBe(state);
    expect(localizeData(data, translations, 'en')).toBe(data);
    expect(saveState(state)).toBe(true);
    const restored = loadState();
    expect(restored).toEqual(state);
    expect(restored.run!.result!.text).toBe(chosen.run!.result!.text);
    expect(restored.settings.locale).toBe('zh-CN');
    expect(localizeState(restored, translations, 'zh-CN').run!.result!.text).toBe('该选择的中文结果');
  });

  it.each(['female', 'male'] as const)('retains the approved E03 route and exact final numbers after %s changes language', pawn => {
    const data = loadTeamData();
    const changes: Record<string, number> = pawn === 'female' ? { 'C1-02': 1, 'C1-04': 3 } : { 'C1-02': 2, 'C1-03': 1, 'C1-04': 3 };
    const initial = updateSettings(fresh(pawn, data), { locale: 'zh-CN' });
    const finished = play(initial, data, changes);
    const result = finished.run!.result!.text;
    const shown = localizeState(finished, catalog({ [result]: '未获录用的中文结果' }), 'zh-CN');
    expect(finished.run!.endingId).toBe('E03');
    expect(shown.run!.stats).toMatchObject({ Creativity: 4, Communication: 4 });
    expect(shown.run!.result!.text).toBe('未获录用的中文结果');
    expect(shown.lineage[0].recap!.finalStats).toEqual(finished.run!.stats);
    expect(shown.run!.statHistory!.steps.map(step => step.actualDelta)).toEqual(finished.run!.statHistory!.steps.map(step => step.actualDelta));
    expect(isValidState(shown)).toBe(true);
  });

  it('preserves all full-career rules and translates recap system events without touching legacy records', () => {
    const data = loadTeamData();
    const finished = play(fresh('female', data), data);
    const system = finished.run!.statHistory!.steps.find(step => step.kind === 'system')!;
    const choice = finished.run!.statHistory!.steps[0];
    const translations = catalog({ [system.optionText]: '章节进入时的系统解释', [choice.title]: '历史场景标题',
      [choice.optionText]: '历史选择', [choice.resultText!]: '历史结果',
      [data.scenarios[0].condition]: '不可用于替换内部条件', Creativity: '创造力', Continue: '继续', Ch1: '第一章' });
    const withLegacy: AppState = { ...finished, legacyArchive: { sourceVersion: 'prototype-v0.11', run: null,
      lineage: structuredClone(finished.lineage), gallery: structuredClone(finished.gallery) } };
    const shown = localizeState(withLegacy, translations, 'zh-CN');
    expect(shown.run!.endingId).toBe('E14');
    expect(shown.run!.stats).toEqual(finished.run!.stats);
    expect(shown.lineage[0].recap!.steps.find(step => step.kind === 'system')!.optionText).toBe('章节进入时的系统解释');
    expect(shown.lineage[0].recap!.steps[0]).toMatchObject({ title: '历史场景标题', optionText: '历史选择', resultText: '历史结果' });
    expect(shown.legacyArchive).toEqual(withLegacy.legacyArchive);
    const localized = localizeData(data, translations, 'zh-CN');
    for (let index = 0; index < data.scenarios.length; index++) {
      const oldRow = data.scenarios[index], newRow = localized.scenarios[index];
      for (const field of ['cardId', 'sourceCardId', 'sourceRow', 'sourceSheet', 'condition', 'availableWhen', 'deltas', 'npc', 'expressions', 'optionLabel', 'chapter'] as const) expect(newRow[field]).toEqual(oldRow[field]);
      expect(newRow.effects?.map(({ resultText: _result, ...rules }) => rules)).toEqual(oldRow.effects?.map(({ resultText: _result, ...rules }) => rules));
    }
    expect(localized.initialStats).toEqual(data.initialStats);
    expect(localized.statNames).toEqual(data.statNames);
    expect(Object.keys(shown.run!.choices)).toHaveLength(BOARD.filter(tile => tile.cardId).length);
  });

  it('keeps old saves without a locale valid and rejects invalid locale values', () => {
    useMemoryStorage();
    const existing = atCard('C2-03');
    expect(existing.settings.locale).toBeUndefined();
    expect(saveState(existing)).toBe(true);
    expect(loadState()).toEqual(existing);
    const changed = updateSettings(existing, { locale: 'zh-CN' });
    expect(saveState(changed)).toBe(true);
    expect(loadState()).toEqual(changed);
    const invalid = { ...changed, settings: { ...changed.settings, locale: 'xx' } };
    expect(isValidState(invalid)).toBe(false);
    expect(isValidState({ ...changed, settings: { ...changed.settings, locale: ['en'] } })).toBe(false);
  });

  it('localizes guide prose while retaining the portrait resource key', () => {
    const guide = { name: 'The Guide', role: 'Your companion', portrait: 'npc/guide_neutral',
      notes: [{ cardId: 'GENERAL', advice: 'Read the scene.', background: '', theory: '', reference: '', notes: '' }] };
    const translated = localizeGuide(guide, catalog({ 'The Guide': '引导员', 'Read the scene.': '阅读场景。', 'npc/guide_neutral': '无效替换' }), 'zh-CN');
    expect(translated.name).toBe('引导员');
    expect(translated.notes[0].advice).toBe('阅读场景。');
    expect(translated.portrait).toBe('npc/guide_neutral');
    expect(guide.notes[0].advice).toBe('Read the scene.');
  });
});
