# Genderpoly — Game Spec

*Version 0.5, 31 Oct 2026.*

Version 0.5 names the game **Genderpoly** (title and header) and the in-game company **FreeDOM** (board centre). A failed numerical Boss check now opens the ending card immediately, without an intervening result screen or Continue button. Passing The Ideal Worker and becoming Creative Director through the promotion scene are required before Chapter 4. Numerical defaults and The System's existing no-fail check are unchanged. Retain the existing storage keys and repository/site addresses for compatibility.

Version 0.4 records the designer's 31 Oct decisions: fixed metal finishes for the six special board tiles, an optional resident guide, and separate theory/reference sections on ending-card backs. The approved metal finishes override the earlier blanket restriction on gradients and the original special-tile palette; the exception is limited to these six tiles.

A single-player 2D web game for a university course on gender and media (NMC5369, NUS). The player lives one career at FreeDOM in the creative industries, from New Hire to Creative Director and back to the start. Both pawns start equal; the workplace treats them differently, and the game never says so.

Hard deadline: the team submits on **5 Nov 2026**; the course deadline is 6 Nov 23:59. Feature freeze is **3 Nov**.

---

## 1. Why the game exists (read this before designing anything)

The project is graded on four criteria: conceptual understanding of the readings, understanding of the phenomenon, applying the readings as a lens, and creativity ("symbolic layers"). The teacher's feedback after the first presentation was: **the theory must be visible inside the game**, not only in the write-up.

The conceptual lens the game is built on:

> **Structural inequality presented as individual choice.** Every option feels like the player's free choice, but which options exist and what they lead to are shaped by how the workplace reads the player's gender.

| Chapter | Phenomenon | Main readings |
|---|---|---|
| 1 · Breaking In | Creativity read as masculine; appearance and self-presentation become hidden barriers | Wang & Keane (2020); Hennekam & Bennett (2017); Hesmondhalgh & Baker (2015) |
| 2 · Getting Ahead | Informal networks decide promotion; speaking up against harassment has career costs | Hennekam & Bennett (2017); North (2016) |
| 3 · The Career Cliff | Unequal care expectations; leaving framed as a "personal choice" (neoliberal feminism) | Dent (2020) |
| 4 · The Other Side of the Table | Managers reproduce inequality through reasonable-looking decisions about hiring and roles | Hesmondhalgh & Baker (2015); Koppman et al. (2022); Sørensen (on intimacy coordination) |

Design consequences that are **not negotiable**:

1. **Same start.** Both pawns have identical starting stats. Gender never changes ability; it changes how the world responds.
2. **Hidden rules.** Stats and gender effects are never shown to the player (only in debug mode). Feedback comes only through text, NPC tone and NPC expressions.
3. **Deterministic.** No dice, no randomness in outcomes. Same choices + same pawn = same result, every time. (The only allowed randomness is the optional first-round gender assignment, see §11.)
4. **No undo.** No back button, no save slots. The current run is auto-saved so that refreshing the page resumes at the same point instead of undoing a choice.
5. **Colour records, never judges.** Ordinary walked tiles light up in muted colour. The six special tiles keep their assigned metal finish and gain a visited check mark. Colour identifies place and progress, never a good/bad choice.
6. **Never preach.** The game never states "this happened because you are a woman". Theory appears as background notes the player can open, through the optional guide's rulebook, and on the back of ending cards. The guide provides context without deciding for the player or revealing hidden numerical rules.

---

## 2. Screen flow

```
Title ─▶ Character intro (pawn + name) ─▶ Board
Board: [Next] ─▶ pawn hops 1 tile ─▶ tile lights up ─▶ Scenario card (3 options)
       ─▶ Result (text + NPC reaction) ─▶ card goes to the "chosen" pile ─▶ back to Board
Boss corner ─▶ Boss card (3 options) ─▶ numerical pass ─▶ Result ─▶ Continue
                                     └▶ numerical fail ─▶ Ending card immediately
Pass Ideal Worker ─▶ Creative Director tile ─▶ promotion scene ─▶ Chapter 4 (hiring + policy)
Back on the start tile ─▶ Ending card flips over ─▶ Gallery ─▶ "Next career" (new round)
```

