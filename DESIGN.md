---
name: Koto-Koto
description: A digital Zen garden typing experience that shifts its palette with the season and the hour.
colors:
  zen-dark: '#1a1a1a'
  off-white: '#efefef'
  subtle-gray: '#d4d4d8'
  spring-primary: '#fbcfe8'
  spring-secondary: '#fce7f3'
  spring-accent: '#ec4899'
  spring-background: '#1a1612'
  spring-text: '#fef3f2'
  spring-glow: 'rgba(251,207,232,0.4)'
  summer-primary: '#67e8f9'
  summer-secondary: '#a5f3fc'
  summer-accent: '#06b6d4'
  summer-background: '#0f1419'
  summer-text: '#f0fdfa'
  summer-glow: 'rgba(103,232,249,0.3)'
  autumn-primary: '#fb923c'
  autumn-secondary: '#fed7aa'
  autumn-accent: '#ea580c'
  autumn-background: '#1c1410'
  autumn-text: '#fef3e2'
  autumn-glow: 'rgba(251,146,60,0.3)'
  winter-primary: '#e0f2fe'
  winter-secondary: '#f0f9ff'
  winter-accent: '#0ea5e9'
  winter-background: '#0a0e14'
  winter-text: '#f8fafc'
  winter-glow: 'rgba(224,242,254,0.2)'
typography:
  display:
    fontFamily: "'Zen Old Mincho', serif"
    fontWeight: 400
    letterSpacing: '-0.01em'
  heading:
    fontFamily: "'Zen Old Mincho', serif"
    fontWeight: 700
    letterSpacing: '0.05em'
  body:
    fontFamily: 'system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 400
  label:
    fontFamily: "'Zen Old Mincho', serif"
    fontSize: '11px'
    letterSpacing: '0.2em'
    fontFeature: 'uppercase'
  numeric:
    fontFamily: 'ui-monospace, monospace'
    fontWeight: 300
rounded:
  control: '9999px'
  card: '16px'
  panel: '12px'
  field: '8px'
spacing:
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  button-pill-primary:
    backgroundColor: 'rgba(255,255,255,0.1)'
    textColor: '{colors.off-white}'
    rounded: '{rounded.control}'
    padding: '14px 24px'
  button-pill-primary-hover:
    backgroundColor: 'rgba(255,255,255,0.18)'
  button-chip:
    backgroundColor: 'transparent'
    textColor: '{colors.off-white}'
    rounded: '{rounded.control}'
    padding: '4px 12px'
  stat-card:
    backgroundColor: 'rgba(255,255,255,0.05)'
    rounded: '{rounded.panel}'
    padding: '16px'
---

# Design System: Koto-Koto

## Overview

**Creative North Star: "The Digital Zen Garden"**

Koto-Koto is a Japanese typing game staged as a quiet, dark room that changes light with the season (花鳥風月 — flower, bird, wind, moon) and the hour (移ろい — passing time). The interface itself stays deliberately plain: a nearly-black stage, one serif wordmark, and glassy translucent panels. All of the system's expressiveness is spent on a single channel — a seasonal accent color that tints glows, borders, and particles — rather than on layout novelty or decorative chrome. The effect is closer to a lantern in a dark room than a dashboard: the room doesn't change shape, only its light does.

Motion follows the same restraint: interactive elements answer a press with an instant, small scale-down (no bounce, no overshoot), and larger surfaces (the settings panel, toasts) enter with a short critically-damped spring rather than a linear fade. `prefers-reduced-motion` drops every looping/ambient animation (particles, pulses, carets) while keeping the state cues that carry meaning.

**Key Characteristics:**

- One neutral, near-black material (translucent white on `#1a1a1a`) carries every screen; color is reserved for the seasonal accent
- Every season × time-of-day combination is a first-class palette, not a filter over one base theme
- Zen Old Mincho (a serif Japanese display face) is the only voice for headings, labels, and the wordmark — there is no separate UI sans-serif in active use
- Pill shapes (`rounded-full`) for anything clickable; rounded rectangles only for containers
- Depth comes from blur + translucency (glass), not from drop shadows

## Colors

The palette is almost monochrome at rest — dark neutral surfaces and off-white text — with a single seasonal accent (`primary` / `secondary` / `accent` / `glow`) that recolors borders, glows, focus rings, and particles for the current season. The accent itself is further dimmed or brightened by the time of day (morning/day/sunset/night) at render time; the four palettes below are each season's daytime values.

### Primary

- **Off-White** (`#efefef`): the one text/icon color used across the entire app, on top of every seasonal background.

### Seasonal accents (rotate automatically; one is active at a time)

- **Spring — Sakura Pink** (`#fbcfe8` primary / `#fce7f3` secondary / `#ec4899` accent, on `#1a1612` background): 花びらの舞う静寂.
- **Summer — Water Cyan** (`#67e8f9` / `#a5f3fc` / `#06b6d4`, on `#0f1419`): 水面に映る涼.
- **Autumn — Maple Orange** (`#fb923c` / `#fed7aa` / `#ea580c`, on `#1c1410`): 紅葉散りゆく秋.
- **Winter — Snow Blue** (`#e0f2fe` / `#f0f9ff` / `#0ea5e9`, on `#0a0e14`): 雪静かに降る.

