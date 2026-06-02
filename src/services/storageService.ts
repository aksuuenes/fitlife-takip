import { HealthRecord, UserProfile, Note } from '../types';

// Mock/LocalStorage Fallback Service
const STORAGE_KEY_RECORDS = 'fitlife_records';
const STORAGE_KEY_PROFILE = 'fitlife_profile';
const STORAGE_KEY_WATER = 'fitlife_water';
const STORAGE_KEY_WORKOUT = 'fitlife_workout';

export const storageService = {
  getRecords: (profileId: string = 'local'): HealthRecord[] => {
    const key = `${STORAGE_KEY_RECORDS}_${profileId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  saveRecord: (record: HealthRecord, profileId: string = 'local') => {
    const records = storageService.getRecords(profileId);
    records.push(record);
    localStorage.setItem(`${STORAGE_KEY_RECORDS}_${profileId}`, JSON.stringify(records));
  },
  deleteRecord: (id: string, profileId: string = 'local') => {
    const records = storageService.getRecords(profileId).filter(r => r.id !== id);
    localStorage.setItem(`${STORAGE_KEY_RECORDS}_${profileId}`, JSON.stringify(records));
  },
  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEY_PROFILE);
    return data ? JSON.parse(data) : null;
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  },
  getWaterIntake: (date: string, profileId: string = 'local'): number => {
    const key = `${STORAGE_KEY_WATER}_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    return all[date] || 0;
  },
  saveWaterIntake: (date: string, amount: number, profileId: string = 'local') => {
    const key = `${STORAGE_KEY_WATER}_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    all[date] = amount;
    localStorage.setItem(key, JSON.stringify(all));
  },
  getWorkoutStatus: (date: string, profileId: string = 'local'): boolean => {
    const key = `${STORAGE_KEY_WORKOUT}_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    const entry = all[date];
    if (typeof entry === 'object' && entry !== null) {
      return !!entry.completed;
    }
    return !!entry;
  },
  getWorkoutDetails: (date: string, profileId: string = 'local'): { completed: boolean; mood?: string; note?: string } | null => {
    const key = `${STORAGE_KEY_WORKOUT}_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    const entry = all[date];
    if (typeof entry === 'object' && entry !== null) {
      return entry;
    } else if (entry) {
      return { completed: true, mood: '', note: '' };
    }
    return null;
  },
  getWorkoutHistory: (profileId: string = 'local'): any[] => {
    const key = `${STORAGE_KEY_WORKOUT}_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    return Object.entries(all).map(([date, val]: [string, any]) => {
      if (typeof val === 'object' && val !== null) {
        return { date, ...val };
      }
      return { date, completed: !!val, mood: '', note: '' };
    }).sort((a, b) => b.date.localeCompare(a.date));
  },
  saveWorkoutStatus: (date: string, completed: boolean, profileId: string = 'local', mood?: string, note?: string, workoutTitle?: string, exercises?: string[]) => {
    const key = `${STORAGE_KEY_WORKOUT}_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    all[date] = { 
      completed, 
      mood: mood || '', 
      note: note || '',
      workoutTitle: workoutTitle || 'Profesyonel Antrenman',
      exercises: exercises || [],
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(all));
  },
  getCustomWorkoutRoutines: (profileId: string = 'local'): any[] => {
    const key = `fitlife_custom_routines_${profileId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },
  saveCustomWorkoutRoutine: (profileId: string = 'local', routine: any) => {
    const key = `fitlife_custom_routines_${profileId}`;
    const routines = storageService.getCustomWorkoutRoutines(profileId);
    const existingIndex = routines.findIndex(r => r.id === routine.id);
    if (existingIndex > -1) {
      routines[existingIndex] = routine;
    } else {
      routines.push(routine);
    }
    localStorage.setItem(key, JSON.stringify(routines));
  },
  deleteCustomWorkoutRoutine: (profileId: string = 'local', routineId: string) => {
    const key = `fitlife_custom_routines_${profileId}`;
    const routines = storageService.getCustomWorkoutRoutines(profileId).filter(r => r.id !== routineId);
    localStorage.setItem(key, JSON.stringify(routines));
  },
  getSupplements: (date: string, profileId: string = 'local'): { [key: string]: boolean } => {
    const key = `fitlife_supplements_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    return all[date] || {};
  },
  saveSupplements: (date: string, supplements: { [key: string]: boolean }, profileId: string = 'local') => {
    const key = `fitlife_supplements_${profileId}`;
    const all = JSON.parse(localStorage.getItem(key) || '{}');
    all[date] = supplements;
    localStorage.setItem(key, JSON.stringify(all));
  },
  getSupplementDosages: (profileId: string = 'local'): { [key: string]: string } => {
    const key = `fitlife_supplement_dosages_${profileId}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  },
  saveSupplementDosages: (dosages: { [key: string]: string }, profileId: string = 'local') => {
    const key = `fitlife_supplement_dosages_${profileId}`;
    localStorage.setItem(key, JSON.stringify(dosages));
  },
  getNotes: (profileId: string = 'local'): Note[] => {
    const key = `fitlife_notes_${profileId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  saveNote: (note: Note, profileId: string = 'local') => {
    const notes = storageService.getNotes(profileId);
    const existingIndex = notes.findIndex(n => n.id === note.id);
    if (existingIndex > -1) {
      notes[existingIndex] = note;
    } else {
      notes.unshift(note);
    }
    localStorage.setItem(`fitlife_notes_${profileId}`, JSON.stringify(notes));
  },
  deleteNote: (noteId: string, profileId: string = 'local') => {
    const notes = storageService.getNotes(profileId).filter(n => n.id !== noteId);
    localStorage.setItem(`fitlife_notes_${profileId}`, JSON.stringify(notes));
  }
};
