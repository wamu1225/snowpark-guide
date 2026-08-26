// ウェアハウスの課金タイムライン（アイドル→起動→60秒最低課金→稼働中→自動一時停止）を図解する。
export function PricingDiagram() {
  return (
    <svg
      viewBox="0 0 720 220"
      width="720"
      height="220"
      role="img"
      aria-label="Snowflakeウェアハウスの課金タイムライン図。クエリが来るまでは課金されないアイドル状態から、クエリが来ると自動的にウェアハウスが起動し、起動直後の60秒は最低利用時間として課金される。その後は秒単位で課金が続き、一定時間クエリが来なくなると自動的に一時停止（オートサスペンド）して課金が止まる。"
    >
      <defs>
        <marker id="pricing-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      <line x1="20" y1="120" x2="700" y2="120" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pricing-arrow)" />
      <text x="700" y="140" textAnchor="end" fontSize="10" fill="#64748b">時間</text>

      {/* アイドル区間（課金なし） */}
      <rect x="20" y="70" width="110" height="50" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <text x="75" y="60" textAnchor="middle" fontSize="11" fill="#64748b">アイドル</text>
      <text x="75" y="140" textAnchor="middle" fontSize="10" fill="#94a3b8">課金なし</text>

      {/* 60秒最低課金 */}
      <rect x="130" y="70" width="90" height="50" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <text x="175" y="60" textAnchor="middle" fontSize="10" fontWeight="700" fill="#92400e">起動+最低60秒</text>
      <text x="175" y="140" textAnchor="middle" fontSize="10" fill="#92400e">課金開始</text>

      {/* 稼働中（秒単位課金） */}
      <rect x="220" y="70" width="240" height="50" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="340" y="60" textAnchor="middle" fontSize="11" fontWeight="700" fill="#166534">稼働中（アクション実行）</text>
      <text x="340" y="140" textAnchor="middle" fontSize="10" fill="#166534">秒単位で課金が続く</text>

      {/* 一時停止後アイドルへ */}
      <rect x="460" y="70" width="120" height="50" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <text x="520" y="60" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">オートサスペンド</text>
      <text x="520" y="140" textAnchor="middle" fontSize="10" fill="#94a3b8">課金停止</text>

      <text x="360" y="180" textAnchor="middle" fontSize="11" fill="#0f172a">
        課金対象は「起動から次の自動停止まで」＝アクションメソッドを呼んだ回数と間隔がそのままコストに直結する
      </text>
    </svg>
  );
}
