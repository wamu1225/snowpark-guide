// about/privacy の本文。React（クライアント）と scripts/prerender.ts（静的HTML）の両方から
// このSSOTを参照する。Markdown風の簡易記法（##見出し・空行区切り段落・- 箇条書き）。
import { ALL_ENTRIES } from './entries';

export type StaticPage = {
  slug: 'about' | 'privacy';
  title: string;
  description: string;
  body: string;
};

const ENTRY_COUNT = ALL_ENTRIES.length;
// 母数はreports/sources-snowpark-guide.md（①のO-1-8成果物）の実測値。inspect()でSnowpark Python
// SDK 1.54.0の公開メンバー数を数えたもの（2026-08-19確認）。
const TOTAL_API_SURFACE = 1116;

export const STATIC_PAGES: StaticPage[] = [
  {
    slug: 'about',
    title: 'このサイトについて',
    description:
      'Snowpark 実践ガイドの目的・検証方針・想定読者について説明します。',
    body: `## このサイトについて

「Snowpark 実践ガイド」は、Snowflake の Snowpark Python を実務で使うための情報を2種類にまとめたサイトです。1つは、アーキテクチャ・Apache Sparkとの違い・Polarsとの違い（総論）・UDF/UDTF/ストアドプロシージャの使い分け・料金構造・Snowpark ML といった基礎知識。もう1つは、Snowpark の DataFrame/Column API を Polars の LazyFrame/Expression API と並べて見比べられる逆引きリファレンスです。

Polars で書き慣れた処理を Snowpark でどう書くか、あるいはその逆を、検索して1操作=1ページですぐ確認できることを目指すと同時に、コードの書き方だけでは分からない「なぜそうなるか」「どこにコストがかかるか」を基礎知識のページで解説しています。

## 想定読者

Snowpark を業務で使い始めた、または使うことを検討しているデータエンジニア・アナリストを想定しています。基礎知識のページは Snowpark を初めて触る段階でも読めるようにしていますが、Python や SQL の基本的な知識は前提にしています。DataFrame/Column API の逆引きリファレンスは、すでに Polars か Snowpark のどちらかに慣れていて、もう一方への移行やAPIの対応関係を調べる用途を想定しています。

## 収録範囲

現在、[関数リファレンス](/)は${ENTRY_COUNT}メソッドを収録しています。Snowpark Python SDK（1.54.0）の公開API面をinspectで実測したところ、\`DataFrame\`・\`Column\`・\`Window\`・\`functions\`モジュールなど主要なクラス・モジュールの公開メンバーを単純合計すると約${TOTAL_API_SURFACE}件になります。${ENTRY_COUNT}件はこの全体を網羅したものではなく、DataFrame操作の中核にあたる実務頻出セットです。

収録しているのは、DataFrameの変換・集約・結合・並べ替え・式評価・ウィンドウ関数・実行という、Snowparkコードを書くときに中心となる操作です。\`Session\`の接続・認証設定、\`Table\`固有のDDL操作、UDF/UDTF/ストアドプロシージャの登録APIの詳細（登録の仕組み自体は[基礎知識](/guide/udf-udtf-sproc/)で解説しています）は、現時点では対象外です。

収録メソッドは今後も増やしていく方針です。「${TOTAL_API_SURFACE}件すべてを解説している」という意味ではないことをご了承のうえご利用ください。

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
