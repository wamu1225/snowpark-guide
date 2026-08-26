import type { ComponentType } from 'react';
import { mdToReact } from '../lib/md';
import type { ConceptPage as ConceptPageData } from '../data/concepts';
import { ALL_ENTRIES } from '../data/entries';
import { href } from '../lib/router';
import { ArchitectureDiagram } from '../components/diagrams/ArchitectureDiagram';

// 主題が「構造・比較・入出力の形」の概念ページは図が本体になる。slugで該当図を出し分ける。
const DIAGRAMS: Record<string, ComponentType> = {
  architecture: ArchitectureDiagram,
};

export function ConceptPage({ page }: { page: ConceptPageData }) {
  const related = page.relatedEntrySlugs
    .map((slug) => ALL_ENTRIES.find((e) => e.slug === slug))
    .filter((e): e is (typeof ALL_ENTRIES)[number] => !!e);
  const Diagram = DIAGRAMS[page.slug];

  return (
    <article className="concept-page">
      <p className="entry-page__crumb">
        <a href={href('/')}>トップ</a>
        {' / 基礎知識'}
      </p>
      <h1>{page.title}</h1>
      <p className="entry-page__summary">{page.summary}</p>

      {Diagram && (
        <div className="concept-diagram">
          <Diagram />
        </div>
      )}

      {mdToReact(page.body)}

      {related.length > 0 && (
        <section className="entry-section entry-section--refs">
          <h2>関連する関数リファレンス</h2>
          <ul className="entry-page__refs">
            {related.map((e) => (
              <li key={e.slug}>
                <a href={href(`/${e.slug}/`)}>{e.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="entry-section entry-section--refs">
        <h2>出典</h2>
        <ul className="entry-page__refs">
          {page.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="entry-page__verified">
          公式ドキュメントの記載にもとづく解説です（実行検証はしていません）。確認日：{page.verifiedDate}
        </p>
      </section>
    </article>
  );
}
