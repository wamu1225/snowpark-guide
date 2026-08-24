// ウィンドウ関数（Window Functions）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-24 独立検証。
import type { Entry } from '../types';

export const windowEntries: Entry[] = [
  {
    slug: 'window-spec',
    title: 'Window.partition_by / Window.order_by',
    category: 'window',
    summary: 'グループ（パーティション）ごとに、行をまたいだ計算をするための土台を定義する。',
    snowparkCode: 'Window.partition_by("department").order_by(col("salary").desc())',
    polarsCode: '# Window仕様を単独定義せず、各Expressionの末尾に .over("department") を付ける',
    difference:
      'SnowparkはPySpark由来の`WindowSpec`オブジェクトを`Window.partition_by(...).order_by(...)`で組み立て、後述の`rank()`等の式に`.over(window_spec)`として渡す。Polarsには独立した「窓の仕様オブジェクト」という概念が無く、集計したい式の末尾に直接`.over("department")`を付けるだけでパーティションごとの計算になる。',
    pitfall:
      'Snowparkは並べ替え（`order_by`）を`WindowSpec`の中で一括指定できるが、Polarsの`.over()`自体には並べ替えを指定する引数が無い。`row_number`や`lag`/`lead`のようにパーティション内の順序が結果を左右する計算をPolarsで行うときは、`.over()`を付ける**前に**`sort()`でデータ全体を正しい順序に並べておく必要がある（次の`row_number`のページを参照）。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Window',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.over.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'rank',
    title: 'rank',
    category: 'window',
    summary: 'パーティション内で順位をつける。同じ値には同じ順位がつき、その分だけ次の順位を飛ばす。',
    snowparkCode: 'rank().over(window_spec)',
    polarsCode: 'pl.col("salary").rank(method="min", descending=True).over("department")',
    difference:
      'SnowparkはSQLの`RANK()`関数に変換される。Polarsは`.rank(method="min")`で同じ挙動になる。実行して確認したところ、同率のときに順位が並び（1, 1）、その次は2でなく3から始まる点まで一致する。',
    pitfall:
      'Polarsの`.rank()`は`method`引数を省略したり別の値（`"ordinal"`や`"dense"`など）にすると挙動が変わる。SQLの`RANK()`と同じ「同率は同順位・次は飛ばす」という挙動にしたいときは、**必ず`method="min"`を明示する**（既定値のままでは意図と違う結果になる）。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.rank',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.rank.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'dense-rank',
    title: 'dense_rank',
    category: 'window',
    summary: 'パーティション内で順位をつける。同じ値には同じ順位がつくが、次の順位は飛ばさない。',
    snowparkCode: 'dense_rank().over(window_spec)',
    polarsCode: 'pl.col("salary").rank(method="dense", descending=True).over("department")',
    difference:
      'SnowparkはSQLの`DENSE_RANK()`に変換される。Polarsは`.rank(method="dense")`で対応する。実行して確認したところ、同率が2件あっても次の順位は2から始まる（`rank`のときの「3から始まる」との違いが確認できた）。',
    pitfall:
      '`rank`との違いは`method`引数の値（`"min"`か`"dense"`か）だけで、呼び出しの形はほぼ同じ。どちらを使うつもりだったか、書くときに`method`の値を見て確認する習慣をつけると取り違えを防げる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.dense_rank',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.rank.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'row-number',
    title: 'row_number',
    category: 'window',
    summary: 'パーティション内で1から始まる連番をふる。同率でも必ず別の番号になる。',
    snowparkCode: 'row_number().over(window_spec)',
    polarsCode: '# 先にソートしてから使う\nldf.sort(["department", "salary"]).with_columns(pl.col("salary").cum_count().over("department").alias("rn"))',
    difference:
      'SnowparkはSQLの`ROW_NUMBER()`に変換される。Polarsには専用の連番関数が無く、`.cum_count()`（累積個数）をパーティションごとに数える形で代用する。実行して確認したところ、同率の値（`rank`では同じ順位になった行）でも、`cum_count`では別々の連番になる。',
    pitfall:
      '**Polarsの`cum_count()`は、あらかじめデータが正しい順序に並んでいることが前提**（累積で数えるだけなので、並べ替えの機能自体は持たない）。パーティション内でどの順に番号をふりたいかに応じて、`.over()`を付ける前に`sort()`しておく必要がある。ソートを忘れると、意図した順序と違う連番になる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.row_number',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.cum_count.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'lag',
    title: 'lag',
    category: 'window',
    summary: 'パーティション内で、1つ前（過去）の行の値を取得する。',
    snowparkCode: 'lag(col("salary"), 1).over(window_spec)',
    polarsCode: 'ldf.sort(["department", "employee"]).with_columns(pl.col("salary").shift(1).over("department").alias("prev_salary"))',
    difference:
      'SnowparkはSQLの`LAG()`関数に変換される。Polarsは`.shift(1)`（値を1つ後ろにずらす）で同じ効果を得る。実行して確認したところ、各パーティションの先頭行は「1つ前が無い」ため両APIとも`NULL`/`null`になる。',
    pitfall:
      'Snowparkの`lag`には`default_value`（前の行が無いときの既定値）や`ignore_nulls`という引数があり、Polarsの`shift`にも`fill_value`という対応する引数がある。既定のまま使うとどちらも欠損値は`NULL`のままになるので、「先頭行を0で埋めたい」のような要件があるときはこれらの引数を明示的に使う。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.lag',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.shift.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
  {
    slug: 'lead',
    title: 'lead',
    category: 'window',
    summary: 'パーティション内で、1つ後（未来）の行の値を取得する。',
    snowparkCode: 'lead(col("salary"), 1).over(window_spec)',
    polarsCode: 'ldf.sort(["department", "employee"]).with_columns(pl.col("salary").shift(-1).over("department").alias("next_salary"))',
    difference:
      'SnowparkはSQLの`LEAD()`関数に変換される。Polarsは`shift`に**負の数**（`-1`）を渡すことで「前方向」でなく「後方向」にずらす。実行して確認したところ、各パーティションの末尾行は「1つ後が無い」ため両APIともNULL/nullになる。',
    pitfall:
      '`lag`と`lead`はSnowpark側では別々の関数名だが、Polars側では同じ`shift`メソッドの符号（正か負か）だけの違いになる。符号を書き間違えると`lag`のつもりが`lead`の結果になる（またはその逆）ので注意する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.lead',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.shift.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-24',
    },
  },
];
