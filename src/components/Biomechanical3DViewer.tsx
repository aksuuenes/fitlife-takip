import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Compass, HelpCircle, Activity, Info, Eye } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Joint {
  id: string;
  name: string;
  pos: Point3D;
  color?: string;
}

interface Bone {
  from: string;
  to: string;
  color?: string;
  activityColor?: string;
}

interface Props {
  exerciseName: string;
  isRest?: boolean;
}

const getCorrectFormBullets = (name: string): string[] => {
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

interface CheckpointHighlight {
  label: string;
  targetJoint: string;
  description: string;
  isActive: boolean;
  statusText: string;
  statusColor: string;
}

const getCheckpoints = (exerciseName: string, range: number, progress: number): CheckpointHighlight[] => {
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

export default function Biomechanical3DViewer({ exerciseName, isRest = false }: Props) {
  // Camera state
  const [yaw, setYaw] = useState<number>(-30); // Horizontal rotation angle in degrees
  const [pitch, setPitch] = useState<number>(-15); // Vertical view tilt in degrees
  const [zoom, setZoom] = useState<number>(1.1); // Camera zoom level
  const [autoRotate, setAutoRotate] = useState<boolean>(true); // Auto orbit toggle
  const [showJointNames, setShowJointNames] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showFormCheck, setShowFormCheck] = useState<boolean>(true);
  
  // Animation timing
  const [progress, setProgress] = useState<number>(0); // 0 to 1 cycle
  const p = progress * 2 * Math.PI; // cycle loop
  const range = (Math.sin(p) + 1) / 2; // 0 to 1 loop
  
  // Mouse / Touch drag reference
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  // Auto-rotating and time loop animation
  useEffect(() => {
    let lastTime = performance.now();
    
    const updateFrame = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Update cycle progress for movement (cycles every 3 seconds)
      setProgress((prev) => (prev + delta / 3000) % 1);

      // Auto rotation
      if (autoRotate) {
        setYaw((prev) => (prev + delta * 0.02) % 360);
      }

      animationFrameId.current = requestAnimationFrame(updateFrame);
    };

    animationFrameId.current = requestAnimationFrame(updateFrame);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [autoRotate]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    if (autoRotate) setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    
    setYaw((prev) => (prev + deltaX * 0.5) % 360);
    // Limit pitch to prevent flipping upside down
    setPitch((prev) => Math.max(-80, Math.min(80, prev - deltaY * 0.5)));
    
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (autoRotate) setAutoRotate(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
    
    setYaw((prev) => (prev + deltaX * 0.5) % 360);
    setPitch((prev) => Math.max(-80, Math.min(80, prev - deltaY * 0.5)));
    
    previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  // 3D Math Helper: Map coordinates from local 3D to rotated isometric 3D space
  const projectPoint = (pt: Point3D): { sx: number; sy: number; sz: number } => {
    // Convert degrees to radians
    const radYaw = (yaw * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    // Apply Yaw Rotation (around Y-axis / vertical axis)
    const x1 = pt.x * Math.cos(radYaw) - pt.z * Math.sin(radYaw);
    const z1 = pt.x * Math.sin(radYaw) + pt.z * Math.cos(radYaw);
    const y1 = pt.y;

    // Apply Pitch Rotation (around X-axis / horizontal screen axis)
    const y2 = y1 * Math.cos(radPitch) - z1 * Math.sin(radPitch);
    const z2 = y1 * Math.sin(radPitch) + z1 * Math.cos(radPitch);
    const x2 = x1;

    // Perspective transformation parameters
    const cameraDistance = 250;
    const scale = (cameraDistance / (cameraDistance + z2)) * zoom;

    // Center of 200x200 canvas
    const cx = 100;
    const cy = 100;

    // final projected coordinates
    const sx = cx + x2 * scale;
    const sy = cy + y2 * scale;

    return { sx, sy, sz: z2 }; // sz retains depth buffer for layer ordering & sizing
  };

  // Get active biomechanics calculations based on selected exercise
  const generateSkeleton = (): { joints: Joint[]; bones: Bone[]; highlightText: string; activeMuscle: string } => {
    const p = progress * 2 * Math.PI; // cycle loop
    const range = (Math.sin(p) + 1) / 2; // 0 to 1 loop
    const activeName = exerciseName.toLowerCase();

    // Default T-pose center points
    let headY = -45, neckY = -35, chestY = -15, pelvisY = 20;
    let shL_X = -22, shR_X = 22, shY = -23;
    let hipL_X = -12, hipR_X = 12, hipY = 22;
    
    let elL = { x: -38, y: -12, z: 0 };
    let elR = { x: 38, y: -12, z: 0 };
    let wrL = { x: -48, y: 5, z: 0 };
    let wrR = { x: 48, y: 5, z: 0 };

    let knL = { x: -14, y: 55, z: 0 };
    let knR = { x: 14, y: 55, z: 0 };
    let anL = { x: -14, y: 88, z: 0 };
    let anR = { x: 14, y: 88, z: 0 };

    let highlightText = "POSTÜREL DENGE ANALİZİ";
    let activeMuscle = "Quadriceps & Core";

    // Modulate coordinates dynamically using kinematics equations for specific exercise types
    if (isRest) {
      // Rest / Breathing pose - Soft chest expansion
      const breathe = Math.sin(p);
      headY += breathe * 2;
      wrL = { x: -35 - breathe * 10, y: 15, z: 15 };
      wrR = { x: 35 + breathe * 10, y: 15, z: 15 };
      anL = { x: -18, y: 90, z: 0 };
      anR = { x: 18, y: 90, z: 0 };
      highlightText = "PRANAYAMA: DERİN SOLUNUM";
      activeMuscle = "Diyafram & Interkostal";
    }
    else if (activeName.includes('squat')) {
      // Squat kinematics: knees push forward/out, hips lower back, torso leans slightly forward
      const squatDepth = range * 45; // lower 45 units
      pelvisY += squatDepth;
      chestY += squatDepth * 0.9;
      neckY += squatDepth * 0.85;
      headY += squatDepth * 0.85;
      
      shY += squatDepth * 0.9;
      hipY += squatDepth;

      // Knees move forward (negative Z) and slightly out
      knL = { x: -18, y: 58 + squatDepth * 0.2, z: -15 - squatDepth * 0.15 };
      knR = { x: 18, y: 58 + squatDepth * 0.2, z: -15 - squatDepth * 0.15 };

      // Hips push backward (positive Z)
      const hipOffsetZ = squatDepth * 0.55;
      hipL_X = -12;
      hipR_X = 12;

      // Heels stay firmly placed on floor
      anL = { x: -14, y: 90, z: 0 };
      anR = { x: 14, y: 90, z: 0 };

      // Arms go forward for balancing
      wrL = { x: -15, y: -20 + squatDepth * 0.5, z: -40 - squatDepth * 0.2 };
      wrR = { x: 15, y: -20 + squatDepth * 0.5, z: -40 - squatDepth * 0.2 };
      elL = { x: -22, y: -18 + squatDepth * 0.6, z: -25 };
      elR = { x: 22, y: -18 + squatDepth * 0.6, z: -25 };

      highlightText = `EKLEM AÇISI: ${Math.round(180 - squatDepth * 2.2)}° (DİZ/SQUAT)`;
      activeMuscle = "Quadriceps & Gluteus Max";
    }
    else if (activeName.includes('şınav') || activeName.includes('push-up') || activeName.includes('plank')) {
      // Horizontal pushup/plank layout. Rotate coordinates 80 degrees relative to horizontal
      const pushCycle = activeName.includes('plank') ? 0 : range * 25; // Plank remains static, Pushup flexes
      
      // Pivot entire body horizontally (Z represents height off ground, Y represents vertical body line)
      headY = -12 + pushCycle * 0.6;
      neckY = -5 + pushCycle * 0.55;
      chestY = 10 + pushCycle * 0.5;
      pelvisY = 32 + pushCycle * 0.15;
      hipY = 32 + pushCycle * 0.15;

      shY = 10 + pushCycle * 0.5;
      shL_X = -18;
      shR_X = 18;

      // Palms fixed on floor
      wrL = { x: -22, y: 12, z: 25 };
      wrR = { x: 22, y: 12, z: 25 };

      // Elbows flare outward and back
      elL = { x: -35 - pushCycle * 0.4, y: 8 + pushCycle * 0.2, z: 12 - pushCycle * 0.4 };
      elR = { x: 35 + pushCycle * 0.4, y: 8 + pushCycle * 0.2, z: 12 - pushCycle * 0.4 };

      // Core plank line from hips to ankles
      knL = { x: -10, y: 55 + pushCycle * 0.1, z: 12 };
      knR = { x: 10, y: 55 + pushCycle * 0.1, z: 12 };
      
      // Toes anchored close together
      anL = { x: -6, y: 85, z: 8 };
      anR = { x: 6, y: 85, z: 8 };

      highlightText = activeName.includes('plank') 
        ? "MUKAVEMET: İNDÜKLENMİŞ İZOMETRİK CORE" 
        : `TENSION REFLEX: ${Math.round(pushCycle * 3.6)}% TRICEPS`;
      activeMuscle = "Pectoralis Major & Core";
    }
    else if (activeName.includes('barfiks') || activeName.includes('pull-up')) {
      // Vertical hang up and down
      const pullUpDepth = range * 35; // moves up up to 35 units
      
      headY = -55 + pullUpDepth;
      neckY = -45 + pullUpDepth;
      chestY = -25 + pullUpDepth;
      pelvisY = 5 + pullUpDepth;
      hipY = 5 + pullUpDepth;
      shY = -30 + pullUpDepth;

      // Hands fixed to high bar
      wrL = { x: -32, y: -70, z: 0 };
      wrR = { x: 32, y: -70, z: 0 };

      // Elbows pull down and inwards
      elL = { x: -38 + pullUpDepth * 0.4, y: -45 + pullUpDepth * 1.1, z: 5 };
      elR = { x: 38 - pullUpDepth * 0.4, y: -45 + pullUpDepth * 1.1, z: 5 };

      // Knees slightly bent under the pull-up bar
      knL = { x: -12, y: 40 + pullUpDepth, z: 15 };
      knR = { x: 12, y: 40 + pullUpDepth, z: 15 };
      anL = { x: -8, y: 70 + pullUpDepth, z: 10 };
      anR = { x: 8, y: 70 + pullUpDepth, z: 10 };

      highlightText = `KİNETİK SÜRTÜNME: LATISSIMUS %${Math.round(40 + range * 60)}`;
      activeMuscle = "Latissimus Dorsi & Biceps";
    }
    else if (activeName.includes('curl')) {
      // Bicep / Hammer curls path: rotation of forearm around elbow joint
      const curlAngle = range * (Math.PI * 0.8); // up to 144 degrees of flexion
      
      // Standing position remains rigid
      wrL = {
        x: -36,
        y: -12 - Math.sin(curlAngle) * 28,
        z: -Math.cos(curlAngle) * 28
      };
      wrR = {
        x: 36,
        y: -12 - Math.sin(curlAngle) * 28,
        z: -Math.cos(curlAngle) * 28
      };

      // Upper arm hanging straight down
      elL = { x: -35, y: -12, z: 0 };
      elR = { x: 35, y: -12, z: 0 };

      highlightText = `FLEKSİYON AÇISI: ${Math.round(180 - (curlAngle * 180) / Math.PI)}° (PİL YAPISI)`;
      activeMuscle = "Biceps Brachii & Forearms";
    }
    else if (activeName.includes('jumping') || activeName.includes('jacks')) {
      // Jumping jacks: synchronize arms jumping overhead to wide legs
      const jumpPct = range;
      
      // Torso bounces slightly
      const bounce = Math.sin(progress * 2 * Math.PI) * 4;
      headY -= bounce;
      neckY -= bounce;
      chestY -= bounce;
      pelvisY -= bounce;
      shY -= bounce;
      hipY -= bounce;

      // Arms swing from thighs (0) to fully overhead (PI)
      const armAngle = jumpPct * Math.PI * 0.95;
      wrL = {
         x: - shR_X - Math.sin(armAngle) * 35,
         y: shY + Math.cos(armAngle) * 35,
         z: 0
      };
      wrR = {
         x: shR_X + Math.sin(armAngle) * 35,
         y: shY + Math.cos(armAngle) * 35,
         z: 0
      };

      elL = {
         x: - shR_X - Math.sin(armAngle * 0.5) * 20,
         y: shY + Math.cos(armAngle * 0.5) * 20,
         z: 0
      };
      elR = {
         x: shR_X + Math.sin(armAngle * 0.5) * 20,
         y: shY + Math.cos(armAngle * 0.5) * 20,
         z: 0
      };

      // Legs bounce outwards
      anL = { x: -12 - jumpPct * 25, y: 88, z: 0 };
      anR = { x: 12 + jumpPct * 25, y: 88, z: 0 };
      knL = { x: -12 - jumpPct * 15, y: 55, z: -5 * jumpPct };
      knR = { x: 12 + jumpPct * 15, y: 55, z: -5 * jumpPct };

      highlightText = `PLİYOMETRİK FREKANS LİMİTİ: %${Math.round(65 + range * 35)}`;
      activeMuscle = "Deltoids & Calves";
    }
    else if (activeName.includes('deadlift')) {
      // Deadlift: bend from hip pivot, knees bend slightly, keeping spine flat
      const liftDepth = range * 45; // lower 45 units in hip flex
      
      // Hips push heavily backwards
      pelvisY += liftDepth * 0.3;
      hipY += liftDepth * 0.3;
      
      // Chest lowers and tilts forward
      chestY += liftDepth * 0.75;
      neckY += liftDepth * 0.85;
      headY += liftDepth * 0.88;
      shY += liftDepth * 0.75;

      // Knees bend slightly but stay centered
      knL = { x: -14, y: 55 + liftDepth * 0.1, z: -liftDepth * 0.25 };
      knR = { x: 14, y: 55 + liftDepth * 0.1, z: -liftDepth * 0.25 };
      anL = { x: -14, y: 90, z: 0 };
      anR = { x: 14, y: 90, z: 0 };

      // Arms hang straight down holding virtual weight
      wrL = { x: -22, y: shY + 38, z: -liftDepth * 0.35 };
      wrR = { x: 22, y: shY + 38, z: -liftDepth * 0.35 };
      elL = { x: -22, y: shY + 20, z: -liftDepth * 0.15 };
      elR = { x: 22, y: shY + 20, z: -liftDepth * 0.15 };

      highlightText = `POSTERIOR LOAD: ${Math.round(liftDepth * 1.8)}kg STRES`;
      activeMuscle = "Erector Spinae & Hamstring";
    }
    else if (activeName.includes('lunge')) {
      // Lunge: one leg goes deep forward, back knee drops close to floor
      const lungeDepth = range * 40;
      pelvisY += lungeDepth * 0.8;
      chestY += lungeDepth * 0.75;
      shY += lungeDepth * 0.75;
      headY += lungeDepth * 0.75;

      // Left leg deep forward (negative Z/positive Y)
      knL = { x: -14, y: 55 + lungeDepth * 0.2, z: -40 };
      anL = { x: -14, y: 90, z: -40 };

      // Right leg stretches far backward, knee drops near ground (positive Z)
      knR = { x: 14, y: 55 + lungeDepth * 0.9, z: 35 };
      anR = { x: 14, y: 90, z: 45 };

      // Arms stay locked on hips for posture control
      wrL = { x: -18, y: pelvisY - 8, z: 0 };
      wrR = { x: 18, y: pelvisY - 8, z: 0 };
      elL = { x: -28, y: pelvisY - 14, z: 5 };
      elR = { x: 28, y: pelvisY - 14, z: 5 };

      highlightText = `UNILATERAL DENGE YÜKLENMESİ: %${Math.round(75 + range * 25)}`;
      activeMuscle = "Quadriceps & Calves";
    }
    else if (activeName.includes('kobra') || activeName.includes('cobra')) {
      // Static high cobra posture (fully arched spine, look up)
      headY = 5;
      neckY = 22;
      chestY = 40;
      pelvisY = 80;
      hipY = 80;

      shY = 40;
      shL_X = -18;
      shR_X = 18;

      // Arms pushing vertical support - grounded on floor
      wrL = { x: -24, y: 88, z: -32 };
      wrR = { x: 24, y: 88, z: -32 };
      elL = { x: -28, y: 65, z: -28 };
      elR = { x: 28, y: 65, z: -28 };

      // Lower body laying flat on floor ground grid (at gridY = 90)
      knL = { x: -10, y: 86, z: 20 };
      knR = { x: 10, y: 86, z: 20 };
      anL = { x: -6, y: 88, z: 55 };
      anR = { x: 6, y: 88, z: 55 };

      highlightText = "LUMBAR MOBİLİZASYON: AKTİF";
      activeMuscle = "Omurga Erektörleri";
    }
    else if (activeName.includes('köpek') || activeName.includes('downward')) {
      // Static Downward Dog (Inverted 3D 'V' form)
      pelvisY = -48;
      hipY = -48;
      chestY = -15;
      neckY = 5;
      headY = 20;

      shY = -15;
      shL_X = -15;
      shR_X = 15;

      // Palms flat forward
      wrL = { x: -22, y: 78, z: -40 };
      wrR = { x: 22, y: 78, z: -40 };
      elL = { x: -20, y: 32, z: -30 };
      elR = { x: 20, y: 32, z: -30 };

      // Heels anchored flat backward
      knL = { x: -15, y: 15, z: 30 };
      knR = { x: 15, y: 15, z: 30 };
      anL = { x: -15, y: 78, z: 48 };
      anR = { x: 15, y: 78, z: 48 };

      highlightText = "SIRT/HAMSTRING KİNETİK ZİNCİR UZAMASI";
      activeMuscle = "Posterior Zincir & Omuz";
    }
    else if (activeName.includes('ağaç') || activeName.includes('tree')) {
      // Static balance tree pose (One standing leg, other foot pressed inside thigh, palms overhead)
      headY = -48;
      neckY = -38;
      chestY = -18;
      pelvisY = 20;
      hipY = 20;

      // Left leg standing strong
      knL = { x: -12, y: 55, z: 0 };
      anL = { x: -12, y: 90, z: 0 };

      // Right leg folded inside left inner thigh
      knR = { x: 22, y: 45, z: -18 };
      anR = { x: -10, y: 35, z: 0 };

      // Hands joined overhead in Namaste prayer
      wrL = { x: 0, y: -72, z: 4 };
      wrR = { x: 0, y: -72, z: 4 };
      elL = { x: -16, y: -45, z: 12 };
      elR = { x: 16, y: -45, z: 12 };

      highlightText = "NÖRAL DENGE: SENSORİMOTORSAL ENTEGRASYON";
      activeMuscle = "Ankle Stabilizers & Core";
    }
    else if (activeName.includes('kablo') || activeName.includes('lateral raise') || activeName.includes('seated_cable_lateral_raise')) {
      // Seated Cable Lateral Raise
      pelvisY = 30; // Seated position
      hipY = 32;
      chestY = -5;
      neckY = -25;
      headY = -35;
      
      // Knees bent, sitting
      knL = { x: -22, y: 56, z: -15 };
      knR = { x: 22, y: 56, z: -15 };
      anL = { x: -22, y: 90, z: -5 };
      anR = { x: 22, y: 90, z: -5 };

      // Arm abduction with cables
      const raiseAngle = range * (Math.PI * 0.45); // up to 81 degrees
      wrL = { x: -18 - Math.sin(raiseAngle) * 35, y: shY + 15 - Math.sin(raiseAngle) * 20 + (1 - Math.sin(raiseAngle)) * 10, z: -Math.cos(raiseAngle) * 10 };
      wrR = { x: 18 + Math.sin(raiseAngle) * 35, y: shY + 15 - Math.sin(raiseAngle) * 20 + (1 - Math.sin(raiseAngle)) * 10, z: -Math.cos(raiseAngle) * 10 };
      elL = { x: -18 - Math.sin(raiseAngle) * 18, y: shY + 10 - Math.sin(raiseAngle) * 10, z: -Math.cos(raiseAngle) * 5 };
      elR = { x: 18 + Math.sin(raiseAngle) * 18, y: shY + 10 - Math.sin(raiseAngle) * 10, z: -Math.cos(raiseAngle) * 5 };

      highlightText = `SÜREKLİ TANSİYON: DELTOID GERİLİM %${Math.round(40 + range * 60)}`;
      activeMuscle = "Lateral Deltoid (Yan Omuz)";
    }
    else if (activeName.includes('row') || activeName.includes('çekiş') || activeName.includes('upright_row')) {
      // Barbell Upright Row
      const pullUp = range;
      const pullY = pelvisY - 20 - pullUp * 45;
      wrL = { x: -6, y: pullY, z: -15 };
      wrR = { x: 6, y: pullY, z: -15 };
      elL = { x: -26 - pullUp * 12, y: pullY - 10 - pullUp * 10, z: -5 };
      elR = { x: 26 + pullUp * 12, y: pullY - 10 - pullUp * 10, z: -5 };

      highlightText = `U-ROW ÇEKİŞ YÜKSEKLİĞİ: ${Math.round(pullUp * 100)}%`;
      activeMuscle = "Anterior & Lateral Deltoid";
    }
    else if (activeName.includes('face-pull') || activeName.includes('face_pull') || activeName.includes('yüz çekişi')) {
      // Rope Face-Pull (leaning slightly backward)
      const pull = range;
      // Slight backward tilt on hips
      pelvisY = 22;
      hipY = 24;

      wrL = { x: -10 - pull * 15, y: shY + 5 - pull * 10, z: -35 + pull * 50 };
      wrR = { x: 10 + pull * 15, y: shY + 5 - pull * 10, z: -35 + pull * 50 };
      elL = { x: -20 - pull * 15, y: shY + 10 - pull * 5, z: -20 + pull * 30 };
      elR = { x: 20 + pull * 15, y: shY + 10 - pull * 5, z: -20 + pull * 30 };

      highlightText = `RETRAKSİYON SEVİYESİ: %${Math.round(pull * 100)}`;
      activeMuscle = "Posterior Deltoid (Arka Omuz)";
    }
    else {
      // General dynamic standing posture
      const generalPulse = Math.sin(p) * 6;
      wrL = { x: -35, y: 12 + generalPulse, z: 10 };
      wrR = { x: 35, y: 12 - generalPulse, z: 10 };
      elL = { x: -30, y: -10 + generalPulse * 0.5, z: 5 };
      elR = { x: 30, y: -10 - generalPulse * 0.5, z: 5 };
      highlightText = "OTOMATİK BİYOMEKANİK TAKİP BAŞLADI";
      activeMuscle = "Tam Vücut Stabilizasyonu";
    }

    const joints: Joint[] = [
      { id: 'head', name: 'Alın', pos: { x: 0, y: headY, z: 0 }, color: '#38bdf8' },
      { id: 'neck', name: 'Boyun', pos: { x: 0, y: neckY, z: 0 }, color: '#38bdf8' },
      { id: 'chest', name: 'Göğüs', pos: { x: 0, y: chestY, z: 0 }, color: '#6366f1' },
      { id: 'pelvis', name: 'Pelvis', pos: { x: 0, y: pelvisY, z: 0 }, color: '#f43f5e' },
      
      { id: 'shL', name: 'Sol Omuz', pos: { x: shL_X, y: shY, z: 5 }, color: '#0ea5e9' },
      { id: 'shR', name: 'Sağ Omuz', pos: { x: shR_X, y: shY, z: -5 }, color: '#0ea5e9' },
      { id: 'elL', name: 'Sol Dirsek', pos: elL, color: '#f59e0b' },
      { id: 'elR', name: 'Sağ Dirsek', pos: elR, color: '#f59e0b' },
      { id: 'wrL', name: 'Sol Bilek', pos: wrL, color: '#fdba74' },
      { id: 'wrR', name: 'Sağ Bilek', pos: wrR, color: '#fdba74' },

      { id: 'hipL', name: 'Sol Kalça', pos: { x: hipL_X, y: hipY, z: 5 }, color: '#ec4899' },
      { id: 'hipR', name: 'Sağ Kalça', pos: { x: hipR_X, y: hipY, z: -5 }, color: '#ec4899' },
      { id: 'knL', name: 'Sol Diz', pos: knL, color: '#f43f5e' },
      { id: 'knR', name: 'Sağ Diz', pos: knR, color: '#f43f5e' },
      { id: 'anL', name: 'Sol Ayak', pos: anL, color: '#10b981' },
      { id: 'anR', name: 'Sağ Ayak', pos: anR, color: '#10b981' },
    ];

    const bones: Bone[] = [
      { from: 'head', to: 'neck', color: 'stroke-sky-300' },
      { from: 'neck', to: 'chest', color: 'stroke-sky-400' },
      { from: 'chest', to: 'pelvis', color: 'stroke-indigo-400', activityColor: 'stroke-orange-400' },
      
      // Shoulders & Arms
      { from: 'chest', to: 'shL' },
      { from: 'chest', to: 'shR' },
      { from: 'shL', to: 'elL', color: 'stroke-sky-400' },
      { from: 'shR', to: 'elR', color: 'stroke-sky-400' },
      { from: 'elL', to: 'wrL', color: 'stroke-amber-400' },
      { from: 'elR', to: 'wrR', color: 'stroke-amber-400' },

      // Hips & Legs
      { from: 'pelvis', to: 'hipL' },
      { from: 'pelvis', to: 'hipR' },
      { from: 'hipL', to: 'knL', color: 'stroke-emerald-400' },
      { from: 'hipR', to: 'knR', color: 'stroke-emerald-400' },
      { from: 'knL', to: 'anL', color: 'stroke-teal-400' },
      { from: 'knR', to: 'anR', color: 'stroke-teal-400' },
    ];

    return { joints, bones, highlightText, activeMuscle };
  };

  const { joints, bones, highlightText, activeMuscle } = generateSkeleton();
  const activeCheckpoints = getCheckpoints(exerciseName, range, progress);

  // Create projection lines of the 3D ground grid matrix
  const renderGroundGrid = () => {
    if (!showGrid) return null;
    const gridLines = [];
    const size = 90;
    const steps = 6;
    const gridY = 90; // Placed at floor height

    // Longitudinal grid lines (parallel to Z-axis)
    for (let i = -steps; i <= steps; i++) {
      const xVal = (i * size) / steps;
      const pt1 = projectPoint({ x: xVal, y: gridY, z: -size });
      const pt2 = projectPoint({ x: xVal, y: gridY, z: size });
      
      gridLines.push(
        <line
          key={`lon-${i}`}
          x1={pt1.sx}
          y1={pt1.sy}
          x2={pt2.sx}
          y2={pt2.sy}
          stroke="rgba(148, 163, 184, 0.05)"
          strokeWidth="0.5"
        />
      );
    }

    // Transversal grid lines (parallel to X-axis)
    for (let i = -steps; i <= steps; i++) {
      const zVal = (i * size) / steps;
      const pt1 = projectPoint({ x: -size, y: gridY, z: zVal });
      const pt2 = projectPoint({ x: size, y: gridY, z: zVal });
      
      gridLines.push(
        <line
          key={`trans-${i}`}
          x1={pt1.sx}
          y1={pt1.sy}
          x2={pt2.sx}
          y2={pt2.sy}
          stroke="rgba(148, 163, 184, 0.05)"
          strokeWidth="0.5"
        />
      );
    }

    return gridLines;
  };

  // 3D Depth Sorting: We sort visual nodes and lines from furthest to closest (painter's algorithm)
  // so elements in front correctly cover and shade elements in the back!
  const projectedBones = bones.map((bone, idx) => {
    const fromJoint = joints.find((j) => j.id === bone.from);
    const toJoint = joints.find((j) => j.id === bone.to);

    if (!fromJoint || !toJoint) return null;

    const p1 = projectPoint(fromJoint.pos);
    const p2 = projectPoint(toJoint.pos);

    // Midpoint depth for sorting layers
    const midZ = (p1.sz + p2.sz) / 2;

    // Use depth to calculate line thickness (perspective volume)
    const baseWidth = 5;
    const depthScale = 250 / (250 + midZ); // closer is thicker
    const strokeWidth = Math.max(1.8, Math.min(10, baseWidth * depthScale));
    
    // Highlight colors based on depth
    let colorClass = bone.color || (midZ < 0 ? 'stroke-blue-400' : 'stroke-sky-500');
    if (exerciseName.toLowerCase().includes('squat') && (bone.from.includes('hip') || bone.from.includes('kn') || bone.to.includes('an'))) {
      colorClass = 'stroke-orange-500'; // Highlighting squatted leg lines
    }

    return {
      element: (
        <line
          key={`bone-${idx}`}
          x1={p1.sx}
          y1={p1.sy}
          x2={p2.sx}
          y2={p2.sy}
          className={`${colorClass} stroke-round`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={Math.max(0.25, Math.min(1, 0.9 - midZ / 150))}
        />
      ),
      depth: midZ,
    };
  }).filter(Boolean) as { element: React.ReactElement; depth: number }[];

  const projectedJoints = joints.map((joint) => {
    const proj = projectPoint(joint.pos);
    
    // Joint radius scale with distance
    const baseRadius = 6.5;
    const depthScale = 250 / (250 + proj.sz);
    const r = Math.max(2.5, Math.min(14, baseRadius * depthScale));
    
    // Render a polished 3D ball (radial gradient look)
    const isSpecialNode = ['head', 'pelvis'].includes(joint.id);
    const pulseActive = isSpecialNode ? 'animate-pulse' : '';

    return {
      element: (
        <g key={`joint-${joint.id}`} className={pulseActive}>
          {/* Subtle outer neon halo for critical 3D nodes */}
          <circle
            cx={proj.sx}
            cy={proj.sy}
            r={r * 1.5}
            fill="none"
            stroke={joint.color || '#38bdf8'}
            strokeWidth="0.5"
            className="opacity-45"
          />
          {/* 3D Volumetric-looking Shading Spheres */}
          <circle
            cx={proj.sx}
            cy={proj.sy}
            r={r}
            fill={joint.color || '#0ea5e9'}
            className="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          />
          {/* Dynamic 3D lighting reflection highlight spot */}
          <circle
            cx={proj.sx - r * 0.25}
            cy={proj.sy - r * 0.25}
            r={r * 0.3}
            fill="#ffffff"
            className="opacity-80"
          />
          {showJointNames && (
            <text
              x={proj.sx + r + 3}
              y={proj.sy + 3}
              className="fill-slate-400 font-mono text-[6px] select-none pointer-events-none"
            >
              {joint.name}
            </text>
          )}
        </g>
      ),
      depth: proj.sz,
    };
  });

  // Combine both arrays and sort them by descending depth (z is depth, positive is away from camera)
  // Crucial step: elements with higher depth (furthest) are rendered FIRST, closest are rendered LAST!
  const sortedRenderList = [...projectedBones, ...projectedJoints]
    .sort((a, b) => b.depth - a.depth) // Sort high (further) to low (closer)
    .map((item) => item.element);

  return (
    <div className="w-full h-full flex flex-col items-stretch justify-between bg-slate-950 rounded-[32px] border border-slate-900 shadow-2xl overflow-hidden relative group">
      
      {/* Subtle background spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Elegant Minimalist Top HUD Header */}
      <div className="p-4 flex justify-between items-start z-10 select-none bg-slate-950/20 border-b border-slate-900/60 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-[8px] font-sans font-bold text-cyan-400 uppercase tracking-widest">3B BİYOMEKANİK MODEL</span>
          </div>
          <h3 className="text-xs font-semibold text-slate-200 tracking-tight mt-0.5">{exerciseName}</h3>
        </div>

        <div className="flex flex-col items-end text-right font-sans text-[8px] text-slate-400 space-y-0.5">
          <span>KAMERA: {Math.round(yaw)}° Y / {Math.round(pitch)}° D</span>
          <span className="text-emerald-400 font-medium">Hedef: {activeMuscle}</span>
        </div>
      </div>

      {/* Main Interactive 3D Orbit Sandbox Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        className="flex-1 w-full relative flex items-center justify-center cursor-grab active:cursor-grabbing min-h-[220px]"
      >
        {/* Holographic light cone reflection effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,transparent_75%)] pointer-events-none" />
        
        {/* Help Tip Overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-900 text-[8px] font-sans px-3 py-1 rounded-full text-slate-300 pointer-events-none flex items-center gap-1.5 backdrop-blur-md shadow-md">
          <Compass className="w-2.5 h-2.5 text-cyan-400" />
          <span className="font-medium">Sürükleyerek 3B Açıyı Değiştirin</span>
        </div>

        {/* Interactive Math Projected SVG Vector Group */}
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full max-w-[280px] max-h-[280px] select-none pointer-events-none"
        >
          {/* Ground Grid Matrix (Rendered furthest in depth) */}
          {renderGroundGrid()}

          {/* Depth Sorted skeletal representation (Bones L/R & Spherical Joints) */}
          {sortedRenderList}

          {/* Sleek, professional targeting reticles for active form checkpoints */}
          {showFormCheck && activeCheckpoints.map((cp, idx) => {
            if (!cp.isActive) return null;
            const targetJoint = joints.find(j => j.id === cp.targetJoint);
            if (!targetJoint) return null;
            const proj = projectPoint(targetJoint.pos);
            const isLeft = proj.sx < 100;
            const dx = isLeft ? 15 : -15;
            
            return (
              <g key={`target-reticle-${idx}`}>
                {/* Delicate pulsing halo */}
                <circle
                  cx={proj.sx}
                  cy={proj.sy}
                  r="10"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="1.2"
                  className="animate-ping opacity-30"
                  style={{ transformOrigin: `${proj.sx}px ${proj.sy}px` }}
                />
                <circle
                  cx={proj.sx}
                  cy={proj.sy}
                  r="8"
                  fill="rgba(251, 146, 60, 0.12)"
                  stroke="#fb923c"
                  strokeWidth="1"
                />
                <circle
                  cx={proj.sx}
                  cy={proj.sy}
                  r="2"
                  fill="#fb923c"
                />
                
                {/* Dynamic smooth anchor line and label */}
                <path
                  d={`M ${proj.sx} ${proj.sy} L ${proj.sx + dx} ${proj.sy - 12} H ${proj.sx + dx + (isLeft ? 20 : -20)}`}
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="0.75"
                />
                <text
                  x={proj.sx + dx + (isLeft ? 2 : -18)}
                  y={proj.sy - 15}
                  className="fill-orange-400 font-sans text-[6px] font-bold select-none pointer-events-none"
                >
                  {cp.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Premium Form Check Checklist Overlay */}
        {showFormCheck && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 z-20 w-44 bg-slate-950/90 border border-slate-900 rounded-2xl p-3 backdrop-blur-md shadow-2xl pointer-events-auto select-none space-y-2 text-[10px]"
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <span className="font-sans font-bold text-slate-200 tracking-wider text-[8px] uppercase">FORM ANALİZİ</span>
              </div>
              <button
                onClick={() => setShowFormCheck(false)}
                className="text-slate-400 hover:text-slate-200 font-sans text-[7px] font-bold px-1.5 py-0.5 bg-slate-900 border border-slate-900 rounded-lg cursor-pointer transition-all uppercase"
              >
                Kapat
              </button>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
              {activeCheckpoints.map((cp, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border transition-all duration-300 ${
                    cp.isActive
                      ? "bg-orange-500/5 border-orange-500/20 text-white"
                      : "bg-slate-900/30 border-slate-900/40 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold tracking-tight text-[8px] uppercase text-slate-300">{cp.label}</span>
                    <span
                      className={`text-[6px] font-sans px-1 py-[1px] rounded uppercase font-bold tracking-wider ${
                        cp.isActive ? "bg-orange-500 text-slate-950 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {cp.isActive ? "KONTROL" : "TAMAM"}
                    </span>
                  </div>
                  <p className="text-[7.5px] text-slate-400 mt-0.5 leading-tight">{cp.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-1.5 select-none flex items-center justify-between font-sans text-[6.5px] text-slate-500 border-t border-slate-900">
              <span className="font-medium">SİNYAL DÜZEYİ: DOĞAL</span>
              <span>STANDART-3D</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Doğru Yapılış / Biomechanical Form Instructions */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-900 z-10 space-y-2 backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-[9px] font-sans font-bold text-emerald-400 uppercase tracking-widest">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>DOĞRU FORM KILAVUZU</span>
        </div>
        <div className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-300">
          {getCorrectFormBullets(exerciseName).map((bullet, index) => (
            <div key={index} className="flex items-start gap-2 leading-relaxed bg-slate-900/20 p-2.5 rounded-xl border border-slate-900/50">
              <span className="text-emerald-400 font-bold select-none text-[9px] uppercase font-sans mt-0.5 shrink-0">FORM {index + 1}:</span>
              <span className="text-slate-300 text-[10.5px]">{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Deck / Interactive Slider Panel */}
      <div className="p-4 bg-slate-950 border-t border-slate-900 z-10 space-y-3">
        <div className="flex items-center justify-between text-[8px] font-sans font-semibold text-slate-500 select-none tracking-wider uppercase">
          <span>Hareket Durumu</span>
          <span className="text-orange-400">{highlightText}</span>
        </div>

        {/* Functional HUD Actions */}
        <div className="flex flex-wrap gap-2 justify-between items-center pt-1">
          {/* Speed Controls / Auto-rotation configuration */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold border transition-all flex items-center gap-1 active:scale-95 ${
                autoRotate 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(34,211,238,0.1)]' 
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <RotateCcw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
              <span>Oto-Döndürme {autoRotate ? 'Açık' : 'Kapalı'}</span>
            </button>

            <button
              onClick={() => { setYaw(-30); setPitch(-15); setZoom(1.1); }}
              className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center gap-1 active:scale-95"
            >
              <Compass className="w-3 h-3 text-slate-400" />
              <span>Kamerayı Sıfırla</span>
            </button>
          </div>

          {/* Interactive display detail switches */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowFormCheck(!showFormCheck)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono transition-all ${
                showFormCheck ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' : 'bg-slate-900 text-slate-500 border border-transparent'
              }`}
            >
              Form Analizi
            </button>
            <button
              onClick={() => setShowJointNames(!showJointNames)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono transition-all ${
                showJointNames ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-slate-900 text-slate-500 border border-transparent'
              }`}
            >
              Etiketler
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono transition-all ${
                showGrid ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-slate-900 text-slate-500 border border-transparent'
              }`}
            >
              Taban Izgarası
            </button>
          </div>
        </div>

        {/* Perspective view adjustment sliders */}
        <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-850/60 select-none">
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-mono text-slate-500">
              <span>YATAY BAKIŞ (YAW)</span>
              <span>{Math.round(yaw)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={Math.round((yaw + 360) % 360)}
              onChange={(e) => {
                setYaw(parseFloat(e.target.value));
                if (autoRotate) setAutoRotate(false);
              }}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-mono text-slate-500">
              <span>DÜŞEY AÇI (PITCH)</span>
              <span>{Math.round(pitch)}°</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              value={Math.round(pitch)}
              onChange={(e) => {
                setPitch(parseFloat(e.target.value));
                if (autoRotate) setAutoRotate(false);
              }}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
