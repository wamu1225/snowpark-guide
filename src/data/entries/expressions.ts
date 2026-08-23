// 式評価・文字列・算術・型変換（Expressions, Strings & Conversion）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-24 独立検証。
import type { Entry } from '../types';

export const expressionsEntries: Entry[] = [
  {
    slug: 'when-otherwise',
    title: 'when / otherwise',
    category: 'expressions',
    summary: '条件に応じて異なる値を返す（複数分岐の条件式）。',
    snowparkCode:
      'when(col("age") < 18, lit("minor")).when(col("age") < 65, lit("adult")).otherwise(lit("senior"))',
    polarsCode:
      'pl.when(pl.col("age") < 18).then(pl.lit("minor")).when(pl.col("age") < 65).then(pl.lit("adult")).otherwise(pl.lit("senior"))',
    difference:
      'SnowparkはSQLの`CASE WHEN ... THEN ... ELSE ... END`に直結する。Polarsは`when().then()`をペアで繰り返しチェーンし、最後に`otherwise()`で結ぶ構造。3段階の分岐を両方で実行して確認したところ、同じ結果になる。',
    pitfall:
      'Polarsの`when()`は条件を渡すだけで、合致したときの値は必ず続けて`.then()`で指定する必要がある。Snowparkの`when(condition, value)`のように条件と値を1回の呼び出しにまとめる書き方はPolarsには無い。`.then()`を忘れると式が未完成のままになる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.when',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.when.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'iff',
    title: 'iff',
    category: 'expressions',
    summary: '条件が真か偽かで2つの値のどちらかを返す（2分岐専用のショートカット）。',
    snowparkCode: 'iff(col("score") >= 80, lit("PASS"), lit("FAIL"))',
    polarsCode: 'pl.when(pl.col("score") >= 80).then(pl.lit("PASS")).otherwise(pl.lit("FAIL"))',
    difference:
      'SnowparkはSnowflake固有の`IFF(cond, v1, v2)`関数に直結する専用の呼び出しを持つ。Polarsには2分岐専用の独立した関数は無く、`when().then().otherwise()`で同じことを表す。実行して確認したところ結果は同じ。',
    pitfall:
      '`iff`はSnowpark（というよりSnowflake SQL）だけにある省略記法で、Polarsに直訳できる同名の関数は存在しない。3分岐以上に増えたときは、Snowpark側もどのみち`when().when().otherwise()`の形に切り替える必要があるので、最初から`when/otherwise`（前項）に統一して書いておくと両API間の差が小さくなる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.iff',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.when.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'is-null',
    title: 'is_null / is_not_null',
    category: 'expressions',
    summary: '値がNULL（欠損）かどうかを判定する。',
    snowparkCode: 'col("email").is_null()\ncol("email").is_not_null()',
    polarsCode: 'pl.col("email").is_null()\npl.col("email").is_not_null()',
    difference:
      'SnowparkはSQLの`IS NULL`/`IS NOT NULL`に変換される。Polarsは各要素ごとに真偽値のマスクを生成する。メソッド名・挙動ともほぼ同一で、両API間で最も差の少ないメソッドの1つ。',
    pitfall:
      '判定結果はどちらもブール値の列であって、NULLを取り除く操作そのものではない。実際に行を絞り込みたいときは、この式を`filter`（[絞り込みのページ](/filter/)）と組み合わせる必要がある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Column.is_null',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.is_null.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'coalesce',
    title: 'coalesce',
    category: 'expressions',
    summary: '複数の列を左から順に見て、最初に見つかったNULLでない値を返す。',
    snowparkCode: 'coalesce(col("mobile"), col("home"), col("email"))',
    polarsCode: 'pl.coalesce(["mobile", "home", "email"])',
    difference:
      'SnowparkはSQLの`COALESCE(...)`をそのまま生成する。Polarsも`pl.coalesce`という名前で同じ機能を提供している。実行して確認したところ、優先順位（先に書いた列が優先）も含めて同じ挙動になる。',
    pitfall:
      '引数の渡し方が異なる。Snowparkは列を可変長引数としてそのまま並べるのに対し、Polarsはリストにまとめて渡す。列数を動的に変えるコードを書くとき、Snowpark側は`*columns`のようなアンパック、Polars側はリストをそのまま渡す形になる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.coalesce',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.coalesce.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'cast',
    title: 'cast',
    category: 'expressions',
    summary: '列の型を別の型に変換する。',
    snowparkCode: 'col("id").cast(IntegerType())',
    polarsCode: 'pl.col("id").cast(pl.Int32)',
    difference:
      'SnowparkはSQLの`CAST(id AS INTEGER)`に変換される。Polarsは内部のArrow型を指定した型へ変換する。',
    pitfall:
      '**変換できない値があったときの既定の挙動が違う**。実行して確認したところ、Polarsで文字列`"abc"`を整数へキャストしようとすると既定（`strict=True`）では例外`InvalidOperationError`になる。`cast(pl.Int32, strict=False)`を指定すると、変換できない値だけが`null`になり処理は止まらない。Snowpark側も設定によってエラーとNULL変換のどちらにもなり得るため、**どちらのAPIでも「失敗時にエラーにするかnullにするか」を明示的に決めて書く**必要がある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Column.cast',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.cast.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'substring',
    title: 'substring',
    category: 'expressions',
    summary: '文字列の一部を指定した位置から切り出す。',
    snowparkCode: 'substring(col("full_code"), 1, 3)  # 1文字目から3文字',
    polarsCode: 'pl.col("full_code").str.slice(0, 3)  # 0文字目から3文字',
    difference: 'SnowparkはSQLの`SUBSTRING(full_code, 1, 3)`に変換される。Polarsは`.str`名前空間の`slice()`メソッドを使う。',
    pitfall:
      '**インデックスの基点が違う＝このカテゴリで最も間違いやすい**。SQLに準拠するSnowparkの文字位置は**1ベース**（先頭文字が1）。Polarsの`str.slice`は**0ベース**（先頭文字が0）。実行して確認したところ、同じ「先頭3文字を取り出す」つもりでも、Snowpark側は`substring(col, 1, 3)`、Polars側は`str.slice(0, 3)`と開始位置の数字が1つずれる。数字をそのまま置き換えて移植すると、片方の文字がずれた結果になる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.substring',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.slice.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'concat',
    title: 'concat（文字列連結）',
    category: 'expressions',
    summary: '複数の列・文字列を1つにつなげる。',
    snowparkCode: 'concat(col("first_name"), lit(" "), col("last_name"))',
    polarsCode: 'pl.concat_str([pl.col("first_name"), pl.lit(" "), pl.col("last_name")])',
    difference: 'SnowparkはSQLの`CONCAT(...)`関数に変換される。Polarsは`pl.concat_str`関数で複数の式を1つの文字列にまとめる。',
    pitfall:
      '関数名が紛らわしい。Polarsには行を縦に連結する`pl.concat`という別の関数（[結合・集合演算のページ](/union/)で使ったもの）が存在し、文字列を横につなげたいときは名前の似た**別の関数`concat_str`**を使う必要がある。`pl.concat`をそのまま文字列連結に使おうとすると、意図と違う「テーブルの連結」に使われてしまう。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.concat',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.concat_str.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
];
