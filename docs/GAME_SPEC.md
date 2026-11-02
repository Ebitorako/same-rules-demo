# Genderpoly — Game Spec

*Version 0.12, 3 Nov 2026. Formal team content integrated and verified locally; publication pending.*

## 1. Authority and scope

The designer explicitly requested replacing the provisional game content and rules with the completed `ch1`, `ch2`, `ch3`, `ch4` tabs and `ch3相关规则说明` in the [team spreadsheet](https://docs.google.com/spreadsheets/d/1I28ChU7iAl6aHeJ9U5UPgOz2YptRXfwZ8VwOgwCg8Ow/edit). This v0.12 decision supersedes the earlier prototype’s numerical defaults, fixed three-choice rule, generic Boss checks and forced next-career intern inheritance.

The exact read-only source is `docs/source/2026-11-03-team-sheet.json`. `scripts/import-team-content.mjs` produces `public/data/team-content.json`, which is the runtime authority. The scenario/ending CSVs and copy/candidate/policy JSONs are readable exports. Import does not fetch Google Sheets automatically. Preserve authored story, results, deltas, advice and citations; changes to mapping or rules require tests. Missing citations and policy dialogue are not permission to invent them.

The project remains a single-player, deterministic, two-dimensional browser game about structural inequality in the creative industries. The game name is **Genderpoly** and the board company is **FreeDOM**. Preserve the team’s body-text casing. UI is English; handoff documentation is Chinese. Keep the established repository, public URL and storage key.

## 2. Fixed presentation and board

- A 7-column × 6-row rectangular ring with 22 tiles: START, 16 scenario slots, four Bosses and Creative Director.
- Route: START → four Ch1 scenes → Gatekeeper → four Ch2 scenes → Old Boys’ Network → five Ch3 scenes → Ideal Worker → Creative Director → three Ch4 scenes → System → START.
- Card ids in the runtime use fixed board slots. Retain source ids separately: C1-03F/M → C1-03; C2-04A/B/C/D → C2-04; C3-03a/b, C3-04a/b and C3-05a/b share their numbered slots.
- Ordinary unvisited tiles are dark `#2A2825`; visited tiles are cream `#F4EFE3`. The four Bosses retain red, green, blue and purple metal respectively; Creative Director is silver and START/finish is gold. Special tiles retain metal after visiting.
- YOUR CHOICES fits all recorded choices by increasing overlap, with no horizontal scrollbar. Ordinary mini cards show one centred number, Bosses show metal without visible wording. Hover/focus raises and enlarges; click opens a read-only review. Reading never replays or changes progress.
- Retain cream/ink paper cards, Limelight titles, Josefin Sans body text, grain overlay, existing colour tokens and reduced-motion support. Designer-supplied art only; use labelled placeholders until files are provided.

## 3. Six abilities and disclosure

| Ability | Both pawns start at |
|---|---:|
| Creativity | 3 |
| Communication | 3 |
| Network | 2 |
| Reputation | 2 |
| Availability | 2 |
| Energy | 7 |

Skill and Money belong only to archived prototype reports. Current effects use the six abilities above. Retain bounds 0–10 because the final sheets specify starting values and burnout but do not supply a replacement maximum. Do not rebalance the authored numbers on the team’s behalf.

During play, results and ordinary choice review, hide numerical changes and values except in `?debug=1`. Terminal ending fronts reveal six final values; backs append numerical review after Theory and References. Record the requested and applied changes, limits, and the automatic Chapter 3 entry event. Chapter milestones do not reveal stats.

Energy ≤ 1 shows the source’s exhaustion guidance (faithfully translated from its Chinese rule note). Energy ≤ 0 has priority over other outcomes and immediately triggers E11 Burnout. No random outcomes, undo, save slots or gender-specific starting abilities.

## 4. Chapters, choices and authored branches

There are four chapter introductions. An introduction is not an extra board choice. The Creative Director silver tile presents Chapter 4’s authored opening after the player has accepted the Ideal Worker promotion and survived its effects.

Cards need not have exactly three options. C1-B has one action. C2-03 has 1, 2, 3 and D (internal choice 4). C2-04 A/B/C has an additional resignation choice for the female pawn. C2-04D is the authored forced-exit route, ending in E10 without reaching its Boss; its Continue action is narrative acknowledgement, not a new decision.

Resolve visible variants using pawn and state flags. Numeric availability is separate: an unavailable Boss choice remains visible, grey and noncommitting; it can show only its authored thought. No stat number is revealed in the lock label. Available choices retain their authored effects. Use real buttons, keyboard 1–4/D/Enter, focus visibility and accessible reading areas.

| Flag | Set/read rule |
|---|---|
| `maternal_assumption` | All C1-03F responses set true. At Ch3 entry, female Availability −1 unless inherited transparent policy is active. Record once as a system event. |
| `c2_branch` | C2-03 choices 1/2/3/D set A/B/C/D; controls C2-04 and C4-02 option 2. D exits in Chapter 2. |
| `promised_no_kids` | Female C3-01 option 3; choosing a child at C3-02 later also applies Reputation −1. |
| `has_child` | C3-02 option 1 true, options 2/3 false; controls C3-03/04/05 and relevant Ideal Worker text. |
| `partner_primary` | Male C3-03a option 2; accepting Ideal Worker promotion ends in E05 instead of continuing. |
| `hire` | C4-01: creative / support / blind. Josh is hired by option 1; Chloe by 2 or blind review 3. Blind review removes the female Reputation −1 for the transparent proposal. |
| `policy` | C4-03 proposal, rewritten by System’s decision; only its final approved form affects the next career. |
| `previous_family_man` | Previous terminal E05; female C3-01 includes the exact additional source line, “We assumed you'd want to slow down.” |

Each selected scenario is frozen with its actual text, gender-specific result and applied policy context. Later source edits or flags must not rewrite the history view. Auto-save retains the current branch and phase.

## 5. Bosses

### Gatekeeper — C1-B

One “Open the email” action; evaluate current stats before applying effects. Creativity ≥ 5 leads to CH1-E01, a Junior Producer milestone that continues to Chapter 2. Otherwise Communication ≥ 5 ends at E02 Production Coordinator; otherwise E03 rejection. The three outcomes are selected automatically, not offered as choices.

### Old Boys’ Network — C2-B

Option 1 requires Network ≥ 5; option 2 requires Creativity ≥ 6. Unmet gates are grey with pawn-specific source thoughts. Option 3 is always available: female → E09; male → Chapter 3. Male success on any option and female option 2 show CH2-E07 during the chapter transition. Female option 1 receives an acting title and proceeds without that milestone.

With inherited transparent policy, female option 2 uses the male result text/expression. Its numerical delta remains the explicit female numerical cells, Communication +1 and Reputation +1; the ambiguous word “result” is not used to infer new balancing values.

### Ideal Worker — C3-B

Option 1 requires Availability ≥ 3. Female child/no-child variants use different Energy costs and thoughts; male gate failure has no invented thought. A male with `partner_primary` accepting option 1 ends in E05. Other successful option-1 paths continue to the Creative Director tile and Chapter 4, unless Energy triggers Burnout first.

Option 2 always ends in E06. Option 3 ends female with child in E04, female without child in E07, and male in E04 with the male authored front. This replaces the prototype’s generic numerical-failure exit.

### The System — C4-B

| Proposal | Choice 1 | Choice 2 | Choice 3 |
|---|---|---|---|
| transparent | Requires Reputation > 5; approve transparent | Downgrade to coordinator | Withdraw; no policy |
| coordinator | Requires Reputation > 4; approve coordinator | Downgrade to zero_tolerance | Withdraw; no policy |
| zero_tolerance | Approve, no gate | Requires Reputation > 5; upgrade to coordinator | Withdraw; no policy |

Thresholds are strictly greater where shown, checked before the selected delta. Missing thresholds produce a grey option and the source thought, not a new invented ending. After the accepted result and return to START, final policy selects E12/E13/E14, subject to Burnout priority.

## 6. Policy inheritance and next career

`zero_tolerance` and withdrawal make no next-career mechanical change. `coordinator` removes the female Reputation −1 from the applicable C2-04A/C option 2; C2-04B option 2 is already +1 and remains +1. `transparent` cancels female C2-02 option-2 Network −1, applies the C2-B option-2 recognition change above, and removes the maternal-assumption Availability −1 at Ch3 entry. Do not silently grant coordinator effects to transparent; the source lists distinct effects.

A completed Creative Director, or the explicit E05 exception, becomes the next Gatekeeper. Other endings use the default Director. The new career lets the player choose a pawn again, following the source’s final instruction; the hired intern is recorded but does not force the next pawn. All new careers start from the same six values.

## 7. Terminal cards, milestones and epilogue

| Id | Card | Trigger |
|---|---|---|
| E02 | A Different Door | Gatekeeper coordination offer |
| E03 | The Door Stays Closed | Gatekeeper rejection |
| E04 | A Personal Choice | Ideal Worker exit; male front differs |
| E05 | Family Man | Male partner-primary promotion route |
| E06 | Staying Put | Decline Ideal Worker promotion |
| E07 | Maybe It Was Just Me | Female without child exits at Ideal Worker |
| E08 | Personal Reasons | Female resignation in C2-04 A/B/C |
| E09 | Off the List | Female requests transparent review at C2-B |
| E10 | The Official Version | C2-03 D then C2-04D |
| E11 | Burnout | Energy ≤ 0 at any chapter |
| E12 | Nothing Changed | Finish with zero_tolerance or no policy |
| E13 | A Small Step Forward | Finish with coordinator |
| E14 | Rewriting the Rules | Finish with transparent |

CH1-E01 Through the Door and CH2-E07 Moving Up are separate milestone ids. Their displayed source ids remain E01 and E07, preserving authorship while avoiding the two distinct E07 cards colliding. Milestones flip to theory/references during the chapter transition and continue the same career. They do not appear in Gallery, archive a terminal report or disclose stats. Gallery contains only the 13 terminal endings.

Terminal fronts show source text, source rulebook note and six final values. Backs show Theory, References and the per-career numerical review. Explain the abilities from the data copy; distinguish actual changes at limits. Missing references are shown as missing. Reports remain separate for each completed career and include chapter-entry effects; the Chapter 3 maternal-assumption explanation is revealed only in this ending recap through `recapText`, never in the opening scene. Recorded outcome text can be expanded under What followed. Gallery keeps locked cards undisclosed, and reveals only the pawn fronts that have been earned.

The epilogue is available after E12/E13/E14 only. The source’s epilogue trigger and final note differ; the final note plus its full-career wording support this choice. Do not tell an early exit that it completed all four chapters.

## 8. Guide and story ownership

Use the current resolved scenario’s `guideAdvice` from the source’s 规则书 column before choices. Its tone is the team’s cheerful industry-common-sense voice. Industry background remains the neutral source background; theory and citations are revealed on the authored card backs. Do not rewrite the guide into an all-knowing moral explanation.

Guide identity and portrait remain in `guide.json`. `guide.csv` retains generic navigation fallbacks. Hide advice/Ask the guide persist a display preference only. Advice does not choose for the player or reveal thresholds. Multi-line theory and references remain readable with vertical scrolling; avoid horizontal overflow.

## 9. Saves and migration

Current content version is `team-2026-11-03`. Preserve the `sameRules.` storage key. Save choices, flags, current phase, chapter introductions already applied, actual selected scenario snapshots, numerical event history, career archives and Gallery unlocks.

The earlier prototype used different stat and ending meanings. On migration, preserve it in `legacyArchive`, clear only the active formal-story slot and start the new content separately. Gallery labels archived prototype records explicitly and uses `legacy-data.json` for their old titles/text. Do not reinterpret old E02 as new E02, merge old numbers into six-stat reports, fabricate missing history, or discard old records. Refreshes must neither double-apply chapter effects nor duplicate reports/milestones.

## 10. Art and audio handoff

The designer has prepared two player pawns, four Boss designs and audio but has not placed them in the project yet. Do not regenerate those designs or claim they are integrated. The detailed, source-based list and generation prompts are in [ART_REQUIREMENTS.zh-CN.html](ART_REQUIREMENTS.zh-CN.html); do not make every NPC produce every expression if its scenes do not use them.

Runtime art lives under `public/assets/characters`, `bosses`, `npc`, `cards`, `ui`; source/reference material under `docs/reference/players`, `bosses`, `audio`. `public/assets/manifest.json` maps stable resource keys to editable file locations. Users may move files and update paths without changing story ids. Rebuild/restart after adding assets as required by the asset index.

Audio entry keys are `audio/bgm_main`, `audio/bgm_boss`, `audio/sfx_move`, `audio/sfx_card`, `audio/sfx_choose`, `audio/sfx_ending`. Store files in `public/assets/audio` or update the manifest. The framework supports optional main/Boss loops and neutral event sounds, waits for a user gesture, respects Settings Sound and remains silent when files are absent. Actual files still require playback/loop/volume checks after delivery.

## 11. Source issues and verification

**E03 is currently unreachable under the authored numbers.** Exhaustive Chapter 1 coverage of 162 routes (81 per pawn) always ends with Creativity ≥ 5 or Communication ≥ 5. Keep E03 and the original values; the team must explicitly choose any change that makes rejection collectible. This is a source-design outcome, not a branch-engine failure. The other 12 terminal endings each have a verified path using real choices.

See `docs/source/2026-11-03-import-report.json` for all handling decisions. In particular, first-chapter ending references are missing; coordinator/transparent replacement dialogue is not provided; C2-04B’s note conflicts with its +1 cell; C2-B transparent changes result wording without overriding explicit delta cells; the male Ideal Worker locked thought is absent; optional E14 suffixes are omitted; the existing maximum is retained. Do not silently fill, translate additional story, rebalance, or manufacture citations.

Use `npm run validate-data`, `npm test`, `npm run build`, then browser-test the changed flow. The validation enumerates visible branches instead of enforcing three choices everywhere. Import fidelity tests compare all 111 original rows and the documented derived variants. The final local checks passed: 115 tests across 12 files, data validation with 11 documented source warnings, and production build. Browser acceptance covered the female E14 full career, male D-route E10, locked-option thoughts and reload, ending values/reviews, epilogue, next-career selection and 390px layouts, with no desktop warning/error logs. Policy inheritance and archive migration are automated-test coverage, not a claim of a full additional manual walkthrough. Asset-checklist search and prompt expansion were checked; audio playback remains unverified until files arrive. Publication has not occurred; detailed local evidence is in README and AI_LOG.

Implementation remains Vite + strict TypeScript, no UI framework/backend/game engine. Game state transitions are pure functions; UI reads resolved data. The course AI appendix is maintained in `AI_LOG.md`.

## 12. Historical reference

The v0.11 specification and older README/content-guide snapshots are under `docs/source/prototype-v0.11/`. Their eight-stat baseline, fixed three-option layout, generic Boss checks and forced intern inheritance describe the old prototype, not current requirements. Existing visual interactions and designer-approved metallic surfaces remain current unless explicitly superseded above.
