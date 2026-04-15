'use client';

import { BadgeProgress } from '@/lib/badgeService';
import { RARITY_COLORS, RARITY_LABELS, CATEGORY_LABELS } from '@/lib/badges';

interface BadgeCardProps {
  badgeProgress: BadgeProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function BadgeCard({ 
  badgeProgress, 
  size = 'md',
  showProgress = true 
}: BadgeCardProps) {
  const { badge, progress, is_earned, percentage } = badgeProgress;
  const colors = RARITY_COLORS[badge.rarity];

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const containerSizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        relative rounded-2xl border-2 transition-all duration-300
        ${colors.bg} ${colors.border}
        ${is_earned ? 'shadow-lg scale-100' : 'opacity-60 scale-95'}
        ${containerSizeClasses[size]}
        hover:shadow-xl hover:scale-105 cursor-pointer
      `}
      title={`${badge.name} - ${badge.description}`}
    >
      {/* Earned Badge */}
      {is_earned ? (
        <div className="text-center">
          {/* Badge Icon */}
          <div className={`${sizeClasses[size]} mx-auto mb-2 flex items-center justify-center`}>
            <span role="img" aria-label={badge.name}>
              {badge.icon}
            </span>
          </div>

          {/* Badge Name */}
          <h3 className={`font-bold ${colors.text} ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
            {badge.name}
          </h3>

          {/* Rarity Badge */}
          <span className={`
            inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold
            ${colors.badge}
          `}>
            {RARITY_LABELS[badge.rarity]}
          </span>

          {/* Checkmark */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      ) : (
        /* Locked Badge */
        <div className="text-center">
          {/* Locked Icon */}
          <div className={`${sizeClasses[size]} mx-auto mb-2 flex items-center justify-center grayscale opacity-30`}>
            <span role="img" aria-label={badge.name}>
              {badge.icon}
            </span>
          </div>

          {/* Locked Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Badge Name (Gray) */}
          <h3 className={`font-bold text-gray-500 ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
            ???
          </h3>

          {/* Progress Bar */}
          {showProgress && progress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-300 rounded-full h-1.5">
                <div
                  className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {progress}/{badge.requirement.value}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Badge Stats Component
export function BadgeStats({ stats }: { stats: { totalEarned: number; totalBadges: number; completionPercentage: number } }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div className="text-3xl font-bold text-teal-600">{stats.totalEarned}</div>
        <div className="text-xs text-gray-600 mt-1">Badge Diperoleh</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div className="text-3xl font-bold text-blue-600">{stats.totalBadges}</div>
        <div className="text-xs text-gray-600 mt-1">Total Badge</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div className="text-3xl font-bold text-purple-600">
          {Math.round(stats.completionPercentage)}%
        </div>
        <div className="text-xs text-gray-600 mt-1">Progress</div>
      </div>
    </div>
  );
}

// Category Filter Component
export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: { 
  categories: string[]; 
  selectedCategory: string | null; 
  onSelectCategory: (category: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-teal-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        Semua
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-teal-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
        </button>
      ))}
    </div>
  );
}
