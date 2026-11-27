import React, { useEffect, useMemo, useState } from 'react';
import { Salad, Sun, Soup, Moon, Apple, Plus, Minus, X, Search, Trash2, ChevronLeft, ChevronRight, Loader2, Pencil, Target, Check, Camera, Sparkles, AlertCircle, Star, Clock, Copy, CalendarDays, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MealEntry, MealType } from '../types';
import { FoodItem, FOOD_CATEGORY_LABELS, FoodCategory, TURKISH_FOODS, searchFoods, servingsText, unitStep, unitTitle } from '../lib/turkishFoods';
import { analyzeFoodPhoto, resizeImage, PhotoFoodItem, isAIEnabled } from '../services/aiService';
import { useMealStore, useNutritionGoals } from '../hooks/useNutrition';
import { QuickFood, addDays, entryToQuick, pushRecent, quickKey, round1, sumEntries, toDateKey, toggleFavorite } from '../lib/nutrition';
import GoalSheet from './nutrition/GoalSheet';
import NutritionWeekly from './nutrition/NutritionWeekly';
import NutritionPlan from './nutrition/NutritionPlan';
import BottomSheet from './ui/BottomSheet';

const MEALS: { type: MealType; label: string; icon: React.ElementType; tint: string }[] = [
  { type: 'breakfast', label: 'Kahvaltı', icon: Sun, tint: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  { type: 'lunch', label: 'Öğle', icon: Soup, tint: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
  { type: 'dinner', label: 'Akşam', icon: Moon, tint: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
  { type: 'snack', label: 'Ara Öğün', icon: Apple, tint: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
];

export default function Nutrition() {
  const [view, setView] = useState<'day' | 'week' | 'plan'>('day');
  const [date, setDate] = useState(() => new Date());
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [yesterday, setYesterday] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetMeal, setSheetMeal] = useState<MealType | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const store = useMealStore();
  const { goals, body, records, settings, update } = useNutritionGoals();

  const dateKey = toDateKey(date);
  const isToday = dateKey === toDateKey(new Date());

  // Seçili günün ve bir önceki günün öğünleri
  useEffect(() => {
    if (!store.ready) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [list, prev] = await Promise.all([store.load(dateKey), store.load(toDateKey(addDays(date, -1)))]);
        if (!cancelled) { setEntries(list); setYesterday(prev); }
      } catch (e) {
        console.error('Meal fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [store, dateKey]);

  const totals = useMemo(() => sumEntries(entries), [entries]);

  const persist = async (next: MealEntry[]) => {
    const prev = entries;
    setEntries(next);
    setSaving(true);
    try {
      await store.save(dateKey, next);
    } catch (e) {
      console.error('Meal save error:', e);
      setEntries(prev);
      alert('Öğün kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const rememberRecents = (list: NewEntry[]) => {
    update(s => ({ recents: list.reduce((r, e) => pushRecent(r, entryToQuick(e as MealEntry)), s.recents) }));
  };

  // Plan sekmesinden: belirli bir güne öğün ekle
  const applyToDate = async (key: string, list: NewEntry[]) => {
    const now = new Date().toISOString();
    const withIds = list.map((e, i) => ({ ...e, id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`, createdAt: now }));
    if (key === dateKey) {
      await persist([...entries, ...withIds]);
    } else {
      const existing = await store.load(key);
      await store.save(key, [...existing, ...withIds]);
    }
    setDate(new Date(key + 'T12:00:00'));
    setView('day');
  };

  const addEntry = (entry: Omit<MealEntry, 'id' | 'createdAt'>) => {
    rememberRecents([entry]);
    persist([...entries, { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() }]);
  };
  const addEntries = (list: Omit<MealEntry, 'id' | 'createdAt'>[]) => {
    rememberRecents(list);
    const now = new Date().toISOString();
    persist([...entries, ...list.map((e, i) => ({ ...e, id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`, createdAt: now }))]);
  };
  const removeEntry = (id: string) => persist(entries.filter(e => e.id !== id));

  const shiftDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    if (d > new Date()) return;
    setDate(d);
  };

  const remaining = goals.kcal - totals.kcal;
  const progress = Math.min(totals.kcal / goals.kcal, 1);
  const over = remaining < 0;
  const R = 70;
  const C = 2 * Math.PI * R;

  const dateLabel = isToday
    ? 'Bugün'
    : date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-8">
      {/* Başlık + tarih */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-white shadow-md shadow-emerald-100 dark:shadow-none">
            <Salad className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">Beslenme</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Öğünlerini kaydet, hedefini takip et</p>
          </div>
        </div>
        {view === 'day' && (
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1">
          <button onClick={() => shiftDay(-1)} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500" aria-label="Önceki gün">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-slate-700 dark:text-slate-200 px-1 min-w-[56px] text-center capitalize">{dateLabel}</span>
          <button onClick={() => shiftDay(1)} disabled={isToday} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30" aria-label="Sonraki gün">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        )}
      </div>

      {/* Görünüm seçici */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        {([
          ['day', 'Günlük', Salad],
          ['week', 'Hafta', CalendarDays],
          ['plan', 'Plan', ClipboardList],
        ] as const).map(([v, label, Icon]) => (
          <button key={v} onClick={() => setView(v)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-colors ${view === v ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {view === 'week' && (
        <NutritionWeekly goals={goals} body={body} records={records} settings={settings} onEditGoal={() => setGoalOpen(true)} />
      )}
      {view === 'plan' && (
        <NutritionPlan goals={goals} onApply={applyToDate} />
      )}

      {view === 'day' && (<>
      {/* Özet kartı */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100/40 dark:shadow-none">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-44 h-44 shrink-0">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r={R} fill="none" strokeWidth="14" className="stroke-slate-100 dark:stroke-slate-800" />
              <motion.circle
                cx="80" cy="80" r={R} fill="none" strokeWidth="14" strokeLinecap="round"
                className={over ? 'stroke-rose-500' : 'stroke-emerald-500'}
                strokeDasharray={C}
                initial={false}
                animate={{ strokeDashoffset: C * (1 - progress) }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {loading ? (
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              ) : (
                <>
                  <span className="text-3xl font-display font-black text-slate-900 dark:text-white tabular-nums">{Math.round(totals.kcal)}</span>
                  <span className="text-[11px] font-bold text-slate-400">/ {goals.kcal} kcal</span>
                  <span className={`mt-1 text-[11px] font-black ${over ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {over ? `${Math.abs(Math.round(remaining))} fazla` : `${Math.round(remaining)} kalan`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <MacroBar label="Protein" value={totals.protein} goal={goals.protein} color="bg-sky-500" />
            <MacroBar label="Karbonhidrat" value={totals.carbs} goal={goals.carbs} color="bg-amber-500" />
            <MacroBar label="Yağ" value={totals.fat} goal={goals.fat} color="bg-rose-400" />

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setGoalOpen(true)} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <Target className="w-3.5 h-3.5" />
                Günlük hedef: {goals.kcal} kcal {goals.mode === 'custom' ? '(elle)' : goals.mode === 'target' ? `(hedef ${settings.targetWeight} kg)` : goals.hasBody ? '(otomatik)' : '(varsayılan)'}
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Öğünler */}
      <div className="space-y-3">
        {MEALS.map(meal => {
          const items = entries.filter(e => e.meal === meal.type);
          const mealKcal = items.reduce((s, e) => s + e.kcal, 0);
          const Icon = meal.icon;
          return (
            <div key={meal.type} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${meal.tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-black text-slate-900 dark:text-white">{meal.label}</h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    {items.length ? `${items.length} besin` : 'Henüz eklenmedi'}
                  </p>
                </div>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{Math.round(mealKcal)} <span className="text-[10px] text-slate-400">kcal</span></span>
                <button
                  onClick={() => setSheetMeal(meal.type)}
                  className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center transition-all shadow-sm"
                  aria-label={`${meal.label} için besin ekle`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {items.length > 0 && (
                <ul className="border-t border-slate-50 dark:border-slate-800/80">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 border-slate-50 dark:border-slate-800/60"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {servingsText(item.servings, item.unit, item.portion)} · P {round1(item.protein)} · K {round1(item.carbs)} · Y {round1(item.fat)}
                          </p>
                        </div>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">{Math.round(item.kcal)}</span>
                        <button onClick={() => removeEntry(item.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" aria-label="Sil">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {saving && (
        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Kaydediliyor
        </p>
      )}

      <p className="text-[10px] text-center text-slate-400 dark:text-slate-600 px-6">
        Besin değerleri ortalama porsiyonlara göre yaklaşıktır. Hedef; boy, kilo, yaş ve hafif aktivite varsayımıyla hesaplanır.
      </p>
      </>)}

      <AnimatePresence>
        {goalOpen && (
          <GoalSheet goals={goals} body={body} settings={settings} onSave={update} onClose={() => setGoalOpen(false)} />
        )}
        {sheetMeal && (
          <AddFoodSheet
            meal={sheetMeal}
            favorites={settings.favorites}
            recents={settings.recents}
            onToggleFavorite={(q) => update(s => ({ favorites: toggleFavorite(s.favorites, q) }))}
            yesterday={yesterday.filter(e => e.meal === sheetMeal)}
            onClose={() => setSheetMeal(null)}
            onAdd={(entry) => { addEntry(entry); setSheetMeal(null); }}
            onAddMany={(list) => { addEntries(list); setSheetMeal(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[11px] font-bold mb-1">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-400 tabular-nums">{Math.round(value)} / {goal} g</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  );
}

type NewEntry = Omit<MealEntry, 'id' | 'createdAt'>;

const foodToQuick = (f: FoodItem): QuickFood => ({
  foodId: f.id, name: f.name, portion: f.portion, unit: f.unit, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
});

function FoodRow({ item, fav, onPick, onQuickAdd }: { item: QuickFood; fav: boolean; onPick: () => void; onQuickAdd: () => void }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
      <button onClick={onPick} className="flex-1 min-w-0 flex items-center gap-3 pl-3 py-3 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
            {fav && <Star className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" />}{item.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate">{item.portion}</p>
        </div>
        <span className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{Math.round(item.kcal)}</span>
        <span className="text-[10px] text-slate-400">kcal</span>
      </button>
      <button onClick={onQuickAdd} aria-label={`${item.name} ekle`}
        className="w-9 h-9 mr-2 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center active:scale-95">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

function QuickSection({ title, icon: Icon, items, isFav, onPick, onQuickAdd }: {
  title: string; icon: React.ElementType; items: QuickFood[]; isFav: (q: QuickFood) => boolean;
  onPick: (q: QuickFood) => void; onQuickAdd: (q: QuickFood) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-2">
      <p className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {title}
      </p>
      {items.map(q => (
        <div key={quickKey(q)}>
          <FoodRow item={q} fav={isFav(q)} onPick={() => onPick(q)} onQuickAdd={() => onQuickAdd(q)} />
        </div>
      ))}
    </div>
  );
}

function AddFoodSheet({ meal, favorites, recents, onToggleFavorite, yesterday, onClose, onAdd, onAddMany }: {
  meal: MealType;
  favorites: QuickFood[];
  recents: QuickFood[];
  onToggleFavorite: (q: QuickFood) => void;
  yesterday: MealEntry[];
  onClose: () => void;
  onAdd: (e: NewEntry) => void;
  onAddMany: (e: NewEntry[]) => void;
}) {
  const [tab, setTab] = useState<'search' | 'photo' | 'custom'>('search');
  const [photoEnabled, setPhotoEnabled] = useState(false);
  useEffect(() => { isAIEnabled().then(setPhotoEnabled); }, []);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'all'>('all');
  const [selected, setSelected] = useState<QuickFood | null>(null);
  const [servings, setServings] = useState(1);
  const [custom, setCustom] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '' });

  const mealLabel = MEALS.find(m => m.type === meal)?.label;
  const results = useMemo(() => {
    const base = query ? searchFoods(query, 50) : TURKISH_FOODS;
    return category === 'all' ? base : base.filter(f => f.category === category);
  }, [query, category]);

  const favKeys = useMemo(() => new Set(favorites.map(quickKey)), [favorites]);
  const isFav = (q: QuickFood) => favKeys.has(quickKey(q));
  const showQuick = !query && category === 'all';
  const yesterdayKcal = yesterday.reduce((t, e) => t + e.kcal, 0);

  const toEntry = (q: QuickFood, n: number): NewEntry => ({
    meal, foodId: q.foodId, name: q.name, portion: q.portion, unit: q.unit, servings: n,
    kcal: round1(q.kcal * n), protein: round1(q.protein * n), carbs: round1(q.carbs * n), fat: round1(q.fat * n),
  });
  const addSelected = () => { if (selected) onAdd(toEntry(selected, servings)); };
  const copyYesterday = () => onAddMany(yesterday.map(({ id, createdAt, ...rest }) => ({ ...rest, meal })));

  const addCustom = () => {
    const kcal = Number(custom.kcal);
    if (!custom.name.trim() || !(kcal >= 0)) return;
    onAdd({
      meal, name: custom.name.trim(), portion: '1 porsiyon', servings: 1, kcal,
      protein: Number(custom.protein) || 0, carbs: Number(custom.carbs) || 0, fat: Number(custom.fat) || 0,
    });
  };

  return (
    <BottomSheet onClose={onClose}>
        <div className="flex items-center justify-between p-5 pb-3 shrink-0">
          <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">{mealLabel} · Besin ekle</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500" aria-label="Kapat"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 flex gap-1 mb-3 shrink-0">
          {(photoEnabled ? (['search', 'photo', 'custom'] as const) : (['search', 'custom'] as const)).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${tab === t ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {t === 'search' ? 'Listeden' : t === 'photo' ? '📷 Fotoğraf' : 'Elle gir'}
            </button>
          ))}
        </div>

        {tab === 'search' && !selected && (
          <>
            <div className="px-5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Örn. mercimek, simit, ayran…"
                  className="w-full pl-9 pr-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/40" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto py-3 -mx-5 px-5 no-scrollbar">
                {(['all', ...Object.keys(FOOD_CATEGORY_LABELS)] as (FoodCategory | 'all')[]).map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${category === c ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                    {c === 'all' ? 'Tümü' : FOOD_CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {showQuick && yesterday.length > 0 && (
                <button onClick={copyYesterday}
                  className="w-full mb-3 flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-left active:scale-[0.99] transition-transform">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0"><Copy className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">Dünden kopyala · {mealLabel}</p>
                    <p className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70 truncate">{yesterday.map(e => e.name).join(', ')}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 tabular-nums">{Math.round(yesterdayKcal)}</span>
                </button>
              )}
              {showQuick && favorites.length > 0 && (
                <QuickSection title="Favoriler" icon={Star} items={favorites} isFav={isFav}
                  onPick={q => { setSelected(q); setServings(1); }} onQuickAdd={q => onAdd(toEntry(q, 1))} />
              )}
              {showQuick && recents.length > 0 && (
                <QuickSection title="Son yediklerin" icon={Clock} items={recents.filter(r => !isFav(r)).slice(0, 8)} isFav={isFav}
                  onPick={q => { setSelected(q); setServings(1); }} onQuickAdd={q => onAdd(toEntry(q, 1))} />
              )}
              {showQuick && (favorites.length > 0 || recents.length > 0) && (
                <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Tüm besinler</p>
              )}
              <ul>
                {results.length === 0 && (
                  <li className="text-center text-sm text-slate-400 py-8">
                    Bulunamadı. <button className="text-emerald-600 font-bold underline" onClick={() => { setTab('custom'); setCustom(c => ({ ...c, name: query })); }}>Kendin ekle</button>
                  </li>
                )}
                {results.map(food => {
                  const q = foodToQuick(food);
                  return (
                    <li key={food.id}>
                      <FoodRow item={q} fav={isFav(q)} onPick={() => { setSelected(q); setServings(1); }} onQuickAdd={() => onAdd(toEntry(q, 1))} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {tab === 'search' && selected && (
          <div className="px-5 pb-5 space-y-4 overflow-y-auto">
            <button onClick={() => setSelected(null)} className="text-xs font-bold text-slate-400 flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Listeye dön</button>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">{selected.name}</h3>
                <p className="text-xs text-slate-400">{selected.portion}</p>
              </div>
              <button onClick={() => onToggleFavorite(selected)} aria-label={isFav(selected) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isFav(selected) ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                <Star className="w-5 h-5" fill={isFav(selected) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl p-3">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{unitTitle(selected.unit)}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setServings(s => Math.max(unitStep(selected.unit), s - unitStep(selected.unit)))} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Azalt"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center text-lg font-black tabular-nums">{String(servings).replace('.', ',')}</span>
                <button onClick={() => setServings(s => Math.min(20, s + unitStep(selected.unit)))} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Artır"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ['kcal', selected.kcal * servings, 'text-emerald-600 dark:text-emerald-400'],
                ['Protein', selected.protein * servings, 'text-sky-500'],
                ['Karb.', selected.carbs * servings, 'text-amber-500'],
                ['Yağ', selected.fat * servings, 'text-rose-400'],
              ].map(([l, v, c]) => (
                <div key={l as string} className="bg-slate-50 dark:bg-slate-800 rounded-2xl py-3">
                  <p className={`text-lg font-black tabular-nums ${c}`}>{l === 'kcal' ? Math.round(v as number) : round1(v as number)}</p>
                  <p className="text-[10px] font-bold text-slate-400">{l}{l !== 'kcal' ? ' (g)' : ''}</p>
                </div>
              ))}
            </div>
            <button onClick={addSelected} className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black active:scale-[0.99] transition-all">
              Ekle
            </button>
          </div>
        )}

        {tab === 'photo' && photoEnabled && <PhotoTab meal={meal} onAddMany={onAddMany} />}

        {tab === 'custom' && (
          <div className="px-5 pb-5 space-y-3 overflow-y-auto">
            <Field label="Besin adı" value={custom.name} onChange={v => setCustom(c => ({ ...c, name: v }))} placeholder="Örn. Annemin böreği" text />
            <Field label="Kalori (kcal)" value={custom.kcal} onChange={v => setCustom(c => ({ ...c, kcal: v }))} placeholder="0" />
            <div className="grid grid-cols-3 gap-2">
              <Field label="Protein (g)" value={custom.protein} onChange={v => setCustom(c => ({ ...c, protein: v }))} placeholder="0" />
              <Field label="Karb. (g)" value={custom.carbs} onChange={v => setCustom(c => ({ ...c, carbs: v }))} placeholder="0" />
              <Field label="Yağ (g)" value={custom.fat} onChange={v => setCustom(c => ({ ...c, fat: v }))} placeholder="0" />
            </div>
            <button onClick={addCustom} disabled={!custom.name.trim() || custom.kcal === ''}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black disabled:opacity-40 transition-all">
              Ekle
            </button>
          </div>
        )}
    </BottomSheet>
  );
}

function Field({ label, value, onChange, placeholder, text }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; text?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type={text ? 'text' : 'number'} inputMode={text ? 'text' : 'decimal'} min={0}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/40"
      />
    </label>
  );
}

type ReviewItem = PhotoFoodItem & { key: string; checked: boolean; baseServings: number; food?: FoodItem };

function scaleItem(it: ReviewItem) {
  if (it.food) {
    return {
      kcal: it.food.kcal * it.servings, protein: it.food.protein * it.servings,
      carbs: it.food.carbs * it.servings, fat: it.food.fat * it.servings,
    };
  }
  const k = it.baseServings > 0 ? it.servings / it.baseServings : 1;
  return { kcal: it.kcal * k, protein: it.protein * k, carbs: it.carbs * k, fat: it.fat * k };
}

function PhotoTab({ meal, onAddMany }: { meal: MealType; onAddMany: (e: NewEntry[]) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [note, setNote] = useState<string | undefined>();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const galleryRef = React.useRef<HTMLInputElement>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    setStatus('loading'); setError(''); setItems([]); setNote(undefined);
    try {
      const img = await resizeImage(file);
      setPreview(img.preview);
      const catalog = TURKISH_FOODS.map(f => `${f.id}|${f.name}|${f.portion}`);
      const result = await analyzeFoodPhoto(img.data, img.mediaType, catalog);
      const list: ReviewItem[] = (result.items || []).map((it, i) => {
        const food = it.foodId ? TURKISH_FOODS.find(f => f.id === it.foodId) : undefined;
        const step = unitStep(food?.unit);
        const servings = Math.max(step, Math.round((Number(it.servings) || 1) / step) * step);
        return {
          ...it,
          name: food?.name || it.name,
          portion: food?.portion || it.portion || '1 porsiyon',
          kcal: Number(it.kcal) || 0, protein: Number(it.protein) || 0,
          carbs: Number(it.carbs) || 0, fat: Number(it.fat) || 0,
          servings, baseServings: servings, food, key: `${i}-${it.name}`, checked: true,
        };
      });
      setItems(list);
      setNote(result.note);
      setStatus('done');
    } catch (e: any) {
      setError(e?.message || 'Fotoğraf analiz edilemedi');
      setStatus('error');
    }
  };

  const update = (key: string, patch: Partial<ReviewItem>) =>
    setItems(list => list.map(it => (it.key === key ? { ...it, ...patch } : it)));

  const selected = items.filter(i => i.checked);
  const total = selected.reduce((s, it) => s + scaleItem(it).kcal, 0);

  const save = () => {
    onAddMany(selected.map(it => {
      const v = scaleItem(it);
      return {
        meal, foodId: it.food?.id, name: it.name, portion: it.food ? it.food.portion : it.portion, unit: it.food?.unit,
        servings: it.food ? it.servings : 1,
        kcal: round1(v.kcal), protein: round1(v.protein), carbs: round1(v.carbs), fat: round1(v.fat),
      };
    }));
  };

  const reset = () => { setPreview(null); setItems([]); setStatus('idle'); setError(''); setNote(undefined); };

  return (
    <div className="px-5 pb-5 overflow-y-auto space-y-4">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => { onFile(e.target.files?.[0]); e.target.value = ''; }} />

      {status === 'idle' && (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <p className="font-display font-black text-slate-900 dark:text-white">Tabağının fotoğrafını çek</p>
            <p className="text-xs text-slate-400 mt-1">Claude yemekleri ve porsiyonları tahmin eder, sen kontrol edip kaydedersin.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => cameraRef.current?.click()} className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black">Fotoğraf çek</button>
            <button onClick={() => galleryRef.current?.click()} className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-black">Galeriden seç</button>
          </div>
        </div>
      )}

      {preview && (
        <img src={preview} alt="Yemek fotoğrafı" className="w-full max-h-48 object-cover rounded-3xl" />
      )}

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm font-bold text-slate-500">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" /> Claude tabağı inceliyor…
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-4 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Analiz yapılamadı</p>
            <p className="text-xs opacity-80">{error}</p>
            <button onClick={reset} className="mt-2 text-xs font-black underline">Tekrar dene</button>
          </div>
        </div>
      )}

      {status === 'done' && (
        <>
          {items.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-4">
              {note || 'Fotoğrafta yiyecek bulunamadı.'}
              <button onClick={reset} className="block mx-auto mt-2 text-emerald-600 font-bold underline">Başka fotoğraf dene</button>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-bold text-slate-400">Bulunanlar. Kontrol et, yanlış olanların işaretini kaldır:</p>
              <ul className="space-y-2">
                {items.map(it => {
                  const v = scaleItem(it);
                  return (
                    <li key={it.key} className={`rounded-2xl border p-3 flex items-center gap-2.5 transition-opacity ${it.checked ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/5' : 'border-slate-100 dark:border-slate-800 opacity-50'}`}>
                      <button onClick={() => update(it.key, { checked: !it.checked })}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${it.checked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`} aria-label="Seç">
                        {it.checked && <Check className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-100 line-clamp-2">{it.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {it.confidence === 'düşük' ? 'emin değil · ' : ''}{it.food ? it.food.portion : it.portion}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => update(it.key, { servings: Math.max(unitStep(it.food?.unit), it.servings - unitStep(it.food?.unit)) })} className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Azalt"><Minus className="w-3 h-3" /></button>
                        <span className="w-7 text-center text-xs font-black tabular-nums">{it.servings}</span>
                        <button onClick={() => update(it.key, { servings: Math.min(20, it.servings + unitStep(it.food?.unit)) })} className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Artır"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="w-10 text-right text-sm font-black tabular-nums text-slate-700 dark:text-slate-200">{Math.round(v.kcal)}</span>
                    </li>
                  );
                })}
              </ul>
              {note && <p className="text-[11px] text-slate-400">{note}</p>}
              <div className="flex gap-2">
                <button onClick={reset} className="py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-sm">Yeniden</button>
                <button onClick={save} disabled={selected.length === 0} className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black disabled:opacity-40">
                  {selected.length} besini ekle · {Math.round(total)} kcal
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400">Fotoğraftan tahminler yaklaşıktır; porsiyonları kontrol etmeyi unutma.</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
