import { useEffect, useState, type ReactNode } from 'react';
import './App.css';
import { Home } from './pages/Home';
import { EntryPage } from './pages/EntryPage';
import { StaticPage } from './pages/StaticPage';
import { ConceptPage } from './pages/ConceptPage';
import { ALL_ENTRIES } from './data/entries';
import { STATIC_PAGES } from './data/static-pages';
import { CONCEPTS } from './data/concepts';
import { BASE, getCurrentPath, href, navigate } from './lib/router';

const SITE_TITLE = 'Snowpark ⇄ Polars 対応表';
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
      `${SITE_TITLE}｜DataFrame API 逆引きリファレンス`,
      'Snowpark PythonのDataFrame/Column APIを、Polarsの同等コードと並べて確認できる逆引きリファレンスです。挙動の違いと移行時の落とし穴をメソッドごとに解説します。',
      '/',
    );
    return (
      <Shell>
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
      `${entry.title}｜${SITE_TITLE}`,
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

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="masthead">
        <a href={href('/')} className="masthead-link">
          {SITE_TITLE}
        </a>
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
