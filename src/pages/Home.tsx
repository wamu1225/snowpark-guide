import { useMemo, useState } from 'react';
import { ALL_ENTRIES } from '../data/entries';
import { CATEGORIES } from '../data/types';
import { href } from '../lib/router';

function matches(query: string, e: (typeof ALL_ENTRIES)[number]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    e.title.toLowerCase().includes(q) ||
    e.summary.toLowerCase().includes(q) ||
    e.snowparkCode.toLowerCase().includes(q) ||
    e.polarsCode.toLowerCase().includes(q)
  );
}

export function Home() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => ALL_ENTRIES.filter((e) => matches(query, e)), [query]);
  const isSearching = query.trim().length > 0;

  return (
    <div className="home">
      <header className="home__hero">
        <h1>Snowpark ⇄ Polars 対応表</h1>
        <p className="home__lead">
          Snowpark Python の DataFrame / Column API と、Polars の LazyFrame / Expression API を、
          同じ処理を書くときに並べて見比べられる逆引きリファレンスです。メソッド名で検索するか、
          下のカテゴリから探してください。
        </p>
        <label className="home__search">
          <span className="sr-only">メソッド名で検索</span>
          <input
            type="search"
            placeholder="例: select, with_columns, group_by …"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            autoComplete="off"
          />
        </label>
      </header>

      {isSearching ? (
        <section className="home__results">
          <h2>「{query}」の検索結果（{filtered.length}件）</h2>
          {filtered.length === 0 ? (
            <p className="home__empty">一致するメソッドが見つかりませんでした。カテゴリから探してみてください。</p>
          ) : (
            <ul className="entry-list">
              {filtered.map((e) => (
                <li key={e.slug}>
                  <a href={href(`/${e.slug}/`)} className="entry-list__item">
                    <span className="entry-list__title">{e.title}</span>
                    <span className="entry-list__summary">{e.summary}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="home__categories">
          {CATEGORIES.map((cat) => {
            const entries = ALL_ENTRIES.filter((e) => e.category === cat.id);
            return (
              <section key={cat.id} className="category-block" id={cat.id}>
                <h2>{cat.label}</h2>
                <p className="category-block__desc">{cat.description}</p>
                {entries.length === 0 ? (
                  <p className="category-block__soon">準備中</p>
                ) : (
                  <ul className="entry-list">
                    {entries.map((e) => (
                      <li key={e.slug}>
                        <a href={href(`/${e.slug}/`)} className="entry-list__item">
                          <span className="entry-list__title">{e.title}</span>
                          <span className="entry-list__summary">{e.summary}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </section>
      )}
    </div>
  );
}
