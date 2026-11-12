import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getContent, saveContent, resetContent, type Content } from '@/lib/store';

export const dynamic = 'force-dynamic';
const denied = () => NextResponse.json({ error: 'Admins only.' }, { status: 403 });

export async function GET() {
  if (!(await requireAdmin())) return denied();
  return NextResponse.json(getContent());
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return denied();
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return NextResponse.json({ error: 'Content must be a JSON object.' }, { status: 400 });
  saveContent(body as Content);
  return NextResponse.json({ ok: true });
}

/** Restore the original website content. */
export async function DELETE() {
  if (!(await requireAdmin())) return denied();
  resetContent();
  return NextResponse.json({ ok: true });
}
