import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus, Info, Play, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { HealthRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import WorkoutTracker from './WorkoutTracker';
import WaterTracker from './WaterTracker';
import SupplementTracker from './SupplementTracker';
import WorkoutCalendar from './WorkoutCalendar';

import { parseNumber, getBMIStatus } from '../lib/utils';

export default function Dashboard() {
  const { user, profile, activeProfileId, currentProfile, switchProfile } = useAuth();
  const { theme } = useTheme();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (activeProfileId) {
        if (user) {
          const history = await firebaseService.getWorkoutHistory(user.uid, activeProfileId);
          setWorkoutHistory(history);
        } else {
          setWorkoutHistory(storageService.getWorkoutHistory(activeProfileId));
        }
      }
    };
    fetchHistory();
  }, [user, activeProfileId]);

  useEffect(() => {
    const fetchRecords = async () => {
      setRecords([]);
      setLatestRecord(null);
      setLoading(true);
      if (user && activeProfileId) {
        const data = await firebaseService.getHealthRecords(user.uid, activeProfileId);
        const ascData = [...data].reverse();
        setRecords(ascData);
        if (data.length > 0) {
          setLatestRecord(data[0]);
        }
      } else if (!user && activeProfileId) {
        const data = storageService.getRecords(activeProfileId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRecords(data);
        if (data.length > 0) {
          setLatestRecord(data[data.length - 1]);
        }
      }
      setLoading(false);
    };

    fetchRecords();
  }, [user, activeProfileId]);

  const chartData = records.map(r => ({
    date: new Date(r.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    weight: r.weight,
    bmi: parseNumber(r.bmi)
  }));


  const weightChange = records.length > 1 
    ? (records[records.length - 1].weight - records[records.length - 2].weight).toFixed(1)
    : 0;

  const activeHeight = currentProfile?.initialHeight || latestRecord?.height || profile?.initialHeight;
  const activeWeight = currentProfile?.initialWeight || latestRecord?.weight || profile?.initialWeight;

  let activeBmi: number | null = null;
  if (activeHeight && activeWeight) {
    const hM = activeHeight / 100;
    activeBmi = activeWeight / (hM * hM);
  } else if (latestRecord?.bmi) {
    activeBmi = parseNumber(latestRecord.bmi);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-10 w-10 text-blue-605 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Verileriniz Getiriliyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-900/60">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
               Hoş Geldin, {currentProfile?.name || profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Sporcu'} 👋
            </h1>
            {profile?.profiles && profile.profiles.length > 1 && (
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-105 dark:border-blue-900/30">
                {currentProfile?.name} PROFİLİ
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Haftalık ilerleme raporun ve AI analizlerin burada.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Profile Switcher for Dashboard */}
          {profile?.profiles && profile.profiles.length > 1 && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 h-10 transition-colors duration-200">
              {profile.profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => switchProfile(p.id)}
                  className={`px-3 h-8 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    activeProfileId === p.id 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm' 
                    : 'text-slate-450 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.name.split(' ')[0].toUpperCase()}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Link 
              to="/workout" 
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-bold shadow-xl dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center group h-10 cursor-pointer"
            >
              <Play className="mr-2 h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
              Spora Başla
            </Link>
            <Link 
              to="/add" 
              className="px-4 py-2 bg-blue-600 dark:bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 dark:hover:bg-indigo-705 transition-colors flex items-center h-10 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Giriş
            </Link>
          </div>
        </div>
      </header>

      {/* Metric Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:shadow-none duration-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold mb-1.5 block">BOY</div>
          <div className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            {activeHeight || '--'} <span className="text-sm font-sans font-medium text-slate-400">cm</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 dark:bg-indigo-550 h-full rounded-full" style={{ width: activeHeight ? `${Math.min(100, (activeHeight / 220) * 100)}%` : '0%' }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:shadow-none duration-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold mb-1.5 block">KİLO</div>
          <div className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-baseline gap-1">
            {activeWeight || '--'} <span className="text-sm font-sans font-medium text-slate-400">kg</span>
          </div>
          {weightChange !== 0 ? (
            <div className={`text-[11px] mt-3 flex items-center gap-1 font-bold px-2 py-1 rounded-lg w-max ${Number(weightChange) > 0 ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'}`}>
              {Number(weightChange) > 0 ? '▲' : '▼'} {Math.abs(Number(weightChange))} kg <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 font-sans">(Geçen Hafta)</span>
            </div>
          ) : (
            <div className="text-[10px] mt-4 text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Haftalık Değişim Yok</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:shadow-none duration-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold mb-1.5 block">VÜCUT KİTLE İNDEKSİ (BMI)</div>
          <div className="text-3xl font-display font-black text-slate-900 dark:text-white">{activeBmi ? activeBmi.toFixed(1) : '--'}</div>
          {activeBmi && (() => {
            const status = getBMIStatus(activeBmi);
            const getPremiumColors = (label: string) => {
              if (label.includes('Zayıf')) return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
              if (label.includes('Normal')) return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
              if (label.includes('Fazla')) return 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/30';
              return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
            };
            return (
              <div className={`px-2.5 py-1 text-[10px] rounded-lg inline-block mt-3 font-extrabold border uppercase tracking-wider ${getPremiumColors(status.label)}`}>
                {status.label}
              </div>
            );
          })()}
        </div>

        <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md dark:shadow-none duration-200 ${latestRecord?.injuries ? 'ring-2 ring-amber-500/20 shadow-amber-50 dark:ring-amber-550/20' : ''}`}>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-extrabold mb-1.5 block">FİZİKSEL DURUM</div>
          <div className={`text-lg font-display font-black ${latestRecord?.injuries ? 'text-amber-600 dark:text-amber-405' : 'text-slate-900 dark:text-slate-100'}`}>
            {latestRecord?.injuries ? 'Sakatlık/Hassasiyet ⚠️' : 'Tamamen Aktif ⚡'}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium leading-relaxed">
            {latestRecord?.injuries 
              ? `Hassas Alan: ${latestRecord.injuries}`
              : 'Egzersizler için herhangi bir sakatlık kısıtlaması bulunmuyor.'}
          </p>
        </div>
      </section>

      {/* Daily Trackers Row (Perfectly Aligned side-by-side) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <WorkoutTracker />
        <WaterTracker />
        <SupplementTracker />
      </section>

      {/* Workout Calendar Section (Spacious Full Width) */}
      <section className="w-full">
        <WorkoutCalendar />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none p-6 flex flex-col h-[400px] transition-colors duration-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display font-black text-lg text-slate-900 dark:text-white">Haftalık Ağırlık Analizi</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Zaman içindeki kilo dalgalanma grafiğiniz</p>
            </div>
            <select className="text-xs border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 outline-none text-slate-500 dark:text-slate-400 font-bold transition-all hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer">
              <option>Son 7 Gün</option>
              <option>Son 30 Gün</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            {records.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f8fafc'} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: '700', textTransform: 'uppercase'}} 
                  />
                  <YAxis hide={true} domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: theme === 'dark' ? '1px solid #334155' : '1px solid #f1f5f9', 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
                      fontSize: '13px', 
                      fontFamily: 'Plus Jakarta Sans', 
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }}
                    itemStyle={{ color: theme === 'dark' ? '#94a3b8' : '#0f172a' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="text-center p-6">
                  <Info className="mx-auto h-8 w-8 mb-2 text-indigo-400 opacity-65" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Henüz Grafik Verisi Yok</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px] mx-auto">Grafik oluşturmak için en az bir ağırlık kaydı girin.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* AI Recommendations Banner */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-1000 rounded-2xl text-white p-7 shadow-xl shadow-indigo-950/20 dark:shadow-none flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 bg-white/5 border border-white/10 rounded-xl text-yellow-500 text-lg">✨</span>
              <h2 className="text-lg font-display font-black tracking-tight text-white">
                Kişiselleştirilmiş AI Önerileri
              </h2>
            </div>
            <div className="space-y-5">
              <div className="border-l-2 border-indigo-500 pl-4 py-0.5">
                <div className="text-sm font-bold text-slate-100 mb-1">Gelişim Seviyesi</div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {latestRecord 
                    ? `Ağırlık trendinizin ${weightChange === 0 ? 'stabil' : Number(weightChange) > 0 ? 'yukarı' : 'aşağı'} yönde seyrettiği gözlemleniyor. Kalori dengenizi korumaya odaklanın.`
                    : 'Henüz sağlık kaydı yapmadınız. İlk ölçümünüzü kaydederek kişisel analizleri alabilirsiniz.'}
                </p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-4 py-0.5">
                <div className="text-sm font-bold text-slate-100 mb-1">Aktif Kalma & Hidrasyon</div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Metabolizma hızınızı korumak ve kas onarımını desteklemek için su sayacını kullanarak günlük su hedefini takip edin!
                </p>
              </div>
            </div>
          </div>
          <Link 
            to="/analysis" 
            className="mt-8 w-full py-3.5 bg-white text-slate-950 rounded-xl font-bold text-xs uppercase tracking-widest text-center hover:bg-slate-100 active:scale-98 transition-all shadow-md shadow-white/5 cursor-pointer"
          >
            Gelişmiş AI Raporu Al
          </Link>
        </section>
      </div>
    </div>
  );
}
