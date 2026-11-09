import { getFile } from "@/lib/db";

export async function GET(_: Request, ctx: RouteContext<"/api/files/[id]">) {
  const f = await getFile((await ctx.params).id);
  if (!f) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(f.bytes), {
    headers: {
      "Content-Type": f.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      // uploaded SVGs could carry scripts; never let them run
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
