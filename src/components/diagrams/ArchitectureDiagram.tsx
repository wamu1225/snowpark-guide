// Snowparkコードがどこで実行されるかを図解する。
// 左＝クライアントのPythonプロセス（論理プランの組み立てだけ）、右＝Snowflake（実際のデータ処理・UDFの実行）。
export function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 720 360"
      width="720"
      height="360"
      role="img"
      aria-label="Snowparkコードの実行場所を示す図。クライアント側でPythonが論理プランを組み立て、collect()等のアクションで初めてSnowflake側にSQLが送られ、ウェアハウスとUDFのPythonコードもSnowflake側で実行される。"
    >
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      {/* クライアント側 */}
      <rect x="16" y="24" width="290" height="312" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="161" y="54" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0284c7">
        クライアント（あなたのPythonプロセス）
      </text>

      <rect x="40" y="76" width="242" height="120" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="161" y="98" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        DataFrameの変換メソッド
      </text>
      <text x="161" y="120" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        df.select(...)
      </text>
      <text x="161" y="140" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        .filter(...)
      </text>
      <text x="161" y="160" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        .join(...)
      </text>
      <text x="161" y="182" textAnchor="middle" fontSize="11" fill="#64748b">
        ＝ここまでは論理プランの組み立てのみ
      </text>

      <rect x="40" y="216" width="242" height="96" rx="10" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="161" y="240" textAnchor="middle" fontSize="13" fontWeight="700" fill="#b45309">
        アクション呼び出し
      </text>
      <text x="161" y="264" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        df.collect() / .show()
      </text>
      <text x="161" y="284" textAnchor="middle" fontSize="12" fill="#334155" fontFamily="monospace">
        .save_as_table()
      </text>
      <text x="161" y="302" textAnchor="middle" fontSize="11" fill="#92400e">
        ここで初めてSQLが送信される
      </text>

      {/* 矢印（右へ：SQL送信） */}
      <path d="M282 130 H 430" stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#arch-arrow)" />
      <text x="356" y="118" textAnchor="middle" fontSize="11" fill="#475569">
        SQLに変換して送信
      </text>

      {/* 矢印（左へ：結果） */}
      <path d="M430 290 H 282" stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#arch-arrow)" />
      <text x="356" y="278" textAnchor="middle" fontSize="11" fill="#475569">
        結果（Rowのリスト）
      </text>

      {/* Snowflake側 */}
      <rect x="430" y="24" width="274" height="312" rx="14" fill="#fae8ff" stroke="#c026d3" strokeWidth="2" />
      <text x="567" y="54" textAnchor="middle" fontSize="16" fontWeight="700" fill="#a21caf">
        Snowflake（Virtual Warehouse）
      </text>

      <rect x="452" y="76" width="230" height="90" rx="10" fill="#ffffff" stroke="#c026d3" strokeWidth="1.5" />
      <text x="567" y="100" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        送られてきたSQLを実行
      </text>
      <text x="567" y="122" textAnchor="middle" fontSize="11" fill="#64748b">
        テーブルの読み取り・結合・
      </text>
      <text x="567" y="140" textAnchor="middle" fontSize="11" fill="#64748b">
        絞り込みなどの実データ処理
      </text>

      <rect x="452" y="182" width="230" height="90" rx="10" fill="#fdf2f8" stroke="#c026d3" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="567" y="206" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        UDFのPythonコード
      </text>
      <text x="567" y="228" textAnchor="middle" fontSize="11" fill="#64748b">
        ここも実は client ではなく
      </text>
      <text x="567" y="246" textAnchor="middle" fontSize="11" fill="#64748b">
        Snowflake側のサンドボックスで実行
      </text>

      <text x="567" y="300" textAnchor="middle" fontSize="11" fill="#a21caf">
        データはこの中を出ない
      </text>
    </svg>
  );
}
