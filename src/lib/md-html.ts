// mdToReact (md.tsx) と同じ簡易記法をHTML文字列へ変換する版。
// scripts/prerender.ts はNode側でJSXを解さないため、JSX非依存のこちらを使う。
function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

export function mdToHtml(src: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inlineHtml = (s: string) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const blocks = src.trim().split(/\n\n+/);
  return blocks
    .map((block) => {
      if (block.startsWith('## ')) return `<h2>${inlineHtml(block.slice(3).trim())}</h2>`;
      if (block.startsWith('- ')) {
        const items = block
          .split('\n')
          .map((line) => `<li>${inlineHtml(line.replace(/^-\s*/, ''))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      const lines = block.split('\n');
      if (lines.length >= 2 && lines[0].startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[1])) {
        const header = parseTableRow(lines[0]);
        const rows = lines.slice(2).map(parseTableRow);
        const thead = `<thead><tr>${header.map((h) => `<th>${inlineHtml(h)}</th>`).join('')}</tr></thead>`;
        const tbody = `<tbody>${rows
          .map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join('')}</tr>`)
          .join('')}</tbody>`;
        return `<table>${thead}${tbody}</table>`;
      }
      return `<p>${inlineHtml(block)}</p>`;
    })
    .join('\n');
}
