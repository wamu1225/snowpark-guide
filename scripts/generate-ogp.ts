// scripts/generate-ogp.ts — OGP画像（1200×630）を public/ogp.png に生成する。
// サイトの中心体験（Snowparkコード⇄Polarsコードの並列比較）をそのまま絵にする。
// 実行: npx tsx scripts/generate-ogp.ts
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const FONT = "'Yu Gothic','Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,'Noto Sans JP',sans-serif";
const MONO = "'SFMono-Regular',Consolas,Menlo,monospace";

const SNOWPARK_CODE = ['df.select(', '  "col_a",', '  col("col_b") * 2', ')'];
const POLARS_CODE = ['ldf.select(', '  pl.col("col_a"),', '  pl.col("col_b") * 2', ')'];

const codeLines = (lines: string[], x: number, color: string) =>
  lines
    .map((l, i) => `<text x="${x}" y="${256 + i * 34}" font-family="${MONO}" font-size="21" fill="${color}">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`)
    .join('\n    ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f172a"/>
  <text x="60" y="90" font-family="${FONT}" font-size="46" font-weight="700" fill="#f8fafc">Snowpark 実践ガイド</text>
  <text x="60" y="130" font-family="${FONT}" font-size="24" fill="#94a3b8">基礎知識 ＋ DataFrame API逆引き（⇄ Polars）</text>

  <rect x="60" y="180" width="520" height="200" rx="14" fill="#111d34" stroke="#0284c7" stroke-width="2"/>
  <text x="88" y="216" font-family="${FONT}" font-size="20" font-weight="700" fill="#38bdf8">SNOWPARK</text>
  ${codeLines(SNOWPARK_CODE, 88, '#e2e8f0')}

  <rect x="620" y="180" width="520" height="200" rx="14" fill="#26102f" stroke="#c026d3" stroke-width="2"/>
  <text x="648" y="216" font-family="${FONT}" font-size="20" font-weight="700" fill="#f0abfc">POLARS</text>
  ${codeLines(POLARS_CODE, 648, '#e2e8f0')}

  <path d="M580 280 L620 280 M600 265 L620 280 L600 295" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M620 300 L580 300 M600 285 L580 300 L600 315" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

  <text x="60" y="440" font-family="${FONT}" font-size="22" fill="#cbd5e1">実行・静的検証つき。56メソッドを1操作=1ページで比較。</text>
  <line x1="60" y1="480" x2="1140" y2="480" stroke="#1e293b" stroke-width="2"/>
  <text x="60" y="524" font-family="${FONT}" font-size="22" fill="#94a3b8" font-weight="600">study-apps.com/snowpark-guide/</text>
</svg>`;

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const outPath = path.join(PUBLIC_DIR, 'ogp.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ ogp.png (1200x630) を生成: ${outPath}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
