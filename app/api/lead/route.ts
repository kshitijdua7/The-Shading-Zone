import { NextResponse } from 'next/server';
import { addLead } from '@/lib/store';

/** Public endpoint the quote / consultation / contact forms post to. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });

  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    const v = typeof value === 'string' ? value.slice(0, 5000) : `[file] ${value.name}`;
    fields[key] = fields[key] ? `${fields[key]}, ${v}` : v;
  }
  if (Object.keys(fields).length === 0 || Object.keys(fields).length > 80)
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });

  addLead(fields);
  return NextResponse.json({ ok: true });
}
