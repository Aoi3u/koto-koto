import type { Metadata } from 'next';

const GENERAL_CONTACT_URL = 'https://github.com/Aoi3u/koto-koto/issues';
const PRIVATE_CONTACT_URL = 'https://github.com/Aoi3u/koto-koto/security/advisories/new';

export const metadata: Metadata = {
  title: 'Privacy Policy | Koto-Koto',
  description: 'Koto-Koto Privacy Policy',
  alternates: {
    canonical: '/privacy',
  },
};

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect account data (email, display name, password hash for credentials login, and optional profile image), authentication metadata (OAuth/account/session records), gameplay records (WPM, accuracy, keystrokes, elapsed time, difficulty, zen score, timestamps), and technical data used for abuse prevention (IP-related request identifier and user-agent class where available).',
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
    body: 'We use Google OAuth (when enabled), Supabase-hosted PostgreSQL via Prisma, and cloud hosting/CDN providers for app delivery. These providers process data under their own terms and privacy policies.',
  },
  {
    title: '5. Data Retention',
    body: 'Account and gameplay data are retained while the account is active, and are deleted within 30 days after a validated deletion request unless a longer retention period is required by law. Registration abuse-prevention counters are held in memory and expire automatically within approximately 25 minutes.',
  },
  {
    title: '6. International Transfer',
    body: 'Because service providers operate globally, data may be processed outside Japan. We select providers with contractual and technical safeguards appropriate to the service context.',
  },
  {
    title: '7. Disclosure and Sharing',
    body: 'We do not sell personal information. Data may be shared where required by law or to protect rights, safety, and service security.',
  },
  {
    title: '8. Your Rights and Request Procedure',
    body: 'You may request access, correction, deletion, or account closure. For requests containing personal data, use the private reporting channel listed below and include your account email and request details. We aim to respond within 30 days after identity verification.',
  },
  {
    title: '9. Policy Changes',
    body: 'This policy may be updated when needed. Material changes will be reflected with an updated effective date.',
  },
] as const;

const sectionsJa = [
  {
    title: '1. 取得する情報',
    body: 'アカウント情報（メールアドレス、表示名、メール/パスワード認証時のパスワードハッシュ、任意のプロフィール画像）、認証メタデータ（OAuth/アカウント/セッション記録）、ゲームプレイ記録（WPM、正確率、キー入力数、経過時間、難易度、Zen Score、タイムスタンプ）、および不正利用対策に必要な技術情報（IP由来の識別子、取得可能な範囲のユーザーエージェント区分）を取得します。',
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
    body: 'Google OAuth（有効時）、Prisma経由のSupabase PostgreSQL、および配信のためのクラウドホスティング/CDNを利用します。これらの提供者におけるデータ取扱いは各社の規約・ポリシーに従います。',
  },
  {
    title: '5. 保存期間',
    body: 'アカウント情報とプレイ記録はアカウント有効期間中保持し、本人確認を伴う削除請求の受理後30日以内に削除します（法令上の保存義務がある場合を除く）。登録APIの不正対策カウンタはメモリ上で管理され、概ね25分以内に自動消去されます。',
  },
  {
    title: '6. 国外移転',
    body: '利用するサービス提供者はグローバルに運用されているため、データが日本国外で処理される場合があります。契約上・技術上の保護措置を考慮して提供者を選定します。',
  },
  {
    title: '7. 第三者提供',
    body: '個人情報を販売することはありません。法令に基づく場合、権利・安全・サービス保護のために必要な範囲で開示することがあります。',
  },
  {
    title: '8. 利用者の権利と請求手順',
    body: '法令および運用上の制約に従い、開示、訂正、削除、アカウント閉鎖等を請求できます。個人情報を含む請求は下記の非公開報告窓口を利用し、アカウントメールアドレスと請求内容を記載してください。本人確認後、原則30日以内の回答を目指します。',
  },
  {
    title: '9. 改定',
    body: '本ポリシーは必要に応じて改定されます。重要な変更がある場合は、施行日を更新して反映します。',
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="h-screen overflow-y-auto pt-28 pb-16 px-6 md:px-12">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-black/30 p-6 md:p-10 backdrop-blur">
        <h1 className="text-3xl md:text-4xl tracking-wide font-semibold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-subtle-gray">Effective date: 2026-04-06</p>
        <p className="mt-2 text-sm text-subtle-gray">
          The English and Japanese versions are intended to have equal legal effect. If wording
          differs, both versions shall be interpreted in good faith to reflect the same intent.
        </p>

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
            英語版と日本語版は同等の効力を有することを意図しています。文言差異がある場合は、同一の趣旨に沿って誠実に解釈されます。
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
          Private contact for personal data requests:{' '}
          <a
            href={PRIVATE_CONTACT_URL}
            className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {PRIVATE_CONTACT_URL}
          </a>
        </p>

        <p className="mt-2 text-xs text-subtle-gray">
          General legal/policy contact:{' '}
          <a
            href={GENERAL_CONTACT_URL}
            className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {GENERAL_CONTACT_URL}
          </a>
        </p>
      </div>
    </main>
  );
}
