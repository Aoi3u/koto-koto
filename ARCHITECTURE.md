# アーキテクチャ概要 - Koto-Koto

## 🌍 システム概要

**Koto-Koto** は季節（花鳥風月）と時間帯（移ろい）のダイナミックなシステムを特徴とし、ユーザーの実世界の時間と季節に応じてビジュアル雰囲気が変化する禅的なタイピングゲームです。

## 🏗️ プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/             # 共有UIコンポーネント
│   ├── TypingGame.tsx      # メインゲームコンテナ (SeasonalProvider)
│   ├── SeasonalParticles.tsx # 季節パーティクルアニメーション
│   ├── SoundSwitcher.tsx   # キーボードサウンド切り替えUI
│   └── MobileBlocker.tsx   # モバイルブロッカー（簡潔化済み）
│
├── contexts/               # React Context (状態管理)
│   └── SeasonalContext.tsx  # 季節+時間帯テーマの提供
│
├── features/               # 機能別モジュール
│   ├── game/
│   │   ├── components/
│   │   │   ├── TitleScreen.tsx      # タイトル画面
│   │   │   ├── GameHeader.tsx       # ゲームヘッダー
│   │   │   └── TypingArea.tsx       # タイピング領域
│   │   └── hooks/               # ゲームロジックフック（分割済み）
│   │       ├── useGameController.ts # ゲーム全体の制御
│   │       ├── useGameSession.ts    # セッション管理
│   │       ├── useTypingEngine.ts   # タイピングエンジン
│   │       ├── useSound.ts          # サウンド統合（Composition Hook）
│   │       ├── useAudioContext.ts   # AudioContext初期化
│   │       ├── useSoundProfile.ts   # プロファイル管理
│   │       ├── useKeySound.ts       # サウンド再生
│   │       └── sound-profiles.ts    # サウンドプロファイル定数
│   └── result/
│       ├── components/
│       │   └── ResultScreen.tsx
│       └── utils/
│           └── rankLogic.ts
│
├── config/                 # 設定ファイル
│   ├── seasons.ts          # 季節システム定義 (4 seasons)
│   ├── timeOfDay.ts        # 時間帯システム定義 (Morning/Day/Sunset/Night)
│   ├── theme.ts            # テーマ設定
│   └── gameConfig.ts       # ゲーム設定（WORD_TRANSITION_DELAY_MS追加）
│
├── lib/                    # ユーティリティ関数
│   ├── formatters.ts       # フォーマッター関数 (WPM, KPM, 時間)
│   ├── romaji-trie.ts      # Trie/DFA 型ローマ字→かなエンジン
│   ├── romaji.ts           # 公開APIラッパー
│   ├── device-detection.ts # デバイス検出ロジック（分離済み）
│   └── constants/
│       └── kana-map.ts     # かな→ローマ字マッピング定数
│
├── data/                   # 静的データ（作者別に分割済み）
│   ├── sentences.ts        # 後方互換性のための再エクスポート
│   └── sentences/          # 作者別・テーマ別に整理
│       ├── types.ts              # 型定義
│       ├── natsume-soseki.ts     # 夏目漱石
│       ├── dazai-osamu.ts        # 太宰治
│       ├── miyazawa-kenji.ts     # 宮沢賢治
│       ├── akutagawa-ryunosuke.ts # 芥川龍之介
│       ├── modern-authors.ts     # 近代作家
│       ├── poetry.ts             # 詩歌・俳句
│       ├── classics.ts           # 古典
│       └── index.ts              # 統合エクスポート
│
└── hooks/                  # カスタムフック
    ├── useSeason.ts        # 季節+時間帯検出フック
    └── useDeviceType.ts    # デバイスタイプ検出フック（分離済み）
```

```
prisma/
├── schema.prisma
└── migrations/
        └── 20251230000000_init/
                └── migration.sql
