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
│   ├── romaji.ts           # ローマ字変換ラッパー
│   ├── gameUtils.ts        # ゲームスコア計算関数
│   ├── formatters.ts       # 時間・スコア計算
│   └── validation/         # Zodバリデーションスキーマ
│       └── game.ts         # ゲーム結果検証
├── types/                  # TypeScript型定義
│   ├── game.ts             # ゲーム関連型 (GameState, MatchResult, etc.)
│   └── next-auth.d.ts      # NextAuth型拡張
├── hooks/                  # カスタムフック (useSeason, useDeviceType)
└── __tests__/              # Jestテスト
```

## 設計原則

- **単一責任の原則**: 各コンポーネントは1つの責任のみ
- **型安全性**: TypeScript strict modeと中央集権型定義 (`src/types/game.ts`)
- **ランタイム検証**: Zodスキーマによる実行時型チェック
- **Context APIによる状態共有**: prop drillingを回避
- **カスタムフックによるロジック分離**: ビジネスロジックをUIから分離
- **useReducerパターン**: 複雑な状態はuseReducerで管理（再レンダリング最適化）
- **ユーティリティ関数の再利用**: 共通処理を集約 (`gameUtils.ts`)
- **パフォーマンス重視**: useMemo/useCallbackによるメモ化、アニメーション最適化

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

**useReducer State Management:**

```typescript
type TypingEngineAction =
  | { type: 'SET_TARGET'; payload: Sentence }
  | { type: 'PROCESS_INPUT'; payload: string }
  | { type: 'MARK_MATCH'; position: number }
  | { type: 'MARK_PREFIX'; position: number }
  | { type: 'MARK_ERROR'; position: number }
  | { type: 'SET_RIPPLE'; payload: RippleEffect | null }
  | { type: 'SET_SHAKE'; payload: boolean }
  | { type: 'RESET' };

// 8つのuseStateを1つのuseReducerに統合
// → 1キーストロークあたり8回の再レンダリング → 1-2回に削減
```

**最適化効果:**

- 再レンダリング回数: 80%削減
- 状態更新のアトミック性向上
- デバッグ容易性（Redux DevTools互換）

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

### バリデーション層 (Zod)

**スキーマ定義 (`src/lib/validation/game.ts`):**

```typescript
// 厳密なスキーマ（新規API）
GameResultPayloadSchema = z.object({
  wpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  keystrokes: z.number().int().min(0),
  elapsedTime: z.number().min(0),
});

// 柔軟なスキーマ（後方互換性）
GameResultFlexibleSchema = z
  .object({
    wordsPerMinute: z.number().optional(),
    totalCharacters: z.number().optional(),
    // ... 旧フィールド名もサポート
  })
  .transform(normalizeToStandardFields);
```

**API統合例:**

```typescript
// Before: 60行の手動検証コード
const toNumber = (value: any) => { /* ... */ };
const normalizePayload = (body: any) => { /* ... */ };

// After: 20行のZod検証
const result = GameResultPayloadSchema.safeParse(body);
if (!result.success) return NextResponse.json(...);
const validated = result.data;
```

**効果:** 検証ロジック削減率 67% (60行 → 20行)

## API Endpoints

### `/api/game-results` (GET/POST)

- **Auth**: NextAuth JWT (必須)
- **POST**: wpm, accuracy, keystrokes, elapsedTime → 201
  - **Validation**: Zod schema (`GameResultPayloadSchema`)
  - **Backward Compatibility**: 旧フィールド名（wordsPerMinute等）もサポート
- **GET**: 自分の履歴 (最新50件) → 200

### `/api/rankings` (GET)

- **Auth**: 不要 (読み取り専用)
- **Query**:
  - `timeframe=all|day|week|month`
  - `limit=50` (最大200)
  - `mode=users|runs`（省略時は `users`）
- **Sort**: Zen Score (WPM × Accuracy ÷ 100) DESC
- **Modes**:
  - `mode=users` (Players): ユーザーごとのベストラン（同一ユーザーの全プレイから Zen Score 最大の 1 プレイを選択）
  - `mode=runs` (Runs): 各プレイをそのまま戦績として並べる
- **Ranking Rule**:
  - Zen Score 同点時は「タイ順位」（コンペティション方式）
  - 例: Zen Score が `a=250, b=250, c=200` の場合 → `rank: 1, 1, 3`
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
- トレンドチャート (WPM/Accuracy/Zen Score)
- サマリ統計と連続日数 (streak)

**Rankings Tab** (`/results?tab=rankings`):

- グローバルランキング
- モード切り替え:
  - Players: ユーザーごとの最高記録（デフォルト表示, `mode=users`）
  - Runs: 各プレイの戦績一覧 (`mode=runs`)
- CustomSelectで期間・表示数フィルタリング
- 順位に応じた視覚スタイル (1位=金, 2位=銀, 3位=銅)

## テスト戦略

### Jest + Testing Library

- **環境**: jsdom
- **設定**: [jest.config.ts](jest.config.ts), [jest.setup.ts](jest.setup.ts)
- **配置**: `src/__tests__/`
- **テストスイート**: 7スイート、65+ テストケース

### テストカバレッジ

| カテゴリ       | ファイル                            | テスト内容                         |
| -------------- | ----------------------------------- | ---------------------------------- |
| **Core Logic** | romaji.test.ts, romaji-trie.test.ts | ローマ字変換、Trie構造             |
| **Utilities**  | formatters.test.ts                  | WPM/KPM/Accuracy/ZenScore計算      |
| **Hooks**      | useTypingEngine.test.tsx            | useReducerロジック、状態遷移       |
| **Validation** | validation.test.ts                  | Zodスキーマ検証（厳密/柔軟モード） |
| **Rankings**   | rankLogic.test.ts                   | Grade/Title算出ロジック            |
| **API**        | rankings.api.test.ts                | ランキングAPI統合テスト            |
| **Device**     | device-detection.test.ts            | デバイス判定                       |

### カバレッジ目標

- **lib**: lines ≥ 85% (romaji.ts, romaji-trie.ts, formatters.ts, gameUtils.ts)
- **hooks**: lines ≥ 70% (useTypingEngine.ts)
- **validation**: lines ≥ 90% (game.ts)

### テスト結果

```
✅ 7 test suites passed
✅ 65 tests passed (0 failures)
✅ Validation tests: 5/5 passing
```

### コマンド

```bash
npm test          # 実行
npm run test:watch
npm run test:cov  # カバレッジ付き
```

## パフォーマンス最適化

### State Management

- **useReducer Migration**: 8つのuseState → 1つのuseReducer
  - キーストロークあたり再レンダリング: 8回 → 1-2回 (80%削減)
  - アトミックな状態更新で競合状態を防止

### Memoization

- **useMemo**: アニメーションバリアント（SeasonalParticles）
- **useCallback**: イベントハンドラ、Context更新関数
- **遅延初期化**: useState(() => ...) で初回のみ計算

### Rendering Optimization

- **コンポーネント分割**: 再レンダリング範囲を最小化
- **Context最適化**: 必要な状態のみを共有
- **React.memo**: 静的コンポーネント（ヘッダー、フッター）

### Animation

- **Framer Motion**: GPU加速、layout animations
- **Color Syntax**: `transparent` → `rgba(0, 0, 0, 0)` (oklab警告回避)
- **CSS Variables**: 色変換をCSSレイヤーに委譲

### Asset Management

- **AudioBuffer再利用**: デコード済みバッファを Map で管理
- **Lazy Loading**: 画像・音声ファイルのオンデマンドロード
- **インターバル更新**: 10分ごとに季節・時間帯チェック

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
