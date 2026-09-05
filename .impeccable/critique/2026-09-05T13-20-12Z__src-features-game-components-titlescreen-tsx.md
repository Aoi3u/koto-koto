---
target: 'タイトル画面(TitleScreen.tsx / http://localhost:3000)'
total_score: 30
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
target_identity: 'file:/home/miu/hobby/webDev/koto-koto/src/features/game/components/TitleScreen.tsx'
target_fingerprint: 'sha256:7aa32e39f091d5d46defddd68dd9f8c0cef64d8e326537a86460e002dd824e71'
target_path: /home/miu/hobby/webDev/koto-koto/src/features/game/components/TitleScreen.tsx
timestamp: 2026-09-05T13-20-12Z
slug: src-features-game-components-titlescreen-tsx
---

Method: dual-agent (A: a4943fa4c27472163 · B: ac7b35ed8fe645486)

## Design Health Score

| #         | Heuristic                         | Score     | Key Issue                                                                                                                      |
| --------- | --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1         | Visibility of System Status       | 3/4       | Mode switch/caption update instantly, but loading/error text swaps have no `aria-live`                                         |
| 2         | Match Between System & Real World | 3/4       | "PRESS ENTER TO START" is honest; "LOADING PROBLEMS..." leaks internal jargon and reads like an error                          |
| 3         | User Control and Freedom          | 4/4       | Mode toggle is instantly reversible, no modal, no commitment before Enter                                                      |
| 4         | Consistency and Standards         | 3/4       | Matches DESIGN.md's own rules well; `text-md` (not a real Tailwind class) silently no-ops in TitleScreen.tsx and AppHeader.tsx |
| 5         | Error Prevention                  | 4/4       | Two-choice control, nothing to input-validate                                                                                  |
| 6         | Recognition Rather Than Recall    | 4/4       | Mode/consequence/action all visible text, no hidden menus                                                                      |
| 7         | Flexibility and Efficiency        | 2/4       | Enter-to-start is a real accelerator, but mode selection isn't persisted and has no keyboard alternative to the mouse          |
| 8         | Aesthetic and Minimalist Design   | 4/4       | Single focal composition matches the "lantern in a dark room" North Star                                                       |
| 9         | Error Recovery                    | 2/4       | `errorMessage` is a bare `<p>`, no icon/retry/`role="alert"`                                                                   |
| 10        | Help and Documentation            | 1/4       | No on-screen explanation of what either mode requires; `/about` is two clicks deep in Settings                                 |
| **Total** |                                   | **30/40** | **Good**                                                                                                                       |

## Design Specificity Verdict

**LLM assessment:** The screen is authored for Koto-Koto, not a template with a logo swapped in — but the authorship lives in decoration and copy, not structure or behavior. The mode captions ("10 sentences • result saved" vs. "infinite words • no save") encode the product's honesty principle directly at the decision point, which is genuinely specific. The wordmark gradient, the haiku, and the seasonal glow all route through the season/time engine PRODUCT.md calls the actual product. But the composition itself — centered logo, subtitle, tagline, two-way toggle, one CTA — is the single most common hero-section skeleton in software. Nothing about the _arrangement_ would tell you this is a typing game rather than a meditation timer or a note app.