Always reachable from the title screen: **Gallery** and **Settings** (reset all progress, reduced motion, sound on/off).

Use **Genderpoly** as the game name in the title/header and **FreeDOM** as the company name in the board centre. Both names come from `public/data/copy.json` (`title` and `companyName` respectively).

A resident guide sits beside the board on desktop and below it on narrow screens. On a choice card, the guide's advice appears before the options in document order; it never blocks or disables choosing. **Hide advice** collapses the advice; **Ask the guide** restores it. **Open the rulebook** reveals available industry context, theory and references. Reading or hiding advice never changes a choice, stat, boss result or ending.

---

## 3. The board

A rectangular ring of 22 cells on a **7 columns × 6 rows** grid. The four corners are bosses. The centre (columns 2–6, rows 2–5, 1-indexed) is the card area.

```
row 1:  [IDEAL WORKER] [t4] [t3] [t2] [t1] [t0] [OLD BOYS' NETWORK]
row 2:  [CD = l0]                                [r3]
row 3:  [l1]               card area              [r2]
row 4:  [l2]   3 face-down piles + 1 chosen pile  [r1]
row 5:  [l3]                                      [r0]
row 6:  [THE SYSTEM] [START b0] [b1] [b2] [b3] [b4] [GATEKEEPER]
```

**Path** (clockwise, starting bottom-left and moving right):

`b0 START` → `b1–b4` (Ch1, 4 tiles) → **Gatekeeper** → `r0–r3` upward (Ch2, 4 tiles) → **Old Boys' Network** → `t0–t4` leftward (Ch3, 5 tiles) → **Ideal Worker** → `l0` **Creative Director tile** → `l1–l3` downward (Ch4, 3 tiles) → **The System** → `b0` again = **ending**.

That is 16 scenario tiles + 4 bosses = 20 cards per run, about 10 minutes.

Tile states:

| State | Look |
|---|---|
| Ordinary hidden tile (not yet walked) | Dark `#2A2825`, a "?" in `#5E584F` (Limelight) |
| Ordinary walked tile | Filled with a muted colour from the lit palette (§10); colour has no good/bad meaning |
| START / finish (before leaving) | Gold metal finish with a double inner border, "START / NEW HIRE →" |
| START after the pawn leaves | **Flips into a "?" tile while keeping its gold finish.** When the pawn returns, it flips to reveal the ending |
| Creative Director tile | Silver metal finish, a star, "CREATIVE DIRECTOR". Not the ending |
| Boss corners | In route order: Gatekeeper = red metal; Old Boys' Network = green metal; Ideal Worker = blue metal; The System = purple metal. Keep the figure and name legible |
| Visited special tile | Keeps its assigned metal finish and adds a check mark; never switches to the ordinary walked palette |

Card area: three face-down piles (black card backs with a cream inner border and "?" in a circle) and one face-up horizontal pile of chosen cards that grows as the player plays.

---

## 4. Hidden stats

