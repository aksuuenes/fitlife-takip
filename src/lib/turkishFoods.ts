// Türk mutfağı ağırlıklı besin veritabanı.
// Değerler 1 porsiyon içindir ve ortalama/yaklaşık değerlerdir.
export type FoodUnit = 'adet' | 'dilim' | 'bardak' | 'fincan' | 'kutu' | 'kaşık' | 'kase' | 'tabak' | 'avuç' | 'porsiyon';

export interface FoodItem {
  id: string;
  name: string;
  portion: string; // 1 birimin açıklaması (örn. "1 adet (50 g)")
  unit: FoodUnit;
  kcal: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  category: FoodCategory;
}

export type FoodCategory =
  | 'kahvaltilik'
  | 'corba'
  | 'ana-yemek'
  | 'zeytinyagli'
  | 'tahil'
  | 'et-tavuk-balik'
  | 'sut-urunleri'
  | 'meyve'
  | 'sebze-salata'
  | 'atistirmalik'
  | 'tatli'
  | 'icecek';

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  'kahvaltilik': 'Kahvaltılık',
  'corba': 'Çorba',
  'ana-yemek': 'Ana Yemek',
  'zeytinyagli': 'Zeytinyağlı',
  'tahil': 'Ekmek & Tahıl',
  'et-tavuk-balik': 'Et, Tavuk, Balık',
  'sut-urunleri': 'Süt Ürünleri',
  'meyve': 'Meyve',
  'sebze-salata': 'Sebze & Salata',
  'atistirmalik': 'Atıştırmalık',
  'tatli': 'Tatlı',
  'icecek': 'İçecek',
};

const f = (
  id: string, name: string, portion: string, kcal: number,
  protein: number, carbs: number, fat: number, category: FoodCategory, unit: FoodUnit = 'porsiyon',
): FoodItem => ({ id, name, portion, unit, kcal, protein, carbs, fat, category });

/** Sayılabilen birimler tam sayı (1, 2, 3…) ile, diğerleri yarım porsiyon adımlarıyla girilir. */
const WHOLE_UNITS: FoodUnit[] = ['adet', 'dilim', 'bardak', 'fincan', 'kutu', 'kaşık'];
export const unitStep = (unit?: string) => (WHOLE_UNITS.includes(unit as FoodUnit) ? 1 : 0.5);
export const isWholeUnit = (unit?: string) => unitStep(unit) === 1;
export const unitTitle = (unit?: string) => {
  const u = unit || 'porsiyon';
  return u.charAt(0).toLocaleUpperCase('tr-TR') + u.slice(1);
};
/** "2 adet", "3 dilim" ya da "1,5 × 1 kase (250 ml)" */
export function servingsText(servings: number, unit: string | undefined, portion: string) {
  const n = String(servings).replace('.', ',');
  if (isWholeUnit(unit)) return `${n} ${unit}`;
  if (unit && portion.toLocaleLowerCase('tr-TR').startsWith(`1 ${unit}`)) return servings === 1 ? portion : `${n} ${unit}`;
  return servings === 1 ? portion : `${n} × ${portion}`;
}

