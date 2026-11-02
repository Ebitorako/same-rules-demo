import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { initialStats } from '../config/rules';
import { parseEndings, parseScenarios } from '../data/parse';
import { advance, chooseOption, createInitialState, startCareer } from '../game/state';
import type { AppState, Career, EndingRecap, GameData, Stats } from '../game/types';
import { boardScreen } from './board';
import { scenarioDialog } from './card';
import { endingScreen, galleryScreen } from './gallery';
import { choiceHistoryDialog } from './history';
import { finalValues, numericalReview } from './recap';

vi.mock('virtual:art-index', () => ({ default: [] }));

const read = (file: string) => readFileSync(`public/data/${file}`, 'utf8');
const policies = JSON.parse(read('policies.json'));
const data: GameData = {
  ...JSON.parse(read('team-content.json')),
  scenarios: JSON.parse(read('team-content.json')).scenarios, endings: JSON.parse(read('team-content.json')).endings,
  candidates: JSON.parse(read('candidates.json')).candidates,
  policies: policies.policies, powerTokens: policies.powerTokens, copy: JSON.parse(read('copy.json')),
};
const values = (overrides: Partial<Stats> = {}): Stats => ({ ...initialStats(), ...overrides });
const zeros = (): Stats => Object.fromEntries(Object.keys(initialStats()).map(key => [key, 0])) as Stats;
function report(round = 1): EndingRecap {
  return { version: 1, round, character: { name: `Player ${round}`, pawn: 'female' },
    initialStats: values({ Creativity: 9, Energy: 5 }), finalStats: values({ Creativity: 10, Energy: 3 }), bounds: { minimum: 0, maximum: 10 },
    status: 'recorded', issues: [], steps: [{ cardId: 'C1-01', order: 1, choice: 2, title: 'A demanding brief',
      optionText: 'Take on the project.', source: 'recorded', before: values({ Creativity: 9, Energy: 5 }), after: values({ Creativity: 10, Energy: 3 }),
      requestedDelta: { ...zeros(), Creativity: 3, Energy: -2 }, actualDelta: { ...zeros(), Creativity: 1, Energy: -2 },
      bounds: { minimum: 0, maximum: 10 } }],
  };
}
function career(recap: EndingRecap): Career {
  return { round: recap.round, character: recap.character, endingId: 'E02', reachedDirector: false,
    policiesSet: [], hiredIntern: null, recap };
}
function finished(): AppState {
  const state = startCareer(createInitialState(), 'female', data);
  const recap = report();
  state.run = { ...state.run!, phase: 'ending', endingId: 'E02', stats: recap.finalStats!, character: recap.character };
  state.lineage = [career(recap)];
  state.gallery = [{ endingId: 'E02', pawn: 'female', name: recap.character.name, round: 1 }];
  return state;
}

describe('ending-only numerical disclosure', () => {
  it('puts six saved final values below the ending story and review after references', () => {
    const state = finished();
    const front = endingScreen(state, data, false), back = endingScreen(state, data, true);
    expect(front.match(/<dt>/g)).toHaveLength(6);
    expect(front).toContain('<dt>Energy</dt><dd>3</dd>');
    expect(front.indexOf('Final values')).toBeGreaterThan(front.indexOf(data.endings[0].front));
    expect(back.indexOf('<h3>Numerical review</h3>')).toBeGreaterThan(back.indexOf('<h3>References</h3>'));
    expect(front).not.toContain('A demanding brief');
    expect(back).toContain('A demanding brief');
  });

  it('keeps scores out of active play and ordinary choice history', () => {
    let state = advance(startCareer(createInitialState(), 'female', data), data);
    state = advance(state, data);
    const scenario = scenarioDialog(state, data);
    expect(endingScreen(state, data, false)).toBe('');
    state = advance(chooseOption(state, 1, data), data);
    for (const html of [scenario, boardScreen(state, data), choiceHistoryDialog(state, data, 'C1-01')]) {
      expect(html).not.toContain('Final values');
      expect(html).not.toContain('Numerical review');
      expect(html).not.toContain('recap-changes');
    }
  });

  it('explains the actual capped increase and ordinary deduction separately', () => {
    const html = numericalReview(report(), data.copy);
    expect(html).toContain('9 → 10');
    expect(html).toContain('(+1)');
    expect(html).toContain('Choice effect: +3. Upper limit reached; actual change: +1.');
    expect(html).toContain('5 → 3');
    expect(html).toContain('(-2)');
    expect(html).toContain('What these values mean');
  });

  it('does not invent zeroes or a starting value for incomplete older careers', () => {
    const old = { ...report(), initialStats: null, finalStats: null, status: 'unavailable' as const, steps: [] };
    expect(finalValues(old)).toContain('Final values were not saved');
    expect(finalValues(old)).not.toContain('<dd>');
    const partial = { ...old, finalStats: values(), status: 'partial' as const };
    expect(numericalReview(partial, data.copy)).toContain('<td>—</td><td>3</td><td>—</td>');
    expect(numericalReview(partial, data.copy)).toContain('missing changes are not estimated');
  });

  it('keeps different careers separate in the gallery and never substitutes a live run', () => {
    const state = finished(), second = report(2);
    second.finalStats!.Network = 2;
    second.steps[0].after!.Network = 2;
    second.steps[0].requestedDelta!.Network = -3;
    second.steps[0].actualDelta!.Network = -3;
    state.lineage.push(career(second));
    state.run = { ...state.run!, round: 3, phase: 'board', endingId: null, stats: values({ Network: 9 }) };
    const html = galleryScreen(state, data, new Set());
    expect(html).toContain('Career 1 · Player 1');
    expect(html).toContain('Career 2 · Player 2');
    expect(html).toContain('<dt>Network</dt><dd>2</dd>');
    expect(html).not.toContain('<dt>Network</dt><dd>9</dd>');
    expect(html).not.toContain('Career 3');
    expect(galleryScreen(createInitialState(), data, new Set(['E02']))).not.toContain('Final values');
  });

  it('escapes saved story text and editable ability explanations', () => {
    const recap = report();
    recap.steps[0].title = '<script>bad()</script>';
    recap.steps[0].optionText = '<img src=x onerror=bad()>\nSecond line';
    const copy = { ...data.copy, statDescriptions: { Creativity: '<b>Craft</b>' } };
    const html = numericalReview(recap, copy);
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img src=x onerror=bad()&gt;<br>Second line');
    expect(html).toContain('&lt;b&gt;Craft&lt;/b&gt;');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
  });
});
