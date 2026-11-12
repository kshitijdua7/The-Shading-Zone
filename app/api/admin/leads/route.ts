import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getLeads, saveLeads } from '@/lib/store';

export const dynamic = 'force-dynamic';
const denied = () => NextResponse.json({ error: 'Admins only.' }, { status: 403 });

export async function GET() {
  if (!(await requireAdmin())) return denied();
  return NextResponse.json(getLeads());
}

/** Mark read/unread: { id, read } */
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return denied();
  const { id, read } = await req.json().catch(() => ({}));
  saveLeads(getLeads().map((l) => (l.id === id ? { ...l, read: !!read } : l)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return denied();
  const id = new URL(req.url).searchParams.get('id');
  saveLeads(getLeads().filter((l) => l.id !== id));
  return NextResponse.json({ ok: true });
}
