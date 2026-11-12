import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LogoutButton from '@/components/auth/LogoutButton';

export const metadata: Metadata = { title: 'My account', robots: { index: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'admin') redirect('/admin');

  return (
    <section className="min-h-screen bg-warm-50 px-gutter pb-24 pt-36">
      <div className="mx-auto max-w-xl border border-char-950/10 bg-warm-white p-8 sm:p-10">
        <p className="eyebrow">My account</p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-char-950">
          Hello, {user.name.split(' ')[0]}.
        </h1>
        <dl className="mt-8 space-y-3 text-sm text-stone-600">
          <div><dt className="inline font-semibold text-char-950">Email: </dt><dd className="inline">{user.email}</dd></div>
          <div><dt className="inline font-semibold text-char-950">Member since: </dt><dd className="inline">{new Date(user.createdAt).toLocaleDateString()}</dd></div>
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/quote" className="btn btn-solid">Get a free quote</Link>
          <Link href="/consultation" className="btn-outline">Book a consultation</Link>
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
