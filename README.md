# Koto-Koto (コトコト)

**Japanese Zen Typing**

<img width="512" height="512" alt="koto-koto_banner" src="https://github.com/user-attachments/assets/80f81de5-e797-4387-8cee-efc4ef408129" />

## Overview

A minimalist, zen-inspired Japanese typing game designed to induce a state of flow. Built with Next.js 16, TypeScript, and Framer Motion.

## ✨ Key Features

- **Dynamic Seasonal Atmosphere**: Real-time visual themes based on Japan's 4 seasons with particle animations
- **Intelligent Typing Engine**: Trie-based Romaji-to-Kana converter with flexible input styles (`si`/`shi`, `tu`/`tsu`, etc.)
- **13 Keyboard Sound Profiles**: Authentic mechanical switch sounds (Cherry MX, Topre, Holy Panda, Gateron, Alps, etc.)
- **User Authentication**: Google OAuth 2.0 and email/password login with NextAuth.js
- **Global Rankings & History**: Period-based leaderboard with Zen Score (WPM × Accuracy ÷ 100)
- **Strict Grading System**: Ranks from Seed → SSS with accuracy-gated S-ranks

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Authentication**: NextAuth.js v4
- **Database**: Prisma 7 + Supabase PostgreSQL

## 🚀 Quick Start

### Prerequisites

Node.js 18.18+ and npm

### Setup

```bash
# Clone repository
git clone https://github.com/Aoi3u/koto-koto.git
cd koto-koto

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Fill in: DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Development

```bash
npm run lint       # ESLint check
npm run format     # Prettier format
npm test           # Run Jest tests
npm run test:cov   # Test with coverage
```

## 📖 Documentation

For detailed technical documentation, see:

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design patterns
- [Project Structure](ARCHITECTURE.md#プロジェクト構造) - Directory organization
- [API Documentation](ARCHITECTURE.md#api-endpoints) - API endpoints reference

## 🤝 Contributing

Contributions are welcome! Please submit Pull Requests.

## 📄 License

MIT
