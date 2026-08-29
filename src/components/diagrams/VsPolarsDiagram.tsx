// PolarsとSnowparkの実行場所の違いを図解する。
// 上＝Polarsは手元の1台のマシンで完結。下＝Snowparkはクラウドの分散環境で実行される。
// 2026-08-29: O-2-25対応＝390px実効フォントが縮んでいたため、左右2列→上下2段に
// 再設計しviewBox幅を320へ狭めてfont-sizeを12〜16へ拡大。
export function VsPolarsDiagram() {
  return (
    <svg
      viewBox="0 0 320 400"
      width="320"
      height="400"
      role="img"
      aria-label="PolarsとSnowparkの実行場所の違いを示す図。Polarsは手元の1台のマシンのCPU上でApache Arrow形式のメモリを使い処理が完結する。Snowparkはネットワークの向こう側にあるSnowflakeの分散クラウド環境（複数ノードのVirtual Warehouse）で処理が実行され、データは外部に出ない。"
    >
      <defs>
        <marker id="vspolars-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      {/* Polars側 */}
      <rect x="8" y="8" width="304" height="150" rx="14" fill="#fae8ff" stroke="#c026d3" strokeWidth="2" />
      <text x="160" y="32" textAnchor="middle" fontSize="16" fontWeight="700" fill="#a21caf">
        Polars
      </text>
      <text x="160" y="50" textAnchor="middle" fontSize="12" fill="#64748b">
        手元の1台のマシンで完結
      </text>

      <rect x="24" y="62" width="272" height="34" rx="6" fill="#ffffff" stroke="#c026d3" strokeWidth="1" />
      <text x="160" y="84" textAnchor="middle" fontSize="13" fill="#334155">
        CPU（マルチコアで並列処理）
      </text>
      <rect x="24" y="102" width="272" height="34" rx="6" fill="#ffffff" stroke="#c026d3" strokeWidth="1" />
      <text x="160" y="124" textAnchor="middle" fontSize="13" fill="#334155">
        Arrow形式のメモリでデータ保持
      </text>

      <path d="M160 158 V 190" stroke="#94a3b8" strokeWidth="2" fill="none" strokeDasharray="4 3" markerEnd="url(#vspolars-arrow)" markerStart="url(#vspolars-arrow)" />
      <text x="160" y="178" textAnchor="middle" fontSize="12" fill="#64748b">
        ネットワーク越し
      </text>

      {/* Snowflake側 */}
      <rect x="8" y="200" width="304" height="192" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="160" y="224" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0284c7">
        Snowpark
      </text>
      <text x="160" y="242" textAnchor="middle" fontSize="12" fill="#64748b">
        クラウドの分散環境で実行
      </text>

      <text x="160" y="264" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        Snowflake Virtual Warehouse
      </text>
      <rect x="24" y="274" width="130" height="46" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
      <text x="89" y="302" textAnchor="middle" fontSize="12" fill="#334155">
        ノード1
      </text>
      <rect x="166" y="274" width="130" height="46" rx="6" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
      <text x="231" y="302" textAnchor="middle" fontSize="12" fill="#334155">
        ノード2…
      </text>
      <text x="160" y="342" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0284c7">
        マルチノードでペタバイト級も処理可能
      </text>
      <text x="160" y="362" textAnchor="middle" fontSize="12" fontWeight="600" fill="#a21caf">
        データは外部に出ない
      </text>
    </svg>
  );
}
