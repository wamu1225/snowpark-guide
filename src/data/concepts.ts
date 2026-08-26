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
    summary: 'どちらも分散DataFrame APIだが、クラスタを自分で持つか持たないかで運用とコストの構造が変わります。',
    body: `## クラスタを自分で管理するかどうか

Apache SparkとSnowparkは、どちらも遅延評価の分散DataFrame APIという点で似ています。しかし、その裏側にあるインフラは大きく異なります。

Sparkはユーザー自身がドライバーノードとワーカーノードから成る計算クラスタ（多くはJVM環境）を用意し、管理する必要があります。メモリ設定やネットワークのチューニングもユーザーの責任範囲です。一方でSnowparkは、Snowflakeが提供するフルマネージドな環境（Virtual Warehouse）の上で動くため、そうしたクラスタ運用の作業そのものが発生しません。

## データの転送（Egress）が要るかどうか

Snowflake上に蓄積されたデータをSparkで処理しようとすると、データを一度Snowflakeの外（Sparkクラスタ側）へ転送する必要が生じる場合があります。この転送にはネットワーク費用や転送時間がかかり、データがSnowflakeの外に出ることによるセキュリティ上の考慮も増えます。Snowparkはデータが存在するのと同じ基盤の上でコードが評価されるため、こうした転送が発生しません。

## コストの発生の仕方

Snowflakeの仮想ウェアハウスは秒単位（起動時のみ60秒の最低課金あり）で課金され、一定時間操作がなければ自動的に一時停止（オートサスペンド）し、次のクエリが来ると自動的に再開（オートレジューム）します。Sparkクラスタは、常時起動させておくか、都度起動・停止させるオーバーヘッドを引き受けるかのどちらかになります。`,
    relatedEntrySlugs: [],
    sources: [
      {
        label: 'Snowflake Documentation: Overview of Warehouses（課金・オートサスペンド/レジューム）',
        url: 'https://docs.snowflake.com/en/user-guide/warehouses-overview',
      },
    ],
    verifiedDate: '2026-08-21',
  },
  {
    slug: 'vs-polars',
    title: 'Snowpark と Polars の違い（総論）',
    summary: 'どちらも遅延評価を採用しているが、計算がどこで走るか（クラウドかローカルか）が根本的に異なります。',
    body: `## 「遅延評価」という共通点

Snowpark DataFrameとPolars LazyFrameは、どちらも「評価をできるだけ先延ばしにして、まとめて最適化する」という遅延評価の設計思想を共有しています。このサイトの各メソッドページで頻繁に「両方とも遅延評価で……」という説明が出てくるのはこのためです。

## 計算がどこで走るかが違う

共通点はここまでで、実行される場所は対照的です。

- **Snowpark**：Snowflakeの分散SQLエンジン上、クラウドのVirtual Warehouseで実行される
- **Polars**：手元のマシンのCPU（またはローカルの分散環境）上、Rustで書かれたPolars自身の実行エンジンがApache Arrow形式のメモリ上で処理する

Snowparkはネットワークの向こう側にあるクラウドの計算資源を使い、ペタバイト級のデータをマルチノードで処理できます。Polarsは基本的に手元の1台のマシン（マルチコアで並列化）で完結する処理で、外部にデータを送信しません。

## 評価を起動するメソッドの違い

遅延評価を実際に実行させる「引き金」のメソッドも異なります。

- **Snowpark**：\`collect()\` ／ \`show()\` ／ \`save_as_table()\` など
- **Polars**：\`collect()\` ／ \`sink_parquet()\` ／ \`sink_csv()\` など（\`sink_*\`系はストリーミングで直接ファイルへ書き出す）

Polars側の \`collect\`・\`sink_parquet\`・\`sink_csv\`・\`sink_ipc\`・\`sink_ndjson\` は、いずれも \`LazyFrame\` に実在するメソッドであることを実機で確認済みです。`,
    relatedEntrySlugs: ['schema', 'columns'],
    sources: [
      {
        label: 'Snowflake Documentation: Working with DataFrames in Snowpark Python',
        url: 'https://docs.snowflake.com/en/developer-guide/snowpark/python/working-with-dataframes',
      },
      { label: 'Polars API Reference: LazyFrame', url: 'https://docs.pola.rs/api/python/stable/reference/lazyframe/' },
    ],
    verifiedDate: '2026-08-21',
  },
  {
    slug: 'udf-udtf-sproc',
    title: 'UDF・Vectorized UDF・UDTF・ストアドプロシージャの使い分け',
    summary: 'Snowflake上でカスタムロジックを実行する4つの手段を、入出力の形とSQLからの呼び出し方で整理します。',
    body: `## スカラUDF：1行→1つの値

スカラUDFは行ごとに呼び出され、1つの値を返す関数です。SELECT句やWHERE句などのSQL式の中から直接呼び出せます。Python UDFの場合、1行ずつPythonの関数を呼び出すため、行数が多いとPythonの呼び出しオーバーヘッドが積み重なります。

## Vectorized UDF：複数行をまとめて処理

Vectorized UDF（バッチUDF）は、複数行をPandasのDataFrameやSeriesとしてまとめて受け取り、まとめて結果を返す仕組みです。Snowflake公式ドキュメントは「Vectorized Python UDFは、入力行のバッチをPandas DataFrameとして受け取り、結果のバッチをPandas配列またはSeriesとして返すPython関数を定義できる」と説明しています。1行ずつPythonを呼び出すオーバーヘッドを避けられるため、機械学習の推論のようにバッチ処理に向く場面で特に有効です。

## UDTF：1行(以上)の入力→複数行の出力

UDTF（ユーザー定義テーブル関数）は、入力に対して0行以上の複数行を出力できる関数です。公式ドキュメントによれば、UDTFのハンドラクラスは行ごとに呼び出される\`process\`メソッドを実装し、そこでタプルとして表形式の値を返します。SQLのFROM句から呼び出す点がスカラUDFと異なります。

## ストアドプロシージャ：制御フローそのものをパッケージ化

ストアドプロシージャ（SPROC）は、条件分岐・ループ・トランザクション管理・DDL/DMLの実行といった「処理の手順そのもの」をパッケージ化したものです。SQL式の中から呼び出すのではなく、\`CALL\`文で独立して実行します。UDF・UDTFにはできないDDL/DMLの実行が可能な点が大きな違いです。

## 使い分けの早見表

| 種類 | 主な目的 | 戻り値 | SQL式内から直接呼べるか | DDL/DMLの実行 |
|---|---|---|---|---|
| スカラUDF | 行ごとの計算・変換 | 単一の値 | 可能 | 不可 |
| Vectorized UDF | バッチ単位の高速演算 | 単一の値（バッチ処理） | 可能 | 不可 |
| UDTF | 表構造への展開・変換 | 複数行・複数列 | 可能（FROM句内） | 不可 |
| ストアドプロシージャ | パイプライン制御・自動化 | 任意 | 不可（CALL文） | 可能 |

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
    verifiedDate: '2026-08-21',
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
- **\`cache_result()\`は「使い回す」ときだけ使う**：同じ中間結果を後続の複数の処理で繰り返し参照するなら、\`cache_result()\`で一度だけ計算してテーブル化する方が、毎回同じ変換を再計算するより合計のコンピュートコストが下がることがあります。逆に、その場限りでしか使わない結果に\`cache_result()\`を呼ぶと、再計算を避けるメリットが無いままストレージコストだけが増えます。`,
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
    verifiedDate: '2026-08-21',
  },
  {
    slug: 'snowpark-ml',
    title: 'Snowpark ML の概要',
    summary: 'Snowflake上で完結する機械学習ワークフロー。前処理・学習を担うModelingと、モデル管理を担うRegistryの2本柱です。',
    body: `## snowflake.ml.modeling：前処理とトレーニング

Snowpark MLのモデリングAPIは、\`snowflake.ml.modeling\`というモジュールで提供されます。この中の\`snowflake.ml.modeling.preprocessing\`には、\`StandardScaler\`・\`OneHotEncoder\`・\`OrdinalEncoder\`・\`MinMaxScaler\`・\`RobustScaler\`など、scikit-learnで見慣れた前処理クラスに相当するものが揃っており、Snowflakeの分散コンピュート上で実行できます。公式ドキュメントは、既存のオープンソースのコードやライブラリをそのままSnowflake上のモデル学習に使えることを謳っています。

## snowflake.ml.registry：モデルの管理と配信

学習済みモデルを管理する側は\`snowflake.ml.registry\`モジュールで、\`Registry\`クラスを使います。公式ドキュメントは「モデルのバージョン・指標・メタデータを保存し、Python・SQL・REST APIエンドポイントを使った分散推論を提供する」と説明しています。登録したモデルは\`mv.run()\`のような呼び出しでウェアハウス上でのバッチ推論を実行でき、モデルの入出力の型（シグネチャ）やバージョンもRegistry側で管理されます。

## 何が嬉しいか

前処理からモデル管理まで、データをSnowflakeの外に出すことなく一貫して扱える点がSnowpark MLの特徴です。Polarsにはこうした「モデルのバージョン管理・配信」に相当する機能は無く、Polars自体はあくまでローカルのデータフレーム処理ライブラリです。学習・配信をSnowflake上で完結させたい場合の選択肢として位置づけられます。`,
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
    verifiedDate: '2026-08-21',
  },
];
