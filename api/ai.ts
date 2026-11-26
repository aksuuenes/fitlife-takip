// Vercel sunucu fonksiyonu: tüm yapay zeka çağrıları buradan Claude API'ye gider.
// ANTHROPIC_API_KEY yalnızca Vercel ortam değişkenlerinde durur, tarayıcıya hiç inmez.
//
// Gerekli ortam değişkenleri (Vercel > Project > Settings > Environment Variables):
//   ANTHROPIC_API_KEY   — zorunlu
//   CLAUDE_MODEL        — isteğe bağlı (varsayılan: claude-sonnet-5-5)
//   ALLOWED_ORIGINS     — isteğe bağlı, virgülle ayrılmış (örn. https://fitlife-takip.vercel.app)

const DEFAULT_MODEL = 'claude-sonnet-5-5';
const MAX_IMAGE_BASE64 = 3_500_000; // ~2.6 MB görüntü
const ALLOWED_MEDIA = ['image/jpeg', 'image/png', 'image/webp'];

type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: any };
type Res = { status: (c: number) => Res; json: (b: unknown) => void; setHeader: (k: string, v: string) => void };

async function callClaude(system: string, content: unknown[], maxTokens: number): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY tanımlı değil');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || DEFAULT_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content }],
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Claude API ${r.status}: ${text.slice(0, 300)}`);
  }
  const data = await r.json();
  return (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('');
}

function extractJson(text: string): any {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('Yanıtta JSON bulunamadı');
  return JSON.parse(text.slice(start, end + 1));
}

function originAllowed(req: Req): boolean {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length === 0) return true;
  const origin = String(req.headers.origin || req.headers.referer || '');
  return allowed.some(a => origin.startsWith(a));
}

// ---------- Görevler ----------

async function healthAnalysis(body: any) {
  const records = Array.isArray(body.records) ? body.records.slice(-10) : [];
  const profile = body.profile ?? {};
  const last = records[records.length - 1];
  const prev = records[records.length - 2];
  const weightTrend = last && prev ? (last.weight - prev.weight).toFixed(1) : '0';
  const avgSleep = records.length
    ? (records.reduce((a: number, r: any) => a + (Number(r.sleepHours) || 0), 0) / records.length).toFixed(1)
    : 'Bilinmiyor';

  const system = `Sen deneyimli bir performans koçu ve beslenme danışmanısın. Türkçe, samimi ama profesyonel yazarsın.
Tıbbi teşhis koymazsın; ciddi sağlık riski görürsen doktora danışmayı önerirsin.
Yanıtını YALNIZCA geçerli JSON olarak verirsin, başka metin eklemezsin.`;

  const prompt = `Kullanıcı profili: ${JSON.stringify(profile)}
Son sağlık kayıtları: ${JSON.stringify(records)}
Ortalama uyku: ${avgSleep} saat
Kısa dönem kilo değişimi (son kayıt - önceki): ${weightTrend} kg

Şunları analiz et:
1. Fiziksel aktivite: BMI, sakatlık geçmişi ve enerji seviyesine göre egzersiz şiddeti ve türü. Sakatlık varsa uyarlamalar.
2. Beslenme ve hidrasyon: kilo trendine göre makro dağılımı, kilo başına su, önerilen besin grupları (Türk mutfağından örnekler ver).
3. Toparlanma ve uyku: uyku kalitesine göre 2-3 uygulanabilir madde.

Şu formatta JSON döndür:
{
  "suggestion": "Bu haftanın en kritik tek cümlelik önerisi",
  "feedback": "Mevcut durum, kilo trendi ve riskler hakkında detaylı analiz",
  "score": 0-100 arası tam sayı,
  "categories": [
    {"title": "Fiziksel Aktivite", "content": "...", "status": "pozitif" | "nötr" | "uyarı"},
    {"title": "Beslenme & Hidrasyon", "content": "...", "status": "pozitif" | "nötr" | "uyarı"},
    {"title": "Toparlanma & Uyku", "content": "...", "status": "pozitif" | "nötr" | "uyarı"}
  ],
  "trend": "yukarı" | "aşağı" | "stabil"
}`;

  const text = await callClaude(system, [{ type: 'text', text: prompt }], 2000);
  return extractJson(text);
}

async function foodPhoto(body: any) {
  const image = String(body.image || '');
  const mediaType = String(body.mediaType || 'image/jpeg');
  if (!image || image.length > MAX_IMAGE_BASE64) throw Object.assign(new Error('Görsel eksik veya çok büyük'), { status: 400 });
  if (!ALLOWED_MEDIA.includes(mediaType)) throw Object.assign(new Error('Desteklenmeyen görsel türü'), { status: 400 });

  // İstemci veritabanındaki besinleri "id|ad|porsiyon" satırları olarak yollar.
  const catalog = Array.isArray(body.catalog)
    ? body.catalog.slice(0, 300).map((s: unknown) => String(s).slice(0, 120)).join('\n')
    : '';

  const system = `Sen yemek fotoğraflarından besin değeri tahmin eden bir beslenme uzmanısın. Türk mutfağını çok iyi tanırsın.
Yanıtını YALNIZCA geçerli JSON olarak verirsin, başka metin eklemezsin.`;

  const prompt = `Fotoğraftaki her yemeği/içeceği ayrı ayrı belirle ve porsiyonunu tahmin et.

Önce aşağıdaki katalogdan eşleşen bir besin ara. Eşleşme varsa "foodId" alanına katalogdaki id'yi yaz ve "servings" alanına katalog porsiyonuna göre çarpanı yaz (0.5'in katları; örn. iki dilim ekmek = 2).
Katalogda yoksa "foodId": null yaz ve kalori/makroları kendin tahmin et.

Katalog (id|ad|porsiyon):
${catalog}

Fotoğrafta yiyecek yoksa "items" boş dizi olsun ve "note" alanında nedenini yaz.

JSON formatı:
{
  "items": [
    {"foodId": "mercimek-corbasi" | null, "name": "Türkçe ad", "portion": "tahmini porsiyon açıklaması", "servings": 1,
     "kcal": sayı, "protein": sayı, "carbs": sayı, "fat": sayı, "confidence": "yüksek" | "orta" | "düşük"}
  ],
  "note": "kısa not (isteğe bağlı)"
}
Not: kcal/protein/carbs/fat değerleri TOPLAM değerlerdir (servings dahil).`;

  const text = await callClaude(
    system,
    [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
      { type: 'text', text: prompt },
    ],
    1500,
  );
  const parsed = extractJson(text);
  const items = Array.isArray(parsed.items) ? parsed.items.slice(0, 15) : [];
  return { items, note: typeof parsed.note === 'string' ? parsed.note : undefined };
}

// ---------- Handler ----------

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Yalnızca POST' });
  if (!originAllowed(req)) return res.status(403).json({ error: 'İzin verilmeyen kaynak' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  try {
    switch (body.task) {
      case 'health-analysis':
        return res.status(200).json(await healthAnalysis(body));
      case 'food-photo':
        return res.status(200).json(await foodPhoto(body));
      default:
        return res.status(400).json({ error: 'Bilinmeyen görev' });
    }
  } catch (e: any) {
    console.error('AI error:', e?.message || e);
    return res.status(e?.status || 500).json({ error: e?.status ? e.message : 'Yapay zeka isteği başarısız oldu' });
  }
}
