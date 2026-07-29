import { Activity, Apple, Heart, StickyNote, FileText } from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: FileText, color: 'text-slate-650 dark:text-slate-455', bg: 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800' },
  { id: 'workout', name: 'Egzersiz', icon: Activity, color: 'text-indigo-600 dark:text-emerald-400', bg: 'bg-indigo-50/50 dark:bg-emerald-950/20 border-indigo-100 dark:border-emerald-900/30' },
  { id: 'nutrition', name: 'Beslenme', icon: Apple, color: 'text-emerald-600 dark:text-emerald-350', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' },
  { id: 'health', name: 'Sağlık', icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' },
  { id: 'general', name: 'Genel', icon: StickyNote, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' },
];

export const EMOP_MOODS = [
  { emoji: '🔥', label: 'Süper / Canlı' },
  { emoji: '⚡', label: 'Enerjik' },
  { emoji: '💪', label: 'Güçlü / Motive' },
  { emoji: '🥦', label: 'Temiz / Hafif' },
  { emoji: '🧘', label: 'Dingin / Hazır' },
  { emoji: '😊', label: 'Mutlu / Rahat' },
  { emoji: '😴', label: 'Yorgun / Uykulu' },
  { emoji: '🤕', label: 'Ağrılı / Bitkin' }
];

export const INTENSITIES = [
  { level: 'Light', name: 'Düşük Yoğunluk', color: 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30' },
  { level: 'Moderate', name: 'Orta Seviye', color: 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-emerald-400 border-indigo-200/50 dark:border-indigo-800/30' },
  { level: 'High', name: 'Yüksek Tempo', color: 'bg-orange-50/70 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200/50 dark:border-orange-850/30' },
  { level: 'Max', name: 'Maksimum Güç', color: 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30' }
];
