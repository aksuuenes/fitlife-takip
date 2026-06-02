export interface HealthRecord {
  id: string;
  userId: string;
  date: string; // ISO string
  weight: number;
  height: number;
  bmi: number;
  age: number;
  sleepHours: number;
  injuries: string;
  healthStatus: string;
  sleepQuality?: number; // 1-10 scale
  notes?: string;
  heartRate?: number; // bpm
  steps?: number;
  waterIntake?: number; // Liters
  bodyFat?: number; // %
  muscleMass?: number; // kg
  caloriesBurned?: number; // kcal
  stressLevel?: number; // 1-10 scale
}

export interface WaterIntake {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  amount: number; // in ml
}

export interface SubProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  initialHeight?: number;
  initialWeight?: number;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  initialHeight?: number;
  initialWeight?: number;
  activeProfileId?: string;
  profiles?: SubProfile[];
}

export interface Exercise {
  id: string;
  name: string;
  duration: number; // base duration in seconds
  reps?: string;
  description: string;
  category: 'upper' | 'lower' | 'core' | 'cardio' | 'full' | 'yoga';
  equipment: ('none' | 'dumbbells' | 'barbell' | 'resistance_band' | 'pullup_bar')[];
  image?: string;
  howTo?: string[]; // Step-by-step yapılış adımları
}

export interface WorkoutSession {
  id: string;
  date: string;
  completedExercises: string[];
  totalDuration: number;
}

export interface CustomWorkoutRoutine {
  id: string;
  name: string;
  exerciseIds: string[];
  createdAt: string;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'workout' | 'nutrition' | 'health' | 'general';
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO String
  mood?: string; // Emoji or textual feeling descriptor
  intensity?: string; // Light, Moderate, High, Max
  tags?: string[]; // Custom tags
  format?: 'text' | 'spreadsheet'; // Spreadsheet or text format
}

