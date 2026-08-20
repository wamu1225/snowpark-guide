// メソッド1件＝1エントリ。eng-confusables と同じ「逆引き比較」の型に、
// 技術文書として必須の検証情報（検証日・バージョン・出典URL）を足している。
export type EntryCategory =
  | 'projection' // 射影・選択
  | 'filtering' // フィルタ・サンプリング
  | 'aggregation' // 集約・構造変換
  | 'joins' // 結合・集合演算
  | 'sorting' // ソート
  | 'expressions' // 式評価・文字列・型変換
  | 'window' // ウィンドウ関数
  | 'nulls' // Null処理
  | 'execution'; // 実行・アクション・IO

export type Entry = {
  /** URLに使うslug（例: 'select'） */
  slug: string;
  /** メソッド名の表示形（例: 'select / with_columns'） */
  title: string;
  category: EntryCategory;
  /** 1行の要約（一覧・meta descriptionに使う） */
  summary: string;
  snowparkCode: string;
  polarsCode: string;
  /** 挙動・設計思想の違い */
  difference: string;
  /** 移行時に踏みやすい落とし穴 */
  pitfall: string;
  /** Snowpark個別APIリファレンスURL */
  snowparkDocUrl: string;
  /** Polars個別APIリファレンスURL */
  polarsDocUrl: string;
  /** 検証情報。書けないことは書かないためのSSOT */
  verified: {
    /** Polarsコード例を実行して確認したか */
    polarsExecuted: boolean;
    /** Snowparkのメソッド名・シグネチャを静的検証（inspect）で確認したか */
    snowparkStaticChecked: boolean;
    polarsVersion: string;
    snowparkSdkVersion: string;
    /** YYYY-MM-DD */
    date: string;
  };
};

export const CATEGORIES: { id: EntryCategory; label: string; description: string }[] = [
  { id: 'projection', label: '射影・選択', description: '列を選ぶ・落とす・作る・名前を変える' },
  { id: 'filtering', label: 'フィルタ・サンプリング', description: '行を絞り込む・抜き出す' },
  { id: 'aggregation', label: '集約・構造変換', description: 'グループ化・集計・縦横の入れ替え' },
  { id: 'joins', label: '結合・集合演算', description: '複数のテーブルを1つにする' },
  { id: 'sorting', label: 'ソート', description: '並び順を決める' },
  { id: 'expressions', label: '式評価・文字列・型変換', description: '値を計算する・文字列を扱う・型を変える' },
  { id: 'window', label: 'ウィンドウ関数', description: '行をまたいだ計算（順位・累積・移動平均）' },
  { id: 'nulls', label: 'Null処理', description: '欠損値の扱い方' },
  { id: 'execution', label: '実行・アクション・IO', description: '評価を起動する・結果を取り出す・保存する' },
];
