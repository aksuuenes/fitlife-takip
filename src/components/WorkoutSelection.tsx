import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight, Check, Zap, Battery, Brain, ArrowLeft } from 'lucide-react';
import { EXERCISE_DATABASE } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import YogaPosterStudio from './YogaPosterStudio';
import CustomWorkoutPlanner from './CustomWorkoutPlanner';
import ExerciseLibrary from './ExerciseLibrary';

type EquipmentType = 'none';
type EnergyType = 'low' | 'medium' | 'high';
type GoalType = 'lose_weight' | 'build_muscle' | 'get_fit';
type LevelType = 'beginner' | 'intermediate' | 'pro';

export default function WorkoutSelection() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<'quick' | 'yoga' | 'planner' | 'library'>('quick');
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState<EnergyType>('medium');
  const [goal, setGoal] = useState<GoalType>('get_fit');
  const [level, setLevel] = useState<LevelType>('intermediate');
  const [focus, setFocus] = useState<'full' | 'upper' | 'lower' | 'core' | 'yoga'>('full');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>(['none']);

  const steps = [
    { id: 1, title: 'Enerji', icon: Zap },
    { id: 2, title: 'Hedef', icon: Target },
    { id: 3, title: 'Seviye', icon: Brain },
    { id: 4, title: 'Odak', icon: Target },
    { id: 5, title: 'Ekipman', icon: Target },
  ];

  const handleStart = () => {
    const filtered = EXERCISE_DATABASE.filter(ex => {
      const matchEquipment = ex.equipment.every(e => selectedEquipment.includes(e as any));
      const matchFocus = focus === 'full' || ex.category === focus;
      return matchEquipment && matchFocus;
    });

    if (filtered.length === 0) {
      alert('Seçtiğiniz kriterlere uygun hareket bulunamadı. Lütfen daha fazla ekipman seçin.');
      return;
    }

    // Adjust length based on energy and level
    let workoutSize = energy === 'low' ? 4 : energy === 'medium' ? 6 : 8;
    if (level === 'beginner') workoutSize = Math.max(3, workoutSize - 1);
    if (level === 'pro') workoutSize += 2;

    const finalWorkout = filtered.slice(0, workoutSize);

    sessionStorage.setItem('current_workout', JSON.stringify(finalWorkout));
    sessionStorage.setItem('workout_params', JSON.stringify({ goal, level, energy }));
    navigate('/workout-active');
  };

  const handleStartSixPackCustom = () => {
    const activeSixPack = EXERCISE_DATABASE.filter(ex => 
      ['sp_1', 'sp_2', 'sp_3', 'sp_4', 'sp_5', 'sp_6'].includes(ex.id)
    );
    // order correctly
    const ordered = ['sp_1', 'sp_2', 'sp_3', 'sp_4', 'sp_5', 'sp_6']
      .map(id => activeSixPack.find(x => x.id === id))
      .filter((x): x is typeof activeSixPack[0] => !!x);

    sessionStorage.setItem('current_workout', JSON.stringify(ordered));
    sessionStorage.setItem('workout_params', JSON.stringify({ goal: 'build_muscle', level: 'pro', energy: 'high', title: '6\'lı Çelik Karın Programı' }));
    navigate('/workout-active');
  };

  const handleStartYogaCustom = () => {
    const activeYoga = EXERCISE_DATABASE.filter(ex => 
      ['y_easy_sitting', 'y_lotus', 'y_low_lunge', '42', '40', 'y_calf_stretch_block', '45'].includes(ex.id)
    );
    // order correctly
    const ordered = ['y_easy_sitting', 'y_lotus', 'y_low_lunge', '42', '40', 'y_calf_stretch_block', '45']
      .map(id => activeYoga.find(x => x.id === id))
      .filter((x): x is typeof activeYoga[0] => !!x);

    sessionStorage.setItem('current_workout', JSON.stringify(ordered));
    sessionStorage.setItem('workout_params', JSON.stringify({ goal: 'get_fit', level: 'beginner', energy: 'medium', title: 'Günün Elit Yoga Akışı' }));
    navigate('/workout-active');
  };

  const toggleEquipment = (_id: EquipmentType) => {
    // Sadece vücut ağırlığı destekleniyor
    setSelectedEquipment(['none']);
  };

  return (
    <div className={`${activeMode !== 'quick' || step === 1 ? 'max-w-7xl' : 'max-w-xl'} mx-auto px-4 py-8`}>
      {/* Interactive Mode Picker Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-205/10 dark:border-slate-800 p-1 rounded-2xl mb-8 shadow-sm gap-1 flex-wrap md:flex-nowrap">
        <button
          onClick={() => setActiveMode('quick')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'quick' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-black' 
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
          }`}
        >
          🏋️ Hızlı Program
        </button>
        <button
          onClick={() => {
            setActiveMode('yoga');
            setFocus('yoga');
          }}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'yoga' 
              ? 'bg-emerald-500 text-slate-950 shadow-sm font-black' 
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
          }`}
        >
          🧘 Yoga Atlası
        </button>
        <button
          onClick={() => setActiveMode('planner')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'planner' 
              ? 'bg-indigo-600 text-white shadow-sm font-black' 
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
          }`}
        >
          📋 Özel Planlayıcı
        </button>
        <button
          onClick={() => setActiveMode('library')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMode === 'library' 
              ? 'bg-blue-600 text-white shadow-sm font-black' 
              : 'text-slate-450 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
          }`}
        >
          📖 Tüm Hareketler
        </button>
      </div>

      {activeMode === 'yoga' ? (
        <YogaPosterStudio />
      ) : activeMode === 'planner' ? (
        <CustomWorkoutPlanner />
      ) : activeMode === 'library' ? (
        <ExerciseLibrary />
      ) : (
        <>
          {/* Progress Indicator */}
          <div className="flex justify-between items-center mb-12">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              {steps.map((s) => (
                <div 
                  key={s.id} 
                  className={`h-1.5 w-12 rounded-full transition-all ${
                    s.id <= step ? 'bg-blue-600' : 'bg-slate-100'
                  }`} 
                />
              ))}
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </>
      )}

      {activeMode === 'quick' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-10"
          >
          {step === 1 && (
            <div className="space-y-8">
              {/* Günün Özel Elite Antrenmanları */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Core Card */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-[32px] border border-slate-800 shadow-xl relative overflow-hidden group flex flex-col justify-between">
                  {/* Accent highlights */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-500 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-lg tracking-widest">
                        GÜNÜN ELİT PROGRAMI
                      </span>
                      <div className="flex gap-1 items-center font-mono text-[9px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Zap className="w-3 h-3 fill-current animate-pulse text-amber-500" /> CORE KUVVET
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-display font-black text-white tracking-tight">
                         6'lı Çelik Karın Programı
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                        Profesyonel 6 hareketlik orijinal karın sekansı. Bölgesel olarak sırayla üst karın, oblik ve alt karını dener.
                      </p>
                    </div>
                    
                    {/* Visual chips for the 6 moves */}
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">6 HAREKET SEKANSI (30 SN)</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'Crunch Hold',
                          'Reach-Through',
                          'Knee Tucks',
                          'Russian Twist',
                          'Flutter Kicks',
                          'Reverse'
                        ].map((nm, idx) => (
                          <span key={idx} className="text-[8px] font-semibold text-slate-350 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">
                            {idx + 1}. {nm}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                       <button 
                        onClick={handleStartSixPackCustom}
                        className="w-full py-3 bg-white hover:bg-slate-50 text-slate-950 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-orange-500 fill-current" />
                        Karın Rutinini Başlat
                        <ChevronRight className="w-3.5 h-3.5 text-slate-450 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Yoga Card */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 rounded-[32px] border border-slate-800 shadow-xl relative overflow-hidden group flex flex-col justify-between">
                  {/* Accent highlights */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[9px] font-black uppercase rounded-lg tracking-widest">
                        GÜNÜN REKLAMSIZ ELİT AKIŞI
                      </span>
                      <div className="flex gap-1 items-center font-mono text-[9px] text-emerald-400 font-bold bg-emerald-555/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        🧘 ESNEKLİK & DURUŞ
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-display font-black text-white tracking-tight">
                         Premium Yoga & Mobilite Akışı
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                        Zihinsel dekompresyon, derin fasyal esneme ve omurlar arası bütünlük için tasarlanmış özel asana sekansı.
                      </p>
                    </div>
                    
                    {/* Visual chips for the 7 moves */}
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">7 PREMİUM ASANA (45 SN)</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'Sukhasana',
                          'Padmasana',
                          'Anjaneyasana',
                          'Adho Mukha',
                          'Bhujangasana',
                          'Calf Stretch',
                          'Balasana'
                        ].map((nm, idx) => (
                          <span key={idx} className="text-[8px] font-semibold text-slate-350 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">
                            {idx + 1}. {nm}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                       <button 
                        onClick={handleStartYogaCustom}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                        Yoga Seansını Başlat
                        <ChevronRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seperator text */}
              <div className="flex items-center gap-4 py-8 select-none">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-2">VEYA ÖZEL ANTRENMAN OLUŞTUR</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              </div>

              <div className="text-center max-w-xl mx-auto">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Battery className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bugün Enerjin Nasıl?</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Enerji seviyene göre antrenman süresini belirleyeceğiz.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6">
                {[
                  { id: 'low', label: 'Düşük / Yorgun', desc: 'Hafif 4 hareketlik hızlı akış', icon: Brain },
                  { id: 'medium', label: 'Normal / Dengeli', desc: 'Standart 6 hareketlik antrenman', icon: Zap },
                  { id: 'high', label: 'Zinde / Güçlü', desc: 'Yoğun 8 hareketlik tam performans', icon: Battery },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setEnergy(opt.id as any); setStep(2); }}
                    className={`flex flex-col items-center gap-4 p-6 rounded-[24px] border-2 text-center transition-all group cursor-pointer ${
                      energy === opt.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors ${energy === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white text-sm">{opt.label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ana Hedefin Nedir?</h2>
                <p className="text-slate-500 mt-2">Sana en uygun egzersiz kombinasyonunu hazırlayacağız.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'lose_weight', label: 'Kilo Vermek', desc: 'Yağ yakımı odaklı yüksek tempo', icon: Zap },
                  { id: 'build_muscle', label: 'Kas Kütlesi', desc: 'Güç ve direnç odaklı hareketler', icon: Zap },
                  { id: 'get_fit', label: 'Formda Kalmak', desc: 'Genel sağlık ve kondisyon', icon: Battery },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setGoal(opt.id as any); setStep(3); }}
                    className={`flex items-center gap-6 p-6 rounded-[24px] border-2 text-left transition-all ${
                      goal === opt.id ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-4 rounded-xl transition-colors ${goal === opt.id ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{opt.label}</h3>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fitness Seviyen?</h2>
                <p className="text-slate-500 mt-2">Seni zorlayacak ama sakatlamayacak tempo.</p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'beginner', label: 'Yeni Başlayan', desc: 'Temel hareketler, uzun dinlenme' },
                  { id: 'intermediate', label: 'Orta Seviye', desc: 'Dengeli tempo ve zorluk' },
                  { id: 'pro', label: 'İleri Seviye', desc: 'Kısa dinlenme, yoğun akış' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setLevel(opt.id as any); setStep(4); }}
                    className={`p-6 rounded-[24px] border-2 text-left transition-all ${
                      level === opt.id ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-900">{opt.label}</h3>
                        <p className="text-sm text-slate-500">{opt.desc}</p>
                      </div>
                      {level === opt.id && <div className="bg-purple-600 text-white p-1 rounded-full"><Check className="w-4 h-4" /></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nereye Odaklanalım?</h2>
                <p className="text-slate-500 mt-2">Bugün vücudunun hangi bölgesini çalıştırmak istersin?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'full', label: 'Tüm Vücut', desc: 'Genel kondisyon' },
                  { id: 'upper', label: 'Üst Vücut', desc: 'Kol, omuz ve göğüs' },
                  { id: 'lower', label: 'Alt Vücut', desc: 'Bacak ve kalça' },
                  { id: 'core', label: 'Karın / Core', desc: 'Merkez bölge' },
                  { id: 'yoga', label: 'Yoga & Esneklik 🧘🧘‍♀️', desc: 'Zihinsel rahatlama, spinal mobilite ve duruş' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setFocus(opt.id as any); setStep(5); }}
                    className={`p-6 rounded-[24px] border-2 text-center transition-all ${
                      opt.id === 'yoga' ? 'col-span-2 bg-gradient-to-r from-teal-50/40 via-emerald-50/30 to-blue-50/40' : ''
                    } ${
                      focus === opt.id 
                        ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-500/10' 
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <h3 className="font-bold text-slate-900">{opt.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ekipman Kontrolü</h2>
                <p className="text-slate-500 mt-2">Şu an kullanabileceğin ekipmanları seç.</p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'none', label: 'Sadece Vücut Ağırlığı', icon: Target },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleEquipment(opt.id as EquipmentType)}
                    className={`flex items-center justify-between p-6 rounded-[24px] border-2 transition-all ${
                      selectedEquipment.includes(opt.id as any) ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <opt.icon className={`w-6 h-6 ${selectedEquipment.includes(opt.id as any) ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="font-bold text-slate-900">{opt.label}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedEquipment.includes(opt.id as any) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200'
                    }`}>
                      {selectedEquipment.includes(opt.id as any) && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleStart}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center group mt-4"
              >
                Antrenmanı Başlat
                <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      )}

      {activeMode === 'quick' && (
        <div className="mt-12 p-6 bg-slate-50 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 rounded-[32px] flex items-center justify-between opacity-80 overflow-hidden">
          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 bg-white dark:bg-slate-850 rounded-full flex items-center justify-center shadow-sm">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {energy === 'low' ? 'Hızlı Akış' : energy === 'medium' ? 'Dengeli' : 'Maksimum'} • {level} • {goal.replace('_', ' ')}
            </div>
          </div>
          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded">ADIM {step}/5</div>
        </div>
      )}
    </div>
  );
}
