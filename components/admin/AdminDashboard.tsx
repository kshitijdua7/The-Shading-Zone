'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Inbox, Settings, Package, Layers, HelpCircle, Images, Users,
  Code2, ListOrdered, Factory, Star, Building2, Handshake, SplitSquareHorizontal,
  ThumbsUp, Plus, Trash2, Copy, ArrowUp, ArrowDown, Save, ExternalLink, LogOut, RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValueEditor, blankLike, type Json, type ImageResolver } from './ValueEditor';

type Me = { id: string; name: string; email: string; role: 'admin' | 'user' };
type PublicUser = Me & { createdAt: string };
type Lead = { id: string; createdAt: string; fields: Record<string, string>; read?: boolean };
type Obj = Record<string, Json>;

/* Every content section the owner can edit. Unknown keys appear under Advanced. */
const SECTIONS: { key: string; label: string; icon: typeof Package; itemLabel: string }[] = [
  { key: 'products', label: 'Products', icon: Package, itemLabel: 'product' },
  { key: 'collections', label: 'Collections', icon: Layers, itemLabel: 'collection' },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle, itemLabel: 'question' },
  { key: 'galleryCategories', label: 'Gallery', icon: Images, itemLabel: 'category' },
  { key: 'beforeAfter', label: 'Before & after', icon: SplitSquareHorizontal, itemLabel: 'pair' },
  { key: 'process', label: 'Our process', icon: ListOrdered, itemLabel: 'step' },
  { key: 'manufacturing', label: 'Manufacturing', icon: Factory, itemLabel: 'step' },
  { key: 'why', label: 'Why choose us', icon: Star, itemLabel: 'card' },
  { key: 'trust', label: 'Trust points', icon: ThumbsUp, itemLabel: 'card' },
  { key: 'commercialSectors', label: 'Commercial', icon: Building2, itemLabel: 'sector' },
  { key: 'tradePartners', label: 'Trade partners', icon: Handshake, itemLabel: 'partner' },
];

type Tab = 'overview' | 'leads' | 'site' | 'images' | 'users' | 'advanced' | string;

async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

