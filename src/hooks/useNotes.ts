
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { Note } from '../types';
import { INTENSITIES } from '../lib/noteConstants';
import { Activity, Apple, Heart, StickyNote } from 'lucide-react';

export function useNotes() {
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
  const [category, setCategory] = useState<'workout' | 'nutrition' | 'health' | 'general' | 'medication'>('general');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [mood, setMood] = useState('😊');
  const [intensity, setIntensity] = useState('Moderate');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Auto-fill template for medication category
  useEffect(() => {
    if (category === 'medication' && !content.trim() && !editingNoteId) {
      setContent("### 💊 Günlük İlaç Takibi\n\n**🌅 Sabah**\n- [ ] \n- [ ] \n\n**🌇 Akşam**\n- [ ] \n- [ ] \n");
      setTitle("Günlük İlaçlarım");
      setNoteFormat('text');
    }
  }, [category]);

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

    // True Optimistic UI Update - anında ekranı günceller
    if (editingNoteId) {
      setNotes(prev => prev.map(n => n.id === editingNoteId ? newNote : n));
    } else {
      setNotes(prev => [newNote, ...prev]);
    }
    
    resetForm();
    setSaving(false);

    // Arka plan senkronizasyonu (Background sync)
    try {
      if (user) {
        // await yapmıyoruz, arka planda kendisi kaydetsin
        firebaseService.saveNote(user.uid, profileId, newNote).catch(console.error);
      } else {
        storageService.saveNote(newNote, profileId);
      }
    } catch (err) {
      console.error('Not kaydedilirken bir hata oluştu', err);
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
    
    // True Optimistic UI Update - anında ekranı günceller
    setNotes(prev => prev.filter(n => n.id !== noteId));
    setDeletingId(null);

    // Arka plan senkronizasyonu
    try {
      if (user) {
        firebaseService.deleteNote(user.uid, profileId, noteId).catch(console.error);
      } else {
        storageService.deleteNote(noteId, profileId);
      }
    } catch (err) {
      console.error('Not silinirken hata oluştu', err);
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
      case 'medication': return 'bg-cyan-50/80 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border-cyan-150 dark:border-cyan-800/40';
      default: return 'bg-amber-50/80 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-150 dark:border-amber-800/40';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'workout': return Activity;
      case 'nutrition': return Apple;
      case 'health': return Heart;
      case 'medication': return StickyNote; // the real icon is imported in constants, but fallback here
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


  return {
    notes,
    setNotes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    isOpenForm,
    setIsOpenForm,
    editingNoteId,
    title,
    setTitle,
    category,
    setCategory,
    content,
    setContent,
    date,
    setDate,
    mood,
    setMood,
    intensity,
    setIntensity,
    tags,
    setTags,
    tagInput,
    setTagInput,
    saving,
    noteFormat,
    setNoteFormat,
    sheetColumns,
    setSheetColumns,
    sheetRows,
    setSheetRows,
    customTemplates,
    isSheetFullscreen,
    setIsSheetFullscreen,
    activeCell,
    setActiveCell,
    customTemplateName,
    setCustomTemplateName,
    showSaveTemplateModal,
    setShowSaveTemplateModal,
    selectedViewNote,
    setSelectedViewNote,
    deletingId,
    setDeletingId,
    SHEET_TEMPLATES,
    loadTemplate,
    loadCustomTemplate,
    handleSaveAsCustomTemplate,
    handleDeleteCustomTemplate,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    handleAddTag,
    handleRemoveTag,
    handleKeyPress,
    insertTextAtCursor,
    filteredNotes,
    getCategoryColor,
    getCategoryIcon,
    getIntensityBadge,
    allUniqueTags,
    getColLetter,
    handleMoveRow,
    handleInsertRow,
    handleImportCSV,
    handleExportCSV,
    activeStats,
    totalNotesCount,
    workoutSheetsCount,
    nutritionCount,
    savedTemplatesCount,
    getSheetStatistics
  };
}
