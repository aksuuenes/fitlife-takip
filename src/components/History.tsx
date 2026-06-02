import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Calendar, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { firebaseService } from '../services/firebaseService';
import { HealthRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';

import { parseNumber, getBMIStatus } from '../lib/utils';

export default function History() {
  const navigate = useNavigate();
  const { user, activeProfileId } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setRecords([]);
      setLoading(true);
      if (user && activeProfileId) {
        const data = await firebaseService.getHealthRecords(user.uid, activeProfileId);
        setRecords(data);
      } else if (!user && activeProfileId) {
        const data = storageService.getRecords(activeProfileId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(data);
      }
      setLoading(false);
    };

    fetchRecords();
  }, [user, activeProfileId]);


  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteRecord = async (id: string) => {
    try {
      if (user && activeProfileId) {
        await firebaseService.deleteHealthRecord(user.uid, activeProfileId, id);
      } else if (activeProfileId) {
        storageService.deleteRecord(id, activeProfileId);
      }
      setRecords(records.filter(r => r.id !== id));
      setDeletingId(null);
    } catch (error) {
      console.error("Giriş silinirken hata oluştu:", error);
      alert("Kayıt silinemedi. Lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-mono font-extrabold uppercase tracking-widest text-xs">Veriler Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white hover:bg-slate-50 text-slate-500 rounded-xl border border-slate-100 transition-colors shadow-sm cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">Geçmiş Kayıtlar</h1>
          <p className="text-slate-500 font-medium">Tüm sağlık verilerinizin listesi.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {records.length > 0 ? (
          records.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-slate-200">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-black text-slate-800 text-base">
                    {new Date(record.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase">KİLO: <span className="text-slate-700 font-bold">{record.weight}kg</span></span>
                    <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase">VKİ: <span className="text-slate-700 font-bold">{parseNumber(record.bmi).toFixed(1)}</span></span>
                    {(() => {
                      const status = getBMIStatus(parseNumber(record.bmi));
                      return (
                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-extrabold border uppercase tracking-wider ${status.bg} ${status.color} ${status.border}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                    {record.sleepQuality && (
                      <span className="text-[8px] px-2 py-0.5 rounded-md font-extrabold bg-indigo-50/60 text-indigo-700 border border-indigo-100/40 uppercase tracking-wider">
                        KALİTE: {record.sleepQuality}/10
                      </span>
                    )}
                    {record.sleepHours && (
                      <span className="text-[8px] px-2 py-0.5 rounded-md font-extrabold bg-amber-50/60 text-amber-700 border border-amber-100/40 uppercase tracking-wider">
                         {record.sleepHours} SAAT UYKU
                      </span>
                    )}
                    {record.age && (
                      <span className="text-[8px] px-2 py-0.5 rounded-md font-extrabold bg-slate-100 text-slate-500 border border-slate-200/50 uppercase tracking-wider">
                         YAŞ: {record.age}
                      </span>
                    )}
                  </div>

                  {/* Gelişmiş Biyometrik Veriler */}
                  {(record.heartRate || record.steps || record.waterIntake || record.bodyFat || record.muscleMass || record.caloriesBurned || record.stressLevel !== undefined) && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-100/50 max-w-xl">
                      {record.heartRate && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-rose-50/40 text-rose-700 border border-rose-100/20 px-2 py-1 rounded-lg">
                          <span>❤️</span>
                          <span>{record.heartRate} BPM Nabız</span>
                        </div>
                      )}
                      {record.steps && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-indigo-50/40 text-indigo-700 border border-indigo-100/20 px-2 py-1 rounded-lg">
                          <span>👣</span>
                          <span>{record.steps.toLocaleString('tr-TR')} Adım</span>
                        </div>
                      )}
                      {record.waterIntake && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-blue-50/40 text-blue-700 border border-blue-100/20 px-2 py-1 rounded-lg">
                          <span>💧</span>
                          <span>{record.waterIntake} L Su</span>
                        </div>
                      )}
                      {record.caloriesBurned && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-orange-50/40 text-orange-700 border border-orange-100/20 px-2 py-1 rounded-lg">
                          <span>🔥</span>
                          <span>{record.caloriesBurned} kcal</span>
                        </div>
                      )}
                      {record.bodyFat && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-emerald-50/40 text-emerald-700 border border-emerald-100/20 px-2 py-1 rounded-lg">
                          <span>✨</span>
                          <span>%{record.bodyFat} Yağ Oranı</span>
                        </div>
                      )}
                      {record.muscleMass && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-amber-50/40 text-amber-700 border border-amber-100/20 px-2 py-1 rounded-lg">
                          <span>💪</span>
                          <span>{record.muscleMass} kg Kas</span>
                        </div>
                      )}
                      {record.stressLevel !== undefined && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-purple-50/40 text-purple-700 border border-purple-100/20 px-2 py-1 rounded-lg">
                          <span>🧠</span>
                          <span>Stres: {record.stressLevel}/10</span>
                        </div>
                      )}
                    </div>
                  )}

                  {record.injuries && (
                    <div className="mt-3 bg-rose-50/30 border border-rose-100/40 p-2.5 rounded-lg max-w-lg">
                       <p className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-rose-500 mb-0.5">Sakatlık / Rahatsızlık</p>
                       <p className="text-xs text-slate-600 font-semibold">{record.injuries}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6 justify-between md:justify-end flex-grow">
                <div className="text-left md:text-right">
                   <p className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400 mb-1">Genel Durum</p>
                   <p className="text-xs font-semibold text-slate-500 italic max-w-xs line-clamp-1">"{record.healthStatus || 'Belirtilmedi'}"</p>
                </div>
                <div className="flex items-center gap-2">
                  {deletingId === record.id ? (
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-red-100/40 shadow-sm animate-in fade-in duration-200">
                      <button 
                        onClick={() => deleteRecord(record.id)}
                        className="text-[9px] font-mono font-extrabold uppercase px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        SİL
                      </button>
                      <button 
                        onClick={() => setDeletingId(null)}
                        className="text-[9px] font-mono font-extrabold uppercase px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        İPTAL
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeletingId(record.id)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Kaydı Sil"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-semibold text-sm">Henüz kayıtlı sağlık verisi bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
