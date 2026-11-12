import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from '@/lib/auth';
import { findUserByEmail, toPublic } from '@/lib/store';

export async function POST(req: Request) {
  const { email = '', password = '' } = await req.json().catch(() => ({}));
  const user = await findUserByEmail(String(email));
  if (!user || !verifyPassword(String(password), user.passwordHash))
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });

  const res = NextResponse.json({ user: toPublic(user) });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions(req));
  return res;
}
