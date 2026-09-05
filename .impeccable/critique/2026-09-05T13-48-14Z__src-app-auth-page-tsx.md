---
target: 認証ページ(src/app/auth/page.tsx)
total_score: 20
max_score: 40
na_heuristics:
p0_count: 1
p1_count: 3
target_identity: 'file:/home/miu/hobby/webDev/koto-koto/src/app/auth/page.tsx'
target_fingerprint: 'sha256:636d77c149c6818060f91246719c5b78eec9fd68187c4a2c6fcfd5d13c62250d'
target_path: /home/miu/hobby/webDev/koto-koto/src/app/auth/page.tsx
timestamp: 2026-09-05T13-48-14Z
slug: src-app-auth-page-tsx
---

Method: dual-agent (A: aad9e5fee73fa0613 · B: ab1442e5e23ed82cc)

## Design Health Score

| #         | Heuristic                           | Score     | Key Issue                                                                                                                                           |
| --------- | ----------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status         | 3/4       | "Processing…" states exist, but no inline validation feedback while typing                                                                          |
| 2         | Match Between System and Real World | 3/4       | Copy is warm and on-brand, but one path leaks a raw internal string ("CredentialsSignin")                                                           |
| 3         | User Control and Freedom            | 2/4       | "Back to game"/"Cancel" work, but no forgot-password path anywhere                                                                                  |
| 4         | Consistency and Standards           | 3/4       | Tight adherence to shared primitives and Named Rules; the toast red/green pair is an undocumented second accent language                            |
| 5         | Error Prevention                    | 1/4       | The 4-part password policy is enforced server-side and shown nowhere in the UI                                                                      |
| 6         | Recognition Rather Than Recall      | 1/4       | Same root cause — the requirement was never surfaced to recall in the first place                                                                   |
| 7         | Flexibility and Efficiency          | 3/4       | Password-manager autofill wired up correctly; Google OAuth is a real fast path                                                                      |
| 8         | Aesthetic and Minimalist Design     | 4/4       | Single centered card, one focal decision, glow-not-lift depth                                                                                       |
| 9         | Error Recovery                      | 0/4       | Anti-enumeration API always returns 200, defeating the client's `res.ok` check; failures fall through to a raw NextAuth error code toasted verbatim |
| 10        | Help and Documentation              | 0/4       | No help link, tooltip, or password-rule hint anywhere                                                                                               |
| **Total** |                                     | **20/40** | **Acceptable (bottom of band)**                                                                                                                     |

All ten heuristics genuinely apply (this is a task/Operate surface, not Persuade/Experience) — none scored n/a.

## Design Specificity Verdict

**LLM assessment:** Not an interchangeable generic auth form. `fieldBaseClassName` encodes DESIGN.md's Input spec verbatim (`rounded-2xl border-white/10 bg-white/5`, the inset top-highlight, `font-zen-old-mincho`), focus state is wired to `palette.primary`/`palette.glow` rather than a hardcoded blue ring, and the copy ("Welcome back. Your results are waiting." / "Create a profile and start with a clean slate.") speaks in the product's own calm-practice voice. The "Back to game" link materially expresses Product Principle 4 (accounts optional, never gating) rather than just stating it. Where it slips into generic-template territory is entirely the error/edge-case layer: a raw NextAuth error code surfacing verbatim, and an invisible password policy, are default-Next.js-starter quality, not authored.

**Deterministic scan:** Both CLI (static, 0 findings — expected, limited coverage of runtime-composed Tailwind/inline styles) and full-browser scans ran clean of anything structural. The full-browser scan's three findings are all false positives or non-actionable against this project's own documented system: `kicker-above-heading` ("Account" over "Sign in") matches DESIGN.md's own Typography Hierarchy, which names "kickers" as a first-class, intentional use of the Label type role — not a generated artifact. `dark-glow` (`#5f3717` text-shadow) doesn't even originate in this page's own source; it's `AppHeader.tsx`'s wordmark glow (mounted globally in the root layout), and it matches DESIGN.md's documented "Seasonal glow" shadow vocabulary and "Glow-Not-Lift Rule" exactly (20px, inside the stated 15–30px range, on a heading). `buried-raster` (the global 0.03-opacity noise overlay) is used identically across five pages and isn't auth-specific; DESIGN.md is silent on it either way, so it's reported as an open question rather than excused.

**Visual overlays:** No native browser/injection tool was available this session; a static headless screenshot was captured as fallback evidence (518KB, confirms real rendered content). No in-browser overlay exists for this run.

## Overall Impression

A form that looks and feels like the rest of the app — and then, the moment anything goes wrong, drops the user into default-template failure handling with zero relationship to the calm, honest voice everywhere else on the page. The gap here isn't visual; it's that an intentional security decision (the anti-enumeration 200-always response) was never connected to a client-side story for what the user should see when it silently doesn't work.

## What's Working

1. **System fidelity, not a bolted-on form.** The input styling and focus treatment reproduce DESIGN.md's spec exactly, including the seasonal Focus Glow — visually inseparable from the rest of the app.
2. **Voice-accurate copy on the happy path.** "Welcome back. Your results are waiting." and "Create a profile and start with a clean slate." are specific and on-brand, not boilerplate.
3. **The optional-accounts principle is structural, not just stated.** "Back to game" sits above the fold in every mode, reinforcing Product Principle 4 materially.

## Priority Issues

