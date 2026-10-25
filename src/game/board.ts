import type { BoardTile } from './types';

export const BOARD: BoardTile[] = [
  { id: 'b0', label: 'START', row: 6, col: 2, kind: 'start', chapter: 1 },
  ...[1, 2, 3, 4].map((n): BoardTile => ({ id: `b${n}`, label: `1.${n}`, row: 6, col: n + 2, kind: 'scenario', cardId: `C1-0${n}`, chapter: 1 })),
  { id: 'gatekeeper', label: 'THE GATEKEEPER', row: 6, col: 7, kind: 'boss', cardId: 'C1-B', chapter: 1 },
  ...[0, 1, 2, 3].map((n): BoardTile => ({ id: `r${n}`, label: `2.${n + 1}`, row: 5 - n, col: 7, kind: 'scenario', cardId: `C2-0${n + 1}`, chapter: 2 })),
  { id: 'network', label: "OLD BOYS' NETWORK", row: 1, col: 7, kind: 'boss', cardId: 'C2-B', chapter: 2 },
  ...[0, 1, 2, 3, 4].map((n): BoardTile => ({ id: `t${n}`, label: `3.${n + 1}`, row: 1, col: 6 - n, kind: 'scenario', cardId: `C3-0${n + 1}`, chapter: 3 })),
  { id: 'ideal-worker', label: 'THE IDEAL WORKER', row: 1, col: 1, kind: 'boss', cardId: 'C3-B', chapter: 3 },
  { id: 'l0', label: 'CREATIVE DIRECTOR', row: 2, col: 1, kind: 'director', chapter: 4 },
  ...[1, 2, 3].map((n): BoardTile => ({ id: `l${n}`, label: `4.${n}`, row: 2 + n, col: 1, kind: 'scenario', cardId: `C4-0${n}`, chapter: 4 })),
  { id: 'system', label: 'THE SYSTEM', row: 6, col: 1, kind: 'boss', cardId: 'C4-B', chapter: 4 },
];
