import React, { useState, useEffect } from 'react';
import { Pill, Sparkles, Flame, CheckCircle2, Loader2, Activity, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  icon: 'protein' | 'creatine' | 'collagen' | 'vitamin';
}

const DEFAULT_SUPPLEMENTS: SupplementItem[] = [
  { id: 'protein', name: 'Protein Tozu', dosage: '1 Ölçek (30g)', icon: 'protein' },
  { id: 'creatine', name: 'Kreatin', dosage: '1 Ölçek (5g)', icon: 'creatine' },
  { id: 'collagen', name: 'Kolajen', dosage: '1 Tablet/Ölçek', icon: 'collagen' },
  { id: 'vitamin', name: 'Multivitamin / Omega 3', dosage: '1 Kapsül', icon: 'vitamin' }
];

export default function SupplementTracker() {
  const { user, activeProfileId } = useAuth();
  const { theme } = useTheme();
  const [takenMap, setTakenMap] = useState<{ [key: string]: boolean }>({});
  const [customDosages, setCustomDosages] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      setTakenMap({});
      setLoading(true);
      try {
        if (activeProfileId) {
          if (user) {
            const cloudData = await firebaseService.getSupplements(user.uid, activeProfileId, today);
            setTakenMap(cloudData);

            const dosages = await firebaseService.getSupplementDosages(user.uid, activeProfileId);
            setCustomDosages(dosages);
          } else {
            const localData = storageService.getSupplements(today, activeProfileId);
            setTakenMap(localData);

            const dosages = storageService.getSupplementDosages(activeProfileId);
            setCustomDosages(dosages);
          }
        }
      } catch (error: any) {
        console.error("Supplement fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, activeProfileId, today]);

  const toggleSupplement = async (id: string) => {
    if (pendingUpdate) return;
    
    const nextMap = {
      ...takenMap,
      [id]: !takenMap[id]
    };
    
    setTakenMap(nextMap);
    setPendingUpdate(true);

    try {
      if (user && activeProfileId) {
        await firebaseService.updateSupplements(user.uid, activeProfileId, today, nextMap);
      } else if (activeProfileId) {
        storageService.saveSupplements(today, nextMap, activeProfileId);
      }
    } catch (error: any) {
      console.error("Supplement update error:", error);
    } finally {
      setPendingUpdate(false);
    }
  };

  const startEditing = (e: React.MouseEvent, id: string, currentVal: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentVal);
  };

  const saveCustomDosage = async (id: string) => {
    if (!activeProfileId) return;
    const finalValue = editValue.trim();
    if (!finalValue) {
      setEditingId(null);
      return;
    }

    const nextDosages = {
      ...customDosages,
      [id]: finalValue
    };
    setCustomDosages(nextDosages);
    setEditingId(null);

    try {
      if (user) {
        await firebaseService.saveSupplementDosages(user.uid, activeProfileId, nextDosages);
      } else {
        storageService.saveSupplementDosages(nextDosages, activeProfileId);
      }
    } catch (error) {
      console.error("Failed to save custom dosage:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'protein':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'creatine':
        return <Activity className="w-5 h-5 text-indigo-500" />;
      case 'collagen':
        return <Sparkles className="w-5 h-5 text-rose-500" />;
      default:
        return <Pill className="w-5 h-5 text-emerald-500" />;
    }
  };

  const totalCount = DEFAULT_SUPPLEMENTS.length;
  const takenCount = DEFAULT_SUPPLEMENTS.filter(s => takenMap[s.id]).length;
  const isAllTaken = totalCount > 0 && takenCount === totalCount;
  const completionProgress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-full min-h-[340px]">
        <Loader2 className="w-8 h-8 text-indigo-550 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">Takviye bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group h-full flex flex-col justify-between transition-colors duration-200">
      
      {/* Background Graphic watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Pill className="w-36 h-36 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Günlük Takviyeler
              {isAllTaken && <CheckCircle2 className="text-emerald-500 w-5.5 h-5.5" />}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Besin desteklerinizi tek tıkla işaretleyin
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-xl">
              {takenCount} / {totalCount} Alındı
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionProgress}%` }}
            className={`h-full rounded-full transition-colors duration-500 ${
              isAllTaken ? 'bg-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.25)]' : 'bg-indigo-600 dark:bg-indigo-500'
            }`}
          />
        </div>

        {/* Supplements Checklist Stack */}
        <div className="space-y-2.5 pt-2">
          {DEFAULT_SUPPLEMENTS.map((item) => {
            const isTaken = !!takenMap[item.id];
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (editingId !== item.id) {
                    toggleSupplement(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group/item active:scale-[0.99] cursor-pointer select-none ${
                  isTaken 
                    ? 'bg-emerald-50/5 dark:bg-emerald-950/10 border-emerald-50/30 dark:border-emerald-50/20' 
                    : 'bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/20 dark:hover:bg-slate-850 border-slate-100 hover:border-slate-200 dark:border-slate-800/80 dark:hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Supplement specific Icon */}
                  <div className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                    isTaken 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 group-hover/item:border-slate-300 dark:group-hover/item:border-slate-600'
                  }`}>
                    {getIcon(item.icon)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold transition-all block truncate ${
                      isTaken 
                        ? 'text-slate-850 dark:text-slate-200 line-through opacity-70' 
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.name}
                    </span>
                    
                    {/* Inline dosage customization */}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 w-full max-w-[170px]">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveCustomDosage(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveCustomDosage(item.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="text-[10px] font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-indigo-400/50 rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                          />
                          <button
                            onClick={() => saveCustomDosage(item.id)}
                            className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/edit min-w-0">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-tight block truncate">
                            Miktar: {customDosages[item.id] || item.dosage}
                          </span>
                          <button
                            onClick={(e) => startEditing(e, item.id, customDosages[item.id] || item.dosage)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all opacity-0 group-hover/item:opacity-100 focus:opacity-100 shrink-0 cursor-pointer"
                            title="Miktarı Düzenle"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkbox state representation */}
                <div className={`p-1.5 rounded-lg border-2 transition-all shrink-0 ml-3 ${
                  isTaken 
                    ? 'bg-emerald-500 border-emerald-500 text-white scale-105 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover/item:border-slate-350 text-transparent'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isAllTaken && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-5 p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md shrink-0">
               <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-emerald-950 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">TÜMÜ ALINDI! ⚡</p>
              <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-medium mt-0.5">Bugünkü besin desteklerini eksiksiz tamamladın.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
