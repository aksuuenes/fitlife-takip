# FitLife — proje notları

Kişisel sağlık/fitness takip uygulaması. Sahibi Enes Aksu (aksuuenes). Türkçe arayüz; kullanıcıyla Türkçe konuşulur.
Kullanıcı siteyi çoğunlukla **iPhone'da ana ekran uygulaması (PWA)** olarak kullanır, mobil görünüm önceliklidir.
Önceden Google AI Studio (Gemini) ile yazıldı; Kasım 2026'dan itibaren Claude ile geliştiriliyor. AI Studio'nun GitHub erişimi kaldırıldı.

## Teknoloji
- React 19 + Vite + TypeScript + Tailwind v4, `motion/react` animasyonlar, `lucide-react` ikonlar, `recharts` grafikler
- Firebase Auth + Firestore (proje: `fitlife-5cc6c`, varsayılan veritabanı). Ayar: `src/firebase.ts`, `src/lib/firebase.ts`
- Misafir modu: veriler `localStorage`'da (`src/services/storageService.ts`)
- Yayın: Vercel (`fitlife-takip.vercel.app`), `master` dalına her push otomatik yayınlanır
- PWA: `vite-plugin-pwa` (`vite.config.ts`), iPhone simge/açılış ekranları `public/` ve `public/splash/`

## Yapay zeka
- Tüm AI çağrıları `api/ai.ts` (Vercel sunucu fonksiyonu) üzerinden Claude API'ye gider; anahtar tarayıcıya inmez.
- Ortam değişkenleri (Vercel): `ANTHROPIC_API_KEY` (zorunlu), `CLAUDE_MODEL`, `ALLOWED_ORIGINS` (isteğe bağlı).
- **Şu an anahtar tanımlı değil** (kullanıcı ücretsiz ilerlemek istedi). `GET /api/ai` → `{enabled:false}` döner;
  Beslenme'deki 📷 Fotoğraf sekmesi bu yüzden gizli, Analizler yerel yedek analizi gösterir.
- Görevler: `health-analysis`, `food-photo`. İstemci tarafı: `src/services/aiService.ts`.
- `npm run dev` `/api` fonksiyonlarını çalıştırmaz; AI'yi yerelde denemek için `npx vercel dev`.

## Veri yolları (Firestore)
`users/{uid}/profiles/{profileId}/` altında: `records`, `water/{date}`, `workouts`, `routines`, `notes`,
`supplements/{date}`, `medicationConfig`, `medicationLogs/{date}`, `supplementSettings/**`.
- **Öğünler (Beslenme):** `supplementSettings/meals/days/{date}` → `{ entries: MealEntry[] }`.
- **Beslenme ayarları:** `supplementSettings/nutrition` → favoriler, son yenenler, hedef kilo, haftalık hız, elle kcal (`NutritionSettings`).
  Misafirde `localStorage` `fitlife_nutrition_settings_{profileId}`.
  (Tarihsel nedenle `supplementSettings` altında; artık kural tüm `users/{uid}/**` ağacını kapsıyor.)
- **Firestore veritabanı 27 Kasım 2026'ya kadar HİÇ OLUŞTURULMAMIŞTI** (proje `fitlife-5cc6c`). O tarihe kadar veriler
  sadece her cihazın tarayıcı önbelleğinde (bekleyen yazmalar) duruyordu; cihazlar arası veri farkı bundandı.
  27 Kasım'da `(default)` veritabanı `eur3` konumunda oluşturuldu, bilgisayardaki bekleyen yazmalar sunucuya gitti.
- `firestore.rules` = konsolda yayınlı kural (kullanıcı yalnızca `users/{uid}/**`). Otomatik yüklenmez; değişirse
  Firebase konsolu → Firestore → Rules'tan elle yayınlanmalı.
- iOS / ana ekran uygulamasında Firestore `memoryLocalCache` (IndexedDB yok); masaüstünde `persistentMultipleTabManager`.
- Teşhis: Daha Fazla / yan menüdeki **Bağlantı testi** (token, REST, SDK okuması). 403 = kural/veritabanı sorunu.

## Önemli dosyalar
- `src/components/Layout.tsx` — masaüstü yan menü + mobil üst çubuk ve 5 sekmeli alt menü ("Daha Fazla" sayfası)
- `src/components/Nutrition.tsx` — Beslenme (Günlük / Hafta / Plan sekmeleri, besin ekleme sayfası)
- `src/components/nutrition/` — `GoalSheet` (hedef kilo/kalori), `NutritionWeekly` (7 gün grafiği, seri, kilo tahmini),
  `NutritionPlan` (7 günlük menü + alışveriş listesi), `NutritionTodayCard` (ana sayfa kartı)
