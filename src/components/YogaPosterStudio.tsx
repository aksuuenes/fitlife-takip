import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Check, Plus, Trash2, ArrowUp, ArrowDown, Info, Sliders, Layers, Sparkles, AlertCircle, Dumbbell, Search, X } from 'lucide-react';
import { EXERCISE_DATABASE } from '../constants';
import { Exercise } from '../types';

interface PosterAsana {
  id: string;
  name: string;
  sanskritName: string;
  trName: string;
  category: string;
  difficulty: 'Başlangıç' | 'Orta Seviye' | 'İleri Seviye';
  benefits: string[];
  tips: string;
  image?: string;
}

// Exactly mapping the 20 famous asanas matching the uploaded infographic
const POSTER_ASANAS: PosterAsana[] = [
  {
    id: 'y_easy_sitting',
    name: 'Easy Sukhasana',
    sanskritName: 'Sukhasana',
    trName: 'Kolay Oturuş',
    category: 'Oturma Pozları',
    difficulty: 'Başlangıç',
    benefits: ['Kalçaları açar', 'Omurgayı uzatır', 'Zihni sakinleştirir'],
    tips: 'Omurganızın dikliğini korumak için gerekirse altınıza ince bir blok yerleştirin.',
    image: '/images/y_easy_sitting.png'
  },
  {
    id: 'y_lotus',
    name: 'Lotus Padmasana',
    sanskritName: 'Padmasana',
    trName: 'Lotus Pozu',
    category: 'Oturma Pozları',
    difficulty: 'İleri Seviye',
    benefits: ['Kalçaları derinlemesine esnetir', 'Enerji kanallarını dengeler', 'Duruşu mükemmelleştirir'],
    tips: 'Dizlerinizde hassasiyet varsa zorlamayın, Yarım Lotus duruşunda kalın.',
    image: '/images/y_lotus.png'
  },
  {
    id: 'y_low_lunge',
    name: 'Low Lunge',
    sanskritName: 'Anjaneyasana',
    trName: 'Alçak Fente Duruşu',
    category: 'Kalça Açıcılar',
    difficulty: 'Başlangıç',
    benefits: ['Kalça bükücü kasları açar', 'Kasıkları ve uylukları uyarır', 'Sırtı rahatlatır'],
    tips: 'Arka dizinizi yavaşça yere koyun, kollarınızı kulak hizasından yukarı ve hafifçe arkaya açın.',
    image: '/images/y_low_lunge.png'
  },
  {
    id: '42',
    name: 'Downward Dog Adho Mukha Svanasana',
    sanskritName: 'Adho Mukha Svanasana',
    trName: 'Aşağı Bakan Köpek',
    category: 'Ters Duruşlar',
    difficulty: 'Başlangıç',
    benefits: ['Hamstring ve baldırları uzatır', 'Omurga disk aralarını açar', 'Zihne taze kan pompalar'],
    tips: 'Ellerinizle yeri güçlüce itin, önceliği sırtınızı dümdüz uzatmaya verin, gerekirse dizlerinizi hafif bükün.',
    image: '/images/42.png'
  },
  {
    id: '45',
    name: "Child's Pose Balasana",
    sanskritName: 'Balasana',
    trName: 'Çocuk Pozu',
    category: 'Dinlenmeler',
    difficulty: 'Başlangıç',
    benefits: ['Omurga ve kalçayı rahatlatır', 'Stresi ve yorgunluğu yok eder', 'Solunumu dengeler'],
    tips: 'Alnınızı mata yerleştirin, kollarınızı öne doğru uzatıp pasif, tamamen rahat bir uzamaya bırakın.',
    image: '/images/45.png'
  },
  {
    id: '40',
    name: 'Cobra Bhujangasana',
    sanskritName: 'Bhujangasana',
    trName: 'Kobra Duruşu',
    category: 'Geriye Eğilmeler',
    difficulty: 'Başlangıç',
    benefits: ['Bel ve omurgayı güçlendirir', 'Göğüs kafesini açar', 'Omuz gerginliğini azaltır'],
    tips: 'Omuzları kulaklar listesinden geriye ve aşağıya alın, dirseklerinizi hafifçe bükülü tutabilirsiniz.',
    image: '/images/kobra_durusu.png'
  },
  {
    id: 'y_calf_stretch_block',
    name: 'Calf Stretch on Block',
    sanskritName: 'Calf Stretch on Block',
    trName: 'Blok Üzerinde Baldır Germe',
    category: 'Isınmalar',
    difficulty: 'Başlangıç',
    benefits: ['Aşil tendonu ve baldırları derin uzatır', 'Hamstring gerginliğini azaltır', 'Topuk basış bütünlüğünü kolaylaştırır'],
    tips: 'Bloğun veya basamağın kenarına ayak parmak topunuzla basın, topuğunuzu kontrollü şekilde aşağı sarkıtarak gerilmeyi hissedin.',
    image: '/images/y_calf_stretch_block.png'
  },
  {
    id: 'y_half_forward_fold',
    name: 'Half Forward Fold',
    sanskritName: 'Ardha Uttanasana',
    trName: 'Yarı Yol Açılma',
    category: 'Isınmalar',
    difficulty: 'Başlangıç',
    benefits: ['Omurga disklerinin arasını açıp uzatır', 'Hamstringleri asanaya hazırlar', 'Sırt kaslarını kuvvetlendirir'],
    tips: 'Ellerinizi kaval kemiklerinize yerleştirin, başın tepesinden ileriye, kalçadan geriye uzayarak sırtınızı 90 derece düzleştirin.',
    image: '/images/y_half_forward_fold.png'
  },
  {
    id: 'y_standing_forward_fold',
    name: 'Standing Forward Fold',
    sanskritName: 'Uttanasana',
    trName: 'Ayakta Öne Eğilme',
    category: 'Öne Eğilmeler',
    difficulty: 'Başlangıç',
    benefits: [
      'Hamstring, baldır ve kalça kaslarını derinlemesine uzatır',
      'Omurgayı dekomprese eder ve bel ağrısını azaltır',
      'Zihni sakinleştirir, stresi giderir',
      'Sindirim sistemini uyarır',
      'Karın kasları ve pelvisi güçlendirir'
    ],
    tips: 'Bacakları birleştirin, dizler hafifçe bükük olabilir. Kalçadan katlanarak öne inin, eller ayaklara doğru uzanır. Omurga tabanından uzayarak öne katlayın, başınızı serbest bırakın ve nefes vererek kalçalarınızı yukarı kaldırın.'
  }
];

