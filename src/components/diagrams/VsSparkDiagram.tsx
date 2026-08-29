// SparkとSnowparkのインフラ構造の違いを図解する。
// 上＝Sparkはユーザーがクラスタを持つ・データを引っ張ってくる必要がある。
// 下＝Snowparkはフルマネージドなウェアハウス・データを動かさずコードが評価される。
// 2026-08-29: O-2-25対応＝390px実効フォントが縮んでいたため、左右2列→上下2段に
// 再設計しviewBox幅を320へ狭めてfont-sizeを12〜16へ拡大。
export function VsSparkDiagram() {
  return (
    <svg
      viewBox="0 0 320 400"
      width="320"
      height="400"
      role="img"
      aria-label="ApacheSparkとSnowparkのインフラ構造の違いを示す図。Sparkはユーザーが自分でドライバーノードとワーカーノードのクラスタを管理し、常時稼働か都度起動停止のコストを負う。Snowparkはユーザーがクラスタを持たず、Snowflakeのフルマネージドな仮想ウェアハウスが秒単位課金・オートサスペンドで動く。"
    >
      <defs>
        <marker id="vsspark-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      {/* Spark側 */}
      <rect x="8" y="8" width="304" height="164" rx="14" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
      <text x="160" y="32" textAnchor="middle" fontSize="16" fontWeight="700" fill="#334155">
        Apache Spark
      </text>
      <text x="160" y="50" textAnchor="middle" fontSize="12" fill="#64748b">
        クラスタはあなたが用意・管理する
      </text>

      <rect x="24" y="62" width="130" height="50" rx="8" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <text x="89" y="92" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        ドライバー
      </text>

      <rect x="166" y="62" width="130" height="50" rx="8" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <text x="231" y="92" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        ワーカー群
      </text>

      <rect x="24" y="124" width="272" height="36" rx="8" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="160" y="147" textAnchor="middle" fontSize="12" fontWeight="700" fill="#92400e">
        常時稼働 or 起動・停止のコスト
      </text>

      <path d="M160 172 V 200" stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#vsspark-arrow)" />
      <text x="160" y="192" textAnchor="middle" fontSize="12" fill="#475569">
        データを転送（Egress）することも
      </text>

      {/* Snowflake側 */}
      <rect x="8" y="212" width="304" height="180" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="160" y="236" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0284c7">
        Snowpark
      </text>
      <text x="160" y="254" textAnchor="middle" fontSize="12" fill="#64748b">
        ウェアハウスはSnowflakeが管理する
      </text>

      <rect x="24" y="266" width="272" height="50" rx="8" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="160" y="296" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        Virtual Warehouse（フルマネージド）
      </text>

      <rect x="24" y="328" width="272" height="46" rx="8" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="160" y="349" textAnchor="middle" fontSize="12" fontWeight="700" fill="#166534">
        秒単位課金・オートサスペンド
      </text>
      <text x="160" y="365" textAnchor="middle" fontSize="12" fill="#166534">
        データを動かさずコードが評価される
      </text>
    </svg>
  );
}
