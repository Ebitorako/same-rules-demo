# AGENTS.md

## Project

**Genderpoly** (working title): a single-player 2D web game about structural gender inequality in the creative industries, made for a university course (NMC5369, NUS). Team deadline 5 Nov 2026, feature freeze 3 Nov.

**Read `docs/GAME_SPEC.md` before any task.** It is the source of truth for rules, data format, art direction and milestones. If a request conflicts with the spec, point it out and ask before changing a rule.

## Who you are working with

The person directing you is the team's designer and artist, not a programmer.

- Explain what you changed in plain language, briefly. No jargon without a one-line explanation.
- Work in small steps. After every task the game must still build and run.
- End every task with **how to try it**: the command to run and exactly what to click or look at.
- If something in the spec is unclear or marked as an open decision, use the default in the spec and say so; do not stop.
- Ask before adding a dependency, changing a game rule, or rewriting a large part of the code.

## Stack and commands

Vite + TypeScript, no UI framework, no game engine, no backend. `papaparse` for CSV, `vitest` for tests. Deployed to GitHub Pages via GitHub Actions.

```bash
npm install
npm run dev            # local preview
npm test               # unit tests (game logic)
npm run validate-data  # checks public/data/*.csv; readable errors for non-programmers
npm run build          # production build
```

Keep these script names working; create them during M0 if they do not exist yet.

## Non-negotiable rules

1. **Same start, hidden rules.** Both pawns start with identical stats. Stats and gender effects are never shown, except with `?debug=1`.
2. **Deterministic.** No randomness in outcomes. `Math.random` is allowed only for the optional round-1 random gender (config).
3. **No undo.** No back button or save slots; auto-save the current run so a refresh resumes, not rewinds.
4. **Story text comes from data** (`public/data/*.csv`, `*.json`). Never hard-code story, option, result or ending text in code.
5. **Gender logic is data-driven** (per-pawn options, results, deltas, boss thresholds). No `if (female)` story branches in UI code.
6. **The designer draws all art.** Use only the art files she adds under `public/assets/` (names in the spec's asset list). Until a file exists, show a clearly labelled placeholder box. Never draw, generate or download character art yourself. Use the colour tokens in the spec; do not invent colours, emoji or new fonts. The designer's 31 Oct request permits static metallic gradients on the six special tiles; other surfaces remain flat.
7. **No `window.alert` / `confirm` / `prompt`.** Use in-page dialogs.
8. **Accessibility:** real `<button>`s, keyboard play (`1` `2` `3`, `Enter`), visible focus, respect `prefers-reduced-motion`.

## Code conventions

- Game logic in `src/game/` as pure functions (`state + action → state`), unit-tested. Rendering in `src/ui/`. Tunable numbers and open decisions only in `src/config/rules.ts`.
- TypeScript `strict`. Small files. Clear names over comments; comment only the why.
- Do not delete or edit files in `public/assets/` or `public/data/` unless asked.

## AI usage log (required by the course)

The course requires an appendix explaining how AI was used. After each task, append one short entry to `docs/AI_LOG.md`:

```
## YYYY-MM-DD — <task in a few words>
- Asked: <what the human asked for>
- Done: <what you changed, 1–3 bullets>
- Human decisions: <choices the human made or needs to make>
```

## Definition of done (every task)

- `npm run build` and `npm test` pass; `npm run validate-data` passes or its errors are explained.
- No console errors when playing through the changed part.
- AI_LOG entry added.
- Final message: what changed, how to try it, anything the team must decide.
