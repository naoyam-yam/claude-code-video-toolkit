export const metadata = { title: "利用規約 | HOKIRU Web" };

export default function TermsPage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-lg font-semibold text-ink">利用規約</h1>
      <p className="text-sm text-muted">
        本規約は、HOKIRU Web（以下「本サービス」）の利用条件を定めるものです。本サービスは学習支援を目的とした
        個人開発プロダクトであり、収録される問題は一級建築士本人の監修を経て公開されます。監修ステータスが
        「未監修」の問題は開発・レビュー目的のプレビュー表示であり、本番公開版には含まれません。
      </p>
      <p className="text-sm text-muted">
        本サービスの利用によって生じたいかなる損害についても、運営者は責任を負わないものとします。詳細な規約は
        公開準備フェーズで確定します（docs/operations/release-process.md 参照）。
      </p>
    </article>
  );
}
