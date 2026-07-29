export const getCorrectFormBullets = (name: string): string[] => {
  const normName = name.toLowerCase();
  if (normName.includes('squat')) {
    return [
      "Topuklar yere sıkı basmalı, göğüs dik tutulmalıdır.",
      "Dizler ayak parmak uçlarını geçmemeli ve dışarı açılmalıdır.",
      "Kalça geriye doğru, uyluklar yere paralel olana kadar inmelidir."
    ];
  }
  if (normName.includes('şınav') || normName.includes('push-up') || normName.includes('pushup')) {
    return [
      "Gövde baş-topuk arası düz bir çizgi halinde, karın sıkı olmalıdır.",
      "Dirsekler geriye doğru yaklaşık 45 derece açıyla gövdeye yakın bükülmelidir.",
      "Göğüs yere yaklaşmalı ama bel aşağıya bükülmemelidir."
    ];
  }
  if (normName.includes('plank')) {
    return [
      "Dirsekler tam olarak omuz ekleminin altında konumlanmalıdır.",
      "Karın ve kalça kasları maksimum seviyede sıkılmalıdır (aktif core).",
      "Bel aşağı çökmeyerek düz bir hat oluşturmalı, yere bakılmalıdır."
    ];
  }
  if (normName.includes('barfiks') || normName.includes('pull-up') || normName.includes('pullup')) {
    return [
      "Omuz genişliğinden biraz daha geniş tutuş tercih edilmelidir.",
      "Omuzlar geriye çekilip kürek kemikleri birleşerek yükselinmelidir.",
      "Göğüs kontrollüce bara doğru yaklaşmalı, iniş de yavaş olmalıdır."
    ];
  }
  if (normName.includes('curl') || normName.includes('biceps')) {
    return [
      "Dirsekler gövdeye paralel sabitlenmeli ve kesinlikle öne-arkaya kaçmamalıdır.",
      "Vücut sallanarak ivme kazanılmamalı, sadece ön kollar bükülmelidir.",
      "Tepe noktada kaslar sıkılmalı, ağırlık yavaş ve kontrollü indirilmelidir."
    ];
  }
  if (normName.includes('jumping') || normName.includes('jack')) {
    return [
      "Ayaklar parmak uçlarında yumuşakça sıçramalı, eklemlere şok binmemelidir.",
      "Kollar baş üzerinde düzgün bir yay çizerek birleşmelidir.",
      "Dizler hafif bükülü kalmalı, yere sert darbe yapılmamalıdır."
    ];
  }
  if (normName.includes('deadlift')) {
    return [
      "Omurga tamamen düz tutulmalı, sırt kesinlikle kamburlaşmamalıdır.",
      "Baş seviyeniz omurgayla hizalı olmalı, kalça geriye doğru itilmelidir.",
      "Dizler ve kalça koordineli kilitlenerek dik pozisyona gelinmelidir."
    ];
  }
  if (normName.includes('lunge')) {
    return [
      "Ön adımda diz açısı 90 derece olmalı ve diz parmak ucunu geçmemelidir.",
      "Arka diz yere dik ve kontrollü şekilde zemine doğru indirilmelidir.",
      "Gövdede dik duruş korunmalı ve vücut ağırlığı tam merkezde olmalıdır."
    ];
  }
  if (normName.includes('kobra') || normName.includes('cobra')) {
    return [
      "Eller göğüs hizasında, dirsekler vücuda yapışık olmalıdır.",
      "Avuç içleriyle itiş yaparken omuzlar kulaklardan uzak tutulmalıdır.",
      "Baş hafif yukarı kaldırılmalı ama lumbar/bel aşırı zorlanmamalıdır."
    ];
  }
  if (normName.includes('köpek') || normName.includes('downward')) {
    return [
      "Eller ve ayaklar mat genişliğinde basmalı, vücut ters V oluşturmalıdır.",
      "Kalça yukarı ve geriye doğru yönlendirilerek topuklar yere basılmalıdır.",
      "Baş omuzlar arasında serbestçe bırakılıp omurga uzatılmalıdır."
    ];
  }
  if (normName.includes('ağaç') || normName.includes('tree')) {
    return [
      "Yerdeki bacak dikey eksende stabil ve kilitli kalmalıdır.",
      "Denge için diğer ayak tabanı diz eklemi hariç uyluğun iç kısmına yerleştirilmelidir.",
      "Bakışlar karşıdaki hareketsiz tek bir noktaya sabitlenmelidir."
    ];
  }
  if (normName.includes('kedi') || normName.includes('cat') || normName.includes('cow')) {
    return [
      "Kedi duruşunda sırt yukarı kamburlaştırılıp baş aşağı bırakılmalıdır.",
      "İnek duruşunda karın yere yaklaştırılıp göğüs ve kafa yukarı kaldırılmalıdır.",
      "Geçişler nefesle senkronize ve omurlar tek tek hissedilerek yapılmalıdır."
    ];
  }
  if (normName.includes('çocuk') || normName.includes('child')) {
    return [
      "Kalça topukların üzerine oturmalı ve kollar ileriye düz uzatılmalıdır.",
      "Alın mat bölgesine rahatça değmeli, omuzlar tamamen serbest kalmalıdır.",
      "Derin diyafram nefesleriyle omurganın açılması ve rahatlaması hissedilmelidir."
    ];
  }
  if (normName.includes('kablo yan omuz') || normName.includes('cable lateral raise') || normName.includes('seated_cable_lateral_raise')) {
    return [
      "Oturarak omurgayı dik tutun, kablo direncinin sürekli ve yumuşak olmasına özen gösterin.",
      "Kolları yanlara doğru kaldırırken dirsekleri hafifçe bükülü tutun, omuz seviyenizin üzerine çıkmamaya çalışın.",
      "Ağırlığı indirirken yavaş ve kontrollü olun, omuz kaslarındaki sürekli gerilimi muhafaza edin."
    ];
  }
  if (normName.includes('upright row') || normName.includes('çeneye çekiş') || normName.includes('barbell_upright_row')) {
    return [
      "Halteri gövdenize çok yakın tutarak çene hizasına doğru kontrollü çekin.",
      "Tepe noktada dirsekleriniz daima ellerinizden ve omuzlarınızdan daha yüksekte olmalıdır.",
      "Belinizi geriye bükmeyin, boyun ve omuz başlarında sıkışma hissetmemek için hareketi dik postürle uygulayın."
    ];
  }
  if (normName.includes('face-pull') || normName.includes('halat yüz çekişi') || normName.includes('rope_face_pull')) {
    return [
      "Halatı yüzünüze/alnınıza doğru çekerken dirseklerinizi geriye ve dışarıya doğru açın (flaring).",
      "Çekişin sonunda omuzlarınızı dışa rotasyon yaptırarak (baş parmaklar arkayı gösterecek şekilde) arka omuzu sıkın.",
      "Gövdenizi sabit tutarak hafifçe geriye yaslanın, ivmeden kaçının ve kürek kemiklerini sıkıştırın."
    ];
  }
  return [
    "Duruş boyunca karın kasları (core) aktif, postür dik tutulmalıdır.",
    "Derin ve düzenli nefes alışverişi unutulmamalı, hareketler yavaş yapılmalıdır.",
    "Eklemlerinizi kilitlemeden kontrollü açılarda direnci hissedin."
  ];
};

