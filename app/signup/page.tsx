import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign up', robots: { index: false } };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'admin' ? '/admin' : '/account');
  return <AuthForm mode="signup" />;
}
