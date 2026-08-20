// 射影・選択（Projection & Selection）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（接続なしの静的検証＝
// inspect.signature/hasattrでクラス定義と照合）。2026-08-20 に本サイトの著者が
// 独立して再検証した（Gemini Deep Researchの下書きをそのまま転載していない）。
import type { Entry } from '../types';

export const projectionEntries: Entry[] = [
  {
    slug: 'select',
    title: 'select',
    category: 'projection',
    summary: '列を選んで取り出す。両方とも遅延評価で、実際のクエリは後段のアクションまで発行されない。',
    snowparkCode: 'df.select("col_a", col("col_b") * 2)',
    polarsCode: 'ldf.select(pl.col("col_a"), pl.col("col_b") * 2)',
    difference:
      'Snowparkは select() の内容を "SELECT col_a, (col_b * 2) FROM ..." というSQLに変換し、collect() 等のアクション時にSnowflake上で実行する。Polarsは論理プランに射影ノードを追加し、実際に必要な列だけを早期に絞り込む（Projection Pushdown）。どちらも「その場で計算する」のではなく「計算の予定を組み立てる」動き方をする。',
    pitfall:
      '同じ select() の中で作ったエイリアス列を、同じ select() 内の別の式から参照することはできない（両APIとも）。列を使い回すときは select を分けてチェーンする必要がある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.select',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.select.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'drop',
    title: 'drop',
    category: 'projection',
    summary: '指定した列を取り除く。select の逆で、残す列でなく捨てる列を書く。',
    snowparkCode: 'df.drop("col_a", "col_b")',
    polarsCode: 'ldf.drop("col_a", "col_b")',
    difference:
      'Snowparkは指定列を除いた残りの列を明示的に列挙するSQLへ変換する。Polarsは論理プラン上でスキーマから対象列を即座に取り除くだけで、SQLのような列挙は発生しない。',
    pitfall:
      '存在しない列名を渡したときの挙動が違う。Snowparkは SnowparkSQLException で例外になるが、Polarsはバージョンによって警告のみで処理を続けることがある（明示的に確認せず流用すると気づかず列が残る）。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.drop',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.drop.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'with-column',
    title: 'with_column / with_columns',
    category: 'projection',
    summary: '既存の列はそのままに、新しい列を1つ（または複数）追加する。',
    snowparkCode: 'df.with_column("new_col", col("col_a") + 10)',
    polarsCode: 'ldf.with_columns((pl.col("col_a") + 10).alias("new_col"))',
    difference:
      'Snowparkの with_column は "SELECT *, expression AS new_col" に相当するSQLを作る（1回の呼び出しで1列）。Polarsの with_columns は複数の式をリストで受け取り、まとめて並列評価できるよう設計されている。',
    pitfall:
      'Snowparkで with_column を連続してチェーンすると、内部SQLがネストして複雑化しパフォーマンスが落ちることがある。複数列を足すときはPolarsのように with_columns へ式をまとめて渡す書き方（Snowparkにも with_columns はある）を優先したほうが安全。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.with_column',
    polarsDocUrl:
      'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.with_columns.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'with-column-renamed',
    title: 'with_column_renamed / rename',
    category: 'projection',
    summary: '列名を変更する。',
    snowparkCode: 'df.with_column_renamed("old_name", "new_name")',
    polarsCode: 'ldf.rename({"old_name": "new_name"})',
    difference:
      'Snowparkは "SELECT old_name AS new_name, ..." に展開される。Polarsは辞書で複数の対応を一括指定し、単一のスキーマ変更ノードとして処理する。',
    pitfall:
      '引数の型がAPI間で異なる（Snowparkは文字列2つ、Polarsは辞書）。複数列を一度に変更したい場合、Snowparkでは with_column_renamed を複数回チェーンする必要があるが、Polarsは rename({...}) 一発で済む。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.with_column_renamed',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.rename.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'col',
    title: 'col',
    category: 'projection',
    summary: '列を式として参照する。以降のメソッドチェーンの起点になる、両APIで最も頻出する関数。',
    snowparkCode: 'col("amount")',
    polarsCode: 'pl.col("amount")',
    difference:
      'Snowparkの col はSQLの識別子式を表す薄いラッパー。Polarsの pl.col はExpressionエンジンの基礎で、.str（文字列）・.dt（日時）などの名前空間付きメソッドを大量に持つ、より重心の大きい抽象。',
    pitfall:
      'Snowflakeは引用符なしの識別子をデフォルトで大文字に変換するため、Snowparkの col("amount") は内部的に "AMOUNT" として扱われる。列名の大文字小文字が意味を持つ処理（動的な列名比較など）で取り違えやすい。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.col',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/col.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'lit',
    title: 'lit',
    category: 'projection',
    summary: '定数値を式として埋め込む。',
    snowparkCode: 'df.with_column("status", lit("active"))',
    polarsCode: 'ldf.with_columns(pl.lit("active").alias("status"))',
    difference: 'Snowparkは対応するSQLリテラルを挿入する。Polarsは指定した値1個から成る定数式（Expr）を生成する。',
    pitfall:
      'PythonのNoneを渡すとき、Snowparkでは型が確定しないため lit(None).cast(StringType()) のように明示的なキャストが必要になる場面がある。Polarsの pl.lit(None) は文脈から型推論されることが多く、同じ書き方が通らないことがある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.lit',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.lit.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'alias',
    title: 'alias',
    category: 'projection',
    summary: '式の出力列に名前をつける。',
    snowparkCode: 'df.select(col("col_a").alias("alpha"))',
    polarsCode: 'ldf.select(pl.col("col_a").alias("alpha"))',
    difference: '基本的な概念・展開のされ方は両者ほぼ同一。式の末尾に付けて出力名を決めるという使い方も共通。',
    pitfall:
      'Snowparkで生成されるエイリアス名は、col と同じくSnowflakeの識別子命名規則に従う（引用符なしなら大文字化）。Polars側の小文字のつもりの名前が、Snowpark側では大文字で返ってくることがある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Column.alias',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.alias.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'columns',
    title: 'columns / collect_schema().names()',
    category: 'projection',
    summary: '現在の列名の一覧を取得する。',
    snowparkCode: 'df.columns',
    polarsCode: 'ldf.collect_schema().names()',
    difference:
      'Snowparkの columns プロパティは必要に応じてメタデータクエリを発行して列名を返す。Polars LazyFrameは、評価せずスキーマだけを解決する collect_schema() を経由して列名を取り出す設計。',
    pitfall:
      'Polars LazyFrameの旧 .columns プロパティは非推奨になっている（実行時に DeprecationWarning が出る）。2026年時点の最新版では collect_schema().names() が正式な取得方法で、.columns はスキーマ解決のコストを毎回払う非効率な経路として警告される。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.columns',
    polarsDocUrl:
      'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.collect_schema.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
  {
    slug: 'schema',
    title: 'schema / collect_schema()',
    category: 'projection',
    summary: '列名と型の一覧（スキーマ）を取得する。',
    snowparkCode: 'df.schema',
    polarsCode: 'ldf.collect_schema()',
    difference:
      'Snowparkは StructType オブジェクト（内部に StructField の列を持つ）を返す。Polarsは Schema オブジェクト（辞書に近い順序付きマッピング）を返す。どちらも列名と型のペアを表すが、クラスの形が違う。',
    pitfall:
      '型の文字表現が全く異なる（Snowparkは StringType() のようなクラスインスタンス、Polarsは pl.String のような型オブジェクト）。型を文字列比較で判定するコードを両対応で書くと、この違いで壊れる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.schema',
    polarsDocUrl:
      'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.collect_schema.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-20',
    },
  },
];
