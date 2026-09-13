'use client';

import { useRef, useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { TextField, TextArea, SelectField, CheckboxCards, FileField, RadioCards } from './Fields';
import FormSuccess from './FormSuccess';
import { submitLead, required, validEmail, validPhone, validPhotos, type Errors, type SubmitState } from './submit';
import { cn } from '@/lib/utils';

const STEPS = [
  { n: 1, title: 'Tell us about your project' },
  { n: 2, title: 'Choose your window coverings' },
  { n: 3, title: "We'll contact you with your options" },
];

/**
 * Three-step quote request.
 *
 * All three steps live in one <form> and are hidden with the `hidden` attribute
 * rather than unmounted, so nothing a visitor has typed is lost when they step
 * back, and a single submit sends the whole thing.
 */
export default function QuoteForm() {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<SubmitState>('idle');
  const [photoError, setPhotoError] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);

  function validateStep(index: number): Errors {
    const form = formRef.current;
    if (!form) return {};
    const fd = new FormData(form);
    const e: Errors = {};

    if (index === 0) {
      const name = required(fd.get('name') as string, 'Name');
      if (name) e.name = name;
      const phone = validPhone(fd.get('phone') as string);
      if (phone) e.phone = phone;
      const email = validEmail(fd.get('email') as string);
      if (email) e.email = email;
      if (!fd.get('projectType')) e.projectType = 'Choose a project type.';
    }
    if (index === 1) {
      if (fd.getAll('product').length === 0) {
        e.product = 'Pick at least one product — “not sure yet” counts.';
      }
    }
    if (index === 2 && photoError) e.photos = photoError;

    return e;
  }

  function next() {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const all = { ...validateStep(0), ...validateStep(1), ...validateStep(2) };
    setErrors(all);
    if (Object.keys(all).length) {
      setStep(0);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setState('submitting');
    try {
      await submitLead(ev.currentTarget, { formType: 'quote', submittedAt: new Date().toISOString() });
      setState('success');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <FormSuccess
        headline="We've got you covered."
        message="Your quote request is with us. We'll review what you've sent and come back to you with options — including anything we'd suggest instead, if we think it suits your windows better."
      />
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-14 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.n} className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors duration-300',
                  done && 'border-brass bg-brass text-white',
                  active && !done && 'border-char-950 bg-char-950 text-warm-white',
                  !done && !active && 'border-char-950/20 text-stone-400'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : s.n}
              </span>
              <span>
                <span className="block text-[0.6rem] uppercase tracking-[0.22em] text-stone-400">
                  Step {s.n}
                </span>
                <span
                  className={cn(
                    'mt-1 block text-sm font-semibold leading-snug',
                    active || done ? 'text-char-950' : 'text-stone-400'
                  )}
                >
                  {s.title}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <p ref={headingRef} tabIndex={-1} className="sr-only" aria-live="polite">
        Step {step + 1} of {STEPS.length}: {STEPS[step].title}
      </p>

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        {errorList.length > 0 && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="mb-10 border border-red-600/40 bg-red-50 p-6 focus:outline-none"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              Please check {errorList.length} {errorList.length === 1 ? 'field' : 'fields'}.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-800">
              {errorList.map(([k, v]) => (
                <li key={k}>{v}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Step 1 ─────────────────────────────────────────────────────── */}
        <div hidden={step !== 0} className="space-y-9">
          <div className="grid gap-7 sm:grid-cols-2">
            <TextField name="name" label="Name" required autoComplete="name" error={errors.name} />
            <TextField name="phone" label="Phone" type="tel" required autoComplete="tel" error={errors.phone} />
            <TextField name="email" label="Email" type="email" required autoComplete="email" error={errors.email} />
            <SelectField
              name="windowsCount"
              label="Number of windows"
              options={['1', '2–3', '4–6', '7–10', '11–20', 'More than 20', 'Not sure yet']}
            />
          </div>
          <RadioCards
            name="projectType"
            legend="Project type"
            required
            columns={3}
            error={errors.projectType}
            options={[
              { value: 'Home', label: 'Home', note: 'A room, a floor or a whole house' },
              { value: 'New build / renovation', label: 'New build / reno', note: 'Coordinating with a build' },
              { value: 'Commercial', label: 'Commercial', note: 'Office, retail, hospitality' },
            ]}
          />
        </div>

        {/* ── Step 2 ─────────────────────────────────────────────────────── */}
        <div hidden={step !== 1} className="space-y-9">
          <CheckboxCards
            name="product"
            legend="Product interest"
            hint="Choose everything you're considering. We'll tell you honestly which suits your windows."
            error={errors.product}
            options={[
              'Roller shades',
              'Zebra shades',
              'Roman shades',
              'Cellular shades',
              'Venetian blinds',
              'Vertical blinds',
              'Wood & faux wood',
              'Panel track',
              'Motorized',
              'Curtains & drapery',
              'Not sure yet',
            ]}
          />
          <TextArea
            name="measurements"
            label="Approximate measurements"
            rows={4}
            hint="Rough width × height per window is plenty — we measure properly before anything is made."
            placeholder={'e.g. Living room: 240 × 210 cm\nBedroom: 120 × 150 cm'}
          />
        </div>

        {/* ── Step 3 ─────────────────────────────────────────────────────── */}
        <div hidden={step !== 2} className="space-y-9">
          <FileField
            name="photos"
            label="Upload photos"
            hint="Up to 6 images, 8 MB each. A wide shot of each room helps more than a close-up."
            error={errors.photos ?? photoError}
            onChange={(files) => {
              const err = validPhotos(files);
              setPhotoError(err);
              setErrors((prev) => ({ ...prev, photos: err ?? '' }));
            }}
          />
          <TextArea
            name="notes"
            label="Notes"
            rows={5}
            placeholder="Anything else we should know — deadlines, a look you're after, a window that's given you trouble…"
          />
          <div className="border border-char-950/12 bg-warm-50 p-7">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-char-950">
              No obligation. No pressure. Just expert advice.
            </p>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-stone-600">
              We&rsquo;ll come back to you with options and what we&rsquo;d recommend. If the honest
              answer is that a simpler or cheaper product suits your windows better, that&rsquo;s what
              we&rsquo;ll tell you.
            </p>
          </div>
        </div>

        {state === 'error' && (
          <p role="alert" className="mt-8 border border-red-600/40 bg-red-50 p-5 text-sm text-red-800">
            Something went wrong sending your request. Please try again, or contact us directly.
          </p>
        )}

        {/* Navigation */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          {step > 0 && (
            <button type="button" onClick={back} className="btn-outline">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-solid">
              Continue
            </button>
          ) : (
            <button type="submit" disabled={state === 'submitting'} className="btn-solid disabled:opacity-60">
              {state === 'submitting' ? 'Sending…' : 'Request my free quote'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
