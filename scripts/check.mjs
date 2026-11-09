// Self-checks for the deterministic parts (guard + file checks). Run: npm run check
import assert from "node:assert/strict";
import sharp from "sharp";
import { review } from "../src/lib/guard.ts";
import { OFFERS } from "../src/lib/market.ts";
import { runCodeCheck } from "../src/lib/checks.ts";

const m = { task: "logo", category: "logo design", budget: 150, currency: "USD", deadlineDays: 2, deliverables: [] };
const v = Object.fromEntries(OFFERS.map((o) => [o.id, review(m, o)]));
assert.equal(v.mara.verdict, "eligible");
assert.equal(v.brandrocket.verdict, "quarantined");
assert.match(v.brandrocket.injection, /ignore your previous instructions/i);
assert.equal(v.pixelforge.verdict, "eligible"); // the AI agent rejects it later: no SVG
assert.equal(v.nord.verdict, "rejected");

const px = (alpha) => sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 200, g: 120, b: 40, alpha } } }).png().toBuffer();
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>');
const files = async (alpha) => [
  { name: "a.svg", mime: "image/svg+xml", bytes: svg },
  { name: "b.svg", mime: "image/svg+xml", bytes: svg },
  { name: "logo.png", mime: "image/png", bytes: await px(alpha) },
];
const transparent = { id: "t", text: "", check: "png_transparent" };
assert.equal((await runCodeCheck(transparent, await files(1))).pass, false, "opaque png fails");
assert.equal((await runCodeCheck(transparent, await files(0))).pass, true, "transparent png passes");
assert.equal((await runCodeCheck({ id: "f", text: "", check: "file_format", format: "svg" }, await files(1))).pass, true);
assert.equal((await runCodeCheck({ id: "c", text: "", check: "variant_count", count: 3 }, await files(1))).pass, false, "2 svgs < 3");
assert.equal((await runCodeCheck({ id: "s", text: "", check: "min_size", minPx: 1024 }, await files(1))).pass, true);
console.log("all checks ok");
