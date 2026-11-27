import React, { useMemo, useState } from 'react';
import { RefreshCw, ShoppingCart, Check, CalendarPlus, Sun, Soup, Moon, Apple, ChevronLeft } from 'lucide-react';
import type { MealEntry, MealType } from '../../types';
import { Goals, addDays, round1, toDateKey } from '../../lib/nutrition';
import { MEAL_ORDER, PlanItem, generateWeekPlan, shoppingList } from '../../lib/mealPlans';
import { FOOD_CATEGORY_LABELS, servingsText } from '../../lib/turkishFoods';
import { useAuth } from '../../contexts/AuthContext';

type NewEntry = Omit<MealEntry, 'id' | 'createdAt'>;

const MEAL_META: Record<MealType, { label: string; icon: React.ElementType; tint: string }> = {
  breakfast: { label: 'Kahvaltı', icon: Sun, tint: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  lunch: { label: 'Öğle', icon: Soup, tint: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
  dinner: { label: 'Akşam', icon: Moon, tint: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' },
  snack: { label: 'Ara Öğün', icon: Apple, tint: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
};
const DAY_SHORT = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

const toEntry = (meal: MealType, it: PlanItem): NewEntry => ({
  meal, foodId: it.food.id, name: it.food.name, portion: it.food.portion, unit: it.food.unit, servings: it.servings,
  kcal: round1(it.food.kcal * it.servings), protein: round1(it.food.protein * it.servings),
  carbs: round1(it.food.carbs * it.servings), fat: round1(it.food.fat * it.servings),
});


function readLS<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}

export default function NutritionPlan({ goals, onApply }: { goals: Goals; onApply: (dateKey: string, list: NewEntry[]) => Promise<void> }) {
  const { activeProfileId } = useAuth();
  const pid = activeProfileId || 'local';
  const variantKey = `fitlife_plan_variant_${pid}`;
  const [variant, setVariant] = useState<number>(() => readLS(variantKey, 0));
  const [dayIdx, setDayIdx] = useState(0);
  const [showShopping, setShowShopping] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  const plan = useMemo(() => generateWeekPlan(goals.kcal, variant), [goals.kcal, variant]);
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)), []);
  const day = plan[dayIdx];
  const dateKey = toDateKey(dates[dayIdx]);

  const checkedKey = `fitlife_shopping_${pid}_${goals.kcal}_${variant}`;
  const [checked, setChecked] = useState<string[]>(() => readLS(checkedKey, []));
  const toggleChecked = (id: string) => {
    const next = checked.includes(id) ? checked.filter(x => x !== id) : [...checked, id];
    setChecked(next);
    try { localStorage.setItem(checkedKey, JSON.stringify(next)); } catch { /* yoksay */ }
  };

  const regenerate = () => {
    const v = variant + 1;
    setVariant(v);
    setChecked(readLS(`fitlife_shopping_${pid}_${goals.kcal}_${v}`, []));
    try { localStorage.setItem(variantKey, JSON.stringify(v)); } catch { /* yoksay */ }
  };

  const apply = async (what: MealType | 'all') => {
    const meals = what === 'all' ? MEAL_ORDER : [what];
    setApplying(what);
    try {
      await onApply(dateKey, meals.flatMap(m => day.meals[m].map(it => toEntry(m, it))));
    } finally {
      setApplying(null);
    }
  };

  if (showShopping) {
    const list = shoppingList(plan);
    const groups = list.reduce<Record<string, typeof list>>((g, it) => {
      (g[it.food.category] ||= []).push(it);
      return g;
    }, {});
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowShopping(false)} className="text-xs font-bold text-slate-400 flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Plana dön</button>
          <span className="text-[11px] font-black text-slate-400">{checked.length}/{list.length} alındı</span>
        </div>
        <h3 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-500" /> Haftalık alışveriş listesi
        </h3>
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{FOOD_CATEGORY_LABELS[cat as keyof typeof FOOD_CATEGORY_LABELS]}</p>
            {items.map(it => {
              const done = checked.includes(it.food.id);
              return (
                <button key={it.food.id} onClick={() => toggleChecked(it.food.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left border-t border-slate-50 dark:border-slate-800/60 first:border-t-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200 dark:border-slate-700'}`}>
                    {done && <Check className="w-4 h-4" />}
                  </span>
                  <span className={`flex-1 text-sm font-bold ${done ? 'line-through text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}>{it.food.name}</span>
                  <span className="text-[11px] text-slate-400 text-right">{servingsText(round1(it.servings), it.food.unit, it.food.portion)}</span>
                </button>
              );
            })}
          </div>
        ))}
        <p className="text-[10px] text-center text-slate-400">Miktarlar 7 günlük planın toplamıdır (porsiyon cinsinden).</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-black text-slate-900 dark:text-white">7 günlük menü</h3>
            <p className="text-[11px] text-slate-400">Günlük {goals.kcal} kcal hedefine göre</p>
          </div>
          <button onClick={regenerate} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 active:scale-95">
            <RefreshCw className="w-3.5 h-3.5" /> Değiştir
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dates.map((d, i) => (
            <button key={i} onClick={() => setDayIdx(i)}
              className={`py-2 rounded-xl flex flex-col items-center transition-colors ${dayIdx === i ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
              <span className="text-[10px] font-black">{i === 0 ? 'Bugün' : DAY_SHORT[d.getDay()]}</span>
              <span className="text-sm font-black tabular-nums">{d.getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      {MEAL_ORDER.map(meal => {
        const items = day.meals[meal];
        const meta = MEAL_META[meal];
        const Icon = meta.icon;
        const kcal = items.reduce((s, x) => s + x.food.kcal * x.servings, 0);
        return (
          <div key={meal} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.tint}`}><Icon className="w-4 h-4" /></div>
              <h4 className="flex-1 font-display font-black text-slate-900 dark:text-white">{meta.label}</h4>
              <span className="text-sm font-black text-slate-600 dark:text-slate-300 tabular-nums">{Math.round(kcal)} <span className="text-[10px] text-slate-400">kcal</span></span>
              <button onClick={() => apply(meal)} disabled={!!applying} aria-label={`${meta.label} günlüğe ekle`}
                className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center disabled:opacity-40">
                <CalendarPlus className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-1 pl-12">
              {items.map(it => (
                <li key={it.food.id} className="text-sm text-slate-700 dark:text-slate-200 flex justify-between gap-2">
                  <span>{it.food.name} <span className="text-slate-400 text-xs">· {servingsText(it.servings, it.food.unit, it.food.portion)}</span></span>
                  <span className="text-xs text-slate-400 tabular-nums shrink-0">{Math.round(it.food.kcal * it.servings)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
        <span>Gün toplamı: <b className="text-slate-900 dark:text-white">{day.kcal} kcal</b></span>
        <span>Protein: <b className="text-slate-900 dark:text-white">{day.protein} g</b></span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowShopping(true)}
          className="py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm flex items-center justify-center gap-2">
          <ShoppingCart className="w-4 h-4" /> Alışveriş listesi
        </button>
        <button onClick={() => apply('all')} disabled={!!applying}
          className="py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          <CalendarPlus className="w-4 h-4" /> {dayIdx === 0 ? 'Bugüne uygula' : 'Bu güne uygula'}
        </button>
      </div>
      <p className="text-[10px] text-center text-slate-400 px-4">
        Bu menü genel bir örnektir; sağlık durumun, alerjin veya özel bir diyetin varsa bir diyetisyene danış.
      </p>
    </div>
  );
}
