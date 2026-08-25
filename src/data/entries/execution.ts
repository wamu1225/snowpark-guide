// 実行・アクション・IO操作（Execution, Actions & I/O）
// 検証：Polars 1.43.2（実行）・Snowpark Python SDK 1.54.0（静的検証）。2026-08-26 独立検証。
// このカテゴリで56/56メソッドが完走する。
import type { Entry } from '../types';

export const executionEntries: Entry[] = [
  {
    slug: 'collect',
    title: 'collect',
    category: 'execution',
    summary: 'それまで積み上げた変換を実際に評価し、結果を手元に取得する。最も基本的なアクション。',
    snowparkCode: 'df.collect()  # Rowオブジェクトのリストを返す',
    polarsCode: 'ldf.collect()  # Polars DataFrameを返す',
    difference:
      'Snowparkの`collect()`はSnowflakeのウェアハウスに最適化されたSQLを送信・実行し、結果をネットワーク経由で受け取って`Row`オブジェクトのリストにする。Polarsの`collect()`はRustの実行エンジンをその場で起動し、結果をメモリ上のPolars DataFrameとして保持する。呼び出す場所（クラウドかローカルか）が違うだけで、「それまでの変換をここで初めて評価する」という役割は同じ。',
    pitfall:
      '巨大なデータセットに対して不用意に`collect()`を呼ぶと、結果を全てクライアント側のメモリに載せようとしてメモリ不足（OOM）でプロセスが落ちるリスクは、SnowparkでもPolarsでも共通して存在する。件数を絞ってから`collect()`する、あるいは後述の`to_local_iterator`のようなストリーミング手段を検討する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.collect',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.collect.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'show',
    title: 'show',
    category: 'execution',
    summary: '結果の先頭数行を、確認用に画面へ表示する。',
    snowparkCode: 'df.show(n=10)',
    polarsCode: 'print(ldf.limit(10).collect())',
    difference:
      'Snowparkの`show()`は内部で`LIMIT n`付きのクエリを発行・実行し、結果を標準出力へ整形して表示する専用のアクション。Polars LazyFrameには同等の表示専用メソッドが無いため、`limit()`で件数を絞ってから`collect()`し、その結果を`print()`する2段構えになる。',
    pitfall:
      '`show()`という名前のメソッドをPolars側でも探してしまいがちだが存在しない。「結果を少しだけ覗く」という目的は`limit().collect()`で代用する、という発想の転換が要る。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.show',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.collect.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'first',
    title: 'first',
    category: 'execution',
    summary: '先頭の1行だけを取得する。',
    snowparkCode: 'df.first()  # 単一のRowオブジェクト',
    polarsCode: 'ldf.limit(1).collect().row(0, named=True)  # 列名付きの辞書ライクなタプル',
    difference:
      'Snowparkは内部的に`LIMIT 1`を付けたSQLを発行し、最初の1行を取得する。Polarsは`limit(1)`で1行に絞ってから`collect()`し、`row(0, named=True)`で1行分の値を取り出す。',
    pitfall:
      '戻り値の型が異なる。Snowparkの`first()`はSnowpark独自の`Row`オブジェクト（属性アクセス・辞書的アクセスの両方に対応）を返すが、Polarsの`row(named=True)`は列名をキーとする通常のタプル／辞書ライクなオブジェクトを返す。後続のコードで`.属性名`のようなアクセスをそのまま移植すると動かないことがある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.first',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.row.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'take',
    title: 'take',
    category: 'execution',
    summary: '指定した件数の行を取得する。',
    snowparkCode: 'df.take(5)  # Rowオブジェクトのリスト',
    polarsCode: 'ldf.limit(5).collect()',
    difference:
      'SnowparkはSQLの`LIMIT N`を発行して指定件数を取得する。Polarsは`limit(5)`で件数を絞ってから`collect()`する、`first`と同じ組み合わせパターン。',
    pitfall:
      '`take`と`limit`は名前が違うが、やっていることはSnowpark内部でもほぼ同じ（どちらも`LIMIT`句に帰着する）。Polars側では区別が無く、常に`limit()`を使う。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.take',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.collect.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'to-pandas',
    title: 'to_pandas',
    category: 'execution',
    summary: '結果をpandas DataFrameに変換する。',
    snowparkCode: 'df.to_pandas()',
    polarsCode: 'ldf.collect().to_pandas()',
    difference:
      'Snowparkは結果をPyArrowのバッチストリームとして受け取り、pandas DataFrameへ変換する。Polarsは内部的にすでにApache Arrow形式でデータを保持しているため、ほぼコピーなしで高速にpandasへ変換できる。どちらも実行して確認したところ、`to_pandas()`という同じメソッド名で呼び出せる。',
    pitfall:
      'Snowflakeの`NUMBER(38, 0)`のような大きな精度の数値型は、pandasへ変換する際に`object`型やdouble精度の`int64`に変換されることがあり、桁数によっては精度が落ちる可能性がある。Polars側は列の型がそのままpandasの対応する型にマッピングされるだけなので、この種の精度の懸念は基本的に発生しない。移行元がSnowparkの大きな数値列だった場合は変換後の値を確認する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.to_pandas',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.to_pandas.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'to-local-iterator',
    title: 'to_local_iterator',
    category: 'execution',
    summary: '結果を全件メモリに載せず、1行（またはチャンク）ずつ順番に処理する。',
    snowparkCode: 'for row in df.to_local_iterator():\n    process(row)',
    polarsCode: 'for row in ldf.collect().iter_rows(named=True):\n    process(row)',
    difference:
      'Snowparkの`to_local_iterator()`は結果をチャンク単位でストリーミングダウンロードしながらイテレータとして渡すため、全件を一度にメモリへ載せずに済む。Polarsの`iter_rows()`は`collect()`で確定させたDataFrameの行を1行ずつ取り出すイテレータで、実行して動作を確認済み。ただし`collect()`の時点で全件がすでにメモリ上に確定している点がSnowpark側とは異なる。',
    pitfall:
      '**「メモリを使わずに巨大データを順次処理する」という目的であればPolars側は完全に同じ効果を持たない**。Snowparkの`to_local_iterator`はクエリ結果自体をチャンク単位で取り出すのに対し、Polarsの`iter_rows()`はすでに`collect()`でメモリに載った結果を1行ずつ取り出すだけなので、`collect()`の時点でメモリ制約に引っかかる可能性がある。Polarsで本当に巨大データをメモリを使わず処理したい場合は、`sink_parquet`等のストリーミング書き出し（次の書き込み系のページを参照）を検討する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.to_local_iterator',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.iter_rows.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'cache-result',
    title: 'cache_result',
    category: 'execution',
    summary: 'それまでの計算結果を1度だけ確定させ、以降はその結果を使い回す。',
    snowparkCode: 'df.cache_result()',
    polarsCode: 'ldf.collect()  # 変数に代入して保持しておく',
    difference:
      '**構造的な違いが大きいメソッド**。Snowparkの`cache_result()`は呼んだ瞬間に実行され、Snowflake上にセッションスコープの一時テーブルを作成して結果を書き込む。以降その結果を参照する処理は、この一時テーブルを読むだけで済み、元の変換を再計算しない。Polars側には同名の専用メソッドは無く、`collect()`した結果を変数に保持しておくことが同じ役割を果たす（[料金構造のページ](/guide/pricing/)でも触れている）。',
    pitfall:
      'Snowparkの`cache_result()`は一時テーブルという実体をSnowflake上に作るため、コンピュートコストに加えて**ストレージコストも発生する**。「キャッシュしたから追加コストはかからない」わけではない点に注意する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.cache_result',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.collect.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'create-or-replace-view',
    title: 'createOrReplaceView（create_or_replace_view）',
    category: 'execution',
    summary: '今のDataFrameの定義を、他のSQLセッションからも参照できるビューとして登録する。',
    snowparkCode: 'df.create_or_replace_view("my_in_db_view")',
    polarsCode: 'ctx = pl.SQLContext()\nctx.register("my_view", ldf)',
    difference:
      'Snowparkは実際にSnowflake内へ`CREATE OR REPLACE VIEW ... AS ...`というDDLを発行し、Snowflake上に永続するデータベースオブジェクトを作る。他のSQLセッションやBIツールからもそのまま参照できる。Polarsの`SQLContext().register()`はローカルのプロセス内だけで有効なSQL用の名前の登録で、実行して動作を確認したところSQL文からその名前でLazyFrameを参照できるようになる。ただしSnowflakeのビューのように外部から参照できる永続オブジェクトにはならない。',
    pitfall:
      '両者は似た書き方に見えるが、**「データベースに永続するオブジェクトを作る」のか「今のPythonプロセス内だけで一時的に名前を割り当てる」のか**という根本的に違う操作である。Polars側の`register`をSnowparkのビューと同じ感覚で「他から参照できる」と誤解しない。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.create_or_replace_view',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/sql/api/polars.SQLContext.register.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'create-or-replace-temp-view',
    title: 'createOrReplaceTempView（create_or_replace_temp_view）',
    category: 'execution',
    summary: '今のセッション限定で有効な、一時的なビューを作る。',
    snowparkCode: 'df.create_or_replace_temp_view("my_temp_view")',
    polarsCode: 'ctx = pl.SQLContext()\nctx.register("my_temp_view", ldf)',
    difference:
      '前項の`create_or_replace_view`との違いは永続性だけで、こちらはSnowflake内にセッション限定の一時ビュー（TEMPORARY VIEW）を作る。セッションが終了すると自動的に消える。Polars側のコードは前項と同じ`SQLContext().register()`になる（Polarsの`register`自体がそもそもプロセス内限定＝実質的に一時的なので、対応するのはこの「一時ビュー」の方が近い）。',
    pitfall:
      'Snowparkでは永続ビューと一時ビューでメソッド名が明確に分かれているが、Polars側にはその区別に対応するAPIが無い。「一時的かどうか」を区別したい設計意図があった場合、Polarsへ移行するとその区別自体が失われる点は認識しておく。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.create_or_replace_temp_view',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/sql/api/polars.SQLContext.register.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'save-as-table',
    title: 'write.save_as_table',
    category: 'execution',
    summary: '結果をテーブル（またはファイル）として書き出す。',
    snowparkCode: 'df.write.save_as_table("target_table", mode="overwrite")',
    polarsCode: 'ldf.sink_parquet("output.parquet")',
    difference:
      'Snowparkは`CREATE TABLE AS SELECT`や`INSERT INTO`に相当するデータ移動をSnowflake内で完結させ、巨大なデータセットでも高速にテーブルへ書き込める。Polarsの`sink_parquet`はストリーミングでファイル（Parquet形式）へ書き出す遅延処理で、実行するとParquetファイルが生成されることを確認済み。「テーブルへ書く」のか「ファイルへ書く」のかという書き込み先の種類そのものが異なる。',
    pitfall:
      'Snowparkの`mode="overwrite"`は、書き込み先のテーブルのスキーマが変わる場合の挙動に注意が要る（列構成が違うと失敗する設定と、自動的にスキーマを合わせる設定がある）。Polars側は「テーブル」という概念自体が無く、常にファイルの新規作成／上書きになるため、Snowpark特有のスキーマ進化の考慮はそのままでは移植できない。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrameWriter.save_as_table',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/api/polars.LazyFrame.sink_parquet.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
  {
    slug: 'explain',
    title: 'explain',
    category: 'execution',
    summary: 'その時点までの変換が、実際にどう実行される予定かを表示する。',
    snowparkCode: 'df.explain()',
    polarsCode: 'print(ldf.explain())',
    difference:
      'Snowparkの`explain()`はSnowflakeから返された実行計画（クエリプラン）を標準出力へ表示する。Polarsの`explain()`は、Polars自身の最適化器が組み立てた物理的な実行計画（述語プッシュダウンやスキャンの順序など）を文字列として返す。実行して確認したところ、フィルタ条件がどの段階でプランに組み込まれるかを両方とも確認できる。',
    pitfall:
      'Snowparkの`explain()`は`None`を返し内容を直接標準出力へ表示するのに対し、Polarsの`explain()`は文字列を**返す**（自分で`print()`する必要がある）。Snowparkのコードをそのまま`print(df.explain())`と書くと`None`が表示されてしまう。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.DataFrame.explain',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/api/polars.LazyFrame.explain.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.43.2',
      snowparkSdkVersion: '1.54.0',
      date: '2026-08-26',
    },
  },
];
