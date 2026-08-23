// ソート（Sorting & Ordering）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-23 独立検証。
// このカテゴリは①の先行検証（O-1-8）でreportの誤りが見つかった箇所。本ページは実機で
// 再現確認したうえで、report本文をそのまま使わず正しい形で書いている。
import type { Entry } from '../types';

export const sortingEntries: Entry[] = [
  {
    slug: 'order-by',
    title: 'order_by / sort',
    category: 'sorting',
    summary: '行を指定した列の値で並べ替える。',
    snowparkCode: 'df.order_by(col("age").asc(), col("score").desc())',
    polarsCode: 'ldf.sort(by=["age", "score"], descending=[False, True])',
    difference:
      'SnowparkはSQLのORDER BY句に変換される。分散環境でのソートは全ノード間のデータシャッフルを伴うため、大規模データでは相応のコストがかかる。Polarsはローカルメモリ上でマルチスレッドのソートを実行する。',
    pitfall:
      '昇順・降順の指定方法が構文として異なる。Snowparkは`col("列名").asc()`／`.desc()`のように列の式自体に方向を持たせるのに対し、Polarsは`sort()`の`descending`引数に列の数と対応する真偽値のリストを渡す。列を並べ替えても`descending`リストの対応する位置を一緒に動かし忘れると、意図と違う列が昇順/降順になる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.sort',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.sort.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
  {
    slug: 'asc-desc',
    title: 'asc / desc',
    category: 'sorting',
    summary: '列に昇順・降順の方向を持たせる。',
    snowparkCode: 'df.order_by(col("price").asc())\ndf.order_by(col("price").desc())',
    polarsCode: 'ldf.sort(by="price", descending=False)\nldf.sort(by="price", descending=True)',
    difference:
      'Snowparkの`asc()`/`desc()`はColumnオブジェクトに「並べ替えの向き」という性質を持たせるディレクティブで、`order_by`の引数として渡す。Polarsには列ごとの向きを表す同等のディレクティブは無く、`sort()`メソッドの`descending`引数（真偽値または真偽値のリスト）で並べ替えの向きを指定する。',
    pitfall:
      '**Polarsの`pl.col("price").sort(descending=True)`という書き方は、Snowparkの`col("price").desc()`の直訳にはならない**。実行して確認したところ、これは「price列の値だけを単独で並べ替える」処理であり、`select`の中で使うと**他の列との行の対応関係が崩れる**（name列は元の順のまま、price列だけ降順に並び替わり、別の行の組み合わせになってしまう）。テーブル全体を1つの列の値で並べ替えたいときは、必ず`ldf.sort(by="price", descending=True)`のようにLazyFrame/DataFrame側の`sort()`を使う。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Column.desc',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.sort.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
  {
    slug: 'nulls-first-last',
    title: 'nulls_first / nulls_last',
    category: 'sorting',
    summary: 'NULL値をソート結果の先頭・末尾どちらに置くかを指定する。',
    snowparkCode: 'df.order_by(col("score").desc_nulls_last())',
    polarsCode: 'ldf.sort(by="score", descending=True, nulls_last=True)',
    difference:
      'SnowparkはSQLのNULLS FIRST/NULLS LAST句を生成する。Polarsは`sort()`の`nulls_last`引数（真偽値）で制御する。',
    pitfall:
      '**`col("score").desc().nulls_last()`という書き方は存在しない**（`Column`クラスに単独の`nulls_last()`メソッドは無いことを実機で確認済み）。正しくは`asc_nulls_first`・`asc_nulls_last`・`desc_nulls_first`・`desc_nulls_last`という、向きとNULLの位置が結合した4つのメソッドのいずれかを直接呼ぶ。また、両APIとも既定のNULL配置順（明示指定しない場合にNULLが先頭に来るか末尾に来るか）はバージョンや向きによって変わりうるため、NULLを含む列を並べ替えるときは明示指定が安全（実機ではPolarsは昇順・降順どちらでもNULLが先頭に来る挙動だった）。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Column.desc_nulls_last',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.sort.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
];