**Deterministic scan:** The full-browser scan (`impeccable detect` against the live render) found 8 findings, none of them structural — all typography/color: two `gradient-text` hits (both trace to the same `<h1>` wordmark), two `dark-glow` hits (the CTA's text-shadow and, separately, AppHeader's wordmark text-shadow — two distinct elements, same rule), one `wide-tracking` (0.10em on the "10 sentences..." caption), one `low-contrast` (the wordmark's gradient, 2.0:1 minimum against a 3:1 large-text floor), one `buried-raster` (the global 0.03-opacity noise texture), and two `clipped-overflow-container` (the game-surface wrapper and `SeasonalParticles`'s fixed layer). Cross-checked against DESIGN.md: the two `dark-glow` hits and both `gradient-text` hits match the _documented, named_ "Seasonal glow" shadow vocabulary and the Typography Hierarchy's own note that display text is "often gradient-filled or glow-shadowed" — these are deliberate system choices, not accidental AI-tells, and the detector's "slop" label is a false positive against this project's own spec. The `clipped-overflow-container` pair are both decorative, viewport-bound particle/ambience layers with no tooltip or popover trapped inside — also benign. Two findings are **not** excused by any documented rule and stand as real, live issues: the `low-contrast` measurement on the wordmark's dark gradient stop, and the `wide-tracking` hit on body-tier sentence copy (DESIGN.md's hierarchy reserves wide tracking for the Label tier, not full sentences).

**Visual overlays:** No native browser/injection tool was available this session; Assessment B substituted a static headless screenshot as fallback evidence (captured successfully, 875KB, confirms the page painted real content). No user-visible in-browser overlay exists for this run.

## Overall Impression

A disciplined, restrained screen that faithfully executes its own documented design system — and undersells its own biggest asset in the process. The one thing a competitor can't copy (the live season/time engine) is present but whisper-quiet at 30% particle opacity and a one-line untranslated haiku, while the one thing every visitor needs to find (the Start action) is the quietest line of text on the page. The gap between "restrained" and "the CTA has less visual weight than a caption above it" is where this screen loses points, not the atmosphere itself.

## What's Working

1. **The mode captions operationalize the product's honesty principle at the exact point of decision** — "10 sentences • result saved" vs. "infinite words • no save" tells the user the real stakes before they commit. This is the single best piece of design-for-this-product on the screen, and it's copy, not chrome.
2. **Restraint matches the stated North Star faithfully** — one serif voice, no drop shadows, no competing chrome; a disciplined execution of DESIGN.md's "glass over void" system, confirmed by the detector finding zero structural anti-patterns.
3. **Enter-to-start is genuinely global and the segmented control's ARIA is solid** (`role="group"`, `aria-label`, `aria-pressed`) — a keyboard user never has to tab through the header just to reach the CTA.

## Priority Issues

**[P1] The CTA doesn't visually lead.**
_Why it matters:_ "PRESS ENTER TO START" is `text-sm`, no border, no fill at rest (the fill only appears at 10% opacity on hover) — it has less visual weight than the caption line above it. A first-timer scanning for the one clickable thing sees the loudest element on the page (the wordmark) isn't clickable, and the actual action is the quietest line on screen.
_Fix:_ Give it the documented `button-pill-primary` baseline (`bg-white/10` at rest, not hover-only) so it reads as a control, not a caption.
_Suggested command:_ `/impeccable layout`

**[P1] "LOADING PROBLEMS..." reads as an error, not a loading state.**
_Why it matters:_ Internal terminology ("problem" = a sentence/word exercise) leaked verbatim into user-facing copy. At the exact moment a user is uncertain whether something is working, the word "problems" reads like a crash message — this fights the calm framing the product commits to.
_Fix:_ Rename to "PREPARING..." or "LOADING SENTENCES...".
_Suggested command:_ `/impeccable clarify`

**[P2] Loading/error states are invisible to assistive tech.**
_Why it matters:_ `errorMessage` renders as a plain `<p className="text-red-300">` with no `role="alert"`/`aria-live`, and the haiku `<p>` has no `lang="ja"`, so a screen reader attempts to pronounce Japanese text in its default voice. This is a regression against the project's own stated accessibility baseline (PRODUCT.md commits to maintaining it on every new surface).
_Fix:_ Wrap `errorMessage` in `role="alert" aria-live="polite"`; add `lang="ja"` to the haiku.
_Suggested command:_ `/impeccable harden`

**[P2] The wordmark's gradient dips below AA-large contrast at its dark end.** _(Detector-confirmed, not excused by DESIGN.md)_
_Why it matters:_ The `low-contrast` finding measured 2.0:1 minimum against a 3:1 large-text floor on the "Koto-Koto" `<h1>`'s gradient-filled text. Unlike the glow/gradient-as-decoration choice itself (which DESIGN.md documents and defends), no documented rule sets or excuses a target contrast for the gradient's darkest stop — this is a live, unresolved measurement, not a style disagreement.
_Fix:_ Raise the gradient's dark endpoint (or its underlying seasonal-primary floor) until the minimum-pixel contrast clears 3:1, without flattening the gradient's character.
_Suggested command:_ `/impeccable colorize`

**[P2] No persisted mode preference, no discoverable help entry point on this screen.**
_Why it matters:_ `selectedMode` resets to Classic on every load — a daily Word Endless player re-clicks the toggle every session for no reason. Neither mode explains what it actually requires before commitment, and the only route to `/about` is two clicks into the Settings menu, unsignposted from here.
_Fix:_ Persist last-used mode client-side; add a small, unobtrusive help affordance near the mode picker.
_Suggested command:_ `/impeccable onboard`

## Persona Red Flags

**Jordan (First-Timer):** Lands on the page, sees the tagline, the huge wordmark, an untranslated haiku, a CLASSIC/WORD ENDLESS toggle with one caption line, and a quiet "PRESS ENTER TO START." Red flags: nothing explains what either mode requires beyond sentence/word count; the haiku is inert decoration to anyone who can't read Japanese (a real share of the confirmed audience per PRODUCT.md); the button's lack of at-rest fill/border means it may not register as clickable at all; "How to play" is nowhere visible from this screen.

**Sam (Accessibility-Dependent):** Tabs through four header icons, the segmented control (solid ARIA), then the Start button — and, thanks to the global Enter handler, doesn't even need to. Red flags: a load failure is total silence (no `aria-live`); the haiku has no `lang="ja"` so a screen reader mispronounces it in its default locale; the CTA's hover-only tracking-expand and background tint have no `:focus-visible` equivalent, so keyboard users get zero feedback on focus.

**Alex (Power User):** Wants to land and be typing in under two seconds. Red flags: mode selection is never remembered, forcing a repeat click before every session regardless of yesterday's choice; switching modes has no keyboard path at all (no arrow-key toggle on the segmented control), forcing a mouse touch in an otherwise keyboard-first product; there's no "resume last mode" shortcut.

## Minor Observations

- `text-md` (not a real Tailwind utility) is used on the tagline (`TitleScreen.tsx`) and the header wordmark link (`AppHeader.tsx`); both silently fall back to inherited size instead of an intended one. Low visible impact today, but it's the kind of silent no-op that breaks the next deliberate size change.
- The "10 sentences • result saved" / "infinite words • no save" caption carries `tracking-widest` (0.10em) — DESIGN.md's own hierarchy reserves that treatment for the Label tier, not full-sentence body copy; a small, real deviation from the documented system.
- `font-inter` on the tagline resolves through a self-referential CSS variable to the plain `sans-serif` fallback — matches DESIGN.md's own documented caveat about `font-inter`, not a new bug, but it compounds with the `text-md` issue on the same element.
- Neither screenshot (desktop 1280×900, mobile 390×844) shows any of the 15 seasonal particles — plausibly a capture-timing artifact (randomized entry delay up to 5s), but worth a live sanity check given particles are the literal embodiment of the stated differentiator.
- The two `clipped-overflow-container` detector hits (the game-surface wrapper, `SeasonalParticles`'s fixed layer) are both decorative, viewport-bound ambience with nothing (tooltip/popover) trapped inside — false positives against this project's actual usage.
- `red-300` on `errorMessage` is the only non-off-white text color on this screen — a reasonable exception to DESIGN.md's "One Voice Rule," but the rule as written doesn't explicitly carve one out for error states.

## Questions to Consider

1. The seasonal system is the one thing a competitor can't copy — should the title screen prove that in the first second (more immediate particle presence, explicit "now: 紅葉散りゆく秋" framing), rather than asking a first-time visitor to notice it passively?
2. The CTA is currently the quietest element on the page. Is that restraint intentional — letting the wordmark and season carry the emotional weight — or should the one actionable thing on screen outweigh the labels around it?
3. Would persisting mode preference across sessions undercut the calm/no-pressure framing, or would it simply remove a pointless click for returning users?
