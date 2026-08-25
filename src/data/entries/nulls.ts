// 欠損値・Null処理（Null & Missing Value Handling）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-25 独立検証。
import type { Entry } from '../types';

export const nullsEntries: Entry[] = [
  {
    slug: 'na-fill',
    title: 'na.fill（fillna）',
    category: 'nulls',
    summary: 'NULL（欠損）を指定した値で埋める。',
    snowparkCode: 'df.na.fill({"age": 0, "status": "unknown"})',
    polarsCode: 'ldf.with_columns(pl.col("age").fill_null(0), pl.col("status").fill_null(pl.lit("unknown")))',
    difference:
      'Snowparkは列名と埋める値の辞書を`na.fill()`に渡し、対応するSQLに展開される。Polarsは列ごとに`.fill_null()`を`with_columns`へ並べる。書き方は違うが、狙いは同じ「指定した列のNULLだけを値で置き換える」。',
    pitfall:
      '**【Polars 側の落とし穴】整数列に浮動小数点数で埋めると、エラーにならずに型が変わる**。Polars で整数列（`i64`）に`fill_null(0.0)`のような浮動小数点数を渡すと、**例外を出さずに列全体の型がこっそり`f64`へ変わる**（Polars 1.43.2 で実行して確認）。「型エラーで気づける」と思っていると危険で、後続の処理で誤差や想定外の桁が出てから気づくことになりやすい。整数列を保ちたいときは、埋める値の型（`0`か`0.0`か）を明示的に意識する。なお Snowpark 側の `na.fill()` が同じ状況でどう振る舞うかは、接続環境がないため未検証。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrameNaFunctions.fill',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.fill_null.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-25',
    },
  },
  {
    slug: 'na-drop',
    title: 'na.drop（dropna）',
    category: 'nulls',
    summary: '指定した列がNULLの行を取り除く。',
    snowparkCode: 'df.na.drop(subset=["important_col"])',
    polarsCode: 'ldf.drop_nulls(subset=["important_col"])',
    difference:
      'Snowparkは対象列に対する`IS NOT NULL`条件を自動生成する。Polarsも指定した列のいずれかがNULLの行を除外する。実行して確認したところ、両者とも同じ行が残る。',
    pitfall:
      'Snowparkの`na.drop`には`how`引数（既定は`"any"`＝対象列のいずれか1つでもNULLなら削除、`"thresh"`と組み合わせて非NULL列数のしきい値も指定可能）があるが、Polarsの`drop_nulls`にはこの`how`に相当する引数が無く、常に「指定した列のいずれかがNULLなら削除」という単一の挙動になる。Snowpark側で`how="all"`（全列がNULLのときだけ削除）のような細かい制御をしていた場合、Polarsへ移すとそのままでは同じ挙動を再現できない。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrameNaFunctions.drop',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.drop_nulls.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-25',
    },
  },
];
