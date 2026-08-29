// ウェアハウスの課金タイムライン（アイドル→起動→60秒最低課金→稼働中→自動一時停止）を図解する。
// 2026-08-29: O-2-25対応＝390px実効フォントが縮んでいたため、横一列のタイムライン→
// 縦方向（時間が上から下へ流れる）タイムラインに再設計しviewBox幅を320へ狭めて
// font-sizeを13〜15へ拡大。
export function PricingDiagram() {
  return (
    <svg
      viewBox="0 0 320 400"
      width="320"
      height="400"
      role="img"
      aria-label="Snowflakeウェアハウスの課金タイムライン図。クエリが来るまでは課金されないアイドル状態から、クエリが来ると自動的にウェアハウスが起動し、起動直後の60秒は最低利用時間として課金される。その後は秒単位で課金が続き、一定時間クエリが来なくなると自動的に一時停止（オートサスペンド）して課金が止まる。"
    >
      <defs>
        <marker id="pricing-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* アイドル */}
      <rect x="16" y="8" width="288" height="52" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="160" y="30" textAnchor="middle" fontSize="15" fontWeight="700" fill="#475569">
        アイドル
      </text>
      <text x="160" y="49" textAnchor="middle" fontSize="13" fill="#64748b">
        課金なし
      </text>
      <path d="M160 60 V 82" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pricing-arrow)" />

      {/* 起動+60秒最低課金 */}
      <rect x="16" y="86" width="288" height="52" rx="8" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="160" y="108" textAnchor="middle" fontSize="15" fontWeight="700" fill="#92400e">
        起動＋最低60秒
      </text>
      <text x="160" y="127" textAnchor="middle" fontSize="13" fill="#92400e">
        課金開始
      </text>
      <path d="M160 138 V 160" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pricing-arrow)" />

      {/* 稼働中 */}
      <rect x="16" y="164" width="288" height="52" rx="8" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="160" y="186" textAnchor="middle" fontSize="15" fontWeight="700" fill="#166534">
        稼働中（アクション実行）
      </text>
      <text x="160" y="205" textAnchor="middle" fontSize="13" fill="#166534">
        秒単位で課金が続く
      </text>
      <path d="M160 216 V 238" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pricing-arrow)" />

      {/* オートサスペンド */}
      <rect x="16" y="242" width="288" height="52" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="160" y="264" textAnchor="middle" fontSize="15" fontWeight="700" fill="#475569">
        オートサスペンド
      </text>
      <text x="160" y="283" textAnchor="middle" fontSize="13" fill="#64748b">
        課金停止
      </text>

      <text x="160" y="330" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        課金対象は「起動から次の自動停止まで」
      </text>
      <text x="160" y="352" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        ＝アクションを呼ぶ回数と間隔が
      </text>
      <text x="160" y="374" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
        そのままコストに直結する
      </text>
    </svg>
  );
}
