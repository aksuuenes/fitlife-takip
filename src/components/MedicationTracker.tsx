import React from 'react';
import { Pill } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import DailyChecklist, { ChecklistItem } from './DailyChecklist';

export default function MedicationTracker() {
  const { user, activeProfileId } = useAuth();
  if (!activeProfileId) return null;
  const pid = activeProfileId;

  return (
    <DailyChecklist
      title="Günlük İlaçlar"
      itemLabel="İlaç"
      accent="sky"
      namePlaceholder="Örn: Parol"
      dosagePlaceholder="Örn: Sabah tok karnına 1 adet"
      emptyText="Henüz ilaç eklemedin."
      doneText="Bugünkü ilaçlarının hepsini aldın."
      reloadKey={`${user?.uid || 'guest'}:${pid}`}
      loadList={async () => (user ? firebaseService.getMedicationList(user.uid, pid) : storageService.getMedicationList(pid))}
      saveList={(items: ChecklistItem[]) => (user ? firebaseService.saveMedicationList(user.uid, pid, items) : storageService.saveMedicationList(items, pid))}
      loadTaken={async date => (user ? firebaseService.getMedicationLogs(user.uid, pid, date) : storageService.getMedicationLogs(date, pid))}
      saveTaken={(date, map) => (user ? firebaseService.updateMedicationLogs(user.uid, pid, date, map) : storageService.saveMedicationLogs(date, map, pid))}
      renderIcon={(_, taken) => <Pill className={`w-5 h-5 ${taken ? 'text-emerald-500' : 'text-sky-500'}`} />}
    />
  );
}
