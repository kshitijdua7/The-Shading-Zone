import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getSecret, getUsers, type User } from './store';

export const SESSION_COOKIE = 'ats_session';
const SESSION_DAYS = 30;

/* ── Passwords (scrypt, salted) ─────────────────────────────────────────── */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const known = Buffer.from(hash, 'hex');
  return known.length === test.length && crypto.timingSafeEqual(known, test);
}

/* ── Sessions (HMAC-signed cookie) ──────────────────────────────────────── */

function sign(payload: string) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 864e5 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
    return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof uid === 'string' && Date.now() < exp ? uid : null;
  } catch {
    return null;
  }
}

/** Cookie flags; `secure` only when the request actually arrived over HTTPS. */
export function sessionCookieOptions(req: Request) {
  const proto = req.headers.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '');
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: proto.split(',')[0].trim() === 'https',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const uid = readToken(jar.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  return getUsers().find((u) => u.id === uid) ?? null;
}

export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  return user?.role === 'admin' ? user : null;
}
