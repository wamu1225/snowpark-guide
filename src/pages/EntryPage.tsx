import type { Entry } from '../data/types';
import { CATEGORIES } from '../data/types';
import { href } from '../lib/router';

export function EntryPage({ entry }: { entry: Entry }) {
  const category = CATEGORIES.find((c) => c.id === entry.category);
  return (
    <article className="entry-page">
      <p className="entry-page__crumb">
        <a href={href('/')}>トップ</a>
        {' / '}
        {category?.label ?? entry.category}
      </p>
      <h1>{entry.title}</h1>
      <p className="entry-page__summary">{entry.summary}</p>

      <div className="code-compare">
        <div className="code-compare__col">
          <h2 className="code-compare__label code-compare__label--snowpark">Snowpark</h2>
          <pre>
            <code>{entry.snowparkCode}</code>
          </pre>
        </div>
        <div className="code-compare__col">
          <h2 className="code-compare__label code-compare__label--polars">Polars</h2>
          <pre>
            <code>{entry.polarsCode}</code>
          </pre>
        </div>
      </div>

      <section className="entry-section">
        <h2>挙動・設計の違い</h2>
        <p>{entry.difference}</p>
      </section>

      <section className="entry-section entry-section--pitfall">
        <h2>移行時の落とし穴</h2>
        <p>{entry.pitfall}</p>
      </section>

      <section className="entry-section entry-section--refs">
        <h2>出典・検証情報</h2>
        <ul className="entry-page__refs">
          <li>
            <a href={entry.snowparkDocUrl} target="_blank" rel="noreferrer">
              Snowpark 公式リファレンス（{entry.title}）
            </a>
          </li>
          <li>
            <a href={entry.polarsDocUrl} target="_blank" rel="noreferrer">
              Polars 公式リファレンス（{entry.title}）
            </a>
          </li>
        </ul>
        <p className="entry-page__verified">
          Polars {entry.verified.polarsVersion} で実行確認 / Snowpark Python SDK {entry.verified.snowparkSdkVersion}{' '}
          で静的検証（{entry.verified.date}）
        </p>
      </section>
    </article>
  );
}
