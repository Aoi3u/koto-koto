import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Koto-Koto',
  description:
    'Koto-Koto is a Japanese typing game with zen-inspired visuals, mechanical keyboard sounds, and ranking features.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <main className="h-screen overflow-y-auto pt-28 pb-16 px-6 md:px-12">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-black/30 p-6 md:p-10 backdrop-blur">
        <h1 className="text-3xl md:text-4xl tracking-wide font-semibold">About Koto-Koto</h1>
        <p className="mt-3 text-sm leading-6 text-off-white/90">
          Koto-Koto is a web-based Japanese typing game designed for focused and repeatable
          practice. The experience combines calm visual presentation, responsive key input, and a
          mechanical keyboard-inspired sound system.
        </p>

        <section className="mt-8">
          <h2 className="text-lg md:text-xl font-medium tracking-wide">What You Can Do</h2>
          <p className="mt-2 text-off-white/90 leading-7">
            Play in classic and endless modes, review your typing history, and check rankings. The
            typing engine accepts common romaji variations to keep input natural while scoring
            remains consistent.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg md:text-xl font-medium tracking-wide">Design Direction</h2>
          <p className="mt-2 text-off-white/90 leading-7">
            The interface aims for a quiet and minimal atmosphere to support concentration. Visual
            and audio choices are tuned to reduce noise while preserving clear interaction feedback.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg md:text-xl font-medium tracking-wide">Related Pages</h2>
          <ul className="mt-3 space-y-2 text-off-white/90">
            <li>
              <Link href="/terms" className="underline decoration-white/30 underline-offset-4">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="underline decoration-white/30 underline-offset-4">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/licenses" className="underline decoration-white/30 underline-offset-4">
                Licenses
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-2xl md:text-3xl tracking-wide font-semibold">Koto-Koto について</h2>
          <p className="mt-3 text-sm leading-6 text-off-white/90">
            Koto-Kotoは、集中して反復練習できるように設計したWebベースの日本語タイピングゲームです。静かな
            ビジュアル表現と反応性の高い入力処理、メカニカルキーボード風のサウンドを組み合わせています。
          </p>

          <section className="mt-8">
            <h3 className="text-lg md:text-xl font-medium tracking-wide">できること</h3>
            <p className="mt-2 text-off-white/90 leading-7">
              クラシック/エンドレスの各モードで練習し、履歴とランキングで結果を確認できます。一般的なローマ字
              揺れを許容しつつ、スコア評価の一貫性を保つ入力エンジンを採用しています。
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
