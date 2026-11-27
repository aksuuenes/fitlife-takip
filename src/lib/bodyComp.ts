export type Gender = 'male' | 'female' | 'other' | undefined;

/** Deurenberg (1991): yağ % = 1,2×BMI + 0,23×yaş − 10,8×(erkek=1) − 5,4. Cinsiyet bilinmiyorsa erkek varsayılır. */
export function estimateBodyFatPct(bmi: number, age: number, gender: Gender): number {
  const male = gender !== 'female';
  const pct = 1.2 * bmi + 0.23 * age - (male ? 10.8 : 0) - 5.4;
  return Math.min(60, Math.max(3, pct));
}

/** İskelet kası ≈ yağsız kütlenin ~%56'sı (erkek) / ~%51'i (kadın) — BIA cihazlarının ortalama oranı. */
export function estimateSkeletalMuscle(weight: number, fatPct: number, gender: Gender): number {
  const lean = weight * (1 - fatPct / 100);
  return lean * (gender === 'female' ? 0.51 : 0.56);
}

/** Mifflin-St Jeor bazal metabolizma. */
export function estimateBmr(weight: number, heightCm: number, age: number, gender: Gender): number {
  return Math.round(10 * weight + 6.25 * heightCm - 5 * age + (gender === 'female' ? -161 : 5));
}
