'use client'

import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'
import { DailyRecord } from '@/lib/types'
import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react'
import DzikirCounter from '@/components/DzikirCounter'
import { useRouter } from 'next/navigation'
import { badgeService } from '@/lib/badgeService'
import { notificationScheduler } from '@/lib/notificationScheduler'
import { calculatePrayerTimes } from '@/lib/prayerTime'

// Lazy load heavy component
const SubuhUploader = lazy(() => import('@/components/SubuhUploader'))

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const [record, setRecord] = useState<DailyRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedIbadah, setSelectedIbadah] = useState('')
  const [newBadges, setNewBadges] = useState<Array<{name: string; icon: string}>>([])
  const [badgeCount, setBadgeCount] = useState(0)
  const [fetchingRecord, setFetchingRecord] = useState(true)
  const router = useRouter()
  
  // Memoize supabase client to prevent recreation
  const supabase = useMemo(() => createClient(), [])

  const today = new Date().toISOString().split('T')[0]

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    const fetchRecord = async () => {
      if (!user) return

      setFetchingRecord(true)
      try {
        const { data } = await supabase
          .from('daily_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle()

        if (!data) {
          const defaultRecord = {
            user_id: user.id,
            date: today,
            tahajud: false,
            duha: false,
            istigfar: 0,
            sholawat: 0,
            odoc: false,
            odoc_title: null,
          }
          setRecord(defaultRecord as DailyRecord)
        } else {
          setRecord(data)
        }
      } catch (error) {
        console.error('Error fetching record:', error)
      } finally {
        setFetchingRecord(false)
      }
    }

    fetchRecord()
  }, [user, today, supabase])

  // Warning when leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // Fetch badge count - debounced to not block initial render
  useEffect(() => {
    if (!user) return;

    // Delay badge fetch to not block initial page load
    const timer = setTimeout(async () => {
      try {
        const stats = await badgeService.getBadgeStats(user.id);
        setBadgeCount(stats.totalEarned);
      } catch (error) {
        console.error('Error fetching badge count:', error);
      }
    }, 1000); // Wait 1 second after page load

    return () => clearTimeout(timer);
  }, [user]);

  // Schedule prayer time notifications
  useEffect(() => {
    if (!user) return;
    if (!notificationScheduler.isSupported()) return;
    if (Notification.permission !== 'granted') return;

    // Get user location and schedule notifications
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const prayerTimes = calculatePrayerTimes(latitude, longitude, new Date());
          
          if (prayerTimes) {
            notificationScheduler.scheduleAll(prayerTimes);
          }
        },
        (error) => {
          console.warn('Location access denied for prayer times:', error);
        }
      );
    }

    // Cleanup on unmount
    return () => {
      // Don't clear here, let settings page manage it
    };
  }, [user]);

  const saveRecord = useCallback(async () => {
    if (!user || !record) return

    setSaving(true)
    try {
      // Get badges before save
      const badgesBefore = await badgeService.getEarnedBadges(user.id);
      
      const { data } = await supabase
        .from('daily_records')
        .upsert({
          user_id: user.id,
          date: today,
          tahajud: record.tahajud,
          duha: record.duha,
          istigfar: record.istigfar,
          sholawat: record.sholawat,
          odoc: record.odoc,
          odoc_title: record.odoc_title,
        })
        .select()
        .single()

      if (data) {
        setRecord(data)
        setHasChanges(false)
        
        // Check for new badges after save
        setTimeout(async () => {
          const badgesAfter = await badgeService.getEarnedBadges(user.id);
          const newBadgesFound = badgesAfter.filter(
            (b) => !badgesBefore.find((bb) => b.badge.id === bb.badge.id)
          );

          if (newBadgesFound.length > 0) {
            setNewBadges(newBadgesFound.map((b) => ({
              name: b.badge.name,
              icon: b.badge.icon,
            })));
            setBadgeCount(badgesAfter.length);

            // Send notification for new badges
            newBadgesFound.forEach((badge) => {
              notificationScheduler.notifyAchievement(badge.badge.name, badge.badge.icon);
            });

            // Clear notification after 5 seconds
            setTimeout(() => setNewBadges([]), 5000);
          }
        }, 500); // Small delay to let DB trigger run
      }
    } catch (err) {
      console.error('Error saving record:', err)
    } finally {
      setSaving(false)
    }
  }, [user, today, record, supabase])

  const completedCount = record ? [
    record.tahajud,
    record.duha,
    record.odoc,
    record.istigfar >= 100,
    record.sholawat >= 100,
  ].filter(Boolean).length : 0

  const ibadahOptions = [
    { value: '', label: '-- Pilih Ibadah --' },
    { value: 'subuh', label: '📸 Sholat Subuh' },
    { value: 'tahajud', label: '🌙 Sholat Tahajud' },
    { value: 'duha', label: '☀️ Sholat Duha' },
    { value: 'istigfar', label: '📿 Istigfar' },
    { value: 'sholawat', label: '💚 Sholawat' },
    { value: 'odoc', label: '📚 ODOC' },
  ]

  if (loading || !user || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mx-auto">⏳</div>
          <p className="text-gray-600 mt-4">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ibadah Tracker</h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Badge Counter */}
            <button
              onClick={() => router.push('/achievements')}
              className="relative px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition flex items-center gap-2"
            >
              <span className="text-lg">🏆</span>
              <span className="font-semibold text-yellow-700 text-sm">{badgeCount}</span>
              {badgeCount === 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Assalamu'alaikum,</p>
              <p className="font-semibold text-gray-800">{user?.full_name || 'Santri'}</p>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Progress Hari Ini</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-gray-800">{completedCount}/5</span>
          </div>
        </div>

        {/* Ibadah Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Input Ibadah</h2>
          
          <select
            value={selectedIbadah}
            onChange={(e) => setSelectedIbadah(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          >
            {ibadahOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Subuh */}
          {selectedIbadah === 'subuh' && (
            <div className="mt-4">
              <Suspense fallback={
                <div className="text-center py-8">
                  <div className="animate-spin text-2xl mx-auto">⏳</div>
                  <p className="text-gray-600 mt-2">Memuat uploader...</p>
                </div>
              }>
                <SubuhUploader
                  userId={user.id}
                  date={today}
                  onSuccess={() => {
                    // Refresh the page to get updated data
                    window.location.reload()
                  }}
                />
              </Suspense>
            </div>
          )}

          {/* Tahajud */}
          {selectedIbadah === 'tahajud' && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setRecord({ ...record, tahajud: !record.tahajud })
                  setHasChanges(true)
                }}
                className={`w-full py-4 rounded-xl text-xl font-bold transition
                  ${record.tahajud 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {record.tahajud ? '✓ Sudah Tahajud' : '☐ Tap untuk Tahajud'}
              </button>
            </div>
          )}

          {/* Duha */}
          {selectedIbadah === 'duha' && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setRecord({ ...record, duha: !record.duha })
                  setHasChanges(true)
                }}
                className={`w-full py-4 rounded-xl text-xl font-bold transition
                  ${record.duha 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {record.duha ? '✓ Sudah Duha' : '☐ Tap untuk Duha'}
              </button>
            </div>
          )}

          {/* Istigfar */}
          {selectedIbadah === 'istigfar' && (
            <div className="mt-4">
              <DzikirCounter
                label="Istigfar"
                value={record.istigfar || 0}
                onChange={(value) => {
                  setRecord({ ...record, istigfar: value })
                  setHasChanges(true)
                }}
                color="green"
              />
            </div>
          )}

          {/* Sholawat */}
          {selectedIbadah === 'sholawat' && (
            <div className="mt-4">
              <DzikirCounter
                label="Sholawat"
                value={record.sholawat || 0}
                onChange={(value) => {
                  setRecord({ ...record, sholawat: value })
                  setHasChanges(true)
                }}
                color="blue"
              />
            </div>
          )}

          {/* ODOC */}
          {selectedIbadah === 'odoc' && (
            <div className="mt-4 space-y-3">
              <button
                onClick={() => {
                  setRecord({ ...record, odoc: !record.odoc })
                  setHasChanges(true)
                }}
                className={`w-full py-4 rounded-xl text-xl font-bold transition
                  ${record.odoc 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {record.odoc ? '✓ Sudah ODOC' : '☐ Tap untuk ODOC'}
              </button>
              {record.odoc && (
                <input
                  type="text"
                  placeholder="Judul konsep yang dipelajari (opsional)"
                  value={record.odoc_title || ''}
                  onChange={(e) => {
                    setRecord({ ...record, odoc_title: e.target.value })
                    setHasChanges(true)
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4 bg-white rounded-xl p-4 shadow-lg">
          {hasChanges && (
            <div className="text-sm text-yellow-600 mb-2">⚠️ Ada perubahan yang belum disimpan</div>
          )}
          <button
            onClick={saveRecord}
            disabled={saving || !hasChanges}
            className={`w-full py-3 rounded-lg font-semibold transition
              ${saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                hasChanges ? 'bg-green-600 text-white hover:bg-green-700' :
                'bg-green-400 text-white'}`}
          >
            {saving ? '⏳ Menyimpan...' : hasChanges ? '💾 Simpan Data' : '✓ Tersimpan'}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/history')}
            className="flex-1 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition text-gray-700 font-medium"
          >
            📅 Riwayat
          </button>
          {user?.role !== 'santri' && (
            <button
              onClick={() => router.push('/musyrif')}
              className="flex-1 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition text-gray-700 font-medium"
            >
              📊 Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Badge Earned Notification */}
      {newBadges.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-bounce-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Selamat!
              </h2>
              <p className="text-gray-600 mb-6">
                Kamu mendapatkan badge baru:
              </p>
              
              <div className="space-y-3 mb-6">
                {newBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-4 flex items-center gap-3 border-2 border-yellow-400"
                  >
                    <span className="text-4xl">{badge.icon}</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{badge.name}</p>
                      <p className="text-sm text-gray-600">Badge baru terbuka!</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setNewBadges([])}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
              >
                Lihat Semua Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