prisma.config.ts
```

## 🎯 設計原則

### 1. 単一責任の原則 (SRP)

各コンポーネントは 1 つの責任のみを持つ:

- `TitleScreen`: タイトル画面の表示のみ
- `GameHeader`: ゲーム中のヘッダー情報のみ
- `TypingArea`: タイピング領域の表示のみ

### 2. Context API による状態共有

季節テーマは`SeasonalProvider`を通じて全コンポーネントに提供され、prop drilling を回避:

```tsx
<SeasonalProvider>
  <TypingGameInner />
</SeasonalProvider>
```

### 3. カスタムフックによるロジック分離

ビジネスロジックはカスタムフックに分離:

- `useGameController`: ゲーム全体の制御
- `useTypingEngine`: タイピングエンジン
- `useSeason`: 季節検出
- `useSound`: サウンド管理（Composition Pattern で構成）
  - `useAudioContext`: AudioContext の初期化
  - `useSoundProfile`: プロファイルの読み込みと管理
  - `useKeySound`: サウンド再生ロジック

### 4. ユーティリティ関数の再利用

共通処理は`lib/formatters.ts`やローマ字エンジン系に集約:

- `formatTime()`: 時間フォーマット
- `calculateWPM()`: WPM 計算
- `calculateAccuracy()`: 精度計算
- `match()/isValidPrefix()`: Trie ベースのローマ字→かな判定（最長一致、促音・ん 特殊処理、ヒント出力）

### 5. モジュール分割による保守性向上

**データ層の分割**:

- 文章データを作者別ファイルに分割（`sentences/` ディレクトリ）
- 各ファイルは独立してメンテナンス可能
- 後方互換性のための再エクスポート層を維持

**定数の分離**:

- かな→ローマ字マッピングを `lib/constants/kana-map.ts` に分離
- ロジックと定数を分離し、可読性とテスタビリティを向上

**ロジックの抽出**:

- デバイス検出ロジックを `lib/device-detection.ts` に抽出
- コンポーネントは UI の責務のみに集中
- 型定義を明示化し、`@ts-expect-error` を削除

## 🎨 季節 × 時間帯システムアーキテクチャ (Kacho-Fugetsu × Utsuroi)

### データフロー

```
getCurrentSeason()        getCurrentTimeOfDay()
        ↓                        ↓
SEASONAL_THEMES[s]   TIME_THEMES[t]
        ↓                        ↓
  getCombinedTheme() ←───────┘
        ↓
   useSeason() (Hook)
        ↓
  SeasonalProvider (Context)
        ↓
  useSeasonalTheme() (Consumer Hook)
        ↓
   CombinedTheme を返す
   ├─ 季節情報
   ├─ 時間帯情報
   ├─ 調整済み色
   │  ├─ background (明度調整)
   │  ├─ primary (彩度・明度調整)
   │  └─ glow (雰囲気調整)
   └─ 時間帯オーバーレイ
        ↓
   各コンポーネント
```

### 色調整のメカニズム

**時間帯による調整**:

- **朝 (05-09)**: 明度 70%, 彩度 60% - 目覚めのような柔らかさ
- **昼 (10-15)**: 明度 100%, 彩度 80% - 完全な明瞭さ
- **黄昏 (16-18)**: 明度 50%, 彩度 100% - 劇的な影と彩色
- **夜 (19-04)**: 明度 30%, 彩度 40% - 深い暗闇と集中

### パフォーマンス最適化

- **遅延初期化**: `useState(() => getCombinedTheme())`で初回のみ計算
- **インターバル更新**: 10 分ごとに季節・時間帯をチェック
- **Context 分離**: 単一の `CombinedTheme` を共有して再レンダリング最小化
- **純粋関数**: `adjustColorBrightness()` と `adjustGlow()` による予測可能な変換

## 🎵 キーボードサウンドシステムアーキテクチャ

### Composition Pattern による分割設計

**useSound()** は3つの専門化されたフックを組み合わせた Composition Hook:

```
useSound() (統合)
  ├─ useAudioContext()
  │   ├─ AudioContext 初期化
  │   ├─ ブラウザ互換性チェック
  │   └─ クリーンアップ処理
  │
  ├─ useSoundProfile()
  │   ├─ プロファイル読み込み
  │   ├─ AudioBuffer Map 管理
  │   ├─ localStorage 連携
  │   └─ 遅延読み込み戦略
  │
  └─ useKeySound()
      ├─ サウンド再生ロジック
      ├─ GainNode による音量調整
      └─ ランダムバリアント選択
