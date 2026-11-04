# Genderpoly — Game Spec

*Version 0.24, 5 Nov 2026. Syncs the latest authored narrative and rich-text emphasis, adds the newly supplied Chapter 1 ending references, standardizes FreeDom casing and improves reading/navigation copy. All approved artwork remains installed (59 logical resources, 60 PNGs, excluding the homepage poster). Numerical rules, branch identities and the compatible saved content version are unchanged. Verification/publication is recorded in README and AI_LOG.*

## 1. Authority and scope

The designer explicitly requested replacing the provisional game content and rules with the completed `ch1`, `ch2`, `ch3`, `ch4` tabs and `ch3相关规则说明` in the [team spreadsheet](https://docs.google.com/spreadsheets/d/1I28ChU7iAl6aHeJ9U5UPgOz2YptRXfwZ8VwOgwCg8Ow/edit). This v0.12 decision supersedes the earlier prototype’s numerical defaults, fixed three-choice rule, generic Boss checks and forced next-career intern inheritance.

The original read-only source is `docs/source/2026-11-03-team-sheet.json`. The designer's 5 Nov feedback authorizes an editorial refresh from `docs/source/2026-11-05-sheet-formatting.json`, which retains plain cell values and Google Sheets text-format runs for all eight English/Chinese chapter tabs. `scripts/team-source.mjs` combines the new chapter tabs with the original rules notes and rejects changed numerical/branch fields. `scripts/import-team-content.mjs` produces the canonical runtime `public/data/team-content.json`; scenario/ending CSVs and copy/candidate/policy JSONs are readable exports. Imports do not fetch Google Sheets automatically. The CH1 ending table now includes an authored References column; import by header name independently for each language because the Chinese table still uses its earlier layout. The only numeric override remains `src/config/chapter-one-balance.json`; original snapshots and historical reports remain unchanged. Missing citations and policy dialogue are not permission to invent them.

`scripts/import-text-formatting.mjs` generates `public/data/text-formatting.json` as exact text plus UTF-16 emphasis ranges. Rendering escapes all source text and adds only its own strong/em tags; it does not execute source HTML or interpret Markdown. Preserve sheet-authored bold, with separately documented corresponding Chinese emphasis and dialogue selections. Spoken lines use italics; quoted job titles, labels and theoretical terms are not automatically dialogue. A line may be both bold and italic. This layer covers scenes, results, chapter openings, endings and read-only reviews without changing choices or numerical records. Legacy translated text aliases keep older frozen passages readable without substituting the newly edited passage.

The project remains a single-player, deterministic, two-dimensional browser game about structural inequality in the creative industries. The game name is **Genderpoly** and, following the designer's 5 Nov correction, the company is **FreeDom** in both interface and story text. Normalize earlier case variants for display without rewriting saved choices. UI and authored story are available in English and Simplified Chinese; handoff documentation is Chinese. Keep the established repository, public URL and storage key.

The Chinese edition uses the explicit `ch1中文版`–`ch4中文版` tabs, saved in `docs/source/2026-11-03-chinese-sheet.json`. `scripts/import-chinese-content.mjs` generates the text catalog `public/data/zh-CN.json`; it does not change mechanics or the approved E03 correction. Language selection is available only in Settings, with explicit English and 中文 options; the header and all dialogs have no language switch. The preference is saved, and existing saves default to English. Switching re-renders display text only: progress, numeric effects, policy context and canonical choice/recap snapshots remain unchanged. Exact historical text without a matching authored translation stays in its recorded language instead of being replaced with a different current branch. Earlier prototype records retain their original story. Interface labels and neutral help text may be translated; missing team dialogue or citations remain missing. The Chinese importer documents source inconsistencies, including ch2中文版!G14's truncated background, resolved from identical complete background cells of the same scene.

## 2. Fixed presentation and board

- A 7-column × 6-row rectangular ring with 22 tiles: START, 16 scenario slots, four Bosses and Creative Director.
- Route: START → four Ch1 scenes → Gatekeeper → four Ch2 scenes → Old Boys’ Network → five Ch3 scenes → Ideal Worker → Creative Director → three Ch4 scenes → System → START.
- Card ids in the runtime use fixed board slots. Retain source ids separately: C1-03F/M → C1-03; C2-04A/B/C/D → C2-04; C3-03a/b, C3-04a/b and C3-05a/b share their numbered slots.
- Ordinary unvisited tiles are dark `#2A2825`; visited tiles are cream `#F4EFE3`. The four Bosses retain red, green, blue and purple metal respectively; Creative Director is silver and START/finish is gold. Special tiles retain metal after visiting.
- Boss artwork fits in its own region above a reserved bottom nameplate, with a visible gap and no clipping. Boss and Creative Director names fit one line by shrinking to the available width on rendering and resize. The Director star is centered in the full tile with its name at the bottom. The starting tile shows a centered arrow without the former START/New Hire plaque; after departure its centered question mark uses a thin hollow outline matching the Director star, with no circular badge or white background. The three decorative card piles show only a centered question mark, without card-back artwork or placeholder wording.
- YOUR CHOICES fits all recorded choices by increasing overlap, with no horizontal scrollbar. Ordinary mini cards show one centred number, Bosses show metal without visible wording. Hover/focus raises and enlarges; click opens a read-only review. Reading never replays or changes progress.
- Retain cream/ink paper cards, Limelight English titles and brand lettering, Josefin Sans body text, grain overlay, existing colour tokens and reduced-motion support. Chinese headings use bold sans-serif fallbacks; Latin text shares Josefin Sans in both languages. Boss, Creative Director and YOU nameplates share rounded corners and bold body lettering. Use designer-supplied or explicitly reviewed artwork. Optional images not yet supplied retain the existing fallback or labelled placeholder.
- Ordinary story, result, chapter and promotion cards have natural content height, including expanded rulebook/background sections. Scroll their outer overlay instead of limiting the same element that anchors the decorative inner frame. Short cards remain vertically centered; tall cards start at the reachable top. Mobile cards may fill the screen but must grow beyond its height when needed. History retains its separate reading area and Gallery retains its enclosing scroll container. Short-window reset confirmation must keep its first control reachable and allow scrolling to both decision buttons.

## 3. Six abilities and disclosure

| Ability | Both pawns start at |
|---|---:|
| Creativity | 3 |
| Communication | 3 |
| Network | 2 |
| Reputation | 2 |
| Availability | 2 |
| Energy | 7 |

Skill and Money belong only to archived prototype reports. Current effects use the six abilities above. Retain bounds 0–10 because the final sheets specify starting values and burnout but do not supply a replacement maximum. The authorised balance override changes C1-04 option 3 Communication +1 to 0 for both pawns, without changing any starting value, other delta or Boss threshold. Further balancing needs a new explicit direction.

During play, results and ordinary choice review, hide numerical changes and values except in `?debug=1`. Terminal ending fronts reveal six final values; backs append numerical review after Theory and References. Record the requested and applied changes, limits, and the automatic Chapter 3 entry event. Chapter milestones do not reveal stats.

On the designer's explicit 3 Nov update, Energy ≤ 2 shows the source's exhaustion guidance (faithfully translated from its Chinese rule note). The current warning threshold is RULES.lowEnergyWarning; the original source notes still record the former ≤ 1 threshold. Energy ≤ 0 has priority over other outcomes and immediately triggers E11 Burnout. No random outcomes, undo, save slots or gender-specific starting abilities.

## 4. Chapters, choices and authored branches

There are four chapter introductions. An introduction is not an extra board choice. The Creative Director silver tile presents Chapter 4’s authored opening after the player has accepted the Ideal Worker promotion and survived its effects.

The Guide adds a short Energy reminder before first play and at every chapter opening, alongside the authored chapter advice. The supplied Chinese wording is “部分行动可能会扣除energy，想要健康的在行业走下去就要注意劳逸结合噢”; the English version carries the same meaning. Both are editable in public/data/guide.json. This reminder and low-Energy warnings stay visible if ordinary advice is hidden. Ordinary board/choice pages do not repeat the chapter reminder.

Cards need not have exactly three options. C1-B has one action. C2-03 shows 1, 2, 3 and 4; its fourth option retains the source's D label and branch internally. All genuine choices use numeric option values consistently in cards, keyboard hints, history and numerical review, including older saved D-labelled choices. C2-04 A/B/C has an additional resignation choice for the female pawn. C2-04D is the authored forced-exit route, ending in E10 without reaching its Boss; its Continue action is narrative acknowledgement, not a new decision, and uses an arrow and Enter hint.

Resolve visible variants using pawn and state flags. Numeric availability is separate: an unavailable Boss choice remains visible, grey and noncommitting; it can show only its authored thought. No stat number is revealed in the lock label. Available choices retain their authored effects. Use real buttons, keyboard 1–4/Enter, focus visibility and accessible reading areas. Single real actions show their number plus Enter in the hint; generic help must not assume exactly three options.

| Flag | Set/read rule |
|---|---|
| `maternal_assumption` | All C1-03F responses set true. At Ch3 entry, female Availability −1 unless inherited transparent policy is active. Record once as a system event. |
| `c2_branch` | C2-03 choices 1/2/3/4 set A/B/C/D; controls C2-04 and C4-02 option 2. D exits in Chapter 2. |
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

The C1-04 option-3 override makes all three outcomes reachable without changing promotion routes. Across 81 routes per pawn: female CH1-E01 21 / E02 45 / E03 15; male CH1-E01 51 / E02 18 / E03 12. The original 21 and 51 promotion counts are unchanged. Import asserts the source row still has the expected +1 before applying the documented 0, so a later team edit cannot be silently overwritten.

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
| E10 | The Official Version | C2-03 choice 4 (source branch D), then C2-04D |
| E11 | Burnout | Energy ≤ 0 at any chapter |
| E12 | Nothing Changed | Finish with zero_tolerance or no policy |
| E13 | A Small Step Forward | Finish with coordinator |
| E14 | Rewriting the Rules | Finish with transparent |

CH1-E01 Through the Door and CH2-E07 Moving Up remain separate internal milestone ids. On the designer's 3 Nov instruction, their headings, artwork labels and placeholders show only “A CHAPTER MILESTONE” and their names, without an E number. Original source ids and asset mappings remain unchanged. Milestones flip to theory/references during the chapter transition and continue the same career. They do not appear in Gallery, archive a terminal report or disclose stats. Gallery contains only the 13 terminal endings.

Gallery uses equally sized compact cards with artwork, a title and a clamped description. Clicking an unlocked card opens a modal with the full ending, earned pawn variants and separate final values/choice reviews for each completed career; Theory and References stay on the back. Clicking a locked card briefly displays a bilingual locked notice without disclosing its identity or story. Dialogs trap keyboard focus, close with Escape or Close, return focus to the originating card and use the language selected in Settings without modifying career progress.

Terminal fronts show source text, source rulebook note and six final values. Backs show Theory, References and the per-career numerical review. Explain the abilities from the data copy; distinguish actual changes at limits. Missing references are shown as missing. Reports remain separate for each completed career and include chapter-entry effects; the Chapter 3 maternal-assumption explanation is revealed only in this ending recap through `recapText`, never in the opening scene. Recorded outcome text can be expanded under What followed. Gallery keeps locked cards undisclosed, and reveals only the pawn fronts that have been earned.

The epilogue is available after E12/E13/E14 only. The source’s epilogue trigger and final note differ; the final note plus its full-career wording support this choice. Do not tell an early exit that it completed all four chapters.

## 8. Guide and story ownership

Use the current resolved scenario’s `guideAdvice` from the source’s 规则书 column before choices. Its tone is the team’s cheerful industry-common-sense voice. Industry background remains the neutral source background; theory and citations are revealed on the authored card backs. Do not rewrite the guide into an all-knowing moral explanation.

Guide identity and portrait remain in `guide.json`. `guide.csv` retains generic navigation fallbacks. Hide advice/Ask the guide persist a display preference only. Advice does not choose for the player or reveal thresholds. Multi-line theory and references remain readable with vertical scrolling; avoid horizontal overflow.

Primary progression buttons (Start a career, Continue career, Enter the studio, Next, Continue and Next career) use a restrained cream highlight sweep and contrasting outline. Story choices and destructive settings are not selectively highlighted. Both the app's Reduced motion option and the system preference stop the animation.

Ending and milestone flip controls use larger bold body lettering with a minimum 44px target. Back faces with overflow display a black downward chevron plus a short localized scroll prompt; clicking it scrolls the current reading container. Hide the prompt at the bottom or when content fits, update it after resizing or expanding details, and respect reduced motion. Terminal cards retain the inner reading region; Gallery details retain the outer dialog scroll.

Credits is a navigation button immediately after Gallery. It opens a centered paper-card page and returns to the original title/game view without changing progress. Keep all supplied names and casing exactly: Presented by Group 9 / The FreeDOM project Team; Stories: JIANG, JINGYI, HUANG YILIN, YANG YIWEI; Game and Visuals: ShiJia Zhang & GPT Codex; Sound: HUANG YILIN. Special Thanks: Dr Shobha Avadhani on one row, then Hazel Yang / Michelle Han / Yang XuQi, then Wang Lu / Nagi. Descriptive roles use Josefin Sans, while Group 9, the team name and people's names use Limelight. Names and supplied role labels remain English in both editions. The page supports narrow screens and shares existing sound controls.

## 9. Saves and migration

Current content version is `team-2026-11-03`. Preserve the `sameRules.` storage key. Save choices, flags, current phase, chapter introductions already applied, actual selected scenario snapshots, numerical event history, career archives and Gallery unlocks.

The earlier prototype used different stat and ending meanings. On migration, preserve it in `legacyArchive`, clear only the active formal-story slot and start the new content separately. Gallery labels archived prototype records explicitly and uses `legacy-data.json` for their old titles/text. Do not reinterpret old E02 as new E02, merge old numbers into six-stat reports, fabricate missing history, or discard old records. Refreshes must neither double-apply chapter effects nor duplicate reports/milestones.

## 10. Art and audio handoff

The designer supplied a dual-pawn image and a four-Boss sheet. They have been split into six 1254×1254 transparent PNGs, retaining the approved badge characters and symbolic Boss concepts. Originals are preserved in `docs/reference/players` and `docs/reference/bosses`. The detailed source-based list and prompts are in [ART_REQUIREMENTS.zh-CN.html](ART_REQUIREMENTS.zh-CN.html), the single human-facing art handoff. Its generator and machine manifest live in `docs/tools/`. Do not make every NPC produce every expression if its scenes do not use them.

Ordinary NPCs use the same living employee-badge visual world. The Chapter 2 Creative Director portrait reuses the central Old Boys’ Network character as a single figure. The existing Boss illustrations preserve the whole group or symbolic apparatus: Old Boys’ keeps all three figures, Ideal Worker keeps every arm and prop, and System keeps its gears/chimney/base. Pawns need no extra expression files at their current board scale. After four review rounds, the designer approved and authorised installing all 51 required additions: 11 base portraits, 27 reaction portraits and 13 ending illustrations. The three HR portraits use the confirmed second-round oval-glasses originals. The question-mark card piles need no image file. The designer has cancelled all extra Boss reaction requirements; Bosses keep reusing their current base illustrations. The designer approved all three milestone images in the second review export and authorised integration and publication. CH1-E01 Through the Door uses the unchanged shared `public/assets/cards/ending_CH1-E01.png`. CH2-E07 Moving Up remains one logical milestone but selects `public/assets/cards/ending_CH2-E07_male.png` or `public/assets/cards/ending_CH2-E07_female.png` by the current pawn. There is no base CH2 PNG. Both 1536×1024 versions show the leader beside the protagonist and seated coworkers applauding in the same office composition. Keep their approved identities and bytes unchanged. The active production list has 59 logical resources represented by 60 installed PNGs (6 existing, 38 NPC, 13 terminal, 3 milestone); the homepage poster is separate. There are no pending art items or visible placeholders. Cancelled Boss reactions have no active file or prompt requirements.

Runtime art lives under `public/assets/characters`, `bosses`, `npc`, `cards`, `ui`; source/reference material under `docs/reference/players`, `bosses`, `audio`. `public/assets/manifest.json` maps stable resource keys to editable file locations. Users may move files and update paths without changing story ids. Rebuild/restart after adding assets as required by the asset index.

The 54 approved additional PNGs are stored once, under `public/assets/npc` and `public/assets/cards`, with their reviewed bytes unchanged. The local `art/approved/2026-11-03/` index and catalog point to these runtime files and retain the original four character/ending review exports plus both milestone review exports, exact generation/edit prompts and provenance. Milestone provenance, including the superseded object-only CH2 design, is consolidated in `art/approved/2026-11-03/milestone-provenance.json`. The [local approved overview](../art/approved/2026-11-03/index.html) reads the installed files; this metadata directory is ignored by Git and not published with the game. The old milestone review pages are cleared after validation and must not remain active document links. The designer authorised removing previous review pages, unselected draft images and duplicate approved PNG copies after validation. Do not reintroduce the historical review folders as active image sources. Original supplied pawn/Boss reference sheets and audio sources remain separate.

The homepage's `ui/title` now uses the designer's supplied complete game-presentation poster, stored unchanged as `public/assets/ui/title.png`. Preserve its original aspect ratio and full content, show it on mobile as well as desktop, and share the same artwork across English and Chinese. This replaces only the homepage's paired-pawn fallback; individual gameplay pawn assets remain in use.

Audio mappings and provenance are maintained in `public/assets/audio/catalog.json`: nine supplied files and three original synthesized effects. Music lives in `audio/music`, short effects in `audio/effects`. Keep the long originals locally in ignored `docs/reference/audio`; publish only the prepared runtime excerpts. Intro music covers title/chapter/promotion/epilogue, the bar track covers C2-03, the party track covers C3-05, and ordinary scenes use the main loop. Movement, landing, card opening, valid choices and Chapter 1 hiring use the supplied cues. Supplementary Boss arrival, neutral ending and card-flip cues use no external samples. Wait for a user gesture, respect Sound/mute, fade music transitions and never use audio to reveal hidden stats or label choices as right/wrong. Actual browser playback evidence belongs in the current verification record.

Sound defaults to enabled for new/reset profiles; retain explicit saved preferences during reload and prototype migration. Playback still waits for a user gesture. A 44px icon-only button appears in the page header or active dialog toolbar, with a localized accessible Sound label and pressed state. The designer replaced the original colored emoji with a centered 24px monochrome outline speaker: waves mean sound on, a diagonal slash means muted. Use cream strokes on the ink button, not platform emoji fonts. It shares the Settings preference, can mute during animations and dialog reading, and updates in place without resetting scroll or expanded content. Muting immediately pauses all music/effects; unmuting resumes the contextual music without replaying completed/paused cues.

Audio belongs to the most recently activated game page. Coordinate same-origin pages with BroadcastChannel where supported; an interacted muted page also pauses other pages without changing their saved preferences. Pause music and effects on hidden/pagehide/window blur, and resume only eligible contextual music after an activated page returns. Stop and release the old music source on track replacement; stale playback promises/events cannot restart retired tracks. Clean up listeners, channels and audio on development hot replacement. Existing pages loaded before this fix need a one-time refresh or close; this does not reset progress.

## 11. Source issues and verification

**E03 is reachable after the approved single-row correction.** All 162 Chapter 1 routes and all 13 terminal endings have real-choice coverage. The source-design issue and before/after counts are preserved in `docs/source/2026-11-03-ch1-balance.json`; the original snapshot remains faithful to the sheet.

See `docs/source/2026-11-05-import-report.json` for current handling decisions and the 11/3 report for history. CH1-E01, E02 and E03 now have the team's supplied Hesmondhalgh & Baker (2015) citation. C1-00 still has no source citation; C3-00 lists only Dent, and some CH4 references omit Sørensen's year. These are retained as authored, not invented. Coordinator/transparent replacement dialogue is not provided; C2-04B’s note conflicts with its +1 cell; C2-B transparent changes result wording without overriding explicit delta cells; the male Ideal Worker locked thought is absent; optional E14 suffixes are omitted; the existing maximum is retained. Do not silently fill, translate additional story, rebalance, or manufacture citations.

Use `npm run validate-data`, `npm test`, `npm run build`, then browser-test the changed flow. Validation enumerates visible branches instead of enforcing three choices everywhere. Import fidelity tests compare all 111 original rows and derived variants, allowing only the explicitly approved C1-04 numeric exception. The balance checks cover all 162 first-chapter routes and actual paths to every terminal ending. Validate the six extracted images, mobile fitting, Sound on/off, contextual music, cue timing, ending recap and source-based asset checklist. Record the latest test counts, browser/audio evidence and publication result in README and AI_LOG instead of repeating a stale release status here.

Implementation remains Vite + strict TypeScript, no UI framework/backend/game engine. Game state transitions are pure functions; UI reads resolved data. The course AI appendix is maintained in `AI_LOG.md`.

## 12. Historical reference

Superseded specification/manual copies were removed from the current tree; Git history preserves them. `docs/source/prototype-v0.11/` and `docs/starter-data/` retain only data fixtures still used by automated tests. `public/data/legacy-data.json` remains required for old-save interpretation. The original starter ZIP was moved out of the active project to `../_archive/`; installed dependencies and local builds remain ignored. Existing visual interactions and approved metallic surfaces remain current unless explicitly superseded above.
