'use client';

import { useAuth } from '@/components/AuthProvider';
import { badgeService, BadgeProgress } from '@/lib/badgeService';
import BadgeCard, { BadgeStats, CategoryFilter } from '@/components/BadgeCard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalBadges: 0,
    completionPercentage: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      setLoadingBadges(true);
      const [badgeData, statsData] = await Promise.all([
        badgeService.getUserBadges(user.id),
        badgeService.getBadgeStats(user.id),
      ]);

      setBadges(badgeData);
      setStats(statsData);
      setLoadingBadges(false);
    };

    fetchBadges();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Filter badges by category
  const filteredBadges = selectedCategory
    ? badges.filter((b) => b.badge.category === selectedCategory)
    : badges;

  // Get unique categories from earned badges
  const categories = Array.from(new Set(badges.map((b) => b.badge.category)));

  if (loading || loadingBadges) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mx-auto">⏳</div>
          <p className="text-gray-600 mt-4">Memuat badge...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🏆 Pencapaian
            </h1>
            <p className="text-gray-600">
              Kumpulkan semua badge dan jadi yang terbaik!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <BadgeStats stats={stats} />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Badges Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedCategory ? 'Badge' : 'Semua Badge'} ({filteredBadges.length})
          </h2>

          {filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 text-lg">
                Belum ada badge. Mulai ibadah untuk mendapatkan badge pertama!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredBadges.map((badgeProgress) => (
                <BadgeCard
                  key={badgeProgress.badge.id}
                  badgeProgress={badgeProgress}
                  size="md"
                  showProgress={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* How to Earn Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📖</span>
              <span>Cara Mendapatkan Badge</span>
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs">
                  1
                </div>
                <p><strong className="text-gray-800">Konsistensi:</strong> Lakukan ibadah secara rutin setiap hari untuk mendapatkan badge streak</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs">
                  2
                </div>
                <p><strong className="text-gray-800">Target Harian:</strong> Capai target istigfar & sholawat 100x per hari</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs">
                  3
                </div>
                <p><strong className="text-gray-800">Total Kumulatif:</strong> Kumpulkan total dzikir untuk mendapatkan badge khusus</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs">
                  4
                </div>
                <p><strong className="text-gray-800">Milestone:</strong> Raih pencapaian khusus seperti ODOC, Early Bird, dll</p>
              </div>
            </div>
          </div>

          {/* Badge Rarity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⭐</span>
              <span>Tingkat Kelangkaan</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚪</span>
                  <div>
                    <p className="font-semibold text-gray-800">Common</p>
                    <p className="text-xs text-gray-600">Mudah didapatkan</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">7 badge</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔵</span>
                  <div>
                    <p className="font-semibold text-blue-700">Rare</p>
                    <p className="text-xs text-gray-600">Perlu konsistensi</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">7 badge</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🟣</span>
                  <div>
                    <p className="font-semibold text-purple-700">Epic</p>
                    <p className="text-xs text-gray-600">Sangat sulit</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">4 badge</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🟡</span>
                  <div>
                    <p className="font-semibold text-yellow-700">Legendary</p>
                    <p className="text-xs text-gray-600">Sangat langka</p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">2 badge</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Terus Semangat! 💪</h3>
          <p className="text-teal-100">
            Setiap ibadah yang kamu lakukan mendekatkanmu pada badge berikutnya. 
            Istiqomah adalah kunci!
          </p>
        </div>
      </div>
    </main>
  );
}
