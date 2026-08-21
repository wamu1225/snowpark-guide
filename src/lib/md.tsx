import type { ReactNode } from 'react';
import { href } from './router';

// `...` はインラインコード、[text](/path/) はサイト内リンクに変換する。
function inline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={i} href={href(link[2])}>
          {link[1]}
        </a>
      );
    }
    return part;
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
