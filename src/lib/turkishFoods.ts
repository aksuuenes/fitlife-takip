// Türk mutfağı ağırlıklı besin veritabanı. Değerler 1 birim (portion) içindir.
// Kaynak (Kasım 2026 gözden geçirmesi): tek tip besinler USDA FoodData Central (SR Legacy) 100 g değerlerinden,
// Türk süt ürünleri/sucuk market etiket ortalamalarından; ev yemekleri standart tariflerin malzeme
// gramajlarından (aynı USDA değerleriyle) hesaplanmıştır. Karbonhidrat = toplam karbonhidrat (lif dahil).
// Ev yemekleri tarifteki yağ miktarına göre ±%15 değişebilir.
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
  f('menemen', 'Menemen', '1 porsiyon (2 yumurta, ≈250 g)', 260, 14, 9, 19, 'kahvaltilik'),
  f('sahanda-yumurta', 'Sahanda yumurta', '1 yumurta (3 g tereyağı ile)', 94, 6.3, 0.4, 7.2, 'kahvaltilik', 'adet'),
  f('omlet', 'Sade omlet', '1 yumurtalık (2 g yağ ile)', 90, 6.3, 0.4, 7.1, 'kahvaltilik', 'adet'),
  f('sucuklu-yumurta', 'Sucuklu yumurta', '1 porsiyon (2 yumurta + 40 g sucuk)', 300, 20, 1.5, 23.5, 'kahvaltilik'),
  f('beyaz-peynir', 'Beyaz peynir', '1 dilim (30 g)', 80, 4.8, 0.3, 6.6, 'kahvaltilik', 'dilim'),
  f('kasar-peyniri', 'Kaşar peyniri', '1 dilim (30 g)', 112, 7.8, 0.4, 8.5, 'kahvaltilik', 'dilim'),
  f('lor-peyniri', 'Lor peyniri', '2 yemek kaşığı (50 g)', 55, 6.3, 1.5, 2, 'kahvaltilik'),
  f('zeytin-siyah', 'Siyah zeytin', '5 adet (20 g)', 45, 0.3, 1.2, 4.5, 'kahvaltilik'),
  f('zeytin-yesil', 'Yeşil zeytin', '5 adet (20 g)', 29, 0.2, 0.8, 3.1, 'kahvaltilik'),
  f('bal', 'Bal', '1 tatlı kaşığı (10 g)', 30, 0, 8.2, 0, 'kahvaltilik', 'kaşık'),
  f('recel', 'Reçel', '1 tatlı kaşığı (10 g)', 28, 0, 6.9, 0, 'kahvaltilik', 'kaşık'),
  f('tereyagi', 'Tereyağı', '1 tatlı kaşığı (5 g)', 36, 0, 0, 4, 'kahvaltilik', 'kaşık'),
  f('tahin-pekmez', 'Tahin pekmez', '1 yemek kaşığı (10 g tahin + 10 g pekmez)', 89, 1.7, 9.3, 5.4, 'kahvaltilik', 'kaşık'),
  f('yulaf-ezmesi', 'Yulaf ezmesi (sütlü)', '1 kase (40 g yulaf + 200 ml süt)', 255, 12, 37, 6.7, 'kahvaltilik', 'kase'),

  // Ekmek & tahıl
  f('ekmek-beyaz', 'Beyaz ekmek', '1 dilim (25 g)', 67, 1.9, 12.3, 0.8, 'tahil', 'dilim'),
  f('ekmek-tam-bugday', 'Tam buğday ekmeği', '1 dilim (25 g)', 63, 3.1, 10.7, 0.9, 'tahil', 'dilim'),
  f('simit', 'Simit', '1 adet (100 g)', 300, 10, 52, 6, 'tahil', 'adet'),
  f('pogaca', 'Peynirli poğaça', '1 adet (70 g)', 252, 6, 28, 13, 'tahil', 'adet'),
  f('borek-su', 'Su böreği', '1 dilim (100 g)', 245, 9.5, 23, 13, 'tahil', 'dilim'),
  f('pilav-pirinc', 'Pirinç pilavı', '1 kase (150 g)', 234, 3.5, 40, 6.3, 'tahil', 'kase'),
  f('pilav-bulgur', 'Bulgur pilavı', '1 kase (150 g)', 215, 6.5, 40, 4.5, 'tahil', 'kase'),
  f('makarna', 'Makarna (sade)', '1 tabak (150 g, haşlanmış)', 237, 8.7, 46, 1.4, 'tahil', 'tabak'),
  f('lavas', 'Lavaş', '1 adet (60 g)', 165, 5, 33, 1, 'tahil', 'adet'),

  // Çorba
  f('mercimek-corbasi', 'Mercimek çorbası', '1 kase (250 ml)', 170, 8.5, 25, 4.5, 'corba', 'kase'),
  f('ezogelin', 'Ezogelin çorbası', '1 kase (250 ml)', 170, 7.5, 26, 4.5, 'corba', 'kase'),
  f('tavuk-suyu-corba', 'Tavuk suyu çorba', '1 kase (250 ml)', 125, 9.5, 14, 3.5, 'corba', 'kase'),
  f('yayla-corbasi', 'Yayla çorbası', '1 kase (250 ml)', 140, 4.5, 16.5, 6, 'corba', 'kase'),
  f('domates-corbasi', 'Domates çorbası', '1 kase (250 ml)', 110, 3.5, 13, 5, 'corba', 'kase'),
  f('iskembe', 'İşkembe çorbası', '1 kase (250 ml)', 140, 10, 5, 9, 'corba', 'kase'),

  // Ana yemek
  f('kuru-fasulye', 'Kuru fasulye', '1 tabak (250 g)', 310, 17, 42, 8, 'ana-yemek', 'tabak'),
  f('nohut', 'Etli nohut', '1 tabak (250 g)', 350, 20, 36, 14, 'ana-yemek', 'tabak'),
  f('karniyarik', 'Karnıyarık', '1 adet (≈250 g)', 360, 12, 16, 28, 'ana-yemek', 'adet'),
  f('imam-bayildi', 'İmam bayıldı', '1 adet (≈250 g)', 310, 3.5, 20, 24, 'zeytinyagli', 'adet'),
  f('kofte-izgara', 'Izgara köfte', '1 adet (30 g)', 78, 5.6, 1.8, 5.1, 'et-tavuk-balik', 'adet'),
  f('tavuk-izgara', 'Izgara tavuk göğsü', '1 porsiyon (150 g)', 248, 46.5, 0, 5.4, 'et-tavuk-balik'),
  f('tavuk-sote', 'Tavuk sote', '1 porsiyon (200 g)', 250, 30, 5, 11.5, 'et-tavuk-balik'),
  f('doner-tavuk', 'Tavuk döner dürüm', '1 adet (≈220 g)', 490, 30, 50, 19, 'ana-yemek', 'adet'),
  f('doner-et', 'Et döner (porsiyon)', '1 porsiyon (150 g)', 400, 28, 4, 30, 'et-tavuk-balik'),
  f('lahmacun', 'Lahmacun', '1 adet orta boy (≈130 g)', 230, 10, 32, 7, 'ana-yemek', 'adet'),
  f('pide-kiymali', 'Kıymalı pide', '1 adet (≈330 g)', 780, 31, 108, 26, 'ana-yemek', 'adet'),
  f('manti', 'Mantı (yoğurtlu)', '1 tabak (250 g)', 420, 17, 50, 17, 'ana-yemek', 'tabak'),
  f('etli-dolma', 'Etli biber dolması', '1 adet (≈120 g)', 140, 5, 12.5, 7.5, 'ana-yemek', 'adet'),
  f('sarma-zeytinyagli', 'Zeytinyağlı yaprak sarma', '6 adet (≈120 g)', 218, 3.2, 28, 8.6, 'zeytinyagli'),
  f('taze-fasulye', 'Zeytinyağlı taze fasulye', '1 tabak (200 g)', 155, 3.5, 14, 10.5, 'zeytinyagli', 'tabak'),
  f('turlu', 'Türlü', '1 tabak (250 g)', 195, 4, 20, 11, 'ana-yemek', 'tabak'),
  f('ispanak-yemegi', 'Ispanak yemeği', '1 tabak (200 g)', 145, 5.5, 12.5, 8.7, 'ana-yemek', 'tabak'),
  f('balik-izgara', 'Izgara levrek/çipura', '1 porsiyon (200 g)', 290, 46, 0, 11, 'et-tavuk-balik'),
  f('hamsi-tava', 'Hamsi tava', '1 porsiyon (150 g)', 400, 36, 10, 23, 'et-tavuk-balik'),
  f('ton-baligi', 'Ton balığı (süzülmüş)', '1 kutu (75 g, yağı süzülmüş)', 149, 21.8, 0, 6.2, 'et-tavuk-balik'),

  // Süt ürünleri
  f('yogurt', 'Yoğurt (tam yağlı)', '1 kase (150 g)', 95, 5, 7, 5, 'sut-urunleri', 'kase'),
  f('yogurt-light', 'Yoğurt (light)', '1 kase (150 g)', 72, 6, 7.5, 2.3, 'sut-urunleri', 'kase'),
  f('ayran', 'Ayran', '1 bardak (200 ml)', 72, 3.6, 5.2, 3.8, 'icecek', 'bardak'),
  f('cacik', 'Cacık', '1 kase (150 g)', 95, 4, 6.5, 6, 'sut-urunleri', 'kase'),
  f('sut', 'Süt (yarım yağlı)', '1 bardak (200 ml)', 92, 6.4, 9.4, 3, 'sut-urunleri', 'bardak'),
  f('kefir', 'Kefir', '1 bardak (200 ml)', 120, 6.6, 9, 6.4, 'sut-urunleri', 'bardak'),

  // Sebze & salata
  f('coban-salata', 'Çoban salata', '1 kase (≈200 g, 1,5 tatlı kaşığı yağ)', 110, 2, 9, 8.5, 'sebze-salata', 'kase'),
  f('mevsim-salata', 'Mevsim salata (yağlı)', '1 kase (≈150 g, 1 tatlı kaşığı yağ)', 78, 1.5, 5.5, 6.1, 'sebze-salata', 'kase'),
  f('kisir', 'Kısır', '1 porsiyon (150 g)', 245, 5.5, 34, 10, 'sebze-salata'),
  f('piyaz', 'Piyaz', '1 porsiyon (150 g)', 235, 10, 28, 10, 'sebze-salata'),
  f('salatalik', 'Salatalık', '1 adet (≈120 g)', 18, 0.8, 4.3, 0.1, 'sebze-salata', 'adet'),
  f('domates', 'Domates', '1 adet (≈120 g)', 22, 1.1, 4.7, 0.2, 'sebze-salata', 'adet'),

  // Meyve
  f('elma', 'Elma', '1 adet orta boy (≈180 g)', 95, 0.5, 25, 0.3, 'meyve', 'adet'),
  f('muz', 'Muz', '1 adet orta boy (≈120 g)', 105, 1.3, 27, 0.4, 'meyve', 'adet'),
  f('portakal', 'Portakal', '1 adet orta boy (≈130 g)', 62, 1.2, 15.4, 0.2, 'meyve', 'adet'),
  f('mandalina', 'Mandalina', '1 adet (≈90 g)', 47, 0.7, 11.8, 0.3, 'meyve', 'adet'),
  f('karpuz', 'Karpuz', '1 dilim (300 g)', 90, 1.8, 22.6, 0.5, 'meyve', 'dilim'),
  f('uzum', 'Üzüm', '1 kase (150 g)', 104, 1.1, 27, 0.2, 'meyve', 'kase'),
  f('cilek', 'Çilek', '1 kase (150 g)', 48, 1, 11.5, 0.5, 'meyve', 'kase'),
  f('kuru-kayisi', 'Kuru kayısı', '1 adet (10 g)', 24, 0.3, 6.3, 0.1, 'meyve', 'adet'),
  f('hurma', 'Hurma', '1 adet (8 g)', 23, 0.2, 6, 0, 'meyve', 'adet'),

  // Atıştırmalık
  f('ceviz', 'Ceviz', '1 tam ceviz içi (4 g)', 26, 0.6, 0.5, 2.6, 'atistirmalik', 'adet'),
  f('badem', 'Badem', '1 avuç (10 adet, 12 g)', 69, 2.5, 2.6, 6, 'atistirmalik', 'avuç'),
  f('findik', 'Fındık', '1 avuç (10 adet, 14 g)', 88, 2.1, 2.3, 8.5, 'atistirmalik', 'avuç'),
  f('leblebi', 'Leblebi', '1 avuç (30 g)', 115, 6.3, 17, 1.8, 'atistirmalik', 'avuç'),
  f('protein-bar', 'Protein bar', '1 adet (60 g)', 220, 20, 22, 7, 'atistirmalik', 'adet'),
  f('cips', 'Cips', '1 küçük paket (40 g)', 214, 2.8, 21, 13.9, 'atistirmalik'),

  // Tatlı
  f('baklava', 'Baklava', '1 dilim (40 g)', 170, 2.6, 17, 10.5, 'tatli', 'dilim'),
  f('sutlac', 'Sütlaç', '1 kase (150 g)', 190, 5, 31, 4.5, 'tatli', 'kase'),
  f('kunefe', 'Künefe', '1 porsiyon (150 g)', 520, 12, 55, 28, 'tatli'),
  f('cikolata', 'Sütlü çikolata', 'Çeyrek tablet (25 g)', 134, 1.9, 14.9, 7.4, 'tatli'),
  f('dondurma', 'Dondurma', '2 top (100 g)', 207, 3.5, 23.6, 11, 'tatli'),

  // İçecek
  f('cay-sekersiz', 'Çay (şekersiz)', '1 bardak', 2, 0, 0.3, 0, 'icecek', 'bardak'),
  f('cay-sekerli', 'Çay (2 şeker)', '1 bardak (2 kesme şeker, 7 g)', 28, 0, 7, 0, 'icecek', 'bardak'),
  f('turk-kahvesi', 'Türk kahvesi (sade)', '1 fincan (7 g kahve)', 7, 0.3, 1, 0.2, 'icecek', 'fincan'),
  f('latte', 'Latte', '1 orta boy (≈350 ml)', 190, 13, 19, 7, 'icecek', 'bardak'),
  f('portakal-suyu', 'Taze portakal suyu', '1 bardak (200 ml)', 93, 1.4, 21.5, 0.4, 'icecek', 'bardak'),
  f('kola', 'Kola', '1 kutu (330 ml)', 139, 0, 35, 0, 'icecek', 'kutu'),
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
