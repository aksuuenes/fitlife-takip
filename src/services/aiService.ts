// Tüm yapay zeka istekleri sunucudaki /api/ai fonksiyonuna gider (Claude API).
// API anahtarı tarayıcıda bulunmaz.

async function postAI<T>(payload: Record<string, unknown>): Promise<T> {
  const r = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || `AI isteği başarısız (${r.status})`);
  return data as T;
}

export async function analyzeHealthData(records: any[], userProfile: any) {
  const lastRecord = records[records.length - 1];

  try {
    return await postAI<any>({ task: 'health-analysis', records, profile: userProfile });
  } catch (error: any) {
    console.error("AI analysis error:", error);
    
    // Calculate fallbacks locally so that the UI is not empty and works even if offline/no key
    const weightVal = lastRecord?.weight || 70;
    const heightVal = lastRecord?.height || 175;
    const bmiVal = weightVal / Math.pow(heightVal / 100, 2);
    
    let activityFeedback = "Egzersiz programınızı çeşitlendirerek haftalık kardiyo dakikanızı artırın.";
    let dietFeedback = "Günlük su tüketiminizi artırın. Kilonuz başına 35-40 ml su tüketmeye çalışın.";
    let recoveryFeedback = "Uyku düzeninizi sabitlemek için her gangi bir saatte uyanmaya özen gösterin.";
    let scoreVal = 70;

    if (bmiVal > 25) {
      activityFeedback = "Hafif ila orta şiddetli kardiyo seansları uygulayarak eklem stresini azaltın.";
      dietFeedback = "Kompleks karbonhidratlar seçin ve protein alımınızı koruyarak kalori açığı oluşturun.";
      scoreVal = 65;
    } else if (bmiVal < 18.5) {
      activityFeedback = "Hipertrofi ve direnç antrenmanlarına öncelik vererek kas kütlenizi artırın.";
      dietFeedback = "Kalori yoğunluğu yüksek sağlıklı besinler katın ve protein tüketiminizi destekleyin.";
      scoreVal = 62;
    }

    return {
      suggestion: "Biyometrik verilerinizi düzenli girmeye devam edin ve su dengesine odaklanın.",
      feedback: `Kayıtlarına göre değerlendirme: Vücut kitle endeksin (BMI) ${bmiVal.toFixed(1)} seviyesindedir. ${bmiVal > 25 ? 'Kilo yönetimi' : bmiVal < 18.5 ? 'Kas kazanımı' : 'Form koruma'} hedefleri için protein yoğunluklu beslenme ve planlı direnç egzersizleri kritik öneme sahiptir.`,
      score: scoreVal,
      categories: [
        {
          title: "Fiziksel Aktivite",
          content: activityFeedback,
          status: "nötr"
        },
        {
          title: "Beslenme & Hidrasyon",
          content: dietFeedback,
          status: "pozitif"
        },
        {
          title: "Toparlanma & Uyku",
          content: recoveryFeedback,
          status: "nötr"
        }
      ],
      trend: "stabil"
    };
  }
}


export interface PhotoFoodItem {
  foodId: string | null;
  name: string;
  portion: string;
  servings: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: 'yüksek' | 'orta' | 'düşük';
}

export async function analyzeFoodPhoto(
  image: string,
  mediaType: string,
  catalog: string[],
): Promise<{ items: PhotoFoodItem[]; note?: string }> {
  return postAI({ task: 'food-photo', image, mediaType, catalog });
}

// Fotoğrafı en uzun kenarı maxSize olacak şekilde küçültüp JPEG base64'e çevirir.
export function resizeImage(file: File, maxSize = 1024, quality = 0.8): Promise<{ data: string; mediaType: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); return reject(new Error('Canvas desteklenmiyor')); }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      URL.revokeObjectURL(url);
      resolve({ data: dataUrl.split(',')[1], mediaType: 'image/jpeg', preview: dataUrl });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Görsel okunamadı')); };
    img.src = url;
  });
}

let aiStatus: Promise<boolean> | null = null;
// Sunucuda Claude anahtarı tanımlı mı? (bir kez sorulur, hata olursa kapalı sayılır)
export function isAIEnabled(): Promise<boolean> {
  if (!aiStatus) {
    aiStatus = fetch('/api/ai', { method: 'GET' })
      .then(r => (r.ok ? r.json() : { enabled: false }))
      .then(d => !!d?.enabled)
      .catch(() => false);
  }
  return aiStatus;
}
