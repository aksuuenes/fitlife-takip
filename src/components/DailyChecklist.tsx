import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Loader2, MoreHorizontal, Plus, Trash2, X } from 'lucide-react';
import BottomSheet from './ui/BottomSheet';
import { toDateKey } from '../lib/nutrition';

export interface ChecklistItem {
  id: string;
  name: string;
  dosage: string;
}

type Accent = 'sky' | 'indigo';

const ACCENT: Record<Accent, { text: string; bg: string; bar: string; button: string; ring: string }> = {
  sky: {
    text: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    bar: 'bg-sky-600 dark:bg-sky-500',
    button: 'bg-sky-600 active:bg-sky-700',
    ring: 'focus:ring-sky-500',
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    bar: 'bg-indigo-600 dark:bg-indigo-500',
    button: 'bg-indigo-600 active:bg-indigo-700',
    ring: 'focus:ring-indigo-500',
  },
};

interface Props {
  title: string;
  /** "İlaç", "Takviye" */
  itemLabel: string;
  accent: Accent;
  namePlaceholder: string;
  dosagePlaceholder: string;
  emptyText: string;
  doneText: string;
  /** Liste ve bugünün işaretleri yüklenir; profil değişince yeniden çağrılır */
  reloadKey: string;
  loadList: () => Promise<ChecklistItem[]>;
  saveList: (items: ChecklistItem[]) => Promise<void> | void;
  loadTaken: (date: string) => Promise<Record<string, boolean>>;
  saveTaken: (date: string, taken: Record<string, boolean>) => Promise<void> | void;
  renderIcon: (item: ChecklistItem, taken: boolean) => React.ReactNode;
}

type Editor = { mode: 'add' } | { mode: 'edit'; item: ChecklistItem };

