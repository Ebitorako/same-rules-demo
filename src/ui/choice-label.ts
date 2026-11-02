import type { ScenarioOption } from '../game/types';

export function isAutomaticChoice(option?: Pick<ScenarioOption, 'automatic' | 'optionLabel'> | null): boolean {
  return Boolean(option?.automatic || option?.optionLabel === 'Continue' || option?.optionLabel === '自动');
}
