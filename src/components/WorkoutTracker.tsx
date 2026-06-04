import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Dumbbell, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';

export default function WorkoutTracker() {
  const { user, activeProfileId } = useAuth();
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      if (user && activeProfileId) {
        const completed = await firebaseService.getWorkoutStatus(user.uid, activeProfileId, today);
        setIsCompleted(completed);
      } else if (activeProfileId) {
        setIsCompleted(storageService.getWorkoutStatus(today, activeProfileId));
      }
      setLoading(false);
    };

    checkStatus();
  }, [user, activeProfileId, today]);

  useEffect(() => {
    if (!isCompleted) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      let diff = tomorrow.getTime() - now.getTime();
      if (diff < 0) diff = 0;
      
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) || 0;
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) || 0;
      const seconds = Math.floor((diff % (1000 * 60)) / 1000) || 0;
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  if (loading) return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse transition-colors duration-200">
       <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded mb-4" />
       <div className="h-12 w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl" />
    </div>
  );

  return (
    <div className={`relative overflow-hidden p-6 md:p-8 rounded-3xl border transition-all duration-500 ${
      isCompleted 
        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 shadow-sm' 
        : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 shadow-lg shadow-indigo-100/50 dark:shadow-none'
    }`}>
      {/* Background Decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 pointer-events-none ${
        isCompleted ? 'bg-emerald-500' : 'bg-white'
      }`} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 shrink-0 ${
             isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100/50 dark:shadow-none' : 'bg-white text-indigo-600 shadow-sm'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Dumbbell className="w-7 h-7" />}
          </div>
          <div>
            <h3 className={`text-lg font-display font-black tracking-tight ${isCompleted ? 'text-emerald-900 dark:text-emerald-100' : 'text-white'}`}>
              {isCompleted ? 'Bugünkü Antrenman Tamam!' : 'Günlük Egzersizini Yap'}
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${isCompleted ? 'text-emerald-600/90 dark:text-emerald-400' : 'text-indigo-100/85'}`}>
              {isCompleted 
                ? 'Harika gidiyorsun, disiplinin meyvelerini verecek.' 
                : 'Sadece 7 dakikada enerjini yükselt ve formda kal.'}
            </p>
          </div>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-xl font-extrabold text-xs uppercase tracking-wider self-start sm:self-auto border border-emerald-200/50 dark:border-emerald-800/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Tamamlandı
          </div>
        ) : (
          <button
            onClick={() => navigate('/workout')}
            className="group flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-indigo-600 rounded-xl font-display font-black text-xs uppercase tracking-widest shadow-md hover:bg-slate-50 transition-all active:scale-97 self-start sm:self-auto cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Hadi Başlayalım
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Progress Streak Hint */}
      {!isCompleted && (
        <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-ping" />
            <p className="text-[9px] font-extrabold text-indigo-200 uppercase tracking-widest">Bugün henüz spor yapmadın</p>
        </div>
      )}

      {isCompleted && (
        <div className="mt-5 pt-5 border-t border-emerald-900/10 dark:border-emerald-100/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest tabular-nums">
              Sonraki Antrenmana: {timeLeft.hours} saat {timeLeft.minutes} dk {timeLeft.seconds} saniye
            </p>
        </div>
      )}
    </div>
  );
}
