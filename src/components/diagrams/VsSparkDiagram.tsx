// SparkとSnowparkのインフラ構造の違いを図解する。
// 左＝Sparkはユーザーがクラスタを持つ・データを引っ張ってくる必要がある。
// 右＝Snowparkはフルマネージドなウェアハウス・データを動かさずコードが評価される。
export function VsSparkDiagram() {
  return (
    <svg
      viewBox="0 0 720 340"
      width="720"
      height="340"
      role="img"
      aria-label="ApacheSparkとSnowparkのインフラ構造の違いを示す図。Sparkはユーザーが自分でドライバーノードとワーカーノードのクラスタを管理し、Snowflake上のデータを一度クラスタ側へ転送してから処理する。Snowparkはユーザーがクラスタを持たず、Snowflakeのフルマネージドな仮想ウェアハウス上でデータを動かさずにコードが評価される。"
    >
      <defs>
        <marker id="vsspark-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      {/* Spark側 */}
      <rect x="16" y="24" width="330" height="292" rx="14" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
      <text x="181" y="52" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">
        Apache Spark
      </text>
      <text x="181" y="70" textAnchor="middle" fontSize="11" fill="#64748b">
        クラスタはあなたが用意・管理する
      </text>

      <rect x="36" y="88" width="120" height="70" rx="8" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <text x="96" y="112" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
        ドライバー
      </text>
      <text x="96" y="130" textAnchor="middle" fontSize="10" fill="#64748b">
        ノード
      </text>

      <rect x="186" y="88" width="140" height="70" rx="8" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <text x="256" y="108" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
        ワーカーノード群
      </text>
      <text x="256" y="126" textAnchor="middle" fontSize="10" fill="#64748b">
        メモリ・台数を
      </text>
      <text x="256" y="140" textAnchor="middle" fontSize="10" fill="#64748b">
        自分でチューニング
      </text>

      <rect x="36" y="176" width="290" height="60" rx="8" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="181" y="198" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400e">
        常時起動 or 都度起動・停止の運用コスト
      </text>
      <text x="181" y="216" textAnchor="middle" fontSize="10" fill="#92400e">
        オートサスペンドの概念がない
      </text>

      <path d="M181 236 L181 260" stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#vsspark-arrow)" />
      <text x="181" y="278" textAnchor="middle" fontSize="10" fill="#475569">
        データをクラスタ側へ転送（Egress）
      </text>
      <text x="181" y="296" textAnchor="middle" fontSize="10" fill="#475569">
        してから処理することがある
      </text>

      {/* Snowflake側 */}
      <rect x="374" y="24" width="330" height="292" rx="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="539" y="52" textAnchor="middle" fontSize="15" fontWeight="700" fill="#0284c7">
        Snowpark
      </text>
      <text x="539" y="70" textAnchor="middle" fontSize="11" fill="#64748b">
        ウェアハウスはSnowflakeが管理する
      </text>

      <rect x="394" y="88" width="290" height="70" rx="8" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="539" y="112" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
        Virtual Warehouse（フルマネージド）
      </text>
      <text x="539" y="132" textAnchor="middle" fontSize="10" fill="#64748b">
        クラスタ運用の作業自体が発生しない
      </text>

      <rect x="394" y="176" width="290" height="60" rx="8" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="539" y="198" textAnchor="middle" fontSize="11" fontWeight="700" fill="#166534">
        秒単位課金・オートサスペンド/レジューム
      </text>
      <text x="539" y="216" textAnchor="middle" fontSize="10" fill="#166534">
        使わない時間は自動で課金停止
      </text>

      <path d="M539 236 L539 260" stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#vsspark-arrow)" />
      <text x="539" y="278" textAnchor="middle" fontSize="10" fill="#475569">
        データがある場所と同じ基盤の上で
      </text>
      <text x="539" y="296" textAnchor="middle" fontSize="10" fill="#475569">
        コードが評価される（転送不要）
      </text>
    </svg>
  );
}
