import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteUser, getUsers, setUserRole, toPublic } from '@/lib/store';

export const dynamic = 'force-dynamic';
const denied = () => NextResponse.json({ error: 'Admins only.' }, { status: 403 });

export async function GET() {
  if (!(await requireAdmin())) return denied();
  return NextResponse.json((await getUsers()).map(toPublic));
}

/** Change a user's role: { id, role: 'admin' | 'user' } */
export async function PATCH(req: Request) {
  const me = await requireAdmin();
  if (!me) return denied();
  const { id, role } = await req.json().catch(() => ({}));
  if (role !== 'admin' && role !== 'user') return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  if (id === me.id && role !== 'admin')
    return NextResponse.json({ error: "You can't remove your own admin access." }, { status: 400 });
  await setUserRole(String(id), role);
  return NextResponse.json({ ok: true });
}

/** Delete a user: ?id= */
export async function DELETE(req: Request) {
  const me = await requireAdmin();
  if (!me) return denied();
  const id = new URL(req.url).searchParams.get('id');
  if (id === me.id) return NextResponse.json({ error: "You can't delete your own account here." }, { status: 400 });
  if (id) await deleteUser(id);
  return NextResponse.json({ ok: true });
}
