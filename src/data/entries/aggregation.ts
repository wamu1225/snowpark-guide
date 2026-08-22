// 集約・構造変換（Grouping, Aggregation & Reshaping）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-22 独立検証。
// pivotは①の先行レポートに誤りがあったため、本ページの内容は実機再検証にもとづく（下記pitfall参照）。
import type { Entry } from '../types';

export const aggregationEntries: Entry[] = [
  {
    slug: 'group-by',
    title: 'group_by / groupBy',
    category: 'aggregation',
    summary: '指定した列の値でグループ化する。集約する前段階として使う。',
    snowparkCode: 'df.group_by("department")',
    polarsCode: 'ldf.group_by("department")',
    difference:
      'どちらも、この時点ではまだ集約を実行しない。グループ化キーを保持した中間オブジェクト（Snowparkは`RelationalGroupedDataFrame`、Polarsは`LazyGroupBy`）を返し、後続の`agg()`呼び出しを待つ設計が共通している。',
    pitfall:
      'Snowparkはキャメルケースの`groupBy`も別名として使えるが、Polarsはスネークケースの`group_by`に統一されている。SnowparkのコードをPolarsへそのまま移植するとき`groupBy`と書いてしまうと存在しないメソッドになる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.group_by',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.group_by.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'agg',
    title: 'agg',
    category: 'aggregation',
    summary: 'group_byで作ったグループごとに、集約の計算をまとめて指定する。',
    snowparkCode: 'df.group_by("department").agg(sum_("salary").alias("total_sal"), avg("age"))',
    polarsCode: 'ldf.group_by("department").agg(pl.col("salary").sum().alias("total_sal"), pl.col("age").mean())',
    difference:
      'SnowparkはGROUP BYを含む集約SQLに変換される。Polarsはグループごとの集約計算をマルチスレッドで並列実行し、単純な合計・平均だけでなく任意の複雑な式（フィルタ済みの合計など）もExpressionとしてそのまま書ける。',
    pitfall:
      'Polarsでは複数の集約式を渡すとき、`.agg(式1, 式2)`のように可変長引数で渡す書き方が現行版では一般的（リストでまとめて渡す古い書き方も動くが、可変長引数の方が読みやすい）。実行して確認したところ、複数式を渡した場合も1回のgroup_byで正しく集計される。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.RelationalGroupedDataFrame.agg',
    polarsDocUrl:
      'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.lazyframe.group_by.LazyGroupBy.agg.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'count',
    title: 'count',
    category: 'aggregation',
    summary: '行数を数える。',
    snowparkCode: 'df.count()',
    polarsCode: 'ldf.select(pl.len()).collect()',
    difference:
      'Snowparkの`count()`はアクションで、呼んだ瞬間に`SELECT COUNT(*) FROM ...`が発行されて整数値が返る（遅延評価の対象外）。Polarsの`pl.len()`は他の式と同じように遅延評価される式で、`select`に載せて`collect()`するまで実際には数えない。',
    pitfall:
      'Snowparkの`count()`は他の変換メソッドと違って**即座に実行される**（アクションである）点を見落としやすい。チェーンの途中に`count()`を挟むと、そこで一旦ウェアハウスへのクエリが発行されてしまう（[料金構造のページ](/guide/pricing/)も参照）。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.count',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.len.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'sum',
    title: 'sum',
    category: 'aggregation',
    summary: '列の値を合計する。',
    snowparkCode: 'df.select(sum_("salary"))',
    polarsCode: 'ldf.select(pl.col("salary").sum())',
    difference: 'SnowparkはSQLの`SUM`関数に変換される。PolarsはExpressionの`.sum()`メソッドとして式に組み込まれる。',
    pitfall:
      'Snowparkの合計関数はPythonの組み込み`sum`と名前が衝突するため、`snowflake.snowpark.functions`から`sum as sum_`のように別名でインポートするのが実務上の定石。そのままインポートすると組み込み関数を上書きしてしまう。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.sum',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.sum.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'mean',
    title: 'avg / mean',
    category: 'aggregation',
    summary: '列の値の平均を求める。',
    snowparkCode: 'df.select(avg("age"))',
    polarsCode: 'ldf.select(pl.col("age").mean())',
    difference: '計算内容は同じ単純平均。呼び方だけが異なる。',
    pitfall:
      'メソッド・関数の名前がAPI間で違う（Snowpark: `avg`、Polars: `mean`）。どちらも「平均」だが、片方の名前をもう片方に書いてしまう取り違えが起きやすい。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.avg',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.mean.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'min',
    title: 'min',
    category: 'aggregation',
    summary: '列の最小値を求める。',
    snowparkCode: 'df.select(min_("age"))',
    polarsCode: 'ldf.select(pl.col("age").min())',
    difference: 'どちらも対応するSQL/Expressionの最小値集約に変換される。挙動の違いは無い。',
    pitfall:
      'Snowparkの`min`もPythonの組み込み`min`と名前が衝突するため、`sum`と同様に別名インポート（`min as min_`）が実務上の定石。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.min',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.min.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'max',
    title: 'max',
    category: 'aggregation',
    summary: '列の最大値を求める。',
    snowparkCode: 'df.select(max_("age"))',
    polarsCode: 'ldf.select(pl.col("age").max())',
    difference: 'どちらも対応するSQL/Expressionの最大値集約に変換される。挙動の違いは無い。',
    pitfall: '`sum`・`min`と同じ理由で、Snowparkの`max`もPythonの組み込みと衝突するため別名インポートが定石。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.max',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.max.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'pivot',
    title: 'pivot',
    category: 'aggregation',
    summary: '行の値を列に展開する（縦持ちから横持ちへ）。',
    snowparkCode: 'df.pivot("department", ["sales", "eng"]).sum("salary")',
    polarsCode: 'ldf.pivot(on="department", on_columns=["sales", "eng"], values="salary", aggregate_function="sum")',
    difference:
      'SnowparkはSQLのPIVOT構文に直結し、展開する列名の一覧を静的に指定することでクエリレベルで安全に列を生成する。Polarsはメモリ上でハッシュテーブルを組み替えて新しい列を作る。',
    pitfall:
      '**Polars 1.43.2では`LazyFrame.pivot()`を直接呼び出せる**（実機で確認済み）。ただし`DataFrame`（Eager）版の`pivot()`と違い、**`on_columns`（展開後の列名の一覧）を明示的に渡すことが必須**で、省略すると`TypeError`になる。「LazyFrameからpivotは呼べず必ずcollect()を挟む必要がある」という情報を見かけることがあるが、少なくとも1.43.2ではこれは誤りで、正しくは「呼べるが`on_columns`の指定が必須」という違いになる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.pivot',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.pivot.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
  {
    slug: 'unpivot',
    title: 'unpivot',
    category: 'aggregation',
    summary: 'pivotの逆。複数列を1つの列にまとめる（横持ちから縦持ちへ）。',
    snowparkCode: 'df.unpivot("value_col", "name_col", ["col_2021", "col_2022"])',
    polarsCode: 'ldf.unpivot(on=["col_2021", "col_2022"], variable_name="name_col", value_name="value_col")',
    difference: 'SnowparkはSQLのUNPIVOT構文に変換される。Polarsは列を縦方向に展開するアルゴリズムを実行する。',
    pitfall:
      '引数の並び順の意味がAPI間で異なる。Snowparkは(値の列名, 変数の列名, 対象列一覧)の順の位置引数だが、Polarsはキーワード引数（`on`・`variable_name`・`value_name`）で指定する。位置だけを見て移植すると引数の意味を取り違える。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.unpivot',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.unpivot.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-22',
    },
  },
];