```

### データフロー

```
useAudioContext()
        ↓
AudioContext 初期化
        ↓
useSoundProfile(audioContext)
  ├─ プロファイル読み込み
  ├─ AudioBuffer Map (13プロファイル × 5バリアント)
  └─ localStorage から復元
        ↓
useKeySound(audioContext, audioBuffers)
        ↓
playKeySound()
        ↓
AudioBufferSourceNode → GainNode → destination
        ↓
キーボード音の再生
```

### 分割による利点

1. **テスタビリティ**: 各フックを独立してテスト可能
2. **責務の明確化**: AudioContext 管理、プロファイル管理、再生ロジックが分離
3. **再利用性**: 各フックは他の用途でも再利用可能
4. **保守性**: 250行超のファイルを4つの小さなモジュールに分割

### サウンドプロファイル

13 種類のメカニカルキーボードスイッチのリアルな音声（press バリアントのみを使用）:

| プロファイル      | 説明                   | フォルダー  |
| ----------------- | ---------------------- | ----------- |
| Cherry MX Black   | リニア、静音           | `mxblack`   |
| Cherry MX Blue    | クリッキー、タクタイル | `mxblue`    |
| Cherry MX Brown   | タクタイル             | `mxbrown`   |
| Topre             | 静電容量無接点         | `topre`     |
| Holy Panda        | タクタイル、ハイエンド | `holypanda` |
| Gateron Alpaca    | リニア、スムーズ       | `alpaca`    |
| Gateron Black Ink | リニア、深い音         | `blackink`  |
| Gateron Red Ink   | リニア、軽量           | `redink`    |
| Cream             | リニア                 | `cream`     |
| Blue Alps         | タクタイル、クリッキー | `bluealps`  |
| Box Navy          | クリッキー、重い       | `boxnavy`   |
| Buckling Spring   | IBM 風クリッキー       | `buckling`  |
| Turquoise         | タクタイル             | `turquoise` |

### パフォーマンス最適化

1. **プリロード戦略**: 全サウンドプロファイル（65 ファイル）を初期化時に読み込み
2. **AudioBuffer 再利用**: デコード済みのバッファを Map に保存し、再利用
3. **低レイテンシ再生**: Web Audio API の BufferSourceNode で即座に再生
4. **バリアント**: 各プロファイルに 5 つのバリアントを用意し、ランダム再生で自然な響き
5. **音量調整**: GainNode で微妙な音量バリエーションを追加

### SoundSwitcher UI

- **位置**: 左下固定（`fixed bottom-6 left-6`）
- **インタラクション**: ドロップダウンメニューでプロファイル選択
- **視覚的フィードバック**: 現在選択中のプロファイルにチェックマーク表示
- **永続化**: 選択は localStorage に保存され、次回訪問時に復元

## 📦 コンポーネント依存関係

```
TypingGame (Provider)
  ├─ MobileBlocker
  ├─ SeasonalParticles
  ├─ SoundSwitcher (サウンドプロファイル切り替え)
  ├─ GameHeader (playing時)
  └─ AnimatePresence
      ├─ TitleScreen (waiting)
      ├─ TypingArea (playing)
      └─ ResultScreen (finished)
