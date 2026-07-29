import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
}

export default function MedicationTracker() {
  const { user, activeProfileId } = useAuth();
  const { theme } = useTheme();
  
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [takenMap, setTakenMap] = useState<{ [key: string]: boolean }>({});
  
  const [loading, setLoading] = useState(true);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeProfileId) {
          if (user) {
            const list = await firebaseService.getMedicationList(user.uid, activeProfileId);
            setMedications(list);
            
            const cloudData = await firebaseService.getMedicationLogs(user.uid, activeProfileId, today);
            setTakenMap(cloudData);
          } else {
            const list = storageService.getMedicationList(activeProfileId);
            setMedications(list);
            
            const localData = storageService.getMedicationLogs(today, activeProfileId);
            setTakenMap(localData);
          }
        }
      } catch (error: any) {
        console.error("Medication fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, activeProfileId, today]);

  const toggleMedication = async (id: string) => {
    if (pendingUpdate) return;
    
    const nextMap = {
      ...takenMap,
      [id]: !takenMap[id]
    };
    
    setTakenMap(nextMap);
    setPendingUpdate(true);

    try {
      if (user && activeProfileId) {
        await firebaseService.updateMedicationLogs(user.uid, activeProfileId, today, nextMap);
      } else if (activeProfileId) {
        storageService.saveMedicationLogs(today, nextMap, activeProfileId);
      }
    } catch (error: any) {
      console.error("Medication update error:", error);
    } finally {
      setPendingUpdate(false);
    }
  };

  const addMedication = async () => {
    if (!newName.trim()) return;
    
    const newItem: MedicationItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      dosage: newDosage.trim() || '1 Adet'
    };
    
    const newList = [...medications, newItem];
    setMedications(newList);
    setNewName('');
    setNewDosage('');
    setIsAdding(false);

    try {
      if (user && activeProfileId) {
        await firebaseService.saveMedicationList(user.uid, activeProfileId, newList);
      } else if (activeProfileId) {
        storageService.saveMedicationList(newList, activeProfileId);
      }
    } catch (error) {
      console.error("Failed to add medication:", error);
    }
  };

  const deleteMedication = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newList = medications.filter(m => m.id !== id);
    setMedications(newList);

    try {
      if (user && activeProfileId) {
        await firebaseService.saveMedicationList(user.uid, activeProfileId, newList);
      } else if (activeProfileId) {
        storageService.saveMedicationList(newList, activeProfileId);
      }
    } catch (error) {
      console.error("Failed to delete medication:", error);
    }
  };

  const totalCount = medications.length;
  const takenCount = medications.filter(m => takenMap[m.id]).length;
  const isAllTaken = totalCount > 0 && takenCount === totalCount;
  const completionProgress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center h-full min-h-[340px]">
        <Loader2 className="w-8 h-8 text-sky-500 dark:text-sky-400 animate-spin mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">İlaç bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group h-full flex flex-col justify-between transition-colors duration-200">
      
      {/* Background Graphic watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Pill className="w-36 h-36 text-sky-600 dark:text-sky-400" />
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Günlük İlaçlar
              {isAllTaken && <CheckCircle2 className="text-emerald-500 w-5.5 h-5.5" />}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              İlaç takibinizi düzenli yapın
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-mono font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-xl">
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
              isAllTaken ? 'bg-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.25)]' : 'bg-sky-600 dark:bg-sky-500'
            }`}
          />
        </div>

        {/* Medications Checklist Stack */}
        <div className="space-y-2.5 pt-2">
          {medications.length === 0 && !isAdding && (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Henüz kayıtlı ilacınız yok.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-lg border border-sky-100 dark:border-sky-800/50 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
              >
                İlk İlacınızı Ekleyin
              </button>
            </div>
          )}

          {medications.map((item) => {
            const isTaken = !!takenMap[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleMedication(item.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group/item active:scale-[0.99] cursor-pointer select-none ${
                  isTaken 
                    ? 'bg-emerald-50/5 dark:bg-emerald-950/10 border-emerald-50/30 dark:border-emerald-50/20' 
                    : 'bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/20 dark:hover:bg-slate-850 border-slate-100 hover:border-slate-200 dark:border-slate-800/80 dark:hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                    isTaken 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 group-hover/item:border-slate-300 dark:group-hover/item:border-slate-600'
                  }`}>
                    <Pill className={`w-5 h-5 ${isTaken ? 'text-emerald-500' : 'text-sky-500'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold transition-all block truncate ${
                      isTaken 
                        ? 'text-slate-850 dark:text-slate-200 line-through opacity-70' 
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.name}
                    </span>
                    
                    <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-tight block truncate">
                        Miktar: {item.dosage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Delete button appears on hover */}
                  <button 
                    onClick={(e) => deleteMedication(e, item.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 shrink-0"
                    title="İlacı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className={`p-1.5 rounded-lg border-2 transition-all shrink-0 ${
                    isTaken 
                      ? 'bg-emerald-500 border-emerald-500 text-white scale-105 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover/item:border-slate-350 text-transparent'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Medication Form inline */}
          {isAdding && (
            <div className="p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/20 mt-2">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="İlaç Adı (Örn: Parol)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Dozaj/Zaman (Örn: Sabah Tok 1 Adet)"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addMedication();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                  className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={addMedication}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    Kaydet
                  </button>
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold py-2 rounded-xl transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isAdding && medications.length > 0 && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs font-bold group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Yeni İlaç Ekle
            </button>
          )}
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
              <p className="text-emerald-700 dark:text-emerald-400 text-[10px] font-medium mt-0.5">Bugünkü ilaçlarını eksiksiz tamamladın.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
