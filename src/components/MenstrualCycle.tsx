import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle, Trash2, Droplets } from 'lucide-react';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface CycleRecord {
  id: string;
  startDate: string; // ISO string YYYY-MM-DD
  endDate: string; // ISO string YYYY-MM-DD
  notes: string;
}

export default function MenstrualCycle() {
  const [records, setRecords] = useState<CycleRecord[]>(() => {
    const saved = localStorage.getItem('fitlife_cycle_records');
    if (saved) return JSON.parse(saved);
    return [];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 5), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('fitlife_cycle_records', JSON.stringify(records));
  }, [records]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: CycleRecord = {
      id: crypto.randomUUID(),
      startDate,
      endDate,
      notes,
    };
    // Sort descending by start date
    const updated = [...records, newRecord].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    setRecords(updated);
    setIsAdding(false);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  // Calculations for summary
  const sortedRecords = [...records].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  let averageCycleLength = 28; // default
  let averagePeriodLength = 5;
  
  if (sortedRecords.length >= 2) {
    let totalCycleDays = 0;
    for (let i = 1; i < sortedRecords.length; i++) {
      totalCycleDays += differenceInDays(
        parseISO(sortedRecords[i].startDate),
        parseISO(sortedRecords[i-1].startDate)
      );
    }
    averageCycleLength = Math.round(totalCycleDays / (sortedRecords.length - 1));
  }

  if (sortedRecords.length > 0) {
    let totalPeriodDays = 0;
    let validRecords = 0;
    for (const record of sortedRecords) {
        if(record.endDate && record.startDate) {
            totalPeriodDays += differenceInDays(parseISO(record.endDate), parseISO(record.startDate)) + 1;
            validRecords++;
        }
    }
    if (validRecords > 0) {
        averagePeriodLength = Math.round(totalPeriodDays / validRecords);
    }
  }

  const lastRecord = sortedRecords[sortedRecords.length - 1];
  const nextPredictedDate = lastRecord ? addDays(parseISO(lastRecord.startDate), averageCycleLength) : null;
  const daysUntilNext = nextPredictedDate ? differenceInDays(nextPredictedDate, new Date()) : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Droplets className="w-8 h-8 text-rose-500" />
            Adet Döngüsü
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Döngülerinizi kaydedin, semptomlarınızı takip edin ve gelecek tahminlerini görün.
          </p>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-lg shadow-slate-900/20 dark:shadow-white/10"
        >
          <Plus className="w-5 h-5" />
          {isAdding ? 'İptal Et' : 'Yeni Kayıt Ekle'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            onSubmit={handleAdd}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Başlangıç Tarihi</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bitiş Tarihi</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notlar / Semptomlar (İsteğe bağlı)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Örn: Baş ağrısı, kramp, yorgunluk..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 outline-none transition-all resize-none dark:text-white h-24"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-rose-500/30"
              >
                Kaydet
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold">Ortalama Döngü</h3>
          </div>
          <div className="text-4xl font-black text-rose-700 dark:text-rose-300">
            {records.length >= 2 ? `${averageCycleLength} Gün` : '-'}
          </div>
          <p className="text-sm text-rose-600/70 dark:text-rose-400/70 mt-1">İki başlangıç tarihi arası süre</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
            <CalendarIcon className="w-5 h-5" />
            <h3 className="font-bold">Ortalama Kanama</h3>
          </div>
          <div className="text-4xl font-black text-indigo-700 dark:text-indigo-300">
            {records.length > 0 ? `${averagePeriodLength} Gün` : '-'}
          </div>
          <p className="text-sm text-indigo-600/70 dark:text-indigo-400/70 mt-1">Ortalama kanama süresi</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold">Tahmini Sonraki</h3>
          </div>
          <div className="text-4xl font-black text-emerald-700 dark:text-emerald-300">
             {nextPredictedDate ? format(nextPredictedDate, 'd MMM', { locale: tr }) : '-'}
          </div>
          <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-1">
            {daysUntilNext !== null 
              ? daysUntilNext > 0 
                ? `${daysUntilNext} gün kaldı` 
                : daysUntilNext === 0 
                  ? 'Bugün bekleniyor' 
                  : `${Math.abs(daysUntilNext)} gün gecikti`
              : 'Veri gerekli'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Geçmiş Kayıtlar Tablosu</h2>
        
        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Droplets className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Henüz bir kayıt bulunmuyor.</p>
            <p className="text-sm mt-1">İlk adet döngünüzü ekleyerek takibe başlayın.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                <th className="pb-4 font-semibold px-4">Başlangıç</th>
                <th className="pb-4 font-semibold px-4">Bitiş</th>
                <th className="pb-4 font-semibold px-4">Süre</th>
                <th className="pb-4 font-semibold px-4">Notlar / Semptomlar</th>
                <th className="pb-4 font-semibold px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const days = differenceInDays(parseISO(record.endDate), parseISO(record.startDate)) + 1;
                return (
                  <tr key={record.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {format(parseISO(record.startDate), 'd MMM yyyy', { locale: tr })}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      {format(parseISO(record.endDate), 'd MMM yyyy', { locale: tr })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                        {days} Gün
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-sm max-w-[200px] truncate">
                      {record.notes || '-'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
