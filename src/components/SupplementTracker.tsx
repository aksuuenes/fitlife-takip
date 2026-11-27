import React from 'react';
import { Activity, Flame, Pill, Sparkles } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import DailyChecklist, { ChecklistItem } from './DailyChecklist';

/** Kullanıcı kendi listesini kaydedene kadar gösterilen başlangıç listesi (id'ler eski kayıtlarla uyumlu). */
const DEFAULT_SUPPLEMENTS: ChecklistItem[] = [
  { id: 'protein', name: 'Protein tozu', dosage: '1 ölçek (30 g)' },
  { id: 'creatine', name: 'Kreatin', dosage: '1 ölçek (5 g)' },
  { id: 'collagen', name: 'Kolajen', dosage: '1 tablet / ölçek' },
  { id: 'vitamin', name: 'Multivitamin / Omega 3', dosage: '1 kapsül' },
];

const iconFor = (item: ChecklistItem, taken: boolean) => {
  if (taken) return <Pill className="w-5 h-5 text-emerald-500" />;
  const n = item.name.toLocaleLowerCase('tr-TR');
  if (n.includes('protein')) return <Flame className="w-5 h-5 text-orange-500" />;
  if (n.includes('kreatin')) return <Activity className="w-5 h-5 text-indigo-500" />;
  if (n.includes('kolajen')) return <Sparkles className="w-5 h-5 text-rose-500" />;
  return <Pill className="w-5 h-5 text-indigo-500" />;
};

export default function SupplementTracker() {
  const { user, activeProfileId } = useAuth();
  if (!activeProfileId) return null;
  const pid = activeProfileId;

  const loadList = async (): Promise<ChecklistItem[]> => {
    const saved = user ? await firebaseService.getSupplementList(user.uid, pid) : storageService.getSupplementList(pid);
    if (saved) return saved;
    // Eski sürümde yalnızca miktarlar değiştirilebiliyordu; onları başlangıç listesine uygula
    const dosages = user ? await firebaseService.getSupplementDosages(user.uid, pid) : storageService.getSupplementDosages(pid);
    return DEFAULT_SUPPLEMENTS.map(s => ({ ...s, dosage: dosages?.[s.id] || s.dosage }));
  };

  return (
    <DailyChecklist
      title="Günlük Takviyeler"
      itemLabel="Takviye"
      accent="indigo"
      namePlaceholder="Örn: D vitamini"
      dosagePlaceholder="Örn: 1 damla, kahvaltıda"
      emptyText="Listende takviye yok."
      doneText="Bugünkü takviyelerinin hepsini aldın."
      reloadKey={`${user?.uid || 'guest'}:${pid}`}
      loadList={loadList}
      saveList={items => (user ? firebaseService.saveSupplementList(user.uid, pid, items) : storageService.saveSupplementList(items, pid))}
      loadTaken={async date => (user ? firebaseService.getSupplements(user.uid, pid, date) : storageService.getSupplements(date, pid))}
      saveTaken={(date, map) => (user ? firebaseService.updateSupplements(user.uid, pid, date, map) : storageService.saveSupplements(date, map, pid))}
      renderIcon={iconFor}
    />
  );
}
