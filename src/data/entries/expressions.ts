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
  {
    slug: 'upper-lower',
    title: 'upper / lower',
    category: 'expressions',
    summary: '文字列を大文字・小文字に統一する。',
    snowparkCode: 'upper(col("name"))\nlower(col("name"))',
    polarsCode: 'pl.col("name").str.to_uppercase()\npl.col("name").str.to_lowercase()',
    difference:
      'SnowparkはSQLの`UPPER`/`LOWER`関数に変換される。Polarsは`.str`名前空間の`to_uppercase()`/`to_lowercase()`を使う。実行して確認したところ、ASCII文字列では同じ結果になる。',
    pitfall:
      'Polars側はメソッド名が長く、`.str`名前空間を経由し忘れると（例：`pl.col("name").upper()`）存在しないメソッドとしてエラーになる。文字列操作はすべて`.str.`を挟む、とルール化しておくと移植時の迷いが減る。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.upper',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.to_uppercase.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'trim',
    title: 'trim / ltrim / rtrim',
    category: 'expressions',
    summary: '文字列の前後にある空白（または指定した文字）を取り除く。',
    snowparkCode: 'trim(col("name"))  # 両端\nltrim(col("name"))  # 左端のみ\nrtrim(col("name"))  # 右端のみ',
    polarsCode:
      'pl.col("name").str.strip_chars()  # 両端\npl.col("name").str.strip_chars_start()  # 左端のみ\npl.col("name").str.strip_chars_end()  # 右端のみ',
    difference:
      'Snowparkの`trim`はSQLの`TRIM`にそのまま対応し、既定では空白を取り除く（第2引数で任意の文字集合を指定可能）。Polarsは`strip_chars`系のメソッドで、こちらも引数を省略すると空白を対象にする。`"  Alice  "`を実行して確認したところ、両方とも`"Alice"`になった。',
    pitfall:
      '名前の対応が1対1ではない。Snowparkは`trim`/`ltrim`/`rtrim`の3関数だが、Polarsは`strip_chars`/`strip_chars_start`/`strip_chars_end`と、両端・開始・終了を表す語が異なる（`l`/`r`ではなく`start`/`end`）。SnowparkのコードをPolarsへ機械的にリネームするだけでは対応しない。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.trim',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.strip_chars.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'to-date',
    title: 'to_date',
    category: 'expressions',
    summary: '文字列を日付型に変換する。',
    snowparkCode: 'to_date(col("date_str"), "YYYY-MM-DD")',
    polarsCode: 'pl.col("date_str").str.to_date("%Y-%m-%d")',
    difference:
      'どちらも文字列を日付型へ明示的にパースする関数だが、フォーマット指定の記法が違う。Snowpark（Snowflake SQL）は`YYYY-MM-DD`のような独自のフォーマットトークンを使う。Polarsは標準Cライブラリの`strftime`と同じ`%Y-%m-%d`記法を使う。`"2026-01-15"`を実行して確認したところ、どちらも同じ日付になる。',
    pitfall:
      'フォーマット文字列をそのままコピーすると動かない。`YYYY-MM-DD`（Snowflake記法）をPolarsにそのまま渡すと、`%`から始まらないトークンとして解釈されず、パースに失敗するか意図しない結果になる。移行時は必ずフォーマット文字列自体も書き換える必要がある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.to_date',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.to_date.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'date-trunc',
    title: 'date_trunc',
    category: 'expressions',
    summary: '日付・時刻を指定した単位（月・年など）で切り捨てる。',
    snowparkCode: 'date_trunc("month", col("order_date"))',
    polarsCode: 'pl.col("order_date").dt.truncate("1mo")',
    difference:
      'Snowparkは第1引数に`"month"`のような単位名を文字列で渡す。Polarsの`dt.truncate`は`"1mo"`のような「数量+単位」のインターバル文字列を渡す設計で、月の途中の日付を実行して確認したところ、どちらも月初の日付に切り捨てられる。',
    pitfall:
      '単位の書き方が違う。Snowparkは`"month"`・`"year"`のような英単語をそのまま書くが、Polarsは`"1mo"`（1か月）・`"1y"`（1年）のように**数量を省略できない**インターバル記法を使う。`"month"`をそのままPolarsに渡すと単位として認識されずエラーになる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.date_trunc',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.dt.truncate.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'datediff',
    title: 'datediff',
    category: 'expressions',
    summary: '2つの日付・時刻の差を、指定した単位（日数など）で求める。',
    snowparkCode: 'datediff("day", col("start_date"), col("end_date"))',
    polarsCode: '(pl.col("end_date") - pl.col("start_date")).dt.total_days()',
    difference:
      'Snowparkは`datediff(単位, 開始, 終了)`という専用の関数を1回呼ぶだけで済む。Polarsには同名の専用関数が無く、**日付列同士を引き算してDuration型にしてから**、`.dt.total_days()`のようなメソッドで単位を取り出す2段階の書き方になる。14日差のデータで実行して確認したところ、どちらも`14`になる。',
    pitfall:
      'Polars側は「引き算してから単位を取り出す」という考え方の違いを理解していないと、`datediff`に相当する関数を探して見つからずに詰まる。日数以外の単位（時間・分）が欲しいときは`.dt.total_days()`の部分を`.dt.total_hours()`・`.dt.total_minutes()`に差し替える。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.datediff',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.dt.total_days.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'dateadd',
    title: 'dateadd',
    category: 'expressions',
    summary: '日付・時刻に一定期間を加算（または減算）する。',
    snowparkCode: 'dateadd("day", lit(10), col("order_date"))',
    polarsCode: 'pl.col("order_date").dt.offset_by("10d")',
    difference:
      'Snowparkは`dateadd(単位, 加算量, 対象)`という順序の引数を取る。Polarsの`dt.offset_by`は`"10d"`（10日）のように加算量と単位を1つの文字列にまとめて渡す。10日加算を実行して確認したところ、どちらも同じ結果の日付になる。',
    pitfall:
      '減算したいときの書き方が違う。Snowparkは加算量に負の数（例：`lit(-10)`）を渡す。Polarsの`dt.offset_by`は文字列の先頭にマイナス記号を付ける（例：`"-10d"`）。数値の符号を反転させるだけでは移植できず、文字列の組み立て方を変える必要がある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.dateadd',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.dt.offset_by.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'round',
    title: 'round',
    category: 'expressions',
    summary: '数値を指定した桁数で四捨五入する。',
    snowparkCode: 'round(col("amount"), 1)',
    polarsCode: 'pl.col("amount").round(1)',
    difference:
      'どちらも「対象の列」「小数点以下の桁数」という同じ形の引数を取る、両API間で最も差の小さい関数の1つ。`12.345`を小数点1桁に丸めて実行して確認したところ、どちらも`12.3`になった（四捨五入ではなく偶数への丸め＝銀行丸めになる境界値には注意）。',
    pitfall:
      '桁数を省略したときの既定値（0＝整数に丸める）は共通だが、**境界値（ちょうど0.5の場合）の丸め方向がライブラリやSnowflakeのセッション設定によって変わることがある**。金額計算など丸め方向が結果に影響する場面では、実際の値で境界ケースを個別に検証すること。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.round',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.round.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'regexp-replace',
    title: 'regexp_replace',
    category: 'expressions',
    summary: '正規表現にマッチした部分を別の文字列に置き換える。',
    snowparkCode: 'regexp_replace(col("name"), \'\\s+\', \'\')',
    polarsCode: 'pl.col("name").str.replace_all(r"\\s+", "")',
    difference:
      'Snowparkは第1引数に対象列、第2引数に正規表現パターン、第3引数（省略可・既定は空文字）に置換後の文字列を渡す。Polarsの`str.replace_all`もパターンと置換文字列を渡す形は同じ。空白文字（`\\s+`）を除去するコードを実行して確認したところ、どちらも同じ結果になる。',
    pitfall:
      '正規表現の方言自体はほぼ共通（PCRE系）だが、**Polarsの`str.replace_all`は既定で正規表現として解釈する**一方、リテラル文字列として置換したいだけの場合は`literal=True`を明示しないと、パターン中の`.`や`(`のような正規表現の特殊文字が意図せずマッチしてしまう。単純な文字列置換のつもりで特殊文字を含む文字列を渡すと、Snowpark側・Polars側どちらでも同じ落とし穴になる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.regexp_replace',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.replace_all.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'split',
    title: 'split',
    category: 'expressions',
    summary: '文字列を区切り文字で分割し、配列（リスト）にする。',
    snowparkCode: 'split(col("tags"), lit(","))',
    polarsCode: 'pl.col("tags").str.split(",")',
    difference:
      'Snowparkの`split`はSQLの`SPLIT`関数を呼び出し、結果はSnowflakeのARRAY型（Variant配列）になる。Polarsの`str.split`は結果がPolars独自のList型になる。`"a,b,c"`を実行して確認したところ、どちらも3要素の配列/リストに分割される。',
    pitfall:
      '分割後の型が違うため、後続の操作方法も変わる。Snowflake側のARRAY型は`GET`やLateral Flattenで要素を取り出すのに対し、Polarsは`.list`名前空間（例：`.list.get(0)`）で要素を取り出す。「配列になった後どう扱うか」の作法が別物である点に注意する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.split',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.split.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'md5',
    title: 'md5 / sha2',
    category: 'expressions',
    summary: '文字列からハッシュ値を計算する（重複検知・疑似的な主キー生成などに使う）。',
    snowparkCode: 'md5(col("name"))\nsha2(col("name"), 256)',
    polarsCode: 'pl.col("name").hash()  # MD5/SHA2そのものではない点に注意（本文参照）',
    difference:
      'Snowparkの`md5`・`sha2`はSQLの標準的な暗号学的ハッシュ関数（MD5・SHA-256等）をそのまま呼び出す。**Polarsには同名のMD5/SHA2関数が無い**。最も近いのは`.hash()`だが、これはPolars独自の高速ハッシュ（xxHashベース）で、暗号学的ハッシュ関数ではなく、Snowflake側のMD5/SHA2とは全く異なる値になる。実行して確認したところ、`.hash()`の戻り値はSnowflakeのMD5とは桁数もアルゴリズムも異なる64bit整数になる。',
    pitfall:
      '**「同じ入力から同じハッシュ値が欲しい」という目的が同じでも、Snowpark側とPolars側で同じ値にはならない**。他システム（Snowflake側でMD5計算したテーブル等）と突き合わせるためにハッシュ値を使う場合、Polars側で`.hash()`を使うとキーが一致せず突き合わせが失敗する。真にMD5/SHA2互換の値が必要な場合は、Python標準の`hashlib`モジュールを行ごとに適用する（`map_elements`等）必要があり、Polarsのベクトル化された高速処理の恩恵を受けにくくなる点も踏まえて設計する。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.md5',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.hash.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-27',
    },
  },
  {
    slug: 'length',
    title: 'length',
    category: 'expressions',
    summary: '文字列の長さ（文字数）を求める。',
    snowparkCode: 'length(col("name"))',
    polarsCode: 'pl.col("name").str.len_chars()',
    difference:
      'どちらも既定で**文字数**を返す。Snowflake公式ドキュメントは「UTF-8文字は1文字としてカウントする」と明記しており、実行して確認したところ「こんにちは」（5文字）はSnowpark・Polarsとも`5`になる（バイト数ではない）。',
    pitfall:
      'Polarsには**バイト数**を返す別のメソッド`str.len_bytes()`が存在し、名前が紛らわしい。実行して確認したところ「こんにちは」は`len_bytes()`だと`15`（UTF-8で1文字3バイト×5）になる。日本語を含む文字列で誤って`len_bytes()`を使うと、Snowflake側の`LENGTH`（文字数）とは異なる大きな数値になる。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.length',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.len_chars.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
  {
    slug: 'contains',
    title: 'contains',
    category: 'expressions',
    summary: '文字列に指定した部分文字列が含まれているかを判定する。',
    snowparkCode: 'contains(col("url"), lit("3.0"))',
    polarsCode: 'pl.col("url").str.contains("3.0", literal=True)',
    difference:
      'SnowparkはSQLの`CONTAINS(col, substr)`に変換され、常に**リテラル（そのままの文字列）検索**。一方Polarsの`str.contains()`は**既定で正規表現として解釈する**という違いがある。',
    pitfall:
      '**検索文字列に`.`や`(`などの正規表現記号が含まれると、Polars側だけ意図しないマッチが起きる**。実行して確認したところ、`"v3.0 release"`で`3.0`を探すと、Snowparkの`contains`相当（リテラル）は`"v3X0 release"`にはマッチしないが、Polarsの`str.contains("3.0")`は`.`を「任意の1文字」として解釈するため`"v3X0"`にもマッチしてしまう。Snowparkの`contains`をそのまま移植するなら、Polars側は`literal=True`を明示する必要がある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.contains',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.contains.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
  {
    slug: 'startswith-endswith',
    title: 'startswith / endswith',
    category: 'expressions',
    summary: '文字列が指定した文字列で始まる／終わるかを判定する。',
    snowparkCode: 'startswith(col("code"), lit("JP-"))\nendswith(col("code"), lit("-01"))',
    polarsCode: 'pl.col("code").str.starts_with("JP-")\npl.col("code").str.ends_with("-01")',
    difference:
      'Snowparkは`startswith(col, str)`/`endswith(col, str)`という2引数の関数。Polarsは`.str`名前空間のメソッドとして列に対して呼ぶ形。`contains`と異なり、**どちらのAPIも常にリテラル一致**で正規表現としては解釈されない（実行して確認）。',
    pitfall:
      '`contains`のような`literal`引数はPolars側に存在しない（そもそも正規表現モードを持たないため）。`contains`と同じ感覚で`literal=True`を付けようとするとエラーになる点に注意。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.startswith',
    polarsDocUrl:
      'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.starts_with.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
  {
    slug: 'replace',
    title: 'replace（文字列の置き換え）',
    category: 'expressions',
    summary: '文字列中の一致した部分を、別の文字列に置き換える（正規表現ではない単純一致）。',
    snowparkCode: 'replace(col("phone"), lit("-"), lit(""))',
    polarsCode: 'pl.col("phone").str.replace_all("-", "", literal=True)',
    difference:
      'Snowparkの`replace`はSQLの`REPLACE`に変換され、**リテラル一致**で全ての出現を置き換える。Polars側は`replace`（最初の1件のみ）と`replace_all`（全件）でメソッドが分かれており、`regexp_replace`のページと同様に**既定は正規表現モード**なので、`literal=True`を付けて動作を揃える必要がある。',
    pitfall:
      '**置換後の文字列（第3引数）を省略したときの挙動が違う**。Snowflake公式ドキュメントは「省略時、または空文字列のときは一致箇所を単純に削除する」と明記しており、`replace(col, pattern)`だけでも動く。一方Polarsの`str.replace_all(pattern, value, ...)`は**`value`が必須の位置引数**で省略できない＝削除したいだけでも`""`を明示的に渡す必要がある。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.replace',
    polarsDocUrl:
      'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.replace_all.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
  {
    slug: 'abs-ceil-floor',
    title: 'abs / ceil / floor',
    category: 'expressions',
    summary: '絶対値、切り上げ、切り下げを求める基本的な数値関数。',
    snowparkCode: 'abs(col("amount"))\nceil(col("amount"))\nfloor(col("amount"))',
    polarsCode: 'pl.col("amount").abs()\npl.col("amount").ceil()\npl.col("amount").floor()',
    difference:
      'いずれも標準的な数学の定義どおりで、両API間の差がほぼ無い関数群。実行して確認したところ`-3.7`は`abs`で`3.7`、`ceil`で`-3.0`（0に近い方向）、`floor`で`-4.0`（負の無限大方向）と、符号付きの値でも両者一致する。',
    pitfall:
      '`ceil`/`floor`は「0に近づける」のではなく「値が大きくなる／小さくなる」方向に丸める点に注意（`-3.7`の`ceil`は`-3`であって`-4`ではない）。これは両APIで共通の仕様だが、四捨五入の`round`（[roundのページ](/round/)）と混同しやすい。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.abs',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.abs.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
  {
    slug: 'greatest-least',
    title: 'greatest / least',
    category: 'expressions',
    summary: '複数の列を横に比較し、行ごとの最大値・最小値を求める。',
    snowparkCode: 'greatest(col("q1"), col("q2"), col("q3"))\nleast(col("q1"), col("q2"), col("q3"))',
    polarsCode: 'pl.max_horizontal("q1", "q2", "q3")\npl.min_horizontal("q1", "q2", "q3")',
    difference:
      'Snowparkの`greatest`/`least`はSQLの同名関数に変換される複数列の可変長引数関数。Polarsには同名の関数が無く、`pl.max_horizontal`/`pl.min_horizontal`という「横方向（行ごと）の集約」専用の関数を使う（`max`/`min`は列方向の集約に使われるため名前が分かれている）。',
    pitfall:
      '**NULLの扱いが正反対**。Snowflake公式ドキュメントは「GREATESTは引数のいずれかがNULLならNULLを返す」と明記している（NULLを無視したい場合は別関数`GREATEST_IGNORE_NULLS`を使う）。一方、実行して確認したところPolarsの`max_horizontal`/`min_horizontal`は**既定でNULLを無視し、NULLでない値の中から最大・最小を返す**（`[1, None, 3]`と`[5, 2, None]`の行ごと`max_horizontal`は`[5, 2, 3]`になり、2行目・3行目もNULLにならない）。移植すると欠損データの扱いが逆転するので要注意。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.greatest',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.max_horizontal.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
  {
    slug: 'date-parts',
    title: 'year / month / dayofmonth',
    category: 'expressions',
    summary: '日付・時刻から年・月・日の値だけを取り出す。',
    snowparkCode: 'year(col("order_date"))\nmonth(col("order_date"))\ndayofmonth(col("order_date"))',
    polarsCode: 'pl.col("order_date").dt.year()\npl.col("order_date").dt.month()\npl.col("order_date").dt.day()',
    difference:
      '構造は同じ（対象の日付列から整数を取り出す）だが、**「日」を表す関数名が違う**。Snowparkは`dayofmonth`、Polarsは`.dt.day()`。`2026-03-15`を実行して確認したところ、どちらも`year=2026, month=3, day=15`で一致する。',
    pitfall:
      'Snowparkには`dayofmonth`の他に`dayofweek`（曜日）・`dayofyear`（年内通算日）という紛らわしい類似関数が並んでいる。Polars側も`.dt.weekday()`・`.dt.ordinal_day()`と対応する関数名が違うので、**「day」を含む名前だけを頼りに機械的に対応させると取り違える**。どの「日」を取りたいかを毎回確認してから名前を選ぶ。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.dayofmonth',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.dt.day.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
  {
    slug: 'lpad-rpad',
    title: 'lpad / rpad',
    category: 'expressions',
    summary: '文字列の左側・右側を指定した文字で埋め、一定の長さに揃える。',
    snowparkCode: 'lpad(col("code"), 10, lit("0"))\nrpad(col("code"), 10, lit("*"))',
    polarsCode: 'pl.col("code").str.pad_start(10, "0")\npl.col("code").str.pad_end(10, "*")',
    difference:
      'どちらも「対象の長さになるまで指定した文字で埋める」という同じ目的の関数で、名前の対応も分かりやすい（`lpad`↔`pad_start`、`rpad`↔`pad_end`）。指定長より短い文字列を実行して確認したところ、結果は一致する。',
    pitfall:
      '**対象の文字列が既に指定長より長い場合の挙動が違う**。Snowflake公式ドキュメントは「baseがlength_exprより長い場合、length_exprの長さまで切り詰められる」と明記しており、実際`"Twelve Dollars"`を10文字で`lpad`すると`"Twelve Dol"`に切り詰められる。一方、実行して確認したところPolarsの`str.pad_start`/`str.pad_end`は**指定長より長い文字列を切り詰めず、元の文字列のまま返す**（`"Twelve Dollars"`は10指定でもそのまま14文字で返る）。固定長カラムの生成など長さの上限を保証したい処理をそのまま移植すると、Polars側だけ長さが揃わない。',
    snowparkDocUrl:
      'https://docs.snowflake.com/en/developer-guide/snowpark/reference/python/latest/snowpark/api/snowflake.snowpark.functions.lpad',
    polarsDocUrl: 'https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.str.pad_start.html',
    verified: {
      polarsExecuted: true,
      snowparkStaticChecked: true,
      polarsVersion: '1.36.1',
      snowparkSdkVersion: '1.51.1',
      date: '2026-08-29',
    },
  },
];
