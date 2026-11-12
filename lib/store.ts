import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import defaultContent from './content.json';
import { site as defaultSite } from './site';

/* ────────────────────────────────────────────────────────────────────────────
   FILE-BASED STORE

   Everything the admin dashboard can change lives as JSON in DATA_DIR
   (default: ./data, git-ignored). On first run each file is seeded from the
   defaults in lib/content.json and lib/site.ts, so the site looks identical
   until the owner edits something.

     data/content.json  products, collections, FAQs, images, process…
     data/site.json     business name, contact details, social links…
     data/users.json    accounts (passwords are scrypt-hashed)
     data/leads.json    quote / consultation / contact form submissions
     data/secret        session-signing key (if AUTH_SECRET is not set)

   Needs a host with a persistent disk (VPS, Render/Railway with a volume,
   your own server). Back up the data folder like you would a database.
   ──────────────────────────────────────────────────────────────────────────── */

// On Vercel the project folder is read-only; /tmp is the only writable place
// (and it is wiped regularly — see note above).
const DATA_DIR =
  process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/ats-data' : path.join(process.cwd(), 'data'));

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

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    /* read-only disk — writes will fail and be reported by the caller */
  }
}

const cache = new Map<string, { mtime: number; value: unknown }>();

function readJson<T>(name: string, fallback: () => T): T {
  ensureDir();
  const file = path.join(DATA_DIR, name);
  if (!fs.existsSync(file)) {
    const value = fallback();
    try {
      writeJson(name, value);
    } catch {
      /* read-only disk: serve the defaults rather than crash the page */
    }
    return value;
  }
  const mtime = fs.statSync(file).mtimeMs;
  const hit = cache.get(name);
  if (hit && hit.mtime === mtime) return hit.value as T;
  const value = JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  cache.set(name, { mtime, value });
  return value;
}

function writeJson(name: string, value: unknown) {
  ensureDir();
  const file = path.join(DATA_DIR, name);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
  cache.delete(name);
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/* ── Content & site ─────────────────────────────────────────────────────── */

export const getContent = () => readJson<Content>('content.json', () => clone(defaultContent));
export const saveContent = (c: Content) => writeJson('content.json', c);

export const getSite = () =>
  readJson<Site>('site.json', () => clone(defaultSite));
export const saveSite = (s: Site) => writeJson('site.json', s);

export const resetContent = () => writeJson('content.json', clone(defaultContent));
export const resetSite = () => writeJson('site.json', clone(defaultSite));

/* ── Users ──────────────────────────────────────────────────────────────── */

export const getUsers = () => readJson<User[]>('users.json', () => []);
export const saveUsers = (u: User[]) => writeJson('users.json', u);

export const toPublic = ({ passwordHash: _p, ...u }: User): PublicUser => u;

export function findUserByEmail(email: string) {
  return getUsers().find((u) => u.email === email.trim().toLowerCase());
}

/**
 * The owner account: whoever signs up with ADMIN_EMAIL. If ADMIN_EMAIL is not
 * set, the very first account created becomes the admin.
 */
export function createUser(name: string, email: string, passwordHash: string): User {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = adminEmail ? normalized === adminEmail : users.length === 0;
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    passwordHash,
    role: isAdmin ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return user;
}

/* ── Leads ──────────────────────────────────────────────────────────────── */

export const getLeads = () => readJson<Lead[]>('leads.json', () => []);
export const saveLeads = (l: Lead[]) => writeJson('leads.json', l);

export function addLead(fields: Record<string, string>) {
  const lead: Lead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), fields };
  saveLeads([lead, ...getLeads()]);
  return lead;
}

/* ── Secret ─────────────────────────────────────────────────────────────── */

export function getSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  ensureDir();
  const file = path.join(DATA_DIR, 'secret');
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(file, 'utf8').trim();
}
