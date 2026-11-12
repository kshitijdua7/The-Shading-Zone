'use client';

export default function LogoutButton({ className = 'btn-outline' }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await fetch('/api/auth/logout/', { method: 'POST' });
        window.location.href = '/';
      }}
    >
      Log out
    </button>
  );
}
