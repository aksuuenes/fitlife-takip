import React from 'react';
import { motion } from 'motion/react';

interface Props {
  category: string;
  exerciseName: string;
}

export default function AnatomyAtlas({ category, exerciseName }: Props) {
  // Get active muscle groups based on category and exercise
  const getMuscleFocus = () => {
    switch (category) {
      case 'upper':
        if (exerciseName.includes('Kablo Yan Omuz') || exerciseName.includes('seated_cable_lateral_raise') || exerciseName.includes('seated cable')) {
          return {
            title: 'Lateral Deltoid (Yan Omuz)',
            level: 'İzole Gerilim',
            description: 'Kablo istasyonunda tüm hareket boyunca lateral deltoid lifleri üzerinde kesintisiz mekanik gerilim ve maksimum tepe izolasyonu.',
            muscles: { chest: 0.1, shoulders: 0.98, back: 0.2, arms: 0.3, core: 0.3, legs: 0.0 }
          };
        }
        if (exerciseName.includes('Çeneye Çekiş') || exerciseName.includes('upright_row') || exerciseName.includes('Upright Row')) {
          return {
            title: 'Anterior & Lateral Deltoid (Ön ve Yan Omuz)',
            level: 'Bileşik Çekiş',
            description: 'Trapezius ve omuz başlarını birleştiren kinetik zincir. Dirsekler yukarıda, bar omuza yakın hattan çekilir.',
            muscles: { chest: 0.2, shoulders: 0.95, back: 0.45, arms: 0.4, core: 0.35, legs: 0.0 }
          };
        }
        if (exerciseName.includes('Yüz Çekişi') || exerciseName.includes('face-pull') || exerciseName.includes('Face-Pull') || exerciseName.includes('face_pull')) {
          return {
            title: 'Posterior Deltoid & Skapula (Arka Omuz)',
            level: 'Postür & Stabilite',
            description: 'Arka omuz başları ve rotator manşet kasları. Kürek kemiklerinin (skapula) retraksiyonu ve dış rotasyon odaklı egzersiz.',
            muscles: { chest: 0.0, shoulders: 0.97, back: 0.7, arms: 0.3, core: 0.3, legs: 0.0 }
          };
        }
        if (exerciseName.includes('Bicep') || exerciseName.includes('Hammer')) {
          return {
            title: 'Biceps & Ön Kol',
            level: 'İzole Kuvvet',
            description: 'Pazu ve brakioradialis kaslarında maksimum kasılma ve tepe noktası aktivasyonu.',
            muscles: { chest: 0.1, shoulders: 0.2, back: 0.1, arms: 0.9, core: 0.2, legs: 0.0 }
          };
        }
        if (exerciseName.includes('Şınav') || exerciseName.includes('Press')) {
          return {
            title: 'Pektoral & Triceps',
            level: 'Bileşik İtiş',
            description: 'Büyük göğüs kası (Pectoralis Major) lifleri, ön omuz ve arka kolların senkronize çalışması.',
            muscles: { chest: 0.9, shoulders: 0.6, back: 0.1, arms: 0.6, core: 0.4, legs: 0.0 }
          };
        }
        if (exerciseName.includes('Barfiks') || exerciseName.includes('Row')) {
          return {
            title: 'Latissimus Dorsi & Trapez',
            level: 'Bileşik Çekiş',
            description: 'Kanat kasları, skapula çevresi çekici kaslar ve bicepslerin entegre kinetik zinciri.',
            muscles: { chest: 0.1, shoulders: 0.4, back: 0.9, arms: 0.6, core: 0.3, legs: 0.0 }
          };
        }
        return {
          title: 'Üst Vücut Kompleksi',
          level: 'Omuz & Üst Ekstremite',
          description: 'Deltoid kasları, rotator manşet ve stabilizör üst gövde kaslarının dengesi.',
          muscles: { chest: 0.5, shoulders: 0.8, back: 0.5, arms: 0.5, core: 0.3, legs: 0.0 }
        };

      case 'lower':
        if (exerciseName.includes('Squat') || exerciseName.includes('Lunge')) {
          return {
            title: 'Quadriceps & Gluteuslar',
            level: 'Alt Ekstremite Güç',
            description: 'Uyluk ön bölgesi, gluteal kompleks (kalça) ve diz/ayak bileği eklem stabilizasyonu.',
            muscles: { chest: 0.0, shoulders: 0.0, back: 0.2, arms: 0.0, core: 0.4, legs: 0.9 }
          };
        }
        if (exerciseName.includes('Deadlift') || exerciseName.includes('Bridge')) {
          return {
            title: 'Arka Zincir (Posterior Chain)',
            level: 'Kalça & Hamstring',
            description: 'Arka bacak kasları, gluteus maximus ve erektör spinaların tam koordinasyonlu uyarımı.',
            muscles: { chest: 0.0, shoulders: 0.1, back: 0.4, arms: 0.0, core: 0.5, legs: 0.8 }
          };
        }
        return {
          title: 'Alt Vücut & Mobilite',
          level: 'Dinamik Bacak Gücü',
          description: 'İliopsoas, adduktörler ve baldır kaslarını (calf) kapsayan fonksiyonel mobilite.',
          muscles: { chest: 0.0, shoulders: 0.0, back: 0.1, arms: 0.0, core: 0.3, legs: 0.7 }
        };

      case 'core':
        if (exerciseName.includes('Russian Twist') || exerciseName.includes('Gövde Rotasyonu')) {
          return {
            title: 'Oblikler & Rotasyonel Zincir',
            level: 'İzole & Rotasyonel',
            description: 'İç ve dış oblik (yan karın) kaslarının rotasyonel stabilizasyon ve dinamik bükülme performansı.',
            muscles: { chest: 0.1, shoulders: 0.3, back: 0.4, arms: 0.1, core: 0.95, legs: 0.2 }
          };
        }
        if (exerciseName.includes('Crunch Hold') || exerciseName.includes('İzometrik') || exerciseName.includes('Reach-Through') || exerciseName.includes('Mekik')) {
          return {
            title: 'Üst Rectus Abdominis (Üst Karın)',
            level: 'Yoğun Sıkıştırma',
            description: 'Karın duvarının üst liflerini maksimum gerilim altında fleksiyona zorlayan izole çalışma.',
            muscles: { chest: 0.2, shoulders: 0.1, back: 0.2, arms: 0.1, core: 0.95, legs: 0.1 }
          };
        }
        if (exerciseName.includes('Knee Tucks') || exerciseName.includes('Çekişi') || exerciseName.includes('Flutter Kicks') || exerciseName.includes('Çırpma')) {
          return {
            title: 'Alt Rectus Abdominis (Alt Karın)',
            level: 'Pelvik Stabilizasyon',
            description: 'Alt karın lifleri, transversus abdominis ve iliopsoas (kalça bükücü) kaslarının sinerjik gücü.',
            muscles: { chest: 0.1, shoulders: 0.1, back: 0.3, arms: 0.2, core: 0.95, legs: 0.4 }
          };
        }
        if (exerciseName.includes('Reverse') || exerciseName.includes('Ters Mekik')) {
          return {
            title: 'Tüm Rectus Abdominis Kompleksi',
            level: 'Derin Fleksiyon',
            description: 'Alt omurganın yuvarlanmasıyla karın kaslarının baştan uca tam kontolü ve hipertrofisi.',
            muscles: { chest: 0.1, shoulders: 0.1, back: 0.3, arms: 0.1, core: 0.98, legs: 0.3 }
          };
        }
        return {
          title: 'Core & Merkez Bölge',
          level: 'Stabilizasyon / Fleksiyon',
          description: 'Rectus abdominis, transversus abdominis ve obliklerin omurgayı koruyucu zırh gibi sarması.',
          muscles: { chest: 0.2, shoulders: 0.2, back: 0.3, arms: 0.1, core: 0.9, legs: 0.2 }
        };

      case 'cardio':
        return {
          title: 'Metabolik Kardiyo Zinciri',
          level: 'Yağ Yakımı & Dayanıklılık',
          description: 'Tüm vücut kaslarının yüksek oksijen ve dolaşım talebiyle eş zamanlı koordinasyonu.',
          muscles: { chest: 0.4, shoulders: 0.4, back: 0.4, arms: 0.4, core: 0.6, legs: 0.7 }
        };

      case 'yoga':
        if (exerciseName.includes('Kedi') || exerciseName.includes('Cat') || exerciseName.includes('44')) {
          return {
            title: 'Kedi Esnemesi (Marjaryasana)',
            level: 'Omurga Mobilizasyonu',
            description: 'Derin kürek kemiği açılımı, bütün güç sırt kaslarına (erector spinae, trapezius) ve core bükülümüne yönlendirilir.',
            muscles: { chest: 0.1, shoulders: 0.5, back: 0.85, arms: 0.3, core: 0.6, legs: 0.1 }
          };
        }
        if (exerciseName.includes('İnek') || exerciseName.includes('Cow') || exerciseName.includes('y_cow')) {
          return {
            title: 'İnek Esnemesi (Bitilasana)',
            level: 'Ön Zincir Açılımı',
            description: 'Göğüs ve boğaz açılımı desteklenirken bel çukurunun dekompresyonu sağlanır, sırt kaslarını güçlendirir.',
            muscles: { chest: 0.5, shoulders: 0.4, back: 0.8, arms: 0.3, core: 0.4, legs: 0.1 }
          };
        }
        if (exerciseName.includes('Aşağı Bakan') || exerciseName.includes('Downward') || exerciseName.includes('42')) {
          return {
            title: 'Aşağı Bakan Köpek (Adho Mukha)',
            level: 'Bütünsel Ters Duruş',
            description: 'Omuz stabilizörleri, humerus rotatörleri, hamstringler ve gastrocnemius (baldır) kaslarını yoğun şekilde uzatır.',
            muscles: { chest: 0.3, shoulders: 0.9, back: 0.85, arms: 0.7, core: 0.6, legs: 0.85 }
          };
        }
        if (exerciseName.includes('Kobra') || exerciseName.includes('Cobra') || exerciseName.includes('40')) {
          return {
            title: 'Kobra Duruşu (Bhujangasana)',
            level: 'Omurga Ekstansiyonu',
            description: 'Bel erektörleri aktif esner, pektoral (göğüs) kasları açılır, omuz başları geriye doğru dekompresyon yaşar.',
            muscles: { chest: 0.6, shoulders: 0.5, back: 0.85, arms: 0.5, core: 0.4, legs: 0.2 }
          };
        }
        if (exerciseName.includes('Savaşçı I') || exerciseName.includes('Warrior I') || exerciseName.includes('y_warrior1')) {
          return {
            title: 'Savaşçı I (Virabhadrasana I)',
            level: 'Alt Gövde Gücü & Odak',
            description: 'Quadriceps ve gluteus kasları izometrik olarak yüklenirken, omuzlar ve göğüs yukarı uzamayla canlanır.',
            muscles: { chest: 0.4, shoulders: 0.6, back: 0.5, arms: 0.5, core: 0.7, legs: 0.9 }
          };
        }
        if (exerciseName.includes('Savaşçı II') || exerciseName.includes('Warrior II') || exerciseName.includes('41')) {
          return {
            title: 'Savaşçı II (Virabhadrasana II)',
            level: 'Yanal Açılış & Güç',
            description: 'Derin kalça dış rotasyonu, uyluk adduktör esnemesi, kolların ve omuzların yatay hizada statik direnci.',
            muscles: { chest: 0.3, shoulders: 0.8, back: 0.6, arms: 0.7, core: 0.75, legs: 0.9 }
          };
        }
        if (exerciseName.includes('Ters Savaşçı') || exerciseName.includes('Reverse') || exerciseName.includes('y_reverse_warrior')) {
          return {
            title: 'Ters Savaşçı (Viparita)',
            level: 'Yanal Akciğer Açılımı',
            description: 'Alt ekstremite lunge gücünü korurken, gövde yan kasları (oblikler, interkostaller) asimetrik uzatılır.',
            muscles: { chest: 0.4, shoulders: 0.65, back: 0.7, arms: 0.6, core: 0.75, legs: 0.85 }
          };
        }
        if (exerciseName.includes('Sandalye') || exerciseName.includes('Chair') || exerciseName.includes('y_chair')) {
          return {
            title: 'Sandalye Pozu (Utkatasana)',
            level: 'Statik Güç & Isı',
            description: 'Gluteal kaslar ve quadriceps ekstrem yük çeker. Sırt düzlüğü ve omuzlar yukarı yönde aktif kalır.',
            muscles: { chest: 0.2, shoulders: 0.6, back: 0.7, arms: 0.4, core: 0.8, legs: 0.95 }
          };
        }
        if (exerciseName.includes('Koşucu') || exerciseName.includes('Runner') || exerciseName.includes('y_runner_lunge')) {
          return {
            title: 'Koşucu Hamlesi (Ashwa Sanchalanas)',
            level: 'Fleksör ve Kalça Açılımı',
            description: 'Arka kuadriseps ve psoas kasları gerilir, ön kalça fleksiyon mekaniği derin şekilde rahatlatılır.',
            muscles: { chest: 0.1, shoulders: 0.3, back: 0.4, arms: 0.3, core: 0.5, legs: 0.85 }
          };
        }
        if (exerciseName.includes('Alçak Fente') || exerciseName.includes('Low Lunge') || exerciseName.includes('y_low_lunge')) {
          return {
            title: 'Alçak Fente (Anjaneyasana)',
            level: 'Uyluk & Kalça Esnekliği',
            description: 'Kalça bükücü psoas liflerinin tam esnemesi. Omurga geriye doğru zarif bir yay oluşturarak açılır.',
            muscles: { chest: 0.4, shoulders: 0.5, back: 0.6, arms: 0.4, core: 0.6, legs: 0.85 }
          };
        }
        if (exerciseName.includes('Alçak Plank') || exerciseName.includes('Low Plank') || exerciseName.includes('Chaturanga') || exerciseName.includes('y_low_plank')) {
          return {
            title: 'Alçak Plank (Chaturanga Dandasana)',
            level: 'Yoğun Yerçekimi Direnci',
            description: 'Tüm vücut izometrik plank hizarında; triceps, omuz içi stabilizatörleri ve core bölgesi patlar.',
            muscles: { chest: 0.8, shoulders: 0.85, back: 0.5, arms: 0.9, core: 0.95, legs: 0.6 }
          };
        }
        if (exerciseName.includes('Yukarı Bakan') || exerciseName.includes('Upward Dog') || exerciseName.includes('y_upward_dog')) {
          return {
            title: 'Yukarı Bakan Köpek (Urdhva Mukha)',
            level: 'Geriye Derin Esneme',
            description: 'Omuzlar kulaklardan uzaklaşır, göğüs kafesi tamamen öne itilerek ön fasyal zincir canlandırılır.',
            muscles: { chest: 0.75, shoulders: 0.7, back: 0.8, arms: 0.65, core: 0.5, legs: 0.3 }
          };
        }
        if (exerciseName.includes('Dönen Yan Açı') || exerciseName.includes('Revolved') || exerciseName.includes('y_revolved_side_angle')) {
          return {
            title: 'Dönen Yan Açı (Parivrtta)',
            level: 'Gelişmiş Rotasyonel Denge',
            description: 'Derin gövde rotasyonu, psoas esnetmesi ve iç organ masaj etkisi. Yüksek denge odağı.',
            muscles: { chest: 0.3, shoulders: 0.6, back: 0.65, arms: 0.5, core: 0.8, legs: 0.85 }
          };
        }
        if (exerciseName.includes('Yan Açı') || exerciseName.includes('Extended Side') || exerciseName.includes('y_extended_side_angle')) {
          return {
            title: 'Uzatılmış Yan Açı (Utthita)',
            level: 'Yan Gövde Esnetmesi',
            description: 'Arka topuktan el parmak ucuna uzanan fasya hattının bütüncül uzatılması ve uyluk güçlenmesi.',
            muscles: { chest: 0.2, shoulders: 0.6, back: 0.6, arms: 0.5, core: 0.7, legs: 0.85 }
          };
        }
        if (exerciseName.includes('Üçgen') || exerciseName.includes('Triangle') || exerciseName.includes('y_triangle')) {
          return {
            title: 'Üçgen Pozu (Trikonasana)',
            level: 'Yanal Omurga & Hamstring',
            description: 'Her iki bacağın arkası (hamstring, baldır) gerilirken gövde yanları simetrik uzamayı deneyimler.',
            muscles: { chest: 0.2, shoulders: 0.6, back: 0.65, arms: 0.5, core: 0.7, legs: 0.85 }
          };
        }
        if (exerciseName.includes('Güvercin') || exerciseName.includes('Pigeon') || exerciseName.includes('y_pigeon')) {
          return {
            title: 'Güvercin Pozu (Kapotasana)',
            level: 'Derin Kalça & Piriformis',
            description: 'Öndeki bacak kalça ekleminin dış rotasyonu ile gluteus ve piriformis kaslarında derin fasya rahatlaması.',
            muscles: { chest: 0.1, shoulders: 0.2, back: 0.5, arms: 0.2, core: 0.4, legs: 0.9 }
          };
        }
        if (exerciseName.includes('Ceset') || exerciseName.includes('Corpse') || exerciseName.includes('Savasana') || exerciseName.includes('y_savasana')) {
          return {
            title: 'Ceset Pozu (Savasana)',
            level: 'Sıfır Gerilim / Reset',
            description: 'Tüm kaslar (iskelet ve mimik kasları) tamamen yer çekimine bırakılır. Parasempatik sinir sıfırlaması.',
            muscles: { chest: 0.05, shoulders: 0.05, back: 0.05, arms: 0.05, core: 0.05, legs: 0.05 }
          };
        }
        if (exerciseName.includes('Çocuk') || exerciseName.includes('Child') || exerciseName.includes('45')) {
          return {
            title: 'Çocuk Pozu (Balasana)',
            level: 'Restoratif Dinlenme',
            description: 'Boyun, omuz ve bel eklemlerinin yerçekimiyle pasif dinlenmesi, sakral dekompresyon.',
            muscles: { chest: 0.1, shoulders: 0.4, back: 0.65, arms: 0.2, core: 0.3, legs: 0.4 }
          };
        }
        if (exerciseName.includes('Ağaç') || exerciseName.includes('Tree') || exerciseName.includes('43')) {
          return {
            title: 'Ağaç Pozu (Vrikshasana)',
            level: 'Tek Bacak Stabilitesi',
            description: 'Destek bacağının ayak bileği ve baldır stabilizatörleri çalışır, kalça abdüktörleri yana açılır.',
            muscles: { chest: 0.1, shoulders: 0.4, back: 0.4, arms: 0.3, core: 0.6, legs: 0.8 }
          };
        }
        if (exerciseName.includes('Lotus') || exerciseName.includes('Kelebek') || exerciseName.includes('Oturuş') || exerciseName.includes('Sitting')) {
          return {
            title: 'Meditatif Medyan Hat Duruşu',
            level: 'Duruş & Kalça Açıcı',
            description: 'Düz bir omurga hizasında pelvis tabanı desteklenir, kalça rotator gluteal kaslar uzatılır.',
            muscles: { chest: 0.1, shoulders: 0.2, back: 0.5, arms: 0.1, core: 0.5, legs: 0.7 }
          };
        }
        return {
          title: 'Nöromüsküler Reset & Esneklik',
          level: 'Miyofasyal Gevşeme',
          description: 'Kas-fasyal ağlarının uzatılması, eklem dekompresyonu ve parasempatik aktivasyon.',
          muscles: { chest: 0.3, shoulders: 0.3, back: 0.5, arms: 0.3, core: 0.4, legs: 0.5 }
        };

      default:
        return {
          title: 'Bilinmeyen Odak',
          level: 'Dinamik Egzersiz',
          description: 'Sağlıklı yaşam ve genel fiziksel uyumluluğu destekleyen egzersiz modülü.',
          muscles: { chest: 0.3, shoulders: 0.3, back: 0.3, arms: 0.3, core: 0.3, legs: 0.3 }
        };
    }
  };

  const focus = getMuscleFocus();

  // Helper function to render opacity based on muscular involvement
  const getMuscleColor = (value: number) => {
    if (value >= 0.8) return 'fill-orange-500 stroke-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]';
    if (value >= 0.5) return 'fill-amber-400 stroke-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]';
    if (value >= 0.2) return 'fill-slate-700 stroke-slate-600';
    return 'fill-slate-800 stroke-slate-700';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col h-full justify-between">
      {/* Visual background lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(15,23,42,0.8)_100%)] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-slate-500 tracking-wider uppercase z-10 border-b border-l border-slate-850 bg-slate-950/40 rounded-bl-xl">
        KAS ATOMİZASYONU
      </div>

      <div className="relative z-10 space-y-4">
        <div>
          <span className="text-[10px] font-mono font-extrabold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-md tracking-wider">
            {focus.level}
          </span>
          <h4 className="text-lg font-display font-black tracking-tight mt-1 text-slate-150">
            {focus.title}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            {focus.description}
          </p>
        </div>

        {/* Muscular Grid Split */}
        <div className="grid grid-cols-2 gap-4 items-center bg-slate-950/30 p-3 rounded-2xl border border-slate-800/40">
          
          {/* Anatomical Schematic SVG */}
          <div className="flex justify-center items-center h-44">
            <svg viewBox="0 0 120 200" className="h-full w-auto">
              {/* Background scanning circles */}
              <circle cx="60" cy="100" r="50" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="0.5" strokeDasharray="2,4" />
              <circle cx="60" cy="100" r="30" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="0.5" strokeDasharray="2,4" />
              
              {/* Head / Neck */}
              <circle cx="60" cy="24" r="10" className="fill-slate-800 stroke-slate-700" strokeWidth="1" />
              
              {/* Shoulders (Deltoids) */}
              <path d="M 44 38 C 42 38, 40 42, 43 46 L 47 52 C 48 50, 48 44, 47 41 Z" className={getMuscleColor(focus.muscles.shoulders)} strokeWidth="1" />
              <path d="M 76 38 C 78 38, 80 42, 77 46 L 73 52 C 72 50, 72 44, 73 41 Z" className={getMuscleColor(focus.muscles.shoulders)} strokeWidth="1" />

              {/* Chest (Pectorals) */}
              <path d="M 48 40 L 60 41 L 60 58 L 47 55 Z" className={getMuscleColor(focus.muscles.chest)} strokeWidth="1" />
              <path d="M 72 40 L 60 41 L 60 58 L 73 55 Z" className={getMuscleColor(focus.muscles.chest)} strokeWidth="1" />

              {/* Arms (Biceps/Triceps/Forearms) */}
              <path d="M 41 46 L 35 65 L 30 85 C 29 88, 32 89, 34 86 L 41 68 L 45 53 Z" className={getMuscleColor(focus.muscles.arms)} strokeWidth="1" />
              <path d="M 79 46 L 85 65 L 90 85 C 91 88, 88 89, 86 86 L 79 68 L 75 53 Z" className={getMuscleColor(focus.muscles.arms)} strokeWidth="1" />

              {/* Back (Latissimus - Side showing) */}
              <path d="M 46 56 L 50 78 L 56 75 L 56 60 Z" className={getMuscleColor(focus.muscles.back)} strokeWidth="1" />
              <path d="M 74 56 L 70 78 L 64 75 L 64 60 Z" className={getMuscleColor(focus.muscles.back)} strokeWidth="1" />

              {/* Abdominals & Obliques (Core) */}
              <rect x="52" y="60" width="16" height="22" rx="2" className={getMuscleColor(focus.muscles.core)} strokeWidth="1" />
              <path d="M 49 61 L 52 61 L 51 81 L 48 76 Z" className={getMuscleColor(focus.muscles.core)} strokeWidth="1" />
              <path d="M 71 61 L 68 61 L 69 81 L 72 76 Z" className={getMuscleColor(focus.muscles.core)} strokeWidth="1" />

              {/* Hips & Glutes */}
              <path d="M 47 84 L 73 84 L 70 102 L 50 102 Z" className={getMuscleColor(Math.max(focus.muscles.legs * 0.9, focus.muscles.core * 0.5))} strokeWidth="1" />

              {/* Legs (Quadriceps/Hamstrings) */}
              <path d="M 48 104 L 58 104 L 55 145 L 43 140 Z" className={getMuscleColor(focus.muscles.legs)} strokeWidth="1" />
              <path d="M 72 104 L 62 104 L 65 145 L 77 140 Z" className={getMuscleColor(focus.muscles.legs)} strokeWidth="1" />

              {/* Calves & Lower Legs */}
              <path d="M 44 144 L 54 147 L 51 185 L 45 185 Z" className={getMuscleColor(focus.muscles.legs * 0.7)} strokeWidth="1" />
              <path d="M 76 144 L 66 147 L 69 185 L 75 185 Z" className={getMuscleColor(focus.muscles.legs * 0.7)} strokeWidth="1" />
            </svg>
          </div>

          {/* Muscle Focus Bars */}
          <div className="space-y-2 text-[10px] font-mono select-none">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[9px]">
                <span>CORE / KARIN</span>
                <span className={focus.muscles.core >= 0.7 ? 'text-orange-400 font-bold' : ''}>%{Math.round(focus.muscles.core * 100)}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${focus.muscles.core * 100}%` }} className={`h-full ${focus.muscles.core >= 0.7 ? 'bg-orange-500' : 'bg-slate-550'}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[9px]">
                <span>BACAK / ALT VÜCUT</span>
                <span className={focus.muscles.legs >= 0.7 ? 'text-orange-400 font-bold' : ''}>%{Math.round(focus.muscles.legs * 100)}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${focus.muscles.legs * 100}%` }} className={`h-full ${focus.muscles.legs >= 0.7 ? 'bg-orange-500' : 'bg-slate-550'}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[9px]">
                <span>SIRT / LATISSIMUS</span>
                <span className={focus.muscles.back >= 0.7 ? 'text-orange-400 font-bold' : ''}>%{Math.round(focus.muscles.back * 100)}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${focus.muscles.back * 100}%` }} className={`h-full ${focus.muscles.back >= 0.7 ? 'bg-orange-500' : 'bg-slate-550'}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[9px]">
                <span>GÖĞÜS / PECS</span>
                <span className={focus.muscles.chest >= 0.7 ? 'text-orange-400 font-bold' : ''}>%{Math.round(focus.muscles.chest * 100)}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${focus.muscles.chest * 100}%` }} className={`h-full ${focus.muscles.chest >= 0.7 ? 'bg-orange-500' : 'bg-slate-550'}`} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 text-[9px]">
                <span>KOLLAR & OMUZ</span>
                <span className={focus.muscles.shoulders >= 0.7 || focus.muscles.arms >= 0.7 ? 'text-orange-400 font-bold' : ''}>%{Math.round(Math.max(focus.muscles.shoulders, focus.muscles.arms) * 100)}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(focus.muscles.shoulders, focus.muscles.arms) * 100}%` }} className={`h-full ${Math.max(focus.muscles.shoulders, focus.muscles.arms) >= 0.7 ? 'bg-orange-500' : 'bg-slate-550'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kinetic Tips Footer */}
      <div className="pt-3 border-t border-slate-850 text-[10px] text-slate-500 font-mono flex items-center justify-between mt-3 z-10">
        <span>STABİLİZASYON: MAKS</span>
        <span className="text-emerald-500">OPTIMAL FORM</span>
      </div>
    </div>
  );
}
