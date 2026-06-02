import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Dumbbell, Sparkles, Filter, Tag, Play, ChevronRight, Hash, RotateCcw } from 'lucide-react';
import { EXERCISE_DATABASE } from '../constants';
import { Exercise } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'TÜMÜ' },
    { id: 'cardio', name: 'KARDİYO & ISI' },
    { id: 'upper', name: 'ÜST VÜCUT' },
    { id: 'lower', name: 'ALT VÜCUT' },
    { id: 'core', name: 'CENTRAL CORE' },
    { id: 'yoga', name: 'YOGA & ESNEKLİK' },
  ];

  const equipments = [
    { id: 'all', name: 'Tüm Hareketler' },
    { id: 'none', name: 'Ekipmansız (Vücut Ağırlığı)' },
  ];

  const filteredExercises = EXERCISE_DATABASE.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'all' || 
                             (selectedEquipment === 'none' && ex.equipment.includes('none')) ||
                             (selectedEquipment === 'dumbbells' && ex.equipment.includes('dumbbells')) ||
                             (selectedEquipment === 'pullup_bar' && ex.equipment.includes('pullup_bar'));
    return matchesSearch && matchesCategory && matchesEquipment;
  });

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'cardio':
        return { bg: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100', dot: 'bg-orange-500' };
      case 'upper':
        return { bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100', dot: 'bg-blue-500' };
      case 'lower':
        return { bg: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100', dot: 'bg-indigo-500' };
      case 'core':
        return { bg: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100', dot: 'bg-rose-500' };
      case 'yoga':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100', dot: 'bg-emerald-500' };
      default:
        return { bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-100', dot: 'bg-slate-400' };
    }
  };

  const getEquipmentName = (equip: string[]) => {
    if (equip.includes('none') && equip.length === 1) return 'Vücut Ağırlığı';
    return equip.map(e => {
      if (e === 'none') return 'Serbest';
      if (e === 'dumbbells') return 'Dambıl';
      if (e === 'pullup_bar') return 'Barfiks Bari';
      return e;
    }).join(' + ');
  };

  const handleStartInstantWorkout = (exercise: Exercise) => {
    const singleWorkout = [exercise];
    sessionStorage.setItem('current_workout', JSON.stringify(singleWorkout));
    sessionStorage.setItem('workout_params', JSON.stringify({ 
      goal: 'get_fit', 
      level: 'beginner', 
      energy: 'low', 
      title: `${exercise.name} Özel Çalışma` 
    }));
    navigate('/workout-active');
  };

  return (
    <div className="space-y-8">
      {/* Interactive Title Card */}
      <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-950 text-white rounded-[32px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-400/30 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            PROFESYONEL EGZERSİZ KÜTÜPHANESİ
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Tüm Spor Hareketleri &amp; Detaylar
          </h1>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            Sistemimizde kayıtlı güncel spor hareketlerini, biyomekanik hedeflerini, doğru form açıklamalarını ve gereken ekipman rehberini buradan hızla inceleyin.
          </p>
        </div>
      </div>

      {/* Search & Dynamic Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Egzersiz adı veya açıklamalarda arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-850/65 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-4 py-3.5 bg-slate-50 dark:bg-slate-850/65 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-550 cursor-pointer h-full"
            >
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
            
            {(searchQuery !== '' || selectedCategory !== 'all' || selectedEquipment !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedEquipment('all');
                }}
                className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer"
                title="Filtreleri Temizle"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Badges */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-100 dark:shadow-none'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredExercises.map((ex, index) => {
            const themeProps = getCategoryTheme(ex.category);
            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, delay: Math.min(0.15, index * 0.03) }}
                className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Category and volume tag */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${themeProps.bg}`}>
                      {ex.category.toUpperCase()}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] font-bold">
                      {ex.reps || `${ex.duration} Sn`}
                    </span>
                  </div>

                  {/* Title and setup */}
                  <div className="space-y-3">
                    {ex.image && (
                      <div className="w-full aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-900 shadow-inner relative group-hover:shadow-md transition-shadow">
                        <img
                          src={ex.image}
                          alt={ex.name}
                          className="max-w-full max-h-full object-contain rounded-lg p-2"
                          style={{ imageRendering: '-webkit-optimize-contrast' }}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-emerald-450 transition-colors">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {ex.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-50 dark:border-slate-850 pt-4 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-450 dark:text-slate-500 font-bold uppercase">
                    <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
                    <span>{getEquipmentName(ex.equipment)}</span>
                  </div>

                  <button
                    onClick={() => handleStartInstantWorkout(ex)}
                    className="h-8 pl-3 pr-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-900 dark:hover:bg-slate-100 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>YAP</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredExercises.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto border border-dashed border-slate-200 dark:border-slate-800">
              <Dumbbell className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Arama Kriterlerinde Egzersiz Bulunamadı</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-semibold">
              Girdiğiniz filtreleri veya arama kelimelerini sıfırlayarak tüm kütüphaneyi yeniden yükleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
