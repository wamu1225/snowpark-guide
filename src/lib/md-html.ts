// mdToReact (md.tsx) と同じ簡易記法をHTML文字列へ変換する版。
// scripts/prerender.ts はNode側でJSXを解さないため、JSX非依存のこちらを使う。
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// `...` はインラインコード、[text](/path/) はサイト内リンク、**...** は強調に変換する。
// base はサイトのBASEパス（例: '/snowpark-guide'）。Entry型のdifference/pitfallにも使うため export する。
export function inlineHtml(s: string, base = ''): string {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, path) => `<a href="${base}${path}">${text}</a>`);
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

export function mdToHtml(src: string, base = ''): string {
  const blocks = src.trim().split(/\n\n+/);
  return blocks
    .map((block) => {
      if (block.startsWith('## ')) return `<h2>${inlineHtml(block.slice(3).trim(), base)}</h2>`;
      if (block.startsWith('- ')) {
        const items = block
          .split('\n')
          .map((line) => `<li>${inlineHtml(line.replace(/^-\s*/, ''), base)}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      const lines = block.split('\n');
      if (lines.length >= 2 && lines[0].startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[1])) {
        const header = parseTableRow(lines[0]);
        const rows = lines.slice(2).map(parseTableRow);
        const thead = `<thead><tr>${header.map((h) => `<th>${inlineHtml(h, base)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows
          .map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell, base)}</td>`).join('')}</tr>`)
          .join('')}</tbody>`;
        return `<table>${thead}${tbody}</table>`;
      }
      return `<p>${inlineHtml(block, base)}</p>`;
    })
    .join('\n');
}
