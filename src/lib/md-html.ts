// mdToReact (md.tsx) と同じ簡易記法をHTML文字列へ変換する版。
// scripts/prerender.ts はNode側でJSXを解さないため、JSX非依存のこちらを使う。
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
      return `<p>${inlineHtml(block)}</p>`;
    })
    .join('\n');
}