**[P0] Register failures surface as a raw NextAuth error code, because the anti-enumeration API design defeats the client's own success/failure check.**
_Why it matters:_ `register/route.ts` deliberately always returns HTTP 200 with the same generic message (weak password, taken email, or real success — indistinguishable, by design, to prevent user enumeration). The client's old code gated its error path on `!res.ok`, which could never fire, so any real failure fell through into `signIn('credentials', …)`, which then failed and surfaced NextAuth's literal `"CredentialsSignin"` string in a toast. A first-time user typing an ordinary (but policy-invalid) password would see that code and nothing else.
_Fix:_ Validate the password policy client-side before ever calling the endpoint (making the weak-password case unreachable), and translate any residual sign-in failure into an honest, non-technical message in the same conditional voice the register endpoint already uses, instead of surfacing the raw provider string.
_Status:_ **Fixed this pass** — see `getPasswordRequirementError`/`describeAuthError` in `src/app/auth/page.tsx`.

**[P1] The password policy was completely invisible in the UI.**
_Why it matters:_ The policy (≥12 chars, uppercase, digit, symbol) appeared nowhere near the Password field. Root enabler of the P0 above; independently the reason Error Prevention and Recognition-vs-Recall heuristics scored at the bottom of the scale.
_Fix:_ Persistent helper text under the Password field in register mode, at the documented 11px Label floor.
_Status:_ **Fixed this pass** — `PASSWORD_REQUIREMENTS_HINT`, wired via `aria-describedby`.

**[P1] Form inputs had no label association, and toasts had no live-region announcement.**
_Why it matters:_ None of the three labels used `htmlFor`/`id`, so a screen reader is likely to announce unlabeled edit fields rather than "Email, edit text." The toast container had no `role`/`aria-live`, so a screen-reader user gets zero signal in either direction after submitting — the form appears to silently do nothing.
_Fix:_ Pair every label with its input via `htmlFor`/`id`; add `role="status" aria-live="polite"` to the toast container.
_Status:_ **Fixed this pass** — `src/app/auth/page.tsx` (labels), `src/components/ToastProvider.tsx` (toast container). The latter fix applies to every page that uses toasts, not just Auth.

**[P2] No loading state for session resolution.**
_Why it matters:_ The component only branched on `authenticated` vs. else; there was no explicit handling for the intermediate `status === 'loading'`, so a returning signed-in user likely saw a flash of the signed-out login form before it swapped to Profile.
_Fix:_ Render a neutral skeleton while `status === 'loading'` instead of defaulting to the login form.
_Status:_ **Fixed this pass.**

**[P1] No password-recovery path exists anywhere on the page.**
_Why it matters:_ A wrong-password login (or a registration that silently failed because the email was taken) has no in-product resolution — no "Forgot password?" link, no reset flow. The user's only options are to retry blindly or leave.
_Fix:_ Add a "Forgot password?" link wired to an email-based reset flow.
_Status:_ **Not fixed this pass — deferred.** This requires new backend infrastructure (a reset-token flow and transactional email sending) that doesn't exist yet anywhere in the app; building it ad hoc inside a polish pass would be a feature addition disguised as polish. Recommend scoping it as its own feature via `/impeccable shape`.

## Persona Red Flags

**Jordan (First-Timer) — registering with an ordinary password:** Previously: types a password like `mypassword1`, clicks "Join," sees "Processing…" then an unreadable "CredentialsSignin" toast with no field-level indication of what went wrong. Now: the same password is rejected immediately, client-side, with a specific message ("Password must contain at least one digit.") before any network round-trip — and the persistent hint under the field means many users won't hit the error at all.

**Sam (Accessibility-Dependent, screen reader + keyboard):** Previously: unlabeled fields, and a toast that appears/disappears with no announcement — after submitting, nothing changes from assistive tech's perspective. Now: every field has a proper accessible name via `htmlFor`/`id`, the password hint is wired via `aria-describedby`, and the toast region announces its content via `role="status" aria-live="polite"`.

**Riley (Stress Tester) — probing edge cases:** Previously: weak password, duplicate email, and a valid-but-already-registered email all produced the identical undifferentiated "CredentialsSignin" toast. Now: weak password is caught before submission with a specific reason; a genuinely taken email still can't be distinguished from other failures (by design, for anti-enumeration), but now reads as an honest, actionable nudge ("try signing in instead") rather than a bare error code. Riley's Google-OAuth-cancel scenario (no `useSearchParams()`/callback-error handling) remains unaddressed this pass — noted as a minor observation below, not one of the five priority issues.

## Minor Observations

- Failed/cancelled Google OAuth round-trips have no dedicated handling (no callback-error query parsing) — a cancelled consent screen likely drops the user back on a blank login form with no explanation. Worth a follow-up pass, not addressed here (kept the scope to the credentials-flow priority issues actually scored above).
- The "SECURE" status chip and the footer "Secure sign-in powered by NextAuth" line make the same trust claim twice in close proximity — could be consolidated in a future pass.
- `handleSubmit`'s `if (loading) return` guard correctly prevents double-submission on rapid double-clicks — confirmed working, not broken under stress testing.
- Toast success/error colors (green/red) are a real, intentional exception to the One Voice Rule — now documented in DESIGN.md's Colors section rather than left as an undocumented system leak.

## Questions to Consider

1. Now that a weak password can't reach the server at all, is there any remaining path where "CredentialsSignin" (or another raw provider code) could still surface to a user? Worth a quick audit of the Google-OAuth callback-error case noted above.
2. The password policy is real and non-negotiable — should the same glow-forward focus treatment used elsewhere show the policy being satisfied live, character by character, rather than as static hint text?
3. Forgot-password was deferred as out-of-polish-scope — is that the right call, or should it be prioritized as the next feature given how directly it affects the "honest practice, honest score" brand commitment when a real user gets locked out?
