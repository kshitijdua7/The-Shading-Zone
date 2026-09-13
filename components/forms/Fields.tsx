'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────────
   Form primitives.

   Every field has a visible label (never a placeholder standing in for one),
   an error rendered next to the field it belongs to, `aria-invalid` and
   `aria-describedby` wired up, and a 48px+ target. Helper text is shown up
   front rather than hidden behind a tooltip.
   ──────────────────────────────────────────────────────────────────────────── */

const baseInput =
  'min-h-[52px] w-full border bg-transparent px-4 py-3.5 text-[0.95rem] text-char-900 ' +
  'placeholder:text-stone-400 transition-colors duration-200 ' +
  'focus:outline-none focus:border-char-950';

function Shell({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-char-700">
        {label}
        {required && <span className="ml-1 text-brass" aria-hidden="true">*</span>}
        {!required && <span className="ml-2 font-normal normal-case tracking-normal text-stone-400">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-stone-500">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  name,
  label,
  type = 'text',
  hint,
  error,
  required,
  placeholder,
  autoComplete,
  className,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  defaultValue?: string;
}) {
  const id = `f-${name}`;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn(baseInput, error ? 'border-red-600' : 'border-char-950/15 hover:border-char-950/35')}
      />
    </Shell>
  );
}

export function TextArea({
  name,
  label,
  hint,
  error,
  required,
  placeholder,
  rows = 5,
  className,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const id = `f-${name}`;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn(
          baseInput,
          'resize-y leading-relaxed',
          error ? 'border-red-600' : 'border-char-950/15 hover:border-char-950/35'
        )}
      />
    </Shell>
  );
}

export function SelectField({
  name,
  label,
  options,
  hint,
  error,
  required,
  className,
}: {
  name: string;
  label: string;
  options: string[];
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  const id = `f-${name}`;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        name={name}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn(baseInput, 'cursor-pointer', error ? 'border-red-600' : 'border-char-950/15 hover:border-char-950/35')}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Shell>
  );
}

/** Segmented radio group — a real fieldset with real radios, styled as cards. */
export function RadioCards({
  name,
  legend,
  options,
  hint,
  error,
  required,
  columns = 2,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string; note?: string }[];
  hint?: string;
  error?: string;
  required?: boolean;
  columns?: 2 | 3;
}) {
  const uid = useId();
  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${uid}-error` : undefined}
    >
      <legend className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-char-700">
        {legend}
        {required && <span className="ml-1 text-brass" aria-hidden="true">*</span>}
      </legend>
      {hint && <p className="mt-2 text-xs text-stone-500">{hint}</p>}
      <div className={cn('mt-4 grid gap-3', columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              'group relative flex min-h-[64px] cursor-pointer flex-col justify-center gap-1 border px-5 py-4 transition-all duration-200',
              'border-char-950/15 hover:border-char-950/45',
              'has-[:checked]:border-char-950 has-[:checked]:bg-char-950 has-[:checked]:text-warm-white',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass',
              error && 'border-red-600'
            )}
          >
            <input type="radio" name={name} value={o.value} className="sr-only" />
            <span className="text-sm font-semibold">{o.label}</span>
            {o.note && <span className="text-xs opacity-65">{o.note}</span>}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${uid}-error`} role="alert" className="mt-3 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function CheckboxCards({
  name,
  legend,
  options,
  hint,
  error,
}: {
  name: string;
  legend: string;
  options: string[];
  hint?: string;
  error?: string;
}) {
  const uid = useId();
  return (
    <fieldset aria-describedby={error ? `${uid}-error` : undefined}>
      <legend className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-char-700">
        {legend}
      </legend>
      {hint && <p className="mt-2 text-xs text-stone-500">{hint}</p>}
      <div className="mt-4 flex flex-wrap gap-2.5">
        {options.map((o) => (
          <label
            key={o}
            className={cn(
              'inline-flex min-h-[46px] cursor-pointer items-center border px-5 py-2.5 text-sm transition-all duration-200',
              'border-char-950/15 hover:border-char-950/45',
              'has-[:checked]:border-char-950 has-[:checked]:bg-char-950 has-[:checked]:text-warm-white',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass'
            )}
          >
            <input type="checkbox" name={name} value={o} className="sr-only" />
            {o}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${uid}-error`} role="alert" className="mt-3 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function FileField({
  name,
  label,
  hint,
  error,
  onChange,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  onChange?: (files: FileList | null) => void;
}) {
  const id = `f-${name}`;
  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onChange?.(e.target.files)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn(
          'block w-full cursor-pointer border border-dashed px-4 py-6 text-sm text-stone-600',
          'file:mr-4 file:cursor-pointer file:border-0 file:bg-char-950 file:px-5 file:py-2.5',
          'file:text-[0.66rem] file:font-semibold file:uppercase file:tracking-[0.16em] file:text-warm-white',
          error ? 'border-red-600' : 'border-char-950/20 hover:border-char-950/40'
        )}
      />
    </Shell>
  );
}
