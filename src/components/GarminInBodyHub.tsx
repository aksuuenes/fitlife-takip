import React, { useState } from 'react';
import { 
  Dumbbell, Heart, Activity, Flame, Droplet, Brain, 
  Info, TrendingUp, Sparkles, User, RefreshCw, Zap, 
  ChevronRight, Calendar, ShieldCheck, PieChart, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { HealthRecord } from '../types';

interface GarminInBodyHubProps {
  records: HealthRecord[];
}

export default function GarminInBodyHub({ records }: GarminInBodyHubProps) {
  const [activeTab, setActiveTab] = useState<'bodyComp' | 'fitnessTrends' | 'dailyActivity'>('bodyComp');
  const [chartRange, setChartRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [selectedSegment, setSelectedSegment] = useState<string>('gövde');

  // Guard against no records
  if (!records || records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-3xl text-center">
        <Info className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4 animate-bounce" />
        <h3 className="text-slate-900 dark:text-white text-lg font-display font-black">Garmin Hub Veri Bekliyor</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 max-w-sm mx-auto">
          Grafikler, InBody vücut kompozisyonu raporu ve Garmin Connect günlük aktivite analizlerini görebilmek için lütfen profilinizde en az bir sağlık kaydı oluşturun.
        </p>
      </div>
    );
  }

  // Get latest record
  const latest = records[records.length - 1];
  
  // Simulated estimates based on latest health metrics for InBody details if not completely entered
  const weight = latest.weight || 70;
  const height = latest.height || 175;
  const age = latest.age || 25;
  const bmi = latest.bmi || (weight / Math.pow(height / 100, 2));
  const bodyFatPct = latest.bodyFat || (bmi * 1.2 + 0.23 * age - 5.4 - (bmi > 25 ? 2 : 0)); // estimate
  const bodyFatMass = (weight * bodyFatPct) / 100;
  const skeletalMuscleMass = latest.muscleMass || (weight * (0.4 + (bmi < 22 ? 0.05 : -0.02))); // estimate SMM
  const bodyWater = weight * (1 - bodyFatPct / 100) * 0.73; // Total body water is roughly 73% of FFM
  const boneMass = weight * 0.045 + 0.5; // bones are ~4-5% of weight
  const leanMass = weight - bodyFatMass;
  const visceralFat = Math.round(Math.max(1, Math.min(20, (bmi * 0.45) + (age * 0.05) - 3))); // visceral fat rating
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5); // BMR Mifflin-St Jeor estimate

  // Garmin metrics estimation
  const restingHR = latest.heartRate ? Math.max(50, latest.heartRate - 12) : 62;
  const hrvMs = Math.round(85 - (latest.stressLevel || 5) * 6 - (age * 0.2) + (latest.sleepQuality || 7) * 2);
  const intensityMinutes = Math.round((latest.steps ? latest.steps / 300 : 30) + (latest.caloriesBurned ? latest.caloriesBurned / 12 : 45));
  
  // Body Battery dynamics calculation
  const sleepCharge = Math.min(100, (latest.sleepQuality || 7) * 10 + (latest.sleepHours || 8) * 4);
  const stressDrain = Math.min(100, (latest.stressLevel || 5) * 8 + (latest.steps ? Math.min(50, latest.steps / 400) : 15));
  // current battery
  const bodyBatteryVal = Math.max(5, Math.min(100, Math.round(sleepCharge - stressDrain * 0.6 + 25)));

  // Segmental Lean Analysis distribution
  const segments: Record<string, { muscle: number, fat: number, desc: string }> = {
    'gövde': { 
      muscle: Math.round(skeletalMuscleMass * 0.5), 
      fat: Math.round(bodyFatMass * 0.55), 
      desc: 'Bütün hareket kontrolü ve çekirdek stabilizasyonunu sağlar.' 
    },
    'sag_kol': { 
      muscle: Math.round(skeletalMuscleMass * 0.08 * 1.04), 
      fat: Math.round(bodyFatMass * 0.07 * 0.95), 
      desc: 'Baskın kolda kas yoğunluğu dengelidir.' 
    },
    'sol_kol': { 
      muscle: Math.round(skeletalMuscleMass * 0.08 * 0.96), 
      fat: Math.round(bodyFatMass * 0.07 * 1.05), 
      desc: 'Simetrik gelişim için tek taraflı çalışmalara odaklanın.' 
    },
    'sag_bacak': { 
      muscle: Math.round(skeletalMuscleMass * 0.17 * 1.01), 
      fat: Math.round(bodyFatMass * 0.14 * 0.98), 
      desc: 'Güç aktarımı ve kuadriseps grubu çok dengeli.' 
    },
    'sol_bacak': { 
      muscle: Math.round(skeletalMuscleMass * 0.17 * 0.99), 
      fat: Math.round(bodyFatMass * 0.14 * 1.02), 
      desc: 'Destekleyici bacak gücü temel oranlara uygundur.' 
    }
  };

  // Filter records based on selected range
  const getFilteredData = () => {
    let limit = 7;
    if (chartRange === '30d') limit = 30;
    if (chartRange === 'all') limit = records.length;
    
    return records.slice(-limit).map(r => {
      const rBmi = r.bmi || r.weight / Math.pow(r.height / 100, 2);
      const rFat = r.bodyFat || (rBmi * 1.2 + 0.23 * (r.age || 25) - 5.4);
      return {
        date: new Date(r.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        dateRaw: r.date,
        kilo: r.weight,
        yagOrani: parseFloat(rFat.toFixed(1)),
        kasKutlesi: parseFloat((r.muscleMass || r.weight * 0.43).toFixed(1)),
        adim: r.steps || 0,
        kalori: r.caloriesBurned || 0,
        stres: r.stressLevel || 5,
        uykuKalitesi: r.sleepQuality || 7,
      };
    });
  };

  const filteredData = getFilteredData();

  // Color map helpers
  const getBodyBatteryColor = (val: number) => {
    if (val >= 75) return 'from-cyan-500 to-blue-600 text-cyan-600 dark:text-cyan-400';
    if (val >= 50) return 'from-indigo-500 to-blue-600 text-indigo-500 dark:text-indigo-400';
    if (val >= 25) return 'from-amber-500 to-orange-500 text-amber-500 dark:text-amber-400';
    return 'from-rose-500 to-red-600 text-rose-500 dark:text-rose-400';
  };

  const getHRVStatus = (hrv: number) => {
    if (hrv >= 65) return { label: 'DENGELİ (Elit)', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' };
    if (hrv >= 45) return { label: 'DENGELİ', color: 'text-indigo-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30' };
    if (hrv >= 30) return { label: 'DÜŞÜK (Yorgunluk)', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' };
    return { label: 'KÖTÜ (Overuse)', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' };
  };

  const currentSegment = segments[selectedSegment] || segments['gövde'];

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Selector in Garmin Sporty Style */}
      <div className="flex bg-slate-100/80 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1.5 rounded-2xl w-full md:w-max">
        <button
          onClick={() => setActiveTab('bodyComp')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'bodyComp'
              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-700/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          InBody Vücut Kompozisyonu
        </button>
        <button
          onClick={() => setActiveTab('fitnessTrends')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'fitnessTrends'
              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-700/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Ağırlık & Yağ Grafik Treni
        </button>
        <button
          onClick={() => setActiveTab('dailyActivity')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'dailyActivity'
              ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-700/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-500" />
          Garmin Connect Aktivite
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: BODY COMPOSITION / INBODY REPORT */}
        {activeTab === 'bodyComp' && (
          <motion.div
            key="bodyComp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Card: Clinical InBody Bio-Stats */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 transition-colors duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-6">
                <div>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-white-800 flex items-center gap-2">
                    <PieChart className="w-5.5 h-5.5 text-indigo-500" />
                    InBody Detaylı Analiz
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Klinik biyo-elektrik empedans analizi (BIA) benzeri eşleştirilmiş raporlar.</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/40 px-3 py-1.5 rounded-lg">
                    {new Date(latest.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Grid Layout of Advanced Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-550 block mb-1">İSKELET KASI KÜTLESİ</span>
                  <div className="text-2xl font-display font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                    {skeletalMuscleMass.toFixed(1)} <span className="text-xs font-sans font-medium text-slate-400">kg</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-emerald-500">Normal Aralıkta (Fit)</div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-550 block mb-1">VÜCUT YAĞ KÜTLESİ</span>
                  <div className="text-2xl font-display font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                    {bodyFatMass.toFixed(1)} <span className="text-xs font-sans font-medium text-slate-400">kg</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-indigo-500">Yağ Oranı: %{bodyFatPct.toFixed(1)}</div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-550 block mb-1">YALIN KÜTLE (FFM)</span>
                  <div className="text-2xl font-display font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                    {leanMass.toFixed(1)} <span className="text-xs font-sans font-medium text-slate-400">kg</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-slate-400 dark:text-slate-500">Yağ daddandaki tüm kütle</div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 dark:text-slate-550 block mb-1">TOPLAM VÜCUT SIVISI</span>
                  <div className="text-2xl font-display font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                    {bodyWater.toFixed(1)} <span className="text-xs font-sans font-medium text-slate-400">kg/L</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-blue-500">Hücre içi + Hücre dışı</div>
                </div>
              </div>

              {/* BIA Bar Indicators (Typical InBody style with C-S-D Curves!) */}
              <div className="space-y-6 bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">InBody Kas-Yağ Kontrol Eğrisi (C-G-D Eğrisi)</h4>
                
                {/* Weight Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Toplam Kilo (Weight)</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">{weight} kg</span>
                  </div>
                  <div className="relative h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-blue-500/80 rounded-full" style={{ width: `${Math.min(100, (weight / 140) * 100)}%` }} />
                    <div className="absolute left-[35%] right-[65%] border-l-2 border-slate-450 dark:border-slate-500 h-full text-[8px] flex items-center pl-1 font-black opacity-60">MIN</div>
                    <div className="absolute left-[65%] right-[35%] border-l-2 border-slate-450 dark:border-slate-500 h-full text-[8px] flex items-center pl-1 font-black opacity-60">MAX</div>
                  </div>
                </div>

                {/* Muscle Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">İskelet Kası (SMM)</span>
                    <span className="font-mono font-black text-emerald-650 dark:text-emerald-400">{skeletalMuscleMass.toFixed(1)} kg</span>
                  </div>
                  <div className="relative h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/85 rounded-full" style={{ width: `${Math.min(100, (skeletalMuscleMass / 60) * 100)}%` }} />
                    <div className="absolute left-[40%] right-[60%] border-l-2 border-slate-450 dark:border-slate-500 h-full text-[8px] flex items-center pl-1 font-black opacity-60">MIN</div>
                    <div className="absolute left-[70%] right-[30%] border-l-2 border-slate-450 dark:border-slate-500 h-full text-[8px] flex items-center pl-1 font-black opacity-60">MAX</div>
                  </div>
                </div>

                {/* Fat mass Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Vücut Yağ Kütlesi (BFM)</span>
                    <span className="font-mono font-black text-rose-500">{bodyFatMass.toFixed(1)} kg</span>
                  </div>
                  <div className="relative h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-rose-550/80 rounded-full" style={{ width: `${Math.min(100, (bodyFatMass / 40) * 100)}%` }} />
                    <div className="absolute left-[20%] right-[80%] border-l-2 border-slate-450 dark:border-slate-500 h-full text-[8px] flex items-center pl-1 font-black opacity-60">MIN</div>
                    <div className="absolute left-[50%] right-[50%] border-l-2 border-slate-450 dark:border-slate-500 h-full text-[8px] flex items-center pl-1 font-black opacity-60">MAX</div>
                  </div>
                </div>
                
                <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 italic font-semibold leading-relaxed">
                  💡 İpucu: Kas kütlesini yukarı çekerken yağ kütlesini sınırlandırmak (bir &quot;D&quot; eğrisi oluşturmak), atletik hedeflere ulaşmanızı kolaylaştıracaktır.
                </div>
              </div>
            </div>

            {/* Right Card: Segmental Lean Analysis (Visual human figure) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors duration-200">
              <div className="mb-4">
                <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md">BÖLGESEL DAĞILIM</span>
                <h4 className="text-lg font-display font-black text-slate-900 dark:text-white mt-1.5 leading-tight">Segmental Kas Dağılımı</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">InBody analizi ile her bir vücut alanındaki lokal kas ağırlık tahmini.</p>
              </div>

              {/* Visual Humanoid / Box-Selector */}
              <div className="my-6 relative bg-slate-50/70 dark:bg-slate-950/30 p-2 border border-slate-100 dark:border-slate-850/80 rounded-2xl flex flex-col items-center">
                <div className="w-full grid grid-cols-3 gap-1 relative z-10 max-w-[240px] py-4">
                  
                  {/* Arms */}
                  <button 
                    onClick={() => setSelectedSegment('sol_kol')}
                    className={`col-span-1 p-2 rounded-xl text-center border transition-all cursor-pointer ${selectedSegment === 'sol_kol' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-150' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                  >
                    <span className="text-[9px] block font-black uppercase">Sol Kol</span>
                    <span className="text-[11px] font-mono font-extrabold">{segments.sol_kol.muscle.toFixed(1)}kg</span>
                  </button>

                  {/* Trunk (Gövde) */}
                  <button 
                    onClick={() => setSelectedSegment('gövde')}
                    className={`col-span-1 p-2 rounded-xl text-center border transition-all cursor-pointer ${selectedSegment === 'gövde' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-150' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                  >
                    <span className="text-[9px] block font-black uppercase">Gövde</span>
                    <span className="text-[11px] font-mono font-extrabold">{segments.gövde.muscle.toFixed(1)}kg</span>
                  </button>

                  {/* Right Arm */}
                  <button 
                    onClick={() => setSelectedSegment('sag_kol')}
                    className={`col-span-1 p-2 rounded-xl text-center border transition-all cursor-pointer ${selectedSegment === 'sag_kol' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-150' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                  >
                    <span className="text-[9px] block font-black uppercase">Sağ Kol</span>
                    <span className="text-[11px] font-mono font-extrabold">{segments.sag_kol.muscle.toFixed(1)}kg</span>
                  </button>

                  <div className="col-span-3 h-2" />

                  {/* Legs */}
                  <button 
                    onClick={() => setSelectedSegment('sol_bacak')}
                    className={`col-span-1.5 p-3.5 rounded-xl text-center border transition-all cursor-pointer ${selectedSegment === 'sol_bacak' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-150' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                  >
                    <span className="text-[9px] block font-black uppercase">Sol Bacak</span>
                    <span className="text-[11px] font-mono font-extrabold">{segments.sol_bacak.muscle.toFixed(1)}kg</span>
                  </button>

                  <div className="col-span-0.5" />

                  <button 
                    onClick={() => setSelectedSegment('sag_bacak')}
                    className={`col-span-1.5 p-3.5 rounded-xl text-center border transition-all cursor-pointer ${selectedSegment === 'sag_bacak' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-150' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                  >
                    <span className="text-[9px] block font-black uppercase">Sağ Bacak</span>
                    <span className="text-[11px] font-mono font-extrabold">{segments.sag_bacak.muscle.toFixed(1)}kg</span>
                  </button>
                </div>
              </div>

              {/* Segment Description Widget */}
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-2xl flex flex-col gap-1 text-slate-800 dark:text-indigo-200">
                <div className="font-display font-black text-[10px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  {selectedSegment.replace('_', ' ').toUpperCase()} Detayı
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Yedek Yağ Kütlesi:</span>
                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">{currentSegment.fat.toFixed(1)} kg</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                  {currentSegment.desc}
                </p>
              </div>

              {/* Summary Indexes Panel (WHR, Bone, BMR) */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">Kemik Kütlesi</span>
                  <p className="text-sm font-display font-black text-slate-800 dark:text-slate-200">{boneMass.toFixed(2)} kg</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">Bazal Metabolizma (BMR)</span>
                  <p className="text-sm font-display font-black text-slate-800 dark:text-slate-200">{bmr} kcal</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">İç Yağlanma Skoru</span>
                  <p className="text-sm font-display font-black text-amber-500">{visceralFat} / 20</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">Kemik/Kilo Oranı</span>
                  <p className="text-sm font-display font-black text-slate-800 dark:text-slate-200">% {((boneMass / weight) * 100).toFixed(1)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: INTERACTIVE DUAL-AXIS CHARTS (GARMIN WEIGHT & CORE TRENDS) */}
        {activeTab === 'fitnessTrends' && (
          <motion.div
            key="fitnessTrends"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Range Toggle Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">Ağırlık & Yağ İlişkisi Trendi</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Vücut ağırlığı ile vücut yağ oranının zamana bağlı korelasyon grafiği.</p>
                </div>
                
                {/* Visual filter options in Garmin Connect style (7 Gün, 30 Gün, Tümü) */}
                <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-1 rounded-xl w-max">
                  <button
                    onClick={() => setChartRange('7d')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${chartRange === '7d' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    Son 7 Gün
                  </button>
                  <button
                    onClick={() => setChartRange('30d')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${chartRange === '30d' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    Son 30 Gün
                  </button>
                  <button
                    onClick={() => setChartRange('all')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${chartRange === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    Tümü ({records.length})
                  </button>
                </div>
              </div>

              {/* Dual Axis Recharts Visualization */}
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredData}>
                    <defs>
                      <linearGradient id="colorWeightDual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFatDual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                    
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                    />
                    
                    {/* Left Axis - Weight in kilograms */}
                    <YAxis 
                      yAxisId="weight"
                      axisLine={false}
                      tickLine={false}
                      tick={{fontSize: 10, fill: '#4f46e5', fontWeight: 'bold'}}
                      domain={['dataMin - 3', 'dataMax + 3']}
                      label={{ value: 'Kilo (kg)', angle: -90, position: 'insideLeft', offset: -5, style: {fontSize: 10, fontWeight: 'bold', fill: '#4f46e5'} }}
                    />
                    
                    {/* Right Axis - Body Fat percentage */}
                    <YAxis 
                      yAxisId="fat"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{fontSize: 10, fill: '#ef4444', fontWeight: 'bold'}}
                      domain={['dataMin - 2', 'dataMax + 2']}
                      label={{ value: 'Yağ Oranı (%)', angle: 90, position: 'insideRight', offset: -5, style: {fontSize: 10, fontWeight: 'bold', fill: '#ef4444'} }}
                    />

                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', 
                        fontSize: '12px', 
                        fontFamily: 'system-ui'
                      }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} />

                    {/* Weight (Kilo) represented as Area chart */}
                    <Area 
                      yAxisId="weight"
                      type="monotone" 
                      name="Kilo (kg)"
                      dataKey="kilo" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorWeightDual)" 
                    />

                    {/* Body Fat % represented as high contrast red line */}
                    <Line 
                      yAxisId="fat"
                      type="monotone" 
                      name="Beden Yağ %"
                      dataKey="yagOrani" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Statistics summary below chart */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-xl">
                  <span className="text-[9px] font-mono font-extrabold text-slate-400 block uppercase">Ortalama Ağırlık</span>
                  <div className="text-xl font-display font-black text-slate-800 dark:text-slate-100">
                    {(filteredData.reduce((acc, current) => acc + current.kilo, 0) / filteredData.length).toFixed(1)} kg
                  </div>
                </div>
                <div className="p-3 bg-red-50/30 dark:bg-red-950/20 rounded-xl">
                  <span className="text-[9px] font-mono font-extrabold text-slate-400 block uppercase">Ortalama Yağ Oranı</span>
                  <div className="text-xl font-display font-black text-rose-600 dark:text-rose-450">
                    % {(filteredData.reduce((acc, current) => acc + current.yagOrani, 0) / filteredData.length).toFixed(1)}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl">
                  <span className="text-[9px] font-mono font-extrabold text-slate-400 block uppercase">Ortalama Kas Oranı</span>
                  <div className="text-xl font-display font-black text-emerald-600">
                    % {(((filteredData.reduce((acc, current) => acc + current.kasKutlesi, 0) / filteredData.length) / (filteredData.reduce((acc, current) => acc + current.kilo, 0) / filteredData.length)) * 100).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: DAILY ACTIVITY WIDGETS (GARMIN CONNECT CODES) */}
        {activeTab === 'dailyActivity' && (
          <motion.div
            key="dailyActivity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Widget 1: Garmin Body Battery */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between transition-colors duration-200">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-mono font-extrabold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/30 px-2 py-0.5 rounded uppercase tracking-wider">Metrik</span>
                    <h4 className="text-base font-display font-black text-slate-900 dark:text-white mt-1 leading-tight">Body Battery™ (Vücut Pili)</h4>
                  </div>
                  <Zap className="text-cyan-500 w-5 h-5 fill-current animate-pulse" />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Günlük enerji bilançonuzu temsil eden Garmin Connect patentli algoritmik skor.</p>

                {/* Battery percentage circle simulation */}
                <div className="relative flex justify-center py-6">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="8" fill="none" className="dark:hidden" />
                    <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="none" className="hidden dark:block" />
                    <motion.circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      className="stroke-cyan-500" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray={2 * Math.PI * 48}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      animate={{ strokeDashoffset: (1 - bodyBatteryVal / 100) * (2 * Math.PI * 48) }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-black text-slate-900 dark:text-white">{bodyBatteryVal}</span>
                    <span className="text-[8px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">% Enerji</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Battery transactions */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500 font-medium">⚡ Gece Boyu Şarj (Sleep):</span>
                  <span className="text-emerald-500">+{sleepCharge}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500 font-medium">📉 Günlük Tüketim (Stress & Steps):</span>
                  <span className="text-rose-500">-{Math.round(stressDrain * 0.6)}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1 font-semibold leading-relaxed">
                  {bodyBatteryVal > 70 
                    ? '👍 Enerjiniz mükemmel! Ağır antrenmanlar ve yoğun zihinsel görevler için en ideal zamandasınız.'
                    : bodyBatteryVal > 40 
                    ? '⚡ Enerjiniz makul düzeylerde. Antrenman yapıp hafif bir toparlanma mühleti ayırabilirsiniz.'
                    : '💤 Pil düzeyi kritik! Uykunuza ve derin toparlanmaya odaklanarak metabolizmayı dinlendirin.'}
                </p>
              </div>
            </div>

            {/* Widget 2: Heart Rate & HRV Status */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between transition-colors duration-200">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-mono font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-2 py-0.5 rounded uppercase tracking-wider">Dinlenme Durumu</span>
                    <h4 className="text-base font-display font-black text-slate-900 dark:text-white mt-1 leading-tight">HRV ve Nabız İzleyici</h4>
                  </div>
                  <Heart className="text-rose-500 w-5 h-5 fill-current" />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-semibold leading-relaxed">Kalp Ritim Değişkenliği (HRV), otonom sinir sisteminizin yorgunluk ve iyileşme dengesini ölçer.</p>

                {/* Big Display statistics */}
                <div className="py-6 grid grid-cols-2 gap-2 text-center">
                  <div className="border-r border-slate-100 dark:border-slate-800 py-2">
                    <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">DİNLENME NABZI</span>
                    <div className="text-2xl font-display font-black text-slate-800 dark:text-white flex items-baseline justify-center gap-0.5 mt-1.5">
                      {restingHR} <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">bpm</span>
                    </div>
                  </div>
                  <div className="py-2">
                    <span className="text-[8px] font-mono font-extrabold text-slate-400 block uppercase">HRV BASAL (MS)</span>
                    <div className="text-2xl font-display font-black text-slate-800 dark:text-white flex items-baseline justify-center gap-0.5 mt-1.5">
                      {hrvMs} <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HRV status indicator block */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Genel HRV Durumu</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getHRVStatus(hrvMs).color}`}>
                    {getHRVStatus(hrvMs).label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 leading-relaxed font-semibold">
                  Basal HRV seviyeniz dengeli aralıkta seyrediyor. Sinir sisteminiz yüksek direnç oluşturarak antrenman adaptasyon kapasitenizi artırıyor.
                </p>
              </div>
            </div>

            {/* Widget 3: Weekly Intensity Minutes / Yoğunluk Dakikası */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between transition-colors duration-200">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-mono font-extrabold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-wider">Aktivite Seviyesi</span>
                    <h4 className="text-base font-display font-black text-slate-900 dark:text-white mt-1 leading-tight">Yoğunluk Dakikaları</h4>
                  </div>
                  <Activity className="text-indigo-600 w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Garmin Connect&apos;in Dünya Sağlık Örgütü (WHO) kılavuzlarına göre haftalık 150 dakikalık kardiyo hedefini izlemesi.</p>

                {/* Progress bar container */}
                <div className="py-6 space-y-3">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase">Haftalık Tamamlanan:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{intensityMinutes} / 150 Dakika</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 rounded-full" 
                      style={{ width: `${Math.min(100, (intensityMinutes / 150) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic activity summary */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>🏃 Adımlardan gelen etki:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{Math.round(intensityMinutes * 0.45)} dk</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>🔥 Antrenmandan gelen etki:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{Math.round(intensityMinutes * 0.55)} dk</span>
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-550 italic mt-3 leading-relaxed font-semibold">
                  Kalp damar sisteminizi kuvvetlendirmek ve kardiyo direncini korumak için haftada en az 150 orta yoğunlukta dakika biriktirmeye devam edin.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
