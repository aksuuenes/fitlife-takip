import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { storageService } from '../services/storageService';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, EMOP_MOODS, INTENSITIES } from '../lib/noteConstants';
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


import { useNotes } from "../hooks/useNotes";
export default function Notes() {
  const {
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
  } = useNotes();

  return (
    <div className="space-y-6 relative pb-12">
    <div className="space-y-6 relative pb-12">
      {/* Clean Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Notlar & Rutinler
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Çalışmalarınızı, diyetlerinizi ve notlarınızı düzenleyin.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsOpenForm(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yeni Not Ekle
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Toplam Not</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none block">{totalNotesCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Egzersizler</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none block">{workoutSheetsCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Beslenme</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none block">{nutritionCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Şablonlar</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-none block">{savedTemplatesCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start">
        {/* Full width - Notes list & Filters */}
        <div className="col-span-1 space-y-6">
          {/* Clean Command Center (Filters Toolbar) */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Notlarda ara..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 text-slate-800 dark:text-slate-200"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
                      className={`px-3.5 py-2 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {allUniqueTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="text-xs text-slate-500 font-medium">Etiketler:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                      !selectedTag 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent' 
                        : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Tümü
                  </button>
                  {allUniqueTags.map(tg => (
                    <button
                      key={tg}
                      onClick={() => setSelectedTag(tg)}
                      className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-all ${
                        selectedTag === tg 
                          ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent' 
                          : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      #{tg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              <p className="text-sm text-slate-500 mt-4">Notlar yükleniyor...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Not Bulunamadı</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                {searchQuery || selectedCategory !== 'all' || selectedTag
                  ? 'Kriterlerinize uygun not yok.'
                  : 'Henüz not eklemediniz. Yeni bir not oluşturarak başlayın.'}
              </p>
              {(searchQuery || selectedCategory !== 'all' || selectedTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedTag(null);
                  }}
                  className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => {
                  const CatIcon = getCategoryIcon(note.category);
                  const intensityObj = getIntensityBadge(note.intensity || 'Moderate');
                  const isDeleting = deletingId === note.id;

                  return (
                    <motion.div
                      layout
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow relative group/card"
                    >
                      <div>
                        {/* Note Header */}
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <CatIcon className="w-4 h-4" />
                              {CATEGORIES.find(c => c.id === note.category)?.name || 'Genel'}
                            </span>
                            {note.intensity && (
                              <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                                {intensityObj.name.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[11px] text-slate-400">
                            {note.date}
                          </span>
                        </div>

                        {/* Title & Mood */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                            {note.title}
                          </h3>
                          {note.mood && (
                            <span className="text-lg shrink-0" title="Ruh Hali">
                              {note.mood}
                            </span>
                          )}
                        </div>
                        
                        {/* Note Body */}
                        {(() => {
                          const isSheet = note.format === 'spreadsheet' || note.content.startsWith('{"isSpreadsheet":true');
                          if (isSheet) {
                            try {
                              const sheetData = JSON.parse(note.content);
                              const stats = getSheetStatistics(sheetData.columns || [], sheetData.rows || []);
                              
                              return (
                                <div className="space-y-3 mt-2">
                                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg max-h-[140px] overflow-y-auto">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                      <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                                          {sheetData.columns.map((col: string, idx: number) => (
                                            <th key={idx} className="p-2 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">{col}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sheetData.rows.map((row: string[], rIdx: number) => (
                                          <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800/50">
                                            {row.map((cell: string, cIdx: number) => (
                                              <td key={cIdx} className="p-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/50">{cell || '-'}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {stats.length > 0 && (
                                    <div className="flex flex-wrap gap-2 text-[10px]">
                                      {stats.slice(0, 3).map((st, sIdx) => (
                                        <span key={sIdx} className="text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                                          {st.colName}: <strong className="text-slate-700 dark:text-slate-200">{st.total}</strong>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            } catch(e) {
                              // fallback
                            }
                          }
                          return (
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-4 mt-2">
                              {note.content}
                            </p>
                          );
                        })()}

                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {note.tags.map(t => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(t);
                                }}
                                className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(note)}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setSelectedViewNote(note)}
                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Tam Ekran Büyüt"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isDeleting ? (
                          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/40">
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Emin misiniz?</span>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Evet
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="text-xs font-bold text-slate-500 hover:underline"
                            >
                              Hayır
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(note.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Slide-over Form Drawer */}
          {isOpenForm && (
            <div className="fixed inset-0 z-40 flex justify-end">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={resetForm}
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl relative z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
              >
                {/* Form Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-base text-slate-900 dark:text-white">
                      {editingNoteId ? 'Notu Düzenle' : 'Yeni Not'}
                    </span>
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Input Body */}
                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
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

                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !title.trim() || (noteFormat === 'text' && !content.trim())}
                      className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {editingNoteId ? 'Güncelle' : 'Kaydet'}
                    </button>
                  </div>
                </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 md:backdrop-blur- flex items-center justify-center p-4 md:p-6"
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
                <div className="absolute inset-0 bg-slate-900/60 md:backdrop-blur- z-30 flex items-center justify-center p-4">
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
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 md:backdrop-blur- flex items-center justify-center p-4 md:p-6"
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
