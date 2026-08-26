// UDF・Vectorized UDF・UDTF・SPROCの入出力の形を図解する。
// この4分類の主題は「入力の粒度と出力の粒度がどう変わるか」なので、矢印の本数で表現する。
export function UdfShapesDiagram() {
  const rowY = [70, 130, 190, 250];
  return (
    <svg
      viewBox="0 0 720 300"
      width="720"
      height="300"
      role="img"
      aria-label="スカラUDF・VectorizedUDF・UDTF・ストアドプロシージャの入出力の形を示す図。スカラUDFは1行の入力に対して1つの値を返す。VectorizedUDFは複数行をまとめたバッチを受け取りバッチで返す。UDTFは1行の入力から複数行を出力できる。ストアドプロシージャは表形式の入出力にとらわれず任意の処理手順を実行する。"
    >
      <defs>
        <marker id="udf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#0284c7" />
        </marker>
      </defs>

      <text x="16" y="26" fontSize="13" fontWeight="700" fill="#0f172a">
        入力の形
      </text>
      <text x="300" y="26" fontSize="13" fontWeight="700" fill="#0f172a">

      </text>
      <text x="420" y="26" fontSize="13" fontWeight="700" fill="#0f172a">
        出力の形
      </text>

      {/* 1. スカラUDF：1行→1値 */}
      <rect x="16" y={rowY[0] - 24} width="60" height="24" rx="4" fill="#e0f2fe" stroke="#0284c7" />
      <text x="46" y={rowY[0] - 7} textAnchor="middle" fontSize="10" fill="#0f172a">1行</text>
      <path d={`M80 ${rowY[0] - 12} H 300`} stroke="#0284c7" strokeWidth="2" markerEnd="url(#udf-arrow)" />
      <text x="190" y={rowY[0] - 18} textAnchor="middle" fontSize="11" fill="#0284c7" fontWeight="600">スカラUDF</text>
      <rect x="310" y={rowY[0] - 24} width="60" height="24" rx="4" fill="#e0f2fe" stroke="#0284c7" />
      <text x="340" y={rowY[0] - 7} textAnchor="middle" fontSize="10" fill="#0f172a">1値</text>
      <text x="400" y={rowY[0] - 7} fontSize="10" fill="#64748b">SELECT句・WHERE句から直接呼べる</text>

      {/* 2. Vectorized UDF：複数行(バッチ)→複数値(バッチ) */}
      <rect x="16" y={rowY[1] - 24} width="60" height="24" rx="4" fill="#dcfce7" stroke="#15803d" />
      <text x="46" y={rowY[1] - 7} textAnchor="middle" fontSize="10" fill="#0f172a">N行</text>
      <path d={`M80 ${rowY[1] - 12} H 300`} stroke="#15803d" strokeWidth="4" markerEnd="url(#udf-arrow)" />
      <text x="190" y={rowY[1] - 18} textAnchor="middle" fontSize="11" fill="#15803d" fontWeight="600">Vectorized UDF（バッチ）</text>
      <rect x="310" y={rowY[1] - 24} width="60" height="24" rx="4" fill="#dcfce7" stroke="#15803d" />
      <text x="340" y={rowY[1] - 7} textAnchor="middle" fontSize="10" fill="#0f172a">N値</text>
      <text x="400" y={rowY[1] - 7} fontSize="10" fill="#64748b">Pandas DataFrame/Seriesでまとめて処理</text>

      {/* 3. UDTF：1行→複数行 */}
      <rect x="16" y={rowY[2] - 24} width="60" height="24" rx="4" fill="#fae8ff" stroke="#c026d3" />
      <text x="46" y={rowY[2] - 7} textAnchor="middle" fontSize="10" fill="#0f172a">1行</text>
      <path d={`M80 ${rowY[2] - 18} H 300`} stroke="#c026d3" strokeWidth="1.5" markerEnd="url(#udf-arrow)" />
      <path d={`M80 ${rowY[2] - 6} H 300`} stroke="#c026d3" strokeWidth="1.5" markerEnd="url(#udf-arrow)" />
      <text x="190" y={rowY[2] - 24} textAnchor="middle" fontSize="11" fill="#c026d3" fontWeight="600">UDTF</text>
      <rect x="310" y={rowY[2] - 30} width="60" height="16" rx="4" fill="#fae8ff" stroke="#c026d3" />
      <rect x="310" y={rowY[2] - 12} width="60" height="16" rx="4" fill="#fae8ff" stroke="#c026d3" />
      <text x="340" y={rowY[2] - 19} textAnchor="middle" fontSize="9" fill="#0f172a">複数行</text>
      <text x="400" y={rowY[2] - 7} fontSize="10" fill="#64748b">FROM句から呼び、表形式に展開する</text>

      {/* 4. SPROC：任意の処理手順（矢印でなく制御フロー） */}
      <rect x="16" y={rowY[3] - 24} width="354" height="24" rx="4" fill="#fef3c7" stroke="#b45309" />
      <text x="193" y={rowY[3] - 7} textAnchor="middle" fontSize="11" fill="#92400e" fontWeight="600">
        SPROC＝条件分岐・ループ・DDL/DMLをCALL文で実行（表の形にとらわれない）
      </text>
      <text x="400" y={rowY[3] - 7} fontSize="10" fill="#64748b">UDF/UDTFにできないDDL/DMLも可能</text>
    </svg>
  );
}