Eight stats, all hidden. Both pawns start with the same values (placeholder: all `5`, range 0–10; final numbers come from the team's rules doc).

`Creativity` · `Communication` · `Skill` · `Energy` · `Network` · `Reputation` · `Availability` · `Money`

Gender enters the game in exactly three data-driven ways:

1. **Option availability.** A scenario can offer different options to each pawn. Each pawn always sees exactly 3, so neither ever looks incomplete. (Example: only the male pawn is invited to "the second round".)
2. **Per-pawn results.** The same option can give each pawn a different result text, NPC expression and stat change.
3. **Per-pawn boss thresholds.** A boss can require more of one pawn than the other (rules config).

Default rule (configurable): if `Energy` reaches 0, the run ends in a burnout exit ending.

Debug mode: add `?debug=1` to the URL to show a small stats panel and the current card id. Never visible otherwise.

---

## 5. Scenario cards

Each scenario card shows: chapter label, title, scene text, NPC portrait (with expression), and a small **"Why does this happen?"** toggle that reveals the card's background note (theory + reading). The player picks 1 of 3 options (click, or keys `1` `2` `3`). Ordinary choices and passed Boss checks show the result text and the NPC's new expression, then **Continue**. A failed Boss check skips this result screen and opens the ending card immediately.

Conditions let an option (or a whole card variant) appear only if earlier things happened. Syntax, combined with `;` meaning AND:

- `C1-02=2` → the player chose option 2 on card C1-02 this run
- `policy:formal_recruitment` → that policy is active (set by a previous round's Creative Director)
- `round>=2` → this is the second career or later

### Resident guide

The guide reads its identity from `public/data/guide.json` and authored notes from `public/data/guide.csv` (§12). The template contains `GENERAL`, `PROMOTION` and the 20 board card ids, one row per id. All card-specific advice, context, theory and references are initially blank for the team to write; `GENERAL` contains navigation guidance only. Do not invent quotations or theory claims to fill these blanks.

- Use the current card's advice before its choice; a blank advice field falls back to `GENERAL` advice. `PROMOTION` covers the Creative Director scene.
- If both the current guide row's industry context and theory are blank, use the current scenario's background and, unless explicitly supplied in the guide row, its reference.
- If the guide row supplies its own industry context or theory, use that independent text and its own reference only. Do not silently borrow a scenario citation to support newly authored claims.
- The guide is optional. Persist its visibility preference as `settings.guideHidden`; older saves without this setting remain valid and default to visible. This is a display preference, not a game-rule input.

---

## 6. Bosses

A boss is a 3-option card like any other, but its outcome is **pass** or **fail**, decided by a rule: current stats vs. the boss's per-pawn threshold, plus the chosen option's modifier. Deterministic.

Use the actual numerical check, not wording in a result cell, to determine success. If that check fails, end the career and show its ending card immediately; there is no separate failure-result Continue step. Starting values, stat deltas, thresholds and modifiers are not rebalanced by this flow change.

| Boss | What it checks (from the design doc) | On failed numerical check |
|---|---|---|
| The Gatekeeper | Skill + professional image, plus a hidden "fit" check | Exit ending: never got in |
| The Old Boys' Network | Skill **and** Network ("merit alone is not enough") | Exit ending: stalled |
| The Ideal Worker | Energy and Availability (always available, no care duties) | Exit ending: "a personal choice" |
| The System | Balancing Profit, Reputation, Worker Wellbeing, Diversity, Deadline (design intent); the current numerical check has no fail threshold | No new failure condition; retain the existing no-fail behavior. Its final-choice ending mapping remains a team decision |

**Round 2 and later:** the Gatekeeper is **the previous round's Creative Director** (same name, pawn and badge colour). Their dialogue reflects the policies they set. If the previous round never reached Creative Director, the Gatekeeper is a default NPC director ("someone else got the chair").

Immediate exit on a failed Boss check is confirmed by the designer in v0.5. The System remains exempt because its existing check has no failing threshold; do not introduce one as part of this change.

---

## 7. Chapter 4: hiring and policy

The player must first pass The Ideal Worker's actual Boss check, then reach the Creative Director tile and see the promotion scene before entering Chapter 4. Failing The Ideal Worker opens an ending immediately and cannot lead to hiring or policy choices. Preserve the promotion scene: it marks the change from employee to decision-maker.

- **Hiring:** choose 1 of 3 intern candidates. Each has a name, gender, skills and a short blurb (e.g. a woman excellent at both creative and organisational work, a man with average skills who presents confidently, a candidate who needs flexible working). **The chosen intern becomes the playable character of the next round.**
- **Policy:** spend a limited number of Power Tokens (MVP: pick 1) on rules such as formal recruitment, childcare support, flexible working, an anti-harassment policy, intimacy coordination. Each has a cost and a benefit. Chosen policies are stored and **change the next round** (via `policy:` conditions and boss rules).

MVP effect that must work: **formal recruitment** removes the hidden "fit" penalty at the next round's Gatekeeper. Other policy effects are stretch goals.

Candidates and policies live in `public/data/candidates.json` and `public/data/policies.json` (placeholder entries until the writers fill them in).

---

## 8. Endings and the Gallery

- A run ends when the pawn **returns to START** (the "?" tile flips over) or exits early (failed boss, burnout).
- The ending is picked by an ordered list of rules in code (first match wins); its text comes from `endings.csv`.
- Ending card: **front** = name + ending text + art; **back** = separate **Theory** and **References** sections, sourced from `endings.csv` fields `背面：理论概念` and `对应文献`. The player can flip it. Preserve paragraph breaks and multiline citations; long text scrolls within the reading area. Empty references remain visibly unfilled, never generated or inferred.
- **Gallery:** a grid of all ending cards. Unlocked cards show their front (click to flip); locked cards show a silhouette and "???". Each unlocked card records which pawn unlocked it.
- The same theory/reference layout and scrolling behavior applies when an unlocked card is flipped in the Gallery.
- Some endings can only be reached by one pawn. The gallery itself then shows the gap between the two pawns without the game ever saying it. **This is a key design idea; do not "fix" it.**
- Target: 6–8 endings.

---

## 9. The loop and what is saved

Saved in `localStorage` (one key prefix, e.g. `sameRules.`):

| Key | Content |
|---|---|
| `currentRun` | Full state of the run in progress (auto-saved after every choice) |
| `lineage` | One entry per finished career: character name, pawn, ending id, reached Creative Director?, policies set, intern hired |
| `gallery` | Unlocked ending ids, with which pawn and which round |
| `settings` | Reduced motion, sound, `guideHidden` (optional advice visibility; absent in older saves means visible) |

New round:

- Previous run reached Creative Director → the previous character becomes the **Gatekeeper**; the **hired intern** becomes the player's character (their gender decides the pawn).
- Previous run did not reach Creative Director → default NPC Gatekeeper; the player gets a new character (same rule as round 1).
- Round 1 character: see §11 (choose or random).

Settings has **Reset all progress** (clears everything, with a confirm step built as an in-page dialog, not `window.confirm`).

Wording for the team: "you cannot save or undo within a career, but the game remembers your past careers".

---

## 10. Art direction

**Style:** 1930s black-and-white rubber-hose cartoon (think early animation), fully 2D, flat fills and thick black outlines. Colour is rare and muted. The designer approved a specific exception on 31 Oct: the four Boss tiles, Creative Director tile and START / finish tile use fixed brushed-metal gradients. Keep this exception on these six backgrounds only; characters, cards and ordinary tiles retain their existing flat treatment.

**Characters:**

- Player pawn = an **ID badge with rubber-hose limbs**: a landscape badge as the body, a clip and two lanyard straps on top, noodle arms on hips with white gloves, black round shoes. Gender shows **only** as the lanyard colour and the two small ♀/♂ symbols on the cheeks. Everything else is identical.
- Faces (all characters): big white oval eyes with a thick black outline, black pupils, simple brows and mouth. Bosses use the same face construction.

**Colour tokens** (centralize in `src/styles/tokens.css`; use the approved palette and metal finishes below):

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#141414` | Outlines, text, dark cards |
| `--paper` | `#E6DFCF` | Page background |
| `--board` | `#D3CBB8` | Board base (5px ink border, 10px hard ink shadow) |
| `--panel` | `#EFE9DB` | Centre card area |
| `--cream` | `#F4EFE3` | Card faces, light figures |
| `--ivory` | `#F7F2E6` | Existing light interface accents; special tiles now use the assigned metal finish |
| `--tile-hidden` | `#2A2825` | Unwalked tiles |
| `--tile-hidden-mark` | `#5E584F` | "?" on unwalked tiles |
| `--grey` | `#A39B8C` | Secondary lines |
| `--female` | `#C7716B` | Female lanyard and cheek symbols only |
| `--male` | `#5B7FA6` | Male lanyard and cheek symbols only |
| `--lit-1/2/3` | `#B9705F` `#CBAA5A` `#6F8DA6` | Ordinary walked tiles (**open decision**, see §11) |

Approved special-tile tokens use each base name plus `-shadow`, `-light` and `-edge`. These colors form a fixed brushed-metal background; they do not respond to success, failure, pawn or choice.

| Base token | Base / shadow / light / edge | Tile |
|---|---|---|
| `--metal-red` | `#A95050` / `#7B2E32` / `#E2B1A4` / `#5A2329` | The Gatekeeper |
| `--metal-green` | `#678E73` / `#305A4F` / `#CFDCC0` / `#234439` | The Old Boys' Network |
| `--metal-blue` | `#6F92B0` / `#315676` / `#D2E0E7` / `#263D53` | The Ideal Worker |
| `--metal-purple` | `#92779E` / `#523A65` / `#DECEE4` / `#3D2B4B` | The System |
| `--metal-silver` | `#BAC1C3` / `#72797C` / `#F0F2ED` / `#4C5357` | Creative Director |
| `--metal-gold` | `#CDAA55` / `#876127` / `#F4E7AF` / `#65451D` | START and finish (the same tile) |

**Type:** `Limelight` for titles, boss names and "?"; `Josefin Sans` for everything else (both from Google Fonts).

**Shapes:** tiles 12px radius, 4px ink border; cards 12px radius with a 2px inner border inset 7px and small diamond corner ornaments; buttons are real `<button>` elements styled as ink-outlined cream cards.

**Film look:** a fixed full-screen grain overlay (SVG `feTurbulence`, greyscale, `mix-blend-mode: multiply`, opacity ~0.2) and an optional slow vignette.

**Animation** (all CSS/Web Animations, all disabled by `prefers-reduced-motion` and the settings toggle):

| Motion | Spec |
|---|---|
| Idle bob (pawn, bosses, NPCs) | translateY 0 → −4px with a slight squash, ~600ms ease-in-out, alternate, infinite |
| Pawn hop | ~450ms arc to the next tile, small squash on landing |
| Card flip | scaleX 1 → 0 (150ms), swap face, 0 → 1 (150ms) |
| Tile light-up | colour spreads from the centre over ~400ms |
| START → "?" flip | same flip as a card, when the pawn leaves START |

**Art assets.** All art is drawn by the designer and added to `public/assets/` over time (SVG preferred, PNG allowed). Until a file exists, the game shows a clearly labelled placeholder box of the right size. Load art by these names so new files slot in without code changes:

| File (in `public/assets/`) | Use |
|---|---|
| `characters/pawn_female.*`, `pawn_male.*` | Player pawn |
| `bosses/gatekeeper.*`, `old_boys_network.*`, `ideal_worker.*`, `the_system.*` | Boss figures |
| `npc/<npc-id>_<expression>.*` | NPC portraits; expressions `pleased`, `neutral`, `appraising`, `frowning`, `awkward`, `cold` |
| `npc/guide_neutral.svg`, `.png` or `.webp` | Resident guide portrait; `guide.json` refers to manifest key `npc/guide_neutral` without an extension |
| `cards/card_back.*`, `cards/ending_<id>.*` | Card back, ending card art |
| `ui/title.*`, `ui/gallery_frame.*` | Title screen, gallery frame |

Reference images from the designer go in `docs/reference/`; match them when they exist.

---

## 11. Open decisions (implement as config with these defaults)

Put all of these in `src/config/rules.ts` so the team can change them without touching game logic.

| Decision | Default for now |
|---|---|
| Round 1 character: choose pawn or random | `"choose"` |
| Starting stats and boss thresholds per pawn | All stats 5; placeholder thresholds |
| Which policies exist and their next-round effects | Formal recruitment only (removes Gatekeeper "fit" penalty) |
| Ordinary lit tile colours | Current three; the team may replace them because two are close to the gender colours. The six special-tile metal assignments are fixed by the 31 Oct decision |
| Number of endings | 6–8 |

---

## 12. Data (written by the team in Google Sheets)

The writers fill a shared Google Sheet; the developer exports each tab as CSV into `public/data/`. **All story text comes from these files. Never hard-code story text.** Game text is in English; some helper columns are in Chinese.

`copy.json` supplies shared narrative text and the two distinct names: `title: "Genderpoly"` for the game and `companyName: "FreeDOM"` for the workplace shown in the board centre. Renaming either display name does not rename browser storage, the repository or the existing public URL.

### `scenarios.csv` — one row per option

Headers are in Chinese as the team uses them; map them to these keys:

| Sheet header | Key | Notes |
|---|---|---|
| 卡号 | `cardId` | `C1-01` … `C4-03`; bosses `C1-B` … `C4-B` |
| 章节 | `chapter` | `Ch1`–`Ch4` |
| 格子 | `tile` | 1–5, or `Boss` |
| 类型 | `type` | `情境` = scenario, `Boss` = boss |
| 场景标题 | `title` | |
| 场景描述 | `scene` | |
| 背景信息（游戏内可翻看） | `background` | Shown behind "Why does this happen?" |
| NPC | `npc` | |
| 出现条件（可选） | `condition` | See §5 |
| 选项 | `option` | 1–3 |
| 适用棋子 | `pawn` | `都可` = both, `仅♀` = female only, `仅♂` = male only |
| 选项文字 | `optionText` | |
| 结果 ♀ / 结果 ♂ | `resultF` / `resultM` | |
| NPC 表情 ♀ / ♂ | `exprF` / `exprM` | 满意 pleased · 中性 neutral · 打量 appraising · 皱眉 frowning · 尴尬 awkward · 冷淡 cold |
| 数值变化 ♀ / ♂ | `deltaF` / `deltaM` | `Network+1, Energy-1` |
| 对应文献 | `reference` | Available in the guide's rulebook when its context falls back to this scenario |
| 备注 | `notes` | Not shown in game |

Rows of the same card repeat the card-level columns. Skip rows whose `optionText` is empty. Grey example rows in the sheet (card `C2-03`) are samples and may be deleted by the team.

### `endings.csv` — one row per ending

| Sheet header | Key |
|---|---|
| 编号 | `id` (`E01`…) |
| 结局名称 | `name` |
| 触发条件 | `triggerNote` (human description; the real rule lives in code) |
| 适用棋子 | `pawn` |
| 结局文字（正面） | `front` |
| 背面：理论概念 | `back` |
| 对应文献 | `reference` |
| 对下一局的影响 | `nextRoundNote` |
| 美术需求 | `artNote` |
| 备注 | `notes` |

### `guide.csv` — one row per guide context

The supplied template has 22 rows: `GENERAL`, `PROMOTION`, and all 20 scenario/Boss card ids. Keep each id unique; this file does not use the scenario table's one-row-per-option layout.

| Sheet header | Key | Notes |
|---|---|---|
| 卡号 | `cardId` | `GENERAL`, `PROMOTION`, or an existing board card id |
| 选择前建议 | `advice` | `GENERAL` is required; other blank advice falls back to it |
| 行业背景 | `background` | Optional industry context |
| 理论解释 | `theory` | Optional team-authored theoretical explanation |
| 对应文献 | `reference` | References supporting this row's text; multiline text is supported |
| 备注 | `notes` | Team notes, not displayed |

If both `background` and `theory` are blank on a choice card, the guide uses that scenario's background and its reference, unless the guide row supplies a reference. When either independent context field is filled, no scenario reference is automatically inherited. `GENERAL` supplies navigation guidance, not invented card-specific claims. The team will fill the currently empty dedicated rows.

`guide.json` contains nonempty `name`, `role` and `portrait` fields. The default portrait is `npc/guide_neutral`, which is a resource key in `public/assets/manifest.json`, not a filename or filesystem path.

### Validation

`npm run validate-data` must check: every card gives **each pawn exactly 3 options**; card ids are unique and match the board's 20 slots; stat names in deltas are valid; conditions parse; every ending id referenced in code exists in `endings.csv`. Print readable errors (the team are not programmers).

Guide validation checks the six CSV headers, recognized and unique context ids, required `GENERAL` advice, and nonempty guide identity fields with a valid `npc/...` portrait key. Blank dedicated advice and context are intentional and use the fallback rules above.

---

## 13. Tech

- **Vite + TypeScript**, no UI framework, no game engine, no 3D. DOM + CSS + inline SVG.
- `papaparse` for CSV. No backend; everything runs in the browser.
- Game logic is a small state machine with pure functions (`state + choice → new state`), separate from rendering, so it can be unit-tested (`vitest`).
- Deploy to **GitHub Pages** through a GitHub Actions workflow (set Vite `base` correctly).
- Desktop-first at 1280×800; must be playable on a phone in portrait (board scales, cards become full-screen sheets).
- Accessible: real buttons, keyboard play (`1` `2` `3`, `Enter`), visible focus, text contrast ≥ 4.5:1.

Suggested structure:

```
src/
  main.ts
  config/rules.ts        # all tunable numbers and open decisions (§11)
  data/load.ts           # CSV/JSON loading + header mapping
  data/validate.ts       # used by validate-data
  data/guide.ts          # guide.csv / guide.json parsing and validation
  game/state.ts          # types + state machine
  game/conditions.ts     # condition parser
  game/bosses.ts         # boss rules
  game/endings.ts        # ordered ending rules
  game/persistence.ts    # localStorage
  ui/board.ts  ui/card.ts  ui/gallery.ts  ui/title.ts  ui/settings.ts
  ui/guide.ts            # optional advice, context and references
  styles/tokens.css  styles/*.css
public/
  assets/...             # art drawn by the designer (placeholders until added)
  data/*.csv  data/*.json
  data/guide.csv         # 22 guide contexts, authored by the team
  data/guide.json        # guide name, role and portrait resource key
```

---

## 14. Milestones

| Milestone | Date | Done when |
|---|---|---|
| M0 Setup | 26 Oct | Repo runs locally; deploys to GitHub Pages; tokens, fonts, grain overlay in place |
| M1 Playable prototype | 30 Oct | A full run works with the sample/placeholder data: board, hop, scenario cards, hidden stats, per-pawn options, bosses, return to START, an ending card |
| M2 Loop + gallery | 1 Nov | Real CSV data loads and validates; Chapter 4 hiring/policy; ending gallery; round 2 with previous Creative Director as Gatekeeper; persistence + reset |
| M3 Art + motion | 2 Nov | Final art in, animations, sound with a credits file, mobile layout |
| Freeze | 3 Nov | Only bug fixes after this |
| M4 Release | 4 Nov | Tested on desktop and phone browsers; final deploy |

If on 1 Nov a full run is still unstable: drop animations first. The loop must keep at least "previous Creative Director becomes the Gatekeeper".

---

## 15. Out of scope

Multiplayer, accounts, a backend, 3D, save slots, procedural content, in-game text editing.
