// フィルタ・サンプリング（Filtering & Sampling）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-21 独立検証。
import type { Entry } from '../types';

export const filteringEntries: Entry[] = [
  {
    slug: 'filter',
    title: 'filter / where',
    category: 'filtering',
    summary: '条件に合う行だけを残す。whereはfilterの別名で、書き方はどちらも同じ。',
    snowparkCode: 'df.filter(col("age") >= 21)\ndf.where(col("status") == "active")  # filterの別名',
    polarsCode: 'ldf.filter(pl.col("age") >= 21)',
    difference:
      'SnowparkはSQLのWHERE句を生成し、複数回のfilter呼び出しはAND条件として自動的に結合される。Polarsも述語プッシュダウンにより、データを読み込む段階で不要な行をスキップしようとする。どちらも「絞り込みをできるだけ早い段階に押し下げる」という最適化方針は共通している。',
    pitfall:
      'SQLの3値論理（TRUE/FALSE/UNKNOWN）にもとづき、Snowparkでは条件式がNULLと評価された行はfilterの結果から除外される。Polarsも既定でnull行は条件を満たさない扱いになるが、否定条件（〜でない、を意味する式）を書いたときに「NULLを含めたいのか除外したいのか」を明示しないと、両者で結果がずれることがある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.filter',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.filter.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-21',
    },
  },
  {
    slug: 'limit',
    title: 'limit',
    category: 'filtering',
    summary: '先頭から指定した行数だけを取得する。',
    snowparkCode: 'df.limit(10)',
    polarsCode: 'ldf.limit(10)',
    difference:
      'SnowparkはSQLのLIMIT句を追加してSnowflake側に行数制限を伝える。Polarsはストリーミング実行時、指定行数を集めた時点で下流のパイプラインを早期終了させる。どちらも「全件処理してから先頭を切り出す」のではなく、早期に打ち切る動き方をする。',
    pitfall:
      '事前にソート（Snowparkの`sort`／Polarsの`sort`）をしていないlimitは、両エンジンとも「どの行が返るか」の決定性を保証しない。同じクエリを2回実行しても違う行が返る可能性があるため、再現性が必要な場面では必ずソートと組み合わせる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.limit',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.limit.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-21',
    },
  },
  {
    slug: 'sample',
    title: 'sample',
    category: 'filtering',
    summary: 'データの一部をランダムに抽出する。',
    snowparkCode: 'df.sample(frac=0.1)  # 10%抽出',
    polarsCode: 'df.sample(fraction=0.1)  # DataFrame（Eager）側のメソッド',
    difference:
      'SnowparkのsampleはSnowflakeのSAMPLE句に変換され、データベースエンジン側でサンプリングが行われる。Polarsのsampleは全データに対するランダムなインデックス抽出であり、Eager APIのDataFrameに実装されている。',
    pitfall:
      '**Polars 1.43.2の`LazyFrame`クラスには`sample`メソッドが存在しない**（`hasattr(pl.LazyFrame, "sample")`は`False`と実機で確認済み）。LazyFrameのままsampleしたい場合は`.collect()`でDataFrameに変換してから`.sample()`を呼ぶ必要があり、遅延評価のメリットがその時点で失われる点に注意。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.sample',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.sample.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-21',
    },
  },
  {
    slug: 'distinct',
    title: 'distinct / unique',
    category: 'filtering',
    summary: '重複行を取り除く。メソッド名がSnowparkとPolarsで異なる点に注意。',
    snowparkCode: 'df.distinct()',
    polarsCode: 'ldf.unique()',
    difference:
      'Snowparkは`SELECT DISTINCT *`に相当するSQLを発行する。Polarsはハッシュテーブルを使って行の重複を判定し除外する。処理として行うことは同じだが、実装のレイヤーが異なる（SQLエンジン側 vs Polarsのネイティブ実装）。',
    pitfall:
      'メソッド名がそのまま違う（Snowpark: `distinct()`、Polars: `unique()`）ため、写経のときに書き間違えやすい。Polars側で`distinct()`と書いてもメソッドが存在せずエラーになる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.distinct',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.unique.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-21',
    },
  },
  {
    slug: 'drop-duplicates',
    title: 'drop_duplicates',
    category: 'filtering',
    summary: '指定した列の値が一致する行を重複とみなして間引く。',
    snowparkCode: 'df.drop_duplicates("user_id")',
    polarsCode: 'ldf.unique(subset=["user_id"], keep="first")',
    difference:
      'Snowparkは内部的に`ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ...)`のようなウィンドウ関数を含むサブクエリに展開して重複行を除く。Polarsは指定列のハッシュ値をもとに、`keep`引数で指定した方針（最初/最後/いずれか1件）で1行だけを残す。',
    pitfall:
      '事前に明示的なソートをしていない場合、複数の重複行のうち「どの1行が残るか」の決定ロジックがエンジン間で異なる可能性がある。特定の行を残したい場合は、drop_duplicates／uniqueの前に必ずソートしておく。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.drop_duplicates',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.unique.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-21',
    },
  },
  {
    slug: 'between',
    title: 'between',
    category: 'filtering',
    summary: '値が指定した範囲内（両端を含む）にあるかを判定する。',
    snowparkCode: 'col("age").between(20, 29)',
    polarsCode: 'pl.col("age").is_between(20, 29)',
    difference:
      '名前は違うが（`between`↔`is_between`）、**両端を含む**という定義まで一致する。実行して確認したところ、`[5,10,15,20]`に対する`is_between(10,15)`は`[False,True,True,False]`＝境界値の`10`と`15`もどちらも`True`になる。',
    pitfall:
      'Polarsの`is_between`には`closed`引数があり、`"both"`（既定・両端含む）以外に`"left"`（下限のみ含む）・`"right"`（上限のみ含む）・`"none"`（どちらも含まない）を指定できる。Snowparkの`between`にはこの調整機能が無く常に両端を含む固定の挙動なので、**片端だけ除きたい場合はSnowpark側では`(col >= lower) & (col < upper)`のように自分で組み立てる必要がある**。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Column.between',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.is_between.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-31',
    },
  },
  {
    slug: 'is-in',
    title: 'in_ / isin',
    category: 'filtering',
    summary: '値が指定したリストの中に含まれるかを判定する。',
    snowparkCode: 'col("status").in_("active", "pending")  # isin() は in_() の別名',
    polarsCode: 'pl.col("status").is_in(["active", "pending"])',
    difference:
      'SnowparkはSQLの`IN`句に変換され、候補値を**可変長引数**として並べる（`in_("active","pending")`）か、リストを1つ渡すこともできる。Polarsの`is_in`は**リストを1つの引数として渡す**形に統一されている。実行して確認したところ、判定結果自体は同じ。',
    pitfall:
      'Snowparkの`in_`は`isin`という**別名（エイリアス）**も持つ（`inspect`で両方の実在を確認）。どちらを使っても同じだが、コードによって呼び方が揺れやすい。移植時は片方だけを探して「無い」と誤解しないよう、両方の名前で存在しうることを踏まえておく。',
    snowparkDocUrl: 'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.Column.in_',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.is_in.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-31',
    },
  },
];
