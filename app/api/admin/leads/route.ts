import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteLead, getLeads, setLeadRead } from '@/lib/store';

export const dynamic = 'force-dynamic';
const denied = () => NextResponse.json({ error: 'Admins only.' }, { status: 403 });

export async function GET() {
  if (!(await requireAdmin())) return denied();
  return NextResponse.json(await getLeads());
}

/** Mark read/unread: { id, read } */
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return denied();
  const { id, read } = await req.json().catch(() => ({}));
  await setLeadRead(String(id), !!read);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return denied();
  const id = new URL(req.url).searchParams.get('id');
  if (id) await deleteLead(id);
  return NextResponse.json({ ok: true });
}
