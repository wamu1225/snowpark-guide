// 基礎知識・概要（Layer A）。関数リファレンス（Layer B = entries/）は「引く」場所、
// こちらは「読む」場所。相互リンクは EntryPage 側で relatedEntrySlugs を逆引きして表示する。
// 実行検証ができない領域のため、本文は公式ドキュメントの記載に厳密に沿って書く（体感・推測を書かない）。
export type ConceptPage = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  relatedEntrySlugs: string[];
  sources: { label: string; url: string }[];
  verifiedDate: string;
};

export const CONCEPTS: ConceptPage[] = [
  {
    slug: 'architecture',
    title: 'Snowparkのアーキテクチャと実行の仕組み',
    summary: '自分のPythonコードは、結局どこで動いているのか。クライアント・Snowflake・UDFという3つの実行場所を切り分けて説明します。',
    body: `## 「どこで動くか」は1つではなく3種類ある

Snowparkのコードを読むとき、「Pythonなのだから手元のマシンで動く」と思ってしまいがちですが、実際には**3種類の場所**に処理が分かれています。

1. **クライアント側**：あなたが書いたPythonのスクリプト自体（DataFrameの変換メソッドを呼ぶ部分）
2. **Snowflake側（SQLエンジン）**：フィルタ・結合・集計など、実際のデータ処理
3. **Snowflake側（UDFのサンドボックス）**：あなたが書いたPython関数の**中身**が、条件によってはこちらで動く

この3つを区別せずに「Pythonはクライアントで動く」「SQLはSnowflakeで動く」とだけ覚えると、UDFを使った瞬間に混乱します。順番に見ていきます。

## 1. クライアント側で動くのは「計画を組み立てるコード」だけ

\`select\`・\`filter\`・\`join\`のような変換メソッドを呼ぶ**Pythonの文自体は、間違いなくクライアント側（あなたのスクリプトを実行しているマシン）で動きます**。ここは動かしようのない事実です。

ただし、このPythonコードが実際に**行っていること**は、データの処理ではありません。「この列を選ぶ」「この条件で絞り込む」という指示を、内部的な論理プラン（実行計画）として積み上げているだけです。Snowflake公式ドキュメントも「DataFrameは、データを取得するために評価される必要のあるクエリのようなものである」と説明しており、変換メソッドは「SQL文の組み立て方を指定するだけで、Snowflakeデータベースからデータを取得しない」と明記しています。

\`\`\`python
# ここまでの4行は、すべてクライアント側のPythonが実行される。
# しかし「実行される」のは論理プランの組み立てであって、
# テーブルの中身が読まれたり、フィルタが適用されたりは一切していない。
df2 = df.select("customer_id", "amount")
df3 = df2.filter(col("amount") > 100)
df4 = df3.join(other_df, "customer_id")
print("ここまで到達。まだSnowflakeには何も送っていない。")

# ここで初めてSQLが組み立てられ、Snowflakeへ送信・実行される。
result = df4.collect()
\`\`\`

## 2. 実際のデータ処理はSnowflakeのウェアハウスで動く

\`collect()\`・\`count()\`・\`show()\`・\`save_as_table()\`のような**アクションメソッド**を呼んだ瞬間、それまで積み上げた論理プランがSQL文に変換され、Snowflakeの仮想ウェアハウスへ送信されて実行されます。テーブルの読み取り・結合・絞り込みといった実際のデータ処理はすべてここで行われ、処理結果だけがクライアントへ返ってきます。

## 3. UDFの中身はクライアントではなくSnowflake側で動く

ここが最も誤解されやすい点です。Pythonで書いたUDF（ユーザー定義関数）は、**定義自体はクライアント側で書きますが、実行されるのはSnowflake側**です。Snowflake公式ドキュメントは「UDFを呼び出すと、Snowparkはあなたの関数をデータのある場所＝サーバー側で実行する」と明記しています。UDFの中でPythonの通常のライブラリを使っていても、それはSnowflakeのウェアハウス内で動いており、あなたの手元のマシンでは実行されていません。

## なぜこの設計になっているか

変換をまとめてSQLへ変換してからSnowflakeへ送ることで、Snowflakeのクエリオプティマイザが変換全体を見渡して最適化できます。UDFの実行場所をSnowflake側に寄せているのも同じ理由で、データをクライアントへ転送せずに済み、ペタバイト規模のデータでも同じコードで処理できます。

## 実務でどう効くか

- **「なぜかコードが速く終わる」の正体**：\`select\`や\`filter\`を何行書いても、Snowflakeへは何も送られていません。「実行が速い」のではなく「まだ何も実行していない」だけ、というケースがよくあります。処理時間を計測するときは、必ずアクションメソッドを呼んだ地点で計測します。
- **UDFのデバッグが手元のprint文で追えない理由**：UDFの中身はSnowflake側で動くため、クライアント側のターミナルに\`print()\`の出力はそのまま出てきません（Snowflakeのクエリ履歴やログから確認する必要があります）。「手元でデバッグできない」のはバグではなく、実行場所が違うことの当然の帰結です。
- **ネットワーク越しに動くのは「結果」だけ**：中間データがクライアントとSnowflakeの間を行き来することはなく、やり取りされるのは最終的な結果だけです。大きな中間テーブルを扱っても、ネットワーク帯域を心配する必要は基本的にありません。`,
    relatedEntrySlugs: ['select', 'filter'],
    sources: [
      {
        label: 'Snowflake Documentation: Working with DataFrames in Snowpark Python',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark/python/working-with-dataframes',
      },
      {
        label: 'Snowflake Documentation: Creating UDFs for DataFrames in Python（UDFの実行場所について）',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark/python/creating-udfs',
      },
    ],
    verifiedDate: '2026-08-26',
  },
  {
    slug: 'vs-spark',
    title: 'Snowpark と Apache Spark の違い',
    summary: 'DataFrame APIの書き味はよく似ていますが、クラスタを自分で持つか持たないかで運用とコストの構造がまったく変わります。',
    body: `## クラスタを自分で管理するかどうか

Apache SparkとSnowparkは、どちらも遅延評価の分散DataFrame APIという点で似ています。実際、後述するようにコードの見た目もかなり近くなります。しかし、その裏側にあるインフラは大きく異なります。

Sparkはユーザー自身がドライバーノードとワーカーノードから成る計算クラスタ（多くはJVM環境）を用意し、管理する必要があります。メモリ設定やネットワークのチューニング、Sparkのバージョンアップ対応もユーザーの責任範囲です。一方でSnowparkは、Snowflakeが提供するフルマネージドな環境（Virtual Warehouse）の上で動くため、そうしたクラスタ運用の作業そのものが発生しません。

## データの転送（Egress）が要るかどうか

Snowflake上に蓄積されたデータをSparkクラスタ側で処理しようとすると、データを一度Snowflakeの外へ転送する必要が生じる場合があります。この転送にはネットワーク費用や転送時間がかかり、データがSnowflakeの外に出ることによるセキュリティ上の考慮も増えます。Snowparkはデータが存在するのと同じ基盤（Snowflake内部）の上でコードが評価されるため、こうした転送が発生しません。

## コードの見た目はかなり近い（ただし呼び方に注意）

Snowpark PythonのDataFrame APIは、PySparkのDataFrame APIを強く意識して設計されています。\`select\`・\`filter\`・\`join\`・\`limit\`のような単語1つのメソッドはPySparkとSnowparkで**同名・同じ使い方**です。

\`\`\`python
# PySpark（1台以上のクラスタで実行）
result = (
    df.filter(col("amount") > 100)
      .groupBy("customer_id")
      .agg(F.avg("amount").alias("avg_amount"))
      .orderBy("avg_amount", ascending=False)
      .limit(10)
)

# Snowpark（Snowflakeのウェアハウス上で実行）
result = (
    df.filter(col("amount") > 100)
      .group_by("customer_id")
      .agg(F.avg("amount").alias("avg_amount"))
      .sort(col("avg_amount").desc())
      .limit(10)
)
\`\`\`

違いが出るのは複合語のメソッド名です。PySparkは\`groupBy\`・\`withColumn\`のようにcamelCaseが標準ですが、Snowparkは\`group_by\`・\`with_column\`のようにsnake_caseが標準です。**Snowparkは実は\`groupBy\`・\`withColumn\`・\`orderBy\`というcamelCaseのエイリアスも内部に持っており、PySparkと同じ綴りでも動きます**（SDKのクラス定義を実機で確認済み）。ただしSnowflake公式のサンプルコードはsnake_caseで統一されているため、新規に書くならsnake_caseに合わせておくのが無難です。

## コストの発生の仕方

Snowflakeの仮想ウェアハウスは秒単位（起動時のみ60秒の最低課金あり）で課金され、一定時間操作がなければ自動的に一時停止（オートサスペンド）し、次のクエリが来ると自動的に再開（オートレジューム）します。Sparkクラスタは、常時起動させておくか、都度起動・停止させるオーバーヘッドを引き受けるかのどちらかになります。

## Snowparkに移行すべきケース／すべきでないケース

- **移行に向く**：処理対象のデータがもともとSnowflake上にあり、Sparkクラスタへの転送だけのために別インフラを維持している場合。クラスタの空き容量やジョブスケジューリングの運用自体が負担になっている場合。
- **移行に向かない**：Snowflake以外の複数のデータソース（S3・Kafkaのストリーム・オンプレのDBなど）を1つのジョブでまたいで処理する必要がある場合。SparkはSnowflake専用ではなく汎用の分散処理基盤であるため、こうした異種データソースの統合処理はSparkの守備範囲であり、Snowparkの範囲外です。
- **判断の軸**：「処理の対象データがSnowflakeで完結しているか」がそのまま判断基準になります。完結しているならSnowparkでクラスタ運用そのものを無くせますが、完結していないならSparkの汎用性が必要です。`,
    relatedEntrySlugs: ['group-by', 'filter'],
    sources: [
      {
        label: 'Snowflake Documentation: Overview of Warehouses（課金・オートサスペンド/レジューム）',
        url: 'https://docs.snowflake.com/en/user-guide/warehouses-overview',
      },
      {
        label: 'Snowflake Documentation: Working with DataFrames in Snowpark Python',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark/python/working-with-dataframes',
      },
    ],
    verifiedDate: '2026-08-27',
  },
  {
    slug: 'vs-polars',
    title: 'Snowpark と Polars の違い（総論）',
    summary: 'どちらも遅延評価を採用しているが、計算がどこで走るか（クラウドかローカルか）が根本的に異なります。使い分けの軸を整理します。',
    body: `## 「遅延評価」という共通点

Snowpark DataFrameとPolars LazyFrameは、どちらも「評価をできるだけ先延ばしにして、まとめて最適化する」という遅延評価の設計思想を共有しています。このサイトの各メソッドページで頻繁に「両方とも遅延評価で……」という説明が出てくるのはこのためです。

## 計算がどこで走るかが違う

共通点はここまでで、実行される場所は対照的です。

- **Snowpark**：Snowflakeの分散SQLエンジン上、クラウドのVirtual Warehouseで実行される
- **Polars**：手元のマシンのCPU（またはローカルの分散環境）上、Rustで書かれたPolars自身の実行エンジンがApache Arrow形式のメモリ上で処理する

Snowparkはネットワークの向こう側にあるクラウドの計算資源を使い、ペタバイト級のデータをマルチノードで処理できます。Polarsは基本的に手元の1台のマシン（マルチコアで並列化）で完結する処理で、外部にデータを送信しません。

## コードの形はほぼ重なる

同じ「フィルタ→集計→並べ替え→上位N件」という処理を書くと、両者の構文は非常に近くなります。

\`\`\`python
# Polars（手元のマシンで実行）
result = (
    df.filter(pl.col("amount") > 100)
      .group_by("customer_id")
      .agg(pl.col("amount").mean().alias("avg_amount"))
      .sort("avg_amount", descending=True)
      .limit(10)
)
print(result.collect())

# Snowpark（Snowflakeのウェアハウスで実行）
result = (
    df.filter(col("amount") > 100)
      .group_by("customer_id")
      .agg(F.avg("amount").alias("avg_amount"))
      .sort(col("avg_amount").desc())
      .limit(10)
)
result.show()
\`\`\`

上のPolars側のコードは実際に実行し、\`customer_id=2\`の平均200・\`customer_id=1\`の平均150という結果になることを確認済みです。式の組み立て方（\`col\`で列を指定し、メソッドをチェーンする）まで含めてほとんど同じ書き方に見えますが、\`result.collect()\`が実行された瞬間に**どちらのマシンで**計算が走るかがまったく違う、という点がこのページの主題です。

## 評価を起動するメソッドの違い

遅延評価を実際に実行させる「引き金」のメソッドも異なります。

- **Snowpark**：\`collect()\` ／ \`show()\` ／ \`save_as_table()\` など
- **Polars**：\`collect()\` ／ \`sink_parquet()\` ／ \`sink_csv()\` など（\`sink_*\`系はストリーミングで直接ファイルへ書き出す）

Polars側の \`collect\`・\`sink_parquet\`・\`sink_csv\`・\`sink_ipc\`・\`sink_ndjson\` は、いずれも \`LazyFrame\` に実在するメソッドであることを実機で確認済みです。

## どちらを使うべきか

- **Snowparkが向く場面**：処理対象のデータがそもそもSnowflakeにあり、手元のマシンのメモリに収まらない規模（数百GB〜）を扱う場合。複数人・複数ジョブでガバナンス（権限管理・監査ログ）を効かせながら共有データを処理する場合。
- **Polarsが向く場面**：データが既に手元にある、またはSnowflakeから抽出した後の分析・試行錯誤の段階。数GB〜数十GB程度でメモリに収まり、クラウドの起動待ち時間（ウェアハウスの起動）を待たずに即座に結果を見たい場合。
- **組み合わせる**：実務では二者択一ではなく、**重い集計はSnowparkでSnowflake側にやらせ、集計後の小さな結果だけをPolarsやpandasに引き渡してローカルで可視化・探索する**という組み合わせがよく使われます。\`to_pandas()\`で結果をpandas DataFrameに変換すれば、その後はローカルのエコシステム（Polarsやmatplotlib等）に接続できます。`,
    relatedEntrySlugs: ['group-by', 'to-pandas'],
    sources: [
      {
        label: 'Snowflake Documentation: Working with DataFrames in Snowpark Python',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark/python/working-with-dataframes',
      },
      { label: 'Polars API Reference: LazyFrame', url: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/' },
    ],
    verifiedDate: '2026-08-27',
  },
  {
    slug: 'udf-udtf-sproc',
    title: 'UDF・Vectorized UDF・UDTF・ストアドプロシージャの使い分け',
    summary: 'Snowflake上でカスタムロジックを実行する4つの手段を、入出力の形とSQLからの呼び出し方で整理します。',
    body: `## この4つは「入出力の形」で区別する

名前が似ていて混同しやすいですが、判断基準は1つです。**1行の入力に対して、何を返すか**。

1. **スカラUDF**：1行 → 1つの値
2. **Vectorized UDF**：複数行のバッチ → バッチ分の値
3. **UDTF**：1行 → 0行以上の複数行
4. **ストアドプロシージャ（SPROC）**：表の形にとらわれない任意の処理

## 1. スカラUDF：1行→1つの値

スカラUDFは行ごとに呼び出され、1つの値を返す関数です。SELECT句やWHERE句などのSQL式の中から直接呼び出せます。

\`\`\`python
from snowflake.snowpark.functions import udf
from snowflake.snowpark.types import IntegerType

@udf(name="celsius_to_fahrenheit", return_type=IntegerType(), input_types=[IntegerType()])
def celsius_to_fahrenheit(celsius: int) -> int:
    return celsius * 9 // 5 + 32
\`\`\`

Python UDFの場合、1行ずつPythonの関数を呼び出すため、行数が多いとPythonの呼び出しオーバーヘッドが積み重なります。

## 2. Vectorized UDF：複数行をまとめて処理

Vectorized UDF（バッチUDF）は、複数行をPandasのSeriesやDataFrameとしてまとめて受け取り、まとめて結果を返す仕組みです。

\`\`\`python
import pandas as pd
from snowflake.snowpark.functions import udf
from snowflake.snowpark.types import PandasSeriesType, IntegerType

@udf(
    name="batch_double",
    input_types=[PandasSeriesType(IntegerType())],
    return_type=PandasSeriesType(IntegerType()),
    max_batch_size=1000,
)
def batch_double(values: pd.Series) -> pd.Series:
    return values * 2
\`\`\`

Snowflake公式ドキュメントは「Vectorized Python UDFは、入力行のバッチをPandas DataFrameとして受け取り、結果のバッチをPandas配列またはSeriesとして返すPython関数を定義できる」と説明しています。1行ずつPythonを呼び出すオーバーヘッドを避けられるため、機械学習の推論のようにバッチ処理に向く場面で特に有効です。

## 3. UDTF：1行(以上)の入力→複数行の出力

UDTF（ユーザー定義テーブル関数）は、入力に対して0行以上の複数行を出力できる関数です。公式ドキュメントによれば、UDTFのハンドラクラスは行ごとに呼び出される\`process\`メソッドを実装し、そこでタプルとして表形式の値をyieldします。

\`\`\`python
from snowflake.snowpark.functions import udtf
from snowflake.snowpark.types import StructType, StructField, StringType

@udtf(output_schema=StructType([StructField("word", StringType())]))
class SplitWords:
    def process(self, sentence: str):
        for word in sentence.split():
            yield (word,)
\`\`\`

SQLのFROM句から呼び出す点がスカラUDFと異なり、1行の文章から複数の単語行への展開のような「表を膨らませる」処理に使います。

## 4. ストアドプロシージャ：制御フローそのものをパッケージ化

ストアドプロシージャ（SPROC）は、条件分岐・ループ・トランザクション管理・DDL/DMLの実行といった「処理の手順そのもの」をパッケージ化したものです。SQL式の中から呼び出すのではなく、\`CALL\`文で独立して実行します。

\`\`\`python
from snowflake.snowpark.functions import sproc

@sproc(name="archive_old_rows", is_permanent=True, stage_location="@my_stage", replace=True)
def archive_old_rows(session, cutoff_date: str) -> str:
    session.sql(f"INSERT INTO archive SELECT * FROM orders WHERE order_date < '{cutoff_date}'").collect()
    session.sql(f"DELETE FROM orders WHERE order_date < '{cutoff_date}'").collect()
    return "archived"
\`\`\`

UDF・UDTFにはできないDDL/DMLの実行が可能な点が大きな違いです。

## 使い分けの早見表

| 種類 | 主な目的 | 戻り値 | SQL式内から直接呼べるか | DDL/DMLの実行 |
|---|---|---|---|---|
| スカラUDF | 行ごとの計算・変換 | 単一の値 | 可能 | 不可 |
| Vectorized UDF | バッチ単位の高速演算 | 単一の値（バッチ処理） | 可能 | 不可 |
| UDTF | 表構造への展開・変換 | 複数行・複数列 | 可能（FROM句内） | 不可 |
| ストアドプロシージャ | パイプライン制御・自動化 | 任意 | 不可（CALL文） | 可能 |

## で、どれを選べばいいか

- **既存の1行1値の変換ロジックをSQLに埋め込みたいだけ** → スカラUDF。まず最初に検討する選択肢
- **機械学習の推論・大量データへの数値演算で、1行ずつの呼び出しオーバーヘッドが無視できない** → Vectorized UDF。同じロジックでもバッチ化するだけで速くなる場合がある
- **1行の入力から複数行を生成したい（文章の単語分割・JSON配列の展開など）** → UDTF。スカラUDFやVectorized UDFでは戻り値が1行に固定されるため代用できない
- **複数のテーブル操作をまとめて実行し、条件分岐や例外処理も含めて1つの処理としてパッケージ化したい** → ストアドプロシージャ。「値を返す関数」ではなく「手順を実行するジョブ」を作りたいときはこちら

Polarsはローカルで動くライブラリなので、この4分類そのものが存在しません。Polarsで「カスタムロジック」というと、\`map_elements\`のようなメソッドにPython関数を渡す形が中心で、SQLエンジン側にプッシュダウンして実行させるという概念がそもそもありません。`,
    relatedEntrySlugs: [],
    sources: [
      {
        label: 'Snowflake Documentation: Creating UDFs for DataFrames in Python',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark/python/creating-udfs',
      },
      {
        label: 'Snowflake Documentation: Creating UDTFs for DataFrames in Python',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark/python/creating-udtfs',
      },
    ],
    verifiedDate: '2026-08-27',
  },
  {
    slug: 'pricing',
    title: '料金構造とウェアハウスのリソース消費',
    summary: 'コストは何に対して発生するのか。標準ウェアハウスとSnowpark-Optimized Warehouseの違い、書き方で抑えられる部分を整理します。',
    body: `**このページに書かれている料金体系・数値（秒単位課金・60秒最低利用・メモリ量など）は、Snowflakeのエディション・リージョン・契約内容によって異なり、将来変更される可能性があります。** 実際の請求額の見積もりには、必ずSnowflake公式サイトの最新の料金情報をご確認ください。

## まず押さえること：変換を書くだけでは課金されない

Snowparkは遅延評価（詳しくは[アーキテクチャの解説](/guide/architecture/)）を採用しているため、\`select\`・\`filter\`・\`join\`のような変換メソッドを何回書いても、それ自体では一切課金されません。課金が発生するのは、\`collect()\`・\`show()\`・\`save_as_table()\`のようなアクションメソッドを呼び、実際にSnowflakeのウェアハウスが処理を実行した瞬間だけです。他のインメモリ処理系（都度実行されるライブラリ）に慣れていると、「変換を書いた時点で何か処理が走っているはず」という直感でコストを見積もってしまいがちですが、Snowparkではその直感は成り立ちません。

## コンピュートコストは秒単位

アクションメソッドが実行されるとき、実際に処理を行うのはSnowflakeの仮想ウェアハウス（Virtual Warehouse）です。課金は秒単位で行われ、ウェアハウスが起動してから最初の60秒は最低利用時間として課金されます。一定時間クエリが来なければ自動的に一時停止（オートサスペンド）し、その間の課金は発生しません。

## メモリが足りない処理にはSnowpark-Optimized Warehouse

大量のメモリを必要とするPython UDFや機械学習のトレーニングでは、標準のウェアハウスだとメモリ不足（OOM）が起きることがあります。Snowflakeは「Snowpark-Optimized Warehouse」という、標準より多くのメモリを積んだウェアハウスの種類を提供しています。

Snowflake公式ドキュメントによると、Snowpark-Optimized Warehouseの既定構成はノードあたり標準ウェアハウスの16倍のメモリを提供します。具体的なメモリ量はサイズ指定によって変わり、たとえば\`MEMORY_16X\`は256GB（Mサイズ以上）、\`MEMORY_64X\`は最大1TB（Lサイズ以上）です。**ただし1TBの構成（MEMORY_64X）は本稿確認時点でプレビュー機能かつAWSのみでの提供**であり、標準的に使えるわけではない点に注意してください。

## ストレージコストも別に発生する

\`cache_result()\`や\`save_as_table()\`を呼ぶと、その時点の結果を一時テーブルまたは永続テーブルとしてSnowflake内に保存します。これらのテーブルは通常のストレージ料金の対象になります。「キャッシュしたから無料」ではなく、キャッシュ自体がストレージコストを生む点は見落としやすい落とし穴です。

## 書き方でコストを抑える

課金の単位（ウェアハウスの稼働時間）が分かると、コードの書き方でコンピュートコストを減らせる場面が見えてきます。

- **不要な\`collect()\`を挟まない**：\`collect()\`は結果をクライアント側に持ってくるアクションで、そこで必ずウェアハウスが動きます。処理の途中経過を確認したいだけなら、最終的な\`collect()\`の前に余計な\`collect()\`を挟まず、変換のチェーンをつなげたままにする方がウェアハウスの稼働時間を抑えられます。
- **\`with_column\`の連続チェーンを避ける**：\`with_column\`を何度も連続で呼ぶと、内部的に生成されるSQLがネストして複雑になり、実行時間が伸びることがあります（詳しくは[with_column / with_columnsのページ](/with-column/)）。複数列を追加するときは\`with_columns\`にまとめて式を渡す方が、生成されるSQLがシンプルになります。
- **\`limit\`は早い段階に置く**：一部の行だけ確認したいときに\`limit\`を後段に置くと、絞り込む前の全件に対して手前の変換が評価されてしまう場合があります。動作確認の段階では早めに\`limit\`を挟むと、無駄な計算に対するウェアハウスの稼働時間を減らせます。
- **\`cache_result()\`は「使い回す」ときだけ使う**：同じ中間結果を後続の複数の処理で繰り返し参照するなら、\`cache_result()\`で一度だけ計算してテーブル化する方が、毎回同じ変換を再計算するより合計のコンピュートコストが下がることがあります。逆に、その場限りでしか使わない結果に\`cache_result()\`を呼ぶと、再計算を避けるメリットが無いままストレージコストだけが増えます。

\`\`\`python
filtered = df.filter(col("amount") > 100)

# 悪い例：同じ filtered から2回 collect() すると、
# filter の変換がそのたびに再計算される（ウェアハウスが2回分動く）
report_a = filtered.group_by("region").agg(F.sum("amount")).collect()
report_b = filtered.group_by("customer_id").agg(F.count("*")).collect()

# 良い例：cache_result() で一度だけ実体化し、以降はそのテーブルを再利用する
cached = filtered.cache_result()
report_a = cached.group_by("region").agg(F.sum("amount")).collect()
report_b = cached.group_by("customer_id").agg(F.count("*")).collect()
\`\`\`

\`cache_result()\`が\`Table\`オブジェクトを返すことはSDKのクラス定義で確認済みです。同じ\`filtered\`を複数の集計で使い回すときに効果が出るパターンで、1回しか使わない中間結果に呼んでもストレージコストが増えるだけの逆効果になる点は前述のとおりです。`,
    relatedEntrySlugs: ['with-column'],
    sources: [
      {
        label: 'Snowflake Documentation: Overview of Warehouses',
        url: 'https://docs.snowflake.com/en/user-guide/warehouses-overview',
      },
      {
        label: 'Snowflake Documentation: Snowpark-optimized Warehouses',
        url: 'https://docs.snowflake.com/en/user-guide/warehouses-snowpark-optimized',
      },
    ],
    verifiedDate: '2026-08-27',
  },
  {
    slug: 'snowpark-ml',
    title: 'Snowpark ML の概要',
    summary: 'Snowflake上で完結する機械学習ワークフロー。前処理・学習を担うModelingと、モデル管理を担うRegistryの2本柱です。',
    body: `## snowflake.ml.modeling：前処理とトレーニング

Snowpark MLのモデリングAPIは、\`snowflake.ml.modeling\`というモジュールで提供されます。この中の\`snowflake.ml.modeling.preprocessing\`には、\`StandardScaler\`・\`OneHotEncoder\`・\`OrdinalEncoder\`・\`MinMaxScaler\`・\`RobustScaler\`など、scikit-learnで見慣れた前処理クラスに相当するものが揃っており、Snowflakeの分散コンピュート上で実行できます。学習側も\`snowflake.ml.modeling.xgboost.XGBClassifier\`のようにscikit-learn互換の\`fit\`/\`predict\`インターフェースで提供されます。

\`\`\`python
from snowflake.ml.modeling.preprocessing import StandardScaler
from snowflake.ml.modeling.xgboost import XGBClassifier

# input_cols/label_cols/output_cols でSnowpark DataFrameの列名を指定する
# （scikit-learnと違い、Xとyを別のオブジェクトに分けない）
scaler = StandardScaler(input_cols=["amount", "age"], output_cols=["amount_sc", "age_sc"])
scaled_df = scaler.fit(train_df).transform(train_df)

model = XGBClassifier(
    input_cols=["amount_sc", "age_sc"],
    label_cols=["churned"],
    output_cols=["predicted_churn"],
)
model.fit(scaled_df)
\`\`\`

\`input_cols\`・\`label_cols\`・\`output_cols\`でSnowpark DataFrameの列名を直接指定する点がscikit-learnとの大きな違いです（NumPy配列にXとyを分けて渡す必要がありません）。公式ドキュメントは、既存のオープンソースのコードやライブラリをそのままSnowflake上のモデル学習に使えることを謳っています。

## snowflake.ml.registry：モデルの管理と配信

学習済みモデルを管理する側は\`snowflake.ml.registry\`モジュールで、\`Registry\`クラスを使います。

\`\`\`python
from snowflake.ml.registry import Registry

registry = Registry(session=session)
model_version = registry.log_model(
    model,
    model_name="churn_predictor",
    version_name="v1",
    comment="XGBoost churn model trained on Q3 data",
)

# 登録済みモデルでウェアハウス上のバッチ推論を実行する
predictions = model_version.run(new_customers_df)
\`\`\`

公式ドキュメントは「モデルのバージョン・指標・メタデータを保存し、Python・SQL・REST APIエンドポイントを使った分散推論を提供する」と説明しています。モデルの入出力の型（シグネチャ）やバージョンもRegistry側で管理されます。

## 何が嬉しいか

前処理からモデル管理まで、データをSnowflakeの外に出すことなく一貫して扱える点がSnowpark MLの特徴です。学習用データをS3やローカルにエクスポートする手順そのものが不要になり、Snowflakeのロールベースのアクセス制御（RBAC）がモデルとデータの両方に対して一貫してかかります。Polarsにはこうした「モデルのバージョン管理・配信」に相当する機能は無く、Polars自体はあくまでローカルのデータフレーム処理ライブラリです。

## で、どういうときに使うか

- **向いている**：学習に使う特徴量がすでにSnowflake上のテーブルにあり、前処理・学習・推論のすべてをSnowflakeの権限管理の範囲内で完結させたい場合。モデルのバージョン管理やアクセス権限をデータと同じ基盤で統一したい場合。
- **向いていない**：PyTorchやTensorFlowで書いた独自のディープラーニングモデルを、Snowflakeの外にある専用のGPUクラスタで学習させたい場合（Snowpark MLの主眼はscikit-learn的な表形式データの学習・前処理で、専用ハードウェアを要する大規模な深層学習はSnowpark MLの主戦場ではありません）。
- **判断の軸**：「特徴量エンジニアリングから推論までの一連の流れを、Snowflakeのガバナンスの中に閉じ込めたいか」が判断基準になります。閉じ込めたいならSnowpark MLの前処理・学習・Registryの3点セットがそのまま使え、外部のMLプラットフォームとの連携が主目的ならSnowflakeは特徴量の抽出元として使い、学習は別基盤で行う構成の方が向いています。`,
    relatedEntrySlugs: [],
    sources: [
      {
        label: 'Snowflake Documentation: Snowflake ML - Modeling',
        url: 'https://docs.snowflake.com/en/developer-guide/snowflake-ml/modeling',
      },
      {
        label: 'Snowflake Documentation: Model Registry Overview',
        url: 'https://docs.snowflake.com/en/developer-guide/snowflake-ml/model-registry/overview',
      },
      {
        label: 'Snowflake ML API Reference: snowflake.ml.modeling.preprocessing',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark-ml/reference/latest/modeling',
      },
    ],
    verifiedDate: '2026-08-27',
  },
];
