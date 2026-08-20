// about/privacy の本文。React（クライアント）と scripts/prerender.ts（静的HTML）の両方から
// このSSOTを参照する。Markdown風の簡易記法（##見出し・空行区切り段落・- 箇条書き）。
export type StaticPage = {
  slug: 'about' | 'privacy';
  title: string;
  description: string;
  body: string;
};

export const STATIC_PAGES: StaticPage[] = [
  {
    slug: 'about',
    title: 'このサイトについて',
    description:
      'Snowpark ⇄ Polars 対応表の目的・検証方針・想定読者について説明します。',
    body: `## このサイトについて

「Snowpark ⇄ Polars 対応表」は、Snowflake の Snowpark Python DataFrame/Column API と、Polars の LazyFrame/Expression API を、同じ処理を書くとき並べて見比べられるようにした逆引きリファレンスです。

Polars で書き慣れた処理を Snowpark でどう書くか、あるいはその逆を、検索して1操作=1ページですぐ確認できることを目指しています。

## 想定読者

すでに Polars か Snowpark のどちらかに慣れていて、もう一方への移行やAPIの対応関係を調べているデータエンジニア・アナリストを想定しています。両方の入門解説ではなく、対応表として使うことを前提にしています。

## 検証方針

このサイトのコード例は次の方法で確認しています。

- Polars のコード例は、実際に Python 環境（Polars 1.43.2）で実行し、出力を確認したものだけを掲載しています。
- Snowpark のコード例は、実際に接続できるSnowflakeアカウントを用意していないため、Snowpark Python SDK（1.54.0）をインストールした環境で \`inspect.signature()\` や \`hasattr()\` を使い、メソッド名・引数の実在を静的に確認しています。実行結果そのものではなく、コードとして成立することの確認である点に注意してください。
- 各ページに検証日とバージョンを明記しています。バージョンが古くなった場合、挙動が変わっている可能性があります。
- API仕様は Snowflake 公式ドキュメント・Polars 公式ドキュメントの該当ページを個別に確認したうえで記載しています。`,
  },
  {
    slug: 'privacy',
    title: 'プライバシーポリシー',
    description: '本サイトが利用する広告配信・アクセス解析と、収集される情報について説明します。',
    body: `## 広告の配信について

当サイトでは、第三者配信の広告サービス（Google AdSense）を利用しています。このような広告配信事業者は、ユーザーの興味に応じた広告を表示するために Cookie を使用することがあります。

Cookie を無効にする設定や、Google の広告設定については、Google の広告に関するポリシーをご確認ください。

## アクセス解析について

当サイトはアクセス状況の把握のためアクセス解析ツールを利用する場合があります。これにより収集される情報は個人を特定するものではありません。

## 免責事項

当サイトのコード例・API仕様の説明は、記載した検証日時点での確認に基づくものです。ライブラリのバージョン更新により、実際の挙動やAPI仕様が変わる場合があります。当サイトの内容を利用したことにより生じた損害について、当サイトは責任を負いかねます。

## お問い合わせ

内容についてお気づきの点があれば、当サイトの運営者までご連絡ください。`,
  },
];