// Predefined sessions incorporating these posters
const PRESET_CLASSES = [
  {
    id: 'spine_rehab_premium',
    title: 'Derin Omurga & Postür Uyanışı 🌅',
    description: 'Sabah uyanışında omurga mobilitesini artıran, duruşunuzu destekleyen ve beli rahatlatan, sadece premium PNG illüstrasyonlu asana akışı.',
    asanas: [
      'y_easy_sitting',
      '40',
      '45',
      'y_low_lunge',
      '42',
      'y_lotus'
    ],
    durationPerAsana: 45,
    tag: 'Günün Yıldızı',
    color: 'from-orange-500/10 via-amber-500/10 to-yellow-500/15 border-amber-300 text-amber-700 dark:border-amber-850'
  },
  {
    id: 'calf_hamstring_therapy',
    title: 'Hazırlık & Bacak Arkası Terapi Akışı 🐕',
    description: 'Aşağı Bakan Köpek asanasına hazırlık sağlayan, blok yardımıyla baldırları ve kaval kemiğini esneten rahatlatıcı alt vücut seansı.',
    asanas: [
      'y_calf_stretch_block',
      'y_half_forward_fold',
      '42',
      '45'
    ],
    durationPerAsana: 45,
    tag: 'Elit Terapi',
    color: 'from-sky-500/10 via-teal-500/10 to-emerald-500/15 border-sky-300 text-sky-700 dark:border-sky-850'
  }
];

