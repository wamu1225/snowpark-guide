import { useEffect, useState, type ReactNode } from 'react';
import './App.css';
import { Home } from './pages/Home';
import { EntryPage } from './pages/EntryPage';
import { StaticPage } from './pages/StaticPage';
import { ConceptPage } from './pages/ConceptPage';
import { SiteSearch } from './components/SiteSearch';
import { ALL_ENTRIES } from './data/entries';
import { STATIC_PAGES } from './data/static-pages';
import { CONCEPTS } from './data/concepts';
import { BASE, getCurrentPath, href, navigate } from './lib/router';

// 2026-08-29: O-2-24 item C対応＝旧「Snowpark ⇄ Polars 対応表」は基礎知識ページ
// （料金・ML・アーキテクチャ等、Polarsと対応しないページ）にも一律で付いており、
// タイトルと中身が矛盾していた。サイト全体の名乗りは範囲を広げた「Snowpark 実践ガイド」
// にし、Polars比較が実際に当てはまる関数リファレンス（Layer B）だけ個別に
// 「Snowpark ⇄ Polars 逆引き」を名乗る。
const SITE_TITLE = 'Snowpark 実践ガイド';
const SITE_URL = 'https://study-apps.com' + BASE + '/';

function applyMeta(title: string, description: string, path: string) {
  document.title = title;
  const setMeta = (selector: string, attr: string, value: string) => {
    const el = document.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
    if (el) el.setAttribute(attr, value);
  };
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', 'https://study-apps.com' + BASE + path);
  setMeta('link[rel="canonical"]', 'href', 'https://study-apps.com' + BASE + path);
}

function useRoute() {
  const [path, setPath] = useState(getCurrentPath());
  useEffect(() => {
    const onPop = () => setPath(getCurrentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

export function App() {
  const path = useRoute();

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const target = (ev.target as HTMLElement).closest('a');
      if (!target) return;
      const url = target.getAttribute('href');
      if (!url || !url.startsWith(BASE) || target.target === '_blank') return;
      ev.preventDefault();
      navigate(url.slice(BASE.length) || '/');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (path === '/') {
    applyMeta(
      `${SITE_TITLE}｜DataFrame API逆引き＋アーキテクチャ・料金・ML`,
      'Snowpark Pythonの基礎知識（アーキテクチャ・Spark比較・Polars比較・UDF/UDTF/SPROC・料金・ML）と、DataFrame/Column APIをPolarsの同等コードと並べて確認できる逆引きリファレンスをまとめたサイトです。',
      '/',
    );
    return (
      <Shell showSearch={false}>
        <Home />
      </Shell>
    );
  }

  const staticSlug = path.replace(/^\/|\/$/g, '');
  const staticPage = STATIC_PAGES.find((p) => p.slug === staticSlug);
  if (staticPage) {
    applyMeta(`${staticPage.title}｜${SITE_TITLE}`, staticPage.description, path);
    return (
      <Shell>
        <StaticPage page={staticPage} />
      </Shell>
    );
  }

  const guideMatch = path.match(/^\/guide\/([a-z0-9-]+)\/$/);
  const concept = guideMatch ? CONCEPTS.find((c) => c.slug === guideMatch[1]) : undefined;
  if (concept) {
    applyMeta(`${concept.title}｜${SITE_TITLE}`, concept.summary, path);
    return (
      <Shell>
        <ConceptPage page={concept} />
      </Shell>
    );
  }

  const entrySlug = path.replace(/^\/|\/$/g, '');
  const entry = ALL_ENTRIES.find((e) => e.slug === entrySlug);
  if (entry) {
    applyMeta(
      `${entry.title}｜Snowpark ⇄ Polars 逆引き｜${SITE_TITLE}`,
      `${entry.summary} Snowparkでの書き方とPolarsでの書き方を並べて解説します。`,
      path,
    );
    return (
      <Shell>
        <EntryPage entry={entry} />
      </Shell>
    );
  }

  applyMeta(`ページが見つかりません｜${SITE_TITLE}`, 'お探しのページは見つかりませんでした。', path);
  return (
    <Shell>
      <div className="not-found">
        <h1>ページが見つかりません</h1>
        <p>
          <a href={href('/')}>トップへ戻る</a>
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children, showSearch = true }: { children: ReactNode; showSearch?: boolean }) {
  return (
    <div className="shell">
      <header className="masthead">
        <a href={href('/')} className="masthead-link">
          {SITE_TITLE}
        </a>
        {showSearch && <SiteSearch />}
      </header>
      <main>{children}</main>
      <footer className="footer-nav">
        <a href={href('/about/')}>このサイトについて</a>
        <a href={href('/privacy/')}>プライバシーポリシー</a>
        <a href={SITE_URL} target="_blank" rel="noreferrer">
          study-apps.com
        </a>
      </footer>
    </div>
  );
}
