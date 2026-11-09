// Generates the sample logo deliveries in public/samples. Run: node scripts/make-samples.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const logo = (ink, accent, paper) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="214" fill="${paper}" stroke="${ink}" stroke-width="10"/>
  <circle cx="256" cy="256" r="190" fill="none" stroke="${ink}" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round"/>
  <g fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round">
    <path d="M222 120c-10 14 10 22 0 36"/><path d="M256 108c-10 16 10 26 0 44"/><path d="M290 120c-10 14 10 22 0 36"/>
  </g>
  <g transform="translate(256 222)">
    <path d="M-96 26 C-84 -34 -32 -58 0 -58 C32 -58 84 -34 96 26 C62 42 -62 42 -96 26Z" fill="${accent}" stroke="${ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-50 -40 C-42 -6 -42 16 -48 32 M0 -58 C6 -22 6 10 0 36 M50 -40 C42 -6 42 16 48 32" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>
  </g>
  <text x="256" y="318" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="30" font-weight="700" letter-spacing="2" textLength="300" lengthAdjust="spacingAndGlyphs" fill="${ink}">SAFFRON CRUMB</text>
  <line x1="176" y1="340" x2="336" y2="340" stroke="${ink}" stroke-width="3"/>
  <text x="256" y="372" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="22" letter-spacing="10" fill="${ink}">BAKERY</text>
</svg>`;

const v = {
  gold: logo("#4a2c17", "#e0a53a", "#fff6e6"),
  cocoa: logo("#fff6e6", "#c98a4b", "#5b3a29"),
  mono: logo("#111111", "#ffffff", "#ffffff"),
};
for (const r of ["round-1", "round-2"])
  for (const [k, s] of Object.entries(v)) writeFileSync(`public/samples/${r}/saffron-crumb-${k}.svg`, s);

const png = sharp(Buffer.from(v.gold), { density: 144 }).resize(1024, 1024);
await png.clone().flatten({ background: "#ffffff" }).png().toFile("public/samples/round-1/saffron-crumb.png"); // flaw: solid background
await png.clone().png().toFile("public/samples/round-2/saffron-crumb-transparent.png");
console.log("samples written");