export const TURKISH_FOODS: FoodItem[] = [
  // Kahvaltılık
  f('yumurta-haslanmis', 'Haşlanmış yumurta', '1 adet (50 g)', 78, 6.3, 0.6, 5.3, 'kahvaltilik', 'adet'),
  f('menemen', 'Menemen', '1 porsiyon (200 g)', 210, 11, 9, 15, 'kahvaltilik'),
  f('sahanda-yumurta', 'Sahanda yumurta', '1 yumurta (tereyağlı)', 95, 6.3, 0.5, 7.5, 'kahvaltilik', 'adet'),
  f('omlet', 'Sade omlet', '1 yumurtalık', 90, 6, 0.8, 7, 'kahvaltilik', 'adet'),
  f('sucuklu-yumurta', 'Sucuklu yumurta', '1 porsiyon', 360, 20, 2, 30, 'kahvaltilik'),
  f('beyaz-peynir', 'Beyaz peynir', '1 dilim (30 g)', 80, 5, 0.5, 6.5, 'kahvaltilik', 'dilim'),
  f('kasar-peyniri', 'Kaşar peyniri', '1 dilim (30 g)', 110, 7.5, 0.5, 9, 'kahvaltilik', 'dilim'),
  f('lor-peyniri', 'Lor peyniri', '2 yemek kaşığı (50 g)', 50, 6, 1.5, 2, 'kahvaltilik'),
  f('zeytin-siyah', 'Siyah zeytin', '5 adet (20 g)', 45, 0.3, 1, 4.5, 'kahvaltilik'),
  f('zeytin-yesil', 'Yeşil zeytin', '5 adet (20 g)', 30, 0.2, 0.8, 3, 'kahvaltilik'),
  f('bal', 'Bal', '1 tatlı kaşığı (10 g)', 30, 0, 8, 0, 'kahvaltilik', 'kaşık'),
  f('recel', 'Reçel', '1 tatlı kaşığı (10 g)', 26, 0, 6.5, 0, 'kahvaltilik', 'kaşık'),
  f('tereyagi', 'Tereyağı', '1 tatlı kaşığı (5 g)', 36, 0, 0, 4, 'kahvaltilik', 'kaşık'),
  f('tahin-pekmez', 'Tahin pekmez', '1 yemek kaşığı', 95, 2, 10, 5.5, 'kahvaltilik', 'kaşık'),
  f('yulaf-ezmesi', 'Yulaf ezmesi (sütlü)', '1 kase (40 g yulaf)', 260, 11, 38, 7, 'kahvaltilik', 'kase'),

  // Ekmek & tahıl
  f('ekmek-beyaz', 'Beyaz ekmek', '1 dilim (25 g)', 66, 2.2, 13, 0.8, 'tahil', 'dilim'),
  f('ekmek-tam-bugday', 'Tam buğday ekmeği', '1 dilim (25 g)', 60, 2.5, 11, 0.8, 'tahil', 'dilim'),
  f('simit', 'Simit', '1 adet (100 g)', 290, 9, 50, 6, 'tahil', 'adet'),
  f('pogaca', 'Peynirli poğaça', '1 adet (70 g)', 260, 6, 28, 14, 'tahil', 'adet'),
  f('borek-su', 'Su böreği', '1 dilim (100 g)', 270, 10, 25, 15, 'tahil', 'dilim'),
  f('pilav-pirinc', 'Pirinç pilavı', '1 kase (150 g)', 240, 4, 42, 6, 'tahil', 'kase'),
  f('pilav-bulgur', 'Bulgur pilavı', '1 kase (150 g)', 195, 5.5, 36, 4, 'tahil', 'kase'),
  f('makarna', 'Makarna (sade)', '1 tabak (150 g)', 225, 8, 44, 1.5, 'tahil', 'tabak'),
  f('lavas', 'Lavaş', '1 adet (60 g)', 165, 5, 33, 1, 'tahil', 'adet'),

  // Çorba
  f('mercimek-corbasi', 'Mercimek çorbası', '1 kase (250 ml)', 180, 9, 26, 4.5, 'corba', 'kase'),
  f('ezogelin', 'Ezogelin çorbası', '1 kase (250 ml)', 170, 7, 26, 4.5, 'corba', 'kase'),
  f('tavuk-suyu-corba', 'Tavuk suyu çorba', '1 kase (250 ml)', 130, 8, 14, 4.5, 'corba', 'kase'),
  f('yayla-corbasi', 'Yayla çorbası', '1 kase (250 ml)', 150, 6, 18, 6, 'corba', 'kase'),
  f('domates-corbasi', 'Domates çorbası', '1 kase (250 ml)', 120, 3, 16, 5, 'corba', 'kase'),
  f('iskembe', 'İşkembe çorbası', '1 kase (250 ml)', 190, 14, 8, 11, 'corba', 'kase'),

  // Ana yemek
  f('kuru-fasulye', 'Kuru fasulye', '1 tabak (250 g)', 300, 16, 40, 8, 'ana-yemek', 'tabak'),
  f('nohut', 'Etli nohut', '1 tabak (250 g)', 330, 18, 38, 11, 'ana-yemek', 'tabak'),
  f('karniyarik', 'Karnıyarık', '1 adet', 350, 13, 18, 25, 'ana-yemek', 'adet'),
  f('imam-bayildi', 'İmam bayıldı', '1 adet', 240, 3, 18, 18, 'zeytinyagli', 'adet'),
  f('kofte-izgara', 'Izgara köfte', '1 adet (30 g)', 75, 5.5, 1.5, 5.3, 'et-tavuk-balik', 'adet'),
  f('tavuk-izgara', 'Izgara tavuk göğsü', '1 porsiyon (150 g)', 250, 46, 0, 6, 'et-tavuk-balik'),
  f('tavuk-sote', 'Tavuk sote', '1 porsiyon (200 g)', 280, 30, 10, 13, 'et-tavuk-balik'),
  f('doner-tavuk', 'Tavuk döner dürüm', '1 adet', 520, 32, 52, 20, 'ana-yemek', 'adet'),
  f('doner-et', 'Et döner (porsiyon)', '1 porsiyon (150 g)', 420, 30, 4, 31, 'et-tavuk-balik'),
  f('lahmacun', 'Lahmacun', '1 adet', 280, 12, 38, 9, 'ana-yemek', 'adet'),
  f('pide-kiymali', 'Kıymalı pide', '1 adet', 700, 30, 85, 26, 'ana-yemek', 'adet'),
  f('manti', 'Mantı (yoğurtlu)', '1 tabak (250 g)', 480, 20, 55, 20, 'ana-yemek', 'tabak'),
  f('etli-dolma', 'Etli biber dolması', '1 adet', 150, 7, 13, 7.5, 'ana-yemek', 'adet'),
  f('sarma-zeytinyagli', 'Zeytinyağlı yaprak sarma', '6 adet', 220, 3, 30, 10, 'zeytinyagli'),
  f('taze-fasulye', 'Zeytinyağlı taze fasulye', '1 tabak (200 g)', 150, 3.5, 14, 9, 'zeytinyagli', 'tabak'),
  f('turlu', 'Türlü', '1 tabak (250 g)', 190, 5, 20, 10, 'ana-yemek', 'tabak'),
  f('ispanak-yemegi', 'Ispanak yemeği', '1 tabak (200 g)', 140, 6, 10, 9, 'ana-yemek', 'tabak'),
  f('balik-izgara', 'Izgara levrek/çipura', '1 porsiyon (200 g)', 280, 38, 0, 13, 'et-tavuk-balik'),
  f('hamsi-tava', 'Hamsi tava', '1 porsiyon (150 g)', 360, 26, 12, 23, 'et-tavuk-balik'),
  f('ton-baligi', 'Ton balığı (süzülmüş)', '1 kutu (80 g)', 110, 24, 0, 1.5, 'et-tavuk-balik'),

  // Süt ürünleri
  f('yogurt', 'Yoğurt (tam yağlı)', '1 kase (150 g)', 95, 5, 7, 5, 'sut-urunleri', 'kase'),
  f('yogurt-light', 'Yoğurt (light)', '1 kase (150 g)', 60, 5.5, 7, 1.2, 'sut-urunleri', 'kase'),
  f('ayran', 'Ayran', '1 bardak (200 ml)', 70, 3.5, 5, 3.5, 'icecek', 'bardak'),
  f('cacik', 'Cacık', '1 kase (150 g)', 90, 4.5, 6, 5, 'sut-urunleri', 'kase'),
  f('sut', 'Süt (yarım yağlı)', '1 bardak (200 ml)', 95, 6.5, 10, 3, 'sut-urunleri', 'bardak'),
  f('kefir', 'Kefir', '1 bardak (200 ml)', 110, 7, 9, 5, 'sut-urunleri', 'bardak'),

  // Sebze & salata
  f('coban-salata', 'Çoban salata', '1 kase', 90, 2, 8, 6, 'sebze-salata', 'kase'),
  f('mevsim-salata', 'Mevsim salata (yağlı)', '1 kase', 80, 2, 6, 6, 'sebze-salata', 'kase'),
  f('kisir', 'Kısır', '1 porsiyon (150 g)', 230, 5, 32, 9, 'sebze-salata'),
  f('piyaz', 'Piyaz', '1 porsiyon (150 g)', 210, 9, 24, 9, 'sebze-salata'),
  f('salatalik', 'Salatalık', '1 adet', 15, 0.6, 3, 0.1, 'sebze-salata', 'adet'),
  f('domates', 'Domates', '1 adet', 22, 1, 4.8, 0.2, 'sebze-salata', 'adet'),

  // Meyve
  f('elma', 'Elma', '1 adet (orta boy)', 95, 0.5, 25, 0.3, 'meyve', 'adet'),
  f('muz', 'Muz', '1 adet (orta boy)', 105, 1.3, 27, 0.4, 'meyve', 'adet'),
  f('portakal', 'Portakal', '1 adet (orta boy)', 62, 1.2, 15, 0.2, 'meyve', 'adet'),
  f('mandalina', 'Mandalina', '1 adet', 45, 0.7, 11, 0.3, 'meyve', 'adet'),
  f('karpuz', 'Karpuz', '1 dilim (300 g)', 90, 1.8, 23, 0.5, 'meyve', 'dilim'),
  f('uzum', 'Üzüm', '1 kase (150 g)', 105, 1, 27, 0.2, 'meyve', 'kase'),
  f('cilek', 'Çilek', '1 kase (150 g)', 48, 1, 11, 0.5, 'meyve', 'kase'),
  f('kuru-kayisi', 'Kuru kayısı', '1 adet (10 g)', 24, 0.3, 6.3, 0.1, 'meyve', 'adet'),
  f('hurma', 'Hurma', '1 adet (8 g)', 23, 0.2, 6, 0, 'meyve', 'adet'),

  // Atıştırmalık
  f('ceviz', 'Ceviz', '1 tam ceviz (7 g)', 46, 1, 1, 4.5, 'atistirmalik', 'adet'),
  f('badem', 'Badem', '1 avuç (10 adet, 12 g)', 70, 2.5, 2.5, 6, 'atistirmalik', 'avuç'),
  f('findik', 'Fındık', '1 avuç (10 adet, 15 g)', 95, 2.2, 2.5, 9, 'atistirmalik', 'avuç'),
  f('leblebi', 'Leblebi', '1 avuç (30 g)', 110, 6, 18, 2, 'atistirmalik', 'avuç'),
  f('protein-bar', 'Protein bar', '1 adet (60 g)', 220, 20, 22, 7, 'atistirmalik', 'adet'),
  f('cips', 'Cips', '1 küçük paket (40 g)', 215, 2.5, 21, 14, 'atistirmalik'),

  // Tatlı
  f('baklava', 'Baklava', '1 dilim (40 g)', 165, 2.5, 18, 9.5, 'tatli', 'dilim'),
  f('sutlac', 'Sütlaç', '1 kase (150 g)', 200, 5, 34, 5, 'tatli', 'kase'),
  f('kunefe', 'Künefe', '1 porsiyon (150 g)', 520, 12, 55, 28, 'tatli'),
  f('cikolata', 'Sütlü çikolata', '1 kare kalıp (25 g)', 135, 2, 15, 7.5, 'tatli'),
  f('dondurma', 'Dondurma', '2 top (100 g)', 210, 3.5, 24, 11, 'tatli'),

  // İçecek
  f('cay-sekersiz', 'Çay (şekersiz)', '1 bardak', 2, 0, 0.5, 0, 'icecek', 'bardak'),
  f('cay-sekerli', 'Çay (2 şeker)', '1 bardak', 40, 0, 10, 0, 'icecek', 'bardak'),
  f('turk-kahvesi', 'Türk kahvesi (sade)', '1 fincan', 7, 0.3, 1, 0.2, 'icecek', 'fincan'),
  f('latte', 'Latte', '1 orta boy', 190, 10, 18, 7, 'icecek', 'bardak'),
  f('portakal-suyu', 'Taze portakal suyu', '1 bardak (200 ml)', 90, 1.5, 21, 0.4, 'icecek', 'bardak'),
  f('kola', 'Kola', '1 kutu (330 ml)', 140, 0, 35, 0, 'icecek', 'kutu'),
];

const normalize = (s: string) =>
  s.toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');

export function searchFoods(query: string, limit = 30): FoodItem[] {
  const q = normalize(query.trim());
  if (!q) return TURKISH_FOODS.slice(0, limit);
  return TURKISH_FOODS
    .filter(food => normalize(food.name).includes(q))
    .sort((a, b) => normalize(a.name).indexOf(q) - normalize(b.name).indexOf(q))
    .slice(0, limit);
}
