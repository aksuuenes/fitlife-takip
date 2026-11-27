import React, { useMemo, useState } from 'react';
import BottomSheet from '../ui/BottomSheet';
import { X, Target, TrendingDown, TrendingUp, Minus as Equal } from 'lucide-react';
import { BodyStats, Goals, NutritionSettings, RATE_OPTIONS, computeGoals, projectWeight } from '../../lib/nutrition';

type Mode = 'target' | 'custom' | 'auto';

/** Hedef kilo / hız ya da elle kalori hedefi belirleme sayfası. */
export default function GoalSheet({ goals, body, settings, onSave, onClose }: {
  goals: Goals;
  body: BodyStats;
  settings: NutritionSettings;
  onSave: (patch: Partial<NutritionSettings>) => void;
  onClose: () => void;
}) {
  const initialMode: Mode = settings.customKcal ? 'custom' : settings.targetWeight ? 'target' : 'auto';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [target, setTarget] = useState(String(settings.targetWeight ?? (body.weight ? Math.round(body.weight - 5) : '')));
  const [rate, setRate] = useState(settings.weeklyRate || 0.5);
  const [kcal, setKcal] = useState(String(settings.customKcal ?? goals.kcal));

  const targetNum = Number(target.replace(',', '.'));
  const targetValid = targetNum >= 30 && targetNum <= 250;
  const kcalNum = Number(kcal);
  const kcalValid = kcalNum >= 800 && kcalNum <= 6000;

  const preview = useMemo(() => {
    if (mode === 'target' && targetValid) return computeGoals(body, { ...settings, customKcal: null, targetWeight: targetNum, weeklyRate: rate });
    if (mode === 'custom' && kcalValid) return computeGoals(body, { ...settings, customKcal: kcalNum });
    if (mode === 'auto') return computeGoals(body, { ...settings, customKcal: null, targetWeight: null });
    return null;
  }, [mode, targetNum, targetValid, rate, kcalNum, kcalValid, body, settings]);

  const projection = mode === 'target' && targetValid && body.weight
    ? projectWeight(body.weight, targetNum, rate, settings.targetWeight === targetNum ? settings.startWeight : body.weight)
    : null;

  const canSave = mode === 'auto' || (mode === 'target' && targetValid && !!body.weight) || (mode === 'custom' && kcalValid);

  const save = () => {
    if (mode === 'target') {
      const keepStart = settings.targetWeight === targetNum && settings.startWeight;
      onSave({ targetWeight: targetNum, weeklyRate: rate, customKcal: null, startWeight: keepStart ? settings.startWeight : body.weight ?? null });
    } else if (mode === 'custom') {
      onSave({ customKcal: kcalNum });
    } else {
      onSave({ customKcal: null, targetWeight: null, startWeight: null });
    }
    onClose();
  };

  const dir = projection ? (projection.remaining < -0.4 ? 'lose' : projection.remaining > 0.4 ? 'gain' : 'maintain') : null;

  return (
    <BottomSheet onClose={onClose}>
      <div className="overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" /> Hedefini belirle
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500" aria-label="Kapat"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          {([['target', 'Hedef kilo'], ['custom', 'Kalori gir'], ['auto', 'Otomatik']] as const).map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`py-2 rounded-xl text-xs font-black transition-colors ${mode === m ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'target' && (
          <div className="space-y-4">
            {!body.weight && (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3">
                Önce "Kayıt Ekle" ile güncel kilonu gir; tahmin için gerekli.
              </p>
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Şu an</p>
                <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-black text-slate-700 dark:text-slate-200">
                  {body.weight ? `${body.weight} kg` : '—'}
                </div>
              </div>
              <span className="pb-3 text-slate-300">→</span>
              <label className="flex-1 block">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Hedef kilo</span>
                <input type="number" inputMode="decimal" value={target} onChange={e => setTarget(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm font-black outline-none focus:ring-2 focus:ring-emerald-500/40" />
              </label>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Haftalık hız</p>
              <div className="grid grid-cols-4 gap-1.5">
                {RATE_OPTIONS.map(r => (
                  <button key={r} onClick={() => setRate(r)}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-colors ${rate === r ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {String(r).replace('.', ',')} kg
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                {rate >= 1 ? 'Hızlı: sürdürmesi zor olabilir, bir uzmana danışman iyi olur.' : rate >= 0.75 ? 'Hızlı ama makul.' : 'Önerilen: sürdürülebilir ve kas kaybı riski düşük.'}
              </p>
            </div>

            {projection && (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  {dir === 'lose' ? <TrendingDown className="w-5 h-5" /> : dir === 'gain' ? <TrendingUp className="w-5 h-5" /> : <Equal className="w-5 h-5" />}
                </div>
                <div className="text-sm">
                  {projection.done ? (
                    <p className="font-black text-emerald-700 dark:text-emerald-300">Zaten hedeftesin, kilonu korumaya odaklan.</p>
                  ) : (
                    <>
                      <p className="font-black text-emerald-700 dark:text-emerald-300">
                        {Math.abs(projection.remaining).toLocaleString('tr-TR')} kg · yaklaşık {Math.ceil(projection.weeks)} hafta
                      </p>
                      <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                        Tahmini varış: {projection.eta.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'custom' && (
          <label className="block">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Günlük kalori hedefi</span>
            <input type="number" inputMode="numeric" value={kcal} onChange={e => setKcal(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm font-black outline-none focus:ring-2 focus:ring-emerald-500/40" />
            <span className="mt-1 block text-[10px] text-slate-400">Diyetisyeninin verdiği bir hedef varsa buraya yaz (800–6000).</span>
          </label>
        )}

        {mode === 'auto' && (
          <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
            Boyuna, kilona ve yaşına göre günlük ihtiyacın hesaplanır; haftada yaklaşık 0,4 kg verecek şekilde hafif bir açık bırakılır.
          </p>
        )}

        {preview && (
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              ['kcal', preview.kcal, 'text-emerald-600 dark:text-emerald-400'],
              ['Protein', preview.protein, 'text-sky-500'],
              ['Karb.', preview.carbs, 'text-amber-500'],
              ['Yağ', preview.fat, 'text-rose-400'],
            ].map(([l, v, c]) => (
              <div key={l as string} className="bg-slate-50 dark:bg-slate-800 rounded-2xl py-3">
                <p className={`text-lg font-black tabular-nums ${c}`}>{v as number}</p>
                <p className="text-[10px] font-bold text-slate-400">{l}{l !== 'kcal' ? ' (g)' : '/gün'}</p>
              </div>
            ))}
          </div>
        )}
        {preview && body.weight && (
          <p className="text-[10px] text-center text-slate-400">Tahmini günlük ihtiyacın (kilo koruma): {preview.tdee} kcal</p>
        )}

        <button onClick={save} disabled={!canSave}
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black disabled:opacity-40 transition-all">
          Kaydet
        </button>
      </div>
    </BottomSheet>
  );
}
