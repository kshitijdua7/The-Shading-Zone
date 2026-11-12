import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import defaultContent from './content.json';
import { site as defaultSite } from './site';

/* ────────────────────────────────────────────────────────────────────────────
   DATA STORE

   Production (Vercel): Neon Postgres, via DATABASE_URL (or POSTGRES_URL),
   which the Vercel ↔ Neon integration sets automatically. Tables are created
   on first use:
     ats_kv     content, site settings, session secret (JSON values)
     ats_users  accounts (passwords are scrypt-hashed)
     ats_leads  quote / consultation / contact form submissions

   Local dev without a database URL: JSON files in ./data (git-ignored).

   Content and site settings are read synchronously by every page, so they are
   kept in memory: loaded once at server start (instrumentation.ts → initStore)
   and refreshed in the background every few seconds, so dashboard edits reach
   every server instance almost immediately.
   ──────────────────────────────────────────────────────────────────────────── */

export type Content = typeof defaultContent;
export type Site = typeof defaultSite;

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}
export type PublicUser = Omit<User, 'passwordHash'>;

export interface Lead {
  id: string;
  createdAt: string;
  fields: Record<string, string>;
  read?: boolean;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = DB_URL ? neon(DB_URL) : null;

/* ── Postgres setup ─────────────────────────────────────────────────────── */

let schemaReady: Promise<void> | null = null;
function ensureSchema() {
  if (!sql) return Promise.resolve();
  schemaReady ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS ats_kv (
      key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS ats_users (
      id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
      password_hash text NOT NULL, role text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS ats_leads (
      id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),
      fields jsonb NOT NULL, read boolean NOT NULL DEFAULT false)`;
  })().catch((e) => {
    schemaReady = null;
    throw e;
  });
  return schemaReady;
}

/* ── File fallback (local dev) ──────────────────────────────────────────── */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

function readFile<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8')) as T;
  } catch {
    return fallback;
  }
}
function writeFile(name: string, value: unknown) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, name);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

/* ── Key/value (content, site, secret) ──────────────────────────────────── */

async function kvGet<T>(key: string): Promise<T | undefined> {
  if (!sql) return readFile<T | undefined>(`${key}.json`, undefined);
  await ensureSchema();
  const rows = await sql`SELECT value FROM ats_kv WHERE key = ${key}`;
  return rows[0]?.value as T | undefined;
}

async function kvSet(key: string, value: unknown) {
  if (!sql) return writeFile(`${key}.json`, value);
  await ensureSchema();
  await sql`INSERT INTO ats_kv (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

async function kvDelete(key: string) {
  if (!sql) return fs.rmSync(path.join(DATA_DIR, `${key}.json`), { force: true });
  await ensureSchema();
  await sql`DELETE FROM ats_kv WHERE key = ${key}`;
}

/* ── In-memory content / site / secret ──────────────────────────────────── */

const REFRESH_MS = 5_000;
const mem: { content?: Content; site?: Site; secret?: string; loadedAt: number } = { loadedAt: 0 };
let loading: Promise<void> | null = null;

function refresh() {
  loading ??= (async () => {
    try {
      const [content, site, secret] = await Promise.all([
        kvGet<Content>('content'),
        kvGet<Site>('site'),
        kvGet<string>('secret'),
      ]);
      mem.content = content ?? clone(defaultContent);
      mem.site = site ?? clone(defaultSite);
      if (secret) mem.secret = secret;
      mem.loadedAt = Date.now();
    } catch (e) {
      console.error('[store] could not load from database, serving defaults/last known values', e);
      mem.loadedAt = Date.now(); // don't hammer a failing database
    } finally {
      loading = null;
    }
  })();
  return loading;
}

/** Load everything into memory. Called at server start; safe to call again. */
export async function initStore() {
  await refresh();
}

function fresh() {
  if (Date.now() - mem.loadedAt > REFRESH_MS) void refresh();
}

export function getContent(): Content {
  fresh();
  return mem.content ?? clone(defaultContent);
}
export function getSite(): Site {
  fresh();
  return mem.site ?? clone(defaultSite);
}

export async function saveContent(c: Content) {
  await kvSet('content', c);
  mem.content = c;
}
export async function saveSite(s: Site) {
  await kvSet('site', s);
  mem.site = s;
}
export async function resetContent() {
  await kvDelete('content');
  mem.content = clone(defaultContent);
}
export async function resetSite() {
  await kvDelete('site');
  mem.site = clone(defaultSite);
}

/* ── Users ──────────────────────────────────────────────────────────────── */

type UserRow = { id: string; name: string; email: string; password_hash: string; role: string; created_at: string | Date };
const toUser = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  passwordHash: r.password_hash,
  role: r.role === 'admin' ? 'admin' : 'user',
  createdAt: new Date(r.created_at).toISOString(),
});

export async function getUsers(): Promise<User[]> {
  if (!sql) return readFile<User[]>('users.json', []);
  await ensureSchema();
  return ((await sql`SELECT * FROM ats_users ORDER BY created_at`) as UserRow[]).map(toUser);
}

export async function getUserById(id: string): Promise<User | null> {
  if (!sql) return (await getUsers()).find((u) => u.id === id) ?? null;
  await ensureSchema();
  const rows = (await sql`SELECT * FROM ats_users WHERE id = ${id}`) as UserRow[];
  return rows[0] ? toUser(rows[0]) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const e = email.trim().toLowerCase();
  if (!sql) return (await getUsers()).find((u) => u.email === e) ?? null;
  await ensureSchema();
  const rows = (await sql`SELECT * FROM ats_users WHERE email = ${e}`) as UserRow[];
  return rows[0] ? toUser(rows[0]) : null;
}

export async function setUserRole(id: string, role: 'admin' | 'user') {
  if (!sql) return writeFile('users.json', (await getUsers()).map((u) => (u.id === id ? { ...u, role } : u)));
  await ensureSchema();
  await sql`UPDATE ats_users SET role = ${role} WHERE id = ${id}`;
}

export async function deleteUser(id: string) {
  if (!sql) return writeFile('users.json', (await getUsers()).filter((u) => u.id !== id));
  await ensureSchema();
  await sql`DELETE FROM ats_users WHERE id = ${id}`;
}

export const toPublic = ({ passwordHash: _p, ...u }: User): PublicUser => u;

/**
 * The owner account: whoever signs up with ADMIN_EMAIL. If ADMIN_EMAIL is not
 * set, the very first account created becomes the admin.
 */
export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const existing = await getUsers();
  const isAdmin = adminEmail ? normalized === adminEmail : existing.length === 0;
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    passwordHash,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };
  if (!sql) {
    writeFile('users.json', [...existing, user]);
  } else {
    await sql`INSERT INTO ats_users (id, name, email, password_hash, role, created_at)
              VALUES (${user.id}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.role}, ${user.createdAt})`;
  }
  return user;
}

