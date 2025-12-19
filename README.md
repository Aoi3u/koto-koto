# Koto-Koto (コトコト)

**Japanese Zen Typing**

<img width="512" height="512" alt="koto-koto_banner" src="https://github.com/user-attachments/assets/80f81de5-e797-4387-8cee-efc4ef408129" />

## Overview

**Koto-Koto** is a minimalist, zen-inspired Japanese typing game designed to induce a state of flow. Unlike frantic arcade typing games, Koto-Koto focuses on rhythm, aesthetics, and the beauty of the Japanese language.

Built with **Next.js 16**, **TypeScript**, and **Framer Motion**, it ships a custom typing engine that handles the nuances of Romaji-to-Kana conversion (e.g., `si` vs `shi`, permissive `n` logic) and a season × time-of-day atmosphere system.

## ✨ Features

- **Dynamic Seasonal Atmosphere** (花鳥風月 - Kacho-Fugetsu): Real-time visual themes based on Japan's 4 seasons with seasonal particle animations (🌸💧🍂❄️).
- **Time-of-Day System** (移ろい - Utsuroi): Visual atmosphere changes throughout the day (Morning/Day/Sunset/Night) with brightness and saturation adjustments.
- **Zen Aesthetics**: A Deep Zen Dark theme with dynamic color adjustment based on time. Use of Mincho typography for a literary feel.
- **Intelligent Typing Engine**:
  - **Trie-based Romaji Matcher**: Longest-match DFA/Trie that covers small-tsu, ん の保留/確定、拗音、F/ヴ系列、揺らぎ (`shi/si/ci`, `chi/ti`, `tsu/tu`, `ku/cu/qu`).
  - **Flexible Romaji**: Supports multiple input styles (Hepburn, Kunrei-shiki). Accepts `si`/`shi`, `tu`/`tsu`, `c`/`k`, etc.
  - **N-Permisiveness**: gracefully handles the tricky `n` vs `nn` logic with position-aware resolution.
  - **UI Hints**: `getNextChars` exposes next valid keystrokes for visual guidance.
- **Realistic Keyboard Sounds**:
  - **13 Mechanical Switch Profiles**: Choose from authentic keyboard sounds including Cherry MX (Black, Blue, Brown), Topre, Holy Panda, Gateron (Alpaca, Black Ink, Red Ink), Cream, Alps (Blue Alps, Box Navy), Buckling Spring, and Turquoise.
  - **Sound Switcher UI**: Easy-to-use dropdown menu (bottom-left corner) to switch between different keyboard sound profiles.
  - **Persistent Settings**: Your preferred sound profile is saved to localStorage and automatically restored.
  - **Optimized Performance**: Pre-loaded audio buffers with Web Audio API for low-latency, realistic sound playback.
- **Strict Grading System**:
  - **Ranks from Seed → SSS**: Titles follow the in-game ladder (Seed → Sprout → Wind in Pines … → Nirvana) with S-ranks gated behind accuracy ≥ 80%.
  - **Detailed Stats**: Tracks WPM, Accuracy, KPM, Max Combo, keystrokes, and elapsed time, plus a copy-to-clipboard share button.
- **Modern Tech Stack**: Fully responsive, strictly typed, and built for performance.
- **Code Quality**: ESLint + Prettier integrated for consistent linting/formatting.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) via the PostCSS plugin
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Lint/Format**: ESLint (with Next.js rules) + Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ (Next.js 16 requirement)
- npm

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/Aoi3u/koto-koto.git
    cd koto-koto
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

### Linting & Formatting

- Lint: `npm run lint`
- Lint (auto-fix): `npm run lint:fix`
- Format: `npm run format`
- Format check (no write): `npm run format:check`

## 📂 Project Structure

The project follows a **Feature-based Architecture** with **Dynamic Atmosphere System** (Season × Time-of-Day).

```
src/
├── app/                 # Next.js App Router
├── components/          # Shared aesthetic components (SeasonalParticles, MobileBlocker, SoundSwitcher)
├── config/              # Centralized constants
│   ├── gameConfig.ts    # Scoring thresholds, total sentences
│   ├── theme.ts         # Color palettes, fonts
│   ├── seasons.ts       # 4-season atmosphere system
│   └── timeOfDay.ts     # 4-time-of-day system
├── contexts/            # React Context (State Management)
│   └── SeasonalContext.tsx  # Seasonal + Time-of-day theme provider
├── data/                # Sentence lists and content
├── features/            # Feature-based modules
│   ├── game/            # Core Game Logic
│   │   ├── components/  # TitleScreen, GameHeader, TypingArea
│   │   └── hooks/       # useTypingEngine, useGameSession, useSound (realistic keyboard sounds)
│   └── result/          # Result Screen Logic
│       ├── components/  # ResultScreen
│       └── utils/       # Rank calculation logic
├── lib/                 # Core utilities
│   ├── romaji.ts        # Public API delegating to trie matcher
│   ├── romaji-trie.ts   # Trie/DFA romaji-to-kana engine (longest-match, hints)
│   └── formatters.ts    # Time and score formatters
├── __tests__/           # Jest unit tests (core logic, hooks)
├── hooks/               # Custom hooks
│   └── useSeason.ts     # Season + Time-of-day detection
└── public/audio/        # 13 keyboard profiles (press variants only)
```

## 🎨 Design Philosophy

- **Visuals**: High contrast text with glowing carets against a noisy, deep-dark background.
- **Typography**: `Zen Old Mincho` for both UI and body (with sans-serif fallback).
- **Feedback**: Subtle ripples and camera shakes (optional) provide physical feedback without breaking focus.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🧪 Testing

Koto-Koto ships a Jest setup tailored for Next.js 16 and focuses on high-density tests for the core typing logic.

- Framework: Jest + Testing Library (jsdom)
- Config: see [jest.config.ts](jest.config.ts) and [jest.setup.ts](jest.setup.ts)
- Tests live under [src/**tests**/](src/__tests__)

### Commands

```bash
npm test          # run once
npm run test:watch
npm run test:cov  # with coverage report
```

### Coverage thresholds

- lib: lines ≥ 85% (e.g. [src/lib/romaji.ts](src/lib/romaji.ts), [src/lib/romaji-trie.ts](src/lib/romaji-trie.ts), [src/lib/formatters.ts](src/lib/formatters.ts))
- hooks (focused): lines ≥ 70% for [src/features/game/hooks/useTypingEngine.ts](src/features/game/hooks/useTypingEngine.ts)

Note: jsdom environment lacks Web Audio API; `useSound` warns about AudioContext support during tests but does not affect behavior.