// Miniature SVG poses drawn statically so they display incredibly clean and snappy like the uploaded Pinterest image!
const PosterAsanaSvg: React.FC<{ id: string; className?: string }> = ({ id, className = "w-12 h-12 text-[#1E293B]" }) => {
  switch (id) {
    case 'y_cat_cow':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          <path d="M 28 88 H 38 L 38 68 H 28 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 68 88 H 78 L 74 58 H 68 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 38 68 H 54 C 54 68, 52 58, 38 58 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 54 68 C 54 68, 64 56, 72 58 C 72 58, 64 48, 54 50 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="78" cy="50" r="5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="80" cy="46" r="3.5" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'y_plank':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          <path d="M 12 88 L 18 80 L 22 88 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 18 80 L 46 62 L 40 70 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 46 62 L 74 54 C 74 54, 76 58, 70 60 L 40 70 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="81" cy="51" r="5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="84" cy="48" r="3.5" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 70 58 L 74 88 H 80 L 74 56 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_wrist_rotation':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M 35 60 C 35 60, 30 50, 32 40 C 34 30, 42 28, 42 28 C 42 28, 48 35, 45 48 C 42 60, 35 60, 35 60 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 65 60 C 65 60, 70 50, 68 40 C 66 30, 58 28, 58 28 C 58 28, 52 35, 55 48 C 58 60, 65 60, 65 60 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 24 45 A 16 16 0 1 1 38 58" fill="none" stroke="#FB923C" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
          <path d="M 76 45 A 16 16 0 1 0 62 58" fill="none" stroke="#FB923C" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
          <path d="M 38 58 L 42 58 L 38 54" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 62 58 L 58 58 L 62 54" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_ankle_rotations':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M 40 15 L 45 65 C 45 65, 46 72, 42 75 L 36 78 L 38 85 H 64 C 64 85, 66 78, 62 76 C 58 74, 52 70, 52 65 L 48 15 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="74" r="3" fill="#FB923C" />
          <path d="M 28 74 A 12 12 0 1 1 50 86" fill="none" stroke="#FB923C" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
          <path d="M 50 86 L 46 86 L 50 82" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_calf_stretch_block':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          <rect x="52" y="76" width="30" height="12" rx="2" fill="#F5A623" stroke="currentColor" strokeWidth="2" />
          <path d="M 32 30 L 40 70 L 42 84 C 42 84, 46 85, 48 83 L 56 76 C 56 76, 68 76, 74 76 L 68 64 C 68 64, 54 64, 48 64 L 40 30 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 40 70 L 34 88 H 42 L 44 74 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_half_forward_fold':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          <path d="M 28 88 L 30 76 H 38 L 38 88 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 30 76 L 36 44 H 46 L 38 82 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 36 44 H 74 C 74 44, 76 48, 74 52 H 42 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="81" cy="48" r="5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="84" cy="45" r="3" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 42 46 L 36 68 H 42 L 48 46 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_uddiyana_bandha':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M 25 15 C 25 15, 38 18, 40 30 C 40 30, 48 20, 52 15 L 50 85 C 50 85, 38 82, 35 70 C 32 58, 22 56, 22 45 C 22 34, 25 15, 25 15 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 52 45 Q 36 45 36 36" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 32 40 L 36 36 L 40 40" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="56" y="50" fill="#E11D48" fontSize="8" fontWeight="black" fontFamily="monospace">BANDHA</text>
        </svg>
      );
    case 'y_easy_sitting':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="30" r="7" fill="currentColor" />
          <line x1="50" y1="37" x2="50" y2="68" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 50 68 C 22 68, 18 88, 35 86" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M 50 68 C 78 68, 82 88, 65 86" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <circle cx="32" cy="80" r="3" fill="#FB923C" />
          <circle cx="68" cy="80" r="3" fill="#FB923C" />
        </svg>
      );
    case 'y_lotus':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="28" r="7" fill="currentColor" />
          <line x1="50" y1="35" x2="50" y2="66" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M 50 66 Q 22 60 22 84 Q 50 86 50 80" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M 50 66 Q 78 60 78 84 Q 50 86 50 80" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="18" r="2" fill="#FB923C" />
        </svg>
      );
    case 'y_butterfly':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="30" r="7" fill="currentColor" />
          <line x1="50" y1="37" x2="50" y2="70" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Flapped wings legs */}
          <path d="M 50 70 L 24 75 L 50 85" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50 70 L 76 75 L 50 85" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_hero':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="26" r="6.5" fill="currentColor" />
          <line x1="50" y1="32" x2="50" y2="68" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 50 68 L 50 86 L 36 88" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="50" y1="45" x2="44" y2="65" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'y_backbend':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="38" y1="88" x2="42" y2="58" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M 42 58 Q 56 46 42 32" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="34" cy="26" r="6.5" fill="currentColor" />
          <path d="M 42 45 Q 60 28 64 16" fill="none" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case '43': // Tree Pose
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="20" r="6.5" fill="currentColor" />
          <line x1="50" y1="26" x2="50" y2="58" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Straight supporting leg */}
          <line x1="50" y1="58" x2="50" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Folded tree leg bent up touching in-knee */}
          <path d="M 50 58 L 28 48 L 50 48" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hands above head in namaste */}
          <path d="M 50 26 Q 36 12 50 6" fill="none" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50 26 Q 64 12 50 6" fill="none" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'y_warrior1':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="24" r="6" fill="currentColor" />
          <line x1="50" y1="30" x2="50" y2="54" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Hands high */}
          <line x1="50" y1="30" x2="38" y2="6" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="30" x2="62" y2="6" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          {/* Lunging active front knee */}
          <path d="M 50 54 L 74 58 L 74 88" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Back leg linear extension */}
          <line x1="50" y1="54" x2="22" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
    case '41': // Warrior II
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="25" r="7" fill="currentColor" />
          <line x1="50" y1="32" x2="50" y2="55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          {/* Arms extended on the horizontal axes */}
          <line x1="16" y1="35" x2="84" y2="35" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          {/* Lunged front foot */}
          <path d="M 50 55 L 76 60 L 76 88" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Straight back foot stretch */}
          <line x1="50" y1="55" x2="22" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      );
    case 'y_warrior3':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Plumb support */}
          <line x1="50" y1="52" x2="50" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Horizontal aligned state */}
          <line x1="18" y1="52" x2="82" y2="52" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="22" cy="42" r="6" fill="currentColor" />
          <line x1="18" y1="52" x2="6" y2="52" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'y_dancer':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="48" y1="55" x2="48" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="48" y1="55" x2="30" y2="42" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="26" cy="32" r="6" fill="currentColor" />
          <line x1="30" y1="42" x2="6" y2="40" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
          {/* Beautiful curved grab hold back foot */}
          <path d="M 48 55 Q 70 50 72 26 Q 56 18 45 42" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case 'y_triangle':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="50" y1="50" x2="26" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="74" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Lateral tilted body */}
          <line x1="50" y1="50" x2="32" y2="35" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="26" cy="28" r="6" fill="currentColor" />
          {/* Vertically intersecting arm line */}
          <line x1="32" y1="58" x2="34" y2="12" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case '42': // Downward Dog - Premium Colored Vector Illustration
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Ground mat line */}
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          
          {/* Back Heel & Socks (Off-white) */}
          <path d="M 22 88 L 24 74 C 24 74, 29 70, 31 72 L 31 88 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Legs (Light Teal Leggings) */}
          <path d="M 28 78 L 46 38 C 46 38, 48 36, 52 40 L 35 80 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Arched Torso (Yellow/Orange Top) */}
          <path d="M 46 38 C 48 36, 52 40, 50 44 L 56 60 C 56 60, 52 64, 48 58 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Arms & Hands (Skin & Sleeve) */}
          <path d="M 52 58 L 74 88 H 82 L 56 50 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Head tucked in (Skin) */}
          <circle cx="56" cy="62" r="5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />
          
          {/* Hair Bun (Brown) */}
          <circle cx="59" cy="65" r="3.5" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'y_three_legged_dog': // Three-Legged Downward Dog - Premium Colored Vector
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Ground mat line */}
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          {/* Grounded Foot Off-white */}
          <path d="M 24 88 L 26 76 C 26 76, 31 72, 33 74 L 33 88 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Grounded Leg Teal leggings */}
          <path d="M 30 78 L 46 38 L 40 82 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Raised Leg extended high Teal Leggings */}
          <path d="M 46 38 L 20 10 L 26 8 L 49 32 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arched Torso Orange Top */}
          <path d="M 46 38 C 48 36, 52 40, 50 44 L 56 60 C 56 60, 52 64, 48 58 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arms & Hands */}
          <path d="M 52 58 L 74 88 H 82 L 56 50 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Head tucked in */}
          <circle cx="56" cy="62" r="5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />
          {/* Hair Bun */}
          <circle cx="59" cy="65" r="3.5" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'y_dog_knees_bent': // Downward Dog Knees Bent - Premium Colored Vector
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          {/* Grounded Foot closer Off-white */}
          <path d="M 32 88 L 34 76 C 34 76, 38 72, 40 74 L 40 88 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bent Leg (knee at 42, 68) Teal leggings */}
          <path d="M 34 82 L 40 68 L 46 38 Q 44 42 36 78 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Torso Orange Top */}
          <path d="M 46 38 C 48 36, 52 40, 50 44 L 56 60 Q 52 64 48 58 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arms & Hands */}
          <path d="M 52 58 L 74 88 H 82 L 56 50 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Head tucked in */}
          <circle cx="56" cy="62" r="5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />
          {/* Hair Bun */}
          <circle cx="59" cy="65" r="3.5" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'y_dog_one_knee_bent': // Downward Dog One Knee Bent (Pedaling) - Premium Colored Vector
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          {/* Straight leg foot Off-white */}
          <path d="M 22 88 L 24 74 C 24 74, 29 70, 31 72 L 31 88 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Straight leg Teal Leggings */}
          <path d="M 28 78 L 46 38 L 35 80 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bent leg (knee at 36, 68, foot at 32, 88) - Offset slightly behind in lighter shade */}
          <path d="M 30 82 L 36 68 L 46 38 Q 42 42 32 78 Z" fill="#93E1ED" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          {/* Torso Orange Top */}
          <path d="M 46 38 C 48 36, 52 40, 50 44 L 56 60 Q 52 64 48 58 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Arms & Hands */}
          <path d="M 52 58 L 74 88 H 82 L 56 50 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Head tucked in */}
          <circle cx="56" cy="62" r="5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />
          {/* Hair Bun */}
          <circle cx="59" cy="65" r="3.5" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'y_bow':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Bow on stomach */}
          <path d="M 22 58 Q 50 92 78 54" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <circle cx="18" cy="44" r="7" fill="currentColor" />
          <path d="M 78 54 Q 92 34 72 22" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M 32 62 Q 58 40 72 22" fill="none" stroke="#FB923C" strokeWidth="4.2" strokeLinecap="round" />
        </svg>
      );
    case '40': // Cobra Pose - Premium Colored Vector Illustration
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Ground mat line */}
          <line x1="5" y1="86" x2="95" y2="86" stroke="currentColor" strokeWidth="2.5" opacity="0.3" strokeDasharray="3,3" />
          
          {/* Feet/Skin */}
          <path d="M 12 80 C 10 78, 14 74, 18 74 C 20 74, 22 78, 24 78 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Flat legs (Pants/Leggings in Pink) */}
          <path d="M 12 80 C 18 82, 28 82, 38 82 C 48 81, 58 78, 64 74 C 66 70, 68 62, 68 56 C 58 58, 48 64, 32 72 Z" fill="#F472B6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Arched Torso (Long-Sleeve Shirt in Light Blue) */}
          <path d="M 68 56 C 68 46, 72 38, 76 34 C 77 35, 78 38, 77 44 C 76 50, 74 58, 68 62 Z" fill="#7DD3FC" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Neck and Head (Skin) */}
          <path d="M 76 34 C 76 30, 77 28, 78 26 C 79 26, 81 26, 81 22 C 81 18, 76 18, 76 20 C 76 22, 75 24, 74 26 Z" fill="#FFEDD5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Hair Bun (Brown) */}
          <circle cx="73" cy="18" r="4.5" fill="#854D08" stroke="currentColor" strokeWidth="1.8" />
          
          {/* Grounding Supporting Arm */}
          <path d="M 72 38 L 74 60 L 74 86" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Grounding Hand */}
          <path d="M 70 86 H 78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'y_fishking':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="24" r="6.5" fill="currentColor" />
          <line x1="50" y1="30" x2="50" y2="68" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Crossed wrap legs */}
          <path d="M 50 68 Q 24 72 32 88" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 50 68 C 72 48, 78 88, 56 86" fill="none" stroke="#FB923C" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 50 38 Q 70 46 58 74" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'y_forwardfold':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="62" y1="88" x2="62" y2="50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M 62 50 C 56 38, 44 46, 44 80" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="50" y1="58" x2="47" y2="84" stroke="#FB923C" strokeWidth="4.2" strokeLinecap="round" />
          <circle cx="44" cy="80" r="6.5" fill="currentColor" />
        </svg>
      );
    case '44': // Cat Cow
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Tabletop arch view */}
          <path d="M 24 84 L 24 62 C 24 62, 44 48, 70 56 L 70 84" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="78" cy="48" r="6.5" fill="currentColor" />
        </svg>
      );
    case 'y_boat':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="68" r="4.5" fill="#F43F5E" />
          {/* Boat V shape */}
          <line x1="50" y1="68" x2="24" y2="38" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="50" y1="68" x2="78" y2="34" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="19" cy="30" r="6.5" fill="currentColor" />
          <line x1="32" y1="46" x2="66" y2="46" stroke="#FB923C" strokeWidth="4.2" strokeLinecap="round" />
        </svg>
      );
    case 'y_crow':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Arm posts */}
          <line x1="42" y1="66" x2="42" y2="88" stroke="#FB923C" strokeWidth="5" strokeLinecap="round" />
          <line x1="58" y1="66" x2="58" y2="88" stroke="#FB923C" strokeWidth="5" strokeLinecap="round" />
          {/* Crouched crow */}
          <path d="M 28 52 C 40 34, 68 32, 76 56" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <path d="M 76 56 L 54 52 L 64 68" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="52" r="6" fill="currentColor" />
        </svg>
      );
    case '45': // Child's Pose
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Knees tucked, body flat on floor extending forward */}
          <path d="M 24 86 H 82" stroke="rgba(71,85,105,0.4)" strokeWidth="2" strokeDasharray="3,3" />
          <path d="M 28 84 C 28 72, 44 64, 66 64 C 76 64, 86 78, 86 84" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="44" cy="64" r="5" fill="currentColor" />
          <line x1="44" y1="64" x2="16" y2="84" stroke="#FB923C" strokeWidth="4.2" strokeLinecap="round" />
        </svg>
      );
    case 'y_cow': // Cow Pose
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Tabletop setup with dipped back and chin lifted */}
          <path d="M 24 84 L 24 62 C 24 62, 44 68, 70 60 L 70 84" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="78" cy="46" r="6.5" fill="currentColor" />
          <path d="M 24 62 Q 20 54 18 56" fill="none" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'y_mountain': // Mountain Pose
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="22" r="6.5" fill="currentColor" />
          <line x1="50" y1="28.5" x2="50" y2="65" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="47" y1="65" x2="44" y2="88" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <line x1="53" y1="65" x2="56" y2="88" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <line x1="50" y1="36" x2="38" y2="10" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="36" x2="62" y2="10" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'y_chair': // Chair Pose
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="42" cy="24" r="6.5" fill="currentColor" />
          <line x1="42" y1="30.5" x2="44" y2="54" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 44 54 L 62 64 L 56 86" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="42" y1="38" x2="58" y2="10" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'y_runner_lunge': // Runner's Lunge
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M 76 86 L 76 56 L 46 54 L 18 84" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="44" cy="46" r="6.5" fill="currentColor" />
          <line x1="46" y1="54" x2="72" y2="86" stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'y_revolved_side_angle': // Revolved Side Angle
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M 72 86 L 72 58 L 48 56 L 20 84" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="46" cy="48" r="6.5" fill="currentColor" />
          <path d="M 48 56 Q 52 44 44 34" fill="none" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
          <path d="M 48 56 Q 60 52 52 42" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'y_low_plank': // Low Plank
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="16" y1="84" x2="84" y2="84" stroke="rgba(71,85,105,0.3)" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="18" y1="72" x2="80" y2="72" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
          <circle cx="84" cy="65" r="6" fill="currentColor" />
          <path d="M 74 72 L 68 84 L 62 84" fill="none" stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_upward_dog': // Upward Dog
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M 12 84 L 38 82 Q 62 76 72 44" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <circle cx="78" cy="34" r="6.5" fill="currentColor" />
          <line x1="68" y1="52" x2="68" y2="84" stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'y_low_lunge': // Low Lunge
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Floor indicator line */}
          <line x1="10" y1="84" x2="90" y2="84" stroke="rgba(71,85,105,0.2)" strokeWidth="1.5" strokeDasharray="3,3" />
          {/* Back leg completely on the ground, front leg bent in deep lunge */}
          <path d="M 16 84 L 42 82 Q 48 64 74 62 L 74 84" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Torso gently arching backwards and up */}
          <path d="M 48 64 Q 45 44 47 32" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          {/* Head looking slightly upwards */}
          <circle cx="49" cy="24" r="6.5" fill="currentColor" />
          {/* Arms extended high above the head, touching palms, just like in the photo */}
          <path d="M 47 36 Q 54 18 57 6" fill="none" stroke="#FB923C" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'y_reverse_warrior': // Reverse Warrior
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="48" cy="22" r="6.5" fill="currentColor" />
          <line x1="48" y1="28.5" x2="48" y2="54" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 48 54 L 72 58 L 72 88" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="48" y1="54" x2="22" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 48 35 Q 32 30 22 45" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M 48 35 Q 58 18 42 6" fill="none" stroke="#FB923C" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'y_extended_side_angle': // Extended Side Angle
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <path d="M 48 54 L 74 58 L 74 88" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="48" y1="54" x2="20" y2="88" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="48" y1="54" x2="68" y2="40" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="72" cy="34" r="6.5" fill="currentColor" />
          <line x1="62" y1="44" x2="72" y2="58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <line x1="58" y1="46" x2="90" y2="24" stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'y_pigeon': // Pigeon Pose
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="16" y1="84" x2="84" y2="84" stroke="rgba(71,85,105,0.3)" strokeWidth="2" strokeDasharray="3,3" />
          <path d="M 22 84 L 54 84 Q 48 64 68 56" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="72" cy="46" r="6.5" fill="currentColor" />
          <line x1="68" y1="56" x2="52" y2="84" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="68" y1="56" x2="74" y2="84" stroke="#FB923C" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'y_savasana': // Corpse Pose Savasana
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <line x1="16" y1="84" x2="84" y2="84" stroke="rgba(71,85,105,0.3)" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="20" y1="78" x2="80" y2="78" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="84" cy="74" r="5.5" fill="currentColor" />
          <line x1="45" y1="82" x2="65" y2="82" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'y_standing_forward_fold': // Standing Forward Fold - Uttanasana - Clean Side View (inverted-U)
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Ground mat line */}
          <line x1="5" y1="88" x2="95" y2="88" stroke="currentColor" strokeWidth="2" opacity="0.25" strokeDasharray="3,3" />

          {/* === RIGHT COLUMN: Straight legs going up === */}

          {/* Foot side-view (Off-white) - extends forward (left in frame) */}
          <path d="M 52 88 L 70 88 L 70 85 Q 64 83 52 85 Z" fill="#FAF8F5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Legs (Teal Leggings) - straight vertical pillar */}
          <path d="M 56 88 L 56 26 L 64 26 L 64 88 Z" fill="#7EC4CF" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* === TOP ARCH: Hip fold connecting legs to torso === */}
          {/* The classic fold-over at the hip crease — curves from leg-top to torso-top */}
          <path d="M 56 26 C 52 14 36 14 36 26 L 44 26 C 44 18 54 18 58 26 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* === LEFT COLUMN: Torso hanging straight down from hips === */}
          <path d="M 36 26 L 36 70 L 44 70 L 44 26 Z" fill="#F5A623" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* === HEAD at bottom — freely hanging, gaze toward feet === */}
          <circle cx="40" cy="70" r="6.5" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.8" />

          {/* Hair bun (on chin-side since inverted — left side of head) */}
          <circle cx="33" cy="73" r="3.5" fill="#854D08" stroke="currentColor" strokeWidth="1.5" />

          {/* === ARMS: reaching from shoulder area diagonally toward feet === */}
          {/* Front arm */}
          <path d="M 40 50 Q 50 66 58 84" fill="none" stroke="#FFEDD5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Back arm (slightly offset) */}
          <path d="M 44 48 Q 54 64 62 82" fill="none" stroke="#FFEDD5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />

          {/* Hands near feet */}
          <ellipse cx="59" cy="85" rx="3.5" ry="2" fill="#FFEDD5" stroke="currentColor" strokeWidth="1.5" />

          {/* Navel / engaged core dot */}
          <circle cx="40" cy="48" r="2" fill="#FB923C" opacity="0.85" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      );
  }
};

