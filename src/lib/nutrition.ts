// Beslenme ile ilgili ortak hesaplamalar (hedef kalori, kilo tahmini, seri).
import type { MealEntry } from '../types';

export interface QuickFood {
  foodId?: string;
  name: string;
  portion: string;
  unit?: string;
  // 1 birim için değerler
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionSettings {
  favorites: QuickFood[];
  recents: QuickFood[];
  customKcal?: number | null; // elle girilen günlük hedef (varsa her şeyi geçersiz kılar)
  targetWeight?: number | null; // hedef kilo
  weeklyRate?: number; // haftalık değişim hızı (kg)
  startWeight?: number | null; // hedef koyulduğundaki kilo (ilerleme yüzdesi için)
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: NutritionSettings = { favorites: [], recents: [], weeklyRate: 0.5 };
export const RATE_OPTIONS = [0.25, 0.5, 0.75, 1];
const KCAL_PER_KG = 7700;
const MAX_RECENTS = 12;

export interface BodyStats {
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

export interface Goals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  tdee: number;
  mode: 'custom' | 'target' | 'default';
  direction: 'lose' | 'gain' | 'maintain';
  hasBody: boolean;
}

export const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const lastNDays = (n: number, end = new Date()) =>
  Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function ageFrom(birthDate?: string): number | undefined {
  if (!birthDate) return undefined;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

/** Mifflin-St Jeor ile günlük enerji ihtiyacı (hafif aktivite varsayımı). */
export function estimateTdee(body: BodyStats): number {
  const weight = body.weight || 70;
  const height = body.height || 170;
  const age = body.age || 30;
  const bmr = 10 * weight + 6.25 * height - 5 * age + (body.gender === 'female' ? -161 : 5);
  return bmr * 1.375;
}

export function computeGoals(body: BodyStats, settings: NutritionSettings): Goals {
  const tdee = estimateTdee(body);
  const weight = body.weight || 70;
  const floor = body.gender === 'male' ? 1500 : 1200;
  let kcal: number;
  let mode: Goals['mode'] = 'default';
  let direction: Goals['direction'] = 'lose';

  if (settings.customKcal && settings.customKcal >= 800) {
    kcal = settings.customKcal;
    mode = 'custom';
    direction = kcal < tdee - 150 ? 'lose' : kcal > tdee + 150 ? 'gain' : 'maintain';
  } else if (settings.targetWeight && body.weight) {
    const diff = settings.targetWeight - body.weight;
    const daily = ((settings.weeklyRate || 0.5) * KCAL_PER_KG) / 7;
    mode = 'target';
    if (Math.abs(diff) < 0.5) {
      kcal = tdee;
      direction = 'maintain';
    } else if (diff < 0) {
      kcal = Math.max(floor, tdee - daily);
      direction = 'lose';
    } else {
      kcal = tdee + daily;
      direction = 'gain';
    }
  } else {
    kcal = Math.max(floor, tdee - 400);
  }

  kcal = Math.round(kcal / 10) * 10;
  const protein = Math.round(Math.min(weight * 1.6, (kcal * 0.35) / 4));
  const fat = Math.round((kcal * 0.28) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat, tdee: Math.round(tdee), mode, direction, hasBody: !!body.weight };
}

/** Hedef kiloya ne zaman ulaşılacağının tahmini. */
export function projectWeight(current: number, target: number, weeklyRate: number, startWeight?: number | null) {
  const remaining = round1(target - current);
  const done = Math.abs(remaining) < 0.5;
  const weeks = done ? 0 : Math.abs(remaining) / (weeklyRate || 0.5);
  const eta = addDays(new Date(), Math.ceil(weeks * 7));
  const start = startWeight ?? current;
  const total = Math.abs(target - start);
  const progress = total < 0.1 ? (done ? 100 : 0) : Math.min(100, Math.max(0, (Math.abs(current - start) / total) * 100));
  return { remaining, weeks, eta, done, progress: Math.round(progress) };
}

/** Kayıtlardan son haftalardaki gerçek kilo değişimi (kg/hafta). Yeterli veri yoksa null. */
export function actualWeeklyTrend(records: { date: string; weight: number }[]): number | null {
  const pts = records
    .filter(r => r.weight > 0)
    .map(r => ({ t: new Date(r.date).getTime(), w: r.weight }))
    .filter(p => !isNaN(p.t) && p.t > Date.now() - 1000 * 60 * 60 * 24 * 60)
    .sort((a, b) => a.t - b.t);
  if (pts.length < 2) return null;
  const days = (pts[pts.length - 1].t - pts[0].t) / (1000 * 60 * 60 * 24);
  if (days < 6) return null;
  return round1(((pts[pts.length - 1].w - pts[0].w) / days) * 7);
}

export const sumEntries = (entries: MealEntry[]) => entries.reduce(
  (t, e) => ({ kcal: t.kcal + e.kcal, protein: t.protein + e.protein, carbs: t.carbs + e.carbs, fat: t.fat + e.fat }),
  { kcal: 0, protein: 0, carbs: 0, fat: 0 },
);

/** Gün hedefte mi? Kayıt varsa ve hedefin %10 fazlasını geçmiyorsa (kilo alma hedefinde %10 altına düşmüyorsa). */
export function dayOnTarget(kcal: number, goal: Goals) {
  if (kcal <= 0) return false;
  if (goal.direction === 'gain') return kcal >= goal.kcal * 0.9;
  return kcal <= goal.kcal * 1.1 && kcal >= goal.kcal * 0.6;
}

/** Bugünden geriye doğru hedefte geçen ardışık gün sayısı (bugün henüz kayıt yoksa dünden başlar). */
export function targetStreak(dailyKcal: { key: string; kcal: number }[], goal: Goals) {
  const sorted = [...dailyKcal].sort((a, b) => (a.key < b.key ? 1 : -1));
  let streak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i];
    // Bugün henüz bitmedi: hedefteyse say, değilse seriyi bozmadan geç
    if (i === 0 && d.key === toDateKey(new Date()) && !dayOnTarget(d.kcal, goal)) continue;
    if (dayOnTarget(d.kcal, goal)) streak++;
    else break;
  }
  return streak;
}

export function entryToQuick(e: MealEntry): QuickFood {
  const s = e.servings || 1;
  return {
    foodId: e.foodId, name: e.name, portion: e.portion, unit: e.unit,
    kcal: round1(e.kcal / s), protein: round1(e.protein / s), carbs: round1(e.carbs / s), fat: round1(e.fat / s),
  };
}

export const quickKey = (q: QuickFood) => q.foodId || `custom:${q.name.toLocaleLowerCase('tr-TR')}`;

export function pushRecent(recents: QuickFood[], item: QuickFood): QuickFood[] {
  const k = quickKey(item);
  return [item, ...recents.filter(r => quickKey(r) !== k)].slice(0, MAX_RECENTS);
}

export function toggleFavorite(favorites: QuickFood[], item: QuickFood): QuickFood[] {
  const k = quickKey(item);
  return favorites.some(f => quickKey(f) === k)
    ? favorites.filter(f => quickKey(f) !== k)
    : [item, ...favorites].slice(0, 30);
}