### Neutral

- **Zen Dark** (`#1a1a1a`): the base app background outside the seasonal system (`body` background, card fills before translucency).
- **Off-White** (`#efefef`): primary text and icon color.
- **Subtle Gray** (`#d4d4d8`): secondary/muted text — captions, inactive tab labels, metadata.

### Named Rules

**The Tinted Border Rule.** Surfaces themselves stay neutral (`bg-white/5`–`bg-white/10` glass on `#1a1a1a`); the seasonal accent shows up only as a border tint (`{primary}30`, i.e. ~19% alpha), a glow (`box-shadow`/`text-shadow` using the season's `glow` rgba), or a small indicator dot — never as a large fill. This is what lets four unrelated hues (pink, cyan, orange, ice-blue) share one interface without it ever feeling "skinned."

**The One Voice Rule.** Off-white is the only text/icon color anywhere in the app; hierarchy is built with opacity (`/60`, `/85`) and size, not with a second neutral gray-on-gray scale.

## Typography

**Display/Heading Font:** 'Zen Old Mincho' (serif; weights 400/500/700/900 loaded), with `serif` fallback.
**Body/Label Font:** the codebase names a `font-inter` utility, but no Inter font file is actually loaded (`--font-inter` resolves to nothing) — in practice this text renders in the browser's default UI sans-serif stack. Treat "Inter" as aspirational naming, not a loaded asset, until it's wired up.
**Numeric Font:** the default monospace stack (`font-mono`), used only for scores/stats (WPM, Zen Score, keystroke counts) where digit alignment matters.

**Character:** A single serif carries almost the entire voice — wide-tracked, small-caps-by-uppercase labels next to a large, thin-weight display wordmark. The effect reads as a museum placard rather than a typical app UI.

### Hierarchy

- **Display** (weight 100–300, `text-6xl`–`text-8xl`, tight or negative tracking): the "Koto-Koto" wordmark and the result screen's grade letter. Often gradient-filled or glow-shadowed.
- **Heading** (weight 700, `text-2xl`–`text-4xl`): page titles ("Records", "About Koto-Koto").
- **Title** (weight 400–500, `text-lg`–`text-xl`, `tracking-wide`): section headings, result titles.
- **Body** (weight 400, `text-sm`/`text-base`, `leading-6`/`leading-7`): paragraph copy on the About/Privacy/Terms/Licenses pages; column width is capped (`max-w-2xl` container) to keep lines readable.
- **Label** (weight 400–500, 11px floor, `uppercase`, `tracking-[0.2em]`–`tracking-[0.3em]`): tab captions, field labels, stat captions, kickers. Uppercase is reserved for these short labels; long sentences are always sentence-case.

### Named Rules

**The 11px Floor Rule.** No functional label goes below 11px, even in the game's smallest micro-labels; 8–10px sizes that existed historically were raised to this floor for legibility.
**The Short-Caps Rule.** `uppercase` is only applied to labels short enough to read as a shape, not a sentence — never to a full clause or sentence of copy.

## Layout

No custom spacing scale: the project uses Tailwind's default 4px-step scale directly (`gap-2`/`gap-3`/`gap-4`, `px-3`–`px-6`, `py-1`–`py-3`). Long-form text pages (About/Privacy/Terms/Licenses) share one structure: a single centered card, `max-w-2xl`, padded `p-6` (`p-10` from `md`), inside a `h-screen overflow-y-auto` page shell. The game surface itself is a single full-viewport, centered flex column (`min-h-screen flex flex-col items-center justify-center`) with no grid — one focal element (title, typing line, or result) at a time, headers pinned via `fixed`/`absolute`.

Responsive behavior is mostly typographic (font sizes step up at `md`) rather than structural — the same single-column composition holds from mobile to desktop; a dedicated `MobileBlocker` gates the game itself below a device-type threshold rather than reflowing it.

## Elevation & Depth

No drop shadows as a general-purpose depth cue. Depth reads as **glass over void**: translucent white fills (`bg-white/5`–`bg-white/10`) plus `backdrop-blur-sm`/`-md`/`-xl`, layered directly on the near-black seasonal background. `box-shadow`/`drop-shadow`/`text-shadow` are reserved for the seasonal _glow_ effect (a soft, colored halo behind headings, active grade letters, and focused inputs), not for lifting a surface off the page. The one exception is the settings dropdown and other floating menus, which add a real `shadow-2xl`/`shadow-xl` alongside the blur because they need to visually separate from whatever is behind them.

### Shadow Vocabulary

- **Seasonal glow** (`text-shadow: 0 0 15–30px {season.glow}`, or `box-shadow` with the same rgba): ambient — marks something as "alive" or "current" (headings, timer, active grade), brightening/dimming with the time of day.
- **Focus glow** (`box-shadow: 0 0 0 1px {primary}44, 0 0 22px {glow}15`): structural — the one hard depth/definition shadow, on a focused input, replacing a default focus ring.
- **Floating-menu shadow** (`shadow-2xl`/`shadow-xl` + `backdrop-blur-xl`): structural — separates a dropdown/toast from the page behind it.

### Named Rules

**The Glow-Not-Lift Rule.** Shadows in this system color and warm an element; they don't lift it. Reach for `backdrop-blur` + translucency to imply a surface, and the seasonal glow to imply attention — not a gray drop shadow.

## Shapes

Two corner languages, chosen by role: **fully round** (`rounded-full`) for anything the user presses or selects — buttons, chips, segmented controls, tab indicators, the settings-menu trigger; **large rounded rectangles** (`rounded-2xl` cards/inputs down to `rounded-lg`/`rounded-md` for tooltips and menu rows) for anything the user reads or is contained by. Borders are hairline (`border` default width) and low-alpha white (`border-white/10`–`/20`) at rest, brightening or tinting seasonally only on hover/focus/active state.

### Named Rules

**The Round-If-Clickable Rule.** If it's a `<button>`/tab/chip, it's `rounded-full`. If it's a card, panel, or input, it's a rounded rectangle. The two languages never swap roles.

## Components

### Buttons

- **Shape:** `rounded-full` always.
- **Primary (`PillActionButton`):** translucent white fill (`bg-white/10`, hover `bg-white/18`), off-white text, sometimes a seasonal `box-shadow` glow (`0 0 28px {glow}22`) instead of a fill color.
- **Chip (`ChipButton`):** border-only pill (`border-white/15`), uppercase label, transparent fill, used for small secondary actions ("End" endless session).
- **Icon (`IconActionButton`):** circular icon-only, no border at rest, `hover:bg-white/5`; identical for `<Link>` and `<button>` call sites.
- **Press feedback:** every variant scales to `0.90`–`0.98` on `:active` (no color change); this is the one universal, non-negotiable interaction cue.

### Segmented Control / Tabs

- **Segmented (`SegmentedControl`):** pill group (`rounded-full border border-white/15 bg-white/5`), active item gets `bg-white/20`; used for mode pickers (Classic / Word Endless).
- **Underline (`UnderlineTabs`):** flat row with a `layoutId`-animated underline indicator colored by the seasonal `primary`; used for section switches (History / Leaderboard, Login / Register).

### Cards / Stat Panels

- **Corner Style:** `rounded-lg`–`rounded-2xl`.
- **Background:** `bg-white/5`, `backdrop-blur-sm`.
- **Border:** seasonal-tinted at low alpha (`{primary}30` / `{primary}20`) rather than plain white.
- **Internal Padding:** `p-3`–`p-4` (stat cards), `p-6`/`p-10` (page-level content cards).

### Inputs / Fields

- **Style:** `rounded-2xl border border-white/10 bg-white/5`, `backdrop-blur-sm`, an inset top highlight (`shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`).
- **Focus:** border and caret switch to the seasonal `primary`, plus the Focus glow shadow described above — no default browser ring.
- **Placeholder:** `placeholder-white/30`.

### Navigation

- **Header:** `fixed` top bar, `pointer-events-none` on the row with `pointer-events-auto` re-enabled per-control, so the transparent gaps between icons stay click-through to the game behind it. Wordmark in Zen Old Mincho with a seasonal glow; right side is a row of `IconActionButton`s ending in a settings trigger.
- **Settings menu:** a `backdrop-blur-xl` panel springs open anchored to its trigger (`transform-origin: top right`), closes on outside-click or Escape, rows are `rounded-md hover:bg-white/5` links with a leading icon.

## Do's and Don'ts

### Do:

- **Do** drive every color decision through the season × time-of-day palette (`useThemePalette`) rather than hardcoding a hex for a "seasonal" element.
- **Do** keep functional/label text at 11px or larger; use `text-xs`/`text-sm` for anything a user reads as a sentence.
- **Do** give every clickable element the instant `:active` scale-down; a control that only reacts on `:hover` reads as unfinished in this system.
- **Do** respect `prefers-reduced-motion` (drop loops/parallax, keep state-carrying opacity/color changes) and `prefers-reduced-transparency` (drop `backdrop-blur`, keep the underlying color) for any new animated or glassy element.

### Don't:

- **Don't** introduce a second neutral gray scale; off-white + opacity is the only text-hierarchy tool.
- **Don't** fill a large surface with a saturated seasonal color — the accent is a border/glow/indicator color, not a background color.
- **Don't** set `uppercase` on anything longer than a short label; it removes word-shape and hurts readability on full sentences.
- **Don't** reach for a gray `box-shadow` to lift a card; use blur + translucency for surface, and the seasonal glow for emphasis.
