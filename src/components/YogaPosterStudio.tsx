import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Check, Plus, Trash2, ArrowUp, ArrowDown, Info, Sliders, Layers, Sparkles, AlertCircle, Dumbbell, Search, X } from 'lucide-react';
import { EXERCISE_DATABASE } from '../constants';
import { Exercise } from '../types';
import { PosterAsana, POSTER_ASANAS, PRESET_CLASSES } from '../lib/yogaConstants';
import { PosterAsanaSvg } from './PosterAsanaSvg';


// Miniature SVG poses drawn statically so they display incredibly clean and snappy like the uploaded Pinterest image!

export default function YogaPosterStudio() {
  const navigate = useNavigate();
  
  // Custom states for custom yoga lesson builder
  const [selectedAsanas, setSelectedAsanas] = useState<string[]>(['45', 'y_easy_sitting', 'y_lotus', '42', 'y_low_lunge', '40', 'y_calf_stretch_block', 'y_half_forward_fold']);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('spine_rehab_premium');
  const [holdDuration, setHoldDuration] = useState<number>(45); // in seconds
  const [activeTab, setActiveTab] = useState<'poster' | 'presets' | 'custom_builder'>('poster');
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>('42');
  const [viewMode, setViewMode] = useState<'model' | 'photo'>('model');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  const selectedDetailAsana = POSTER_ASANAS.find(a => a.id === selectedDetailId);

  // Toggle asana in custom lesson sequence
  const handleToggleAsana = (id: string) => {
    setSelectedPresetId(''); // clear preset if modified manually
    setSelectedAsanas(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          alert('Yoga seansınız en az 2 asana içermelidir.');
          return prev;
        }
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  // Reorder custom asanas
  const handleMoveAsana = (index: number, direction: 'up' | 'down') => {
    setSelectedPresetId('');
    setSelectedAsanas(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleApplyPreset = (preset: typeof PRESET_CLASSES[0]) => {
    setSelectedPresetId(preset.id);
    setSelectedAsanas(preset.asanas);
    setHoldDuration(preset.durationPerAsana);
  };

  // Build the complete session list by mapping user asana ids to real exercise structs in standard datastore
  const handleLaunchYogaSeance = () => {
    const fullSequence = selectedAsanas.map(id => {
      const match = EXERCISE_DATABASE.find(ex => ex.id === id);
      if (match) {
        return {
          ...match,
          duration: holdDuration,
          reps: `${holdDuration} Sn Tut`
        };
      }
      return null;
    }).filter((x): x is Exercise => !!x);

    if (fullSequence.length === 0) {
      alert('Seçili asana kaydı bulunamadı.');
      return;
    }

    const titlePreset = PRESET_CLASSES.find(p => p.id === selectedPresetId)?.title || "Özel Özgür Yoga Akışınız";

    sessionStorage.setItem('current_workout', JSON.stringify(fullSequence));
    sessionStorage.setItem('workout_params', JSON.stringify({
      goal: 'get_fit',
      level: 'intermediate',
      energy: selectedAsanas.length > 6 ? 'high' : 'medium',
      title: titlePreset
    }));

    navigate('/workout-active');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Intro section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-[28px] border border-emerald-500/10">
        <div>
          <span className="px-3 py-1 bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-lg tracking-widest border border-emerald-500/30">
            YOGA ASANAS REHBERİ
          </span>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Kuşbaksı Yoga Stüdyosu 🧘‍♀️
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1 leading-relaxed max-w-xl">
            Aşağıdaki asana haritası, paylaştığınız posterdeki asanaların bire bir anatomik simülasyonunu içerir. 
            Kartlara tıklayarak detaylı duruş rehberine ulaşabilir veya kendi dersinizi tasarlayabilirsiniz.
          </p>
        </div>
        
        {/* Active Flow Controls */}
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setActiveTab('poster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'poster' 
                ? 'bg-slate-900 dark:bg-slate-150 text-white dark:text-slate-900' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
            }`}
          >
            🗺️ İnteraktif Poster
          </button>
          <button 
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'presets' 
                ? 'bg-slate-900 dark:bg-slate-150 text-white dark:text-slate-900' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
            }`}
          >
            🎓 Hazır Seanslar
          </button>
          <button 
            onClick={() => setActiveTab('custom_builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'custom_builder' 
                ? 'bg-slate-900 dark:bg-slate-150 text-white dark:text-slate-900' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
            }`}
          >
            🛠️ Özel Ders Tasarla
            <span className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-520 bg-emerald-500 text-[8px] font-bold text-white shadow-sm animate-pulse">
              {selectedAsanas.length}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COMPONENT: Selected View */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* POSTER VIEW MODE */}
            {activeTab === 'poster' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Visual Beige/Sandy Canvas Poster Card (Styled exactly like Pinterest layout) */}
                <div className="bg-[#FAF8F5] dark:bg-slate-950/85 p-6 rounded-[36px] border border-[#ECE9E4] dark:border-slate-800 shadow-xl relative overflow-hidden">
                  
                  {/* Watermark Poster Header */}
                  <div className="text-center mb-8 border-b border-[#ECE9E4] dark:border-slate-800 pb-6">
                    <h2 className="text-4xl font-display font-extrabold text-[#475569] dark:text-slate-300 tracking-wider">
                      YOGA ASANAS
                    </h2>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      ÖZEL GERÇEK ZAMANLI HİZALAMA VE ASANA KILAVUZU
                    </p>
                  </div>

                  {/* 20 Asanas Poster Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {POSTER_ASANAS.map((asana) => {
                      const isSelected = selectedAsanas.includes(asana.id);
                      const isDetailActive = selectedDetailId === asana.id;
                      return (
                        <div
                          key={asana.id}
                          className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            isDetailActive 
                              ? 'border-emerald-555 border-emerald-500 bg-white dark:bg-slate-900 shadow-lg scale-[1.03] z-10' 
                              : isSelected
                                ? 'border-emerald-600/35 bg-emerald-500/5 hover:border-emerald-500'
                                : 'border-[#ECE9E4]/80 dark:border-slate-900 bg-[#FAF8F5]/50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedDetailId(asana.id)}
                        >
                          {/* Selected marker Badge */}
                          {isSelected && (
                            <span className="absolute top-2 right-2 p-0.5 bg-emerald-500 text-white rounded-full">
                              <Check className="w-2.5 h-2.5 stroke-[4]" />
                            </span>
                          )}

                          {/* Quick selection plus button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAsana(asana.id);
                            }}
                            className={`absolute top-2 left-2 p-1 rounded-md transition-colors ${
                              isSelected 
                                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                            title={isSelected ? "Dersten Çıkar" : "Derse Ekle"}
                          >
                            <Plus className={`w-2.5 h-2.5 transition-transform ${isSelected ? 'rotate-45 text-rose-500' : ''}`} />
                          </button>

                          {/* Simplified vector silhouette */}
                          <div className={`my-4 flex items-center justify-center p-2 rounded-xl bg-[#F6F3EE] dark:bg-slate-900 w-16 h-16 transition-colors duration-250 ${
                            isDetailActive ? 'bg-emerald-500/10' : ''
                          }`}>
                            {asana.image ? (
                              <img
                                src={asana.image}
                                alt={asana.trName}
                                className="w-full h-full object-contain rounded-lg"
                                style={{ imageRendering: '-webkit-optimize-contrast' }}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <PosterAsanaSvg id={asana.id} className="w-12 h-12 text-[#2D3748] dark:text-emerald-400" />
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="text-center w-full mt-2">
                            <span className="text-[7.5px] uppercase font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block truncate">
                              {asana.sanskritName}
                            </span>
                            <span className="text-[10px] font-display font-black text-slate-800 dark:text-slate-200 mt-1 block truncate">
                              {asana.trName}
                            </span>
                            <span className={`text-[7px] font-sans font-bold px-1.5 py-0.5 rounded-full inline-block mt-1.5 uppercase ${
                              asana.difficulty === 'Başlangıç' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : asana.difficulty === 'Orta Seviye'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}>
                              {asana.difficulty}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRESET CLASSES VIEW MODE */}
            {activeTab === 'presets' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6"
              >
                {PRESET_CLASSES.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-6 rounded-[28px] border-2 bg-white dark:bg-slate-900 transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center ${
                      selectedPresetId === preset.id 
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-705'
                    }`}
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-gradient-to-r ${preset.color}`}>
                          {preset.tag}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {preset.asanas.length} Asana • {preset.durationPerAsana * preset.asanas.length / 60} Dk Seans
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                          {preset.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      {/* Display row of mini-SVGs in horizontal row */}
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-wrap gap-2.5">
                        {preset.asanas.map((id, index) => {
                          const name = POSTER_ASANAS.find(a => a.id === id)?.trName || '';
                          return (
                            <div 
                              key={index} 
                              className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 p-1.5 rounded-lg text-xs"
                              title={name}
                            >
                              <PosterAsanaSvg id={id} className="w-5 h-5 text-emerald-500" />
                              <span className="text-[9px] font-display font-bold text-slate-700 dark:text-slate-300">
                                {index + 1}. {name.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                      <button
                        onClick={() => handleApplyPreset(preset)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                          selectedPresetId === preset.id
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {selectedPresetId === preset.id ? '✓ Seçildi' : 'Seansı Şablon Al'}
                      </button>
                      <button
                        onClick={() => {
                          handleApplyPreset(preset);
                          setTimeout(() => {
                            handleLaunchYogaSeance();
                          }, 100);
                        }}
                        className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-slate-950 fill-current" /> Seansı Başlat
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* CUSTOM LESSON BUILDER LIST VIEW */}
            {activeTab === 'custom_builder' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-6"
              >
                {/* Main spacious Custom Sequence Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-md flex flex-col justify-between min-h-[480px]">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-6 gap-3">
                      <div>
                        <h3 className="font-display font-black text-slate-900 dark:text-white text-lg">
                          Sizin Özel Asana Akışınız
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Aşağıdaki sırayla asanalarınız oynatılacaktır. Yön tuşlarıyla sırayı değiştirebilirsiniz.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border border-emerald-200/40">
                          {selectedAsanas.length} ASANA SEÇİLİ
                        </span>
                        <button
                          onClick={() => setIsAddPanelOpen(true)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Yeni Hareket Ekle
                        </button>
                      </div>
                    </div>

                    {selectedAsanas.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                        <Sparkles className="mx-auto h-10 w-10 text-emerald-400/60 mb-3 animate-pulse" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Listeniz Henüz Boş</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Özel dersinize poz eklemek için yukarıdaki <strong>"Yeni Hareket Ekle"</strong> butonuna basarak paneli açın.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50 dark:divide-slate-850 max-h-[380px] overflow-y-auto pr-1">
                        {selectedAsanas.map((asanaId, index) => {
                          const details = POSTER_ASANAS.find(a => a.id === asanaId);
                          if (!details) return null;
                          return (
                            <div key={`${asanaId}-${index}`} className="py-3.5 flex items-center justify-between gap-4 group">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span className="font-mono text-xs font-black text-slate-300 dark:text-slate-700 w-5 text-center">
                                  {index + 1}
                                </span>
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-850 p-1 flex-shrink-0" onClick={() => setSelectedDetailId(asanaId)}>
                                  {details.image ? (
                                    <img src={details.image} alt={details.trName} className="w-full h-full object-contain rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                                  ) : (
                                    <PosterAsanaSvg id={asanaId} className="w-8 h-8 text-emerald-600 dark:text-emerald-400 cursor-pointer" />
                                  )}
                                </div>
                                <div className="min-w-0" onClick={() => setSelectedDetailId(asanaId)}>
                                  <div className="text-xs font-display font-black text-slate-800 dark:text-white flex items-center gap-1.5 leading-tight cursor-pointer hover:text-emerald-500 transition-colors">
                                    {details.trName}
                                    <span className="text-[9px] font-mono text-slate-400 truncate">({details.sanskritName})</span>
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{details.category}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">{details.difficulty}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Controls to organize sequence */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  disabled={index === 0}
                                  onClick={() => handleMoveAsana(index, 'up')}
                                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all"
                                  title="Yukarı Taşı"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button
                                  disabled={index === selectedAsanas.length - 1}
                                  onClick={() => handleMoveAsana(index, 'down')}
                                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all"
                                  title="Aşağı Taşı"
                                >
                                  <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button
                                  onClick={() => handleToggleAsana(asanaId)}
                                  className="p-2 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-slate-400 rounded-lg transition-all ml-1"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Dynamic control for holds */}
                    <div className="mt-6 pt-6 border-t border-slate-150/50 dark:border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">POZ TUTUŞ SÜRESİ</span>
                        <div className="flex gap-2 mt-1.5">
                          {[30, 45, 60, 90].map((dur) => (
                            <button
                              key={dur}
                              onClick={() => setHoldDuration(dur)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                holdDuration === dur 
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold' 
                                  : 'bg-slate-100 dark:bg-slate-850 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {dur} Sn
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-right md:text-left">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">TOPLAM SEANS ANALİZİ</span>
                        <div className="text-sm font-display font-black text-slate-800 dark:text-slate-350 mt-1">
                          ⏱️ {(holdDuration * selectedAsanas.length / 60).toFixed(1)} Dakika
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleLaunchYogaSeance}
                        disabled={selectedAsanas.length === 0}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950 fill-current animate-bounce" />
                        Sizin Özel Akışınızı Başlat
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COMPONENT: Visual detailed card of the selected pose (Detailed inspector) */}
        <div className="lg:col-span-4 bg-[#FAF8F5]/50 dark:bg-slate-900 border border-[#ECE9E4] dark:border-slate-800 p-6 rounded-[28px] shadow-sm sticky top-6">
          <h3 className="font-mono text-[9px] text-[#A0AEC0] dark:text-slate-400 uppercase tracking-widest font-black flex items-center gap-1.5 select-none mb-4">
            <Info className="w-3 h-3 text-emerald-500" /> Detaylı Asana Analizi
          </h3>

          {selectedDetailAsana ? (
            <div className="space-y-6">
              {/* Giant visual demonstration */}
              <div className="bg-slate-950 rounded-[24px] p-6 border border-slate-900 shadow-inner relative h-56 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_75%)] pointer-events-none" />
                
                {selectedDetailAsana.image ? (
                  <>
                    <div className="absolute top-3 left-4 text-[8px] uppercase font-mono tracking-widest text-emerald-555 text-emerald-400 font-bold">
                      100% GÖRSEL BÜTÜNLÜK (PNG)
                    </div>
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <img
                        src={selectedDetailAsana.image}
                        alt={selectedDetailAsana.trName}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute top-3 left-4 text-[8px] uppercase font-mono tracking-widest text-emerald-555 text-emerald-400 font-bold">
                      BİYOMEKANİK HİZALAMA
                    </div>
                    
                    {/* Visual miniature representation inside center */}
                    <div className="w-36 h-36 flex items-center justify-center">
                      <PosterAsanaSvg id={selectedDetailAsana.id} className="w-28 h-28 text-white animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#B2F5EA] text-emerald-600 dark:text-emerald-400 font-bold block">
                  {selectedDetailAsana.sanskritName}
                </span>
                <h4 className="text-xl font-display font-black text-[#1D2D44] dark:text-slate-100 tracking-tight mt-1">
                  {selectedDetailAsana.trName}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase">
                    {selectedDetailAsana.category}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-lg uppercase ${
                    selectedDetailAsana.difficulty === 'Başlangıç' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {selectedDetailAsana.difficulty}
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block tracking-wider">Temel Faydaları</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedDetailAsana.benefits.map((ben, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350 font-medium">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Tip */}
              <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 space-y-1.5">
                <span className="text-[9.5px] font-mono font-extrabold text-amber-500 tracking-wider uppercase flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> EĞİTMEN TAVSİYESİ
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                  "{selectedDetailAsana.tips}"
                </p>
              </div>

              {/* Quick Lesson Selection Toggle in detail card */}
              <div className="pt-2">
                <button
                  onClick={() => handleToggleAsana(selectedDetailAsana.id)}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedAsanas.includes(selectedDetailAsana.id)
                      ? 'bg-red-50 hover:bg-red-105 text-red-600 border border-red-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                  }`}
                >
                  {selectedAsanas.includes(selectedDetailAsana.id) ? (
                    <>Dersten Çıkar (-)</>
                  ) : (
                    <>Özel Yoga Seansına Ekle (+)</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Sparkles className="mx-auto h-8 w-8 mb-2 text-emerald-400 opacity-60 animate-pulse" />
              <p className="text-sm font-semibold">Gelişmiş Değerlendirme</p>
              <p className="text-xs text-emerald-400/60 mt-1 max-w-[200px] mx-auto">Kartlardan birine tıklayarak asana kılavuzunu inceleyebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Side Drawer Panel for Adding Movements */}
      <AnimatePresence>
        {isAddPanelOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 md:backdrop-blur-"
            />
            
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500 stroke-[3]" /> Asana Ekleme Paneli
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Özel ders akışınıza eklemek istediğiniz premium pozları seçin.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPanelOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search & Filters */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Asana ara (Türkçe veya Sanskrit)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-2.5 text-slate-450 hover:text-slate-650 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Category Filtering Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['all', 'Isınmalar', 'Oturma Pozları', 'Kalça Açıcılar', 'Ters Duruşlar', 'Geriye Eğilmeler', 'Dinlenmeler'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-[9px] font-black rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm font-extrabold'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-450 border border-slate-150 dark:border-slate-880 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'all' ? '🔍 Tümü' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Pose Card List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin">
                {POSTER_ASANAS.filter(asana => {
                  const matchesSearch = asana.trName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        asana.sanskritName.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = selectedCategory === 'all' || asana.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                }).map((asana) => {
                  const isSelected = selectedAsanas.includes(asana.id);
                  return (
                    <div
                      key={asana.id}
                      onClick={() => handleToggleAsana(asana.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm'
                          : 'border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-850 p-1 flex-shrink-0">
                          {asana.image ? (
                            <img src={asana.image} alt={asana.trName} className="w-full h-full object-contain rounded-lg shadow-sm" />
                          ) : (
                            <PosterAsanaSvg id={asana.id} className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-display font-black text-slate-800 dark:text-slate-100 leading-tight truncate">
                            {asana.trName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {asana.sanskritName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[8px] font-sans font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full inline-block uppercase">
                              {asana.category}
                            </span>
                            <span className={`text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-full inline-block uppercase ${
                              asana.difficulty === 'Başlangıç' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : asana.difficulty === 'Orta Seviye'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}>
                              {asana.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md scale-110'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-3">
                <button
                  onClick={() => setSelectedAsanas([])}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setIsAddPanelOpen(false)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all text-center cursor-pointer"
                >
                  ✓ Seçimi Tamamla ({selectedAsanas.length} Poz)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