```

## 🔄 状態管理戦略

### グローバル状態 (Context)

- `CombinedTheme`: 季節+時間帯テーマ（全体で共有）
  - 季節情報（spring/summer/autumn/winter）
  - 時間帯情報（morning/day/sunset/night）
  - 調整済みの色（background/primary/glow）
  - 時間帯オーバーレイ（atmosphere）

### ローカル状態 (useState/Custom Hooks)

- `gameState`: ゲーム状態
- `currentWord`: 現在の単語
- `elapsedTime`: 経過時間
- `currentProfile`: 現在選択中のキーボードサウンドプロファイル
- `isLoading`: サウンドファイルの読み込み状態
- その他ゲームロジック

### 永続化 (localStorage)

- `keyboard-sound-profile`: ユーザーが選択したサウンドプロファイル

### 純粋関数 (Utils)

- **時間フォーマット**: `formatTime()`, `formatTimeWithMillis()`
- **スコア計算**: `calculateWPM()`, `calculateKPM()`, `calculateAccuracy()`
- **ランク判定**: `calculateRank()`（精度 80% 未満は強制的に C ランク）
- **色調整**: `adjustColorBrightness()`, `adjustGlow()`

## 🚀 パフォーマンス考慮事項

1. **コンポーネント分割**: 大きなコンポーネントを小さく分割し、再レンダリング範囲を最小化
2. **Context 最適化**: 季節テーマのみを含む Context で、不要な再レンダリングを防止
3. **アニメーション最適化**: Framer Motion を使用し、GPU 加速を活用
4. **純粋関数**: 副作用のない関数で予測可能な動作を保証

## 🎓 拡張性

### 新しい季節の追加

`src/config/seasons.ts`に新しい季節定義を追加:

```typescript
export const SEASONAL_THEMES: Record<Season, SeasonalTheme> = {
  // 既存の季節...
  newSeason: {
    season: 'newSeason',
    name: { ja: '新季節', en: 'New Season' },
    colors: {
      /* ... */
    },
    atmosphere: {
      /* ... */
    },
    haiku: '新季節の俳句',
  },
};
```

### 新しい時間帯の追加

`src/config/timeOfDay.ts`に新しい時間帯定義を追加:

```typescript
export const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
    // 既存の時間帯...
    newTime: {
        timeOfDay: "newTime",
        name: { ja: "新時間", en: "New Time" },
        hourRange: [start, end],
        atmosphere: {
            brightness: 0.x,
            saturation: 0.x,
            ambientOverlay: "rgba(...)",
        },
    },
};
```

### 新しいゲームモードの追加

`src/features/`に新しいフィーチャーディレクトリを作成し、同じパターンに従う

## 📝 命名規則

- **コンポーネント**: PascalCase (`TitleScreen.tsx`)
- **フック**: camelCase with `use` prefix (`useSeason.ts`)
- **ユーティリティ**: camelCase (`formatters.ts`)
- **定数**: UPPER_SNAKE_CASE (`SEASONAL_THEMES`)
- **型**: PascalCase (`SeasonalTheme`)

## 🗄️ データ永続化 (Prisma + Supabase)

### 概要

- ORマッパー: Prisma 7（クライアント生成は `src/generated/prisma`）
- DB: Supabase PostgreSQL（Session Pooler 推奨: `…pooler.supabase.com:5432`）
- 接続URL管理: [prisma.config.ts](prisma.config.ts)（schema には `url`/`directUrl` を書かない）

### スキーマ構成

- `User` … 認証ユーザー（NextAuth想定）。`Account`/`Session` と1対多
- `Account` … プロバイダアカウント（`provider + providerAccountId`ユニーク）
- `Session` … セッション（`sessionToken`ユニーク）
- `VerificationToken` … メール等の検証トークン
- `GameResult` … ゲーム結果（WPM, accuracy 等、`User` 外部キー、`onDelete: CASCADE`）

定義は [prisma/schema.prisma](prisma/schema.prisma) を参照。

### マイグレーション戦略

1. 通常運用（Session Pooler / IPv4 到達可）- `.env.local` で pooler ホスト:5432 を指定 - `npx prisma migrate dev --name <name>` → `npx prisma generate`

2. フォールバック（Transaction Pooler 等でハングする場合）- `npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/init.sql` - `psql "$DATABASE_URL" -f prisma/init.sql` - 必要に応じて `_prisma_migrations.checksum` を生成物と同期（あるいは `prisma migrate resolve`）

初期マイグレーションは [prisma/migrations/20251230000000_init/migration.sql](prisma/migrations/20251230000000_init/migration.sql) として保存。

### 注意点（Prisma 7）

- 接続URLは **schema ではなく** [prisma.config.ts](prisma.config.ts) で管理
- `db.<project>.supabase.co:5432` が IPv6 のみ解決される環境では P1001 の可能性 → IPv4 を持つ **Session Pooler** を使用

### アプリ連携

#### NextAuth 統合

- **ライブラリ**: NextAuth v4.24.13 + @auth/prisma-adapter v2.9.3
- **認証戦略**: JWT（デフォルト）
- **プロバイダ**: Credentials（bcryptjs でパスワードハッシュ）
- **ルート**: [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/%5B...nextauth%5D/route.ts)
- **設定**: [src/lib/auth.ts](src/lib/auth.ts)（authOptions エクスポート）
- **PrismaClient**: [src/lib/prisma.ts](src/lib/prisma.ts)（シングルトン、@prisma/adapter-pg + pg.Pool 使用）

**技術的注意点**:

- Prisma 7 で生成されるクライアント型と NextAuth v4 の PrismaAdapter に型互換性がないため、`as any` キャストが必要（ESLint無効化コメント付き）
- 将来的に NextAuth v5 (Auth.js) への移行で解消される可能性あり

**利用するモデル**:

- `User` … 認証ユーザー（email, hashedPassword）
- `Account` … プロバイダアカウント（OAuth用、現在はCredentialsのみ）
- `Session` … セッショントークン管理
- `VerificationToken` … メール検証等

#### ビジネスロジック

- Next.js サーバー側（Server Actions/Route Handlers）から PrismaClient を使用
- ビジネスデータ（`GameResult`）は `User` に紐付け（FK, CASCADE）
- 認証が必要なエンドポイントでは `getServerSession(authOptions)` でセッション取得

#### Game Results API

- エンドポイント: `/api/game-results`（GET/POST）
- 認証: NextAuth JWT。未ログインは 401
- POST: 必須 `wpm/accuracy/keystrokes/elapsedTime`、任意 `correctKeystrokes/difficulty`。`GameResult` に保存（降順ソートのため `createdAt` index を利用）
- GET: 自分の履歴を新しい順で最大50件返却

#### Rankings API

- エンドポイント: `/api/rankings`（GET）
- 認証: 不要（読み取り専用）
- クエリ: `timeframe=all|week|month`（デフォルト all）, `limit`（デフォルト50, 最大200）
- ソート: `wpm` DESC, 同値は `accuracy` DESC, 最後に `createdAt` DESC
- レスポンス: user表示名（`name` が無ければ `email`）、`wpm`, `accuracy`, `rank`, `createdAt`

## ✅ テスト戦略（Jest）

- **テスト基盤**: Next.js 16 対応の `next/jest` + `jsdom`。セットアップは [jest.config.ts](jest.config.ts) / [jest.setup.ts](jest.setup.ts)。
- **配置**: すべてのユニットテストは [src/**tests**/](src/__tests__) に配置（core utils / hooks を優先）。
- **重点領域**:
  - コアロジック（[src/lib/romaji.ts](src/lib/romaji.ts), [src/lib/romaji-trie.ts](src/lib/romaji-trie.ts), [src/lib/formatters.ts](src/lib/formatters.ts)）
  - タイピングエンジン（[src/features/game/hooks/useTypingEngine.ts](src/features/game/hooks/useTypingEngine.ts)）
  - ランク判定（[src/features/result/utils/rankLogic.ts](src/features/result/utils/rankLogic.ts)）
- **カバレッジ閾値**:
  - `lib` 行カバレッジ ≥ 85%
  - `useTypingEngine` 行カバレッジ ≥ 70%
- **方針**: 大きな一括テストではなく、短く明確なケースを多数用意しエッジを網羅（例: `nn/xn/n` の「ん」、促音の直入力/子音重ね、`shi/si/ci` 等の揺らぎ）。
- **備考**: jsdom では AudioContext がないため、`useSound` はテスト中に警告を出すが機能上の問題はなし（必要ならモック可能）。

## 🚀 CI/CD パイプラインアーキテクチャ

### ワークフロー構成（GitHub Actions）

すべての `main` ブランチへの push と pull request で自動実行される品質ゲート:

```yaml
.github/workflows/ci.yml
├── lint (ESLint)              # コード品質チェック
├── test (Jest)                # ユニットテスト + カバレッジ
├── build (Next.js)            # プロダクションビルド検証
└── lighthouse (Lighthouse CI) # パフォーマンス計測
```

### Lighthouse CI パフォーマンス監視

**目的**: パフォーマンス劣化を自動検知し、後から重い機能を追加する際の安全弁とする。

**データフロー**:

```
GitHub Actions トリガー
        ↓
