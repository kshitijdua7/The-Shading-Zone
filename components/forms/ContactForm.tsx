'use client';

import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { TextField, TextArea } from './Fields';
import FormSuccess from './FormSuccess';
import { submitLead, required, validEmail, validPhone, type Errors, type SubmitState } from './submit';

export default function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<SubmitState>('idle');
  const summaryRef = useRef<HTMLDivElement>(null);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);

    const e: Errors = {};
    const name = required(fd.get('name') as string, 'Name');
    if (name) e.name = name;
    const email = validEmail(fd.get('email') as string);
    if (email) e.email = email;
    const phone = validPhone(fd.get('phone') as string);
    if (phone) e.phone = phone;
    const msg = required(fd.get('message') as string, 'Message');
    if (msg) e.message = msg;

    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setState('submitting');
    try {
      await submitLead(form, { formType: 'contact', submittedAt: new Date().toISOString() });
      setState('success');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <FormSuccess
        headline="Message received."
        message="Thanks for getting in touch — we'll come back to you shortly. If it's time-sensitive, calling is always the fastest route."
      />
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border border-red-600/40 bg-red-50 p-6 focus:outline-none">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Please check {errorList.length} {errorList.length === 1 ? 'field' : 'fields'}.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-800">
            {errorList.map(([k, v]) => <li key={k}>{v}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-7 sm:grid-cols-2">
        <TextField name="name" label="Name" required autoComplete="name" error={errors.name} />
        <TextField name="email" label="Email" type="email" required autoComplete="email" error={errors.email} />
      </div>
      <TextField name="phone" label="Phone" type="tel" required autoComplete="tel" error={errors.phone} />
      <TextArea name="message" label="Message" required rows={6} error={errors.message} />

      {state === 'error' && (
        <p role="alert" className="border border-red-600/40 bg-red-50 p-5 text-sm text-red-800">
          Something went wrong sending your message. Please try again, or call us directly.
        </p>
      )}

      <button type="submit" disabled={state === 'submitting'} className="btn-solid w-full sm:w-auto disabled:opacity-60">
        {state === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
