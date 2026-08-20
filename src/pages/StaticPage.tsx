import { mdToReact } from '../lib/md';
import type { StaticPage as StaticPageData } from '../data/static-pages';
import { href } from '../lib/router';

export function StaticPage({ page }: { page: StaticPageData }) {
  return (
    <article className="static-page">
      <h1>{page.title}</h1>
      {mdToReact(page.body)}
      <p className="static-page__back">
        <a href={href('/')}>トップへ戻る</a>
      </p>
    </article>
  );
}
