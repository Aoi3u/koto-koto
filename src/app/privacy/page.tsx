import type { Metadata } from 'next';

const CONTACT_URL = 'https://github.com/Aoi3u/koto-koto/issues';

export const metadata: Metadata = {
  title: 'Privacy Policy | Koto-Koto',
  description: 'Koto-Koto Privacy Policy',
};

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We may collect account information (such as email and display name), gameplay records (score, accuracy, timestamps), and technical data (IP address, user agent, device information).',
  },
  {
    title: '2. Purpose of Use',
    body: 'Collected information is used for authentication, game progress and rankings, abuse prevention, service maintenance, and product improvement.',
  },
  {
    title: '3. Cookies and Similar Technologies',
    body: 'We may use cookies and similar technologies to maintain sessions, remember preferences, and improve user experience.',
  },
  {
    title: '4. Third-Party Services',
    body: 'Authentication and hosting may rely on third-party providers. Their data handling is governed by their own privacy policies.',
  },
  {
    title: '5. Data Retention',
    body: 'Personal data is retained only for as long as necessary for the service purpose or legal requirements, then deleted or anonymized.',
  },
  {
    title: '6. Disclosure and Sharing',
    body: 'We do not sell personal information. Data may be shared where required by law or to protect rights, safety, and service security.',
  },
  {
    title: '7. Your Rights',
    body: 'You may request access, correction, deletion, or account closure according to applicable laws and operational constraints.',
  },
  {
    title: '8. Policy Changes',
    body: 'This policy may be updated when needed. Material changes will be reflected with an updated effective date.',
  },
] as const;

const sectionsJa = [
  {
    title: '1. 取得する情報',
    body: 'アカウント情報（メールアドレス、表示名等）、ゲームプレイ記録（スコア、正確率、日時等）、技術情報（IPアドレス、ユーザーエージェント、端末情報等）を取得する場合があります。',
  },
  {
    title: '2. 利用目的',
    body: '認証、進行管理とランキング表示、不正利用防止、サービス運用、品質改善のために利用します。',
  },
  {
    title: '3. Cookie等の利用',
    body: 'セッション維持、設定保持、ユーザー体験向上のため、Cookie等の技術を利用する場合があります。',
  },
  {
    title: '4. 外部サービス',
    body: '認証・ホスティング等で第三者サービスを利用する場合があります。これらのデータ取扱いは各提供者のポリシーに従います。',
  },
  {
    title: '5. 保存期間',
    body: '個人データは、利用目的達成または法令遵守に必要な期間に限り保存し、その後削除または匿名化します。',
  },
  {
    title: '6. 第三者提供',
    body: '個人情報を販売することはありません。法令に基づく場合、権利・安全・サービス保護のために必要な範囲で開示することがあります。',
  },
  {
    title: '7. 利用者の権利',
    body: '法令および運用上の制約に従い、開示、訂正、削除、アカウント閉鎖等を請求できます。',
  },
  {
    title: '8. 改定',
    body: '本ポリシーは必要に応じて改定されます。重要な変更がある場合は、施行日を更新して反映します。',
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="h-screen overflow-y-auto pt-28 pb-16 px-6 md:px-12">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-black/30 p-6 md:p-10 backdrop-blur">
        <h1 className="text-3xl md:text-4xl tracking-wide font-semibold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-subtle-gray">Effective date: 2026-04-06</p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg md:text-xl font-medium tracking-wide">{section.title}</h2>
              <p className="mt-2 leading-7 text-off-white/90">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-2xl md:text-3xl tracking-wide font-semibold">
            プライバシーポリシー（日本語版）
          </h2>
          <p className="mt-3 text-sm text-subtle-gray">
            英語版を主文とし、日本語版は参考訳です。解釈に差異がある場合は英語版を優先します。
          </p>

          <div className="mt-8 space-y-6">
            {sectionsJa.map((section) => (
              <section key={section.title}>
                <h3 className="text-lg md:text-xl font-medium tracking-wide">{section.title}</h3>
                <p className="mt-2 leading-7 text-off-white/90">{section.body}</p>
              </section>
            ))}
          </div>
        </section>

        <p className="mt-10 text-xs text-subtle-gray">
          Contact for personal data requests:{' '}
          <a
            href={CONTACT_URL}
            className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {CONTACT_URL}
          </a>
        </p>
      </div>
    </main>
  );
}
