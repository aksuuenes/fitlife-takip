export interface PosterAsana {
  id: string;
  name: string;
  sanskritName: string;
  trName: string;
  category: string;
  difficulty: 'Başlangıç' | 'Orta Seviye' | 'İleri Seviye';
  benefits: string[];
  tips: string;
  image?: string;
}

// Exactly mapping the 20 famous asanas matching the uploaded infographic
export const POSTER_ASANAS: PosterAsana[] = [
  {
    id: 'y_easy_sitting',
    name: 'Easy Sukhasana',
    sanskritName: 'Sukhasana',
    trName: 'Kolay Oturuş',
    category: 'Oturma Pozları',
    difficulty: 'Başlangıç',
    benefits: ['Kalçaları açar', 'Omurgayı uzatır', 'Zihni sakinleştirir'],
    tips: 'Omurganızın dikliğini korumak için gerekirse altınıza ince bir blok yerleştirin.',
    image: '/images/y_easy_sitting.png'
  },
  {
    id: 'y_lotus',
    name: 'Lotus Padmasana',
    sanskritName: 'Padmasana',
    trName: 'Lotus Pozu',
    category: 'Oturma Pozları',
    difficulty: 'İleri Seviye',
    benefits: ['Kalçaları derinlemesine esnetir', 'Enerji kanallarını dengeler', 'Duruşu mükemmelleştirir'],
    tips: 'Dizlerinizde hassasiyet varsa zorlamayın, Yarım Lotus duruşunda kalın.',
    image: '/images/y_lotus.png'
  },
  {
    id: 'y_low_lunge',
    name: 'Low Lunge',
    sanskritName: 'Anjaneyasana',
    trName: 'Alçak Fente Duruşu',
    category: 'Kalça Açıcılar',
    difficulty: 'Başlangıç',
    benefits: ['Kalça bükücü kasları açar', 'Kasıkları ve uylukları uyarır', 'Sırtı rahatlatır'],
    tips: 'Arka dizinizi yavaşça yere koyun, kollarınızı kulak hizasından yukarı ve hafifçe arkaya açın.',
    image: '/images/y_low_lunge.png'
  },
  {
    id: '42',
    name: 'Downward Dog Adho Mukha Svanasana',
    sanskritName: 'Adho Mukha Svanasana',
    trName: 'Aşağı Bakan Köpek',
    category: 'Ters Duruşlar',
    difficulty: 'Başlangıç',
    benefits: ['Hamstring ve baldırları uzatır', 'Omurga disk aralarını açar', 'Zihne taze kan pompalar'],
    tips: 'Ellerinizle yeri güçlüce itin, önceliği sırtınızı dümdüz uzatmaya verin, gerekirse dizlerinizi hafif bükün.',
    image: '/images/42.png'
  },
  {
    id: '45',
    name: "Child's Pose Balasana",
    sanskritName: 'Balasana',
    trName: 'Çocuk Pozu',
    category: 'Dinlenmeler',
    difficulty: 'Başlangıç',
    benefits: ['Omurga ve kalçayı rahatlatır', 'Stresi ve yorgunluğu yok eder', 'Solunumu dengeler'],
    tips: 'Alnınızı mata yerleştirin, kollarınızı öne doğru uzatıp pasif, tamamen rahat bir uzamaya bırakın.',
    image: '/images/45.png'
  },
  {
    id: '40',
    name: 'Cobra Bhujangasana',
    sanskritName: 'Bhujangasana',
    trName: 'Kobra Duruşu',
    category: 'Geriye Eğilmeler',
    difficulty: 'Başlangıç',
    benefits: ['Bel ve omurgayı güçlendirir', 'Göğüs kafesini açar', 'Omuz gerginliğini azaltır'],
    tips: 'Omuzları kulaklar listesinden geriye ve aşağıya alın, dirseklerinizi hafifçe bükülü tutabilirsiniz.',
    image: '/images/kobra_durusu.png'
  },
  {
    id: 'y_calf_stretch_block',
    name: 'Calf Stretch on Block',
    sanskritName: 'Calf Stretch on Block',
    trName: 'Blok Üzerinde Baldır Germe',
    category: 'Isınmalar',
    difficulty: 'Başlangıç',
    benefits: ['Aşil tendonu ve baldırları derin uzatır', 'Hamstring gerginliğini azaltır', 'Topuk basış bütünlüğünü kolaylaştırır'],
    tips: 'Bloğun veya basamağın kenarına ayak parmak topunuzla basın, topuğunuzu kontrollü şekilde aşağı sarkıtarak gerilmeyi hissedin.',
    image: '/images/y_calf_stretch_block.png'
  },
  {
    id: 'y_half_forward_fold',
    name: 'Half Forward Fold',
    sanskritName: 'Ardha Uttanasana',
    trName: 'Yarı Yol Açılma',
    category: 'Isınmalar',
    difficulty: 'Başlangıç',
    benefits: ['Omurga disklerinin arasını açıp uzatır', 'Hamstringleri asanaya hazırlar', 'Sırt kaslarını kuvvetlendirir'],
    tips: 'Ellerinizi kaval kemiklerinize yerleştirin, başın tepesinden ileriye, kalçadan geriye uzayarak sırtınızı 90 derece düzleştirin.',
    image: '/images/y_half_forward_fold.png'
  },
  {
    id: 'y_standing_forward_fold',
    name: 'Standing Forward Fold',
    sanskritName: 'Uttanasana',
    trName: 'Ayakta Öne Eğilme',
    category: 'Öne Eğilmeler',
    difficulty: 'Başlangıç',
    benefits: [
      'Hamstring, baldır ve kalça kaslarını derinlemesine uzatır',
      'Omurgayı dekomprese eder ve bel ağrısını azaltır',
      'Zihni sakinleştirir, stresi giderir',
      'Sindirim sistemini uyarır',
      'Karın kasları ve pelvisi güçlendirir'
    ],
    tips: 'Bacakları birleştirin, dizler hafifçe bükük olabilir. Kalçadan katlanarak öne inin, eller ayaklara doğru uzanır. Omurga tabanından uzayarak öne katlayın, başınızı serbest bırakın ve nefes vererek kalçalarınızı yukarı kaldırın.'
  }
];

// Predefined sessions incorporating these posters
export const PRESET_CLASSES = [
  {
    id: 'spine_rehab_premium',
    title: 'Derin Omurga & Postür Uyanışı 🌅',
    description: 'Sabah uyanışında omurga mobilitesini artıran, duruşunuzu destekleyen ve beli rahatlatan, sadece premium PNG illüstrasyonlu asana akışı.',
    asanas: [
      'y_easy_sitting',
      '40',
      '45',
      'y_low_lunge',
      '42',
      'y_lotus'
    ],
    durationPerAsana: 45,
    tag: 'Günün Yıldızı',
    color: 'from-orange-500/10 via-amber-500/10 to-yellow-500/15 border-amber-300 text-amber-700 dark:border-amber-850'
  },
  {
    id: 'calf_hamstring_therapy',
    title: 'Hazırlık & Bacak Arkası Terapi Akışı 🐕',
    description: 'Aşağı Bakan Köpek asanasına hazırlık sağlayan, blok yardımıyla baldırları ve kaval kemiğini esneten rahatlatıcı alt vücut seansı.',
    asanas: [
      'y_calf_stretch_block',
      'y_half_forward_fold',
      '42',
      '45'
    ],
    durationPerAsana: 45,
    tag: 'Elit Terapi',
    color: 'from-sky-500/10 via-teal-500/10 to-emerald-500/15 border-sky-300 text-sky-700 dark:border-sky-850'
  }
];