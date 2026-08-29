// UDF・Vectorized UDF・UDTF・SPROCの入出力の形を図解する。
// この4分類の主題は「入力の粒度と出力の粒度がどう変わるか」なので、矢印の本数で表現する。
// 2026-08-29: O-2-25対応＝390px実効フォントが4.0px（viewBox 720幅×font-size 9）まで
// 縮んでいた。右側の補足キャプション列（本文下の早見表と重複していた）を削り、
// viewBoxを380幅まで狭めてfont-sizeを14〜17に拡大＝実効フォントを11px以上に引き上げた。
export function UdfShapesDiagram() {
  const rowY = [56, 136, 216, 296];
  return (
    <svg
      viewBox="0 0 380 330"
      width="380"
      height="330"
      role="img"
      aria-label="スカラUDF・VectorizedUDF・UDTF・ストアドプロシージャの入出力の形を示す図。スカラUDFは1行の入力に対して1つの値を返す。VectorizedUDFは複数行をまとめたバッチを受け取りバッチで返す。UDTFは1行の入力から複数行を出力できる。ストアドプロシージャは表形式の入出力にとらわれず任意の処理手順を実行する。"
    >
      <defs>
        <marker id="udf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#0284c7" />
        </marker>
      </defs>

      {/* 1. スカラUDF：1行→1値 */}
      <text x="10" y={rowY[0] - 26} fontSize="16" fontWeight="700" fill="#0284c7">
        スカラUDF
      </text>
      <rect x="10" y={rowY[0] - 20} width="70" height="30" rx="5" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      <text x="45" y={rowY[0]} textAnchor="middle" fontSize="15" fill="#0f172a">1行</text>
      <path d={`M84 ${rowY[0] - 5} H 286`} stroke="#0284c7" strokeWidth="2" markerEnd="url(#udf-arrow)" />
      <rect x="290" y={rowY[0] - 20} width="80" height="30" rx="5" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      <text x="330" y={rowY[0]} textAnchor="middle" fontSize="15" fill="#0f172a">1つの値</text>

      {/* 2. Vectorized UDF：複数行(バッチ)→複数値(バッチ) */}
      <text x="10" y={rowY[1] - 26} fontSize="16" fontWeight="700" fill="#15803d">
        Vectorized UDF
      </text>
      <rect x="10" y={rowY[1] - 20} width="70" height="30" rx="5" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="45" y={rowY[1]} textAnchor="middle" fontSize="15" fill="#0f172a">N行</text>
      <path d={`M84 ${rowY[1] - 5} H 286`} stroke="#15803d" strokeWidth="4" markerEnd="url(#udf-arrow)" />
      <rect x="290" y={rowY[1] - 20} width="80" height="30" rx="5" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="330" y={rowY[1]} textAnchor="middle" fontSize="15" fill="#0f172a">N個の値</text>

      {/* 3. UDTF：1行→複数行 */}
      <text x="10" y={rowY[2] - 26} fontSize="16" fontWeight="700" fill="#a21caf">
        UDTF
      </text>
      <rect x="10" y={rowY[2] - 20} width="70" height="30" rx="5" fill="#fae8ff" stroke="#c026d3" strokeWidth="1.5" />
      <text x="45" y={rowY[2]} textAnchor="middle" fontSize="15" fill="#0f172a">1行</text>
      <path d={`M84 ${rowY[2] - 12} H 286`} stroke="#c026d3" strokeWidth="1.5" markerEnd="url(#udf-arrow)" />
      <path d={`M84 ${rowY[2] + 2} H 286`} stroke="#c026d3" strokeWidth="1.5" markerEnd="url(#udf-arrow)" />
      <rect x="290" y={rowY[2] - 26} width="80" height="18" rx="4" fill="#fae8ff" stroke="#c026d3" strokeWidth="1.5" />
      <rect x="290" y={rowY[2] + 6} width="80" height="18" rx="4" fill="#fae8ff" stroke="#c026d3" strokeWidth="1.5" />
      <text x="330" y={rowY[2] - 13} textAnchor="middle" fontSize="14" fill="#0f172a">複数行</text>
      <text x="330" y={rowY[2] + 19} textAnchor="middle" fontSize="14" fill="#0f172a">複数行</text>

      {/* 4. SPROC：任意の処理手順（矢印でなく制御フロー） */}
      <text x="10" y={rowY[3] - 26} fontSize="16" fontWeight="700" fill="#92400e">
        ストアドプロシージャ
      </text>
      <rect x="10" y={rowY[3] - 20} width="360" height="42" rx="6" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="190" y={rowY[3] - 2} textAnchor="middle" fontSize="14" fontWeight="600" fill="#92400e">
        表の形にとらわれない
      </text>
      <text x="190" y={rowY[3] + 17} textAnchor="middle" fontSize="14" fontWeight="600" fill="#92400e">
        条件分岐・ループ・DDL/DMLを実行
      </text>
    </svg>
  );
}
