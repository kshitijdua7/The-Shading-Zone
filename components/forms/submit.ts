import { site } from '@/lib/site';

export type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Sends a lead.
 *
 * With `site.formEndpoint` empty the submission is simulated: the form shows a
 * real success state so you can demo and test the flow, and a warning is logged
 * so nobody ships it that way by accident. Set `formEndpoint` in lib/site.ts to
 * any endpoint that accepts multipart/form-data — Formspree, Basin, Web3Forms,
 * Netlify Forms, or your own handler — and it starts delivering for real.
 */
export async function submitLead(
  form: HTMLFormElement,
  meta: Record<string, string> = {}
): Promise<void> {
  const data = new FormData(form);
  Object.entries(meta).forEach(([k, v]) => data.append(k, v));

  if (!site.formEndpoint) {
    // eslint-disable-next-line no-console
    console.warn(
      '[The Shading Zone] site.formEndpoint is not set — this submission was NOT sent. ' +
        'Set it in lib/site.ts before going live.'
    );
    await new Promise((r) => setTimeout(r, 900));
    return;
  }

  const res = await fetch(site.formEndpoint, {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Submission failed (${res.status})`);
  }
}

/* ── Validation ──────────────────────────────────────────────────────────── */

export type Errors = Record<string, string>;

export const required = (v: string | undefined, label: string) =>
  v && v.trim().length > 0 ? undefined : `${label} is required.`;

export const validEmail = (v: string | undefined) => {
  if (!v || !v.trim()) return 'Email address is required.';
  // Deliberately permissive — the only reliable test of an address is sending to it.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
    ? undefined
    : 'Enter a valid email address, e.g. name@example.com.';
};

export const validPhone = (v: string | undefined) => {
  if (!v || !v.trim()) return 'Phone number is required.';
  const digits = v.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15
    ? undefined
    : 'Enter a phone number we can reach you on.';
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const validPhotos = (files: FileList | null) => {
  if (!files || files.length === 0) return undefined;
  if (files.length > 6) return 'Please attach up to 6 photos.';
  for (const f of Array.from(files)) {
    if (!f.type.startsWith('image/')) return `“${f.name}” is not an image file.`;
    if (f.size > MAX_UPLOAD_BYTES) return `“${f.name}” is larger than 8 MB.`;
  }
  return undefined;
};