export default function YogaPosterStudio() {
  const navigate = useNavigate();
  
  // Custom states for custom yoga lesson builder
  const [selectedAsanas, setSelectedAsanas] = useState<string[]>(['45', 'y_easy_sitting', 'y_lotus', '42', 'y_low_lunge', '40', 'y_calf_stretch_block', 'y_half_forward_fold']);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('spine_rehab_premium');
  const [holdDuration, setHoldDuration] = useState<number>(45); // in seconds
  const [activeTab, setActiveTab] = useState<'poster' | 'presets' | 'custom_builder'>('poster');
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>('42');
  const [viewMode, setViewMode] = useState<'model' | 'photo'>('model');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  const selectedDetailAsana = POSTER_ASANAS.find(a => a.id === selectedDetailId);

  // Toggle asana in custom lesson sequence
  const handleToggleAsana = (id: string) => {
    setSelectedPresetId(''); // clear preset if modified manually
    setSelectedAsanas(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) {
          alert('Yoga seansınız en az 2 asana içermelidir.');
          return prev;
        }
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  // Reorder custom asanas
  const handleMoveAsana = (index: number, direction: 'up' | 'down') => {
    setSelectedPresetId('');
    setSelectedAsanas(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleApplyPreset = (preset: typeof PRESET_CLASSES[0]) => {
    setSelectedPresetId(preset.id);
    setSelectedAsanas(preset.asanas);
    setHoldDuration(preset.durationPerAsana);
  };

  // Build the complete session list by mapping user asana ids to real exercise structs in standard datastore
  const handleLaunchYogaSeance = () => {
    const fullSequence = selectedAsanas.map(id => {
      const match = EXERCISE_DATABASE.find(ex => ex.id === id);
      if (match) {
        return {
          ...match,
          duration: holdDuration,
          reps: `${holdDuration} Sn Tut`
        };
      }
      return null;
    }).filter((x): x is Exercise => !!x);

    if (fullSequence.length === 0) {
      alert('Seçili asana kaydı bulunamadı.');
      return;
    }

    const titlePreset = PRESET_CLASSES.find(p => p.id === selectedPresetId)?.title || "Özel Özgür Yoga Akışınız";

    sessionStorage.setItem('current_workout', JSON.stringify(fullSequence));
    sessionStorage.setItem('workout_params', JSON.stringify({
      goal: 'get_fit',
      level: 'intermediate',
      energy: selectedAsanas.length > 6 ? 'high' : 'medium',
      title: titlePreset
    }));

    navigate('/workout-active');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 sm:px-4">
      {/* Intro section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-[28px] border border-emerald-500/10">
        <div>
          <span className="px-3 py-1 bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-lg tracking-widest border border-emerald-500/30">
            YOGA ASANAS REHBERİ
          </span>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            Kuşbaksı Yoga Stüdyosu 🧘‍♀️
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1 leading-relaxed max-w-xl">
            Aşağıdaki asana haritası, paylaştığınız posterdeki asanaların bire bir anatomik simülasyonunu içerir. 
            Kartlara tıklayarak detaylı duruş rehberine ulaşabilir veya kendi dersinizi tasarlayabilirsiniz.
          </p>
        </div>
        
        {/* Active Flow Controls */}
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setActiveTab('poster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'poster' 
                ? 'bg-slate-900 dark:bg-slate-150 text-white dark:text-slate-900' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
            }`}
          >
            🗺️ İnteraktif Poster
          </button>
          <button 
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'presets' 
                ? 'bg-slate-900 dark:bg-slate-150 text-white dark:text-slate-900' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
            }`}
          >
            🎓 Hazır Seanslar
          </button>
          <button 
            onClick={() => setActiveTab('custom_builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'custom_builder' 
                ? 'bg-slate-900 dark:bg-slate-150 text-white dark:text-slate-900' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
            }`}
          >
            🛠️ Özel Ders Tasarla
            <span className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-520 bg-emerald-500 text-[8px] font-bold text-white shadow-sm animate-pulse">
              {selectedAsanas.length}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COMPONENT: Selected View */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* POSTER VIEW MODE */}
            {activeTab === 'poster' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Visual Beige/Sandy Canvas Poster Card (Styled exactly like Pinterest layout) */}
                <div className="bg-[#FAF8F5] dark:bg-slate-950/85 p-6 rounded-[36px] border border-[#ECE9E4] dark:border-slate-800 shadow-xl relative overflow-hidden">
                  
                  {/* Watermark Poster Header */}
                  <div className="text-center mb-8 border-b border-[#ECE9E4] dark:border-slate-800 pb-6">
                    <h2 className="text-4xl font-display font-extrabold text-[#475569] dark:text-slate-300 tracking-wider">
                      YOGA ASANAS
                    </h2>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      ÖZEL GERÇEK ZAMANLI HİZALAMA VE ASANA KILAVUZU
                    </p>
                  </div>

                  {/* 20 Asanas Poster Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {POSTER_ASANAS.map((asana) => {
                      const isSelected = selectedAsanas.includes(asana.id);
                      const isDetailActive = selectedDetailId === asana.id;
                      return (
                        <div
                          key={asana.id}
                          className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            isDetailActive 
                              ? 'border-emerald-555 border-emerald-500 bg-white dark:bg-slate-900 shadow-lg scale-[1.03] z-10' 
                              : isSelected
                                ? 'border-emerald-600/35 bg-emerald-500/5 hover:border-emerald-500'
                                : 'border-[#ECE9E4]/80 dark:border-slate-900 bg-[#FAF8F5]/50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedDetailId(asana.id)}
                        >
                          {/* Selected marker Badge */}
                          {isSelected && (
                            <span className="absolute top-2 right-2 p-0.5 bg-emerald-500 text-white rounded-full">
                              <Check className="w-2.5 h-2.5 stroke-[4]" />
                            </span>
                          )}

                          {/* Quick selection plus button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleAsana(asana.id);
                            }}
                            className={`absolute top-2 left-2 p-1 rounded-md transition-colors ${
                              isSelected 
                                ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                            title={isSelected ? "Dersten Çıkar" : "Derse Ekle"}
                          >
                            <Plus className={`w-2.5 h-2.5 transition-transform ${isSelected ? 'rotate-45 text-rose-500' : ''}`} />
                          </button>

                          {/* Simplified vector silhouette */}
                          <div className={`my-4 flex items-center justify-center p-2 rounded-xl bg-[#F6F3EE] dark:bg-slate-900 w-16 h-16 transition-colors duration-250 ${
                            isDetailActive ? 'bg-emerald-500/10' : ''
                          }`}>
                            {asana.image ? (
                              <img
                                src={asana.image}
                                alt={asana.trName}
                                className="w-full h-full object-contain rounded-lg"
                                style={{ imageRendering: '-webkit-optimize-contrast' }}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <PosterAsanaSvg id={asana.id} className="w-12 h-12 text-[#2D3748] dark:text-emerald-400" />
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="text-center w-full mt-2">
                            <span className="text-[7.5px] uppercase font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block truncate">
                              {asana.sanskritName}
                            </span>
                            <span className="text-[10px] font-display font-black text-slate-800 dark:text-slate-200 mt-1 block truncate">
                              {asana.trName}
                            </span>
                            <span className={`text-[7px] font-sans font-bold px-1.5 py-0.5 rounded-full inline-block mt-1.5 uppercase ${
                              asana.difficulty === 'Başlangıç' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : asana.difficulty === 'Orta Seviye'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}>
                              {asana.difficulty}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PRESET CLASSES VIEW MODE */}
            {activeTab === 'presets' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6"
              >
                {PRESET_CLASSES.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-6 rounded-[28px] border-2 bg-white dark:bg-slate-900 transition-all flex flex-col md:flex-row gap-6 justify-between items-start md:items-center ${
                      selectedPresetId === preset.id 
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-705'
                    }`}
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-gradient-to-r ${preset.color}`}>
                          {preset.tag}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {preset.asanas.length} Asana • {preset.durationPerAsana * preset.asanas.length / 60} Dk Seans
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                          {preset.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      {/* Display row of mini-SVGs in horizontal row */}
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-wrap gap-2.5">
                        {preset.asanas.map((id, index) => {
                          const name = POSTER_ASANAS.find(a => a.id === id)?.trName || '';
                          return (
                            <div 
                              key={index} 
                              className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 p-1.5 rounded-lg text-xs"
                              title={name}
                            >
                              <PosterAsanaSvg id={id} className="w-5 h-5 text-emerald-500" />
                              <span className="text-[9px] font-display font-bold text-slate-700 dark:text-slate-300">
                                {index + 1}. {name.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                      <button
                        onClick={() => handleApplyPreset(preset)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                          selectedPresetId === preset.id
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {selectedPresetId === preset.id ? '✓ Seçildi' : 'Seansı Şablon Al'}
                      </button>
                      <button
                        onClick={() => {
                          handleApplyPreset(preset);
                          setTimeout(() => {
                            handleLaunchYogaSeance();
                          }, 100);
                        }}
                        className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-slate-950 fill-current" /> Seansı Başlat
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* CUSTOM LESSON BUILDER LIST VIEW */}
            {activeTab === 'custom_builder' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-6"
              >
                {/* Main spacious Custom Sequence Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-md flex flex-col justify-between min-h-[480px]">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-6 gap-3">
                      <div>
                        <h3 className="font-display font-black text-slate-900 dark:text-white text-lg">
                          Sizin Özel Asana Akışınız
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Aşağıdaki sırayla asanalarınız oynatılacaktır. Yön tuşlarıyla sırayı değiştirebilirsiniz.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg border border-emerald-200/40">
                          {selectedAsanas.length} ASANA SEÇİLİ
                        </span>
                        <button
                          onClick={() => setIsAddPanelOpen(true)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Yeni Hareket Ekle
                        </button>
                      </div>
                    </div>

                    {selectedAsanas.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                        <Sparkles className="mx-auto h-10 w-10 text-emerald-400/60 mb-3 animate-pulse" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Listeniz Henüz Boş</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Özel dersinize poz eklemek için yukarıdaki <strong>"Yeni Hareket Ekle"</strong> butonuna basarak paneli açın.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50 dark:divide-slate-850 max-h-[380px] overflow-y-auto pr-1">
                        {selectedAsanas.map((asanaId, index) => {
                          const details = POSTER_ASANAS.find(a => a.id === asanaId);
                          if (!details) return null;
                          return (
                            <div key={`${asanaId}-${index}`} className="py-3.5 flex items-center justify-between gap-4 group">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span className="font-mono text-xs font-black text-slate-300 dark:text-slate-700 w-5 text-center">
                                  {index + 1}
                                </span>
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-850 p-1 flex-shrink-0" onClick={() => setSelectedDetailId(asanaId)}>
                                  {details.image ? (
                                    <img src={details.image} alt={details.trName} className="w-full h-full object-contain rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-transform" />
                                  ) : (
                                    <PosterAsanaSvg id={asanaId} className="w-8 h-8 text-emerald-600 dark:text-emerald-400 cursor-pointer" />
                                  )}
                                </div>
                                <div className="min-w-0" onClick={() => setSelectedDetailId(asanaId)}>
                                  <div className="text-xs font-display font-black text-slate-800 dark:text-white flex items-center gap-1.5 leading-tight cursor-pointer hover:text-emerald-500 transition-colors">
                                    {details.trName}
                                    <span className="text-[9px] font-mono text-slate-400 truncate">({details.sanskritName})</span>
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{details.category}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">{details.difficulty}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Controls to organize sequence */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  disabled={index === 0}
                                  onClick={() => handleMoveAsana(index, 'up')}
                                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all"
                                  title="Yukarı Taşı"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button
                                  disabled={index === selectedAsanas.length - 1}
                                  onClick={() => handleMoveAsana(index, 'down')}
                                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-all"
                                  title="Aşağı Taşı"
                                >
                                  <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button
                                  onClick={() => handleToggleAsana(asanaId)}
                                  className="p-2 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-slate-400 rounded-lg transition-all ml-1"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Dynamic control for holds */}
                    <div className="mt-6 pt-6 border-t border-slate-150/50 dark:border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">POZ TUTUŞ SÜRESİ</span>
                        <div className="flex gap-2 mt-1.5">
                          {[30, 45, 60, 90].map((dur) => (
                            <button
                              key={dur}
                              onClick={() => setHoldDuration(dur)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                holdDuration === dur 
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold' 
                                  : 'bg-slate-100 dark:bg-slate-850 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {dur} Sn
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-right md:text-left">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">TOPLAM SEANS ANALİZİ</span>
                        <div className="text-sm font-display font-black text-slate-800 dark:text-slate-350 mt-1">
                          ⏱️ {(holdDuration * selectedAsanas.length / 60).toFixed(1)} Dakika
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleLaunchYogaSeance}
                        disabled={selectedAsanas.length === 0}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950 fill-current animate-bounce" />
                        Sizin Özel Akışınızı Başlat
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COMPONENT: Visual detailed card of the selected pose (Detailed inspector) */}
        <div className="lg:col-span-4 bg-[#FAF8F5]/50 dark:bg-slate-900 border border-[#ECE9E4] dark:border-slate-800 p-6 rounded-[28px] shadow-sm sticky top-6">
          <h3 className="font-mono text-[9px] text-[#A0AEC0] dark:text-slate-400 uppercase tracking-widest font-black flex items-center gap-1.5 select-none mb-4">
            <Info className="w-3 h-3 text-emerald-500" /> Detaylı Asana Analizi
          </h3>

          {selectedDetailAsana ? (
            <div className="space-y-6">
              {/* Giant visual demonstration */}
              <div className="bg-slate-950 rounded-[24px] p-6 border border-slate-900 shadow-inner relative h-56 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_75%)] pointer-events-none" />
                
                {selectedDetailAsana.image ? (
                  <>
                    <div className="absolute top-3 left-4 text-[8px] uppercase font-mono tracking-widest text-emerald-555 text-emerald-400 font-bold">
                      100% GÖRSEL BÜTÜNLÜK (PNG)
                    </div>
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <img
                        src={selectedDetailAsana.image}
                        alt={selectedDetailAsana.trName}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute top-3 left-4 text-[8px] uppercase font-mono tracking-widest text-emerald-555 text-emerald-400 font-bold">
                      BİYOMEKANİK HİZALAMA
                    </div>
                    
                    {/* Visual miniature representation inside center */}
                    <div className="w-36 h-36 flex items-center justify-center">
                      <PosterAsanaSvg id={selectedDetailAsana.id} className="w-28 h-28 text-white animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#B2F5EA] text-emerald-600 dark:text-emerald-400 font-bold block">
                  {selectedDetailAsana.sanskritName}
                </span>
                <h4 className="text-xl font-display font-black text-[#1D2D44] dark:text-slate-100 tracking-tight mt-1">
                  {selectedDetailAsana.trName}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase">
                    {selectedDetailAsana.category}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-lg uppercase ${
                    selectedDetailAsana.difficulty === 'Başlangıç' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {selectedDetailAsana.difficulty}
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block tracking-wider">Temel Faydaları</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedDetailAsana.benefits.map((ben, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350 font-medium">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Tip */}
              <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 space-y-1.5">
                <span className="text-[9.5px] font-mono font-extrabold text-amber-500 tracking-wider uppercase flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> EĞİTMEN TAVSİYESİ
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                  "{selectedDetailAsana.tips}"
                </p>
              </div>

              {/* Quick Lesson Selection Toggle in detail card */}
              <div className="pt-2">
                <button
                  onClick={() => handleToggleAsana(selectedDetailAsana.id)}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedAsanas.includes(selectedDetailAsana.id)
                      ? 'bg-red-50 hover:bg-red-105 text-red-600 border border-red-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                  }`}
                >
                  {selectedAsanas.includes(selectedDetailAsana.id) ? (
                    <>Dersten Çıkar (-)</>
                  ) : (
                    <>Özel Yoga Seansına Ekle (+)</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Sparkles className="mx-auto h-8 w-8 mb-2 text-emerald-400 opacity-60 animate-pulse" />
              <p className="text-sm font-semibold">Gelişmiş Değerlendirme</p>
              <p className="text-xs text-emerald-400/60 mt-1 max-w-[200px] mx-auto">Kartlardan birine tıklayarak asana kılavuzunu inceleyebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Side Drawer Panel for Adding Movements */}
      <AnimatePresence>
        {isAddPanelOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPanelOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500 stroke-[3]" /> Asana Ekleme Paneli
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Özel ders akışınıza eklemek istediğiniz premium pozları seçin.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPanelOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search & Filters */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-900 space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Asana ara (Türkçe veya Sanskrit)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-2.5 text-slate-450 hover:text-slate-650 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {/* Category Filtering Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['all', 'Isınmalar', 'Oturma Pozları', 'Kalça Açıcılar', 'Ters Duruşlar', 'Geriye Eğilmeler', 'Dinlenmeler'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-[9px] font-black rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm font-extrabold'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-450 border border-slate-150 dark:border-slate-880 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'all' ? '🔍 Tümü' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Pose Card List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin">
                {POSTER_ASANAS.filter(asana => {
                  const matchesSearch = asana.trName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        asana.sanskritName.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCategory = selectedCategory === 'all' || asana.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                }).map((asana) => {
                  const isSelected = selectedAsanas.includes(asana.id);
                  return (
                    <div
                      key={asana.id}
                      onClick={() => handleToggleAsana(asana.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm'
                          : 'border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-850 p-1 flex-shrink-0">
                          {asana.image ? (
                            <img src={asana.image} alt={asana.trName} className="w-full h-full object-contain rounded-lg shadow-sm" />
                          ) : (
                            <PosterAsanaSvg id={asana.id} className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-display font-black text-slate-800 dark:text-slate-100 leading-tight truncate">
                            {asana.trName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {asana.sanskritName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[8px] font-sans font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full inline-block uppercase">
                              {asana.category}
                            </span>
                            <span className={`text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-full inline-block uppercase ${
                              asana.difficulty === 'Başlangıç' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : asana.difficulty === 'Orta Seviye'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}>
                              {asana.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md scale-110'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-3">
                <button
                  onClick={() => setSelectedAsanas([])}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setIsAddPanelOpen(false)}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all text-center cursor-pointer"
                >
                  ✓ Seçimi Tamamla ({selectedAsanas.length} Poz)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