export interface CheckpointHighlight {
  label: string;
  targetJoint: string;
  description: string;
  isActive: boolean;
  statusText: string;
  statusColor: string;
}

export const getCheckpoints = (exerciseName: string, range: number, progress: number): CheckpointHighlight[] => {
  const normName = exerciseName.toLowerCase();
  
  if (normName.includes('squat')) {
    return [
      {
        label: "Düz Omurga Açısı",
        targetJoint: 'head',
        description: "Gövde dik tutuluyor, bakışlar karşıda.",
        isActive: range < 0.4,
        statusText: range < 0.4 ? "DENGELİ DETEKT" : "KORUNDU",
        statusColor: "text-sky-400 border-sky-500/20"
      },
      {
        label: "Diz Hizalaması (<90°)",
        targetJoint: 'knL',
        description: "Dizler ayak parmak uçlarını geçmiyor.",
        isActive: range >= 0.6,
        statusText: range >= 0.85 ? "MÜKEMMEL AÇI (76°)" : "FLEX DETEKSİYONU",
        statusColor: range >= 0.7 ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20"
      },
      {
        label: "Kalça ve Topuk Teması",
        targetJoint: 'pelvis',
        description: "Ağırlık topuklara aktarılarak pelvis geriye itiliyor.",
        isActive: range > 0.3 && range < 0.8,
        statusText: "YÜK TRANSFERİ AKTİF",
        statusColor: "text-orange-400 border-orange-500/20"
      }
    ];
  }
  
  if (normName.includes('şınav') || normName.includes('push-up') || normName.includes('pushup') || normName.includes('plank')) {
    const isPlank = normName.includes('plank');
    return [
      {
        label: "Boyun & Omurga Çizgisi",
        targetJoint: 'head',
        description: "Boyun omurganın devamı olarak düz hizalanmış.",
        isActive: true,
        statusText: "KİLİTLİ & DOĞRU",
        statusColor: "text-emerald-400 border-emerald-500/20"
      },
      {
        label: "Dirsek Fleksiyonu",
        targetJoint: 'elL',
        description: "Dirsekler gövdeye yaklaşık 45 derece açıyla geride.",
        isActive: !isPlank && range >= 0.5,
        statusText: isPlank ? "STATİK YÜK" : (range >= 0.85 ? "ZİRVE PRES" : "GÜÇ TRANSFERİ"),
        statusColor: "text-amber-400 border-amber-500/20"
      },
      {
        label: "Core Stabilizasyonu",
        targetJoint: 'pelvis',
        description: "Karın ve kalça sıkı, belde çökme yok.",
        isActive: true,
        statusText: "STABİLİZASYON OK",
        statusColor: "text-cyan-400 border-cyan-500/20"
      }
    ];
  }

  if (normName.includes('barfiks') || normName.includes('pull-up') || normName.includes('pullup')) {
    return [
      {
        label: "Omuz & Skapula Kilidi",
        targetJoint: 'shL',
        description: "Kürek kemikleri birleşerek yukarı çekiş başlar.",
        isActive: range > 0.4,
        statusText: range > 0.75 ? "Maksimum Kasılma" : "AKTİF KİLİT",
        statusColor: "text-emerald-400 border-emerald-500/20"
      },
      {
        label: "Çene - Bar Hizası",
        targetJoint: 'head',
        description: "Çene kontrollü olarak barda tepe noktaya ulaşıyor.",
        isActive: range >= 0.8,
        statusText: range >= 0.8 ? "DOĞRU ZİRVE" : "YÜKSELİŞ HATTI",
        statusColor: "text-orange-400 border-orange-500/20"
      },
      {
        label: "Gövde Dengesi",
        targetJoint: 'pelvis',
        description: "Sallantısız, dikey kinetik düzlem korunuyor.",
        isActive: true,
        statusText: "DENGELİ",
        statusColor: "text-cyan-400 border-cyan-500/20"
      }
    ];
  }

  if (normName.includes('curl') || normName.includes('biceps')) {
    return [
      {
        label: "Sürücü Sabitliği",
        targetJoint: 'elL',
        description: "Dirsekler gövdede sabit, öne-arkaya oynamıyor.",
        isActive: true,
        statusText: "TAM İZOLASYON",
        statusColor: "text-emerald-405 border-emerald-500/20"
      },
      {
        label: "Bilek & Ön Kol Açısı",
        targetJoint: 'wrL',
        description: "Bilek bükülmeden yük tamamen biceps kasında.",
        isActive: range > 0.5,
        statusText: range > 0.82 ? "PİK SIKIŞMA" : "GÜÇ ODALI",
        statusColor: "text-amber-400 border-amber-500/20"
      }
    ];
  }

  if (normName.includes('deadlift')) {
    return [
      {
        label: "Düz Bel Omurgası",
        targetJoint: 'chest',
        description: "Omurga tamamen düz, kamburlaşma önlendi.",
        isActive: true,
        statusText: "MÜKEMMEL HİZALAMA",
        statusColor: "text-emerald-400 border-emerald-500/20"
      },
      {
        label: "Kalça Menteşesi",
        targetJoint: 'pelvis',
        description: "Kalçe geriye doğru esneyerek yükü taşıyor.",
        isActive: range > 0.35,
        statusText: range > 0.75 ? "KİNETİK SIKIŞMA" : "EMENTEŞE AKTİF",
        statusColor: "text-orange-400 border-orange-500/20"
      },
      {
        label: "Diz Kilitlenmesi",
        targetJoint: 'knL',
        description: "Dizler çok az bükülü, öne çöküş yok.",
        isActive: true,
        statusText: "STABİL AKS SÜRÜMÜ",
        statusColor: "text-cyan-400 border-cyan-500/20"
      }
    ];
  }

  if (normName.includes('lunge')) {
    return [
      {
        label: "Ön Diz Açısı (90°)",
        targetJoint: 'knL',
        description: "Ön bacak diz açısı 90 derecede kalır.",
        isActive: range > 0.5,
        statusText: range > 0.8 ? "90 DERECE OK" : "HATA BULUNMADI",
        statusColor: "text-emerald-400 border-emerald-500/20"
      },
      {
        label: "Arka Diz Fleksi",
        targetJoint: 'knR',
        description: "Arka diz yere paralel ve kontrollü iniyor.",
        isActive: range > 0.45,
        statusText: "YÜK DENGELEME",
        statusColor: "text-orange-400 border-orange-500/20"
      },
      {
        label: "Duruş Ekseni",
        targetJoint: 'head',
        description: "Gövde dik tutuluyor, ağırlık merkezde.",
        isActive: true,
        statusText: "DİK OMURGA",
        statusColor: "text-cyan-400 border-cyan-500/20"
      }
    ];
  }

  if (normName.includes('kablo yan omuz') || normName.includes('cable lateral raise') || normName.includes('seated_cable_lateral_raise')) {
    return [
      {
        label: "Sürekli Kablo Gerilimi",
        targetJoint: 'wrL',
        description: "Yan omuz (lateral deltoid) sürekli gerilim altında.",
        isActive: true,
        statusText: range > 0.7 ? "ZİRVE GERİLİM" : "KONTROLLÜ AKIŞ",
        statusColor: range > 0.7 ? "text-emerald-400 border-emerald-500/20" : "text-sky-400 border-sky-500/20"
      },
      {
        label: "Oturma Postürü",
        targetJoint: 'pelvis',
        description: "Pelvis sabit, omurga nötr pozisyonda korunuyor.",
        isActive: true,
        statusText: "SABİT DESTEK",
        statusColor: "text-indigo-400 border-indigo-500/20"
      },
      {
        label: "Dirsek Pozisyonu",
        targetJoint: 'elL',
        description: "Dirseğin omuz hizası korunuyor.",
        isActive: range > 0.5,
        statusText: range > 0.85 ? "MÜKEMMEL HİZALAMA" : "YÜKLENME",
        statusColor: "text-emerald-400 border-emerald-500/20"
      }
    ];
  }
  if (normName.includes('upright row') || normName.includes('çeneye çekiş') || normName.includes('barbell_upright_row')) {
    return [
      {
        label: "Yüksek Dirsek Hizası",
        targetJoint: 'elL',
        description: "Dirsekler ellerin üzerinde yükseliyor.",
        isActive: range > 0.6,
        statusText: range >= 0.85 ? "ZİRVE ÇEKİŞ" : "DİNAMİK YÜKSELİŞ",
        statusColor: range >= 0.85 ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20"
      },
      {
        label: "Doğrusal Bar Hattı",
        targetJoint: 'chest',
        description: "Bar vücuda yakın bir hat üzerinde yükseltiliyor.",
        isActive: true,
        statusText: "KORUNDU",
        statusColor: "text-sky-400 border-sky-500/20"
      }
    ];
  }
  if (normName.includes('face-pull') || normName.includes('halat yüz çekişi') || normName.includes('rope_face_pull')) {
    return [
      {
        label: "Dış Rotasyon",
        targetJoint: 'wrL',
        description: "Halat uçları alna doğru çekilerek dış rotasyon sağlanıyor.",
        isActive: range > 0.7,
        statusText: range >= 0.85 ? "ARKA OMUZ SIKIŞTIRMA" : "ROTASYON FAZI",
        statusColor: range >= 0.85 ? "text-emerald-400 border-emerald-500/20" : "text-sky-400 border-sky-500/20"
      },
      {
        label: "Skapular Retraksiyon",
        targetJoint: 'chest',
        description: "Kürek kemikleri sıkıştırılarak koruyucu omuz stabilitesi sağlanır.",
        isActive: range > 0.5,
        statusText: "AKSİYAL STABİLİTE",
        statusColor: "text-indigo-400 border-indigo-500/20"
      }
    ];
  }

  return [
    {
      label: "Omurga Uzantısı",
      targetJoint: 'chest',
      description: "Omurga kontrollü şekilde uzatılarak dekompresyon sağlanıyor.",
      isActive: true,
      statusText: "AKTİF UZAMA",
      statusColor: "text-cyan-400 border-cyan-500/20"
    },
    {
      label: "Merkez Çekirdek Gücü",
      targetJoint: 'pelvis',
      description: "Karın duvarı omurgayı desteklemek için gerilmektedir.",
      isActive: range > 0.5,
      statusText: "CORE AKTİF",
      statusColor: "text-emerald-400 border-emerald-500/20"
    },
    {
      label: "Zemin Dengesi",
      targetJoint: 'anL',
      description: "Zemine doğru stabil yük dağılımı sürdürülüyor.",
      isActive: true,
      statusText: "YÜKSEK STABİLİTE",
      statusColor: "text-sky-400 border-sky-500/20"
    }
  ];
};
