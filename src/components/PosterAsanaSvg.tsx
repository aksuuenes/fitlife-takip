import React from 'react';

export const PosterAsanaSvg: React.FC<{ id: string; className?: string }> = ({ id, className = "w-12 h-12 text-[#1E293B]" }) => {
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