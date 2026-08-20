import type { ReactNode } from 'react';

// `...` で囲んだインラインコードだけを <code> に変換する。
function inline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}

// static-pages.ts の簡易記法（## 見出し／空行区切り段落／- 箇条書き）をReact要素へ変換する。
// prerender.ts 側は同じ規則を素朴な文字列結合でHTML化する（別実装・同じ規則）。
export function mdToReact(src: string): ReactNode[] {
  const blocks = src.trim().split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith('## ')) {
      return <h2 key={i}>{block.slice(3).trim()}</h2>;
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').map((line) => line.replace(/^-\s*/, ''));
      return (
        <ul key={i}>
          {items.map((item, j) => (
            <li key={j}>{inline(item)}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{inline(block)}</p>;
  });
}
