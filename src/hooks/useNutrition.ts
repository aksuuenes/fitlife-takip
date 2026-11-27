// Beslenme ekranlarının ortak veri kancaları: vücut bilgileri, beslenme ayarları, öğün okuma/yazma.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { MealEntry } from '../types';
import {
  BodyStats, DEFAULT_SETTINGS, NutritionSettings, ageFrom, computeGoals,
} from '../lib/nutrition';

/** Bir günün öğünlerini okuyan/yazan fonksiyonlar (giriş yapılmışsa Firestore, değilse telefon). */
export function useMealStore() {
  const { user, activeProfileId } = useAuth();
  const load = useCallback(async (dateKey: string): Promise<MealEntry[]> => {
    if (user && activeProfileId) return firebaseService.getMeals(user.uid, activeProfileId, dateKey);
    if (activeProfileId) return storageService.getMeals(dateKey, activeProfileId);
    return [];
  }, [user, activeProfileId]);
  const save = useCallback(async (dateKey: string, entries: MealEntry[]) => {
    if (user && activeProfileId) await firebaseService.saveMeals(user.uid, activeProfileId, dateKey, entries);
    else if (activeProfileId) storageService.saveMeals(dateKey, entries, activeProfileId);
  }, [user, activeProfileId]);
  const ready = !!activeProfileId;
  return useMemo(() => ({ load, save, ready }), [load, save, ready]);
}

/** Son kayıttaki kilo/boy/yaş ve tüm kilo kayıtları (eskiden yeniye). */
export function useBodyStats() {
  const { user, profile, activeProfileId, currentProfile } = useAuth();
  const [records, setRecords] = useState<{ date: string; weight: number; height?: number; age?: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let list: any[] = [];
        if (user && activeProfileId) list = await firebaseService.getHealthRecords(user.uid, activeProfileId);
        else if (activeProfileId) list = storageService.getRecords(activeProfileId);
        const sorted = [...list].filter(r => r?.date).sort((a, b) => (a.date < b.date ? -1 : 1));
        if (!cancelled) setRecords(sorted);
      } catch (e) {
        console.error('Body data error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, activeProfileId]);

  const body: BodyStats = useMemo(() => {
    const latest = records[records.length - 1];
    return {
      weight: latest?.weight || currentProfile?.initialWeight || profile?.initialWeight,
      height: latest?.height || currentProfile?.initialHeight || profile?.initialHeight,
      age: latest?.age || ageFrom(currentProfile?.birthDate || profile?.birthDate),
      gender: currentProfile?.gender || profile?.gender,
    };
  }, [records, currentProfile, profile]);

  return { body, records, loading };
}

/** Favoriler, son yenenler ve hedef ayarları. */
export function useNutritionSettings() {
  const { user, activeProfileId } = useAuth();
  const [settings, setSettings] = useState<NutritionSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(settings);
  ref.current = settings;

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      let stored: Partial<NutritionSettings> | null = null;
      try {
        if (user && activeProfileId) stored = await firebaseService.getNutritionSettings(user.uid, activeProfileId);
        else if (activeProfileId) stored = storageService.getNutritionSettings(activeProfileId);
      } catch (e) {
        console.error('Nutrition settings error:', e);
      }
      // Eski sürümde telefonda tutulan elle hedefi taşı
      let legacyKcal: number | null = null;
      try {
        const v = localStorage.getItem(`fitlife_kcal_goal_${activeProfileId || 'local'}`);
        legacyKcal = v ? Number(v) : null;
      } catch { /* yoksay */ }
      if (!cancelled) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...(stored || {}),
          favorites: stored?.favorites || [],
          recents: stored?.recents || [],
          customKcal: stored?.customKcal ?? legacyKcal ?? null,
        });
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user, activeProfileId]);

  const update = useCallback((patch: Partial<NutritionSettings> | ((s: NutritionSettings) => Partial<NutritionSettings>)) => {
    const prev = ref.current;
    const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) };
    ref.current = next;
    setSettings(next);
    (async () => {
      try {
        if (user && activeProfileId) await firebaseService.saveNutritionSettings(user.uid, activeProfileId, next);
        else if (activeProfileId) storageService.saveNutritionSettings(next, activeProfileId);
        localStorage.removeItem(`fitlife_kcal_goal_${activeProfileId || 'local'}`);
      } catch (e) {
        console.error('Nutrition settings save error:', e);
      }
    })();
  }, [user, activeProfileId]);

  return { settings, update, loaded };
}

/** Vücut bilgisi + ayarlardan günlük hedefler. */
export function useNutritionGoals() {
  const { body, records, loading } = useBodyStats();
  const { settings, update, loaded } = useNutritionSettings();
  const goals = useMemo(() => computeGoals(body, settings), [body, settings]);
  return { goals, body, records, settings, update, loading: loading || !loaded };
}
