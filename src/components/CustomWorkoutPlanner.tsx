import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter, 
  Play, 
  Save, 
  ChevronLeft, 
  Dumbbell, 
  Clock, 
  RefreshCw, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EXERCISE_DATABASE } from '../constants';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { Exercise, CustomWorkoutRoutine } from '../types';

export default function CustomWorkoutPlanner() {
  const navigate = useNavigate();
  const { user, activeProfileId } = useAuth();

  // Mode state: 'list' | 'create'
  const [plannerMode, setPlannerMode] = useState<'list' | 'create'>('list');
  const [loading, setLoading] = useState<boolean>(true);
  const [routines, setRoutines] = useState<CustomWorkoutRoutine[]>([]);

  // Create form state
  const [routineName, setRoutineName] = useState<string>('');
  const [routineDesc, setRoutineDesc] = useState<string>('');
  const [selectedExerciseList, setSelectedExerciseList] = useState<{ exercise: Exercise; customizedDuration: number }[]>([]);

  // Filter state for database search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load saved routines
  const fetchRoutines = async () => {
    setLoading(true);
    try {
      if (user && activeProfileId) {
        const data = await firebaseService.getCustomWorkoutRoutines(user.uid, activeProfileId);
        setRoutines(data);
      } else if (activeProfileId) {
        const data = storageService.getCustomWorkoutRoutines(activeProfileId);
        setRoutines(data);
      } else {
        const data = storageService.getCustomWorkoutRoutines('local');
        setRoutines(data);
      }
    } catch (err) {
      console.error('Error fetching routines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [user, activeProfileId]);

  // Handle routine deletion
  const handleDeleteRoutine = async (routineId: string) => {
    if (!window.confirm('Bu antrenman programını silmek istediğinizden emin misiniz?')) return;
    try {
      if (user && activeProfileId) {
        await firebaseService.deleteCustomWorkoutRoutine(user.uid, activeProfileId, routineId);
      } else if (activeProfileId) {
        storageService.deleteCustomWorkoutRoutine(activeProfileId, routineId);
      } else {
        storageService.deleteCustomWorkoutRoutine('local', routineId);
      }
      setRoutines(prev => prev.filter(r => r.id !== routineId));
    } catch (err) {
      console.error('Error deleting routine:', err);
    }
  };

  // Start a saved routine
  const handleStartRoutine = (routine: CustomWorkoutRoutine) => {
    // Reconstruct exercises with customized durations or default ones
    const activeExercises: Exercise[] = [];
    
    routine.exerciseIds.forEach(id => {
      // Routines could store just IDs, or we can parse custom values. Let's support either.
      const match = EXERCISE_DATABASE.find(ex => ex.id === id);
      if (match) {
        activeExercises.push({ ...match });
      }
    });

    if (activeExercises.length === 0) {
      alert('Bu antrenmanda yüklenebilecek geçerli hareket bulunamadı.');
      return;
    }

    sessionStorage.setItem('current_workout', JSON.stringify(activeExercises));
    sessionStorage.setItem('workout_params', JSON.stringify({ 
      goal: 'get_fit', 
      level: 'intermediate', 
      energy: 'medium', 
      title: `${routine.name} (Özel Program)`
    }));
    navigate('/workout-active');
  };

  // Add exercise to selected list
  const addExerciseToRoutine = (ex: Exercise) => {
    setSelectedExerciseList(prev => [...prev, { exercise: ex, customizedDuration: ex.duration }]);
  };

  // Remove exercise from selected list
  const removeExerciseFromRoutine = (index: number) => {
    setSelectedExerciseList(prev => prev.filter((_, i) => i !== index));
  };

  // Move exercise up in selected list
  const moveExerciseUp = (index: number) => {
    if (index === 0) return;
    setSelectedExerciseList(prev => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return list;
    });
  };

  // Move exercise down in selected list
  const moveExerciseDown = (index: number) => {
    if (index === selectedExerciseList.length - 1) return;
    setSelectedExerciseList(prev => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return list;
    });
  };

  // Modify exercise duration
  const adjustDuration = (index: number, delta: number) => {
    setSelectedExerciseList(prev => {
      const list = [...prev];
      const newDuration = Math.max(10, list[index].customizedDuration + delta);
      list[index] = { ...list[index], customizedDuration: newDuration };
      return list;
    });
  };

  // Save the custom routine
  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert('Lütfen antrenman programı için bir isim girin.');
      return;
    }

    if (selectedExerciseList.length === 0) {
      alert('Lütfen programınıza en az bir egzersiz ekleyin.');
      return;
    }

    const newRoutine: CustomWorkoutRoutine = {
      id: `custom_${Date.now()}`,
      name: routineName,
      description: routineDesc || 'Özel planlanmış antrenman serisi.',
      exerciseIds: selectedExerciseList.map(item => item.exercise.id),
      createdAt: new Date().toISOString()
    };

    try {
      if (user && activeProfileId) {
        await firebaseService.saveCustomWorkoutRoutine(user.uid, activeProfileId, newRoutine);
      } else if (activeProfileId) {
        storageService.saveCustomWorkoutRoutine(activeProfileId, newRoutine);
      } else {
        storageService.saveCustomWorkoutRoutine('local', newRoutine);
      }

      // Refresh list
      setRoutines(prev => [newRoutine, ...prev]);

      // Reset form
      setRoutineName('');
      setRoutineDesc('');
      setSelectedExerciseList([]);
      setPlannerMode('list');

    } catch (err) {
      console.error('Error saving routine:', err);
      alert('Program kaydedilirken bir hata oluştu.');
    }
  };

  // Filter exercises
  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total statistics of customized list
  const totalExercises = selectedExerciseList.length;
  const totalDurationSeconds = selectedExerciseList.reduce((acc, curr) => acc + curr.customizedDuration, 0);
  const totalDurationMinutes = Math.ceil(totalDurationSeconds / 60);

  return (
    <div className="space-y-6">
      {/* View Switch Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            📋 {plannerMode === 'list' ? 'Kaydedilen Programlarım' : 'Yeni Rutin Tasarla'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-505 font-medium mt-0.5">
            {plannerMode === 'list' 
              ? 'Tasarımını yaptığınız ve kaydettiğiniz kişisel egzersiz programları' 
              : 'Veritabanından dilediğiniz egzersizleri seçin, sürelerini özelleştirin ve kaydedin'}
          </p>
        </div>

        {plannerMode === 'list' ? (
          <button
            onClick={() => setPlannerMode('create')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none transition-all"
          >
            <Plus className="w-4 h-4 text-white" /> Program Tasarla
          </button>
        ) : (
          <button
            onClick={() => setPlannerMode('list')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" /> Geri Dön
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {plannerMode === 'list' ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-505 mb-3" />
                <span className="text-xs font-bold uppercase tracking-wider">Planlar Yükleniyor...</span>
              </div>
            ) : routines.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-10 md:p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/40 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-805">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Oluşturulmuş Program Yok</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 max-w-sm mx-auto font-medium leading-relaxed">
                  Henüz özel bir antrenman programı oluşturmadınız. Hemen ilk programınızı tasarlayıp egzersiz hedeflerinize başlayın.
                </p>
                <button
                  onClick={() => setPlannerMode('create')}
                  className="mt-6 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Kendi Rutinini Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routines.map((routine) => {
                  return (
                    <motion.div
                      key={routine.id}
                      layout
                      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition-all group"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-505 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-805 block w-max uppercase">
                              Özel Rutin
                            </span>
                            <h3 className="text-base font-black text-slate-90s mt-2 text-slate-900 dark:text-white leading-tight">
                              {routine.name}
                            </h3>
                          </div>

                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
                            title="Rutini Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                          "{routine.description}"
                        </p>

                        <div className="pt-2 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[11px] font-extrabold">{routine.exerciseIds.length} Egzersiz</span>
                          </div>
                          
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-550 font-bold">
                            {new Date(routine.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-2">
                        <button
                          onClick={() => handleStartRoutine(routine)}
                          className="flex-1 py-3 bg-slate-905 bg-slate-900 dark:bg-slate-105 dark:bg-slate-100 text-white dark:text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer group-hover:bg-indigo-605 group-hover:bg-indigo-600 group-hover:text-white"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Antrenmanı Başlat
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="create-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Editor Right / Bottom Panel - Chosen Exercises (Span 5) */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">📋 Rutin Detayları & Sıralama</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-505 font-medium mt-0.5">Eklediğiniz hareketleri sıralayın ve yönetin</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] tracking-wider uppercase font-mono font-black text-indigo-500 dark:text-indigo-400">RUTİN İSMİ</label>
                    <input
                      type="text"
                      value={routineName}
                      onChange={(e) => setRoutineName(e.target.value)}
                      placeholder="Örn: Göğüs & Arka Kol Yakımı"
                      className="w-full mt-1.5 p-3 text-xs bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 focus:outline-none font-bold text-slate-850 dark:text-slate-205 placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] tracking-wider uppercase font-mono font-black text-indigo-500 dark:text-indigo-400">AÇIKLAMA / NOT</label>
                    <textarea
                      value={routineDesc}
                      onChange={(e) => setRoutineDesc(e.target.value)}
                      placeholder="Örn: Her Pazartesi uygulanacak yüksek yoğunluklu rutin."
                      className="w-full mt-1.5 p-3 text-xs bg-slate-50/70 dark:bg-slate-950 border border-slate-155 dark:border-slate-800 rounded-xl focus:border-indigo-555 focus:ring-1 focus:ring-indigo-555 focus:outline-none resize-none h-16 font-medium text-slate-800 dark:text-slate-300 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Selected Exercises List */}
                <div className="pt-2 border-t border-slate-50 dark:border-slate-850 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-black text-slate-400 dark:text-slate-500">SEÇİLEN HAREKETLER ({totalExercises})</span>
                    {totalExercises > 0 && (
                      <span className="font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded text-[10px]">
                        ~{totalDurationMinutes} Dk Akış
                      </span>
                    )}
                  </div>

                  {selectedExerciseList.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-805 rounded-xl text-center text-slate-400 text-xs font-semibold">
                      Sağ taraftaki veritabanından egzersiz ekleyerek başlayın.
                    </div>
                  ) : (
                    <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
                      {selectedExerciseList.map((item, index) => {
                        return (
                          <motion.div
                            key={`${item.exercise.id}-${index}`}
                            layout
                            className="bg-slate-50/80 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex justify-between items-center gap-3 relative overflow-hidden group"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="w-5 h-5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-700 shrink-0">
                                  {index + 1}
                                </span>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                                  {item.exercise.name}
                                </h4>
                              </div>

                              {/* Duration Controller */}
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Önerilen Değer:</span>
                                <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-300">{item.customizedDuration} Saniye</span>
                              </div>
                            </div>

                            {/* Control Actions (Move, Delete) */}
                            <div className="flex items-center gap-1shrink-0">
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => moveExerciseUp(index)}
                                  disabled={index === 0}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all text-slate-400 disabled:opacity-30 cursor-pointer"
                                  title="Yukarı Taşı"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => moveExerciseDown(index)}
                                  disabled={index === selectedExerciseList.length - 1}
                                  className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all text-slate-400 disabled:opacity-30 cursor-pointer"
                                  title="Aşağı Taşı"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeExerciseFromRoutine(index)}
                                className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                                title="Listeden Çıkar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Final Save Button */}
                <button
                  onClick={handleSaveRoutine}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" /> Programı Kaydet ve Bitir
                </button>
              </div>
            </div>

            {/* Left/Main Panel - DB Browser (Span 7) */}
            <div className="lg:col-span-12 lg:col-span-7 space-y-6 order-1 lg:order-2">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-black text-base text-slate-900 dark:text-white">🏋️ Egzersiz Kütüphanesi</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Programınıza eklemek istediğiniz hareketleri seçin</p>
                  </div>
                  
                  {/* Category Filter Pills */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { id: 'all', label: 'Hepsi' },
                      { id: 'upper', label: 'Üst Vücut' },
                      { id: 'lower', label: 'Alt Vücut' },
                      { id: 'core', label: 'Core / Karın' },
                      { id: 'cardio', label: 'Kardiyo' },
                      { id: 'yoga', label: 'Yoga' },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => setSelectedCategory(pill.id)}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          selectedCategory === pill.id 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Egzersiz adı veya açıklama ile ara..."
                    className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50/70 dark:bg-slate-950 border border-slate-101 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 font-semibold"
                  />
                </div>

                {/* Database Search Results Grid */}
                <div className="max-h-[500px] overflow-y-auto pr-1 space-y-3">
                  {filteredExercises.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                      Arama kriterlerinize uyan egzersiz bulunamadı.
                    </div>
                  ) : (
                    filteredExercises.map((ex) => {
                      const categoryLabels: { [key: string]: string } = {
                        upper: 'Üst Vücut',
                        lower: 'Alt Vücut',
                        core: 'Karın / Core',
                        cardio: 'Kardiyo / Isınma',
                        full: 'Tüm Vücut',
                        yoga: 'Yoga / Esneklik'
                      };

                      return (
                        <div
                          key={ex.id}
                          className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-2xl flex items-start justify-between gap-4 transition-all hover:scale-[1.005] hover:border-slate-200 dark:hover:border-slate-750"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-widest font-black uppercase bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                                {categoryLabels[ex.category] || ex.category}
                              </span>
                              
                              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                                {ex.name}
                              </h4>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                              {ex.description}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {ex.duration} Sn
                              </span>
                              <span>•</span>
                              <span>Ekipman: {ex.equipment.join(', ').replace('none', 'Ekipmansız')}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => addExerciseToRoutine(ex)}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" /> Ekle
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
