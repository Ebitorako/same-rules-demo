import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { parseEndings, parseScenarios } from '../data/parse';
import { advance, chooseOption, createInitialState, startCareer } from '../game/state';
import { BOARD } from '../game/board';
import { RULES } from '../config/rules';
import type { AppState, GameData } from '../game/types';
import { art, loadAssets, npcArt } from './assets';
import { boardScreen } from './board';
import { scenarioDialog } from './card';
import { galleryScreen } from './gallery';

vi.mock('virtual:art-index', () => ({ default: ['assets/npc/old_boys_network_neutral.png', 'assets/ui/gallery_frame.png', 'assets/characters/final/female.png'] }));
const read = (name: string) => readFileSync(`public/data/${name}`, 'utf8');
const policyData = JSON.parse(read('policies.json'));
const data: GameData = {
  scenarios: parseScenarios(read('scenarios.csv')), endings: parseEndings(read('endings.csv')),
  candidates: JSON.parse(read('candidates.json')).candidates,
  policies: policyData.policies, powerTokens: policyData.powerTokens, copy: JSON.parse(read('copy.json')),
};
beforeAll(async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({
    'characters/pawn_female': ['assets/characters/missing.svg','assets/characters/final/female.png'],
    'npc/old_boys_network_neutral': ['assets/npc/old_boys_network_neutral.png'],
    'ui/gallery_frame': ['assets/ui/gallery_frame.png'],
  }) })));
  await loadAssets();
});
afterAll(() => vi.unstubAllGlobals());
function reachCard(id: string): AppState {
  let state = startCareer(createInitialState(),'female',data);
  for (let step=0; step<100; step++) {
    if (state.run!.phase === 'card' && BOARD[state.run!.position].cardId === id) return state;
    state = state.run!.phase === 'card' ? chooseOption(state,1,data) : advance(state,data);
  }
  throw new Error(`Could not reach ${id}`);
}
describe('rendered content connections', () => {
  it('honours relocated assets and preserves underscore NPC ids', () => {
    expect(art('characters/pawn_female','pawn')).toContain('assets/characters/final/female.png');
    expect(npcArt('old_boys_network','neutral')).toContain('src="/assets/npc/old_boys_network_neutral.png"');
    expect(npcArt('Senior Producer','cold')).toContain('ART<br>PLACEHOLDER');
  });
  it('shows exactly three data-backed options without player statistics', () => {
    const state = reachCard('C1-01');
    const html = scenarioDialog(state,data);
    expect(html.match(/data-action="choose"/g)).toHaveLength(3);
    expect(html).toContain('Why does this happen?');
    expect(html).not.toContain('debug-panel');
    expect(html).not.toContain('<dt>Skill</dt>');
    expect(html).not.toContain('<span>C1-01</span>');
    expect(boardScreen(state,data).match(/data-tile=/g)).toHaveLength(22);
  });
  it('keeps candidate labels aligned with hired ids when writers reorder JSON', () => {
    const reordered = {...data,candidates:[...data.candidates].reverse()};
    const state = reachCard(RULES.hiring.cardId);
    const html = scenarioDialog(state,reordered);
    const first = reordered.candidates.find(candidate=>candidate.id===RULES.hiring.candidates[1])!;
    const firstButton = html.split('data-option="1"')[1].split('</button>')[0];
    expect(firstButton).toContain(first.name);
    expect(chooseOption(state,1,reordered).run!.hiredIntern).toBe(first.id);
  });
  it('renders policy cost and benefit from the editable JSON', () => {
    const html = scenarioDialog(reachCard(RULES.policy.cardId),data);
    const policy = data.policies.find(policy=>policy.id===RULES.policy.formalRecruitment)!;
    expect(html).toContain('POWER TOKEN');
    expect(html).toContain(policy.cost);
    expect(html).toContain('Hiring follows written criteria');
  });
  it('keeps locked endings private and connects gallery frame art', () => {
    const html = galleryScreen(createInitialState(),data,new Set());
    expect(html.match(/aria-label="Locked ending"/g)).toHaveLength(6);
    expect(html).not.toContain(data.endings[0].front);
    expect(html).toContain('assets/ui/gallery_frame.png');
  });
  it('escapes writer content rather than interpreting HTML', () => {
    const state = reachCard('C1-01');
    const altered = {...data,scenarios:data.scenarios.map(row=>({...row,title:'<script>bad()</script>'}))};
    const html = scenarioDialog(state,altered);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
  });
});
