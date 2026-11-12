'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
export type ImageResolver = (v: string) => string;

const LONG_KEYS = /^(body|intro|text|long|blurb|a|description|note|lead|privacy|motorisation|sizing|installation)$/i;
const IMAGE_KEYS = /^(image|hero|card|before|after|id)$|image/i;

/** Turn camelCase keys into readable labels: "phoneHref" → "Phone href". */
const pretty = (k: string) => {
  const s = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** An empty value with the same shape — used for "Add new". */
export function blankLike(v: Json): Json {
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)]));
  if (typeof v === 'number') return 0;
  if (typeof v === 'boolean') return false;
  if (v === null) return null;
  return '';
}

const inputCls = 'mt-1.5 block w-full border border-char-950/15 bg-white px-3 py-2.5 text-sm text-char-950 outline-none transition focus:border-char-950';
const labelCls = 'block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-char-700';

export function ValueEditor({
  value, onChange, label, keyName = '', resolveImage, root,
}: {
  value: Json; onChange: (v: Json) => void; label?: string; keyName?: string; resolveImage: ImageResolver; root?: boolean;
}) {
  // ── Strings
  if (typeof value === 'string') {
    const long = LONG_KEYS.test(keyName) || value.length > 90;
    const img = IMAGE_KEYS.test(keyName) && keyName !== 'id' ? resolveImage(value) : '';
    return (
      <label className={labelCls}>
        {label}
        <div className="flex gap-3">
          {long ? (
            <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(10, Math.max(3, Math.ceil(value.length / 90)))} className={inputCls} />
          ) : (
            <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
          )}
          {IMAGE_KEYS.test(keyName) && keyName !== 'id' && (
            <span className="mt-1.5 h-[42px] w-16 shrink-0 border border-char-950/10 bg-warm-100 bg-cover bg-center" style={{ backgroundImage: img ? `url("${img}")` : undefined }} />
          )}
        </div>
        {IMAGE_KEYS.test(keyName) && keyName !== 'id' && (
          <span className="mt-1 block text-[0.7rem] normal-case tracking-normal text-stone-500">An image name from the Image library, or a full https:// URL.</span>
        )}
      </label>
    );
  }

  // ── Numbers / booleans
  if (typeof value === 'number')
    return (
      <label className={labelCls}>
        {label}
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputCls} />
      </label>
    );
  if (typeof value === 'boolean')
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}
      </label>
    );

  // ── null: allow switching to text or entering JSON
  if (value === null) return <NullEditor label={label} onChange={onChange} />;

  // ── Arrays of plain strings: one per line
  if (Array.isArray(value) && value.every((x) => typeof x === 'string')) {
    const isImages = IMAGE_KEYS.test(keyName) || keyName === 'gallery';
    return (
      <label className={labelCls}>
        {label} <span className="font-normal normal-case tracking-normal text-stone-500">— one per line</span>
        <textarea
          value={(value as string[]).join('\n')}
          onChange={(e) => onChange(e.target.value.split('\n'))}
          onBlur={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
          rows={Math.min(12, Math.max(3, value.length + 1))}
          className={inputCls}
        />
        {isImages && value.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(value as string[]).map((v, i) => (
              <span key={i} title={v} className="h-12 w-16 border border-char-950/10 bg-warm-100 bg-cover bg-center" style={{ backgroundImage: resolveImage(v) ? `url("${resolveImage(v)}")` : undefined }} />
            ))}
          </div>
        )}
      </label>
    );
  }

  // ── Arrays of objects / mixed
  if (Array.isArray(value)) return <ArrayEditor value={value} onChange={onChange} label={label} keyName={keyName} resolveImage={resolveImage} />;

  // ── Objects
  const entries = Object.entries(value);
  const body = (
    <div className="space-y-5">
      {entries.map(([k, v]) => (
        <ValueEditor
          key={k}
          keyName={k}
          label={pretty(k)}
          value={v}
          resolveImage={resolveImage}
          onChange={(nv) => onChange({ ...value, [k]: nv })}
        />
      ))}
    </div>
  );
  if (root) return body;
  return (
    <fieldset className="border border-char-950/10 bg-warm-50/60 p-4">
      {label && <legend className="px-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-brass">{label}</legend>}
      {body}
    </fieldset>
  );
}

function ArrayEditor({ value, onChange, label, keyName, resolveImage }: {
  value: Json[]; onChange: (v: Json) => void; label?: string; keyName: string; resolveImage: ImageResolver;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const title = (v: Json, i: number) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const k of ['q', 'title', 'name', 'label', 'days']) if (typeof v[k] === 'string' && v[k]) return v[k] as string;
    }
    return `${label ?? 'Item'} ${i + 1}`;
  };
  return (
    <div>
      <p className={labelCls}>{label} <span className="font-normal normal-case tracking-normal text-stone-500">({value.length})</span></p>
      <ul className="mt-1.5 divide-y divide-char-950/10 border border-char-950/10 bg-white">
        {value.map((item, i) => (
          <li key={i}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
                {open === i ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="truncate">{title(item, i)}</span>
              </button>
              <button title="Remove" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-red-700"><Trash2 size={13} /></button>
            </div>
            {open === i && (
              <div className="border-t border-char-950/10 bg-warm-50/60 p-4">
                <ValueEditor value={item} keyName={keyName} resolveImage={resolveImage} root onChange={(nv) => { const n = [...value]; n[i] = nv; onChange(n); }} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={() => { onChange([...value, value.length ? blankLike(value[0]) : '']); setOpen(value.length); }}
        className="mt-2 inline-flex items-center gap-1.5 border border-char-950/15 bg-white px-3 py-1.5 text-xs font-medium hover:bg-warm-100"
      >
        <Plus size={13} /> Add
      </button>
    </div>
  );
}

function NullEditor({ label, onChange }: { label?: string; onChange: (v: Json) => void }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className={labelCls}>
      {label} <span className="font-normal normal-case tracking-normal text-stone-500">— currently empty / hidden</span>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <input value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} placeholder='Text, or JSON like {"street": "…"}' className={inputCls + ' mt-0 flex-1 normal-case tracking-normal'} />
        <button
          onClick={() => {
            if (!text.trim()) return;
            try { onChange(JSON.parse(text)); } catch { if (/^[[{]/.test(text.trim())) setErr('That JSON is not valid.'); else onChange(text); }
          }}
          className="border border-char-950/15 bg-white px-3 text-xs font-medium normal-case tracking-normal hover:bg-warm-100"
        >
          Set
        </button>
      </div>
      {err && <p className="mt-1 text-xs normal-case tracking-normal text-red-700">{err}</p>}
    </div>
  );
}
