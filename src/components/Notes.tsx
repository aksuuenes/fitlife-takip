import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Activity, 
  Apple, 
  Heart, 
  StickyNote, 
  X, 
  Check, 
  Loader2, 
  Smile,
  Tag,
  Clock,
  ListTodo,
  TrendingUp,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  ChevronUp,
  ChevronDown,
  Info,
  Layers,
  Flame,
  Zap,
  Target
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: FileText, color: 'text-slate-650 dark:text-slate-455', bg: 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800' },
  { id: 'workout', name: 'Egzersiz', icon: Activity, color: 'text-indigo-600 dark:text-emerald-400', bg: 'bg-indigo-50/50 dark:bg-emerald-950/20 border-indigo-100 dark:border-emerald-900/30' },
  { id: 'nutrition', name: 'Beslenme', icon: Apple, color: 'text-emerald-600 dark:text-emerald-350', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' },
  { id: 'health', name: 'Sağlık', icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' },
  { id: 'general', name: 'Genel', icon: StickyNote, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' },
];

const EMOP_MOODS = [
  { emoji: '🔥', label: 'Süper / Canlı' },
  { emoji: '⚡', label: 'Enerjik' },
  { emoji: '💪', label: 'Güçlü / Motive' },
  { emoji: '🥦', label: 'Temiz / Hafif' },
  { emoji: '🧘', label: 'Dingin / Hazır' },
  { emoji: '😊', label: 'Mutlu / Rahat' },
  { emoji: '😴', label: 'Yorgun / Uykulu' },
  { emoji: '🤕', label: 'Ağrılı / Bitkin' }
];

const INTENSITIES = [
  { level: 'Light', name: 'Düşük Yoğunluk', color: 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30' },
  { level: 'Moderate', name: 'Orta Seviye', color: 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-emerald-400 border-indigo-200/50 dark:border-indigo-800/30' },
  { level: 'High', name: 'Yüksek Tempo', color: 'bg-orange-50/70 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200/50 dark:border-orange-850/30' },
  { level: 'Max', name: 'Maksimum Güç', color: 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30' }
];

export default function Notes() {
  const { user, activeProfileId } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'workout' | 'nutrition' | 'health' | 'general'>('general');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [mood, setMood] = useState('😊');
  const [intensity, setIntensity] = useState('Moderate');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Spreadsheet Format States
  const [noteFormat, setNoteFormat] = useState<'text' | 'spreadsheet'>('text');
  const [sheetColumns, setSheetColumns] = useState<string[]>(['Egzersiz Adı', 'Set', 'Tekrar', 'Ağırlık (kg)', 'Dinlenme', 'Notlar']);
  const [sheetRows, setSheetRows] = useState<string[][]>([
    ['Şınav (Pushups)', '4', '15', 'Vücut Ağırlığı', '60 sn', 'Forma dikkat et'],
    ['Squat (Çömelme)', '4', '12', 'Vücut Ağırlığı', '60 sn', 'Dizler dışa doğru']
  ]);

  // Excel Pro Advanced States
  const [customTemplates, setCustomTemplates] = useState<{ name: string; columns: string[]; rows: string[][] }[]>([]);
  const [isSheetFullscreen, setIsSheetFullscreen] = useState(false);
  const [activeCell, setActiveCell] = useState<{ rIdx: number; cIdx: number } | null>(null);
  const [customTemplateName, setCustomTemplateName] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [selectedViewNote, setSelectedViewNote] = useState<Note | null>(null);

  // Load custom templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fitlife_custom_sheet_templates');
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Pre-made Spreadsheet Templates
  const SHEET_TEMPLATES = {
    workout: {
      title: "Split Güç Rutinim 💪",
      category: "workout" as const,
      columns: ["Hareket Adı", "Set Sayısı", "Tekrar", "Ağırlık (kg)", "Dinlenme", "Hedef/Not"],
      rows: [
        ["Bench Press (Göğüs)", "4", "12", "60", "90 sn", "Son set yardımlı"],
        ["Dumbbell Row (Sırt)", "4", "12", "22", "60 sn", "Skapula sıkıştır"],
        ["Overhead Press (Omuz)", "4", "10", "30", "90 sn", "Core bölgesini sıkı tut"],
        ["Bicep Curl (Pazu)", "3", "12", "12.5", "60 sn", "Negatifleri yavaş bırak"]
      ]
    },
    nutrition: {
      title: "Günlük Beslenme Planım 🥗",
      category: "nutrition" as const,
      columns: ["Öğün", "Yemek / Malzeme", "Miktar", "Kalori (kcal)", "Protein (g)", "Karbonhidrat (g)"],
      rows: [
        ["Kahvaltı", "Yulaf Ezmesi & Muz & Bal", "80g & 1 Adet", "380", "12", "55"],
        ["Öğle Yemeği", "Izgara Tavuk Göğsü & Pirinç Pilavı", "150g & 150g", "580", "45", "48"],
        ["Ara Öğün", "Fıstık Ezmesi & Whey Protein", "1 Kaşık & 1 Ölçek", "280", "28", "12"],
        ["Akşam Yemeği", "Fırında Somon & Brokoli", "200g & 100g", "450", "38", "8"]
      ]
    },
    health: {
      title: "Haftalık Biyometrik Ölçümlerim 📈",
      category: "health" as const,
      columns: ["Gözlem Günü", "Ağırlık (kg)", "Vücut Yağı (%)", "Kas Kütlesi (kg)", "Uyku (saat)", "Hissiyat/Not"],
      rows: [
        ["Pazartesi (Aç)", "78.2", "15.4", "38.2", "7.5", "Zinde ve enerjik"],
        ["Çarşamba (Aç)", "78.0", "15.3", "38.3", "8.0", "Hafif kas ağrısı var"],
        ["Cuma (Aç)", "77.8", "15.2", "38.4", "7.0", "Formda ve güçlü"]
      ]
    }
  };

  const loadTemplate = (type: 'workout' | 'nutrition' | 'health') => {
    const template = SHEET_TEMPLATES[type];
    setTitle(template.title);
    setCategory(template.category);
    setSheetColumns(template.columns);
    setSheetRows(template.rows);
    setNoteFormat('spreadsheet');
    setActiveCell(null);
  };

  const loadCustomTemplate = (tpl: { name: string; columns: string[]; rows: string[][] }) => {
    setTitle(`${tpl.name} Şablonu`);
    setSheetColumns(tpl.columns);
    setSheetRows(tpl.rows);
    setNoteFormat('spreadsheet');
    setActiveCell(null);
  };

  const handleSaveAsCustomTemplate = () => {
    if (!customTemplateName.trim()) return;
    const newTpl = {
      name: customTemplateName.trim(),
      columns: [...sheetColumns],
      rows: sheetRows.map(r => [...r])
    };
    const nextTpls = [...customTemplates.filter(t => t.name !== newTpl.name), newTpl];
    setCustomTemplates(nextTpls);
    localStorage.setItem('fitlife_custom_sheet_templates', JSON.stringify(nextTpls));
    setCustomTemplateName('');
    setShowSaveTemplateModal(false);
  };

  const handleDeleteCustomTemplate = (e: React.MouseEvent, nameToDelete: string) => {
    e.stopPropagation();
    const nextTpls = customTemplates.filter(t => t.name !== nameToDelete);
    setCustomTemplates(nextTpls);
    localStorage.setItem('fitlife_custom_sheet_templates', JSON.stringify(nextTpls));
  };

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = async () => {
    const profileId = activeProfileId || 'local';
    setLoading(true);
    try {
      if (user) {
        const data = await firebaseService.getNotes(user.uid, profileId);
        setNotes(data);
      } else {
        const data = storageService.getNotes(profileId);
        setNotes(data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Notlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user, activeProfileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileId = activeProfileId || 'local';
    if (!title.trim()) return;
    if (noteFormat === 'text' && !content.trim()) return;

    setSaving(true);
    const noteId = editingNoteId || Math.random().toString(36).substring(2, 9);
    
    let finalContent = content.trim();
    if (noteFormat === 'spreadsheet') {
      finalContent = JSON.stringify({
        isSpreadsheet: true,
        columns: sheetColumns,
        rows: sheetRows
      });
    }

    const newNote: Note = {
      id: noteId,
      title: title.trim(),
      content: finalContent,
      category,
      date,
      createdAt: editingNoteId 
        ? (notes.find(n => n.id === editingNoteId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
      mood,
      intensity,
      tags,
      format: noteFormat
    };

    try {
      if (user) {
        await firebaseService.saveNote(user.uid, profileId, newNote);
      } else {
        storageService.saveNote(newNote, profileId);
      }
      await fetchNotes();
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Not kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setCategory(note.category);
    
    // Check if format is spreadsheet
    const isSheet = note.format === 'spreadsheet' || note.content.startsWith('{"isSpreadsheet":true');
    if (isSheet) {
      try {
        const parsed = JSON.parse(note.content);
        setSheetColumns(parsed.columns || []);
        setSheetRows(parsed.rows || []);
        setNoteFormat('spreadsheet');
        setContent('');
      } catch (e) {
        setContent(note.content);
        setNoteFormat('text');
      }
    } else {
      setContent(note.content);
      setNoteFormat('text');
    }
    
    setDate(note.date);
    setMood(note.mood || '😊');
    setIntensity(note.intensity || 'Moderate');
    setTags(note.tags || []);
    setIsOpenForm(true);
    setActiveCell(null);

    // Scroll smoothly to form view on mobile
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDelete = async (noteId: string) => {
    const profileId = activeProfileId || 'local';
    try {
      if (user) {
        await firebaseService.deleteNote(user.uid, profileId, noteId);
      } else {
        storageService.deleteNote(noteId, profileId);
      }
      setNotes(prev => prev.filter(n => n.id !== noteId));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      setError('Not silinirken hata oluştu');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setDate(new Date().toISOString().substring(0, 10));
    setEditingNoteId(null);
    setIsOpenForm(false);
    setMood('😊');
    setIntensity('Moderate');
    setTags([]);
    setTagInput('');
    setNoteFormat('text');
    setSheetColumns(['Egzersiz Adı', 'Set', 'Tekrar', 'Ağırlık (kg)', 'Dinlenme', 'Notlar']);
    setSheetRows([
      ['Şınav (Pushups)', '4', '15', 'Vücut Ağırlığı', '60 sn', 'Forma dikkat et'],
      ['Squat (Çömelme)', '4', '12', 'Vücut Ağırlığı', '60 sn', 'Dizler dışa doğru']
    ]);
    setActiveCell(null);
    setIsSheetFullscreen(false);
  };

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags(prev => [...prev, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('note-content-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      setContent(prev => prev + textToInsert);
      return;
    }
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const beforeText = content.substring(0, startPos);
    const afterText = content.substring(endPos, content.length);
    
    const newContent = beforeText + textToInsert + afterText;
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = startPos + textToInsert.length;
      textarea.selectionEnd = startPos + textToInsert.length;
    }, 15);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'workout': return 'bg-indigo-50/80 dark:bg-emerald-950/20 text-indigo-700 dark:text-emerald-400 border-indigo-150 dark:border-emerald-800/40';
      case 'nutrition': return 'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-350 border-emerald-150 dark:border-emerald-800/40';
      case 'health': return 'bg-rose-50/80 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 border-rose-150 dark:border-rose-800/40';
      default: return 'bg-amber-50/80 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-150 dark:border-amber-800/40';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'workout': return Activity;
      case 'nutrition': return Apple;
      case 'health': return Heart;
      default: return StickyNote;
    }
  };

  const getIntensityBadge = (lvl: string) => {
    const item = INTENSITIES.find(i => i.level === lvl) || INTENSITIES[1];
    return item;
  };

  // Get all unique tags across all notes
  const allUniqueTags = Array.from(
    new Set(notes.flatMap(n => n.tags || []))
  );

  // Column letters generator (0->A, 1->B, 2->C)
  const getColLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  // Move row up or down inside spreadsheet
  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sheetRows.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sheetRows];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setSheetRows(updated);

    if (activeCell && activeCell.rIdx === index) {
      setActiveCell({ rIdx: newIndex, cIdx: activeCell.cIdx });
    } else if (activeCell && activeCell.rIdx === newIndex) {
      setActiveCell({ rIdx: index, cIdx: activeCell.cIdx });
    }
  };

  // Insert Row Above or Below
  const handleInsertRow = (index: number, position: 'above' | 'below') => {
    const targetIdx = position === 'above' ? index : index + 1;
    const newRow = Array(sheetColumns.length).fill('');
    const updated = [...sheetRows];
    updated.splice(targetIdx, 0, newRow);
    setSheetRows(updated);
    setActiveCell({ rIdx: targetIdx, cIdx: 0 });
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) return;
      
      const parseCSVLine = (line: string) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result.map(c => c.replace(/^"|"$/g, '').trim());
      };

      try {
        const headers = parseCSVLine(lines[0]);
        const dataRows = lines.slice(1).map(line => {
          const parsed = parseCSVLine(line);
          while (parsed.length < headers.length) parsed.push('');
          return parsed.slice(0, headers.length);
        });

        setSheetColumns(headers);
        setSheetRows(dataRows);
        setNoteFormat('spreadsheet');
        setActiveCell(null);
      } catch (err) {
        alert("CSV ayrıştırılırken bir hata oluştu. Lütfen dosya biçimini kontrol edin.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = sheetColumns.join(',');
    const rows = sheetRows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title || 'FitLife_Tablo'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Smart calculations for columns that are likely numeric
  const getSheetStatistics = (cols: string[], rows: string[][]) => {
    const stats: { colName: string; total: string; avg: string; isInteger: boolean }[] = [];
    
    cols.forEach((colName, cIdx) => {
      let numbers: number[] = [];
      let unit = '';
      let hasNumeric = false;
      
      const lowerColName = colName.toLowerCase();
      const isLikelyNumeric = 
        lowerColName.includes('set') ||
        lowerColName.includes('tekrar') ||
        lowerColName.includes('ağırlık') ||
        lowerColName.includes('kg') ||
        lowerColName.includes('kalori') ||
        lowerColName.includes('kcal') ||
        lowerColName.includes('protein') ||
        lowerColName.includes('karbonhidrat') ||
        lowerColName.includes('yağ') ||
        lowerColName.includes('gram') ||
        lowerColName.includes('su') ||
        lowerColName.includes('litre') ||
        lowerColName.includes('ölçek') ||
        lowerColName.includes('uyku') ||
        lowerColName.includes('saat');

      if (!isLikelyNumeric) return;

      rows.forEach(row => {
        const cell = row[cIdx] || '';
        if (cell.trim()) {
          const numMatch = cell.trim().match(/^-?\d+(\.\d+)?/);
          if (numMatch) {
            numbers.push(parseFloat(numMatch[0]));
            hasNumeric = true;
            const unitMatch = cell.replace(numMatch[0], '').trim();
            if (unitMatch && !unit) {
              unit = ' ' + unitMatch;
            }
          }
        }
      });

      if (hasNumeric && numbers.length > 0) {
        const total = numbers.reduce((sum, val) => sum + val, 0);
        const avg = total / numbers.length;
        const isInteger = numbers.every(n => Number.isInteger(n));
        
        stats.push({
          colName,
          total: (isInteger ? Math.round(total) : Number(total.toFixed(1))) + unit,
          avg: Number(avg.toFixed(1)) + unit,
          isInteger
        });
      }
    });

    return stats;
  };

  const activeStats = getSheetStatistics(sheetColumns, sheetRows);

  // High-end Dashboard Live Stats counts
  const totalNotesCount = notes.length;
  const workoutSheetsCount = notes.filter(n => n.category === 'workout' || n.content.includes('"isSpreadsheet":true')).length;
  const nutritionCount = notes.filter(n => n.category === 'nutrition').length;
  const savedTemplatesCount = customTemplates.length;

  return (
    <div className="space-y-6 relative pb-12">
      {/* Top Tag Header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-widest text-[#10b981] dark:text-emerald-400 font-black uppercase bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/30 px-3 py-1 rounded-full shadow-inner animate-pulse">
          ⚡ EXCEL PRO YÜKSEK PERFORMANS ATÖLYESİ
        </span>
      </div>

      {/* Futuristic Dashboard Title & Intro */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 -mt-2">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Akıllı Notlar & Rutin Düzenleyici
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-semibold text-xs mt-1.5 max-w-xl">
            Spor rutinlerinizi, makro beslenmenizi ve biyometrik ölçümlerinizi profesyonel veri tablolarıyla veya düz metinlerle planlayıp analiz edin.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsOpenForm(true);
          }}
          className="bg-gradient-to-r from-indigo-650 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs px-6 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-150/30 dark:shadow-none transition-all cursor-pointer transform hover:scale-[1.03] active:scale-[0.97]"
        >
          <Plus className="w-5 h-5 text-white animate-bounce" />
          Yeni Pro Not / Tablo Yaz
        </button>
      </div>

      {/* ========================================================================= */}
      {/* FUTURISTIC GLASS DASHBOARD STATS GAUGES                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        {/* Stat Gauge 1 */}
        <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-100/70 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all group flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Toplam Notlarım</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block leading-none font-mono">
              {totalNotesCount}
            </span>
          </div>
        </div>

        {/* Stat Gauge 2 */}
        <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-100/70 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all group flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-[#10b981] dark:text-emerald-400 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Egzersiz / Tablo</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block leading-none font-mono">
              {workoutSheetsCount}
            </span>
          </div>
        </div>

        {/* Stat Gauge 3 */}
        <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-100/70 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all group flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Beslenme Planı</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block leading-none font-mono">
              {nutritionCount}
            </span>
          </div>
        </div>

        {/* Stat Gauge 4 */}
        <div className="bg-white/85 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-100/70 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all group flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform" />
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Özel Şablonlarım</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block leading-none font-mono">
              {savedTemplatesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Main Column - Notes list & Filters */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          
          {/* Elegant Command Center (Filters Toolbar) */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-[24px] border border-slate-100 dark:border-slate-800/80 flex flex-col gap-4 shadow-sm">
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Futuristic Search bar with Clear Button */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Search className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Notlarda veya etiketlerde ara..."
                  className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 font-semibold"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-650 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-full" />
                  </button>
                )}
              </div>

              {/* High-End Segmented Categories Choices */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-slate-50/80 dark:bg-slate-950/30 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850/60">
                {CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedTag(null);
                      }}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm border border-transparent'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Filters Ribbon */}
            {allUniqueTags.length > 0 && (
              <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1 text-slate-450 dark:text-slate-500 font-extrabold text-[9px] uppercase tracking-widest shrink-0 mb-1">
                  <Tag className="w-3 h-3 text-indigo-500" />
                  <span>ETİKET FİLTRESİ:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-2.5 py-1 text-[9px] font-black tracking-wide uppercase rounded-md border transition-colors ${
                      !selectedTag 
                        ? 'bg-indigo-50 dark:bg-emerald-950/30 text-indigo-650 dark:text-emerald-400 border-indigo-200 dark:border-emerald-800/40' 
                        : 'bg-white dark:bg-slate-950 text-slate-450 border-slate-100 dark:border-slate-850 hover:text-slate-650 dark:hover:text-slate-200'
                    }`}
                  >
                    Hepsi
                  </button>
                  {allUniqueTags.map(tg => (
                    <button
                      key={tg}
                      onClick={() => setSelectedTag(tg)}
                      className={`px-2.5 py-1 text-[9px] font-black tracking-wide uppercase rounded-md border transition-all ${
                        selectedTag === tg 
                          ? 'bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-transparent shadow-sm' 
                          : 'bg-white dark:bg-slate-950 text-slate-450 border-slate-100 dark:border-slate-850 hover:text-slate-650 dark:hover:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      #{tg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes Render Grid/List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-850">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin animate-duration-1000" />
              <p className="text-xs text-slate-400 font-semibold mt-3">Bulut veritabanınızdan notlar yükleniyor...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-850 p-8">
              <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100 dark:border-slate-800 animate-pulse">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-205">Kayıt Bulunmamaktadır</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-2 font-semibold">
                {searchQuery || selectedCategory !== 'all' || selectedTag
                  ? 'Filtreleme kriterlerinize uygun not bulunamadı. Süzgeçleri temizlemeyi deneyin.'
                  : 'Aktif profilinize ait bir not henüz yok. Sağ taraftaki panel veya üstteki buton ile yeni bir boş not yazabilirsiniz!'}
              </p>
              {(searchQuery || selectedCategory !== 'all' || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedTag(null);
                  }}
                  className="mt-4 text-xs font-black text-indigo-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Tüm Filtreleri Sıfırla
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => {
                  const CatIcon = getCategoryIcon(note.category);
                  const intensityObj = getIntensityBadge(note.intensity || 'Moderate');
                  const isDeleting = deletingId === note.id;

                  return (
                    <motion.div
                      layout
                      key={note.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
                      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 border border-slate-100 dark:border-slate-850 flex flex-col justify-between shadow-sm hover:shadow-lg dark:shadow-none hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-300 relative overflow-hidden group/card"
                    >
                      {/* Premium card accent top-light line */}
                      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent group-hover/card:via-[#10b981] transition-all duration-300`} />

                      <div>
                        {/* Note Header */}
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getCategoryColor(note.category)} flex items-center gap-1.5 shadow-sm`}>
                              <CatIcon className="w-3.5 h-3.5" />
                              {CATEGORIES.find(c => c.id === note.category)?.name || 'Genel'}
                            </span>
                            {note.intensity && (
                              <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg border ${intensityObj.color}`}>
                                {intensityObj.name.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px] font-extrabold">
                            <Calendar className="w-3 h-3" />
                            <span>{note.date}</span>
                          </div>
                        </div>

                        {/* Title & Mood */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <h3 className="font-display font-black text-slate-900 dark:text-white leading-snug group-hover/card:text-indigo-650 dark:group-hover/card:text-[#10b981] transition-colors text-base tracking-tight">
                            {note.title}
                          </h3>
                          {note.mood && (
                            <span className="text-xl shrink-0 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-inner shrink-0 block" title="Ruh Hali / Enerji">
                              {note.mood}
                            </span>
                          )}
                        </div>
                        
                        {/* Note Body (Text vs Table Preview) */}
                        {(() => {
                          const isSheet = note.format === 'spreadsheet' || note.content.startsWith('{"isSpreadsheet":true');
                          if (isSheet) {
                            try {
                              const sheetData = JSON.parse(note.content);
                              const stats = getSheetStatistics(sheetData.columns || [], sheetData.rows || []);
                              
                              return (
                                <div className="space-y-3 mt-3.5">
                                  {/* Table Preview */}
                                  <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-2xl shadow-inner w-full bg-slate-50/50 dark:bg-slate-950/20 max-h-[180px] overflow-y-auto scrollbar-thin">
                                    <table className="w-full text-left border-collapse text-[10px] font-sans">
                                      <thead>
                                        <tr className="bg-slate-100/80 dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800 sticky top-0 z-10">
                                          {sheetData.columns.map((col: string, idx: number) => (
                                            <th key={idx} className="p-2.5 font-extrabold uppercase text-slate-550 dark:text-slate-400 tracking-wider min-w-[80px] bg-slate-100/90 dark:bg-slate-950/90 border-r border-slate-200/20 dark:border-slate-800/20">{col}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sheetData.rows.map((row: string[], rIdx: number) => (
                                          <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-850/60 hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors even:bg-slate-50/30 dark:even:bg-slate-900/10">
                                            {row.map((cell: string, cIdx: number) => (
                                              <td key={cIdx} className="p-2.5 text-slate-700 dark:text-slate-350 font-semibold whitespace-normal break-words border-r border-slate-150/10 dark:border-slate-800/10">{cell || '-'}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Dynamic auto-calculation statistics preview on card */}
                                  {stats.length > 0 && (
                                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/15 rounded-xl p-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[9px] shadow-sm">
                                      <span className="font-extrabold text-[#10b981] dark:text-emerald-400 uppercase tracking-wider block shrink-0">📊 DİNAMİK HESAP:</span>
                                      {stats.slice(0, 3).map((st, sIdx) => (
                                        <span key={sIdx} className="text-slate-500 dark:text-slate-400 font-extrabold">
                                          {st.colName}: <strong className="text-slate-800 dark:text-white font-extrabold">{st.total}</strong>
                                        </span>
                                      ))}
                                      {stats.length > 3 && (
                                        <span className="text-slate-400 dark:text-slate-500 font-black">+{stats.length - 3} sütun</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            } catch(e) {
                              // fallback
                            }
                          }
                          return (
                            <p className="text-slate-550 dark:text-slate-450 text-xs leading-relaxed whitespace-pre-wrap line-clamp-5 font-medium mt-2">
                              {note.content}
                            </p>
                          );
                        })()}

                        {/* Rendering tags on card */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-4">
                            {note.tags.map(t => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(t);
                                }}
                                className="text-[9px] font-black uppercase text-indigo-500 dark:text-emerald-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-emerald-950/20 border border-slate-100 dark:border-slate-850 transition-colors tracking-wide"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(note)}
                            className="p-2 bg-slate-50 hover:bg-indigo-55 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-emerald-400 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-150/40 dark:border-slate-800"
                            title="Notu Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => setSelectedViewNote(note)}
                            className="p-2 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all cursor-pointer shadow-sm border border-slate-150/40 dark:border-slate-800 flex items-center justify-center"
                            title="Tam Ekran Büyüt"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isDeleting ? (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 p-1 rounded-xl border border-red-150 dark:border-red-900/40 z-10">
                            <span className="text-[9px] font-black text-red-600 uppercase px-1.5">Silinsin mi?</span>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="px-2.5 py-1 bg-red-650 text-white font-bold text-[9px] uppercase rounded-lg hover:bg-red-750 cursor-pointer shadow-sm"
                            >
                              Evet
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750 cursor-pointer"
                            >
                              Hayır
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(note.id)}
                            className="p-2 bg-slate-50 hover:bg-red-50 dark:bg-slate-850 dark:hover:bg-red-950/25 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer border border-slate-150/40 dark:border-slate-800"
                            title="Notu Kalıcı Olarak Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

        {/* Right Column - Create/Edit Form */}
        <div className="col-span-1 lg:col-span-4 space-y-6">

          {/* Toggle Button Form View State */}
          <AnimatePresence mode="wait">
            {isOpenForm ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl relative"
              >
                {/* Decorative top glass border */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-[#10b981] to-blue-500 rounded-t-3xl" />

                {/* Form Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-805/80 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7.5 h-7.5 bg-indigo-50 dark:bg-emerald-950/30 text-indigo-650 dark:text-emerald-450 rounded-xl flex items-center justify-center shadow-inner">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="font-display font-black text-xs text-slate-850 dark:text-white uppercase tracking-tight">
                      {editingNoteId ? 'Notu Düzenle' : 'Not Oluşturucu Atölyesi'}
                    </span>
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Input Body */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category choices */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                      KATEGORİ SEÇİNİZ
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
                        const isSelected = category === cat.id;
                        const CatIcon = cat.icon;

                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setCategory(cat.id as any)}
                            className={`p-3 rounded-xl border flex items-center gap-2 text-left justify-start cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-gradient-to-tr from-indigo-650 to-indigo-700 text-white border-transparent shadow shadow-indigo-100 dark:shadow-none font-bold'
                                : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-300 font-semibold'
                            }`}
                          >
                            <CatIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Yazım Şekli (Format Selector) */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                      YAZIM ŞEKLİ VEYA BİÇİMİ
                    </label>
                    <div className="flex gap-2 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-850/60">
                      <button
                        type="button"
                        onClick={() => setNoteFormat('text')}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          noteFormat === 'text'
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-transparent shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        📝 Metin
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteFormat('spreadsheet')}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          noteFormat === 'spreadsheet'
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-transparent shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        📊 Excel Tablo
                      </button>
                    </div>
                  </div>

                  {/* Pre-made Spreadsheet Templates Ribbon */}
                  {noteFormat === 'spreadsheet' && (
                    <div className="space-y-2 bg-slate-50/50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-150/40 dark:border-slate-850/60">
                      <span className="text-[8px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                        AKILLI ŞABLONLARI YÜKLE
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => loadTemplate('workout')}
                          className="w-full py-2 px-3 text-left bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-[9px] font-extrabold uppercase tracking-wide hover:border-indigo-500/30 text-slate-650 dark:text-slate-350 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          🏋️ Egzersiz & Antrenman Tablosu
                        </button>
                        <button
                          type="button"
                          onClick={() => loadTemplate('nutrition')}
                          className="w-full py-2 px-3 text-left bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-[9px] font-extrabold uppercase tracking-wide hover:border-emerald-500/30 text-slate-650 dark:text-slate-350 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          🥗 Kalori & Beslenme Defteri
                        </button>
                        <button
                          type="button"
                          onClick={() => loadTemplate('health')}
                          className="w-full py-2 px-3 text-left bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-[9px] font-extrabold uppercase tracking-wide hover:border-rose-500/30 text-slate-650 dark:text-slate-350 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          📈 Biyometrik Ölçüm Takipçisi
                        </button>
                      </div>

                      {/* Custom saved templates */}
                      {customTemplates.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50 mt-2.5">
                          <span className="text-[8px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
                            ÖZEL PROGRAM ŞABLONLARIM
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {customTemplates.map((tpl, tIdx) => (
                              <div 
                                key={tIdx}
                                onClick={() => loadCustomTemplate(tpl)}
                                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-[9px] font-extrabold uppercase tracking-wide hover:border-[#10b981]/40 text-slate-600 dark:text-slate-350 cursor-pointer flex items-center justify-between group/tpl transition-all"
                              >
                                <span className="truncate">📋 {tpl.name}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteCustomTemplate(e, tpl.name)}
                                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover/tpl:opacity-100 p-0.5 transition-all cursor-pointer"
                                  title="Şablonu Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                      NOT BAŞLIĞI
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Split Rutinim 💪 veya Pazartesi Kahvaltım"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                      KAYIT TARİHİ
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Advanced Mood / Energy Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                      ENERJİ VE HİS DURUMUNUZ
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none">
                      {EMOP_MOODS.map((m) => {
                        const isSel = mood === m.emoji;
                        return (
                          <button
                            type="button"
                            key={m.emoji}
                            onClick={() => setMood(m.emoji)}
                            className={`p-2 text-lg rounded-xl shrink-0 border transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-indigo-50 dark:bg-emerald-950 text-indigo-700 dark:text-emerald-400 border-indigo-200 dark:border-emerald-800/40 transform scale-110' 
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 hover:bg-slate-100 text-slate-650'
                            }`}
                            title={m.label}
                          >
                            {m.emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Intensity Level Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                      YOĞUNLUK / ETKİ SEVİYESİ
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {INTENSITIES.map((i) => {
                        const isActive = intensity === i.level;
                        return (
                          <button
                            type="button"
                            key={i.level}
                            onClick={() => setIntensity(i.level)}
                            className={`py-1.5 text-[8px] font-black uppercase tracking-wider text-center rounded-lg border transition-all cursor-pointer ${
                              isActive 
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent' 
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-450 border-slate-105 dark:border-slate-850'
                            }`}
                          >
                            {i.name.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note tags */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                      ETİKETLER
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Etiket yazıp enterlayın"
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] font-semibold text-slate-800 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-350 font-bold text-[11px] rounded-xl cursor-pointer"
                      >
                        Ekle
                      </button>
                    </div>

                    {/* Tags container */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {tags.map((tg, idx) => (
                          <span
                            key={tg}
                            className="bg-indigo-50/50 dark:bg-emerald-950/20 text-indigo-700 dark:text-emerald-400 border border-indigo-100/50 dark:border-emerald-900/30 font-semibold text-[10px] uppercase px-2.5 py-0.5 rounded-lg flex items-center gap-1 cursor-default"
                          >
                            #{tg}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(idx)}
                              className="text-slate-400 hover:text-indigo-650 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content Inputs (Text vs Spreadsheet Table Preview) */}
                  {noteFormat === 'text' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center pr-1 mb-1">
                        <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                          NOT İÇERİĞİ
                        </label>
                        <span className="text-[8px] text-slate-450 dark:text-slate-500 font-mono font-bold">
                          {content.length} Karakter
                        </span>
                      </div>

                      {/* Quick Formatting bar */}
                      <div className="flex items-center gap-1.5 p-1.5 px-2.5 mb-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-inner">
                        <span className="text-[8px] font-extrabold text-slate-400 tracking-wider">HIZLI EKLE:</span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const hrs = String(now.getHours()).padStart(2, '0');
                            const mins = String(now.getMinutes()).padStart(2, '0');
                            insertTextAtCursor(`[${hrs}:${mins}] `);
                          }}
                          className="py-1 px-2 bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-100 dark:border-slate-800 text-[8px] font-bold text-slate-500 rounded flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Clock className="w-2.5 h-2.5 text-indigo-505" />
                          Saat
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n- ')}
                          className="py-1 px-2 bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-100 dark:border-slate-800 text-[8px] font-bold text-slate-500 rounded flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <ListTodo className="w-2.5 h-2.5 text-emerald-555" />
                          Liste
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('\n⭐ Derece: [ /10] ')}
                          className="py-1 px-2 bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-100 dark:border-slate-800 text-[8px] font-bold text-slate-500 rounded flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <TrendingUp className="w-2.5 h-2.5 text-amber-505" />
                          Derece
                        </button>
                      </div>

                      <textarea
                        id="note-content-textarea"
                        required
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Egzersiz değerlerinizi, beslenme kalori hesaplarınızı veya nasıl hissettiğinizi bu alana dökün..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs leading-relaxed font-semibold text-slate-800 dark:text-slate-200 resize-none shadow-inner"
                      />
                    </div>
                  ) : (
                    // Spreadsheet Section
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                          EXCEL TABLOSU DÜZENLEME
                        </label>
                        <span className="text-[8px] text-[#10b981] dark:text-[#10b981] font-mono font-extrabold uppercase">
                          {sheetRows.length} S. x {sheetColumns.length} Süt.
                        </span>
                      </div>

                      {/* Premium card preview with Maximize Button */}
                      <div className="bg-gradient-to-tr from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col items-center justify-center text-center py-7 gap-3.5 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-100/65 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-2xl shadow-inner animate-pulse">
                          田
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200 block">
                            Detaylı Excel Çalışma Alanı
                          </span>
                          <span className="text-[9px] font-semibold text-slate-450 dark:text-slate-500 block max-w-xs leading-normal">
                            Tabloyu formüller, CSV araçları, otomatik istatistikler ve geniş sütunlarla, devasa ekranı kaplayan tam modda düzenleyin.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSheetFullscreen(true)}
                          className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-150/30 dark:shadow-none transition-all transform hover:scale-[1.03]"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-white animate-pulse" />
                          Tabloyu Geniş Ekran Düzenle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-855 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 font-bold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !title.trim() || (noteFormat === 'text' && !content.trim())}
                      className="flex-1 py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-50/10 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                      {editingNoteId ? 'Güncelle' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              // Default view showing neat instructions
              <div className="bg-slate-900/5 dark:bg-slate-900/40 rounded-3xl p-6 border border-dashed border-slate-200 dark:border-slate-800 text-center py-10 shadow-inner">
                <div className="w-12 h-12 bg-white dark:bg-slate-950/60 rounded-2xl flex items-center justify-center text-slate-400 mx-auto border border-slate-100 dark:border-slate-800 shadow-sm mb-3">
                  <FileText className="w-6 h-6 text-slate-400 animate-bounce" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 block mb-1">Yeni Not Yapılandırın</span>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 max-w-xs mx-auto mb-5 font-semibold leading-relaxed">
                  Saniyeler içinde antrenman değerlerinizi veya diyetlerinizi düzenli bir biçimde kaydetmek için yeni bir boş sayfa açın.
                </p>
                <button
                  onClick={() => setIsOpenForm(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-650 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-150/10 dark:shadow-none transition-all transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 text-white" />
                  Boş Sayfa Aç
                </button>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* EXCEL PRO FULLSCREEN SPACIOUS WORKSPACE MODAL                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSheetFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 25 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-7xl h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-[#10b981]" />

              {/* Modal Top Header Bar */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl shadow-inner font-black">
                    田
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Şablon/Program İsmi Girin"
                        className="bg-transparent border-b border-dashed border-slate-350 dark:border-slate-700 focus:border-[#10b981] font-display font-black text-slate-900 dark:text-white text-base md:text-lg focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] font-mono font-black uppercase text-[#10b981] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded">
                        Excel Pro
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                      Kişisel Rutin & Antrenman Tasarlama Stüdyosu — Hücreleri seçip doğrudan düzenleyebilirsiniz.
                    </p>
                  </div>
                </div>

                {/* Toolbar controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* CSV Import Hidden Input */}
                  <label className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>CSV Yükle</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                    />
                  </label>

                  {/* CSV Export */}
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Excel veya Google E-Tablolarda Açmak için CSV Dışa Aktar"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV İndir
                  </button>

                  {/* Save as Template */}
                  <button
                    type="button"
                    onClick={() => setShowSaveTemplateModal(true)}
                    className="py-2 px-3.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-[#10b981] border border-emerald-100/60 dark:border-emerald-900/35 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Şablon Olarak Kaydet
                  </button>

                  {/* Close Fullscreen */}
                  <button
                    type="button"
                    onClick={() => setIsSheetFullscreen(false)}
                    className="p-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer"
                    title="Çalışma Alanını Kapat"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Save custom template sub-dialog modal */}
              {showSaveTemplateModal && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 max-w-md w-full space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="font-display font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider">Tabloyu Şablon Olarak Kaydet</span>
                      <button 
                        type="button"
                        onClick={() => setShowSaveTemplateModal(false)}
                        className="p-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest pl-1">ŞABLON İSMİ</label>
                      <input
                        type="text"
                        value={customTemplateName}
                        onChange={(e) => setCustomTemplateName(e.target.value)}
                        placeholder="Örn: 4 Günlük Hipertrofi Programı"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10b981] text-xs font-bold text-slate-800 dark:text-slate-200"
                        autoFocus
                      />
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block leading-normal pl-1">
                        Bu işlem bu tablonun sütun ve satır yapısını şablon olarak kaydederek diğer boş not oluşturma formlarında tek tıkla yüklemenizi sağlar.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowSaveTemplateModal(false)}
                        className="flex-1 py-2 bg-slate-50 dark:bg-slate-855 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAsCustomTemplate}
                        disabled={!customTemplateName.trim()}
                        className="flex-1 py-2 bg-[#10b981] text-white font-bold text-[10px] uppercase rounded-xl disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        Şablonu Kaydet
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* REALISTIC EXCEL FORMULA BAR */}
              <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/70 dark:bg-slate-950/40 flex items-center gap-3 text-xs">
                <div className="bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 font-mono font-black px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0 shadow-sm">
                  {activeCell 
                    ? `Hücre: ${getColLetter(activeCell.cIdx)}${activeCell.rIdx + 1} [${sheetColumns[activeCell.cIdx]}]` 
                    : 'Hücre Seçin (A1)'}
                </div>
                <div className="text-slate-400 font-bold font-mono">fx |</div>
                <input
                  type="text"
                  value={activeCell ? (sheetRows[activeCell.rIdx][activeCell.cIdx] || '') : ''}
                  onChange={(e) => {
                    if (activeCell) {
                      const newVal = e.target.value;
                      setSheetRows(prev => {
                        const next = prev.map((r, ri) => {
                          if (ri !== activeCell.rIdx) return r;
                          const nextRow = [...r];
                          nextRow[activeCell.cIdx] = newVal;
                          return nextRow;
                        });
                        return next;
                      });
                    }
                  }}
                  disabled={!activeCell}
                  placeholder={activeCell ? "Hücre verisini formül çubuğuyla düzenleyin..." : "Düzenlemek için tablodan bir hücreye tıklayın"}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl font-semibold text-slate-750 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#10b981] shadow-inner"
                />
              </div>

              {/* Spreadsheet Grid Controls & Action tools Ribbon */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSheetRows(prev => [...prev, Array(sheetColumns.length).fill('')]);
                    }}
                    className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-705 text-slate-650 dark:text-slate-300 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    ➕ Alta Satır Ekle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const colName = `Sütun ${sheetColumns.length + 1}`;
                      setSheetColumns(prev => [...prev, colName]);
                      setSheetRows(prev => prev.map(row => [...row, '']));
                    }}
                    className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-705 text-slate-650 dark:text-slate-300 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    ➕ Sağ Sütun Ekle
                  </button>
                  
                  {/* Category Fast Switcher within fullscreen */}
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
                  <span className="text-[8px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">KATEGORİ:</span>
                  <div className="flex gap-1">
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id as any)}
                        className={`px-2 py-1 border text-[9px] font-black uppercase rounded transition-all cursor-pointer ${
                          category === cat.id
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-transparent shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-850 text-slate-450'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear all table cells */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Tüm tablo içeriğini temizlemek istediğinize emin misiniz?")) {
                        setSheetRows([Array(sheetColumns.length).fill('')]);
                        setActiveCell(null);
                      }
                    }}
                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-650 border border-red-100/50 dark:border-red-900/30 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    🧹 Tabloyu Tamamen Boşalt
                  </button>
                </div>
              </div>

              {/* THE SPACIOUS EXCEL GRID TABLE CONTAINER */}
              <div className="flex-1 overflow-auto p-5 scrollbar-thin bg-slate-50/20 dark:bg-slate-950/10">
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden bg-white dark:bg-slate-900">
                  <table className="w-full text-left border-collapse text-xs font-sans min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-450 uppercase sticky top-0 z-20">
                        <th className="p-3 w-16 text-center border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-955">#</th>
                        
                        {sheetColumns.map((col, cIdx) => (
                          <th 
                            key={cIdx} 
                            className="p-3 relative group/header border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-955 min-w-[130px]"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] bg-slate-200 dark:bg-slate-850 px-1 py-0.5 rounded text-slate-500 font-extrabold shrink-0">
                                {getColLetter(cIdx)}
                              </span>
                              <input
                                type="text"
                                value={col}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setSheetColumns(prev => {
                                    const next = [...prev];
                                    next[cIdx] = newVal;
                                    return next;
                                  });
                                }}
                                className="w-full bg-transparent font-extrabold text-slate-700 dark:text-slate-350 border-none outline-none focus:bg-white dark:focus:bg-slate-850 p-1 rounded font-sans tracking-wide uppercase"
                              />
                            </div>

                            {/* Column deletion control */}
                            {sheetColumns.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`'${col}' sütununu silmek tüm verileri temizleyebilir. Emin misiniz?`)) {
                                    setSheetColumns(prev => prev.filter((_, idx) => idx !== cIdx));
                                    setSheetRows(prev => prev.map(row => row.filter((_, idx) => idx !== cIdx)));
                                    setActiveCell(null);
                                  }
                                }}
                                className="absolute top-1/2 -translate-y-1/2 right-1.5 opacity-0 group-hover/header:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-955 rounded cursor-pointer transition-opacity"
                                title="Sütunu Sil"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </th>
                        ))}
                        <th className="p-3 w-16 text-center">Eylemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.map((row, rIdx) => {
                        const isRowActive = activeCell?.rIdx === rIdx;
                        return (
                          <tr 
                            key={rIdx} 
                            className={`border-b border-slate-150 dark:border-slate-850 hover:bg-slate-100/10 dark:hover:bg-slate-850/10 transition-colors even:bg-slate-50/20 dark:even:bg-slate-900/10 group/row ${isRowActive ? 'bg-indigo-50/20 dark:bg-emerald-950/5' : ''}`}
                          >
                            {/* Row coordinate & Order adjustment buttons */}
                            <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-[10px] text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 min-w-[70px]">
                              <div className="flex items-center justify-center gap-1">
                                <span className="font-extrabold shrink-0 w-3">{rIdx + 1}</span>
                                <div className="flex flex-col opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveRow(rIdx, 'up')}
                                    disabled={rIdx === 0}
                                    className="p-0.5 text-slate-400 hover:text-indigo-650 disabled:opacity-30 cursor-pointer"
                                    title="Yukarı Taşı"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveRow(rIdx, 'down')}
                                    disabled={rIdx === sheetRows.length - 1}
                                    className="p-0.5 text-slate-400 hover:text-indigo-650 disabled:opacity-30 cursor-pointer"
                                    title="Aşağı Taşı"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Editable cell columns */}
                            {row.map((cell, cIdx) => {
                              const isCellFocused = activeCell?.rIdx === rIdx && activeCell?.cIdx === cIdx;
                              return (
                                <td 
                                  key={cIdx} 
                                  onClick={() => setActiveCell({ rIdx, cIdx })}
                                  className={`p-1 border-r border-slate-150 dark:border-slate-850/60 min-w-[130px] transition-all relative ${
                                    isCellFocused ? 'ring-2 ring-inset ring-[#10b981] bg-white dark:bg-slate-950 z-10' : ''
                                  }`}
                                >
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) => {
                                      const newVal = e.target.value;
                                      setSheetRows(prev => {
                                        const next = prev.map((r, ri) => {
                                          if (ri !== rIdx) return r;
                                          const nextRow = [...r];
                                          nextRow[cIdx] = newVal;
                                          return nextRow;
                                        });
                                        return next;
                                      });
                                    }}
                                    placeholder="-"
                                    className="w-full bg-transparent border-none outline-none p-2 font-semibold text-slate-850 dark:text-slate-205 focus:bg-transparent"
                                  />
                                </td>
                              );
                            })}

                            {/* Row dynamic deletion & insertion trigger */}
                            <td className="p-1 border-l border-slate-200 dark:border-slate-800 text-center w-16">
                              <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleInsertRow(rIdx, 'below')}
                                  className="p-1 text-[#10b981] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                                  title="Araya Satır Ekle"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                {sheetRows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSheetRows(prev => prev.filter((_, idx) => idx !== rIdx));
                                      setActiveCell(null);
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-955 rounded cursor-pointer"
                                    title="Satırı Sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AUTOMATIC FORMULA STATS CALCULATIONS FOOTER */}
              {activeStats.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-950/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-extrabold shrink-0">
                    <Info className="w-4 h-4 text-[#10b981] animate-pulse" />
                    <span>HACİM & AKILLI ANALİZLER (TOPLAMLAR):</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {activeStats.map((st, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-emerald-105/50 dark:border-emerald-900/20 shadow-sm flex items-center gap-1.5 font-sans"
                      >
                        <span className="text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] tracking-wider border-r border-slate-200 dark:border-slate-800 pr-2">
                          {st.colName}
                        </span>
                        <span className="text-slate-550 dark:text-slate-405 font-bold">
                          Toplam: <strong className="text-slate-900 dark:text-white font-extrabold">{st.total}</strong>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Ort: {st.avg})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Save/Submit Actions footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900 flex items-center justify-end gap-3.5 shadow-md">
                <span className="text-[10px] text-slate-400 font-semibold italic">
                  *Değişikliklerin kalıcı olması için veritabanına kaydetmeyi unutmayın.
                </span>
                <button
                  type="button"
                  onClick={() => setIsSheetFullscreen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-colors"
                >
                  Tabloyu Gizle
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsSheetFullscreen(false);
                    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleSubmit(mockEvent);
                  }}
                  className="px-6 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow shadow-emerald-50 dark:shadow-none cursor-pointer transform hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4 text-white" />
                  Kaydet ve Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* NOTE DETAILS VIEWER MODAL (BÜYÜTÜLMÜŞ DETAY GÖRÜNÜMÜ)                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedViewNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 25 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
            >
              {/* Top border strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-[#10b981] to-blue-500" />

              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getCategoryColor(selectedViewNote.category)} flex items-center gap-1.5 shadow-sm`}>
                    {React.createElement(getCategoryIcon(selectedViewNote.category), { className: "w-3.5 h-3.5" })}
                    {CATEGORIES.find(c => c.id === selectedViewNote.category)?.name || 'Genel'}
                  </span>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-sm md:text-base tracking-tight leading-tight">
                    {selectedViewNote.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Edit directly */}
                  <button
                    onClick={() => {
                      const noteToEdit = selectedViewNote;
                      setSelectedViewNote(null);
                      handleEdit(noteToEdit);
                    }}
                    className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-650 dark:text-emerald-450 font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Düzenle
                  </button>
                  {/* Close */}
                  <button
                    onClick={() => setSelectedViewNote(null)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-lg cursor-pointer transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kayıt Tarihi: {selectedViewNote.date}</span>
                  </div>
                  {selectedViewNote.mood && (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-850 font-semibold text-slate-500">
                      <span>Ruh Hali: {selectedViewNote.mood}</span>
                    </div>
                  )}
                  {selectedViewNote.intensity && (
                    <div className={`px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase ${getIntensityBadge(selectedViewNote.intensity).color}`}>
                      Yoğunluk: {getIntensityBadge(selectedViewNote.intensity).name}
                    </div>
                  )}
                </div>

                {(() => {
                  const isSheet = selectedViewNote.format === 'spreadsheet' || selectedViewNote.content.startsWith('{"isSpreadsheet":true');
                  if (isSheet) {
                    try {
                      const sheetData = JSON.parse(selectedViewNote.content);
                      const stats = getSheetStatistics(sheetData.columns || [], sheetData.rows || []);
                      return (
                        <div className="space-y-4">
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md w-full bg-white dark:bg-slate-950/20">
                            <table className="w-full text-left border-collapse text-xs font-sans min-w-[700px]">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                  <th className="p-3.5 w-12 text-center bg-slate-50 dark:bg-slate-950 font-mono text-[10px]">#</th>
                                  {sheetData.columns.map((col: string, idx: number) => (
                                    <th key={idx} className="p-3.5 border-r border-slate-200/50 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sheetData.rows.map((row: string[], rIdx: number) => (
                                  <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-850/60 hover:bg-slate-100/10 dark:hover:bg-slate-900/10 transition-colors even:bg-slate-50/10 dark:even:bg-slate-900/5">
                                    <td className="p-3.5 border-r border-slate-200/50 dark:border-slate-800/40 text-center font-mono font-extrabold text-[10px] text-slate-400 bg-slate-50/20 dark:bg-slate-950/5">{rIdx + 1}</td>
                                    {row.map((cell: string, cIdx: number) => (
                                      <td key={cIdx} className="p-3.5 text-slate-750 dark:text-slate-300 font-semibold whitespace-normal break-words">{cell || '-'}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Stats calculations in Detail modal */}
                          {stats.length > 0 && (
                            <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/20 rounded-2xl p-4 space-y-2 shadow-sm">
                              <span className="text-[10px] font-mono font-black text-[#10b981] dark:text-emerald-400 uppercase tracking-widest block">📊 SÜTUN VERİ ANALİZLERİ VE HESAPLAMALAR</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {stats.map((st, idx) => (
                                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-3 rounded-xl shadow-sm flex flex-col gap-0.5 text-xs">
                                    <span className="text-slate-400 dark:text-slate-500 font-extrabold uppercase text-[9px] tracking-wide truncate">{st.colName}</span>
                                    <span className="text-slate-800 dark:text-white font-extrabold text-sm mt-0.5">{st.total} <span className="text-[10px] font-medium text-slate-400">(Toplam)</span></span>
                                    <span className="text-slate-450 dark:text-slate-450 font-semibold text-[10px]">Ortalama: {st.avg}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } catch(e) {
                      // fallback
                    }
                  }
                  return (
                    <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 max-h-[450px] overflow-y-auto scrollbar-thin shadow-inner">
                      <p className="text-slate-750 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedViewNote.content}
                      </p>
                    </div>
                  );
                })()}

                {/* Display tags if present */}
                {selectedViewNote.tags && selectedViewNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block py-1.5 pr-2 shrink-0">Etiketler:</span>
                    {selectedViewNote.tags.map(t => (
                      <span
                        key={t}
                        className="text-[10px] font-bold text-indigo-500 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-100 dark:border-slate-850"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedViewNote(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:opacity-90 shadow-md transition-all"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
