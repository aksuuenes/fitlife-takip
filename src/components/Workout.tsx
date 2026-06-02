import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, ChevronRight, X, CheckCircle2, Timer, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise } from '../types';
import ExerciseAnimation from './ExerciseAnimation';
import AnatomyAtlas from './AnatomyAtlas';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';

export default function Workout() {
  const { user, activeProfileId } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'READY' | 'ACTIVE' | 'REST'>('READY');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('Profesyonel Mod');
  
  const [mood, setMood] = useState<string>('good');
  const [note, setNote] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [savingNote, setSavingNote] = useState<boolean>(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('current_workout');
    const params = sessionStorage.getItem('workout_params');
    if (saved) {
      const data = JSON.parse(saved);
      setExercises(data);
    } else {
        navigate('/workout');
    }
    if (params) {
      const parsed = JSON.parse(params);
      if (parsed.title) {
        setWorkoutTitle(parsed.title);
      }
    }
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handlePhaseEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase]);

  if (exercises.length === 0) return null;

  const MOTIVATIONAL_TIPS = [
    "Derin nefes al, oksijen kaslarına gitsin.",
    "Formuna odaklan, kalite nicelikten önemlidir.",
    "Bunu yapabilirsin, sınırlarını zorla!",
    "Su içmeyi unutma, hidrasyon performanstır.",
    "Dik dur, kendine güven!",
    "Yorgunluk geçicidir, başarı kalıcıdır.",
    "Her tekrar seni hedefine yaklaştırır.",
    "Zihnin bedeninden daha güçlüdür."
  ];

  const currentExercise = exercises[currentIndex];
  const currentTip = MOTIVATIONAL_TIPS[currentIndex % MOTIVATIONAL_TIPS.length];

  const handlePhaseEnd = () => {
    if (phase === 'READY') {
      setPhase('ACTIVE');
      setTimeLeft(currentExercise.duration);
    } else if (phase === 'ACTIVE') {
      if (currentIndex < exercises.length - 1) {
        setPhase('REST');
        setTimeLeft(20);
      } else {
        setIsFinished(true);
        setIsActive(false);
        saveCompletion();
      }
    } else if (phase === 'REST') {
      setCurrentIndex((prev) => prev + 1);
      setPhase('READY');
      setTimeLeft(10);
    }
  };

  const saveCompletion = async () => {
    const today = new Date().toISOString().split('T')[0];
    const exerciseList = exercises.map(ex => ex.name);
    if (user && activeProfileId) {
      await firebaseService.updateWorkoutStatus(user.uid, activeProfileId, today, true, mood, note, workoutTitle, exerciseList);
    } else if (activeProfileId) {
      storageService.saveWorkoutStatus(today, true, activeProfileId, mood, note, workoutTitle, exerciseList);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    const today = new Date().toISOString().split('T')[0];
    const exerciseList = exercises.map(ex => ex.name);
    try {
      if (user && activeProfileId) {
        await firebaseService.updateWorkoutStatus(user.uid, activeProfileId, today, true, mood, note, workoutTitle, exerciseList);
      } else if (activeProfileId) {
        storageService.saveWorkoutStatus(today, true, activeProfileId, mood, note, workoutTitle, exerciseList);
      }
      setNoteSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg p-6 md:p-8 rounded-[36px] shadow-2xl border border-slate-100 dark:border-slate-800 my-8 space-y-6 text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 dark:text-white mt-1 tracking-tight">Antrenman Tamamlandı!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Büyük başarı. Bugün bedenine çok iyi baktın.</p>
          </div>

          {/* Günün Notu & His Alanı */}
          <div className="bg-slate-50/70 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-500 dark:text-indigo-400 font-extrabold block">BUGÜN NASIL HİSSETTİN?</span>
              
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[
                  { id: 'fantastic', emoji: '🤩', label: 'Harika' },
                  { id: 'good', emoji: '😊', label: 'İyi' },
                  { id: 'tired', emoji: '😐', label: 'Yorgun' },
                  { id: 'exhausted', emoji: '🥵', label: 'Zorlu' },
                  { id: 'sore', emoji: '🤕', label: 'Ağrılı' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMood(item.id);
                      setNoteSaved(false);
                    }}
                    type="button"
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                      mood === item.id 
                        ? 'border-indigo-505 bg-indigo-50/10 dark:bg-slate-800 shadow-sm scale-102 border-indigo-500' 
                        : 'border-transparent bg-slate-100/40 hover:bg-slate-100 dark:bg-slate-850'
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-500 dark:text-indigo-400 font-extrabold">GÜNÜN NOTU</span>
                {noteSaved && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">Kaydedildi!</span>
                )}
              </div>
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setNoteSaved(false);
                }}
                placeholder="Bugünkü antrenmanla ilgili düşüncelerini, vücudunun nasıl hissettiğini veya kaldırdığın ağırlıkları buraya not et..."
                className="w-full h-24 p-3 text-xs bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder-slate-400 placeholder:text-[11px] font-medium text-slate-850 dark:text-slate-200"
              />
            </div>

            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                noteSaved 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-405 border border-emerald-100 dark:border-emerald-900/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              {savingNote ? (
                <>Not Kaydediliyor...</>
              ) : noteSaved ? (
                <>✓ Günün Notu Kaydedildi</>
              ) : (
                <>Günün Notunu ve Modunu Kaydet</>
              )}
            </button>
          </div>

          <div className="pt-2">
            <button 
              onClick={async () => {
                if (!noteSaved && (note !== '' || mood !== 'good')) {
                  await handleSaveNote();
                }
                navigate('/');
              }}
              className="w-full py-3.5 bg-slate-950 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Tamamla ve Kapat
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col overflow-hidden transition-colors duration-500 ${
      phase === 'READY' ? 'bg-orange-50' : phase === 'REST' ? 'bg-emerald-50' : 'bg-slate-50'
    }`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm relative z-20">
        <div className="flex items-center gap-3">
           <div className={`px-3 py-1 text-white text-[10px] font-black rounded-lg uppercase tracking-widest transition-colors ${
             phase === 'READY' ? 'bg-orange-500' : phase === 'REST' ? 'bg-emerald-500' : 'bg-blue-600'
           }`}>
              {phase === 'READY' ? 'HAZIRLAN' : phase === 'REST' ? 'DİNLENME' : 'ANTRENMAN'}
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-black text-slate-900 tracking-tighter uppercase">Hareket {currentIndex + 1} / {exercises.length}</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{workoutTitle}</span>
           </div>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 w-full overflow-hidden relative z-20">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + (phase === 'REST' ? 1 : 0.5)) / exercises.length) * 100}%` }}
          className={`h-full transition-colors duration-500 shadow-[0_0_10px_rgba(0,0,0,0.1)] ${
            phase === 'READY' ? 'bg-orange-500' : phase === 'REST' ? 'bg-emerald-500' : 'bg-blue-600'
          }`}
        />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Background Elements for an athletic feel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-stretch justify-center gap-8 md:gap-10 relative z-10 h-full">
          {/* Biomechanical Viewer & Anatomy Split Grid */}
          <div className="flex-1 min-w-0 grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">
            
            {/* Left Side: 3D Biomechanical Viewer (col-span 3) */}
            <div className="xl:col-span-3 flex flex-col items-stretch">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${currentExercise.id}-${phase}`}
                  initial={{ y: 30, opacity: 0, scale: 0.97 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -30, opacity: 0, scale: 0.97 }}
                  transition={{ type: "spring", damping: 25, stiffness: 120 }}
                  className="bg-white p-6 md:p-8 rounded-[36px] shadow-xl border border-slate-100/80 backdrop-blur-sm relative flex flex-col justify-between h-full"
                >
                  {/* Phase Accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] ${
                    phase === 'READY' ? 'bg-orange-500' : phase === 'REST' ? 'bg-emerald-500' : 'bg-blue-600'
                  }`} />
                  
                  {/* Animation Container */}
                  <div className="w-full aspect-square md:aspect-[16/9] bg-slate-950 rounded-[28px] overflow-hidden flex items-center justify-center relative shadow-inner">
                    {phase !== 'REST' && currentExercise.image ? (
                      <img
                        src={currentExercise.image}
                        alt={currentExercise.name}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-xl p-4"
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <ExerciseAnimation type={phase === 'REST' ? 'Rest' : currentExercise.name} />
                    )}
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${
                        phase === 'READY' ? 'bg-orange-50 text-orange-600 border border-orange-100/50' : phase === 'REST' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-blue-50 text-blue-600 border border-blue-100/50'
                      }`}>
                        {phase === 'REST' ? <Info className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
                        <span className="font-black text-xs uppercase tracking-wider">
                          {phase === 'REST' ? 'Mola' : (phase === 'READY' ? 'HAZIRLIK' : 'ÇALIŞMA')}
                        </span>
                      </div>
                      
                      {phase !== 'REST' && (
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hedef Volüm</span>
                          <span className="text-xl font-black text-slate-900 tracking-tighter">{currentExercise.reps}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {phase === 'REST' ? 'Mola Ver & Nefes Al' : currentExercise.name}
                      </h1>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                        {phase === 'READY' ? 'Sonraki harekete odaklan, vücudunu doğru pozisyona hazırla.' : phase === 'REST' ? currentTip : currentExercise.description}
                      </p>
                    </div>

                    {/* Yapılış Adımları */}
                    {phase !== 'REST' && currentExercise.howTo && currentExercise.howTo.length > 0 && (
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">📋 YAPILIŞ ŞEKLİ</p>
                        <ol className="space-y-2">
                          {currentExercise.howTo.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white mt-0.5 ${
                                phase === 'READY' ? 'bg-orange-500' : 'bg-blue-600'
                              }`}>
                                {i + 1}
                              </span>
                              <span className="text-[12px] text-slate-600 font-medium leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {phase === 'REST' && currentIndex < exercises.length - 1 && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Play className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">SIRADAKİ HAREKET</p>
                          <p className="text-sm font-black text-slate-800 tracking-tight mt-1">{exercises[currentIndex + 1].name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Side: Anatomy Atlas (col-span 2) */}
            <div className="xl:col-span-2 h-full flex flex-col items-stretch">
              {phase !== 'REST' ? (
                <AnatomyAtlas category={currentExercise.category} exerciseName={currentExercise.name} />
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-xl h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.4)_0%,rgba(15,23,42,0.8)_100%)] pointer-events-none z-0" />
                  <div className="relative z-10 space-y-4">
                    <span className="text-4xl block animate-bounce">🧘‍♂️</span>
                    <h4 className="text-lg font-display font-black text-slate-150 tracking-tight">DİNLENME SÜRESİ</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto font-medium">
                      Derin diyafram nefesleri alarak kaslarınızı oksijenlendirin, nabzınızı kontrol altına alın ve sıradaki harekete konsantre olun.
                    </p>
                    <div className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-block">
                      Toparlanma Fazı Aktif
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Area (Timer Controls) */}
          <div className="w-full lg:w-80 flex flex-col items-center justify-center bg-white p-6 md:p-8 rounded-[36px] shadow-xl border border-slate-100/80 gap-6 md:gap-8 self-center lg:self-stretch">
            {/* Circular Countdown with enhanced styling */}
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="98"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="112"
                  cy="112"
                  r="98"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 98}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ 
                    strokeDashoffset: (1 - timeLeft / (phase === 'READY' ? 10 : phase === 'REST' ? 20 : currentExercise.duration)) * (2 * Math.PI * 98) 
                  }}
                  className={`transition-colors duration-550 ${
                    phase === 'READY' ? 'text-orange-500' : phase === 'REST' ? 'text-emerald-500' : 'text-blue-600'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${
                  phase === 'READY' ? 'text-orange-400' : phase === 'REST' ? 'text-emerald-400' : 'text-blue-400'
                }`}>KALAN SÜRE</span>
                <span className="text-6xl font-black tabular-nums text-slate-900 tracking-tighter leading-none">{timeLeft}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`group w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all shadow-lg active:scale-95 ${
                    isActive ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50' : 
                    (phase === 'READY' ? 'bg-orange-500 border-orange-400' : phase === 'REST' ? 'bg-emerald-500 border-emerald-400' : 'bg-blue-600 border-blue-500') + ' text-white'
                  }`}
                >
                  {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
                <button 
                  onClick={handlePhaseEnd}
                  className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 select-none uppercase">
                {isActive ? 'ANTRENMAN DEVAM EDİYOR' : 'DURAKLATILDI - SÜRATİ DEĞİŞTİR'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Professional Footer Navigation */}
      <footer className="p-8 bg-white border-t border-slate-100 hidden md:block relative z-20">
         <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex gap-12">
               <div className="flex flex-col">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Tempo</p>
                  <p className="font-black text-slate-900 uppercase">Kontrollü</p>
               </div>
               <div className="flex flex-col border-l border-slate-200 pl-8">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Sıradaki</p>
                  <p className="font-black text-slate-700">
                     {currentIndex < exercises.length - 1 ? exercises[currentIndex + 1].name : 'Final'}
                  </p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antrenman Akışı</span>
               <div className="flex gap-2">
                  {exercises.map((_, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={false}
                        animate={{ 
                          width: idx === currentIndex ? 48 : 8,
                          backgroundColor: idx === currentIndex ? '#2563eb' : idx < currentIndex ? '#94a3b8' : '#e2e8f0'
                        }}
                        className="h-2 rounded-full transition-colors" 
                      />
                  ))}
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
