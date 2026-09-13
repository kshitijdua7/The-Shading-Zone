'use client';

import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  TextField,
  TextArea,
  SelectField,
  RadioCards,
  CheckboxCards,
  FileField,
} from './Fields';
import FormSuccess from './FormSuccess';
import { submitLead, required, validEmail, validPhone, validPhotos, type Errors, type SubmitState } from './submit';

export default function ConsultationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<SubmitState>('idle');
  const [photoError, setPhotoError] = useState<string | undefined>();

  function validate(fd: FormData): Errors {
    const e: Errors = {};
    const name = required(fd.get('name') as string, 'Full name');
    if (name) e.name = name;
    const phone = validPhone(fd.get('phone') as string);
    if (phone) e.phone = phone;
    const email = validEmail(fd.get('email') as string);
    if (email) e.email = email;
    const area = required(fd.get('area') as string, 'Address or area');
    if (area) e.area = area;
    if (!fd.get('consultationType')) e.consultationType = 'Choose in-home or virtual.';
    if (photoError) e.photos = photoError;
    return e;
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const e = validate(fd);
    setErrors(e);

    if (Object.keys(e).length > 0) {
      // Move focus to the summary so the errors are announced, then to the field.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setState('submitting');
    try {
      await submitLead(form, { formType: 'consultation', submittedAt: new Date().toISOString() });
      setState('success');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <FormSuccess message="Thank you — your consultation request is with us. We'll be in touch to confirm a time that works for you. If it's urgent, calling is always faster." />
    );
  }

  const errorList = Object.entries(errors);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-12">
      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="border border-red-600/40 bg-red-50 p-6 focus:outline-none"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Please check {errorList.length} {errorList.length === 1 ? 'field' : 'fields'} below.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-800">
            {errorList.map(([k, v]) => (
              <li key={k}>
                <a href={`#f-${k}`} className="underline">{v}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="space-y-7">
        <legend className="eyebrow mb-6">Your details</legend>
        <div className="grid gap-7 sm:grid-cols-2">
          <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} />
          <TextField name="phone" label="Phone number" type="tel" required autoComplete="tel" error={errors.phone} />
          <TextField name="email" label="Email" type="email" required autoComplete="email" error={errors.email} />
          <TextField
            name="area"
            label="Address or area"
            required
            autoComplete="street-address"
            hint="So we can confirm we cover your location."
            error={errors.area}
          />
        </div>
      </fieldset>

      <div className="rule" />

      <fieldset className="space-y-9">
        <legend className="eyebrow mb-6">Your consultation</legend>

        <RadioCards
          name="consultationType"
          legend="Preferred consultation type"
          required
          error={errors.consultationType}
          options={[
            { value: 'In-home', label: 'In-home', note: 'We come to you with samples' },
            { value: 'Virtual', label: 'Virtual', note: 'A video call at a time that suits' },
          ]}
        />

        <CheckboxCards
          name="interest"
          legend="What are you looking for?"
          hint="Choose as many as apply — “not sure yet” is a perfectly good answer."
          options={['Blinds', 'Shades', 'Curtains', 'Motorized', 'Not sure yet']}
        />

        <div className="grid gap-7 sm:grid-cols-3">
          <SelectField
            name="windows"
            label="Number of windows"
            options={['1', '2–3', '4–6', '7–10', '11–20', 'More than 20', 'Not sure yet']}
          />
          <TextField name="date" label="Preferred date" type="date" />
          <SelectField
            name="time"
            label="Preferred time"
            options={['Morning', 'Midday', 'Afternoon', 'Evening', 'Flexible']}
          />
        </div>

        <TextArea
          name="details"
          label="Additional details"
          placeholder="Tell us about the rooms, the light, anything you've already ruled in or out…"
          rows={5}
        />

        <FileField
          name="photos"
          label="Photos of your windows"
          hint="Up to 6 images, 8 MB each. Helpful, but never required."
          error={errors.photos ?? photoError}
          onChange={(files) => {
            const err = validPhotos(files);
            setPhotoError(err);
            setErrors((prev) => ({ ...prev, photos: err ?? '' }));
          }}
        />
      </fieldset>

      {state === 'error' && (
        <p role="alert" className="border border-red-600/40 bg-red-50 p-5 text-sm text-red-800">
          Something went wrong sending your request. Please try again, or contact us directly and
          we&rsquo;ll take the details over the phone.
        </p>
      )}

      <div className="flex flex-col items-start gap-5">
        <button type="submit" disabled={state === 'submitting'} className="btn-solid w-full sm:w-auto disabled:opacity-60">
          {state === 'submitting' ? 'Sending…' : 'Book my free consultation'}
        </button>
        <p className="text-xs leading-relaxed text-stone-500">
          No cost. No obligation. We use your details only to arrange and follow up on this
          consultation.
        </p>
      </div>
    </form>
  );
}