- `src/lib/turkishFoods.ts` — ~90 Türk yemeği; değerler **1 birim** içindir. `unit`: adet/dilim/bardak/… tam sayı adımlı,
  kase/tabak/porsiyon/avuç yarım adımlı (`unitStep`, `servingsText`)
- `src/lib/nutrition.ts` — hedef kalori (Mifflin-St Jeor ×1,375), kilo tahmini, seri; `src/lib/mealPlans.ts` — menü kombinasyonları
- `src/hooks/useNutrition.ts` — `useMealStore`, `useBodyStats`, `useNutritionSettings`, `useNutritionGoals`
- `src/components/ui/BottomSheet.tsx` — alttan açılan sayfa: `document.body`'ye portal + klavyeye göre yükseklik
- `src/index.css` — en altta `@media (max-width: 767px)` mobil sıkılaştırma kuralları (`.app-main` altında)
- `src/components/DailyChecklist.tsx` — Günlük İlaçlar / Takviyeler ortak listesi (dokun = alındı, ⋯ = düzenle/sil sayfası, ekle).
  Takviye listesi `supplementSettings/list` (misafirde `fitlife_supplement_list_{profileId}`); kayıt yoksa varsayılan 4 takviye.
- `src/lib/bodyComp.ts` — yağ % (Deurenberg, cinsiyetli), iskelet kası, BMR. Cinsiyet Profil sayfasından seçilir;
  bilinmiyorsa erkek varsayılır. Erkek profilde "Döngü" menüden gizlenir.
- Günlük tarih anahtarı için `toDateKey(new Date())` kullan (yerel saat); `toISOString()` UTC olduğu için gece 00–03 arası önceki günü verir.
- `src/components/WeightChart.tsx` — recharts ana pakete girmesin diye ayrı, lazy yüklenir

## Dikkat
- **Profil yükleme (AuthContext):** Firestore okuması başarısız/zaman aşımı olursa profil ASLA yeniden oluşturulmaz ya da
  üzerine yazılmaz; sadece tekrar denenir. Yeni profil yalnızca sunucu kesin "yok" derse (`!metadata.fromCache`) ve `merge: true` ile yazılır.
  Son bilinen profil `localStorage` `fitlife_user_profile_{uid}`'de tutulur. (Eskiden 4 sn zaman aşımında boş profil yazılıp bilgiler sıfırlanıyordu.)
- **Google girişi:** Ana ekran uygulamasında (standalone) `signInWithRedirect` + `authDomain = fitlife-takip.vercel.app`;
  `/__/auth` ve `/__/firebase` `vercel.json` ile `fitlife-5cc6c.firebaseapp.com`'a aktarılır. Google Cloud OAuth istemcisinde
  `https://fitlife-takip.vercel.app/__/auth/handler` yönlendirme adresi kayıtlı olmalı. Tarayıcıda popup kullanılır.
- **Aktif profil:** Hesaptaki `activeProfileId` önceliklidir (cihazlar aynı profili göstersin).
- **Metinler:** Kullanıcı sitenin "yapay zeka ile yapılmış" gibi görünmesini istemiyor. Arayüzde "AI", "yapay zeka", "Claude",
  "Wellness AI", "PRO/Elit/Premium", "biyometrik" gibi ifadeler kullanma; sade Türkçe yaz ("Kişisel rapor", "Öneriler").
- Açılır pencereleri/alt sayfaları `BottomSheet` (portal) ile yap; `main` içinde `fixed` kullanılırsa alt menünün altında kalabilir.
  Layout'taki sayfa geçişi bu yüzden sadece opaklık animasyonu kullanıyor (transform yok).
- Kancalardan dönen nesneleri `useMemo` ile sabitle; `useEffect` bağımlılığında yeni nesne sonsuz yükleme döngüsü yapar.
- Hook'ları erken `return`'lerden önce çağır (Analysis'ta React #310 çökmesi bu yüzdendi).
- Görselleri service worker önbelleğine (`globPatterns`) ekleme; `public/images` çalışma anında önbelleğe alınıyor. Yeni görselleri ≤640px ve sıkıştırılmış ekle.
- Mobilde input yazı boyutu 16px (iOS yakınlaştırmasını önler) — `index.css`.
- Değişiklikleri ayrı dalda yap, PR aç; `master`'a birleştirmeden önce kullanıcıya sor (birleştirme = canlı yayın).
- Build kontrolü: `npm run build` ve `npx tsc --noEmit`.
