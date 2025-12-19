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
│   └── MobileBlocker.tsx
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
│   │   └── hooks/
│   │       ├── useGameController.ts
│   │       ├── useGameSession.ts
│   │       ├── useTypingEngine.ts
│   │       └── useSound.ts         # リアルなキーボードサウンド管理
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
│   └── gameConfig.ts       # ゲーム設定
│
├── lib/                    # ユーティリティ関数
│   ├── formatters.ts       # フォーマッター関数 (WPM, KPM, 時間)
│   └── romaji.ts           # ローマ字変換
│
├── data/                   # 静的データ
│   └── sentences.ts        # 文リスト（青空文庫由来＋キュレーション）
│
└── hooks/                  # カスタムフック
    └── useSeason.ts        # 季節+時間帯検出フック
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

### 4. ユーティリティ関数の再利用

共通処理は`lib/formatters.ts`に集約:

- `formatTime()`: 時間フォーマット
- `calculateWPM()`: WPM 計算
- `calculateAccuracy()`: 精度計算

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

### データフロー

```
useSound() Hook
  ├─ AudioContext (Web Audio API)
  ├─ AudioBuffer Map (13プロファイル × 5バリアント)
  ├─ currentProfile (状態管理)
  └─ localStorage (永続化)
        ↓
  playKeySound()
        ↓
  AudioBufferSourceNode → GainNode → destination
        ↓
キーボード音の再生
```

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

## ✅ テスト戦略（Jest）

- **テスト基盤**: Next.js 16 対応の `next/jest` + `jsdom`。セットアップは [jest.config.ts](jest.config.ts) / [jest.setup.ts](jest.setup.ts)。
- **配置**: すべてのユニットテストは [src/**tests**/](src/__tests__) に配置（core utils / hooks を優先）。
- **重点領域**:
  - コアロジック（[src/lib/romaji.ts](src/lib/romaji.ts), [src/lib/formatters.ts](src/lib/formatters.ts)）
  - タイピングエンジン（[src/features/game/hooks/useTypingEngine.ts](src/features/game/hooks/useTypingEngine.ts)）
  - ランク判定（[src/features/result/utils/rankLogic.ts](src/features/result/utils/rankLogic.ts)）
- **カバレッジ閾値**:
  - `lib` 行カバレッジ ≥ 85%
  - `useTypingEngine` 行カバレッジ ≥ 70%
- **方針**: 大きな一括テストではなく、短く明確なケースを多数用意しエッジを網羅（例: `nn/xn/n` の「ん」、促音の直入力/子音重ね、`shi/si/ci` 等の揺らぎ）。
- **備考**: jsdom では AudioContext がないため、`useSound` はテスト中に警告を出すが機能上の問題はなし（必要ならモック可能）。
