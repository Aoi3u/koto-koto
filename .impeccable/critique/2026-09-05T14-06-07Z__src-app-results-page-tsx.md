---
target: 結果ページ(src/app/results/page.tsx)
total_score: 22
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 3
target_identity: 'file:/home/miu/hobby/webDev/koto-koto/src/app/results/page.tsx'
target_fingerprint: 'sha256:ced61cb01c7a270afee86360285443db29886840eda7a8624939db5603c05584'
target_path: /home/miu/hobby/webDev/koto-koto/src/app/results/page.tsx
timestamp: 2026-09-05T14-06-07Z
slug: src-app-results-page-tsx
---

Method: dual-agent (A: a3d3303457c45fd30 · B: a5425f8ddd5931667)

## Design Health Score

| #         | Heuristic                         | Score     | Key Issue                                                                                                                                                   |
| --------- | --------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status       | 2/4       | Stale-while-revalidate rankings cache updates silently; loading is plain text, no skeleton                                                                  |
| 2         | Match Between System & Real World | 3/4       | Mostly natural voice; "50 rows" was data-table jargon                                                                                                       |
| 3         | User Control and Freedom          | 3/4       | Free-flowing filters; the custom dropdown had no Escape-to-close, unlike the settings menu's own convention                                                 |
| 4         | Consistency and Standards         | 2/4       | Rankings rows used `rounded-md` vs History's `rounded-lg`; rank 1/3 used hardcoded Tailwind medal colors, breaking the seasonal system used everywhere else |
| 5         | Error Prevention                  | 3/4       | No free-text input; both filters are constrained dropdowns                                                                                                  |
| 6         | Recognition Rather Than Recall    | 2/4       | Grade letters/kanji titles and tie-ranking were never explained in-context                                                                                  |
| 7         | Flexibility and Efficiency        | 2/4       | Session-scoped rankings cache is a real accelerator; no "jump to my rank" despite `isSelf` already being tracked                                            |
| 8         | Aesthetic and Minimalist Design   | 3/4       | Clean glass/glow system; the hardcoded medal colors were the one foreign element                                                                            |
| 9         | Error Recovery                    | 1/4       | "Failed to load history/rankings" had no retry button                                                                                                       |
| 10        | Help and Documentation            | 1/4       | No legend for grades/ties; formula tooltips were hover-only, unreachable by keyboard                                                                        |
| **Total** |                                   | **22/40** | **Acceptable**                                                                                                                                              |

All ten heuristics apply (mixed Operate/light-Read surface); none scored n/a.

## Design Specificity Verdict

**LLM assessment:** Mostly authored for Koto-Koto — the grade+kanji-title pairing ("SSS+ 一界", "S+ ・ Pebble (小石)"), the seasonal glow on "Records," and the `layoutId`-animated tab indicator are unmistakably this product. The one lapse: `RankingsList.tsx` hardcoded literal Tailwind gold/bronze (`bg-yellow-700/20`, `bg-orange-700/20`) for rank 1/3, independent of the season — exactly the generic "leaderboard" visual language DESIGN.md's Tinted Border Rule exists to prevent, and the one place the app partially reverts to a stock component.

**Deterministic scan:** Static scan found 8 advisory findings (three `text-[9px]` labels below the documented 11px floor, an undocumented plain-white card border, a `12px` chart-tooltip font off the ramp, an undocumented `#fff` stroke color, and a `CustomSelect` border that's actually a documented default). Full-browser scan on both tabs found `kicker-above-heading`/`dark-glow`/`low-contrast` on the "Records" heading (all confirmed false positives against DESIGN.md's own Label/kicker and Seasonal-glow vocabulary, consistent with every other page scanned this pass), `buried-raster` (the shared, undocumented-either-way noise texture), a `content-hidden-at-rest` finding that traces to the hover-only Zen Score/WPM tooltips (a real, if minor, keyboard-accessibility gap rather than a broken reveal animation), and 4× `gray-on-color` on the rankings tab (Subtle Gray text over a warm seasonal-glow composite — sanctioned color, unclear compositing case, left as an open question rather than a confirmed defect).

**Visual overlays:** No native browser/injection tool available; static headless screenshots captured as fallback evidence for both tabs (527KB history, 611KB rankings — both confirmed real renders).

## Overall Impression

A page that gets the product's own voice right everywhere except the one place most tempted to borrow a generic "leaderboard" pattern — and, underneath that, a UI that visually leads with WPM in every row while the product's own differentiator (Zen Score) reads as the secondary number. Neither is a big rebuild; both are the kind of drift that accumulates when a shared component gets extended under time pressure.

## What's Working

1. **The grade+kanji-title pairing** is small but real product character no generic typing site would produce, rendered consistently in Zen Old Mincho.
2. **The seasonal glow on "Records" and the animated tab indicator** are exactly the "expressiveness through one channel" DESIGN.md calls for.
3. **The rankings session cache** is a genuinely thoughtful, invisible efficiency touch — repeat filter switches within a session are instant.

## Priority Issues

**[P1] Hardcoded medal colors broke the seasonal color system.**
_Why it matters:_ Rank 1/3 used literal `yellow-700`/`orange-700`, independent of the active season — the one visible exception to a rule DESIGN.md states specifically so four unrelated hues can share one interface.
_Fix:_ Recolor rank 1/2/3 using `palette.primary`/`secondary`/`accent` at low alpha.
_Status:_ **Fixed this pass** — `RankingsList.tsx`.

