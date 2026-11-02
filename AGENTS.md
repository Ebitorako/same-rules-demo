# AGENTS.md

## Project

**Genderpoly** (working title): a single-player 2D web game about structural gender inequality in the creative industries, made for a university course (NMC5369, NUS). Team deadline 5 Nov 2026, feature freeze 3 Nov.

**Read `docs/GAME_SPEC.md` before any task.** Version 0.12 records the team's completed CH1–4 sheets, replacing the earlier provisional rules. The designer explicitly authorised this migration on 3 Nov. Follow a new explicit user instruction over an older rule; do not re-request permission for that authorised scope. Resolve remaining content ambiguities through the documented source decisions rather than inventing story or balancing numbers.

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

1. **Same start, hidden rules during play.** Both pawns start with Creativity 3, Communication 3, Network 2, Reputation 2, Availability 2 and Energy 7. These are the six current stats. Hide numerical stats and gender effects during play and YOUR CHOICES review, except with `?debug=1`. At a terminal ending show six final values and its recorded choice/system-event recap. Chapter milestones do not reveal numerical values.
2. **Deterministic.** No randomness in outcomes. `Math.random` is allowed only for the optional round-1 random gender (config).
3. **No undo.** No back button or save slots; auto-save the current run so a refresh resumes, not rewinds.
4. **Story text comes from data.** The runtime authority is `public/data/team-content.json`, generated from the read-only sheet snapshot by `scripts/import-team-content.mjs`. The public scenario/ending CSVs and copy/candidate/policy JSONs are review exports, not independent runtime inputs. Guide identity/fallbacks and asset mappings remain separate. Never hard-code story, option, result or ending text in UI code.
5. **Gender logic is data-driven** (per-pawn options, results, deltas and effects). Keep visible branch conditions separate from numeric availability gates. A card may have one, three or four options; a locked choice opens its supplied thought without spending it. No `if (female)` story branches in UI code.
6. **The designer draws all art.** Use only the art files she adds under `public/assets/` (names in the spec's asset list). Until a file exists, show a clearly labelled placeholder box. Never draw, generate or download character art yourself. Use the colour tokens in the spec; do not invent colours, emoji or new fonts. The designer's 31 Oct requests permit static metallic gradients on the six special tiles and the corresponding four Boss history-card faces; other surfaces remain flat.
7. **No `window.alert` / `confirm` / `prompt`.** Use in-page dialogs.
8. **Accessibility:** real `<button>`s, keyboard play (`1`–`4`, `D`, `Enter`), visible focus, respect `prefers-reduced-motion`. Sound is optional and must never be needed to understand or complete a scene.

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