npm ci (依存関係インストール)
        ↓
npm run build (本番ビルド)
        ↓
npm start (localhost:3000 起動)
        ↓
Lighthouse CI 計測
  ├─ Performance
  ├─ Accessibility
  ├─ Best Practices
  ├─ SEO
  └─ Core Web Vitals
        ↓
基準値チェック (lighthouserc.json)
        ↓
結果を PR コメントに投稿
        ↓
基準値未達 → CI FAIL（マージブロック）
基準値達成 → CI PASS
```

### パフォーマンス基準値（Quality Gates）

**Core Web Vitals（Error レベル - マージブロック）**:

- First Contentful Paint (FCP) ≤ 1500ms
- Largest Contentful Paint (LCP) ≤ 2500ms
- Cumulative Layout Shift (CLS) ≤ 0.1
- Speed Index ≤ 3000ms

**Lighthouse Categories（Warn/Error レベル）**:

- Performance ≥ 90 (error)
- Accessibility ≥ 85 (warn)
- Best Practices ≥ 80 (warn)
- SEO ≥ 80 (warn)

### 設定ファイル

**[.github/workflows/ci.yml](.github/workflows/ci.yml)**:

- トリガー: `push` (main) + `pull_request`
- 4 つの並列ジョブ（lint/test/build/lighthouse）
- Node.js 18 環境
- Lighthouse CI Action (`treosh/lighthouse-ci-action@v12`)

**[lighthouserc.json](lighthouserc.json)**:

- 計測対象: `http://localhost:3000`
- 実行回数: 1 回（安定性重視）
- アップロード先: `temporary-public-storage`（結果の一時公開）
- アサーション: カテゴリスコア + Core Web Vitals の閾値