**[P1] Zen Score was visually subordinate to WPM despite being the stated primary metric.**
_Why it matters:_ PRODUCT.md frames Zen Score as the fair, differentiating measure; the UI's own type scale (WPM large, Zen Score small) said the opposite in every row of both History and Rankings.
_Fix:_ Make Zen Score the large/lead number per row; demote WPM.
_Status:_ **Fixed this pass** — `HistoryList.tsx`, `RankingsList.tsx` (Zen Score is now always visible; WPM is hidden on the smallest breakpoint instead).

**[P1] Three labels sat below the documented 11px legibility floor.**
_Why it matters:_ `text-[9px]` in two tooltip breakdown lines and one rank-title caption directly violates the 11px Floor Rule this project already established (and fixed elsewhere) earlier this pass.
_Fix:_ Raise to `text-[11px]`.
_Status:_ **Fixed this pass** — `HistoryList.tsx`, `RankingsList.tsx`.

**[P2] No in-context explanation of grades, ties, or why History can be empty.**
_Why it matters:_ A Word-Endless-only player sees an empty History tab and reasonably reads it as a bug, not the documented "Endless is never saved" behavior; tied ranks look like an error with no visual explanation.
_Fix:_ Clarify the empty-History copy; add a one-line tie-ranking note on the Rankings tab.
_Status:_ **Fixed this pass.**

**[P2] Error states had no recovery path.**
_Why it matters:_ "Failed to load history/rankings" rendered as bare text with no way to retry short of switching tabs or reloading.
_Fix:_ Add a retry action wired to the existing `fetchHistory`/`fetchRankings` callbacks.
_Status:_ **Fixed this pass.**

## Secondary fixes (from Assessment B, real DESIGN.md drift, folded into this pass rather than raised as separate top-5 issues)

- `HistoryStatsGrid`'s hero card used a plain white border instead of the documented seasonal-tinted Card border — fixed.
- A dead `text-md` Tailwind class (same historical bug pattern as the title screen and auth page) on the hero card's rank line — fixed to `text-base`.
- Chart `activeDot` stroke used raw `#fff` instead of the documented off-white token — fixed to `#efefef`.
- Rankings rows used `rounded-md` while History rows used `rounded-lg` — unified to `rounded-lg`.
- The "Performance" kicker's `tracking-[0.4em]` exceeded the documented Label range (`0.2em`–`0.3em`) — brought to `0.3em`.
- "50 rows" → "Top 50" (plain-language voice instead of data-table jargon).
- `CustomSelect` had no Escape-to-close (inconsistent with the app's own settings-menu convention) and no `aria-haspopup`/`aria-expanded`/listbox roles — added.
- Zen Score/WPM formula tooltips were hover-only (`group-hover`), unreachable by keyboard; the trigger is now a real `<button>` with a descriptive `aria-label` and a `focus-within` reveal, so the formula reaches both keyboard and screen-reader users, not just mouse hover.

## Persona Red Flags

**Alex (Power User):** Previously: no "jump to my rank" despite `isSelf` already being tracked server-side; filter state wasn't in the URL, so a refresh silently reset Period/Show/Mode. The URL/bookmarking gap remains unaddressed this pass (noted below); the keyboard-tooltip and Escape-to-close gaps are now fixed.

**Sam (Accessibility-Dependent):** Previously: the dropdown announced only "Period: All time, button" with no indication it opens a menu, and the Zen Score/WPM tooltips were completely unreachable — Sam never learned what the numbers meant. Now: `aria-haspopup`/`aria-expanded`/`role="listbox"` on the dropdown, and both tooltips reachable via keyboard focus with a full `aria-label` describing the formula and the actual numbers, not just a visual reveal.

**Riley (Stress Tester):** Tied ranks now carry an explanatory caption instead of reading as a bug; a failed fetch now offers a real retry action instead of a dead end. The silent-failure case for a background rankings revalidation over cached data (noted in the original critique) remains as designed — deliberately not surfaced, to avoid replacing a working cached view with an error over a transient background failure — but is now at least paired with a working retry path for the first-load failure case.

## Minor Observations / Deferred

- Rankings filter state (Period/Show/Mode) still isn't reflected in the URL, so it can't be bookmarked/shared and resets on refresh — a real Alex-persona gap, deferred as a larger routing change rather than folded into this pass.
- The `gray-on-color` findings (Subtle Gray over a warm seasonal-glow composite, rankings tab) remain unresolved — DESIGN.md doesn't address this specific compositing case either way; left as an open question for a future `/impeccable audit` rather than guessed at here.
- `HistoryTrendChart`'s tooltip `fontSize: 12px` is off the documented ramp but doesn't violate the 11px floor; left as-is per "don't fix what isn't broken."

## Questions to Consider

1. Now that Zen Score leads visually, does WPM still deserve second billing over Accuracy, or would leading with Accuracy (the other input to the "honest score") tell a clearer story?
2. Filter state isn't bookmarkable — is a shareable leaderboard URL (`?timeframe=week&mode=runs`) worth a follow-up, given Alex is exactly the persona most likely to want it?
3. The background-revalidation-failure-stays-silent behavior in `fetchRankings` was left untouched — is silent-over-cached the right call long-term, or should it at least mark the view as possibly stale?
