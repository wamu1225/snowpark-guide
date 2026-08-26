// Snowpark MLのワークフロー（前処理→学習→登録→推論）をSnowflake内で完結させる流れを図解する。
export function SnowparkMlDiagram() {
  return (
    <svg
      viewBox="0 0 720 260"
      width="720"
      height="260"
      role="img"
      aria-label="Snowpark MLのワークフロー図。Snowflake上のテーブルのデータが、snowflake.ml.modelingによる前処理・学習を経て、snowflake.ml.registryにモデルとして登録され、そこからSQL/Python/REST APIで推論に使われるまで、すべてSnowflakeの外にデータやモデルを出さずに完結する。"
    >
      <defs>
        <marker id="ml-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#475569" />
        </marker>
      </defs>

      <rect x="8" y="16" width="704" height="228" rx="16" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
      <text x="360" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0284c7">
        すべてSnowflakeの中で完結（データもモデルも外に出ない）
      </text>

      <rect x="30" y="66" width="140" height="90" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="100" y="92" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">Snowflake</text>
      <text x="100" y="108" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">のテーブル</text>
      <text x="100" y="130" textAnchor="middle" fontSize="10" fill="#64748b">生データ</text>

      <path d="M170 111 H 210" stroke="#475569" strokeWidth="2" markerEnd="url(#ml-arrow)" />

      <rect x="212" y="66" width="150" height="90" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="287" y="88" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">snowflake.ml</text>
      <text x="287" y="104" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">.modeling</text>
      <text x="287" y="124" textAnchor="middle" fontSize="10" fill="#64748b">前処理・学習</text>
      <text x="287" y="140" textAnchor="middle" fontSize="9" fill="#64748b">（scikit-learn風API）</text>

      <path d="M362 111 H 402" stroke="#475569" strokeWidth="2" markerEnd="url(#ml-arrow)" />

      <rect x="404" y="66" width="150" height="90" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
      <text x="479" y="88" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">snowflake.ml</text>
      <text x="479" y="104" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">.registry</text>
      <text x="479" y="124" textAnchor="middle" fontSize="10" fill="#64748b">バージョン・指標</text>
      <text x="479" y="140" textAnchor="middle" fontSize="10" fill="#64748b">メタデータを保存</text>

      <path d="M554 111 H 594" stroke="#475569" strokeWidth="2" markerEnd="url(#ml-arrow)" />

      <rect x="596" y="66" width="106" height="90" rx="10" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="649" y="90" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">推論</text>
      <text x="649" y="106" textAnchor="middle" fontSize="9" fill="#166534">SQL</text>
      <text x="649" y="120" textAnchor="middle" fontSize="9" fill="#166534">Python</text>
      <text x="649" y="134" textAnchor="middle" fontSize="9" fill="#166534">REST API</text>

      <text x="360" y="190" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="600">
        前処理クラス例：StandardScaler / OneHotEncoder / OrdinalEncoder
      </text>
      <text x="360" y="210" textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="600">
        学習クラス例：XGBClassifier など scikit-learn互換のfit/predict API
      </text>
    </svg>
  );
}
