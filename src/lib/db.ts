import "server-only";
import { neon } from "@neondatabase/serverless";
import type { Pact } from "./types";

const sql = neon(process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL!);

let ready: Promise<unknown> | undefined;
function init() {
  ready ??= Promise.all([
    sql`create table if not exists pacts (id text primary key, data jsonb not null, updated_at timestamptz not null default now())`,
    sql`create table if not exists files (id text primary key, pact_id text not null, name text not null, mime text not null, b64 text not null, created_at timestamptz not null default now())`,
  ]);
  return ready;
}

export async function getPact(id: string): Promise<Pact | null> {
  await init();
  const rows = await sql`select data from pacts where id = ${id}`;
  return (rows[0]?.data as Pact) ?? null;
}

// ponytail: last-write-wins on the whole document; one client drives a pact at a time in this demo.
export async function savePact(p: Pact) {
  await init();
  await sql`insert into pacts (id, data, updated_at) values (${p.id}, ${JSON.stringify(p)}, now())
            on conflict (id) do update set data = excluded.data, updated_at = now()`;
  return p;
}

export async function findPactByPaypal(ids: string[]): Promise<Pact | null> {
  await init();
  const list = ids.filter(Boolean);
  if (!list.length) return null;
  const rows = await sql`select data from pacts where data->'paypal'->>'orderId' = any(${list}) or data->'paypal'->>'authorizationId' = any(${list}) or data->'paypal'->>'captureId' = any(${list}) limit 1`;
  return (rows[0]?.data as Pact) ?? null;
}

export async function listPacts(): Promise<Pact[]> {
  await init();
  const rows = await sql`select data from pacts order by updated_at desc limit 200`;
  return rows.map((r) => r.data as Pact);
}

export async function pactsCreatedToday(): Promise<number> {
  await init();
  const rows = await sql`select count(*)::int as n from pacts where (data->>'createdAt')::timestamptz > now() - interval '1 day'`;
  return rows[0].n as number;
}

export async function saveFile(f: { id: string; pactId: string; name: string; mime: string; bytes: Buffer }) {
  await init();
  await sql`insert into files (id, pact_id, name, mime, b64) values (${f.id}, ${f.pactId}, ${f.name}, ${f.mime}, ${f.bytes.toString("base64")})`;
}

export async function getFile(id: string) {
  await init();
  const rows = await sql`select name, mime, b64 from files where id = ${id}`;
  if (!rows[0]) return null;
  return { name: rows[0].name as string, mime: rows[0].mime as string, bytes: Buffer.from(rows[0].b64 as string, "base64") };
}
