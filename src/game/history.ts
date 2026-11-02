import { BOARD } from './board';
import { getOptions } from './state';
import type { GameData, Run, ScenarioOption } from './types';

export interface ChoiceHistoryEntry {
  cardId: string;
  order: number;
  choice: number;
  scenario: ScenarioOption | null;
}

export function getChoiceHistory(run: Run, data: GameData): ChoiceHistoryEntry[] {
  const history: ChoiceHistoryEntry[] = [];
  const earlierChoices: Record<string, number> = {};

  BOARD.forEach((tile, position) => {
    const cardId = tile.cardId;
    if (!cardId || !Object.hasOwn(run.choices, cardId)) return;
    const choice = run.choices[cardId];
    let scenario: ScenarioOption | null = run.chosenScenarios?.[cardId] ?? null;
    try {
      // A later decision must never rewrite the variant seen on an earlier card.
      const historicalRun: Run = { ...run, position, choices: { ...earlierChoices } };
      scenario ??= getOptions(historicalRun, data).find((option) => option.option === choice) ?? null;
    } catch {
      // Writers may have changed the content since this career was saved.
      // Keep the recorded choice without guessing which text used to be shown.
    }
    history.push({ cardId, order: history.length + 1, choice, scenario });
    earlierChoices[cardId] = choice;
  });

  return history;
}
