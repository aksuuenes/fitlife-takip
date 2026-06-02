import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Save, Heart, Activity, Flame, Droplet, Sparkles, Brain, Ruler, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { HealthRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';

import { parseNumber, calculateBMI, getBMIStatus } from '../lib/utils';

export default function HealthForm() {
  const navigate = useNavigate();
  const { user, updateActiveSubProfile, activeProfileId, currentProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    sleepHours: '8',
    injuries: '',
    healthStatus: '',
    notes: '',
    heartRate: '',
    steps: '',
    waterIntake: '',
    bodyFat: '',
    muscleMass: '',
    caloriesBurned: '',
    stressLevel: 5,
  });

  const [loading, setLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    const fetchLatestRecordForPrefill = async () => {
      if (!activeProfileId) return;
      try {
        let fetchedRecords: HealthRecord[] = [];
        if (user) {
          fetchedRecords = await firebaseService.getHealthRecords(user.uid, activeProfileId);
        } else {
          fetchedRecords = storageService.getRecords(activeProfileId);
        }
        
        // Sort newest first
        fetchedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = fetchedRecords[0];

        setFormData(prev => ({
          ...prev,
          height: latest?.height ? String(latest.height) : (currentProfile?.initialHeight ? String(currentProfile.initialHeight) : ''),
          weight: latest?.weight ? String(latest.weight) : (currentProfile?.initialWeight ? String(currentProfile.initialWeight) : ''),
          age: latest?.age ? String(latest.age) : '',
          sleepHours: latest?.sleepHours ? String(latest.sleepHours) : '8',
          injuries: latest?.injuries || '',
          healthStatus: latest?.healthStatus || '',
          heartRate: latest?.heartRate ? String(latest.heartRate) : '',
          steps: latest?.steps ? String(latest.steps) : '',
          waterIntake: latest?.waterIntake ? String(latest.waterIntake) : '',
          bodyFat: latest?.bodyFat ? String(latest.bodyFat) : '',
          muscleMass: latest?.muscleMass ? String(latest.muscleMass) : '',
          caloriesBurned: latest?.caloriesBurned ? String(latest.caloriesBurned) : '',
          stressLevel: latest?.stressLevel !== undefined ? latest.stressLevel : 5,
        }));

        if (latest || currentProfile?.initialHeight || currentProfile?.initialWeight) {
          setAutoFilled(true);
        }
      } catch (error) {
        console.error("Önceki veriler yüklenirken hata oluştu, profil varsayılanları atanıyor:", error);
        setFormData(prev => ({
          ...prev,
          height: currentProfile?.initialHeight ? String(currentProfile.initialHeight) : '',
          weight: currentProfile?.initialWeight ? String(currentProfile.initialWeight) : '',
        }));
      }
    };

    fetchLatestRecordForPrefill();
  }, [user, activeProfileId, currentProfile]);

  const calculatePreviewValues = () => {
    const w = parseNumber(formData.weight);
    const hInput = parseNumber(formData.height);
    
    if (w <= 10 || hInput <= 30) return null;
    
    const heightCm = hInput > 3 ? hInput : hInput * 100;
    const bmi = calculateBMI(w, heightCm);
    
    if (bmi < 5 || bmi > 150) return null; 
    return { bmi, heightCm };
  };

  const preview = calculatePreviewValues();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileId) return;

    const values = calculatePreviewValues();
    if (values === null) {
      alert("Lütfen geçerli ve gerçekçi boy/kilo değerleri girin. (Boy en az 30cm, Kilo en az 10kg olmalıdır)");
      return;
    }

    const { bmi, heightCm } = values;
    const weight = parseNumber(formData.weight);

    const steps = formData.steps ? parseInt(formData.steps) : undefined;
    const waterIntake = formData.waterIntake ? parseFloat(formData.waterIntake) : undefined;
    const bodyFat = formData.bodyFat ? parseFloat(formData.bodyFat) : undefined;
    const muscleMass = formData.muscleMass ? parseFloat(formData.muscleMass) : undefined;

    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      userId: user?.uid || 'local',
      date: new Date().toISOString(),
      weight,
      height: heightCm,
      bmi,
      age: parseInt(formData.age || "0"),
      sleepHours: parseFloat(formData.sleepHours || "0"),
      injuries: formData.injuries,
      healthStatus: formData.healthStatus,
      notes: formData.notes,
      heartRate: undefined,
      steps,
      waterIntake,
      bodyFat,
      muscleMass,
      caloriesBurned: undefined,
      stressLevel: undefined,
    };


    try {
      setLoading(true);
      if (user) {
        await firebaseService.saveHealthRecord(user.uid, activeProfileId, newRecord);
      } else {
        storageService.saveRecord(newRecord, activeProfileId);
      }
      
      await updateActiveSubProfile({
        initialHeight: heightCm,
        initialWeight: weight
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-400 hover:text-slate-900 mb-6 transition-colors font-semibold text-sm cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Geri Dön
      </button>

      {autoFilled && (
        <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-150/40 text-indigo-900 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100/50 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-indigo-700">Akıllı Profillendirme</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">Mevcut profil bilgileriniz ve en son sağlık verileriniz otomatik aktarıldı.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setAutoFilled(false)} 
            className="text-indigo-400 hover:text-indigo-800 text-[10px] font-mono font-extrabold uppercase tracking-wider ml-4 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm shadow-slate-100/40 border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 border-b border-slate-50 pb-6">
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md tracking-widest">PRO VE RESMİ VERİ GİRİŞİ</span>
            <h2 className="text-2xl font-display font-black text-slate-900 mt-2">Sağlık & Fiziksel Veri Girişi</h2>
            <p className="text-xs text-slate-400 mt-1">Ölçümlerinizi girerek detaylı analiz, yapay zeka tavsiyeleri ve gelişim grafikleri oluşturun.</p>
          </div>
          {preview && (() => {
            const status = getBMIStatus(preview.bmi);
            return (
              <div className="text-left sm:text-right shrink-0">
                <div className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest mb-1">TAHMİNİ VKİ / BMI</div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black inline-block border ${status.bg} ${status.color} ${status.border}`}>
                  {preview.bmi.toFixed(1)} - {status.label}
                </div>
              </div>
            );
          })()}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: CORE BIOMETRICS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Ruler className="h-3.5 w-3.5 text-indigo-500" />
              Temel Antropometrik Ölçümler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 ml-1">BOY (cm veya m)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: 180 veya 1.80"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-semibold text-sm text-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 ml-1">KİLO (kg)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: 80.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-semibold text-sm text-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 ml-1">YAŞINIZ</label>
                <input 
                  type="number" 
                  required
                  placeholder="Örn: 27"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-semibold text-sm text-slate-800"
                />
              </div>
            </div>
          </div>





          {/* SECTION 4: REST & LIFESTYLE */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Brain className="h-3.5 w-3.5 text-indigo-500" />
              Dinlenme, Uyku & Zihinsel Well-being
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 ml-1">KAÇ SAAT UYUDUNUZ?</label>
                <input 
                  type="number" 
                  required
                  step="0.5"
                  placeholder="Örn: 7.5"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({...formData, sleepHours: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-semibold text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 ml-1">SAKATLIK VEYA RAHATSIZLIKLAR</label>
                <input 
                  type="text"
                  placeholder="Varsa sakatlık veya kronik ağrılarınız..."
                  value={formData.injuries}
                  onChange={(e) => setFormData({...formData, injuries: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-semibold text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500 ml-1">GÜNCEL DURUM VE NOTLAR</label>
              <textarea 
                placeholder="Örn: Bugün oldukça enerjiktim, bacak antrenmanı harika geçti. Sol bileğimde hafif sertlik var."
                rows={2}
                value={formData.healthStatus}
                onChange={(e) => setFormData({...formData, healthStatus: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-300 font-semibold text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest flex items-center justify-center shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                'Güvenle Kaydediliyor...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Ölçümleri ve Biyometrikleri Kaydet
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-start">
          <Info className="h-4.5 w-4.5 text-indigo-500 mr-2.5 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
            Biyometrik verileriniz güvenli yerel veritabanınızda şifrelenir. 
            Bu veriler fitness gelişim seviyeleriniz, yapay zeka tarafından hazırlanan antrenman programları 
            ve haftalık fizyolojik trend analizleriniz için kullanılır.
          </p>
        </div>
      </div>
    </div>
  );
}
