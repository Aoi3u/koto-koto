# Koto-Koto (コトコト)

**Japanese Zen Typing**

<img width="512" height="512" alt="koto-koto_banner" src="https://github.com/user-attachments/assets/80f81de5-e797-4387-8cee-efc4ef408129" />

## Overview

**Koto-Koto** is a minimalist, zen-inspired Japanese typing game designed to induce a state of flow. Unlike frantic arcade typing games, Koto-Koto focuses on rhythm, aesthetics, and the beauty of the Japanese language.

Built with **Next.js 16**, **TypeScript**, and **Framer Motion**, it features a custom-built, feature-rich typing engine that handles the nuances of Romaji-to-Kana conversion (e.g., `si` vs `shi`, `n` flexibility).

## ✨ Features

-   **Dynamic Seasonal Atmosphere** (花鳥風月 - Kacho-Fugetsu): Real-time visual themes based on Japan's 4 seasons with seasonal particle animations (🌸💧🍂❄️).
-   **Time-of-Day System** (移ろい - Utsuroi): Visual atmosphere changes throughout the day (Morning/Day/Sunset/Night) with brightness and saturation adjustments.
-   **Zen Aesthetics**: A Deep Zen Dark theme with dynamic color adjustment based on time. Use of Mincho typography for a literary feel.
-   **Intelligent Typing Engine**:
    -   **Flexible Romaji**: Supports multiple input styles (Hepburn, Kunrei-shiki). Accepts `si`/`shi`, `tu`/`tsu`, `c`/`k`, etc.
    -   **N-Permisiveness**: gracefully handles the tricky `n` vs `nn` logic.
-   **Realistic Keyboard Sounds**:
    -   **13 Mechanical Switch Profiles**: Choose from authentic keyboard sounds including Cherry MX (Black, Blue, Brown), Topre, Holy Panda, Gateron (Alpaca, Black Ink, Red Ink), Cream, Alps (Blue Alps, Box Navy), Buckling Spring, and Turquoise.
    -   **Sound Switcher UI**: Easy-to-use dropdown menu (bottom-left corner) to switch between different keyboard sound profiles.
    -   **Persistent Settings**: Your preferred sound profile is saved to localStorage and automatically restored.
    -   **Optimized Performance**: Pre-loaded audio buffers with Web Audio API for low-latency, realistic sound playback.
-   **Strict Grading System**:
    -   **Zen Titles**: Earn ranks from "Novice" to "Koto Master" and special S-Ranks.
    -   **Detailed Stats**: Tracks WPM, Accuracy, KPM, and Max Combo.
-   **Modern Tech Stack**: Fully responsive, strictly typed, and built for performance.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/koto-koto.git
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
├── data/                # Word lists and content
├── features/            # Feature-based modules
│   ├── game/            # Core Game Logic
│   │   ├── components/  # TitleScreen, GameHeader, TypingArea
│   │   └── hooks/       # useTypingEngine, useGameSession, useSound (realistic keyboard sounds)
│   └── result/          # Result Screen Logic
│       ├── components/  # ResultScreen
│       └── utils/       # Rank calculation logic
├── lib/                 # Core utilities
│   ├── romaji.ts        # Romaji parser
│   └── formatters.ts    # Time and score formatters
├── hooks/               # Custom hooks
│   └── useSeason.ts     # Season + Time-of-day detection
└── data/                # Static content
    └── words.ts         # Word list
```

## 🎨 Design Philosophy

-   **Visuals**: High contrast text with glowing carets against a noisy, deep-dark background.
-   **Typography**: `Zen Old Mincho` for Japanese text, `Inter` for UI elements.
-   **Feedback**: Subtle ripples and camera shakes (optional) provide physical feedback without breaking focus.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
