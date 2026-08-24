import { useEffect, useRef, useState } from 'react';
import { ALL_ENTRIES } from '../data/entries';
import { matchesQuery } from '../lib/search';
import { href, navigate } from '../lib/router';

// マストヘッドに常設する検索窓。個別ページから毎回トップへ戻らなくても
// 他のメソッドへ移動できるようにする（O-2-23 #3）。
export function SiteSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (ev: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const q = query.trim();
  const results = q ? ALL_ENTRIES.filter((e) => matchesQuery(q, e)).slice(0, 8) : [];

  const goTo = (slug: string) => {
    setQuery('');
    setOpen(false);
    navigate(`/${slug}/`);
  };

  return (
    <div className="site-search" ref={rootRef}>
      <label>
        <span className="sr-only">メソッド名で検索</span>
        <input
          type="search"
          placeholder="メソッド名・落とし穴で検索…"
          value={query}
          autoComplete="off"
          onChange={(ev) => {
            setQuery(ev.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </label>
      {open && q && (
        <ul className="site-search__results">
          {results.length === 0 ? (
            <li className="site-search__empty">一致するメソッドが見つかりません</li>
          ) : (
            results.map((e) => (
              <li key={e.slug}>
                <a
                  href={href(`/${e.slug}/`)}
                  onClick={(ev) => {
                    ev.preventDefault();
                    goTo(e.slug);
                  }}
                >
                  <span className="site-search__title">{e.title}</span>
                  <span className="site-search__summary">{e.summary}</span>
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
