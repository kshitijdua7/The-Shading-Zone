import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSite, saveSite, resetSite, type Site } from '@/lib/store';

export const dynamic = 'force-dynamic';
const denied = () => NextResponse.json({ error: 'Admins only.' }, { status: 403 });

export async function GET() {
  if (!(await requireAdmin())) return denied();
  return NextResponse.json(getSite());
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return denied();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return NextResponse.json({ error: 'Settings must be a JSON object.' }, { status: 400 });
  await saveSite(body as Site);
  return NextResponse.json({ ok: true });
}

/** Restore the original site settings. */
export async function DELETE() {
  if (!(await requireAdmin())) return denied();
  await resetSite();
  return NextResponse.json({ ok: true });
}
