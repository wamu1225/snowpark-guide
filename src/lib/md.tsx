import type { ReactNode } from 'react';
import { href } from './router';

// `...` （インラインコード）と [text](/path/) （サイト内リンク）を変換する。**...**の内側でも使えるよう、
// inline() から再帰的に呼ばれる。
function codeAndLink(text: string, prefix: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={`${prefix}c${i}`}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={`${prefix}l${i}`} href={href(link[2])}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

// **...** （強調）を最外側として先に切り出し、内側は codeAndLink() で処理する
// （`**Polars 1.43.2では\`LazyFrame.pivot()\`を直接呼び出せる**` のように強調がコードを包む形に対応するため）。
// Entry型のdifference/pitfallフィールドもこの記法を使うため、EntryPage/prerenderからも呼ぶ。
export function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.flatMap((part, i): ReactNode[] => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return [<strong key={`b${i}`}>{codeAndLink(part.slice(2, -2), `b${i}-`)}</strong>];
    }
    return part ? codeAndLink(part, `p${i}-`) : [];
  });
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

// static-pages.ts の簡易記法（## 見出し／空行区切り段落／- 箇条書き／|表|／[リンク](/path/)）をReact要素へ変換する。
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
    if (block.startsWith('```')) {
      const lines = block.split('\n');
      const code = lines.slice(1, lines[lines.length - 1] === '```' ? -1 : undefined).join('\n');
      return (
        <pre key={i} className="concept-page__code">
          <code>{code}</code>
        </pre>
      );
    }
    const lines = block.split('\n');
    if (lines.length >= 2 && lines[0].startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[1])) {
      const header = parseTableRow(lines[0]);
      const rows = lines.slice(2).map(parseTableRow);
      return (
        <table key={i}>
          <thead>
            <tr>
              {header.map((h, j) => (
                <th key={j}>{inline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>{inline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <p key={i}>{inline(block)}</p>;
  });
}
