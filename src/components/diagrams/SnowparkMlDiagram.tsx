// Snowpark MLのワークフロー（前処理→学習→登録→推論）をSnowflake内で完結させる流れを図解する。
// 2026-08-29: O-2-25対応＝390px実効フォントが4px（viewBox 720幅×font-size 9）まで
// 縮んでいたため、横4列→縦4段のフローに再設計しviewBox幅を320へ狭めてfont-sizeを
// 12〜16へ拡大。前処理/学習クラス名の例示キャプションは本文のコード例と重複するため削除。
export function SnowparkMlDiagram() {
  const boxH = 74;
  const gap = 32;
  const rowY = (i: number) => 40 + i * (boxH + gap);
  return (
    <svg
      viewBox="0 0 320 460"
      width="320"
      height="460"
      role="img"
      aria-label="Snowpark MLのワークフロー図。Snowflake上のテーブルのデータが、snowflake.ml.modelingによる前処理・学習を経て、snowflake.ml.registryにモデルとして登録され、そこからSQL/Python/REST APIで推論に使われるまで、すべてSnowflakeの外にデータやモデルを出さずに完結する。"
    >
      <defs>
        <marker id="ml-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      <rect x="4" y="4" width="312" height="452" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="160" y="26" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0284c7">
        すべてSnowflakeの中で完結
      </text>

      {/* 1. データ */}
      <rect x="24" y={rowY(0)} width="272" height={boxH} rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="160" y={rowY(0) + 30} textAnchor="middle" fontSize="15" fontWeight="600" fill="#0f172a">
        Snowflakeのテーブル
      </text>
      <text x="160" y={rowY(0) + 54} textAnchor="middle" fontSize="13" fill="#64748b">
        生データ
      </text>
      <path d={`M160 ${rowY(0) + boxH} V ${rowY(1) - 2}`} stroke="#475569" strokeWidth="2" markerEnd="url(#ml-arrow)" />

      {/* 2. modeling */}
      <rect x="24" y={rowY(1)} width="272" height={boxH} rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="160" y={rowY(1) + 30} textAnchor="middle" fontSize="15" fontWeight="600" fill="#0f172a">
        snowflake.ml.modeling
      </text>
      <text x="160" y={rowY(1) + 54} textAnchor="middle" fontSize="13" fill="#64748b">
        前処理・学習
      </text>
      <path d={`M160 ${rowY(1) + boxH} V ${rowY(2) - 2}`} stroke="#475569" strokeWidth="2" markerEnd="url(#ml-arrow)" />

      {/* 3. registry */}
      <rect x="24" y={rowY(2)} width="272" height={boxH} rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="160" y={rowY(2) + 30} textAnchor="middle" fontSize="15" fontWeight="600" fill="#0f172a">
        snowflake.ml.registry
      </text>
      <text x="160" y={rowY(2) + 54} textAnchor="middle" fontSize="13" fill="#64748b">
        バージョン・指標を保存
      </text>
      <path d={`M160 ${rowY(2) + boxH} V ${rowY(3) - 2}`} stroke="#475569" strokeWidth="2" markerEnd="url(#ml-arrow)" />

      {/* 4. 推論 */}
      <rect x="24" y={rowY(3)} width="272" height={boxH} rx="10" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="160" y={rowY(3) + 30} textAnchor="middle" fontSize="15" fontWeight="600" fill="#166534">
        推論
      </text>
      <text x="160" y={rowY(3) + 54} textAnchor="middle" fontSize="13" fill="#166534">
        SQL / Python / REST API
      </text>
    </svg>
  );
}
