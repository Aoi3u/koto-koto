# アーキテクチャドキュメント - Koto-Koto

## システム概要

季節（花鳥風月）と時間帯（移ろい）のダイナミックなシステムを特徴とする禅的タイピングゲーム。

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── auth/               # 認証・プロフィール管理
│   ├── results/            # 履歴・ランキング表示
│   └── api/                # API routes (auth, game-results, rankings, user)
├── components/             # 共有UIコンポーネント
├── contexts/               # React Context (Seasonal, Sound)
├── features/               # 機能別モジュール
│   ├── game/               # ゲームロジック (components + hooks)
│   └── result/             # リザルト画面
├── config/                 # 設定ファイル (seasons, timeOfDay, theme, gameConfig)
├── data/                   # 文章データ (作者別)
├── lib/                    # ユーティリティ
│   ├── auth.ts             # NextAuth設定
│   ├── prisma.ts           # Prismaクライアント
│   ├── romaji-trie.ts      # ローマ字変換エンジン
│   └── formatters.ts       # 時間・スコア計算
├── hooks/                  # カスタムフック (useSeason, useDeviceType)
└── __tests__/              # Jestテスト
```

## 設計原則

- **単一責任の原則**: 各コンポーネントは1つの責任のみ
- **Context APIによる状態共有**: prop drillingを回避
- **カスタムフックによるロジック分離**: ビジネスロジックをUIから分離
- **ユーティリティ関数の再利用**: 共通処理を集約

## コアシステム

### 季節×時間帯システム

**データフロー:**

```
getCurrentSeason() + getCurrentTimeOfDay()
  ↓
SEASONAL_THEMES + TIME_THEMES
  ↓
adjustColorBrightness() / adjustGlow()
  ↓
CombinedTheme (Context)
```

**時間帯調整:**

- 朝 (05-09): 明度70%, 彩度60%
- 昼 (10-15): 明度100%, 彩度80%
- 黄昏 (16-18): 明度50%, 彩度100%
- 夜 (19-04): 明度30%, 彩度40%

### キーボードサウンドシステム

**Composition Pattern (useSound):**

```
useSound()
  ├─ useAudioContext()    # AudioContext初期化
  ├─ useSoundProfile()    # プロファイル管理 (13種類)
  └─ useKeySound()        # 再生ロジック
```

**プロファイル:** Cherry MX (Black/Blue/Brown), Topre, Holy Panda, Gateron (Alpaca/Black Ink/Red Ink), Cream, Blue Alps, Box Navy, Buckling Spring, Turquoise

**最適化:** プリロード (65ファイル), AudioBuffer再利用, 低レイテンシ再生

### タイピングエンジン

**Trie-based Romaji Matcher:**

- 最長一致DFA/Trie
- 促音・ん特殊処理、拗音、F/ヴ系列対応
- 揺らぎサポート (`shi/si`, `tsu/tu`, `c/k`)
- `getNextChars`でヒント出力

## データ永続化 (Prisma + Supabase)

### スキーマ構成

- **User**: 認証ユーザー (email, hashedPassword, name, image)
- **Account**: プロバイダアカウント (Google/Credentials)
- **Session**: セッショントークン
- **GameResult**: ゲーム結果 (wpm, accuracy, userId FK)
- **VerificationToken**: メール検証

### NextAuth統合

**プロバイダ:**

- **Google OAuth 2.0**: ワンクリックログイン
- **Credentials**: メール・パスワード (bcrypt)

**セッション同期:**

```typescript
// JWT Callback
if (user) {
  token.id = user.id;
  token.name = user.name;
  token.email = user.email;
}

// Session Callback
if (session.user && token.sub) {
  session.user.id = token.sub;
  session.user.name = token.name;
  session.user.email = token.email;
}
```

**プロフィール更新フロー:**

```
PATCH /api/user/update-name { name }
  ↓
Prisma User.update()
  ↓
NextAuth update() trigger
  ↓
JWT Callback (trigger='update')
  ↓
Fresh user data fetched
  ↓
Token updated
  ↓
Session synced
  ↓
useSession() hooks refresh
```

## API Endpoints

### `/api/game-results` (GET/POST)

- **Auth**: NextAuth JWT (必須)
- **POST**: wpm, accuracy, keystrokes, elapsedTime → 201
- **GET**: 自分の履歴 (最新50件) → 200

### `/api/rankings` (GET)

- **Auth**: 不要 (読み取り専用)
- **Query**: `timeframe=all|day|week|month`, `limit=50` (最大200)
- **Sort**: Zen Score (WPM × Accuracy ÷ 100) DESC
- **Response**: user名, wpm, accuracy, zen score, grade/title, rank, createdAt

### `/api/user/update-name` (PATCH)

- **Auth**: NextAuth JWT (必須)
- **Body**: `{ name: string }` (1-50文字)
- **Response**: 更新済みユーザー情報

## Rankings System

### Zen Score計算

**式:** `(WPM × Accuracy) ÷ 100`

**例:**

- 100 WPM, 95% accuracy → 95 Zen Score
- 80 WPM, 100% accuracy → 80 Zen Score
- 120 WPM, 75% accuracy → 90 Zen Score

### Grade & Title

```
Zen Score → Grade (S-SSS は Accuracy ≥ 80% 必須)
D (Seed) → C (Sprout) → B (Wind in Pines) → A (Clear Sky)
→ S (Peak) → S+ (Super) → SS (Hyper) → SS+ (Ultra) → SSS (Nirvana)
```

### Results Page

**History Tab** (`/results?tab=history`):

- 個人の成績履歴 (最新50件)
- Zen Score, Grade, Title表示

**Rankings Tab** (`/results?tab=rankings`):

- グローバルランキング
- CustomSelectで期間・表示数フィルタリング
- 順位に応じた視覚スタイル (1位=金, 2位=銀, 3位=銅)

## テスト戦略

### Jest + Testing Library

- **環境**: jsdom
- **設定**: [jest.config.ts](jest.config.ts), [jest.setup.ts](jest.setup.ts)
- **配置**: `src/__tests__/`

### カバレッジ目標

- **lib**: lines ≥ 85% (romaji.ts, romaji-trie.ts, formatters.ts)
- **hooks**: lines ≥ 70% (useTypingEngine.ts)

### コマンド

```bash
npm test          # 実行
npm run test:watch
npm run test:cov  # カバレッジ付き
```

## パフォーマンス最適化

- **コンポーネント分割**: 再レンダリング範囲を最小化
- **Context最適化**: 必要な状態のみを共有
- **アニメーション**: Framer MotionでGPU加速
- **遅延初期化**: useState(() => ...) で初回のみ計算
- **インターバル更新**: 10分ごとに季節・時間帯チェック
- **AudioBuffer再利用**: デコード済みバッファを Map で管理

## CI/CD

### GitHub Actions

- **lint**: ESLint check
- **test**: Jest with coverage
- **build**: Next.js production build
- **lighthouse**: Performance monitoring

### Lighthouse CI閾値

| Metric        | Threshold |
| ------------- | --------- |
| Performance   | ≥ 90      |
| Accessibility | ≥ 85      |
| FCP           | ≤ 1500ms  |
| LCP           | ≤ 2500ms  |
| CLS           | ≤ 0.1     |

## 環境変数

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.local.example .env.local
# Fill in: DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Prisma生成
npx prisma generate

# 開発サーバー起動
npm run dev
```