export default function AdminDashboard({ me }: { me: Me }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [content, setContent] = useState<Obj | null>(null);
  const [site, setSite] = useState<Obj | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dirty, setDirty] = useState<{ content?: boolean; site?: boolean }>({});
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const notify = (msg: string, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const [c, s, u, l] = await Promise.all([
        api<Obj>('/api/admin/content/'),
        api<Obj>('/api/admin/site/'),
        api<PublicUser[]>('/api/admin/users/'),
        api<Lead[]>('/api/admin/leads/'),
      ]);
      setContent(c); setSite(s); setUsers(u); setLeads(l); setDirty({});
    } catch (e) {
      notify((e as Error).message, true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Warn before leaving with unsaved edits. */
  useEffect(() => {
    if (!dirty.content && !dirty.site) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const updateContent = (key: string, value: Json) => {
    setContent((c) => ({ ...(c as Obj), [key]: value }));
    setDirty((d) => ({ ...d, content: true }));
  };

  async function save(which: 'content' | 'site', body?: Obj) {
    setSaving(true);
    try {
      await api(`/api/admin/${which}/`, { method: 'PUT', body: JSON.stringify(body ?? (which === 'content' ? content : site)) });
      setDirty((d) => ({ ...d, [which]: false }));
      notify('Saved. Your changes are live on the website.');
    } catch (e) {
      notify((e as Error).message, true);
    } finally {
      setSaving(false);
    }
  }

  async function reset(which: 'content' | 'site') {
    if (!confirm(`Restore the original ${which === 'content' ? 'website content' : 'site settings'}? Your edits will be lost.`)) return;
    await api(`/api/admin/${which}/`, { method: 'DELETE' });
    await load();
    notify('Restored the originals.');
  }

  const images = (content?.images ?? {}) as Record<string, { id: string; alt: string }>;
  const resolveImage: ImageResolver = useCallback(
    (v: string) => {
      if (!v) return '';
      if (/^(https?:)?\//.test(v)) return v;
      const e = images[v];
      if (!e) return '';
      return /^(https?:)?\//.test(e.id) ? e.id : `https://images.unsplash.com/${e.id}?auto=format&fit=crop&w=400&q=60`;
    },
    [images]
  );

  const unread = leads.filter((l) => !l.read).length;
  const extraKeys = content ? Object.keys(content).filter((k) => k !== 'images' && !SECTIONS.some((s) => s.key === k)) : [];

  const nav: { key: Tab; label: string; icon: typeof Package; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'leads', label: 'Leads', icon: Inbox, badge: unread },
    { key: 'site', label: 'Business details', icon: Settings },
    ...SECTIONS.map((s) => ({ key: s.key, label: s.label, icon: s.icon })),
    { key: 'images', label: 'Image library', icon: Images },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'advanced', label: 'Advanced (JSON)', icon: Code2 },
  ];

  const section = SECTIONS.find((s) => s.key === tab);
  const isContentTab = !!section || tab === 'images' || tab === 'advanced' || extraKeys.includes(tab);

  return (
    <div className="min-h-screen bg-warm-50 pt-24 text-char-950">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-char-950/10 bg-warm-white p-5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brass">Admin dashboard</p>
            <p className="mt-2 truncate text-sm font-semibold">{me.name}</p>
            <p className="truncate text-xs text-stone-500">{me.email}</p>
            <div className="mt-4 flex gap-2">
              <Link href="/" target="_blank" className="inline-flex flex-1 items-center justify-center gap-1.5 border border-char-950/15 px-2 py-2 text-xs font-medium hover:bg-warm-100">
                <ExternalLink size={13} /> View site
              </Link>
              <button
                onClick={async () => { await fetch('/api/auth/logout/', { method: 'POST' }); window.location.href = '/'; }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 border border-char-950/15 px-2 py-2 text-xs font-medium hover:bg-warm-100"
              >
                <LogOut size={13} /> Log out
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto border border-char-950/10 bg-warm-white p-2 lg:flex-col lg:overflow-visible">
            {nav.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 px-3 py-2 text-left text-sm transition',
                  tab === key ? 'bg-char-950 text-warm-white' : 'text-char-700 hover:bg-warm-100'
                )}
              >
                <Icon size={15} className="shrink-0" />
                <span className="flex-1 whitespace-nowrap">{label}</span>
                {!!badge && <span className="rounded-full bg-brass px-1.5 text-[0.65rem] font-semibold text-white">{badge}</span>}
              </button>
            ))}
            {extraKeys.map((k) => (
              <button key={k} onClick={() => setTab(k)} className={cn('flex shrink-0 items-center gap-2.5 px-3 py-2 text-left text-sm', tab === k ? 'bg-char-950 text-warm-white' : 'text-char-700 hover:bg-warm-100')}>
                <Layers size={15} /> {k}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main panel */}
        <main className="min-w-0">
          {(isContentTab && dirty.content) || (tab === 'site' && dirty.site) ? (
            <div className="sticky top-20 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 border border-brass/40 bg-[#FBF5EA] px-5 py-3 shadow-sm">
              <span className="text-sm">You have unsaved changes.</span>
              <div className="flex gap-2">
                <button onClick={load} className="border border-char-950/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-warm-100">Discard</button>
                <button
                  disabled={saving}
                  onClick={() => save(tab === 'site' ? 'site' : 'content')}
                  className="inline-flex items-center gap-2 bg-char-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-warm-white hover:bg-brass disabled:opacity-60"
                >
                  <Save size={14} /> {saving ? 'Saving…' : 'Save & publish'}
                </button>
              </div>
            </div>
          ) : null}

          {!content || !site ? (
            <Panel title="Loading…"><p className="text-sm text-stone-500">Fetching your website data.</p></Panel>
          ) : tab === 'overview' ? (
            <Overview content={content} users={users} leads={leads} go={setTab} />
          ) : tab === 'leads' ? (
            <LeadsPanel
              leads={leads}
              onToggle={async (l) => { await api('/api/admin/leads/', { method: 'PATCH', body: JSON.stringify({ id: l.id, read: !l.read }) }); setLeads((ls) => ls.map((x) => (x.id === l.id ? { ...x, read: !l.read } : x))); }}
              onDelete={async (l) => { if (!confirm('Delete this lead?')) return; await api(`/api/admin/leads/?id=${l.id}`, { method: 'DELETE' }); setLeads((ls) => ls.filter((x) => x.id !== l.id)); }}
            />
          ) : tab === 'site' ? (
            <Panel title="Business details" desc="Name, tagline, contact details, opening hours, address and social links shown across the site." actions={<ResetBtn onClick={() => reset('site')} />}>
              <ValueEditor value={site as Json} onChange={(v) => { setSite(v as Obj); setDirty((d) => ({ ...d, site: true })); }} resolveImage={resolveImage} root />
            </Panel>
          ) : section ? (
            <ListEditor
              key={section.key}
              title={section.label}
              itemLabel={section.itemLabel}
              items={(content[section.key] ?? []) as Json[]}
              onChange={(v) => updateContent(section.key, v)}
              resolveImage={resolveImage}
            />
          ) : extraKeys.includes(tab) ? (
            <Panel title={tab}>
              <ValueEditor value={content[tab]} onChange={(v) => updateContent(tab, v)} resolveImage={resolveImage} root />
            </Panel>
          ) : tab === 'images' ? (
            <ImageLibrary images={images} onChange={(v) => updateContent('images', v as unknown as Json)} resolveImage={resolveImage} />
          ) : tab === 'users' ? (
            <UsersPanel
              users={users}
              me={me}
              onRole={async (u, role) => { try { await api('/api/admin/users/', { method: 'PATCH', body: JSON.stringify({ id: u.id, role }) }); setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, role } : x))); notify(`${u.name} is now ${role === 'admin' ? 'an admin' : 'a regular user'}.`); } catch (e) { notify((e as Error).message, true); } }}
              onDelete={async (u) => { if (!confirm(`Delete ${u.name}'s account?`)) return; try { await api(`/api/admin/users/?id=${u.id}`, { method: 'DELETE' }); setUsers((us) => us.filter((x) => x.id !== u.id)); } catch (e) { notify((e as Error).message, true); } }}
            />
          ) : tab === 'advanced' ? (
            <AdvancedJson content={content} onSave={async (c) => { setContent(c); await save('content', c); }} onReset={() => reset('content')} />
          ) : null}
        </main>
      </div>

      {toast && (
        <div role="status" className={cn('fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-5 py-3 text-sm text-white shadow-lg', toast.err ? 'bg-red-700' : 'bg-char-950')}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Building blocks ───────────────────────────────────────────────────── */

function Panel({ title, desc, actions, children }: { title: string; desc?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-char-950/10 bg-warm-white p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {desc && <p className="mt-1 max-w-2xl text-sm text-stone-600">{desc}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function ResetBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 border border-char-950/15 px-3 py-2 text-xs text-stone-600 hover:bg-warm-100">
      <RotateCcw size={13} /> Restore original
    </button>
  );
}

function itemTitle(item: Json, i: number): string {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const o = item as Obj;
    for (const k of ['name', 'title', 'q', 'slug', 'n']) if (typeof o[k] === 'string' && o[k]) return o[k] as string;
  }
  if (typeof item === 'string') return item;
  return `Item ${i + 1}`;
}

function ListEditor({ title, itemLabel, items, onChange, resolveImage }: {
  title: string; itemLabel: string; items: Json[]; onChange: (v: Json[]) => void; resolveImage: ImageResolver;
}) {
  const [sel, setSel] = useState(0);
  const [q, setQ] = useState('');
  const idx = Math.min(sel, items.length - 1);

  const filtered = useMemo(
    () => items.map((it, i) => ({ it, i })).filter(({ it }) => !q || JSON.stringify(it).toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  const set = (next: Json[], nextSel = idx) => { onChange(next); setSel(Math.max(0, nextSel)); };
  const move = (d: number) => {
    const j = idx + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    set(next, j);
  };

  return (
    <Panel
      title={title}
      desc={`${items.length} ${itemLabel}${items.length === 1 ? '' : 's'}. Select one to edit, or add a new one. Changes go live when you press “Save & publish”.`}
      actions={
        <button
          onClick={() => set([...items, items.length ? blankLike(items[0]) : { title: '', text: '' }], items.length)}
          className="inline-flex items-center gap-1.5 bg-char-950 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-warm-white hover:bg-brass"
        >
          <Plus size={14} /> Add {itemLabel}
        </button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
        <div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="mb-2 w-full border border-char-950/15 bg-white px-3 py-2 text-sm outline-none focus:border-char-950" />
          <ul className="max-h-[60vh] overflow-y-auto border border-char-950/10">
            {filtered.map(({ it, i }) => (
              <li key={i}>
                <button
                  onClick={() => setSel(i)}
                  className={cn('block w-full truncate border-b border-char-950/5 px-3 py-2.5 text-left text-sm', i === idx ? 'bg-char-950 text-warm-white' : 'hover:bg-warm-100')}
                >
                  {itemTitle(it, i) || <em className="opacity-60">Untitled</em>}
                </button>
              </li>
            ))}
            {!filtered.length && <li className="px-3 py-4 text-sm text-stone-500">Nothing found.</li>}
          </ul>
        </div>

        <div className="min-w-0">
          {items.length === 0 ? (
            <p className="text-sm text-stone-500">No {itemLabel}s yet.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-char-950/10 pb-4">
                <h2 className="mr-auto truncate text-lg font-semibold">{itemTitle(items[idx], idx) || 'Untitled'}</h2>
                <IconBtn title="Move up" onClick={() => move(-1)}><ArrowUp size={14} /></IconBtn>
                <IconBtn title="Move down" onClick={() => move(1)}><ArrowDown size={14} /></IconBtn>
                <IconBtn title="Duplicate" onClick={() => { const next = [...items]; next.splice(idx + 1, 0, JSON.parse(JSON.stringify(items[idx]))); set(next, idx + 1); }}><Copy size={14} /></IconBtn>
                <IconBtn title="Delete" danger onClick={() => { if (confirm(`Delete “${itemTitle(items[idx], idx)}”?`)) set(items.filter((_, i) => i !== idx), idx - 1); }}><Trash2 size={14} /></IconBtn>
              </div>
              <ValueEditor
                key={idx}
                value={items[idx]}
                onChange={(v) => { const next = [...items]; next[idx] = v; onChange(next); }}
                resolveImage={resolveImage}
                root
              />
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

function IconBtn({ title, onClick, danger, children }: { title: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button title={title} aria-label={title} onClick={onClick} className={cn('grid h-9 w-9 place-items-center border', danger ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-char-950/15 hover:bg-warm-100')}>
      {children}
    </button>
  );
}

function Overview({ content, users, leads, go }: { content: Obj; users: PublicUser[]; leads: Lead[]; go: (t: Tab) => void }) {
  const stats: { label: string; value: number; tab: Tab }[] = [
    { label: 'New leads', value: leads.filter((l) => !l.read).length, tab: 'leads' },
    { label: 'Total leads', value: leads.length, tab: 'leads' },
    { label: 'Products', value: ((content.products as Json[]) ?? []).length, tab: 'products' },
    { label: 'Collections', value: ((content.collections as Json[]) ?? []).length, tab: 'collections' },
    { label: 'FAQs', value: ((content.faqs as Json[]) ?? []).length, tab: 'faqs' },
    { label: 'Registered users', value: users.length, tab: 'users' },
  ];
  return (
    <div className="space-y-6">
      <Panel title="Overview" desc="Everything on your website can be changed from this dashboard. Pick a section on the left.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map((s) => (
            <button key={s.label} onClick={() => go(s.tab)} className="border border-char-950/10 bg-white p-5 text-left transition hover:border-char-950/40">
              <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">{s.label}</p>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Latest leads">
        {leads.length === 0 ? (
          <p className="text-sm text-stone-500">No form submissions yet. Quote, consultation and contact requests will appear here.</p>
        ) : (
          <ul className="divide-y divide-char-950/10">
            {leads.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="truncate"><strong>{leadName(l)}</strong> <span className="text-stone-500">· {l.fields.form || l.fields.formType || 'Form'}</span></span>
                <span className="shrink-0 text-xs text-stone-500">{new Date(l.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

const leadName = (l: Lead) => l.fields.name || l.fields.fullName || [l.fields.firstName, l.fields.lastName].filter(Boolean).join(' ') || l.fields.email || 'Unknown';

function LeadsPanel({ leads, onToggle, onDelete }: { leads: Lead[]; onToggle: (l: Lead) => void; onDelete: (l: Lead) => void }) {
  return (
    <Panel title="Leads" desc="Every quote, consultation and contact form submitted on the website.">
      {leads.length === 0 ? (
        <p className="text-sm text-stone-500">No leads yet.</p>
      ) : (
        <ul className="space-y-3">
          {leads.map((l) => (
            <li key={l.id} className={cn('border p-4', l.read ? 'border-char-950/10 bg-white' : 'border-brass/50 bg-[#FBF5EA]')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{!l.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brass" />}{leadName(l)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">{new Date(l.createdAt).toLocaleString()}</span>
                  <button onClick={() => onToggle(l)} className="border border-char-950/15 px-2.5 py-1 text-xs hover:bg-warm-100">{l.read ? 'Mark unread' : 'Mark read'}</button>
                  <IconBtn title="Delete lead" danger onClick={() => onDelete(l)}><Trash2 size={13} /></IconBtn>
                </div>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {Object.entries(l.fields).map(([k, v]) => (
                  <div key={k} className="min-w-0"><dt className="inline text-stone-500">{k}: </dt><dd className="inline break-words">{v}</dd></div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ImageLibrary({ images, onChange, resolveImage }: {
  images: Record<string, { id: string; alt: string }>; onChange: (v: Record<string, { id: string; alt: string }>) => void; resolveImage: ImageResolver;
}) {
  const [newKey, setNewKey] = useState('');
  const entries = Object.entries(images);
  const input = 'w-full border border-char-950/15 bg-white px-2.5 py-2 text-sm outline-none focus:border-char-950';
  return (
    <Panel title="Image library" desc="Named images used across the site. “Source” can be a full image URL (https://…) or an Unsplash photo id. Anywhere the site asks for an image you can type one of these names — or paste a URL directly.">
      <div className="mb-5 flex flex-wrap gap-2">
        <input value={newKey} onChange={(e) => setNewKey(e.target.value.replace(/\s+/g, ''))} placeholder="newImageName" className={cn(input, 'max-w-xs')} />
        <button
          disabled={!newKey || newKey in images}
          onClick={() => { onChange({ ...images, [newKey]: { id: '', alt: '' } }); setNewKey(''); }}
          className="inline-flex items-center gap-1.5 bg-char-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-warm-white hover:bg-brass disabled:opacity-40"
        >
          <Plus size={14} /> Add image
        </button>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {entries.map(([key, e]) => (
          <li key={key} className="flex gap-3 border border-char-950/10 bg-white p-3">
            <div className="h-20 w-24 shrink-0 bg-warm-100 bg-cover bg-center" style={{ backgroundImage: resolveImage(key) ? `url("${resolveImage(key)}")` : undefined }} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <code className="truncate text-xs font-semibold">{key}</code>
                <button title="Remove" onClick={() => { if (confirm(`Remove image “${key}”? Pages still using it will show no image.`)) { const n = { ...images }; delete n[key]; onChange(n); } }} className="text-red-700"><Trash2 size={13} /></button>
              </div>
              <input className={input} value={e.id} placeholder="Source (URL or Unsplash id)" onChange={(ev) => onChange({ ...images, [key]: { ...e, id: ev.target.value } })} />
              <input className={input} value={e.alt} placeholder="Description (alt text)" onChange={(ev) => onChange({ ...images, [key]: { ...e, alt: ev.target.value } })} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function UsersPanel({ users, me, onRole, onDelete }: {
  users: PublicUser[]; me: Me; onRole: (u: PublicUser, r: 'admin' | 'user') => void; onDelete: (u: PublicUser) => void;
}) {
  return (
    <Panel title="Users" desc="Everyone who has signed up. Make someone an admin to give them full access to this dashboard.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-stone-500">
            <tr><th className="py-2 pr-3">Name</th><th className="pr-3">Email</th><th className="pr-3">Joined</th><th className="pr-3">Role</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-char-950/10">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-3 font-medium">{u.name}{u.id === me.id && <span className="ml-1 text-xs text-stone-500">(you)</span>}</td>
                <td className="pr-3">{u.email}</td>
                <td className="pr-3 text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="pr-3">
                  <select value={u.role} disabled={u.id === me.id} onChange={(e) => onRole(u, e.target.value as 'admin' | 'user')} className="border border-char-950/15 bg-white px-2 py-1">
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select>
                </td>
                <td className="text-right">{u.id !== me.id && <IconBtn title="Delete user" danger onClick={() => onDelete(u)}><Trash2 size={13} /></IconBtn>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AdvancedJson({ content, onSave, onReset }: { content: Obj; onSave: (c: Obj) => void; onReset: () => void }) {
  const [text, setText] = useState(() => JSON.stringify(content, null, 2));
  const [err, setErr] = useState('');
  useEffect(() => setText(JSON.stringify(content, null, 2)), [content]);
  return (
    <Panel title="Advanced (JSON)" desc="The complete website content as raw JSON, for bulk edits. Invalid JSON can't be saved." actions={<ResetBtn onClick={onReset} />}>
      <textarea value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} spellCheck={false} className="h-[65vh] w-full border border-char-950/15 bg-white p-3 font-mono text-xs leading-relaxed outline-none focus:border-char-950" />
      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
      <button
        onClick={() => { try { const parsed = JSON.parse(text); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Top level must be an object.'); onSave(parsed); } catch (e) { setErr((e as Error).message); } }}
        className="mt-3 inline-flex items-center gap-2 bg-char-950 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-warm-white hover:bg-brass"
      >
        <Save size={14} /> Save JSON & publish
      </button>
    </Panel>
  );
}