/** Günlük ilaç / takviye listesi: dokun = alındı, ⋯ = düzenle/sil, alttaki düğme = ekle. */
export default function DailyChecklist(props: Props) {
  const { title, itemLabel, accent, reloadKey } = props;
  const a = ACCENT[accent];
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [taken, setTaken] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [today, setToday] = useState(() => toDateKey(new Date()));

  // Gece yarısı geçince (uygulama açık kalsa da) yeni güne geç
  useEffect(() => {
    const check = () => setToday(toDateKey(new Date()));
    const t = setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', check); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([props.loadList(), props.loadTaken(today)])
      .then(([list, map]) => { if (!cancelled) { setItems(list); setTaken(map || {}); } })
      .catch(err => console.error(`${title} yüklenemedi:`, err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, today]);

  const persistList = async (next: ChecklistItem[]) => {
    setItems(next);
    try { await props.saveList(next); } catch (err) { console.error(`${title} kaydedilemedi:`, err); }
  };

  const toggle = async (id: string) => {
    const next = { ...taken, [id]: !taken[id] };
    setTaken(next);
    try { await props.saveTaken(today, next); } catch (err) { console.error(`${title} işaretlenemedi:`, err); }
  };

  const handleSave = (name: string, dosage: string) => {
    if (!editor) return;
    if (editor.mode === 'add') {
      persistList([...items, { id: Math.random().toString(36).slice(2, 10), name, dosage }]);
    } else {
      persistList(items.map(i => (i.id === editor.item.id ? { ...i, name, dosage } : i)));
    }
    setEditor(null);
  };

  const handleDelete = (id: string) => {
    persistList(items.filter(i => i.id !== id));
    if (taken[id]) {
      const { [id]: _removed, ...rest } = taken;
      setTaken(rest);
      Promise.resolve(props.saveTaken(today, rest)).catch(() => {});
    }
    setEditor(null);
  };

  const total = items.length;
  const takenCount = items.filter(i => taken[i.id]).length;
  const allTaken = total > 0 && takenCount === total;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 className={`w-7 h-7 animate-spin mb-3 ${a.text}`} />
        <p className="text-slate-400 dark:text-slate-500 font-bold text-[11px]">{title} yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-5 md:p-7 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {title}
            {allTaken && <CheckCircle2 className="text-emerald-500 w-5 h-5" />}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Aldığında üstüne dokun</p>
        </div>
        <span className={`text-sm font-mono font-black px-2.5 py-1 rounded-xl shrink-0 ${a.text} ${a.bg}`}>
          {takenCount}/{total}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
        <motion.div
          initial={false}
          animate={{ width: `${total ? (takenCount / total) * 100 : 0}%` }}
          transition={{ type: 'tween', duration: 0.3 }}
          className={`h-full rounded-full ${allTaken ? 'bg-emerald-500' : a.bar}`}
        />
      </div>

      <div className="space-y-2 pt-4">
        {total === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">{props.emptyText}</p>
        )}

        {items.map(item => {
          const isTaken = !!taken[item.id];
          return (
            <div
              key={item.id}
              className={`flex items-center rounded-2xl border transition-colors ${
                isTaken
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
                  : 'bg-slate-50/60 dark:bg-slate-950/30 border-slate-100 dark:border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="flex-1 min-w-0 flex items-center gap-3 p-3 text-left active:scale-[0.99] transition-transform"
              >
                <span className={`p-2 rounded-xl border shrink-0 ${
                  isTaken
                    ? 'bg-white dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                }`}>
                  {props.renderIcon(item, isTaken)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`text-sm font-bold block truncate ${
                    isTaken ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'
                  }`}>
                    {item.name}
                  </span>
                  {item.dosage && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block truncate">{item.dosage}</span>
                  )}
                </span>
                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isTaken ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setEditor({ mode: 'edit', item })}
                aria-label={`${item.name} düzenle veya sil`}
                className="w-11 self-stretch flex items-center justify-center text-slate-400 dark:text-slate-500 active:text-slate-700 dark:active:text-slate-200 border-l border-slate-100 dark:border-slate-800 shrink-0"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setEditor({ mode: 'add' })}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 active:bg-slate-50 dark:active:bg-slate-800/50 text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> {itemLabel} ekle
        </button>
      </div>

      {allTaken && (
        <div className="mt-4 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <p className="text-emerald-800 dark:text-emerald-400 text-xs font-bold">{props.doneText}</p>
        </div>
      )}

      <AnimatePresence>
        {editor && (
          <React.Fragment key={editor.mode === 'edit' ? editor.item.id : 'new'}>
          <ItemEditor
            editor={editor}
            itemLabel={itemLabel}
            accent={a}
            namePlaceholder={props.namePlaceholder}
            dosagePlaceholder={props.dosagePlaceholder}
            onClose={() => setEditor(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemEditor({ editor, itemLabel, accent, namePlaceholder, dosagePlaceholder, onClose, onSave, onDelete }: {
  editor: Editor;
  itemLabel: string;
  accent: (typeof ACCENT)[Accent];
  namePlaceholder: string;
  dosagePlaceholder: string;
  onClose: () => void;
  onSave: (name: string, dosage: string) => void;
  onDelete: (id: string) => void;
}) {
  const editing = editor.mode === 'edit' ? editor.item : null;
  const [name, setName] = useState(editing?.name ?? '');
  const [dosage, setDosage] = useState(editing?.dosage ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canSave = name.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSave) onSave(name.trim(), dosage.trim());
  };

  const input = `w-full text-base font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${accent.ring}`;

  return (
    <BottomSheet onClose={onClose}>
      <form onSubmit={submit} className="overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
            {editing ? `${itemLabel} düzenle` : `${itemLabel} ekle`}
          </h3>
          <button type="button" onClick={onClose} aria-label="Kapat" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Adı</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={namePlaceholder} autoFocus={!editing} className={input} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Miktar / zaman (isteğe bağlı)</span>
          <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder={dosagePlaceholder} className={input} />
        </label>
        <button
          type="submit"
          disabled={!canSave}
          className={`w-full text-white text-sm font-bold py-3.5 rounded-2xl disabled:opacity-40 ${accent.button}`}
        >
          Kaydet
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => (confirmDelete ? onDelete(editing.id) : setConfirmDelete(true))}
            className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-3.5 rounded-2xl transition-colors ${
              confirmDelete ? 'bg-red-600 text-white' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete ? 'Silmek için tekrar dokun' : 'Listeden sil'}
          </button>
        )}
      </form>
    </BottomSheet>
  );
}
