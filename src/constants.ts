import { Exercise } from './types';

export const EXERCISE_DATABASE: Exercise[] = [
  // --- CARDIO / WARMUP ---
  { 
    id: '1', 
    name: 'Jumping Jacks', 
    duration: 30, 
    reps: '30 Sn', 
    category: 'cardio', 
    equipment: ['none'], 
    image: '/images/jumping_jacks.png',
    description: 'Tüm vücudu ısıtan, kalp ritmini hızlandıran ve lenfatik sistemi uyaran temel kardiyo hareketi.',
    howTo: [
      'Dik dur, ayaklar bitişik, kollar yanda — başlangıç pozisyonu.',
      'Zıpla ve aynı anda bacakları yana aç, kolları baş üstünde birleştir.',
      'Tekrar zıpla, bacakları kapat ve kolları yanlara indir.',
      'Ritimli ve sürekli bir tempo ile tekrarla.',
      'Nefesini düzenli tut; her atlayışta nefes ver.',
    ]
  },
  { 
    id: '2', 
    name: 'Dağ Tırmanışı (Mountain Climber)', 
    duration: 40, 
    reps: '40 Sn', 
    category: 'cardio', 
    equipment: ['none'], 
    image: '/images/mountain_climber.png',
    description: 'Yüksek yoğunluklu karın aktivasyonu, omuz stabilitesi ve yağ yakımı için ideal dinamik egzersiz.',
    howTo: [
      'Yüz üstü plank pozisyonuna geç — eller omuz altında, vücut düz bir çizgide.',
      'Sağ dizi hızlıca göğse doğru çek, ardından geri uzat.',
      'Hemen sol dizi göğse doğru çek — sanki yerinde koşuyorsun.',
      'Her iki bacakla dönüşümlü ve ritmik olarak devam et.',
      'Kalçanı yukarı kaldırma, bel düz kalsın; tempo arttıkça yoğunluk artar.',
    ]
  },
  { 
    id: '12', 
    name: 'Burpee', 
    duration: 30, 
    reps: '10-12 Tekrar', 
    category: 'cardio', 
    equipment: ['none'], 
    image: '/images/burpee.png',
    description: 'Patlayıcı güç, anaerobik kapasite ve dayanıklılık için en etkili tam vücut egzersizi.',
    howTo: [
      'Dik dur, ayaklar omuz genişliğinde — başlangıç pozisyonu.',
      'Çömelerek elleri yere koy, ağırlığını kollarına ver.',
      'Bacakları geriye fırlat, plank pozisyonuna geç.',
      'Bir şınav çek (opsiyonel), ardından bacakları tekrar göğse çek.',
      'Patlayıcı güçle yukarı zıpla, kolları başın üstünde birleştir.',
    ]
  },
  { 
    id: '30', 
    name: 'Plank Jacks', 
    duration: 40, 
    reps: '40 Sn', 
    category: 'cardio', 
    equipment: ['none'], 
    image: '/images/plank_jacks.png',
    description: 'Stabilizasyon gücünü, dinamik merkez bölgesini (core) ve kardiyak dayanıklılığı aynı anda sınayan elit varyasyon.',
    howTo: [
      'Plank pozisyonuna geç — eller omuz altında, vücut tepeden topuğa düz.',
      'Ayakları birlikte tut, karın ve kalça kaslarını sık.',
      'Her iki ayağı aynı anda yana fırlat — Jumping Jack gibi ama plankta.',
      'Hızlıca ayakları tekrar birleştir, plank formunu koru.',
      'Beli sarkıtma ve kalçayı havaya kaldırma; gövde sabit kalmalı.',
    ]
  },
  
  // --- UPPER BODY (Vücut Ağırlığı) ---
  { 
    id: '3', 
    name: 'Şınav (Push-ups)', 
    duration: 45, 
    reps: '15-20 Tekrar', 
    category: 'upper', 
    equipment: ['none'], 
    image: '/images/sinav_pushup.png',
    description: 'Göğüs (pectoralis), anterior deltoid ve triceps kaslarını hedefleyen, gövde stabilitesi gerektiren klasik kuvvet hareketi.',
    howTo: [
      'Eller omuz genişliğinde yere koy, parmak uçlarına bas.',
      'Vücut baştan topukta düz bir çizgi oluştursun, karın kaslarını sık.',
      'Dirsekleri arkaya doğru çekerek göğüs yere değene kadar in.',
      'Patlama gücüyle yukaryı iterek başlangıç pozisyonuna dön.',
      'Boyun nötr kalmalı, başı ne yukarı ne aşağı e.',
    ] 
  },
  { 
    id: '32', 
    name: 'Arka Kol Süzülme (Tricep Dips)', 
    duration: 45, 
    reps: '15 Tekrar', 
    category: 'upper', 
    equipment: ['none'], 
    image: '/images/tricep_dips.png',
    description: 'Vücut ağırlığıyla üst gövdeyi, omuz önlerini ve arka kolları (triceps) mükemmel biçimde çalıştıran kalistenik egzersiz.',
    howTo: [
      'Bir sandalye veya sehpanın kenarına elleri omuz genişliğinde koy, parmaklar öne baksın.',
      'Bacakları öne uzat, topuklar yerde — vücudu kollarla tut.',
      'Dirsekleri geriye doğru bükerek vücudu aşağı indir (90 derece).',
      'Triceps kaslarını sıkarak başlangıç pozisyonuna geri dön.',
      'Dirsekleri yanlara açma; hareket boyunca arkaya doğru kıvrılmalı.',
    ]
  },

  // --- LOWER BODY ---
  { 
    id: '6', 
    name: 'Squat', 
    duration: 45, 
    reps: '20 Tekrar', 
    category: 'lower', 
    equipment: ['none'], 
    image: '/images/squat.png',
    description: 'Bacak, quadriceps ve gluteal (kalça) kompleksi için alt vücudun vazgeçilmez temel fonksiyonel kraliçe hareketi.',
    howTo: [
      'Ayakları omuz genişliğinde aç, ayak parmakları hafifçe dışa baksın.',
      'Elleri ense arkasında kilitle ya da öne uzat — sırt dik kalmalı.',
      'Kalçayı geriye ve aşağıya doğru it, sanki bir sandalyeye oturuyorsun.',
      'Dizler ayak parmakları yönünde ilerlesin, içe kapanmasın.',
      'Uyluklar yere paralel gelince dur, topuklardan basarak yukarı dön.',
    ]
  },
  { 
    id: '16', 
    name: 'Pistol Squat', 
    duration: 60, 
    reps: '6-8 Tekrar (Her bacak)', 
    category: 'lower', 
    equipment: ['none'], 
    image: '/images/pistol_squat.png',
    description: 'Tek bacak üzerinde çömelme içeren; olağanüstü mobilite, derin denge, diz sağlığı ve üst düzey unilateral güç egzersizi.',
    howTo: [
      'Tek ayak üzerinde dik dur, diğer bacağını düz bir şekilde öne doğru uzat.',
      'Dengeyi sağlamak için kollarını öne doğru uzat ve gövdeni dik tutmaya çalış.',
      'Destek bacağının dizini bükerek kalçanı kontrollüce geriye ve aşağıya doğru indir.',
      'Diğer bacağın yere paralel veya yere değmeyecek şekilde havada kalmasını sağla.',
      'Topuğundan güç alarak ve karın kaslarını sıkarak başlangıç pozisyonuna geri dön.',
    ]
  },
  { 
    id: '7', 
    name: 'Lunge', 
    duration: 45, 
    reps: '12 Tekrar (Her bacak)', 
    category: 'lower', 
    equipment: ['none'], 
    image: '/images/lunge.png',
    description: 'Yürüme mekaniğini güce dönüştüren, kalça asimetrisini azaltan ve dengeli bacak izolasyonu sunan egzersiz.',
    howTo: [
      'Ayaklarını kalça genişliğinde açarak dik bir şekilde dur.',
      'Gövdeni dik tutarak öne doğru büyük bir adım at.',
      'Arka dizin yere yaklaşana ve ön dizin 90 derece olana kadar kalçanı indir.',
      'Ön dizinin ayak parmak uçlarını geçmemesine dikkat et.',
      'Öndeki topuğundan güç alarak başlangıç pozisyonuna geri dön.',
    ]
  },
  { 
    id: '24', 
    name: 'Glute Bridge', 
    duration: 45, 
    reps: '20 Tekrar', 
    category: 'lower', 
    equipment: ['none'], 
    image: '/images/glute_bridge.png',
    description: 'Kalça kaslarını (gluteal zincir) omurgaya yük bindirmeden izole eden ve bel ağrılarını önleyen değerli hareket.',
    howTo: [
      'Sırt üstü uzan, dizlerini bük ve ayak tabanlarını kalça genişliğinde yere koy.',
      'Kollarını gövdenin iki yanına uzat, avuç içlerin yere baksın.',
      'Topuklarından basarak kalçanı yukarı kaldır, dizlerinden omuzlarına düz bir çizgi oluştur.',
      'Yukarıda kalça kaslarını 1-2 saniye boyunca sıkıca sık.',
      'Kalçanı kontrollü bir şekilde indirerek başlangıç pozisyonuna geri dön.',
    ]
  },
  { 
    id: '33', 
    name: 'Yanal Lunge (Side Lunge)', 
    duration: 45, 
    reps: '12 Tekrar', 
    category: 'lower', 
    equipment: ['none'], 
    image: '/images/side_lunge.png',
    description: 'Yanal (frontal) düzlemde hareket ederek bacak iç/dış kaslarını ve kalça yan bağlarını güçlendiren koruyucu bir egzersiz.',
    howTo: [
      'Ayaklarını kalça genişliğinde açarak dik bir şekilde dur.',
      'Gövdeni dik tutarak sağa veya sola doğru geniş bir adım at.',
      'Adım attığın bacağın dizini bükerek kalçanı geriye ve aşağıya doğru it.',
      'Diğer bacağını tamamen gergin ve ayak tabanını yerde sabit tut.',
      'Bükülü dizinin topuğundan basarak kendini başlangıç pozisyonuna geri it.',
    ]
  },

  // --- CORE ---

  { 
    id: '9', 
    name: 'Plank', 
    duration: 60, 
    reps: '60 Sn', 
    category: 'core', 
    equipment: ['none'], 
    image: '/images/plank_jacks.png',
    description: 'Transversus abdominis gibi en iç katman karın kaslarını izometrik kasılmayarak omurgayı bir korse gibi sarıp sabitleyen altın hareket.' 
  },
  { 
    id: '10', 
    name: 'Crunch', 
    duration: 45, 
    reps: '25 Tekrar', 
    category: 'core', 
    equipment: ['none'], 
    image: '/images/crunch.png',
    description: 'Rectus abdominis (üst karın) kas liflerini izole ederek karın bölgesinde belirginleşme ve kuvvet kazandırır.',
    howTo: [
      'Sırt üstü uzan, dizlerini 90 derece bükerek ayak tabanlarını yere bas.',
      'Ellerini ense arkasında gevşekçe kavuştur — boynu zorlamadan tut.',
      'Nefes ver ve karın kaslarını sıkarak üst sırtını yerden kaldır, omuz küreklerini yerden kopar.',
      'Birkaç saniye üstte kal ve karın kaslarını sık, ardından kontrollü şekilde geri in.',
      'Hareketi bel değil, sadece üst sırtla yap; ani sallanmadan kaçın.',
    ] 
  },
  // --- YOGA & FLEXIBILITY ---
  { 
    id: '40', 
    name: 'Kobra Duruşu (Cobra Pose)', 
    duration: 45, 
    reps: '45 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Göğsü ve akciğerleri açan, omurga esnekliğini koruyan ve omuz gerginliğini hafifleten köklü bir yoga asanası (Bhujangasana).',
    image: '/images/kobra_durusu.png'
  },
  { 
    id: '42', 
    name: 'Aşağı Bakan Köpek (Downward-Facing Dog)', 
    duration: 45, 
    reps: '45 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Omuzları, sırtı, hamstringleri ve baldırları uzatarak tüm vücut gerginliğini serbest bırakan meşhur ters dönme pozu (Adho Mukha Svanasana).',
    image: '/images/42.png'
  },
  { 
    id: '45', 
    name: 'Çocuk Pozu (Child\'s Pose)', 
    duration: 60, 
    reps: '60 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Tüm omurgayı gevşeten, adrenal bezleri sakinleştiren ve derin diyafram nefesiyle zihni yenileyen restoratif dinlenme pozu (Balasana).',
    image: '/images/45.png'
  },
  { 
    id: 'y_easy_sitting', 
    name: 'Kolay Oturuş (Easy Sukhasana)', 
    duration: 45, 
    reps: '45 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Bağdaş kurarak dik bir omurga ile oturma pozu. Zihni sakinleştirir, kalçaları hafifçe açar ve meditasyona hazırlar.',
    image: '/images/y_easy_sitting.png'
  },
  { 
    id: 'y_lotus', 
    name: 'Lotus Pozu (Lotus Padmasana)', 
    duration: 45, 
    reps: '45 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Ayak tabanlarının zıt uylukların üzerine yerleştirildiği derin kalça açıcı meditasyon pozu. Enerji akışını dengeler ve duruşu güvenceye alır.',
    image: '/images/y_lotus.png'
  },
  { 
    id: 'y_low_lunge', 
    name: 'Alçak Fente Pozu (Low Lunge Anjaneyasana)', 
    duration: 45, 
    reps: '45 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Arka diz yerde, gövdenin dikleşerek kolların göğe doğru kaldırıldığı kalça açıcı zarafet pozu.',
    image: '/images/y_low_lunge.png'
  },
  { 
    id: 'y_calf_stretch_block', 
    name: 'Blok Üzerinde Baldır Germe (Calf Stretch on Block)', 
    duration: 45, 
    reps: '45 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Blok veya basamak üzerinde topuğun aşağı sarkıtılarak baldır ve aşil tendonunun derinlemesine uzatıldığı hazırlık pozu.',
    image: '/images/y_calf_stretch_block.png'
  },
  { 
    id: 'y_half_forward_fold', 
    name: 'Yarı Yol Açılma - Eller Kaval Kemiğinde (Half Forward Fold)', 
    duration: 45, 
    reps: '45 Sn Tut', 
    category: 'yoga', 
    equipment: ['none'], 
    description: 'Sırtın yere paralel uzatıldığı, ellerin kaval kemiklerine dayanarak omurgayı düzleştirdiği ve hamstringleri uyandırdığı asana (Ardha Uttanasana).',
    image: '/images/y_half_forward_fold.png'
  }
];
