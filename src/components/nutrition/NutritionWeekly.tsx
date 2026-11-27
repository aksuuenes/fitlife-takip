import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Loader2, Target, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import { useMealStore } from '../../hooks/useNutrition';
import {
  BodyStats, Goals, NutritionSettings, actualWeeklyTrend, addDays, dayOnTarget, lastNDays,
  projectWeight, sumEntries, targetStreak, toDateKey, KCAL_PER_KG,
} from '../../lib/nutrition';

const DAY_SHORT = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

export default function NutritionWeekly({ goals, body, records, settings, onEditGoal }: {
  goals: Goals;
  body: BodyStats;
  records: { date: string; weight: number }[];
  settings: NutritionSettings;
  onEditGoal: () => void;
}) {
  const store = useMealStore();
  const [days, setDays] = useState<{ key: string; date: Date; kcal: number; protein: number }[] | null>(null);

  // Seri için son 30 günü, grafik için son 7 günü kullan
  useEffect(() => {
    if (!store.ready) return;
    let cancelled = false;
    (async () => {
      const dates = lastNDays(30);
      const lists = await Promise.all(dates.map(d => store.load(toDateKey(d)).catch(() => [])));
      if (cancelled) return;
      setDays(dates.map((d, i) => {
        const t = sumEntries(lists[i]);
        return { key: toDateKey(d), date: d, kcal: Math.round(t.kcal), protein: Math.round(t.protein) };
      }));
    })();
    return () => { cancelled = true; };
  }, [store]);

  const week = days?.slice(-7) ?? [];
  const logged = week.filter(d => d.kcal > 0);
  const avg = logged.length ? Math.round(logged.reduce((s, d) => s + d.kcal, 0) / logged.length) : 0;
  const avgProtein = logged.length ? Math.round(logged.reduce((s, d) => s + d.protein, 0) / logged.length) : 0;
  const onTarget = week.filter(d => dayOnTarget(d.kcal, goals)).length;
  const streak = days ? targetStreak(days, goals) : 0;
  const maxKcal = Math.max(goals.kcal * 1.3, ...week.map(d => d.kcal), 1);
  const todayKey = toDateKey(new Date());

  return (
    <div className="space-y-4">
      {/* Haftalık kalori grafiği */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-slate-900 dark:text-white">Son 7 gün</h3>
          <span className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${streak > 0 ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Flame className="w-3.5 h-3.5" /> {streak} gün seri
          </span>
        </div>

        {!days ? (
          <div className="h-40 flex items-center justify-center"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div>
        ) : (
          <>
            <div className="relative h-40 flex items-end gap-2">
              <div className="absolute inset-x-0 border-t-2 border-dashed border-emerald-300/70 dark:border-emerald-500/40"
                style={{ bottom: `${(goals.kcal / maxKcal) * 100}%` }}>
                <span className="absolute left-0 -top-4 text-[9px] font-black text-emerald-500 bg-white dark:bg-slate-900 pr-1">hedef {goals.kcal}</span>
              </div>
              {week.map(d => {
                const h = (d.kcal / maxKcal) * 100;
                const ok = dayOnTarget(d.kcal, goals);
                const isToday = d.key === todayKey;
                return (
                  <div key={d.key} className="flex-1 h-full flex flex-col justify-end items-center gap-1">
                    {d.kcal > 0 && <span className="text-[9px] font-bold text-slate-400 tabular-nums">{d.kcal}</span>}
                    <div className={`w-full rounded-lg transition-all ${d.kcal === 0 ? 'bg-slate-100 dark:bg-slate-800' : ok ? 'bg-emerald-500' : d.kcal > goals.kcal * 1.1 ? 'bg-rose-400' : isToday ? 'bg-emerald-200 dark:bg-emerald-500/30' : 'bg-amber-400'}`}
                      style={{ height: d.kcal === 0 ? '4px' : `${Math.max(h, 4)}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-1.5">
              {week.map(d => (
                <span key={d.key} className={`flex-1 text-center text-[10px] font-black ${d.key === todayKey ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {d.key === todayKey ? 'Bugün' : DAY_SHORT[d.date.getDay()]}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-500" /> hedefte</span>
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-amber-400" /> az</span>
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-200 dark:bg-emerald-500/30" /> bugün (devam ediyor)</span>
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-rose-400" /> fazla</span>
            </div>
          </>
        )}
      </div>

      {/* Özet sayılar */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Ort. kalori" value={avg ? avg.toLocaleString('tr-TR') : '—'} sub="kcal/gün" />
        <Stat label="Hedefte" value={`${onTarget}/7`} sub="gün" />
        <Stat label="Ort. protein" value={avgProtein ? String(avgProtein) : '—'} sub={`/ ${goals.protein} g`} />
      </div>

      <WeightGoalCard body={body} records={records} settings={settings} goals={goals} onEditGoal={onEditGoal} />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 text-center">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-xl font-display font-black text-slate-900 dark:text-white tabular-nums mt-0.5">{value}</p>
      <p className="text-[10px] font-bold text-slate-400">{sub}</p>
    </div>
  );
}

function WeightGoalCard({ body, records, settings, goals, onEditGoal }: {
  body: BodyStats; records: { date: string; weight: number }[]; settings: NutritionSettings; goals: Goals; onEditGoal: () => void;
}) {
  const trend = useMemo(() => actualWeeklyTrend(records), [records]);

  if (!settings.targetWeight || !body.weight) {
    return (
      <button onClick={onEditGoal}
        className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-5 flex items-center gap-3 text-left active:scale-[0.99] transition-transform">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><Scale className="w-5 h-5" /></div>
        <div>
          <p className="font-display font-black text-slate-900 dark:text-white">Kilo hedefi belirle</p>
          <p className="text-xs text-slate-400">Ne zaman ulaşacağını ve günlük kaloriyi hesaplayalım</p>
        </div>
      </button>
    );
  }

  const target = settings.targetWeight;
  const planRate = settings.weeklyRate || 0.5;
  // Kalori alt sınıra dayandıysa gerçek hız daha yavaş
  const rate = goals.direction === 'lose' ? Math.min(planRate, Math.max(0.05, ((goals.tdee - goals.kcal) * 7) / KCAL_PER_KG)) : planRate;
  const p = projectWeight(body.weight, target, rate, settings.startWeight);
  const start = settings.startWeight ?? body.weight;
  const wantLose = target < start;
  const trendGood = trend !== null && (wantLose ? trend < -0.05 : trend > 0.05);
  const trendEta = trendGood && !p.done ? addDays(new Date(), Math.ceil((Math.abs(p.remaining) / Math.abs(trend!)) * 7)) : null;
  const fmt = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-slate-900 dark:text-white flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Kilo hedefi</h3>
        <button onClick={onEditGoal} className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">Düzenle</button>
      </div>

      <div>
        <div className="flex justify-between items-end mb-1.5">
          <div><p className="text-[10px] font-bold text-slate-400">Başlangıç</p><p className="text-sm font-black text-slate-500 tabular-nums">{start} kg</p></div>
          <div className="text-center"><p className="text-[10px] font-bold text-slate-400">Şu an</p><p className="text-2xl font-display font-black text-slate-900 dark:text-white tabular-nums">{body.weight} kg</p></div>
          <div className="text-right"><p className="text-[10px] font-bold text-slate-400">Hedef</p><p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{target} kg</p></div>
        </div>
        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all" style={{ width: `${p.progress}%` }} />
        </div>
        <p className="mt-1 text-right text-[10px] font-black text-slate-400">%{p.progress} tamamlandı</p>
      </div>

      {p.done ? (
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">🎉 Hedefine ulaştın! Kilonu korumak için günlük {goals.kcal} kcal civarında kal.</p>
      ) : (
        <div className="space-y-2 text-sm">
          <Row icon={wantLose ? TrendingDown : TrendingUp} label={`Plana göre (haftada ${String(Math.round(rate * 100) / 100).replace('.', ',')} kg)`} value={fmt(p.eta)} />
          {trend !== null && (
            <Row icon={trend < 0 ? TrendingDown : TrendingUp}
              label={`Gerçek gidişat: haftada ${trend > 0 ? '+' : ''}${String(trend).replace('.', ',')} kg`}
              value={trendEta ? fmt(trendEta) : 'hedefe doğru değil'} muted={!trendEta} />
          )}
          {trend === null && (
            <p className="text-[11px] text-slate-400">Gerçek gidişatı görmek için en az bir hafta arayla iki kilo kaydı gir.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value, muted }: { icon: React.ElementType; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className={`w-4 h-4 shrink-0 ${muted ? 'text-slate-300' : 'text-emerald-500'}`} />
      <span className="flex-1 text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-xs font-black ${muted ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>{value}</span>
    </div>
  );
}
