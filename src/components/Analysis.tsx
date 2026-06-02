import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Loader2, Calendar, TrendingUp, TrendingDown, Target, Zap, Heart, ShieldAlert, CheckCircle2, AreaChart as ChartIcon } from 'lucide-react';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { analyzeHealthData } from '../services/geminiService';
import { HealthRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GarminInBodyHub from './GarminInBodyHub';

interface AnalysisResult {
  suggestion: string;
  feedback: string;
  score: number;
  categories: {
    title: string;
    content: string;
    status: 'pozitif' | 'nötr' | 'uyarı';
  }[];
  trend: 'yukarı' | 'aşağı' | 'stabil';
}

export default function Analysis() {
  const { user, profile, activeProfileId, currentProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [activeView, setActiveView] = useState<'garmin' | 'ai'>('garmin');

  useEffect(() => {
    const fetchRecords = async () => {
      setRecords([]);
      setAnalysis(null);
      setFetching(true);
      if (user && activeProfileId) {
        const data = await firebaseService.getHealthRecords(user.uid, activeProfileId);
        // Records come from Firebase in desc order, but some logic might expect asc
        setRecords([...data].reverse());
      } else if (!user && activeProfileId) {
        const data = storageService.getRecords(activeProfileId);
        setRecords(data);
      }
      setFetching(false);
    };

    fetchRecords();
  }, [user, activeProfileId]);

  const handleAnalysis = async () => {
    setLoading(true);
    // Use target profile metadata if available, otherwise fallback to main account
    const contextProfile = currentProfile ? {
      ...profile,
      initialHeight: currentProfile.initialHeight || profile?.initialHeight,
      initialWeight: currentProfile.initialWeight || profile?.initialWeight,
      birthDate: currentProfile.birthDate || profile?.birthDate,
      gender: currentProfile.gender || profile?.gender
    } : profile;
    
    const result = await analyzeHealthData(records.slice(-10), contextProfile);
    setAnalysis(result);
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Veriler Yükleniyor...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pozitif': return 'bg-emerald-50/60 text-emerald-800 border-emerald-100/60';
      case 'uyarı': return 'bg-amber-50/60 text-amber-800 border-amber-100/60';
      default: return 'bg-indigo-50/60 text-indigo-800 border-indigo-100/60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pozitif': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'uyarı': return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      default: return <Target className="w-5 h-5 text-indigo-600" />;
    }
  };

  const chartData = records.map(r => ({
    date: new Date(r.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    weight: r.weight,
    bmi: parseFloat(String(r.bmi)),
    sleep: r.sleepQuality || 0,
    hours: r.sleepHours || 0
  })).slice(-7);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[9px] font-mono font-extrabold rounded-lg uppercase tracking-widest shadow-md shadow-indigo-100">
              PRO ANALİZ & RAPORLAMA
            </span>
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">Sağlık Trendleri & Performans</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Garmin Connect entegrasyonu, InBody vücut kompozisyonu ve yapay zeka asistanınız.</p>
        </div>
      </header>

      {records.length > 0 ? (
        <div className="space-y-6">
          {/* Main Selection Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 p-1 rounded-2xl w-full sm:w-max gap-1">
            <button
              onClick={() => setActiveView('garmin')}
              className={`flex-1 sm:flex-initial px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeView === 'garmin'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              📊 Garmin Hub & InBody
            </button>
            <button
              onClick={() => setActiveView('ai')}
              className={`flex-1 sm:flex-initial px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeView === 'ai'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              ✨ Yapay Zeka (AI) Raporu
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'garmin' ? (
              <motion.div
                key="garmin-view"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <GarminInBodyHub records={records} />
              </motion.div>
            ) : (
              <motion.div
                key="ai-view"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Sidebar / Trigger Area */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                      <Brain className="w-28 h-28 text-slate-900 dark:text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-150">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl font-display font-black mb-3 text-slate-900 dark:text-white tracking-tight">Kişiselleştirilmiş Analiz</h2>
                      <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                        {records.length > 3 ? `Son ${records.length} kaydınız sistemimizde hazır.` : 'Daha iyi sonuçlar için birkaç kayıt daha yapın.'}
                      </p>
                      <button 
                        onClick={handleAnalysis}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 rounded-xl font-display font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center disabled:opacity-50 shadow-md shadow-indigo-100 transform active:scale-98 cursor-pointer"
                      >
                        {loading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <><Zap className="mr-2 w-4 h-4" /> Analizi Güncelle</>}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-805 shadow-sm shadow-slate-100/40">
                      <div className="flex items-center gap-2 mb-4">
                          <ChartIcon className="w-4 h-4 text-slate-400" />
                          <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kilo Trendi</h3>
                      </div>
                      <div className="h-40 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                  <defs>
                                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" className="dark:hidden" />
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                                  <XAxis dataKey="date" hide />
                                  <YAxis hide domain={['dataMin - 3', 'dataMax + 3']} />
                                  <Tooltip 
                                      contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', fontSize: '12px' }}
                                      labelStyle={{ fontWeight: 'bold' }}
                                  />
                                  <Area type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-4 flex justify-between items-center text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <span>{chartData[0]?.date}</span>
                          <span> Bugün</span>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-sm shadow-slate-100/40">
                      <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-4 h-4 text-indigo-500" />
                          <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Uyku Süresi (Saat)</h3>
                      </div>
                      <div className="h-40 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                  <defs>
                                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" className="dark:hidden" />
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                                  <XAxis dataKey="date" hide />
                                  <YAxis hide domain={[0, 12]} />
                                  <Tooltip 
                                      contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', fontSize: '12px' }}
                                      labelStyle={{ fontWeight: 'bold' }}
                                      formatter={(value) => [`${value} Saat`, 'Süre']}
                                  />
                                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-4 flex justify-between items-center text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <span>{chartData[0]?.date}</span>
                          <span> Bugün</span>
                      </div>
                  </div>

                </div>

                {/* Main Results Area */}
                <div className="lg:col-span-8 space-y-6">
                  <AnimatePresence mode="wait">
                    {!analysis && !loading && (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-50 dark:bg-slate-905 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center"
                      >
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6 border border-slate-100 dark:border-slate-800">
                          <Brain className="h-9 w-9 text-slate-300 dark:text-slate-650" />
                        </div>
                        <h3 className="text-slate-905 dark:text-white text-lg font-display font-black tracking-tight">Raporunuz Hazırlanmayı Bekliyor</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mx-auto mt-2 font-medium">Biyometrik verilerinizi profesyonel yapay zeka modelleri ile işlemek için yukarıdaki butona tıklayın.</p>
                      </motion.div>
                    )}

                    {loading && (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm"
                      >
                        <div className="relative flex justify-center">
                          <Loader2 className="h-20 w-20 text-indigo-600 animate-spin" />
                          <Brain className="h-8 w-8 text-indigo-950 dark:text-indigo-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-display font-black mt-8 tracking-tight animate-pulse">Veriler Analiz Ediliyor...</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 italic font-medium">Gemini Wellness AI motoru sağlık profilinizi optimize ediyor.</p>
                      </motion.div>
                    )}

                    {analysis && (
                      <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        {/* Health Score Header */}
                        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 md:p-10 rounded-3xl shadow-xl shadow-indigo-950/20 text-white relative overflow-hidden">
                           <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
                           <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                              <div className="relative inline-flex items-center justify-center shrink-0">
                                  <svg className="w-32 h-32 transform -rotate-90">
                                  <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="10" fill="none" />
                                  <motion.circle 
                                      cx="64" cy="64" r="56" 
                                      stroke="#4f46e5" strokeWidth="10" fill="none"
                                      strokeDasharray={2 * Math.PI * 56}
                                      animate={{ strokeDashoffset: (1 - analysis.score / 100) * (2 * Math.PI * 56) }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                  />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-4xl font-display font-black">{analysis.score}</span>
                                  <span className="text-[8px] font-mono font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">PUAN</span>
                                  </div>
                              </div>
                              <div>
                                  <div className="flex items-center gap-2 mb-3">
                                      <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">Mevcut Durum:</span>
                                      {analysis.trend === 'yukarı' ? (
                                      <div className="flex items-center text-emerald-400 font-bold text-[10px] uppercase bg-emerald-400/10 px-2.5 py-0.5 rounded-lg border border-emerald-400/15">
                                          <TrendingUp className="w-3 h-3 mr-1" /> Pozitif Gelişim
                                      </div>
                                      ) : analysis.trend === 'aşağı' ? (
                                      <div className="flex items-center text-rose-400 font-bold text-[10px] uppercase bg-rose-400/10 px-2.5 py-0.5 rounded-lg border border-rose-400/15">
                                          <TrendingDown className="w-3 h-3 mr-1" /> Dikkat Gerekir
                                      </div>
                                      ) : (
                                      <div className="text-slate-400 font-bold text-[10px] uppercase bg-slate-400/10 px-2.5 py-0.5 rounded-lg border border-slate-400/15">Stabil</div>
                                      )}
                                  </div>
                                  <h2 className="text-xl font-display font-black mb-2 tracking-tight">Kişiselleştirilmiş İyileşme Raporu</h2>
                                  <p className="text-slate-300 text-xs leading-relaxed max-w-lg font-medium">
                                      {analysis.feedback.substring(0, 150)}...
                                  </p>
                              </div>
                           </div>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {analysis.categories.map((cat, idx) => (
                            <motion.div 
                              key={idx}
                              className={`p-6 rounded-2xl border transition-all ${getStatusColor(cat.status)}`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                  <div className="font-display font-black text-xs uppercase tracking-tight">{cat.title}</div>
                                  {getStatusIcon(cat.status)}
                              </div>
                              <p className="text-[11px] font-semibold leading-relaxed opacity-90">
                                {cat.content}
                              </p>
                            </motion.div>
                          ))}
                        </div>

                        {/* Summary Feedback */}
                        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                                  <Heart className="w-4.5 h-4.5 fill-current" />
                              </div>
                              <h2 className="text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">Profesyonel Görüş</h2>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-semibold mb-8">
                            {analysis.feedback}
                          </p>
                          
                          <div className="p-5 bg-slate-50/60 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                              <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                  <p className="text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Stratejik Odak Noktası</p>
                                  <p className="font-display font-black text-slate-900 dark:text-white text-md tracking-tight">{analysis.suggestion}</p>
                              </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-lg">
                          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                              <Brain className="w-48 h-48" />
                          </div>
                          <div className="relative z-10 text-center md:text-left">
                              <h4 className="text-lg font-display font-black mb-1">Daha Fazla Veri, Daha Güçlü Raporlar</h4>
                              <p className="text-indigo-100 text-xs font-semibold">Her gün sağlık verilerinizi girerek analiz kalitesini artırın.</p>
                          </div>
                          <Link to="/add" className="relative z-10 px-6 py-3.5 bg-white text-indigo-600 rounded-xl font-display font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-97 shrink-0 shadow-md">
                              İlk Kaydı Oluştur
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 md:p-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <Calendar className="mx-auto h-16 w-16 text-slate-205 dark:text-slate-700 mb-6" />
          <h2 className="text-2xl font-display font-black mb-3 text-slate-900 dark:text-white tracking-tight">AI Analiz İçin Veri Bekliyor</h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-medium text-sm leading-relaxed">
            Gelişmiş analizlerin kilidini açmak için ilk sağlık kaydınızı veya antrenmanınızı tamamlamalısınız.
          </p>
          <Link 
            to="/add" 
            className="mt-8 inline-block bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all active:scale-97 shadow-md"
          >
            İlk Kaydı Oluştur
          </Link>
        </div>
      )}
    </div>
  );
}
