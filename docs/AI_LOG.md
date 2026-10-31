# AI usage log

For the course's compulsory AI appendix: why AI was used, how it was used, and how it contributed to learning. Codex appends an entry after each task; team members can add their own entries too (concept art, translation, research, etc.).

## 2026-10-17 to 10-24 — Concept, art direction and planning (Claude)
- Asked: discuss core gameplay, draft the WIP presentation framework and speaking notes, produce rubber-hose concept art for the board, pawns and bosses, build the team schedule.
- Done: concept art iterations for the WIP presentation (not used as final game art); schedule and script template spreadsheet; this project brief and spec for Codex.
- Human decisions: single-player digital game, hidden rules, fixed script, no dice; ID-badge pawn with gender only on lanyard and cheeks; fully 2D rubber-hose style; loop where the previous Creative Director becomes the next Gatekeeper; ending-card gallery.

## 2026-10-25 — Local playable skeleton and team handoff (Codex)
- Asked: start the game demo from the supplied instructions and starter archive; separate code, story and art so teammates can fill content later; explain manual resource changes and required software.
- Done:
  - Built a Vite + TypeScript prototype with the 22-space board, 20 cards, data-driven options/results, deterministic bosses, equal starting stats, hiring/policy loop, endings/gallery, autosave/reset, keyboard controls, and reduced-motion support. Added labelled art placeholders and an editable resource manifest without creating character art.
  - Preserved the four supplied data files in docs/starter-data and retained the original sample text; filled 19 cards and 4 endings with clearly marked scaffold content. Added Chinese setup, content and art guides, Windows launch/check shortcuts, and a GitHub Pages workflow (not deployed).
  - Installed the specified project tools. Production build, data validation and all 35 tests passed, including actual CSV playthroughs for both pawns across two careers, persistence, conditions, asset mappings and content rendering. Browser automation was blocked by the tool's local URL policy; visual, mobile and real keyboard/console checks remain unverified.
- Human decisions: the supplied design remains authoritative. The team still needs to replace placeholder story/art and finalize balancing/ending rules, especially how The System's three final choices distinguish endings. Current completed endings distinguish formal recruitment versus no policy; other policy effects and audio remain future work.

## 2026-10-25 — T04 repository and hosting preparation (Codex)
- Asked: complete the schedule task for a GitHub repository, free web hosting, and a playable link for the team.
- Done:
  - Initialized a local Git repository on main, added consistent text-file line endings, and excluded the original starter archive and local environment files from version control. Kept publication scoped to Game Demo.
  - Reviewed the GitHub Pages workflow and project-relative resource paths, limited deployment permissions to the deployment job, and added a Chinese publishing/update guide. Data validation, all 35 tests, and the production build passed again.
  - Requested GitHub plugin connection. The available browser was also signed out of GitHub. No remote repository or live site has been created yet; live URL, browser/mobile playthrough, and console checks remain pending account authorization and first deployment.
- Human decisions: GitHub Pages follows the supplied project specification; proposed repository name is same-rules-demo. A free personal account requires a public repository, including its source, story and art files. The user needs to complete GitHub account authorization.

## 2026-10-25 — T04 GitHub Pages launch and browser verification (Codex)
- Asked: finish the GitHub repository and free hosting task, providing a playable link that the whole team can open.
- Done:
  - Created the public repository [Ebitorako/same-rules-demo](https://github.com/Ebitorako/same-rules-demo) and published [Same Rules?](https://ebitorako.github.io/same-rules-demo/) through GitHub Actions. The [first deployment](https://github.com/Ebitorako/same-rules-demo/actions/runs/40188632600) succeeded; future uploads to main automatically update the same site address.
  - Passed local data validation, all 35 automated tests, the production build, and the checks in GitHub Actions. On the live site, verified the title, pawn selection, 22-space board, three first-card options, result display, refresh preserving the same result, Continue advancing to 1/20 cards, and the next card. A 390 × 844 mobile viewport displayed the board and cards with usable options; actual 3 and Enter key actions worked, with no browser console warnings or errors observed.
  - Updated the README and Chinese publishing guide with the live links, team instructions and verification limits. The browser check did not cover a complete 20-card career or a physical phone; existing logic integration tests cover full careers and second-round inheritance. Placeholder story and art remain in place.
- Human decisions: the user requested the schedule's GitHub repository and shareable demo deliverable. The team still needs to supply final story and art, confirm balancing and ending rules, and complete physical-phone and full browser playthrough checks.

## 2026-10-31 — Metallic landmarks, optional guide and ending references (Codex)
- Asked: distinguish four Boss tiles with metallic red, green, blue and purple, Creative Director with silver and the finish with gold; build an optional recurring NPC rulebook for the team's dialogue; show theory and citations on the back of ending cards.
- Done:
  - Applied static metallic backgrounds to the six special spaces, preserving their identity after visits. The shared start/finish remains gold when its label becomes a hidden question mark. Added visit indicators without changing the path, stats or game rules.
  - Added an optional guide beside the board and before choices, with an expandable rulebook, saved hide/show preference and compatibility with existing saves. Created guide.csv and guide.json for writers, plus a portrait asset mapping. Card-specific dialogue is intentionally blank; the current general text only explains navigation.
  - Unified Theory and References on ending and gallery card backs, preserving multiline citations from the existing CSV. Data checks, the production build and all 55 tests passed. Published to the existing GitHub Pages site; verified metallic landmarks, guide hide/show and refresh persistence, optional rulebook content, a five-card route to E03, and Theory/References flips on both the ending screen and Gallery. Verified usable mobile cards at 390 × 844 and observed no console warnings or errors. Adjusted centre spacing for shorter desktop windows so the Next button stays within the board centre. Physical-phone and complete-career browser testing remain team checks.
- Human decisions: the requested metallic treatment supersedes the previous flat-only styling for these six spaces. Writers will supply guide dialogue, context and verified references; the designer will add the NPC portrait. No new character art or citations were generated.

## 2026-10-31 — Genderpoly naming and immediate Boss exits (Codex)
- Asked: name the game Genderpoly and the company FreeDOM; show the ending card immediately when a Boss's actual numerical check fails; require passing The Ideal Worker and becoming Creative Director before Chapter 4.
- Done:
  - Updated the authoritative specification to v0.5 and the current README, content guide and project name. Distinguished the game title/header from the company name in the board centre, with display names supplied by copy.json.
  - Documented the immediate Boss-failure ending flow, the retained Creative Director promotion scene, and where writers should place failure-ending text. Preserved the metallic landmarks, optional guide and theory/reference card-back requirements.
  - Implemented immediate Boss exits and an explicit promotion gate, including migration of older failed-result saves without duplicate career/gallery entries. All 61 tests, data validation and production build passed. Initial online verification exposed cached old copy.json data; added a content revision to data requests plus revalidation, so a new build requests its updated text files.
  - Kept historical AI records and the original root specification intact. The repository/site address, storage identifiers, numerical defaults and The System's existing no-fail behavior remain unchanged.
  - Published the changes and cache fix to the existing GitHub Pages site. Verified both new names; a five-choice female route ending immediately at E03 after the Gatekeeper, including refresh; a complete 20-card career reaching E06 through Ideal Worker, the mandatory Creative Director scene, and Chapter 4; and refresh preserving the promotion scene. No browser warnings/errors were observed after the fix. Saved screenshots of the board, direct ending and promotion for review.
- Human decisions: Genderpoly is the game name; FreeDOM is the company name with that capitalization. A genuine failed Boss check ends the career without a result-screen Continue step. The promotion scene remains mandatory before Chapter 4, and no new failure rule is introduced for The System.
