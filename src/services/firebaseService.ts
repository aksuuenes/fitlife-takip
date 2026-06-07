import { 
  collection, 
  doc, 
  getDocs as firebaseGetDocs, 
  getDoc as firebaseGetDoc, 
  setDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { HealthRecord, UserProfile, Note } from '../types';

const TIMEOUT_MS = 4000;

const withTimeout = <T>(promise: Promise<T>, ms: number = TIMEOUT_MS): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error("Firebase ağ isteği zaman aşımına uğradı (offline veya engelli).")), ms)
    )
  ]);
};

const getDoc = (ref: any) => withTimeout(firebaseGetDoc(ref));
const getDocs = (ref: any) => withTimeout(firebaseGetDocs(ref));

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function sanitizeData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (data !== null && typeof data === 'object') {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = sanitizeData(value);
      }
      return acc;
    }, {} as any);
  }
  return data;
}

export const firebaseService = {
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  saveHealthRecord: async (userId: string, profileId: string, record: HealthRecord) => {
    const path = `users/${userId}/profiles/${profileId}/records/${record.id}`;
    const sanitizedRecord = sanitizeData(record);
    try {
      await setDoc(doc(db, path), sanitizedRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  getHealthRecords: async (userId: string, profileId: string): Promise<HealthRecord[]> => {
    const path = `users/${userId}/profiles/${profileId}/records`;
    try {
      const q = query(collection(db, path), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as HealthRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  getWaterIntake: async (userId: string, profileId: string, date: string): Promise<number> => {
    const path = `users/${userId}/profiles/${profileId}/water/${date}`;
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as { amount: number }).amount : 0;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return 0;
    }
  },

  updateWaterIntake: async (userId: string, profileId: string, date: string, amount: number) => {
    const path = `users/${userId}/profiles/${profileId}/water/${date}`;
    try {
      await setDoc(doc(db, path), { amount, lastUpdated: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  getWorkoutStatus: async (userId: string, profileId: string, date: string): Promise<boolean> => {
    const path = `users/${userId}/profiles/${profileId}/workouts/${date}`;
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return !!data.completed;
      }
      return false;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return false;
    }
  },

  getWorkoutDetails: async (userId: string, profileId: string, date: string): Promise<{ completed: boolean; mood?: string; note?: string } | null> => {
    const path = `users/${userId}/profiles/${profileId}/workouts/${date}`;
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          completed: !!data.completed,
          mood: data.mood || '',
          note: data.note || ''
        };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  getWorkoutHistory: async (userId: string, profileId: string): Promise<any[]> => {
    const path = `users/${userId}/profiles/${profileId}/workouts`;
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        date: doc.id,
        ...doc.data()
      })).sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  updateWorkoutStatus: async (userId: string, profileId: string, date: string, completed: boolean, mood?: string, note?: string, workoutTitle?: string, exercises?: string[]) => {
    const path = `users/${userId}/profiles/${profileId}/workouts/${date}`;
    try {
      await setDoc(doc(db, path), { 
        completed, 
        mood: mood || '', 
        note: note || '', 
        workoutTitle: workoutTitle || 'Profesyonel Antrenman',
        exercises: exercises || [],
        lastUpdated: new Date().toISOString() 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteHealthRecord: async (userId: string, profileId: string, recordId: string) => {
    const path = `users/${userId}/profiles/${profileId}/records/${recordId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  saveCustomWorkoutRoutine: async (userId: string, profileId: string, routine: any) => {
    const path = `users/${userId}/profiles/${profileId}/routines/${routine.id}`;
    const sanitized = sanitizeData(routine);
    try {
      await setDoc(doc(db, path), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  getCustomWorkoutRoutines: async (userId: string, profileId: string): Promise<any[]> => {
    const path = `users/${userId}/profiles/${profileId}/routines`;
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  deleteCustomWorkoutRoutine: async (userId: string, profileId: string, routineId: string) => {
    const path = `users/${userId}/profiles/${profileId}/routines/${routineId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  getNotes: async (userId: string, profileId: string): Promise<Note[]> => {
    const path = `users/${userId}/profiles/${profileId}/notes`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Note);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  saveNote: async (userId: string, profileId: string, note: Note) => {
    const path = `users/${userId}/profiles/${profileId}/notes/${note.id}`;
    const sanitized = sanitizeData(note);
    try {
      await setDoc(doc(db, path), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteNote: async (userId: string, profileId: string, noteId: string) => {
    const path = `users/${userId}/profiles/${profileId}/notes/${noteId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  getSupplements: async (userId: string, profileId: string, date: string): Promise<{ [key: string]: boolean }> => {
    const path = `users/${userId}/profiles/${profileId}/supplements/${date}`;
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as { taken: { [key: string]: boolean } }).taken : {};
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return {};
    }
  },

  updateSupplements: async (userId: string, profileId: string, date: string, taken: { [key: string]: boolean }) => {
    const path = `users/${userId}/profiles/${profileId}/supplements/${date}`;
    try {
      await setDoc(doc(db, path), { taken, lastUpdated: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  getSupplementDosages: async (userId: string, profileId: string): Promise<{ [key: string]: string }> => {
    const path = `users/${userId}/profiles/${profileId}/supplementSettings/customDosages`;
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as { dosages: { [key: string]: string } }).dosages : {};
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return {};
    }
  },

  saveSupplementDosages: async (userId: string, profileId: string, dosages: { [key: string]: string }) => {
    const path = `users/${userId}/profiles/${profileId}/supplementSettings/customDosages`;
    try {
      await setDoc(doc(db, path), { dosages, lastUpdated: new Date().toISOString() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
