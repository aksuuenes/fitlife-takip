import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Dumbbell, Sparkles, Smile, Trophy, Info, Award, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';

interface WorkoutHistoryItem {
  date: string;
  completed: boolean;
  mood?: string;
  note?: string;
  workoutTitle?: string;
  exercises?: string[];
}

const MOODS: { [key: string]: { emoji: string; text: string; color: string } } = {
  fantastic: { emoji: '🤩', text: 'Harika / Canlı', color: 'bg-amber-500/10 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  good: { emoji: '😊', text: 'İyi / Dengeli', color: 'bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  tired: { emoji: '😐', text: 'Yorucu / Tatlı', color: 'bg-blue-500/10 dark:bg-blue-500/5 text-blue-700 dark:text-indigo-400 border-blue-500/20' },
  exhausted: { emoji: '🥵', text: 'Çok Zorlu', color: 'bg-orange-500/10 dark:bg-orange-500/5 text-orange-700 dark:text-orange-400 border-orange-500/20' },
  sore: { emoji: '🤕', text: 'Kas Ağrılı', color: 'bg-rose-500/10 dark:bg-rose-500/5 text-rose-700 dark:text-rose-400 border-rose-500/20' },
};

export default function WorkoutCalendar() {
  const { user, activeProfileId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Fetch history when profile/user changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!activeProfileId) return;
      setLoading(true);
      try {
        if (user) {
          const history = await firebaseService.getWorkoutHistory(user.uid, activeProfileId);
          setWorkoutHistory(history);
        } else {
          setWorkoutHistory(storageService.getWorkoutHistory(activeProfileId));
        }
      } catch (err) {
        console.error("Workout calendar fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user, activeProfileId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar Helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Adjust starting day so Monday is 0 and Sunday is 6
  const adjustedStartOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getFormattedDateString = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Find workout for a specific YYYY-MM-DD date string
  const getWorkoutForDate = (dateStr: string) => {
    return workoutHistory.find(w => w.date === dateStr && w.completed);
  };

  const selectedWorkout = getWorkoutForDate(selectedDateStr);

  const getTurkishFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  };

  const calendarDays = [];
  // Render blank slots for start offset
  for (let i = 0; i < adjustedStartOffset; i++) {
    calendarDays.push(<div key={`empty-start-${i}`} className="h-8 w-8 mx-auto" />);
  }

  // Render month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = getFormattedDateString(day);
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const hasWorkout = !!getWorkoutForDate(dateStr);
    const isSelected = selectedDateStr === dateStr;

    calendarDays.push(
      <button
        key={`day-${day}`}
        onClick={() => setSelectedDateStr(dateStr)}
        className={`h-8 w-8 mx-auto rounded-full font-mono text-[11px] font-black transition-all flex flex-col items-center justify-center relative cursor-pointer active:scale-95 hover:scale-105 ${
          isSelected 
            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white dark:from-emerald-450 dark:to-teal-500 dark:text-slate-950 shadow-lg shadow-indigo-150/40 dark:shadow-none ring-2 ring-indigo-555/20' 
            : isToday 
              ? 'bg-indigo-50/70 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40 font-extrabold'
              : 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <span>{day}</span>
        {hasWorkout && (
          <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
            isSelected 
              ? 'bg-white dark:bg-slate-950' 
              : 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.95)] animate-pulse'
          }`} />
        )}
      </button>
    );
  }

  // Calculate monthly stats
  const totalWorkoutsThisMonth = workoutHistory.filter(w => {
    if (!w.completed) return false;
    const wDate = new Date(w.date);
    return wDate.getFullYear() === year && wDate.getMonth() === month;
  }).length;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Calendar Core Section */}
        <div className="xl:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-450" />
                Antrenman Takvimi
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Spor yaptığınız günleri ve detaylarını görün</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 p-1.5 rounded-xl">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-extrabold uppercase font-sans text-slate-750 dark:text-slate-200 px-2 min-w-[85px] text-center tracking-tight">
                {monthNames[month]} {year}
              </span>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 dark:from-emerald-950/10 dark:to-indigo-950/10 p-3.5 border border-emerald-100/30 dark:border-emerald-900/10 rounded-2xl">
            <Award className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">BU AYIN BAŞARISI</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                Bu ay toplam <span className="text-emerald-500 font-black">{totalWorkoutsThisMonth}</span> gün antrenman tamamladın! 🏆
              </p>
            </div>
          </div>

          {/* Weekdays header */}
          <div className="grid grid-cols-7 text-center gap-1">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
              <span key={d} className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider py-1 w-8 mx-auto flex items-center justify-center">{d}</span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 text-center gap-1 pt-1 border-t border-slate-50 dark:border-slate-800/80">
            {loading ? (
              <div className="col-span-7 py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-indigo-650 animate-spin" />
              </div>
            ) : (
              calendarDays
            )}
          </div>
        </div>

        {/* Selected Day Details Pane */}
        <div className="w-full xl:col-span-1 bg-gradient-to-br from-slate-50/50 to-white/90 dark:from-slate-900/30 dark:to-slate-950/50 hover:bg-slate-50/80 dark:hover:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-[32px] p-6 md:p-8 transition-all duration-300 flex flex-col justify-between min-h-[380px] shadow-sm">
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-150 dark:border-slate-800/80">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-indigo-650 dark:text-emerald-450 block">SEÇİLEN GÜN</span>
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mt-1.5 font-display tracking-tight leading-tight">
                {getTurkishFullDate(selectedDateStr)}
              </h3>
            </div>

            <AnimatePresence mode="wait">
              {selectedWorkout ? (
                <motion.div 
                  key="workout-details"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="space-y-5 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100/50 dark:shadow-none shrink-0 border border-emerald-400/20 mt-0.5">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-mono font-extrabold uppercase text-emerald-500 dark:text-emerald-400 tracking-wider block">ANTRENMAN TAMAMLANDI!</span>
                      <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white mt-1 leading-tight font-display tracking-tight break-words text-left">
                        {selectedWorkout.workoutTitle || 'Profesyonel Antrenman'}
                      </h4>
                    </div>
                  </div>

                  {/* Mood indicator badge if exists */}
                  {selectedWorkout.mood && MOODS[selectedWorkout.mood] && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl w-max text-xs font-bold text-left ${MOODS[selectedWorkout.mood].color}`}>
                      <span>{MOODS[selectedWorkout.mood].emoji}</span>
                      <span>Mod: {MOODS[selectedWorkout.mood].text}</span>
                    </div>
                  )}

                  {/* Exercise items done */}
                  {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-3 max-h-[220px] overflow-y-auto shadow-inner">
                      <span className="text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">YAPILAN HAREKETLER</span>
                      <div className="space-y-2">
                        {selectedWorkout.exercises.map((ex, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs font-bold text-slate-700 dark:text-slate-350">
                            <span className="w-5 h-5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center font-mono font-black text-[10px] border border-slate-100 dark:border-slate-700 shrink-0 shadow-sm mt-0.5">{idx + 1}</span>
                            <span className="whitespace-normal break-words text-left flex-1 leading-tight">{ex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-2 shadow-inner">
                       <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                       <span className="text-xs text-slate-450 dark:text-slate-400 font-bold leading-relaxed">
                         Bu antrenman için hareket listesi saklanmamış (Önceki kayıt).
                       </span>
                    </div>
                  )}

                  {/* User custom notes if logged */}
                  {selectedWorkout.note && (
                    <div className="bg-gradient-to-br from-indigo-500/[0.03] to-indigo-500/[0.07] dark:from-slate-900/60 dark:to-indigo-950/20 border border-indigo-100/20 dark:border-slate-800 p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] font-mono font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">GÜNÜN NOTU 📓</span>
                      <p className="text-xs text-slate-750 dark:text-slate-350 italic font-medium leading-relaxed">
                        "{selectedWorkout.note}"
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-workout"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 flex flex-col items-center justify-center text-center space-y-5 animate-fade-in"
                >
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
                    <Info className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-750 dark:text-slate-200">Antrenman Kaydı Yok</h4>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-bold leading-relaxed max-w-[220px] mt-1.5 mx-auto">
                      Bu gün için kayıtlı egzersiz bulunmuyor. Harekete geçmek ve antrenman yapmak için harika bir gün! 💪⚡
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
             <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">FİTLİFE YÜKSEK YAŞAM ATLASI ★</span>
          </div>
        </div>

      </div>
    </div>
  );
}
