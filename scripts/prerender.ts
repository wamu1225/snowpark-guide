// scripts/prerender.ts — SSG。トップ・各エントリページ・about・privacy の静的フォールバックHTML・
// per-page meta・JSON-LD を焼き込み、sitemap.xml を生成する。
// 実行: npx tsx scripts/prerender.ts（npm run predeploy 内）
import * as fs from 'fs';
import * as path from 'path';
import { ALL_ENTRIES } from '../src/data/entries';
import { CATEGORIES } from '../src/data/types';
import { STATIC_PAGES } from '../src/data/static-pages';
import { CONCEPTS } from '../src/data/concepts';
import { mdToHtml, inlineHtml } from '../src/lib/md-html';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const BASE = '/snowpark-guide';
const BASE_URL = 'https://study-apps.com/snowpark-guide';
const SITE_TITLE = 'Snowpark ⇄ Polars 対応表';

console.log('--- snowpark-guide SSG Pre-rendering ---');
if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const templateHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
// base './' のため、サブディレクトリ用に相対パスを ../ に変換
const subTemplateHtml = templateHtml
  .replace(/href="\.\/assets\//g, 'href="../assets/')
  .replace(/src="\.\/assets\//g, 'src="../assets/')
  .replace(/href="\.\/favicon\.svg"/g, 'href="../favicon.svg"');

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function applyMeta(html: string, title: string, description: string, urlPath: string): string {
  const fullTitle = urlPath === '/' ? `${SITE_TITLE}｜DataFrame API 逆引きリファレンス` : `${title}｜${SITE_TITLE}`;
  const url = `${BASE_URL}${urlPath}`;
  return html
    .replace(/<title>.*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace(/<meta property="og:title" content=".*?"\s*\/>/, `<meta property="og:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta property="og:description" content=".*?"\s*\/>/, `<meta property="og:description" content="${esc(description)}" />`)
    .replace(/<meta property="og:url" content=".*?"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/>/, `<meta name="twitter:title" content="${esc(fullTitle)}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
}

function writePage(subpath: string, html: string) {
  const dir = subpath === '' ? DIST_DIR : path.join(DIST_DIR, subpath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const footerNav = `<nav style="margin-top:24px;display:flex;gap:16px;flex-wrap:wrap;font-size:0.85rem"><a href="${BASE}/about/" style="color:#94a3b8">このサイトについて</a><a href="${BASE}/privacy/" style="color:#94a3b8">プライバシーポリシー</a></nav>`;
const shellOpen = `<div style="max-width:760px;margin:0 auto;padding:24px 16px;font-family:sans-serif;line-height:1.8;color:#0f172a">`;
const shellClose = `</div>`;

// ── トップ：検索窓はJS必須なので、静的フォールバックには9カテゴリ×全エントリの一覧を持たせる ──
const homeDesc =
  'Snowpark PythonのDataFrame/Column APIを、Polarsの同等コードと並べて確認できる逆引きリファレンスです。挙動の違いと移行時の落とし穴をメソッドごとに解説します。';
const categoryListHtml = CATEGORIES.filter((cat) => ALL_ENTRIES.some((e) => e.category === cat.id))
  .map((cat) => {
    const entries = ALL_ENTRIES.filter((e) => e.category === cat.id);
    const items = entries
      .map((e) => `<li><a href="${BASE}/${e.slug}/" style="color:#38bdf8">${esc(e.title)}</a> ── ${esc(e.summary)}</li>`)
      .join('\n');
    return `<section style="margin-top:24px"><h2 style="font-size:1.1rem">${esc(cat.label)}</h2><p style="color:#94a3b8;font-size:0.9rem">${esc(cat.description)}</p><ul style="padding-left:20px">${items}</ul></section>`;
  })
  .join('\n');
const conceptListHtml = `<section style="margin-top:24px"><h2 style="font-size:1.1rem">基礎から読む</h2><ul style="padding-left:20px">${CONCEPTS.map(
  (c) => `<li><a href="${BASE}/guide/${c.slug}/" style="color:#38bdf8">${esc(c.title)}</a> ── ${esc(c.summary)}</li>`,
).join('\n')}</ul></section>`;
const homeFallback = `${shellOpen}
  <h1 style="font-size:1.7rem;margin-bottom:8px">${SITE_TITLE}</h1>
  <p style="color:#475569">${esc(homeDesc)}</p>
  ${conceptListHtml}
  ${categoryListHtml}
  ${footerNav}
${shellClose}`;
let rootHtml = applyMeta(templateHtml, '', homeDesc, '/');
rootHtml = rootHtml.replace('<div id="root"></div>', `<div id="root">${homeFallback}</div>`);
const homeJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_TITLE,
  url: `${BASE_URL}/`,
  description: homeDesc,
  inLanguage: 'ja',
});
rootHtml = rootHtml.replace('</head>', `<script type="application/ld+json">${homeJsonLd}</script>\n  </head>`);
writePage('', rootHtml);
console.log('✓ トップページ');

// ── 各エントリページ（1メソッド1ページ） ──
for (const e of ALL_ENTRIES) {
  const category = CATEGORIES.find((c) => c.id === e.category);
  const desc = `${e.summary} Snowparkでの書き方とPolarsでの書き方を並べて解説します。`;
  const siblings = ALL_ENTRIES.filter((s) => s.category === e.category && s.slug !== e.slug);
  const siblingsHtml =
    siblings.length === 0
      ? ''
      : `<h2 style="font-size:1.05rem">${esc(category?.label ?? e.category)}の他のメソッド</h2><ul style="padding-left:20px">${siblings
          .map((s) => `<li><a href="${BASE}/${s.slug}/" style="color:#38bdf8">${esc(s.title)}</a> ── ${esc(s.summary)}</li>`)
          .join('')}</ul>`;
  const relatedConcepts = CONCEPTS.filter((c) => c.relatedEntrySlugs.includes(e.slug));
  const relatedConceptsHtml =
    relatedConcepts.length === 0
      ? ''
      : `<h2 style="font-size:1.05rem">関連する基礎知識</h2><ul style="padding-left:20px">${relatedConcepts
          .map((c) => `<li><a href="${BASE}/guide/${c.slug}/" style="color:#38bdf8">${esc(c.title)}</a></li>`)
          .join('')}</ul>`;
  const fallback = `${shellOpen}
    <p style="color:#94a3b8;font-size:0.9rem"><a href="${BASE}/" style="color:#94a3b8">トップ</a> / ${esc(category?.label ?? e.category)}</p>
    <h1 style="font-family:monospace;font-size:1.6rem;margin-bottom:8px">${esc(e.title)}</h1>
    <p style="color:#475569">${esc(e.summary)}</p>
    <div style="display:flex;flex-wrap:wrap;gap:16px;margin:20px 0">
      <div style="flex:1;min-width:260px">
        <h2 style="color:#0284c7;font-size:0.9rem">SNOWPARK <span style="opacity:0.75;font-weight:500">静的検証のみ</span></h2>
        <pre style="background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow-x:auto"><code>${esc(e.snowparkCode)}</code></pre>
      </div>
      <div style="flex:1;min-width:260px">
        <h2 style="color:#c026d3;font-size:0.9rem">POLARS <span style="opacity:0.75;font-weight:500">実行確認済み</span></h2>
        <pre style="background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow-x:auto"><code>${esc(e.polarsCode)}</code></pre>
      </div>
    </div>
    <h2 style="font-size:1.05rem">挙動・設計の違い</h2>
    <p>${inlineHtml(e.difference, BASE)}</p>
    <h2 style="font-size:1.05rem;color:#b45309">移行時の落とし穴</h2>
    <p>${inlineHtml(e.pitfall, BASE)}</p>
    ${siblingsHtml}
    ${relatedConceptsHtml}
    <h2 style="font-size:1.05rem">出典・検証情報</h2>
    <ul style="padding-left:20px">
      <li><a href="${e.snowparkDocUrl}" style="color:#38bdf8">Snowpark 公式リファレンス（${esc(e.title)}）</a></li>
      <li><a href="${e.polarsDocUrl}" style="color:#38bdf8">Polars 公式リファレンス（${esc(e.title)}）</a></li>
    </ul>
    <p style="color:#94a3b8;font-size:0.85rem">Polars ${esc(e.verified.polarsVersion)} で実行確認 / Snowpark Python SDK ${esc(e.verified.snowparkSdkVersion)} で静的検証（${esc(e.verified.date)}）</p>
    ${footerNav}
  ${shellClose}`;
  let html = applyMeta(subTemplateHtml, e.title, desc, `/${e.slug}/`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: e.title,
    description: desc,
    url: `${BASE_URL}/${e.slug}/`,
    dateModified: e.verified.date,
    inLanguage: 'ja',
  });
  html = html.replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n  </head>`);
  writePage(e.slug, html);
}
console.log(`✓ エントリページ ${ALL_ENTRIES.length} 件`);

// ── 基礎知識（Layer A） ──
for (const c of CONCEPTS) {
  const related = c.relatedEntrySlugs.map((slug) => ALL_ENTRIES.find((e) => e.slug === slug)).filter(Boolean);
  const relatedHtml =
    related.length === 0
      ? ''
      : `<h2 style="font-size:1.05rem">関連する関数リファレンス</h2><ul style="padding-left:20px">${related
          .map((e) => `<li><a href="${BASE}/${e!.slug}/" style="color:#38bdf8">${esc(e!.title)}</a></li>`)
          .join('')}</ul>`;
  const sourcesHtml = c.sources
    .map((s) => `<li><a href="${s.url}" style="color:#38bdf8">${esc(s.label)}</a></li>`)
    .join('');
  const fallback = `${shellOpen}
    <p style="color:#94a3b8;font-size:0.9rem"><a href="${BASE}/" style="color:#94a3b8">トップ</a> / 基礎知識</p>
    <h1 style="font-size:1.6rem;margin-bottom:8px">${esc(c.title)}</h1>
    <p style="color:#475569">${esc(c.summary)}</p>
    ${mdToHtml(c.body, BASE)}
    ${relatedHtml}
    <h2 style="font-size:1.05rem">出典</h2>
    <ul style="padding-left:20px">${sourcesHtml}</ul>
    <p style="color:#94a3b8;font-size:0.85rem">公式ドキュメントの記載にもとづく解説です（実行検証はしていません）。確認日：${esc(c.verifiedDate)}</p>
    ${footerNav}
  ${shellClose}`;
  let html = applyMeta(subTemplateHtml, c.title, c.summary, `/guide/${c.slug}/`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: c.title,
    description: c.summary,
    url: `${BASE_URL}/guide/${c.slug}/`,
    dateModified: c.verifiedDate,
    inLanguage: 'ja',
  });
  html = html.replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n  </head>`);
  writePage(`guide/${c.slug}`, html);
}
console.log(`✓ 基礎知識ページ ${CONCEPTS.length} 件`);

// ── about / privacy ──
for (const page of STATIC_PAGES) {
  const fallback = `${shellOpen}
    <h1 style="font-size:1.5rem;margin-bottom:14px">${esc(page.title)}</h1>
    ${mdToHtml(page.body, BASE)}
    ${footerNav}
  ${shellClose}`;
  let html = applyMeta(subTemplateHtml, page.title, page.description, `/${page.slug}/`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: `${BASE_URL}/${page.slug}/`,
    inLanguage: 'ja',
  });
  html = html.replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n  </head>`);
  writePage(page.slug, html);
}
console.log('✓ /about/ /privacy/');

// ── sitemap.xml ──
const today = new Date().toISOString().split('T')[0];
const urls = [
  { loc: `${BASE_URL}/`, priority: '1.0' },
  ...ALL_ENTRIES.map((e) => ({ loc: `${BASE_URL}/${e.slug}/`, priority: '0.8' })),
  ...CONCEPTS.map((c) => ({ loc: `${BASE_URL}/guide/${c.slug}/`, priority: '0.7' })),
  { loc: `${BASE_URL}/about/`, priority: '0.3' },
  { loc: `${BASE_URL}/privacy/`, priority: '0.2' },
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
console.log(`✓ sitemap.xml（全${urls.length}URL）`);

console.log('--- Done ---');
