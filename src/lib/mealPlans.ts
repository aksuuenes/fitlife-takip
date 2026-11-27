// Kalori hedefine göre Türk mutfağından haftalık menü üretimi (yapay zeka gerektirmez).
import type { MealType } from '../types';
import { FoodItem, TURKISH_FOODS, unitStep } from './turkishFoods';

interface ComboItem { id: string; servings: number; fixed?: boolean }
type Combo = ComboItem[];

const c = (id: string, servings = 1, fixed = false): ComboItem => ({ id, servings, fixed });
const CAY = c('cay-sekersiz', 1, true);

export const MEAL_COMBOS: Record<MealType, Combo[]> = {
  breakfast: [
    [c('menemen'), c('ekmek-tam-bugday', 2), c('beyaz-peynir'), CAY],
    [c('yumurta-haslanmis', 2), c('beyaz-peynir'), c('zeytin-siyah'), c('ekmek-tam-bugday', 2), c('domates', 1, true), c('salatalik', 1, true), CAY],
    [c('yulaf-ezmesi'), c('muz'), c('ceviz', 2)],
    [c('omlet', 2), c('kasar-peyniri'), c('ekmek-tam-bugday'), c('domates', 1, true), CAY],
    [c('lor-peyniri', 2), c('bal'), c('ekmek-tam-bugday', 2), c('ceviz', 2), c('salatalik', 1, true), CAY],
    [c('sahanda-yumurta', 2), c('ekmek-tam-bugday'), c('zeytin-yesil'), c('domates', 1, true), CAY],
    [c('yogurt'), c('cilek'), c('yulaf-ezmesi', 0.5), c('badem')],
  ],
  lunch: [
    [c('mercimek-corbasi'), c('pilav-bulgur'), c('coban-salata'), c('yogurt')],
    [c('tavuk-izgara'), c('pilav-bulgur'), c('mevsim-salata'), c('ayran', 1, true)],
    [c('kuru-fasulye'), c('pilav-pirinc'), c('cacik')],
    [c('ton-baligi'), c('kisir'), c('mevsim-salata')],
    [c('ezogelin'), c('tavuk-sote'), c('ekmek-tam-bugday'), c('coban-salata')],
    [c('nohut'), c('pilav-bulgur'), c('yogurt')],
    [c('kofte-izgara', 4), c('piyaz'), c('ayran', 1, true)],
  ],
  dinner: [
    [c('balik-izgara'), c('mevsim-salata'), c('ekmek-tam-bugday')],
    [c('domates-corbasi'), c('taze-fasulye'), c('yogurt'), c('ekmek-tam-bugday')],
    [c('tavuk-sote'), c('pilav-bulgur'), c('coban-salata')],
    [c('mercimek-corbasi'), c('ispanak-yemegi'), c('yogurt'), c('ekmek-tam-bugday')],
    [c('turlu'), c('tavuk-izgara', 0.5), c('cacik'), c('ekmek-tam-bugday')],
    [c('etli-dolma', 2), c('yogurt'), c('coban-salata')],
    [c('imam-bayildi'), c('pilav-bulgur'), c('cacik')],
  ],
  snack: [
    [c('elma'), c('badem')],
    [c('kefir'), c('muz')],
    [c('yogurt-light'), c('cilek')],
    [c('mandalina', 2), c('ceviz', 2)],
    [c('leblebi'), c('ayran')],
    [c('kuru-kayisi', 3), c('findik')],
    [c('portakal'), c('badem')],
  ],
};

export const MEAL_SHARE: Record<MealType, number> = { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 };
export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export interface PlanItem { food: FoodItem; servings: number; fixed?: boolean }
export interface PlanDay { meals: Record<MealType, PlanItem[]>; kcal: number; protein: number }

const byId = new Map(TURKISH_FOODS.map(f => [f.id, f]));
/** Birime göre yuvarla: adet/dilim tam sayı, diğerleri yarım. */
const roundTo = (n: number, food: FoodItem) => { const st = unitStep(food.unit); return Math.max(st, Math.round(n / st) * st); };

function buildMeal(combo: Combo, targetKcal: number): PlanItem[] {
  const items = combo.map(ci => ({ ci, food: byId.get(ci.id)! })).filter(x => x.food);
  const fixedKcal = items.filter(x => x.ci.fixed).reduce((s, x) => s + x.food.kcal * x.ci.servings, 0);
  const flexKcal = items.filter(x => !x.ci.fixed).reduce((s, x) => s + x.food.kcal * x.ci.servings, 0);
  const factor = flexKcal > 0 ? Math.min(2, Math.max(0.5, (targetKcal - fixedKcal) / flexKcal)) : 1;
  return items.map(({ ci, food }) => ({ food, servings: ci.fixed ? ci.servings : roundTo(ci.servings * factor, food), fixed: ci.fixed }));
}

/** 7 günlük plan. variant değiştikçe öğün eşleşmeleri karışır. */
export function generateWeekPlan(goalKcal: number, variant = 0): PlanDay[] {
  return Array.from({ length: 7 }, (_, day) => {
    const meals = {} as Record<MealType, PlanItem[]>;
    MEAL_ORDER.forEach((meal, mi) => {
      const combos = MEAL_COMBOS[meal];
      const idx = (day + variant * (mi + 2) + mi * 3) % combos.length;
      meals[meal] = buildMeal(combos[idx], goalKcal * MEAL_SHARE[meal]);
    });
    const all = MEAL_ORDER.flatMap(m => meals[m]);
    balanceDay(all, goalKcal);
    return {
      meals,
      kcal: Math.round(all.reduce((s, x) => s + x.food.kcal * x.servings, 0)),
      protein: Math.round(all.reduce((s, x) => s + x.food.protein * x.servings, 0)),
    };
  });
}

/** Gün toplamını yarım porsiyon adımlarıyla hedefin ±%5'ine yaklaştırır. */
function balanceDay(items: PlanItem[], goal: number) {
  const total = () => items.reduce((s, x) => s + x.food.kcal * x.servings, 0);
  const flex = items.filter(x => !x.fixed);
  for (let i = 0; i < 12; i++) {
    const t = total();
    if (t > goal * 1.05) {
      const cand = flex.filter(x => x.servings > unitStep(x.food.unit)).sort((a, b) => b.food.kcal * b.servings - a.food.kcal * a.servings)[0];
      if (!cand || t - cand.food.kcal * unitStep(cand.food.unit) < goal * 0.9) break;
      cand.servings -= unitStep(cand.food.unit);
    } else if (t < goal * 0.95) {
      const cand = flex.filter(x => x.servings < (unitStep(x.food.unit) === 1 ? 4 : 2.5)).sort((a, b) => b.food.protein - a.food.protein)[0];
      if (!cand || t + cand.food.kcal * unitStep(cand.food.unit) > goal * 1.1) break;
      cand.servings += unitStep(cand.food.unit);
    } else break;
  }
}

export interface ShoppingItem { food: FoodItem; servings: number }

/** Planın tamamı için alışveriş listesi (çay gibi sabitler hariç). */
export function shoppingList(plan: PlanDay[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  plan.forEach(d => MEAL_ORDER.forEach(m => d.meals[m].forEach(({ food, servings }) => {
    if (food.category === 'icecek' && food.kcal < 10) return;
    const cur = map.get(food.id);
    map.set(food.id, { food, servings: (cur?.servings || 0) + servings });
  })));
  return [...map.values()].sort((a, b) => a.food.category.localeCompare(b.food.category) || a.food.name.localeCompare(b.food.name, 'tr'));
}