### ローカル検証

```bash
# Lighthouse CI をローカルで実行
npx @lhci/cli@latest autorun
```

**用途**:

- PR 前のパフォーマンスチェック
- 最適化効果の検証
- 基準値調整のシミュレーション

### パフォーマンス最適化の方針

1. **初期ロード最適化**:
   - Code Splitting（Next.js の自動最適化）
   - 画像最適化（存在する場合）
   - フォント最適化（`Zen Old Mincho` の効率的なロード）

2. **ランタイムパフォーマンス**:
   - Framer Motion の GPU 加速アニメーション
   - Context の最小化（Season × TimeOfDay のみ）
   - 純粋関数による予測可能な動作

3. **Web Audio API**:
   - サウンドファイルのプリロード（13 プロファイル × 5 バリアント）
   - AudioBuffer の再利用
   - 低レイテンシ再生

4. **レイアウト安定性**:
   - CLS 対策（明示的な width/height、fixed positioning）
   - アニメーションの transform/opacity 使用（reflow 回避）

## 📚 まとめ

このドキュメントは Koto-Koto の技術的な設計判断と実装詳細を記録しています。プロジェクトは以下の原則に基づいて構築されています:

1. **明確な責任分離**: コンポーネント、フック、ユーティリティの役割を明確化
2. **パフォーマンス重視**: Context 最適化、GPU 加速、純粋関数の活用
3. **拡張性**: 季節・時間帯・ゲームモードの追加が容易
4. **品質保証**: 自動テスト、CI/CD、パフォーマンス監視の統合

詳細な使用方法や貢献ガイドラインについては [README.md](README.md) を参照してください。

- **スコア履歴の追跡**: PR コメントでトレンドを可視化
- **基準値の段階的引き上げ**: プロジェクト成熟に応じて厳格化
- **複数ページの計測**: 将来的にゲーム画面や結果画面も追加可能
- **パフォーマンスバジェット**: 機能追加時の指針として活用
