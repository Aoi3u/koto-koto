import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Licenses | Koto-Koto',
  description: 'Open source and third-party license notices used by Koto-Koto',
};

export default function LicensesPage() {
  return (
    <main className="h-screen overflow-y-auto pt-28 pb-16 px-6 md:px-12">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-black/30 p-6 md:p-10 backdrop-blur">
        <h1 className="text-3xl md:text-4xl tracking-wide font-semibold">Licenses</h1>
        <p className="mt-3 text-sm leading-6 text-off-white/90">
          Koto-Koto is distributed under the MIT License. Third-party components and assets are used
          under their respective licenses.
        </p>

        <section className="mt-8">
          <h2 className="text-lg md:text-xl font-medium tracking-wide">Project License</h2>
          <p className="mt-2 text-off-white/90">
            See the repository <code>LICENSE</code> file for the full license text.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg md:text-xl font-medium tracking-wide">Third-Party Notices</h2>
          <p className="mt-2 text-off-white/90">
            Audio assets derived from <code>tplai/kbsim</code> are used under the MIT License with
            attribution and notice included in <code>THIRD_PARTY_NOTICES.md</code>.
          </p>
          <div className="mt-3 text-sm text-subtle-gray">
            Source repository:{' '}
            <a
              href="https://github.com/tplai/kbsim"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
            >
              https://github.com/tplai/kbsim
            </a>
          </div>
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
          </ul>
        </section>

        <section className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-2xl md:text-3xl tracking-wide font-semibold">
            ライセンス（日本語版）
          </h2>
          <p className="mt-3 text-sm leading-6 text-off-white/90">
            Koto-KotoはMITライセンスで配布されています。第三者コンポーネントおよび素材は、それぞれの
            ライセンス条件に従って利用しています。
          </p>

          <section className="mt-8">
            <h3 className="text-lg md:text-xl font-medium tracking-wide">プロジェクトライセンス</h3>
            <p className="mt-2 text-off-white/90">
              ライセンス全文はリポジトリ内の <code>LICENSE</code> を参照してください。
            </p>
          </section>

          <section className="mt-8">
            <h3 className="text-lg md:text-xl font-medium tracking-wide">第三者ライセンス通知</h3>
            <p className="mt-2 text-off-white/90">
              <code>tplai/kbsim</code>{' '}
              由来の音声素材をMITライセンスの条件で利用しており、帰属表示および ライセンス通知は{' '}
              <code>THIRD_PARTY_NOTICES.md</code> に記載しています。
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
