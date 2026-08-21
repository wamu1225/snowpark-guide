import { ALL_ENTRIES } from '../src/data/entries';
import { CATEGORIES } from '../src/data/types';
import { CONCEPTS } from '../src/data/concepts';

const errors: string[] = [];
const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
const seenSlugs = new Set<string>();
const REQUIRED_STRINGS = [
  'title',
  'summary',
  'snowparkCode',
  'polarsCode',
  'difference',
  'pitfall',
  'snowparkDocUrl',
  'polarsDocUrl',
] as const;

if (ALL_ENTRIES.length === 0) {
  errors.push('ALL_ENTRIES が空です');
}

for (const e of ALL_ENTRIES) {
  const label = e.slug || '(slugなし)';

  if (!/^[a-z0-9-]+$/.test(e.slug)) {
    errors.push(`${label}: slug は小文字英数とハイフンのみ（現在値: "${e.slug}"）`);
  }
  if (seenSlugs.has(e.slug)) {
    errors.push(`${label}: slug が重複しています`);
  }
  seenSlugs.add(e.slug);

  if (!CATEGORY_IDS.has(e.category)) {
    errors.push(`${label}: category "${e.category}" は CATEGORIES に存在しません`);
  }

  for (const field of REQUIRED_STRINGS) {
    const value = e[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${label}: ${field} が空です`);
    }
  }

  for (const url of [e.snowparkDocUrl, e.polarsDocUrl]) {
    if (!/^https:\/\//.test(url)) {
      errors.push(`${label}: URL が https:// で始まっていません（${url}）`);
    }
  }

  const v = e.verified;
  if (!v) {
    errors.push(`${label}: verified が未設定です`);
  } else {
    if (v.polarsExecuted !== true) {
      errors.push(`${label}: Polarsコードが実行未確認です（polarsExecuted !== true）`);
    }
    if (v.snowparkStaticChecked !== true) {
      errors.push(`${label}: Snowparkコードが静的検証未確認です（snowparkStaticChecked !== true）`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date ?? '')) {
      errors.push(`${label}: verified.date が YYYY-MM-DD 形式ではありません（${v.date}）`);
    }
    if (!v.polarsVersion || !v.snowparkSdkVersion) {
      errors.push(`${label}: verified.polarsVersion / snowparkSdkVersion が未設定です`);
    }
  }

  // 未検証のままGeminiドラフトの脚注マーカーが残っていないか（例: [span_12](start_span)）
  const fullText = [e.difference, e.pitfall, e.summary].join('\n');
  if (/\[span_\d+\]|start_span|end_span/.test(fullText)) {
    errors.push(`${label}: リサーチ下書きの脚注マーカーの残骸が本文に残っています`);
  }
}

// ── Layer A（基礎知識・概要）の検証 ──
const seenConceptSlugs = new Set<string>();
const entrySlugSet = new Set(ALL_ENTRIES.map((e) => e.slug));
if (CONCEPTS.length === 0) {
  errors.push('CONCEPTS が空です');
}
for (const c of CONCEPTS) {
  const label = `guide/${c.slug || '(slugなし)'}`;

  if (!/^[a-z0-9-]+$/.test(c.slug)) {
    errors.push(`${label}: slug は小文字英数とハイフンのみ（現在値: "${c.slug}"）`);
  }
  if (seenConceptSlugs.has(c.slug)) {
    errors.push(`${label}: slug が重複しています`);
  }
  seenConceptSlugs.add(c.slug);

  for (const field of ['title', 'summary', 'body'] as const) {
    if (typeof c[field] !== 'string' || c[field].trim().length === 0) {
      errors.push(`${label}: ${field} が空です`);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.verifiedDate ?? '')) {
    errors.push(`${label}: verifiedDate が YYYY-MM-DD 形式ではありません（${c.verifiedDate}）`);
  }

  if (!c.sources || c.sources.length === 0) {
    errors.push(`${label}: sources が空です（実行検証できない層なので出典必須）`);
  } else {
    for (const s of c.sources) {
      if (!/^https:\/\//.test(s.url)) {
        errors.push(`${label}: 出典URLが https:// で始まっていません（${s.url}）`);
      }
    }
  }

  for (const slug of c.relatedEntrySlugs) {
    if (!entrySlugSet.has(slug)) {
      errors.push(`${label}: relatedEntrySlugs の "${slug}" が ALL_ENTRIES に存在しません`);
    }
  }

  if (/\[span_\d+\]|start_span|end_span/.test(c.body)) {
    errors.push(`${label}: リサーチ下書きの脚注マーカーの残骸が本文に残っています`);
  }
}

if (errors.length > 0) {
  console.error(`validate-data: ${errors.length} 件のエラー`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `validate-data: OK（${ALL_ENTRIES.length} 件のエントリ、${CATEGORIES.length} カテゴリ、${CONCEPTS.length} 件の基礎知識ページ）`,
);
