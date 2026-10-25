export const STAT_NAMES = ['Creativity', 'Communication', 'Skill', 'Energy', 'Network', 'Reputation', 'Availability', 'Money'] as const;
export type StatName = typeof STAT_NAMES[number];
export type Stats = Record<StatName, number>;
export type Pawn = 'female' | 'male';
export interface Character { name: string; pawn: Pawn }
export interface ScenarioOption {
  cardId: string; chapter: string; tile: string; type: 'scenario' | 'boss';
  title: string; scene: string; background: string; npc: string; condition: string;
  option: number; pawn: 'both' | Pawn; optionText: string;
  results: Record<Pawn, string>; expressions: Record<Pawn, string>;
  deltas: Record<Pawn, Partial<Stats>>; reference: string; notes: string;
}
export interface Ending {
  id: string; name: string; pawn: 'both' | Pawn; front: string; back: string;
  reference: string; triggerNote: string; nextRoundNote: string; artNote: string; notes: string;
}
export interface Candidate extends Character { id: string; blurb: string; stats: Partial<Stats> }
export interface Policy { id: string; name: string; benefit: string; cost: string; nextRoundEffect: string; mvp: boolean }
export interface CopyData {
  title: string; subtitle: string; introduction: string; promotionTitle: string; promotionText: string;
  defaultNames: Record<Pawn, string>; defaultDirector: string; gatekeeperReturning: string;
  gatekeeperFormal: string; gatekeeperUnchanged: string; placeholderNotice: string;
}
export interface GameData {
  scenarios: ScenarioOption[]; endings: Ending[]; candidates: Candidate[];
  policies: Policy[]; powerTokens: number; copy: CopyData;
}
export interface Result { cardId: string; option: number; text: string; expression: string; npc: string; passed: boolean | null }
export interface Run {
  round: number; character: Character; stats: Stats; position: number; visited: number[];
  phase: 'intro' | 'board' | 'card' | 'result' | 'promotion' | 'ending';
  choices: Record<string, number>; activePolicies: string[]; policiesSet: string[];
  hiredIntern: string | null; reachedDirector: boolean; gatekeeper: Character | null;
  result: Result | null; endingId: string | null; exitReason: string | null;
}
export interface Career {
  round: number; character: Character; endingId: string; reachedDirector: boolean;
  policiesSet: string[]; hiredIntern: string | null;
}
export interface Unlock { endingId: string; pawn: Pawn; round: number; name: string }
export interface Settings { reducedMotion: boolean; sound: boolean }
export interface AppState { version: 1; run: Run | null; lineage: Career[]; gallery: Unlock[]; settings: Settings }
export interface BoardTile { id: string; label: string; row: number; col: number; kind: 'start' | 'scenario' | 'boss' | 'director'; cardId?: string; chapter: number }
