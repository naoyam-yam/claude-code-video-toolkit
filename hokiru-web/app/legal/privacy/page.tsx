export const metadata = { title: "プライバシーポリシー | HOKIRU Web" };

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-lg font-semibold text-ink">プライバシーポリシー</h1>
      <p className="text-sm text-muted">
        本サービスのMVP版では、学習記録（正誤・回答日時・復習間隔・自信度など）は匿名でお使いのブラウザの
        ローカルストレージにのみ保存され、サーバーには送信されません。将来、Supabaseによる匿名アカウント同期を
        導入する際は本ページを更新します。
      </p>
      <p className="text-sm text-muted">
        設定画面の「データをリセットする」から、いつでも保存された学習記録を削除できます。
      </p>
    </article>
  );
}
