import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Salad, ChevronRight } from 'lucide-react';
import { useMealStore, useNutritionGoals } from '../../hooks/useNutrition';
import { sumEntries, toDateKey } from '../../lib/nutrition';

/** Ana sayfadaki "bugün" beslenme kartı. */
export default function NutritionTodayCard() {
  const store = useMealStore();
  const { goals } = useNutritionGoals();
  const [totals, setTotals] = useState<{ kcal: number; protein: number } | null>(null);

  useEffect(() => {
    if (!store.ready) return;
    let cancelled = false;
    store.load(toDateKey(new Date()))
      .then(list => { if (!cancelled) { const t = sumEntries(list); setTotals({ kcal: Math.round(t.kcal), protein: Math.round(t.protein) }); } })
      .catch(() => { if (!cancelled) setTotals({ kcal: 0, protein: 0 }); });
    return () => { cancelled = true; };
  }, [store]);

  const kcal = totals?.kcal ?? 0;
  const pct = Math.min(100, (kcal / goals.kcal) * 100);
  const remaining = goals.kcal - kcal;
  const over = remaining < 0;

  return (
    <Link to="/nutrition"
      className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 active:scale-[0.99] transition-transform">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 text-white flex items-center justify-center shrink-0">
          <Salad className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Bugün beslenme</p>
          <p className="font-display font-black text-slate-900 dark:text-white tabular-nums">
            {totals ? kcal.toLocaleString('tr-TR') : '…'} <span className="text-xs text-slate-400 font-bold">/ {goals.kcal.toLocaleString('tr-TR')} kcal</span>
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xs font-black ${over ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {kcal === 0 ? 'Öğün ekle' : over ? `${Math.abs(remaining)} fazla` : `${remaining} kalan`}
          </p>
          {totals && totals.protein > 0 && <p className="text-[10px] font-bold text-slate-400">Protein {totals.protein}/{goals.protein} g</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
