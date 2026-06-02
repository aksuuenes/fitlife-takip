import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please add it via Settings > Secrets in AI Studio.");
    }
    aiInstance = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export async function analyzeHealthData(records: any[], userProfile: any) {
  const model = "gemini-3.5-flash";
  
  // Calculate some basic trends to help the model
  const lastRecord = records[records.length - 1];
  const previousRecord = records[records.length - 2];
  const weightTrend = previousRecord ? (lastRecord.weight - previousRecord.weight).toFixed(1) : "0";
  
  const prompt = `
    Sen profesyonel bir elit performans koçu, biyomekanik uzmanı ve beslenme danışmanısın. Aşağıdaki kullanıcı verilerini derinlemesine analiz ederek kişiselleştirilmiş bir strateji hazırla.

    Kullanıcı Profili: ${JSON.stringify(userProfile)}
    Son 7-10 Günlük Sağlık Kayıtları: ${JSON.stringify(records)}
    Kullanıcının Ortalama Uyku Süresi: ${records.length > 0 ? (records.reduce((acc, r) => acc + (r.sleepHours || 0), 0) / records.length).toFixed(1) : "N/A"} saat
    Kısa Dönem Kilo Değişimi (Son kayıt vs önceki): ${weightTrend} kg
    
    Analizinde özellikle şunlara odaklan:
    1. **Fiziksel Aktivite**: Kullanıcının BMI durumuna, sakatlık geçmişine ve güncel enerji seviyesine göre hangi şiddette ve hangi tür egzersizler yapmalı? Sakatlık varsa spesifik modifikasyonlar öner.
    2. **Beslenme & Hidrasyon**: Kilo trendine ve BMI kategorisine göre makro dağılımı (protein/karb/yağ) nasıl olmalı? Su tüketimi kilo başına ne kadar olmalı? Spesifik besin grupları öner.
    3. **Toparlanma & Uyku**: Kullanıcının bildirdiği uyku kalitesi ogüvenlik durumuna göre toparlanma (recovery) stratejileri öner. Uyku kalitesini artırmak için eyleme geçirilebilir 2-3 madde ekle.

    Lütfen şu formatta JSON döndür (Türkçe):
    {
      "suggestion": "Bu haftanın en kritik eyleme geçirilebilir 'Tek Cümlelik' anahtarı",
      "feedback": "Kullanıcının mevcut durumu, kilo trendi ve sağlık riskleri hakkında detaylı profesyonel bir analiz.",
      "score": 0-100 arası bütünsel sağlık puanı (mevcut verilere göre iyileşme potansiyelini de yansıt),
      "categories": [
        {
          "title": "Fiziksel Aktivite",
          "content": "Çok spesifik, süreli veya tekrarlı egzersiz önerileri. Sakatlık varsa koruyucu önlemler.",
          "status": "pozitif" | "nötr" | "uyarı"
        },
        {
          "title": "Beslenme & Hidrasyon",
          "content": "Örn: 'Günlük x gram protein hedefle', 'Kilo başına y ml su iç'. Spesifik beslenme stratejisi.",
          "status": "pozitif" | "nötr" | "uyarı"
        },
        {
          "title": "Toparlanma & Uyku",
          "content": "Uyku hijyeni ve toparlanma protokolleri (soğuk duş, esneme, magnezyum vb. duruma göre).",
          "status": "pozitif" | "nötr" | "uyarı"
        }
      ],
      "trend": "yukarı" | "aşağı" | "stabil"
    }
  `;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini Content Generator.");
    }

    return JSON.parse(responseText.trim());
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    
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
      feedback: `Health Tracker size özel yerel analiz yaptı: Vücut Kitle Endeksiniz (BMI) ${bmiVal.toFixed(1)} seviyesindedir. ${bmiVal > 25 ? 'Kilo yönetimi' : bmiVal < 18.5 ? 'Kas kazanımı' : 'Form koruma'} hedefleri için protein yoğunluklu beslenme ve planlı direnç egzersizleri kritik öneme sahiptir.`,
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
