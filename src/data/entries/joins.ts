// 結合・集合演算（Joins & Set Operations）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-23 独立検証。
import type { Entry } from '../types';

export const joinsEntries: Entry[] = [
  {
    slug: 'join',
    title: 'join',
    category: 'joins',
    summary: '2つのDataFrameを結合する。',
    snowparkCode: 'df1.join(df2, df1["id"] == df2["id"], how="inner")',
    polarsCode: 'ldf1.join(ldf2, on="id", how="inner")',
    difference:
      'SnowparkはINNER JOIN等のSQL演算に変換され、Snowflakeのオプティマイザが結合アルゴリズムを選ぶ。Polarsはローカルの最適化器がハッシュジョインなどを実行する。どちらも遅延評価の対象で、実際の結合は後段のアクション/collectまで行われない。',
    pitfall:
      '同名のキー列がある場合の挙動が違う。Snowparkは結合後に同名列が2つ残り、そのままではどちらの列か曖昧になってエラーになりやすい。Polarsは`on="id"`のように結合キーを指定すると、そのキー列は1つに整理される（実機で確認済み）。ただしキー以外の同名列は`_right`のような接尾辞つきの別名で両方残る。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.join',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.join.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
  {
    slug: 'union',
    title: 'union',
    category: 'joins',
    summary: '2つのDataFrameを縦に連結し、重複行を取り除く。',
    snowparkCode: 'df1.union(df2)',
    polarsCode: 'pl.concat([ldf1, ldf2]).unique()',
    difference:
      'SnowparkのunionはSQLのUNION（重複排除あり）を発行する。Polarsの`pl.concat`は既定では単純な垂直連結だけを行い、重複排除はしないため`.unique()`を明示的に呼ぶ必要がある。',
    pitfall:
      'Snowparkの`union`は重複を取り除く点が、他の多くのフレームワークの「union」という言葉から連想する挙動（単純な連結）と異なる。「重複を残したい」ときは次に説明する`union_all`を使う。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.union',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/api/polars.concat.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
  {
    slug: 'union-all',
    title: 'union_all / unionAll',
    category: 'joins',
    summary: '2つのDataFrameを縦に連結する。重複行はそのまま残す。',
    snowparkCode: 'df1.union_all(df2)',
    polarsCode: 'pl.concat([ldf1, ldf2], how="vertical")',
    difference:
      'SnowparkはSQLのUNION ALLに変換される。Polarsは`pl.concat`に`how="vertical"`（既定値でもある）を指定した単純な縦連結で、実行して確認したところ重複行はそのまま残る。',
    pitfall:
      '連結する2つのDataFrame/LazyFrameの列名と列数が一致している必要がある。列構成が異なる場合にエラーになる点は両APIで共通なので、スキーマが違う可能性があるときは次の`union_by_name`を検討する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.union_all',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/api/polars.concat.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
  {
    slug: 'union-by-name',
    title: 'union_by_name / unionByName',
    category: 'joins',
    summary: '列の並び順ではなく列名を基準に2つのDataFrameを連結する。',
    snowparkCode: 'df1.union_by_name(df2)',
    polarsCode: 'pl.concat([ldf1, ldf2], how="diagonal")',
    difference:
      '列名にもとづいてスキーマの異なるDataFrameを結合し、片方にしかない列はもう片方でNULLになる。実行して確認したところ、Polarsの`how="diagonal"`も同様に不足列をnullで埋めて連結する。',
    pitfall:
      'Snowparkの`union_by_name`には`allow_missing_columns`という引数があり、既定では列が完全に一致しないとエラーになる（明示的にTrueを渡すと不足列を許容する）。Polars側は`how="diagonal"`を指定した時点で不足列の補完が既定の挙動になっており、両者で「列不足を許容するかどうか」の既定値が異なる点に注意。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.union_by_name',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/api/polars.concat.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
  {
    slug: 'intersect',
    title: 'intersect',
    category: 'joins',
    summary: '2つのDataFrameの両方に存在する行だけを残す（積集合）。',
    snowparkCode: 'df1.intersect(df2)',
    polarsCode: 'ldf1.join(ldf2, on=ldf1.collect_schema().names(), how="semi")',
    difference:
      'SnowparkはSQLのINTERSECTに変換される。Polarsの`LazyFrame`には直接のintersectメソッドが無いため、全列をキーにした`semi`結合で代用する。実行して確認したところ、この書き方で正しく積集合が得られる。',
    pitfall:
      '`how="semi"`結合は「もう片方に一致する行があるかどうか」だけを見る結合で、通常のjoinと違って結合相手側の列は出力に含まれない（左側の列だけが残る）。SQLのINTERSECTとは呼び方も返す列も違う概念なので、単純な言い換えとして覚えるより「semi結合」という独立した仕組みとして理解する方が誤解が少ない。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.intersect',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.join.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
  {
    slug: 'subtract',
    title: 'subtract / except_',
    category: 'joins',
    summary: '片方のDataFrameから、もう片方にも存在する行を取り除く（差集合）。',
    snowparkCode: 'df1.subtract(df2)  # df1.except_(df2) でも同じ',
    polarsCode: 'ldf1.join(ldf2, on=ldf1.collect_schema().names(), how="anti")',
    difference:
      'SnowparkはSQLのEXCEPT（別名MINUS）に変換される。`subtract`と`except_`はSnowpark側の別名で、どちらを呼んでも同じ結果になる。Polars側は全列をキーにした`anti`結合（もう片方に一致する行を除外する結合）で代用する。実行して確認済み。',
    pitfall:
      '`except_`という名前は、Pythonの予約語`except`と衝突しないよう末尾にアンダースコアが付いている。うっかり`except`と書くとPythonの構文エラーになる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.except_',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.join.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-23',
    },
  },
];
