// Badge System Definitions for Ibadah Tracker

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon
  category: BadgeCategory;
  requirement: BadgeRequirement;
  rarity: BadgeRarity;
  order: number; // for display ordering
}

export type BadgeCategory = 
  | 'shalat'
  | 'dzikir'
  | 'consistency'
  | 'milestone'
  | 'special';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeRequirement {
  type: 'streak' | 'total' | 'count' | 'special';
  target: string; // e.g., 'tahajud', 'subuh', 'istigfar'
  value: number; // e.g., 7 days, 100 times
  condition?: string; // additional condition if needed
}

export interface UserBadge {
  badge_id: string;
  user_id: string;
  earned_at: Date;
  progress: number; // current progress (0-100 or actual count)
  is_earned: boolean;
}

// All available badges
export const BADGES: Badge[] = [
  // === SHALAT BADGES ===
  {
    id: 'subuh_7',
    name: 'Pejuang Subuh',
    description: 'Sholat Subuh 7 hari berturut-turut',
    icon: '🌅',
    category: 'shalat',
    requirement: {
      type: 'streak',
      target: 'subuh',
      value: 7,
    },
    rarity: 'common',
    order: 1,
  },
  {
    id: 'subuh_30',
    name: 'Konsisten Subuh',
    description: 'Sholat Subuh 30 hari berturut-turut',
    icon: '☀️',
    category: 'shalat',
    requirement: {
      type: 'streak',
      target: 'subuh',
      value: 30,
    },
    rarity: 'rare',
    order: 2,
  },
  {
    id: 'subuh_100',
    name: 'Master Subuh',
    description: 'Sholat Subuh 100 hari berturut-turut',
    icon: '👑',
    category: 'shalat',
    requirement: {
      type: 'streak',
      target: 'subuh',
      value: 100,
    },
    rarity: 'legendary',
    order: 3,
  },
  {
    id: 'tahajud_7',
    name: 'Mutahajjid',
    description: 'Sholat Tahajud 7 hari berturut-turut',
    icon: '🌙',
    category: 'shalat',
    requirement: {
      type: 'streak',
      target: 'tahajud',
      value: 7,
    },
    rarity: 'rare',
    order: 4,
  },
  {
    id: 'tahajud_30',
    name: 'Penjaga Malam',
    description: 'Sholat Tahajud 30 hari berturut-turut',
    icon: '✨',
    category: 'shalat',
    requirement: {
      type: 'streak',
      target: 'tahajud',
      value: 30,
    },
    rarity: 'epic',
    order: 5,
  },
  {
    id: 'duha_7',
    name: 'Pencari Berkah',
    description: 'Sholat Duha 7 hari berturut-turut',
    icon: '🌞',
    category: 'shalat',
    requirement: {
      type: 'streak',
      target: 'duha',
      value: 7,
    },
    rarity: 'common',
    order: 6,
  },
  {
    id: 'duha_30',
    name: 'Istiqomah Duha',
    description: 'Sholat Duha 30 hari berturut-turut',
    icon: '💫',
    category: 'shalat',
    requirement: {
      type: 'streak',
      target: 'duha',
      value: 30,
    },
    rarity: 'rare',
    order: 7,
  },

  // === DZIKIR BADGES ===
  {
    id: 'istigfar_100',
    name: 'Pemonohon Ampunan',
    description: 'Istigfar 100x dalam satu hari',
    icon: '📿',
    category: 'dzikir',
    requirement: {
      type: 'count',
      target: 'istigfar',
      value: 100,
    },
    rarity: 'common',
    order: 8,
  },
  {
    id: 'istigfar_1000',
    name: 'Ahli Istigfar',
    description: 'Total istigfar 1000x',
    icon: '🤲',
    category: 'dzikir',
    requirement: {
      type: 'total',
      target: 'istigfar',
      value: 1000,
    },
    rarity: 'rare',
    order: 9,
  },
  {
    id: 'sholawat_100',
    name: 'Pembaca Sholawat',
    description: 'Sholawat 100x dalam satu hari',
    icon: '💚',
    category: 'dzikir',
    requirement: {
      type: 'count',
      target: 'sholawat',
      value: 100,
    },
    rarity: 'common',
    order: 10,
  },
  {
    id: 'sholawat_1000',
    name: 'Pecinta Nabi',
    description: 'Total sholawat 1000x',
    icon: '🕌',
    category: 'dzikir',
    requirement: {
      type: 'total',
      target: 'sholawat',
      value: 1000,
    },
    rarity: 'rare',
    order: 11,
  },

  // === CONSISTENCY BADGES ===
  {
    id: 'streak_7',
    name: 'Seminggu Penuh',
    description: 'Semua ibadah lengkap selama 7 hari',
    icon: '⭐',
    category: 'consistency',
    requirement: {
      type: 'streak',
      target: 'all',
      value: 7,
    },
    rarity: 'common',
    order: 12,
  },
  {
    id: 'streak_30',
    name: 'Sebulan Penuh',
    description: 'Semua ibadah lengkap selama 30 hari',
    icon: '🌟',
    category: 'consistency',
    requirement: {
      type: 'streak',
      target: 'all',
      value: 30,
    },
    rarity: 'epic',
    order: 13,
  },
  {
    id: 'streak_100',
    name: 'Streak Master',
    description: 'Semua ibadah lengkap selama 100 hari',
    icon: '🏆',
    category: 'consistency',
    requirement: {
      type: 'streak',
      target: 'all',
      value: 100,
    },
    rarity: 'legendary',
    order: 14,
  },

  // === MILESTONE BADGES ===
  {
    id: 'first_ibadah',
    name: 'Langkah Pertama',
    description: 'Mencatat ibadah pertama kali',
    icon: '🎯',
    category: 'milestone',
    requirement: {
      type: 'special',
      target: 'first_record',
      value: 1,
    },
    rarity: 'common',
    order: 15,
  },
  {
    id: 'odoc_7',
    name: 'Pelajar Rajin',
    description: 'ODOC (One Day One Concept) 7 hari berturut-turut',
    icon: '📚',
    category: 'milestone',
    requirement: {
      type: 'streak',
      target: 'odoc',
      value: 7,
    },
    rarity: 'rare',
    order: 16,
  },
  {
    id: 'odoc_30',
    name: 'Penuntut Ilmu',
    description: 'ODOC 30 hari berturut-turut',
    icon: '🎓',
    category: 'milestone',
    requirement: {
      type: 'streak',
      target: 'odoc',
      value: 30,
    },
    rarity: 'epic',
    order: 17,
  },

  // === SPECIAL BADGES ===
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Upload foto Subuh sebelum jam 5:30 pagi',
    icon: '🐦',
    category: 'special',
    requirement: {
      type: 'special',
      target: 'early_subuh',
      value: 1,
      condition: 'photo_taken_before_0530',
    },
    rarity: 'rare',
    order: 18,
  },
  {
    id: 'perfect_week',
    name: 'Pekan Sempurna',
    description: 'Semua ibadah lengkap dalam seminggu tanpa gagal',
    icon: '💎',
    category: 'special',
    requirement: {
      type: 'special',
      target: 'perfect_week',
      value: 1,
    },
    rarity: 'epic',
    order: 19,
  },
  {
    id: 'ramadan_warrior',
    name: 'Pejuang Ramadhan',
    description: 'Lengkap semua ibadah selama 30 hari Ramadhan',
    icon: '🌙',
    category: 'special',
    requirement: {
      type: 'special',
      target: 'ramadan',
      value: 30,
    },
    rarity: 'legendary',
    order: 20,
  },
];

// Rarity colors for UI
export const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    badge: 'bg-gray-200 text-gray-800',
  },
  rare: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-700',
    badge: 'bg-blue-200 text-blue-800',
  },
  epic: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-700',
    badge: 'bg-purple-200 text-purple-800',
  },
  legendary: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    badge: 'bg-yellow-200 text-yellow-800',
  },
};

// Category labels
export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  shalat: 'Shalat',
  dzikir: 'Dzikir',
  consistency: 'Konsistensi',
  milestone: 'Milestone',
  special: 'Spesial',
};

// Rarity labels
export const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};
