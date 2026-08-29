// Snowparkコードがどこで実行されるかを図解する。
// 上＝クライアントのPythonプロセス（論理プランの組み立てだけ）、下＝Snowflake（実際のデータ処理・UDFの実行）。
// 2026-08-29: O-2-25対応＝390px実効フォントが縮んでいたため、左右2列→上下2段に
// 再設計しviewBox幅を320へ狭めてfont-sizeを11〜16へ拡大。
export function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 320 620"
      width="320"
      height="620"
      role="img"
      aria-label="Snowparkコードの実行場所を示す図。クライアント側でPythonが論理プランを組み立て、collect()等のアクションで初めてSnowflake側にSQLが送られ、ウェアハウスとUDFのPythonコードもSnowflake側で実行される。"
    >
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      {/* クライアント側 */}
      <rect x="8" y="8" width="304" height="270" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="160" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0284c7">
        クライアント
      </text>
      <text x="160" y="46" textAnchor="middle" fontSize="12" fill="#64748b">
        （あなたのPythonプロセス）
      </text>

      <rect x="24" y="56" width="272" height="110" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="160" y="76" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        DataFrameの変換メソッド
      </text>
      <text x="160" y="94" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        df.select(...) .filter(...)
      </text>
      <text x="160" y="110" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        .join(...)
      </text>
      <text x="160" y="130" textAnchor="middle" fontSize="12" fill="#64748b">
        ＝論理プランの組み立てのみ
      </text>
      <text x="160" y="150" textAnchor="middle" fontSize="12" fill="#64748b">
        （まだ何も実行されない）
      </text>

      <rect x="24" y="176" width="272" height="90" rx="10" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="160" y="196" textAnchor="middle" fontSize="13" fontWeight="700" fill="#b45309">
        アクション呼び出し
      </text>
      <text x="160" y="214" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        df.collect() / .show()
      </text>
      <text x="160" y="230" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        .save_as_table()
      </text>
      <text x="160" y="250" textAnchor="middle" fontSize="12" fill="#92400e">
        ここで初めてSQLが送信される
      </text>

      {/* 矢印（下へ） */}
      <path d="M140 278 V 330" stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#arch-arrow)" />
      <text x="112" y="308" textAnchor="middle" fontSize="11" fill="#475569">
        SQL送信
      </text>
      {/* 矢印（上へ：結果） */}
      <path d="M180 330 V 278" stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#arch-arrow)" />
      <text x="208" y="308" textAnchor="middle" fontSize="11" fill="#475569">
        結果受信
      </text>

      {/* Snowflake側 */}
      <rect x="8" y="338" width="304" height="274" rx="14" fill="#fae8ff" stroke="#c026d3" strokeWidth="2" />
      <text x="160" y="360" textAnchor="middle" fontSize="16" fontWeight="700" fill="#a21caf">
        Snowflake
      </text>
      <text x="160" y="376" textAnchor="middle" fontSize="12" fill="#64748b">
        （Virtual Warehouse）
      </text>

      <rect x="24" y="386" width="272" height="78" rx="10" fill="#ffffff" stroke="#c026d3" strokeWidth="1.5" />
      <text x="160" y="408" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        送られてきたSQLを実行
      </text>
      <text x="160" y="426" textAnchor="middle" fontSize="12" fill="#64748b">
        テーブルの読み取り・結合・
      </text>
      <text x="160" y="444" textAnchor="middle" fontSize="12" fill="#64748b">
        絞り込みなどの実データ処理
      </text>

      <rect x="24" y="474" width="272" height="94" rx="10" fill="#fdf2f8" stroke="#c026d3" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="160" y="496" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        UDFのPythonコード
      </text>
      <text x="160" y="514" textAnchor="middle" fontSize="12" fill="#64748b">
        ここも実はクライアントでなく
      </text>
      <text x="160" y="530" textAnchor="middle" fontSize="12" fill="#64748b">
        Snowflake側のサンドボックスで実行
      </text>
      <text x="160" y="550" textAnchor="middle" fontSize="12" fontWeight="600" fill="#a21caf">
        データはこの中を出ない
      </text>

      <text x="160" y="592" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
        ※SPROCとして登録した場合は
      </text>
      <text x="160" y="610" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
        変換メソッドもここで動く（後述）
      </text>
    </svg>
  );
}
