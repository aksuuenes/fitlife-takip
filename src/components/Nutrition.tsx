import React, { useEffect, useMemo, useState } from 'react';
import { Salad, Sun, Soup, Moon, Apple, Plus, Minus, X, Search, Trash2, ChevronLeft, ChevronRight, Loader2, Pencil, Target, Check, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { MealEntry, MealType } from '../types';
import { FoodItem, FOOD_CATEGORY_LABELS, FoodCategory, TURKISH_FOODS, searchFoods } from '../lib/turkishFoods';
import { analyzeFoodPhoto, resizeImage, PhotoFoodItem } from '../services/aiService';

const MEALS: { type: MealType; label: string; icon: React.ElementType; tint: string }[] = [
  { type: 'breakfast', label: 'Kahvaltı', icon: Sun, tint: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  { type: 'lunch', label: 'Öğle', icon: Soup, tint: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
  { type: 'dinner', label: 'Akşam', icon: Moon, tint: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
  { type: 'snack', label: 'Ara Öğün', icon: Apple, tint: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
];

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

function ageFrom(birthDate?: string): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

export default function Nutrition() {
  const { user, profile, activeProfileId, currentProfile } = useAuth();
  const [date, setDate] = useState(() => new Date());
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [body, setBody] = useState<{ weight?: number; height?: number; age?: number }>({});
  const [sheetMeal, setSheetMeal] = useState<MealType | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState<number | null>(null);

  const dateKey = toDateKey(date);
  const isToday = dateKey === toDateKey(new Date());
  const goalKey = `fitlife_kcal_goal_${activeProfileId || 'local'}`;

  // Kayıtları yükle
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        let list: MealEntry[] = [];
        if (user && activeProfileId) list = await firebaseService.getMeals(user.uid, activeProfileId, dateKey);
        else if (activeProfileId) list = storageService.getMeals(dateKey, activeProfileId);
        if (!cancelled) setEntries(list);
      } catch (e) {
        console.error('Meal fetch error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, activeProfileId, dateKey]);

  // Vücut bilgileri (hedef hesaplamak için) ve kayıtlı özel hedef
  useEffect(() => {
    const loadBody = async () => {
      try {
        let latest: { weight?: number; height?: number; age?: number } | undefined;
        if (user && activeProfileId) {
          const records = await firebaseService.getHealthRecords(user.uid, activeProfileId);
          latest = records[0];
        } else if (activeProfileId) {
          const records = storageService.getRecords(activeProfileId);
          latest = records[records.length - 1];
        }
        setBody({
          weight: latest?.weight || currentProfile?.initialWeight || profile?.initialWeight,
          height: latest?.height || currentProfile?.initialHeight || profile?.initialHeight,
          age: latest?.age || ageFrom(currentProfile?.birthDate || profile?.birthDate) || undefined,
        });
      } catch (e) {
        console.error('Body data error:', e);
      }
    };
    loadBody();
    try {
      const saved = localStorage.getItem(goalKey);
      setCustomGoal(saved ? Number(saved) : null);
    } catch { setCustomGoal(null); }
  }, [user, activeProfileId, currentProfile, profile, goalKey]);

  // Günlük hedef: Mifflin-St Jeor, hafif aktivite, ~400 kcal açık
  const goals = useMemo(() => {
    const weight = body.weight || 70;
    const height = body.height || 170;
    const age = body.age || 30;
    const gender = currentProfile?.gender || profile?.gender;
    const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'female' ? -161 : 5);
    const tdee = bmr * 1.375;
    const auto = Math.max(1200, Math.round((tdee - 400) / 10) * 10);
    const kcal = customGoal && customGoal >= 800 ? customGoal : auto;
    const protein = Math.round(Math.min(weight * 1.6, (kcal * 0.35) / 4));
    const fat = Math.round((kcal * 0.28) / 9);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, fat, carbs, auto, isCustom: !!customGoal, hasBody: !!body.weight };
  }, [body, customGoal, currentProfile, profile]);

  const totals = useMemo(() => entries.reduce(
    (t, e) => ({ kcal: t.kcal + e.kcal, protein: t.protein + e.protein, carbs: t.carbs + e.carbs, fat: t.fat + e.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  ), [entries]);

  const persist = async (next: MealEntry[]) => {
    const prev = entries;
    setEntries(next);
    setSaving(true);
    try {
      if (user && activeProfileId) await firebaseService.saveMeals(user.uid, activeProfileId, dateKey, next);
      else if (activeProfileId) storageService.saveMeals(dateKey, next, activeProfileId);
    } catch (e) {
      console.error('Meal save error:', e);
      setEntries(prev);
      alert('Öğün kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const addEntry = (entry: Omit<MealEntry, 'id' | 'createdAt'>) => {
    persist([...entries, { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() }]);
  };
  const addEntries = (list: Omit<MealEntry, 'id' | 'createdAt'>[]) => {
    const now = new Date().toISOString();
    persist([...entries, ...list.map((e, i) => ({ ...e, id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`, createdAt: now }))]);
  };
  const removeEntry = (id: string) => persist(entries.filter(e => e.id !== id));

  const saveGoal = (value: number | null) => {
    try {
      if (value) localStorage.setItem(goalKey, String(value));
      else localStorage.removeItem(goalKey);
    } catch { /* yoksay */ }
    setCustomGoal(value);
    setEditingGoal(false);
  };

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
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1">
          <button onClick={() => shiftDay(-1)} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500" aria-label="Önceki gün">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-slate-700 dark:text-slate-200 px-1 min-w-[56px] text-center capitalize">{dateLabel}</span>
          <button onClick={() => shiftDay(1)} disabled={isToday} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-30" aria-label="Sonraki gün">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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
              {editingGoal ? (
                <GoalEditor initial={goals.kcal} auto={goals.auto} onSave={saveGoal} onCancel={() => setEditingGoal(false)} />
              ) : (
                <button onClick={() => setEditingGoal(true)} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Target className="w-3.5 h-3.5" />
                  Günlük hedef: {goals.kcal} kcal {goals.isCustom ? '(özel)' : goals.hasBody ? '(otomatik)' : '(varsayılan)'}
                  <Pencil className="w-3 h-3" />
                </button>
              )}
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
                            {item.servings !== 1 ? `${item.servings} × ` : ''}{item.portion} · P {round1(item.protein)} · K {round1(item.carbs)} · Y {round1(item.fat)}
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
        Besin değerleri ortalama porsiyonlara göre yaklaşıktır. Otomatik hedef; boy, kilo ve yaşına göre hafif aktivite ve haftada ~0,4 kg kayıp varsayımıyla hesaplanır.
      </p>

      <AnimatePresence>
        {sheetMeal && (
          <AddFoodSheet
            meal={sheetMeal}
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

function GoalEditor({ initial, auto, onSave, onCancel }: { initial: number; auto: number; onSave: (v: number | null) => void; onCancel: () => void }) {
  const [value, setValue] = useState(String(initial));
  const num = Number(value);
  const valid = num >= 800 && num <= 6000;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number" inputMode="numeric" value={value} onChange={e => setValue(e.target.value)}
        className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold"
      />
      <span className="text-xs text-slate-400">kcal</span>
      <button disabled={!valid} onClick={() => onSave(num)} className="p-1.5 rounded-lg bg-emerald-500 text-white disabled:opacity-40" aria-label="Kaydet"><Check className="w-4 h-4" /></button>
      <button onClick={onCancel} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500" aria-label="Vazgeç"><X className="w-4 h-4" /></button>
      <button onClick={() => onSave(null)} className="text-[11px] font-bold text-slate-400 underline">Otomatiğe dön ({auto})</button>
    </div>
  );
}

type NewEntry = Omit<MealEntry, 'id' | 'createdAt'>;

function AddFoodSheet({ meal, onClose, onAdd, onAddMany }: { meal: MealType; onClose: () => void; onAdd: (e: NewEntry) => void; onAddMany: (e: NewEntry[]) => void }) {
  const [tab, setTab] = useState<'search' | 'photo' | 'custom'>('search');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'all'>('all');
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [custom, setCustom] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '' });

  const mealLabel = MEALS.find(m => m.type === meal)?.label;
  const results = useMemo(() => {
    const base = query ? searchFoods(query, 50) : TURKISH_FOODS;
    return category === 'all' ? base : base.filter(f => f.category === category);
  }, [query, category]);

  const addSelected = () => {
    if (!selected) return;
    onAdd({
      meal, foodId: selected.id, name: selected.name, portion: selected.portion, servings,
      kcal: round1(selected.kcal * servings), protein: round1(selected.protein * servings),
      carbs: round1(selected.carbs * servings), fat: round1(selected.fat * servings),
    });
  };

  const addCustom = () => {
    const kcal = Number(custom.kcal);
    if (!custom.name.trim() || !(kcal >= 0)) return;
    onAdd({
      meal, name: custom.name.trim(), portion: '1 porsiyon', servings: 1, kcal,
      protein: Number(custom.protein) || 0, carbs: Number(custom.carbs) || 0, fat: Number(custom.fat) || 0,
    });
  };

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full md:max-w-lg max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-[28px] md:rounded-3xl shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">{mealLabel} · Besin ekle</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500" aria-label="Kapat"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 flex gap-1 mb-3">
          {(['search', 'photo', 'custom'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelected(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${tab === t ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {t === 'search' ? 'Listeden' : t === 'photo' ? '📷 Fotoğraf' : 'Elle gir'}
            </button>
          ))}
        </div>

        {tab === 'search' && !selected && (
          <>
            <div className="px-5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Örn. mercimek, simit, ayran…"
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
            <ul className="flex-1 overflow-y-auto px-3 pb-4">
              {results.length === 0 && (
                <li className="text-center text-sm text-slate-400 py-8">
                  Bulunamadı. <button className="text-emerald-600 font-bold underline" onClick={() => { setTab('custom'); setCustom(c => ({ ...c, name: query })); }}>Kendin ekle</button>
                </li>
              )}
              {results.map(food => (
                <li key={food.id}>
                  <button onClick={() => { setSelected(food); setServings(1); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{food.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{food.portion}</p>
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{food.kcal}</span>
                    <span className="text-[10px] text-slate-400">kcal</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'search' && selected && (
          <div className="px-5 pb-5 space-y-4">
            <button onClick={() => setSelected(null)} className="text-xs font-bold text-slate-400 flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Listeye dön</button>
            <div>
              <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">{selected.name}</h3>
              <p className="text-xs text-slate-400">{selected.portion}</p>
            </div>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl p-3">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Porsiyon</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setServings(s => Math.max(0.5, s - 0.5))} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Azalt"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center text-lg font-black tabular-nums">{servings}</span>
                <button onClick={() => setServings(s => Math.min(10, s + 0.5))} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Artır"><Plus className="w-4 h-4" /></button>
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

        {tab === 'photo' && <PhotoTab meal={meal} onAddMany={onAddMany} />}

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
      </motion.div>
    </motion.div>
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
        const servings = Math.max(0.5, Math.round((Number(it.servings) || 1) * 2) / 2);
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
        meal, foodId: it.food?.id, name: it.name, portion: it.food ? it.food.portion : it.portion,
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
                        <button onClick={() => update(it.key, { servings: Math.max(0.5, it.servings - 0.5) })} className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Azalt"><Minus className="w-3 h-3" /></button>
                        <span className="w-7 text-center text-xs font-black tabular-nums">{it.servings}</span>
                        <button onClick={() => update(it.key, { servings: Math.min(10, it.servings + 0.5) })} className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center" aria-label="Artır"><Plus className="w-3 h-3" /></button>
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
