import { NextResponse } from 'next/server';
import { createSessionToken, hashPassword, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { createUser, findUserByEmail, toPublic } from '@/lib/store';

export async function POST(req: Request) {
  const { name = '', email = '', password = '' } = await req.json().catch(() => ({}));
  if (!String(name).trim()) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim()))
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (String(password).length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  if (findUserByEmail(email))
    return NextResponse.json({ error: 'An account with this email already exists. Log in instead.' }, { status: 409 });

  const user = createUser(String(name), String(email), hashPassword(String(password)));
  const res = NextResponse.json({ user: toPublic(user) });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions(req));
  return res;
}