/* ── Leads ──────────────────────────────────────────────────────────────── */

type LeadRow = { id: string; created_at: string | Date; fields: Record<string, string>; read: boolean };

export async function getLeads(): Promise<Lead[]> {
  if (!sql) return readFile<Lead[]>('leads.json', []);
  await ensureSchema();
  return ((await sql`SELECT * FROM ats_leads ORDER BY created_at DESC`) as LeadRow[]).map((r) => ({
    id: r.id,
    createdAt: new Date(r.created_at).toISOString(),
    fields: r.fields,
    read: r.read,
  }));
}

export async function addLead(fields: Record<string, string>): Promise<Lead> {
  const lead: Lead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), fields };
  if (!sql) {
    writeFile('leads.json', [lead, ...(await getLeads())]);
  } else {
    await ensureSchema();
    await sql`INSERT INTO ats_leads (id, created_at, fields) VALUES (${lead.id}, ${lead.createdAt}, ${JSON.stringify(fields)}::jsonb)`;
  }
  return lead;
}

export async function setLeadRead(id: string, read: boolean) {
  if (!sql) return writeFile('leads.json', (await getLeads()).map((l) => (l.id === id ? { ...l, read } : l)));
  await ensureSchema();
  await sql`UPDATE ats_leads SET read = ${read} WHERE id = ${id}`;
}

export async function deleteLead(id: string) {
  if (!sql) return writeFile('leads.json', (await getLeads()).filter((l) => l.id !== id));
  await ensureSchema();
  await sql`DELETE FROM ats_leads WHERE id = ${id}`;
}

/* ── Session-signing secret ─────────────────────────────────────────────── */

export async function getSecret(): Promise<string> {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (mem.secret) return mem.secret;
  const stored = await kvGet<string>('secret');
  if (stored) return (mem.secret = stored);
  const created = crypto.randomBytes(32).toString('hex');
  if (sql) {
    await ensureSchema();
    // Another instance may have raced us; keep whichever landed first.
    await sql`INSERT INTO ats_kv (key, value) VALUES ('secret', ${JSON.stringify(created)}::jsonb) ON CONFLICT (key) DO NOTHING`;
  } else {
    await kvSet('secret', created);
  }
  return (mem.secret = (await kvGet<string>('secret')) ?? created);
}
