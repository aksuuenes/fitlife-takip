import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Loader2, Plus, Trash2, Edit2, Settings, X } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
}

// Swipeable medication row — swipe LEFT to reveal actions on the RIGHT
function SwipeableMedRow({
  item,
  isTaken,
  onToggle,
  onDelete,
  onEdit,
  isEditing,
  editName,
  editDosage,
  setEditName,
  setEditDosage,
  onSaveEdit,
  onCancelEdit,
}: {
  item: MedicationItem;
  isTaken: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isEditing: boolean;
  editName: string;
  editDosage: string;
  setEditName: (v: string) => void;
  setEditDosage: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const [swiped, setSwiped] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Swipe LEFT → offset is negative
    if (info.offset.x < -60) {
      setSwiped(true);
    } else {
      setSwiped(false);
    }
  };

  const closeSwipe = () => setSwiped(false);

  // If editing, show inline edit form instead
  if (isEditing) {
    return (
      <div className="p-3 rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            className="text-xs font-bold bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="İlaç Adı"
          />
          <input
            type="text"
            value={editDosage}
            onChange={(e) => setEditDosage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Dozaj / Zaman"
          />
          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-xl transition-colors active:scale-95">
              Kaydet
            </button>
            <button onClick={onCancelEdit} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2 rounded-xl transition-colors active:scale-95">
              İptal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action buttons on the RIGHT side, revealed when swiping left */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-2 z-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); closeSwipe(); }}
          className="p-3 bg-sky-500 active:bg-sky-600 text-white rounded-xl shadow-lg active:scale-95 transition-transform"
          title="Düzenle"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-3 bg-red-500 active:bg-red-600 text-white rounded-xl shadow-lg active:scale-95 transition-transform"
          title="Sil"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Swipeable card — drags LEFT */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -130, right: 0 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ x: swiped ? -130 : 0 }}
        transition={{ type: 'tween', duration: 0.2 }}
        onClick={() => { if (swiped) { closeSwipe(); } else { onToggle(); } }}
        className={`relative z-10 w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer select-none touch-pan-y ${
          isTaken
            ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl border shrink-0 ${
            isTaken
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
          }`}>
            <Pill className={`w-5 h-5 ${isTaken ? 'text-emerald-500' : 'text-sky-500'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold block truncate ${
              isTaken
                ? 'text-slate-500 dark:text-slate-400 line-through'
                : 'text-slate-900 dark:text-white'
            }`}>
              {item.name}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate mt-0.5">
              {item.dosage}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop-only hover buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 text-slate-300 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-all hidden md:block"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all hidden md:block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className={`p-1.5 rounded-lg border-2 shrink-0 ${
            isTaken
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-transparent'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      </motion.div>
    </div>
  );
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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');

  // Settings/customize mode
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const deleteMedication = async (id: string) => {
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

  const startEditing = (item: MedicationItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDosage(item.dosage);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) {
      setEditingId(null);
      return;
    }

    const newList = medications.map(m =>
      m.id === editingId ? { ...m, name: editName.trim(), dosage: editDosage.trim() || '1 Adet' } : m
    );
    setMedications(newList);
    setEditingId(null);

    try {
      if (user && activeProfileId) {
        await firebaseService.saveMedicationList(user.uid, activeProfileId, newList);
      } else if (activeProfileId) {
        storageService.saveMedicationList(newList, activeProfileId);
      }
    } catch (error) {
      console.error("Failed to save edit:", error);
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
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Pill className="w-36 h-36 text-sky-600 dark:text-sky-400" />
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Günlük İlaçlar
              {isAllTaken && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              ← sola kaydırarak düzenle/sil
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isSettingsOpen
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'
              }`}
              title="Özelleştir"
            >
              {isSettingsOpen ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </button>
            <span className="text-sm font-mono font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-xl">
              {takenCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionProgress}%` }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`h-full rounded-full ${
              isAllTaken ? 'bg-emerald-500' : 'bg-sky-600 dark:bg-sky-500'
            }`}
          />
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/30 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider">İlaç Yönetimi</span>
                </div>

                {medications.map((med) => (
                  <div key={med.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700">
                    {editingId === med.id ? (
                      <div className="flex-1 flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          className="text-xs font-bold bg-sky-50 dark:bg-slate-700 border border-sky-200 dark:border-sky-800 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="İlaç Adı"
                        />
                        <input
                          type="text"
                          value={editDosage}
                          onChange={(e) => setEditDosage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                          className="text-xs font-medium bg-sky-50 dark:bg-slate-700 border border-sky-200 dark:border-sky-800 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Dozaj"
                        />
                        <div className="flex gap-1.5">
                          <button onClick={saveEdit} className="flex-1 bg-sky-600 text-white text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition-transform">
                            Kaydet
                          </button>
                          <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold py-1.5 rounded-lg active:scale-95 transition-transform">
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Pill className="w-4 h-4 text-sky-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">{med.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate">{med.dosage}</span>
                        </div>
                        <button
                          onClick={() => startEditing(med)}
                          className="p-2 text-sky-500 active:bg-sky-100 dark:active:bg-sky-900/30 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMedication(med.id)}
                          className="p-2 text-red-400 active:bg-red-50 dark:active:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {medications.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-2">Henüz ilaç eklenmemiş</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medications Checklist Stack */}
        <div className="space-y-2 pt-1">
          {medications.length === 0 && !isAdding && (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Henüz kayıtlı ilacınız yok.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-xl border border-sky-100 dark:border-sky-800/50 active:scale-95 transition-transform"
              >
                İlk İlacınızı Ekleyin
              </button>
            </div>
          )}

          {medications.map((item) => {
            const isTaken = !!takenMap[item.id];
            return (
              <SwipeableMedRow
                key={item.id}
                item={item}
                isTaken={isTaken}
                onToggle={() => toggleMedication(item.id)}
                onDelete={() => deleteMedication(item.id)}
                onEdit={() => startEditing(item)}
                isEditing={editingId === item.id}
                editName={editName}
                editDosage={editDosage}
                setEditName={setEditName}
                setEditDosage={setEditDosage}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingId(null)}
              />
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
                    className="flex-1 bg-sky-600 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform"
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
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 active:bg-slate-50 dark:active:bg-slate-800/50 text-xs font-bold active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" />
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
            transition={{ duration: 0.2 }}
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
