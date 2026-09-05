# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who wants focused, repeatable Japanese typing practice — Japanese-language learners building romaji→kana input skill, and fluent/native Japanese speakers looking for a calm, meditative typing session. The product deliberately does not skew toward either group: gameplay UI stays English-labeled and input-flexible (`shi`/`si`, `tsu`/`tu`, etc.) so both can play the same modes without a "learner mode."

## Product Purpose

A Japanese typing game that uses a shifting seasonal atmosphere to induce a flow state, not just to drill input speed. Success for a session is a calm, repeatable practice loop — type, watch the room's light and color answer, see an honest score — rather than maximizing time-on-app or streak pressure.

## Positioning

The differentiator confirmed with the product owner: the 花鳥風月 (four-season) × 移ろい (time-of-day) ambiance system _is_ the flow state, not a skin over a generic typing drill. A competing typing site can copy a leaderboard or a WPM counter; it cannot truthfully copy a game where the whole room's color, glow, and particles shift with the real season and the real hour, cross-fading over a full second rather than cutting.

## Operating Context

A solo desktop/laptop session at a physical keyboard, mechanical-switch sound feedback selectable from 13 profiles. Two modes: **Classic** (a fixed 10-sentence set; the result is saved to history when signed in) and **Word Endless** (a continuous stream of words; tallied locally only, never saved). Sign-in is optional — Google OAuth or email/password via NextAuth — and only unlocks saved history and ranking participation; the core typing experience never requires an account.

## Capabilities and Constraints

- **Web only, desktop/keyboard-first by design.** Mobile/touch is out of scope, not a gap: `MobileBlocker` deliberately gates entry below a device-type threshold, because the premise (a physical mechanical keyboard, its sound, real key travel) doesn't translate to a touchscreen.
- **Romaji→kana engine:** a trie-based, longest-match converter that accepts common input variants (`shi`/`si`, `tsu`/`tu`, `c`/`k`, sokuon/ん handling) so typing feels natural rather than pedantically strict.
- **Scoring:** Zen Score = WPM × Accuracy ÷ 100; rankings use competition-style tie ranking (equal scores share a rank). Game-result submissions are server-side plausibility-checked (elapsed time vs. keystrokes vs. reported WPM) so the leaderboard stays a real skill measure, not a spoofable one.
- **Accessibility baseline (established, not optional going forward):** `prefers-reduced-motion` drops looping/ambient animation while keeping state-carrying color/opacity cues; `prefers-reduced-transparency` drops `backdrop-blur`; keyboard focus has a visible, shape-preserving `:focus-visible` ring; auth and write endpoints are rate-limited.

## Brand Commitments

The name **Koto-Koto** (コトコト — the onomatopoeia for a light tapping/clacking sound) and the tagline **"Japanese Zen Typing" / "A digital Zen garden typing experience"** are fixed. The season × time-of-day visual system is itself a brand commitment, not a swappable theme — see `DESIGN.md` for its documented tokens and rules. No other locked visual assets beyond the favicon.

## Evidence on Hand

MIT-licensed; third-party keyboard-sound assets are credited in `THIRD_PARTY_NOTICES.md`. There are no testimonials, case studies, press mentions, or user-count claims on hand — future work must not invent any.

## Product Principles

1. **Ambiance carries the flow, not gamification.** The season/time system is the primary source of engagement; never add addictive mechanics (daily-login nags, guilt-driven streak loss, dark-pattern engagement farming) that would fight the calm framing.
2. **Honest practice, honest score.** Input stays forgiving (romaji variants), but the score and ranking must stay a fair, tamper-resistant measure of real typing skill.
3. **Desktop/keyboard-first, not "not-yet-mobile."** The mechanical-keyboard-sound premise is the reason mobile is blocked, not a resourcing gap — don't quietly reframe this as a TODO.
4. **Optional accounts, never gated core play.** Every mode is fully playable signed out; authentication only unlocks persistence (history, ranking participation).
5. **Bilingual where it's load-bearing, English where it's the interface.** Legal/informational pages carry equal-effect Japanese and English text because the audience is genuinely mixed; gameplay UI itself stays English-labeled by established convention.

## Accessibility & Inclusion

`prefers-reduced-motion` and `prefers-reduced-transparency` support, keyboard focus-visibility, and rate-limited/plausibility-checked write APIs are an established baseline (see Capabilities and Constraints) — maintain them on any new animated, glassy, or write-path surface rather than treating them as a one-off pass.
