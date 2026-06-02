import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Minus, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function WaterTracker() {
  const { user, profile, activeProfileId, currentProfile } = useAuth();
  const { theme } = useTheme();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  
  // Daily water goal calculation logic
  const weightToUse = latestWeight || currentProfile?.initialWeight || profile?.initialWeight || 70;
  const calculatedGoal = Math.round((weightToUse * 35) / 100) * 100;
  const dailyGoal = calculatedGoal > 0 ? calculatedGoal : 2500;
  
  const glassSize = 250; // Standard 250ml per glass
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      setAmount(0);
      setLatestWeight(null);
      setLoading(true);
      try {
        if (user && activeProfileId) {
          // Fetch current water intake from Firebase
          const currentAmount = await firebaseService.getWaterIntake(user.uid, activeProfileId, today);
          setAmount(currentAmount);

          // Fetch latest health record to get current weight
          const records = await firebaseService.getHealthRecords(user.uid, activeProfileId);
          if (records.length > 0) {
            setLatestWeight(records[0].weight);
          }
        } else if (activeProfileId) {
          // Fallback to local storage for guest session
          const localAmount = storageService.getWaterIntake(today, activeProfileId);
          setAmount(localAmount);
          const localRecords = storageService.getRecords(activeProfileId);
          if (localRecords.length > 0) {
            setLatestWeight(localRecords[localRecords.length - 1].weight);
          }
        }
      } catch (error) {
        console.error("Water data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, activeProfileId, today]);

  const updateWater = async (newAmount: number) => {
    const clampedAmount = Math.max(0, newAmount);
    
    // Strict Limit: Cannot exceed daily goal
    let finalAmount = clampedAmount;
    if (clampedAmount > dailyGoal) {
      if (amount < dailyGoal) {
        finalAmount = dailyGoal;
      } else {
        return; // Already at or above goal
      }
    }

    setAmount(finalAmount);
    setPendingUpdate(true);
    
    try {
      if (user && activeProfileId) {
        await firebaseService.updateWaterIntake(user.uid, activeProfileId, today, finalAmount);
      } else if (activeProfileId) {
        storageService.saveWaterIntake(today, finalAmount, activeProfileId);
      }
    } catch (error) {
      console.error("Water update error:", error);
      alert("Su verisi kaydedilirken bir hata oluştu.");
    } finally {
      setPendingUpdate(false);
    }
  };

  const progress = Math.min((amount / dailyGoal) * 100, 100);
  const glasses = amount / glassSize;
  const goalGlasses = dailyGoal / glassSize;
  const isGoalReached = amount >= dailyGoal;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-full min-h-[340px]">
        <Loader2 className="w-8 h-8 text-indigo-550 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Su bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm shadow-slate-100/40 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group h-full flex flex-col justify-between transition-colors duration-200">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Droplet className="w-36 h-36 text-indigo-600 dark:text-indigo-450" />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Su Tüketimi
            {isGoalReached && <CheckCircle2 className="text-emerald-500 w-5.5 h-5.5" />}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Kişisel Hedef: <span className="text-slate-700 dark:text-slate-300 font-bold">{(dailyGoal / 1000).toFixed(1)}L</span> 
            <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight mt-0.5">
              ({weightToUse}kg için ideal oran)
            </span>
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
           <div className="flex items-baseline text-indigo-600 dark:text-indigo-400">
             <span className="text-3xl font-display font-black tracking-tight">{amount}</span>
             <span className="text-xs font-bold ml-1 uppercase">ml</span>
           </div>
           {pendingUpdate && <div className="text-[8px] font-black text-indigo-400 dark:text-indigo-550 animate-pulse uppercase tracking-widest mt-1">Kaydediliyor...</div>}
        </div>
      </div>

      <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-end">
        {/* Progress Bar */}
        <div className="h-10 bg-slate-50 dark:bg-slate-950/40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-1 relative shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-xl flex items-center justify-end px-4 transition-colors relative z-10 ${
              isGoalReached ? 'bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.2)]' : 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 shadow-[0_4px_12px_rgba(79,70,229,0.2)] dark:shadow-none'
            }`}
          >
            {progress > 15 && (
               <span className="text-white text-[9px] font-extrabold tracking-widest">% {Math.round(progress)}</span>
            )}
          </motion.div>
          
          {/* Animated Water Effect */}
          {!isGoalReached && progress > 0 && (
            <motion.div 
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-500/10"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => updateWater(amount - glassSize)}
               disabled={pendingUpdate}
               aria-label="Water decrease"
               className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-450 hover:border-rose-100 dark:hover:border-rose-900/40 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
             >
               <Minus className="w-5 h-5" />
             </button>
             <button 
               onClick={() => updateWater(amount + glassSize)}
               disabled={isGoalReached || pendingUpdate}
               className={`w-16 h-12 rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden cursor-pointer ${
                 isGoalReached 
                   ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-650 border border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-50' 
                   : 'bg-indigo-600 text-white hover:scale-102 hover:bg-indigo-700 active:scale-98 shadow-md shadow-indigo-100 dark:shadow-none'
               }`}
             >
               <Plus className="w-5 h-5 relative z-10" />
               <span className="text-[8px] font-extrabold uppercase tracking-wider relative z-10">
                 {isGoalReached ? 'Dolu' : 'Ekle'}
               </span>
             </button>
          </div>

          <div className="text-right">
             <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Bardak Sayısı</p>
             <div className="flex gap-1 justify-end flex-wrap max-w-[140px]">
                {[...Array(Math.max(10, Math.ceil(goalGlasses)))].map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ 
                      scale: i < glasses ? 1 : 0.8, 
                      opacity: i < glasses ? 1 : 0.2,
                      backgroundColor: i < Math.floor(glasses) ? '#4f46e5' : (i < glasses ? '#818cf8' : (theme === 'dark' ? '#334155' : '#e2e8f0'))
                    }}
                    className="w-2.5 h-2.5 rounded-full" 
                  />
                ))}
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isGoalReached && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-5 p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none shrink-0">
               <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-emerald-950 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">HARİKA BAŞARI!</p>
              <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-medium mt-0.5">Bugünkü su içme hedefinize ulaştınız.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
