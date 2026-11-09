import { getPact, saveFile, savePact } from "@/lib/db";
import { log, verify, UserError } from "@/lib/flow";
import { fail } from "@/lib/http";
import { SAMPLES } from "@/lib/samples";
import type { InFile } from "@/lib/checks";

export const maxDuration = 60;

const MAX_FILES = 6;
const MAX_BYTES = 1_500_000;

export async function POST(req: Request, ctx: RouteContext<"/api/pacts/[id]/submit">) {
  try {
    const id = (await ctx.params).id;
    const p = await getPact(id);
    if (!p) throw new UserError("Pact not found.");
    if (!["held", "needs_fix"].includes(p.status)) throw new UserError("Work can only be submitted while payment is on hold.");

    const form = await req.formData();
    const uploads = form.getAll("files").filter((f): f is File => f instanceof File);
    // Sample deliveries are referenced by path so judges don't need their own files.
    const sample = String(form.get("sample") ?? "");
    const files: InFile[] = [];
    if (sample) {
      const set = SAMPLES[sample as keyof typeof SAMPLES];
      if (!set) throw new UserError("Unknown sample.");
      const origin = new URL(req.url).origin;
      for (const name of set) {
        const res = await fetch(`${origin}/samples/${sample}/${name}`);
        files.push({ name, mime: res.headers.get("content-type")?.split(";")[0] ?? "", bytes: Buffer.from(await res.arrayBuffer()) });
      }
    } else {
      if (!uploads.length) throw new UserError("Add at least one file.");
      if (uploads.length > MAX_FILES) throw new UserError(`Up to ${MAX_FILES} files.`);
      for (const f of uploads) {
        if (f.size > MAX_BYTES) throw new UserError(`${f.name} is over 1.5 MB.`);
        if (!/^image\/(png|svg\+xml|jpeg|webp)$/.test(f.type)) throw new UserError(`${f.name}: only PNG, SVG, JPG or WEBP.`);
        files.push({ name: f.name.slice(0, 80), mime: f.type, bytes: Buffer.from(await f.arrayBuffer()) });
      }
    }

    const saved = [];
    for (const f of files) {
      const fid = crypto.randomUUID();
      await saveFile({ id: fid, pactId: p.id, name: f.name, mime: f.mime, bytes: f.bytes });
      saved.push({ id: fid, name: f.name, mime: f.mime });
    }
    log(p, { kind: "evidence", title: `Freelancer delivered ${files.length} file${files.length === 1 ? "" : "s"}`, detail: files.map((f) => f.name).join(", ") });

    const v = await verify(p, files);
    p.submissions.push({ at: new Date().toISOString(), files: saved, ...v });
    const failed = v.results.filter((r) => !r.pass).length;
    p.status = v.pass ? "verified" : "needs_fix";
    log(p, {
      kind: "verdict",
      title: v.pass ? "All promises verified" : `${failed} promise${failed === 1 ? "" : "s"} not met`,
      detail: v.pass ? "Waiting for the client to release payment" : v.fixRequest,
    });
    return Response.json(await savePact(p));
  } catch (e) {
    return fail(e);
  }
}
