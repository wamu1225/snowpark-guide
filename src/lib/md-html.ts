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

// 空行区切りでブロックを切るが、```フェンス内の空行では区切らない
// （フェンス内に空行を含むコード例が2ブロックに分割され、閉じ```が生テキストとして
// 露出するバグを2026-08-27に発見・修正）。
function splitBlocks(src: string): string[] {
  const lines = src.trim().split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence;
      current.push(line);
      if (!inFence) {
        blocks.push(current.join('\n'));
        current = [];
      }
      continue;
    }
    if (inFence) {
      current.push(line);
      continue;
    }
    if (line.trim() === '') {
      if (current.length) {
        blocks.push(current.join('\n'));
        current = [];
      }
      continue;
    }
    current.push(line);
  }
  if (current.length) blocks.push(current.join('\n'));
  return blocks;
}

export function mdToHtml(src: string, base = ''): string {
  const blocks = splitBlocks(src);
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
      if (block.startsWith('```')) {
        const lines = block.split('\n');
        const code = lines.slice(1, lines[lines.length - 1] === '```' ? -1 : undefined).join('\n');
        return `<pre class="concept-page__code"><code>${esc(code)}</code></pre>`;
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
