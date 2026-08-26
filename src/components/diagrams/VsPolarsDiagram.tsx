// PolarsとSnowparkの実行場所の違いを図解する。
// 左＝Polarsは手元の1台のマシンで完結。右＝Snowparkはクラウドの分散環境で実行される。
export function VsPolarsDiagram() {
  return (
    <svg
      viewBox="0 0 720 300"
      width="720"
      height="300"
      role="img"
      aria-label="PolarsとSnowparkの実行場所の違いを示す図。Polarsは手元の1台のマシンのCPU上でApache Arrow形式のメモリを使い処理が完結する。Snowparkはネットワークの向こう側にあるSnowflakeの分散クラウド環境（複数ノードのVirtual Warehouse）で処理が実行され、データは外部に出ない。"
    >
      <defs>
        <marker id="vspolars-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      {/* Polars側 */}
      <rect x="16" y="24" width="310" height="252" rx="14" fill="#fae8ff" stroke="#c026d3" strokeWidth="2" />
      <text x="171" y="52" textAnchor="middle" fontSize="15" fontWeight="700" fill="#a21caf">
        Polars
      </text>
      <text x="171" y="70" textAnchor="middle" fontSize="11" fill="#64748b">
        手元の1台のマシンで完結
      </text>

      <rect x="46" y="90" width="250" height="150" rx="10" fill="#ffffff" stroke="#c026d3" strokeWidth="1.5" />
      <text x="171" y="116" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
        あなたのPC / 1台のマシン
      </text>
      <rect x="66" y="130" width="210" height="34" rx="6" fill="#fdf2f8" stroke="#c026d3" strokeWidth="1" />
      <text x="171" y="151" textAnchor="middle" fontSize="11" fill="#334155">
        CPU（マルチコアで並列処理）
      </text>
      <rect x="66" y="174" width="210" height="34" rx="6" fill="#fdf2f8" stroke="#c026d3" strokeWidth="1" />
      <text x="171" y="195" textAnchor="middle" fontSize="11" fill="#334155">
        Arrow形式のメモリ上でデータ保持
      </text>
      <text x="171" y="222" textAnchor="middle" fontSize="10" fill="#a21caf">
        外部にデータを送信しない
      </text>

      {/* Snowflake側 */}
      <rect x="394" y="24" width="310" height="252" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="549" y="52" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0284c7">
        Snowpark
      </text>
      <text x="549" y="70" textAnchor="middle" fontSize="11" fill="#64748b">
        クラウドの分散環境で実行
      </text>

      <rect x="424" y="90" width="250" height="150" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="549" y="116" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
        Snowflake Virtual Warehouse
      </text>
      <rect x="444" y="130" width="90" height="60" rx="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
      <text x="489" y="164" textAnchor="middle" fontSize="10" fill="#334155">
        ノード1
      </text>
      <rect x="544" y="130" width="90" height="60" rx="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
      <text x="589" y="164" textAnchor="middle" fontSize="10" fill="#334155">
        ノード2…
      </text>
      <text x="549" y="222" textAnchor="middle" fontSize="10" fill="#0284c7">
        マルチノードでペタバイト級も処理可能
      </text>

      <path d="M326 150 H 394" stroke="#94a3b8" strokeWidth="2" fill="none" strokeDasharray="4 3" markerEnd="url(#vspolars-arrow)" markerStart="url(#vspolars-arrow)" />
      <text x="360" y="140" textAnchor="middle" fontSize="10" fill="#64748b">
        ネットワーク越し
      </text>
    </svg>
  );
}
