import type { Metadata } from 'next';

const CONTACT_URL = 'https://github.com/Aoi3u/koto-koto/issues';

export const metadata: Metadata = {
  title: 'Terms of Service | Koto-Koto',
  description: 'Koto-Koto Terms of Service',
};

const sections = [
  {
    title: '1. Agreement',
    body: 'By using Koto-Koto, you agree to these Terms of Service. If you do not agree, please stop using this service.',
  },
  {
    title: '2. Account and Security',
    body: 'You are responsible for managing your account credentials and activity. Do not use unauthorized accounts or access methods.',
  },
  {
    title: '3. Prohibited Conduct',
    body: 'Do not interfere with service operation, perform abusive access, manipulate rankings, or violate laws and third-party rights.',
  },
  {
    title: '4. Service Changes and Suspension',
    body: 'We may update, suspend, or discontinue all or part of the service without prior notice when reasonably necessary.',
  },
  {
    title: '5. Disclaimer and Limitation of Liability',
    body: 'The service is provided "as is". To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages.',
  },
  {
    title: '6. Intellectual Property',
    body: 'All content, trademarks, and software rights belong to their respective owners. Open source and third-party assets follow their own licenses.',
  },
  {
    title: '7. Governing Law',
    body: 'These terms are governed by the laws of Japan. Disputes shall be submitted to the court with jurisdiction over the operator location.',
  },
  {
    title: '8. Contact',
    body: 'For legal or policy questions, contact the operator via the official GitHub Issues page linked below.',
  },
] as const;

const sectionsJa = [
  {
    title: '1. 同意',
    body: 'Koto-Kotoを利用することで、本利用規約に同意したものとみなします。同意しない場合は、利用を中止してください。',
  },
  {
    title: '2. アカウントとセキュリティ',
    body: 'アカウント資格情報および利用行為の管理責任はユーザーにあります。不正なアカウント利用や不正アクセスを行わないでください。',
  },
  {
    title: '3. 禁止事項',
    body: 'サービス運営の妨害、過剰または不正なアクセス、ランキング操作、法令違反や第三者権利侵害を禁止します。',
  },
  {
    title: '4. 変更・中断・終了',
    body: '合理的に必要と判断した場合、事前通知なくサービスの全部または一部を変更・中断・終了することがあります。',
  },
  {
    title: '5. 免責および責任制限',
    body: '本サービスは現状有姿で提供されます。法令上許容される範囲で、間接損害・特別損害・結果的損害等について責任を負いません。',
  },
  {
    title: '6. 知的財産権',
    body: 'コンテンツ、商標、ソフトウェア等の権利は各権利者に帰属します。OSSや第三者素材は各ライセンスに従います。',
  },
  {
    title: '7. 準拠法・管轄',
    body: '本規約は日本法に準拠します。紛争は運営者所在地を管轄する裁判所を第一審の専属的合意管轄とします。',
  },
  {
    title: '8. お問い合わせ',
    body: '法務またはポリシーに関するお問い合わせは、下記の公式GitHub Issuesページからご連絡ください。',
  },
] as const;

export default function TermsPage() {
  return (
    <main className="h-screen overflow-y-auto pt-28 pb-16 px-6 md:px-12">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-black/30 p-6 md:p-10 backdrop-blur">
        <h1 className="text-3xl md:text-4xl tracking-wide font-semibold">Terms of Service</h1>
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
          <h2 className="text-2xl md:text-3xl tracking-wide font-semibold">利用規約（日本語版）</h2>
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
          Contact:{' '}
          <a
            href={CONTACT_URL}
            className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {CONTACT_URL}
          </a>
        </p>

        <p className="mt-4 text-xs text-subtle-gray">
          This document is a general template and may be updated to reflect legal and operational
          requirements.
        </p>
      </div>
    </main>
  );
}
