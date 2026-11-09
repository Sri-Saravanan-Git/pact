import sharp from "sharp";
import type { Criterion, CriterionResult } from "./types";

export type InFile = { name: string; mime: string; bytes: Buffer };

const isSvg = (f: InFile) => f.mime === "image/svg+xml" || /<svg[\s>]/i.test(f.bytes.subarray(0, 4000).toString("utf8"));

async function pngs(files: InFile[]) {
  const out: { f: InFile; w: number; h: number; hasAlpha: boolean }[] = [];
  for (const f of files) {
    if (isSvg(f)) continue;
    const m = await sharp(f.bytes).metadata().catch(() => null);
    if (m?.format === "png") out.push({ f, w: m.width ?? 0, h: m.height ?? 0, hasAlpha: !!m.hasAlpha });
  }
  return out;
}

const r = (c: Criterion, pass: boolean, evidence: string): CriterionResult => ({ id: c.id, pass, evidence, method: "code" });

/** Deterministic evidence. Returns null for checks that need the AI (vision). */
export async function runCodeCheck(c: Criterion, files: InFile[]): Promise<CriterionResult | null> {
  switch (c.check) {
    case "file_format": {
      const fmt = c.format ?? "svg";
      const hits = fmt === "svg" ? files.filter(isSvg) : (await pngs(files)).map((p) => p.f);
      return hits.length
        ? r(c, true, `Found ${fmt.toUpperCase()}: ${hits.map((h) => h.name).join(", ")}`)
        : r(c, false, `No ${fmt.toUpperCase()} file in the delivery`);
    }
    case "png_transparent": {
      const list = await pngs(files);
      if (!list.length) return r(c, false, "No PNG file to inspect");
      for (const p of list) {
        if (!p.hasAlpha) continue;
        const alpha = await sharp(p.f.bytes).ensureAlpha().extractChannel(3).raw().toBuffer();
        let clear = 0;
        for (const a of alpha) if (a < 250) clear++;
        const pct = Math.round((clear / alpha.length) * 100);
        if (pct >= 1) return r(c, true, `${p.f.name}: alpha channel present, ${pct}% of pixels are transparent`);
      }
      return r(c, false, `${list.map((p) => p.f.name).join(", ")}: background is solid, no transparent pixels`);
    }
    case "min_size": {
      const need = c.minPx ?? 1024;
      const list = await pngs(files);
      const best = list.sort((a, b) => Math.min(b.w, b.h) - Math.min(a.w, a.h))[0];
      if (!best) return r(c, false, "No PNG file to measure");
      return r(c, Math.min(best.w, best.h) >= need, `${best.f.name} is ${best.w}×${best.h}px (needs ${need}px)`);
    }
    case "variant_count": {
      const need = c.count ?? 3;
      const svgs = files.filter(isSvg);
      return r(c, svgs.length >= need, `${svgs.length} SVG file${svgs.length === 1 ? "" : "s"} delivered (needs ${need})`);
    }
    case "vision":
      return null;
  }
}

/** Render every image to a small PNG so the vision model can look at it (SVG included). */
export async function previews(files: InFile[]) {
  const out: { name: string; b64: string }[] = [];
  // Servers often have no fonts, so SVG text would rasterise as empty boxes and mislead the AI.
  // When the delivery includes raster images (text already baked in), the AI looks at those.
  const raster = files.filter((f) => !isSvg(f));
  for (const f of (raster.length ? raster : files).slice(0, 6)) {
    const png = await sharp(f.bytes, { density: 144 })
      .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer()
      .catch(() => null);
    if (png) out.push({ name: f.name, b64: png.toString("base64") });
  }
  return out;
}
