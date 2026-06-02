export const parseNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  // Replace comma with dot and trim
  const sanitized = String(val).replace(',', '.').trim();
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateBMI = (weight: number, heightInput: number) => {
  if (!weight || !heightInput || weight <= 0 || heightInput <= 0) return 0;
  
  // Smart correction: 
  // If heightInput is less than 3, it's definitely meters (e.g., 1.80)
  // If heightInput is greater than 3, it's definitely cm (e.g., 180)
  const heightM = heightInput > 3 ? heightInput / 100 : heightInput;
  
  const bmi = weight / (heightM * heightM);
  
  // Sanity check: Real human BMI usually ranges between 10 and 60.
  // If result is outside this, the input was likely malformed or in wrong units.
  if (bmi < 5 || bmi > 150) return 0;
  return bmi;
};

export const getBMIStatus = (bmi: number) => {
  if (bmi <= 0) return { label: 'GEÇERSİZ', color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-200' };
  if (bmi < 18.5) return { label: 'ZAYIF', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
  if (bmi < 25) return { label: 'İDEAL', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' };
  if (bmi < 30) return { label: 'FAZLA KİLOLU', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
  return { label: 'OBEZ', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
};
