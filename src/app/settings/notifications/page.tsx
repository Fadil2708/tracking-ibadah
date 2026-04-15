'use client'

import { NotificationSettings } from '@/components/NotificationSettings'
import { useRouter } from 'next/navigation'

export default function NotificationSettingsPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Kembali</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pengaturan Notifikasi</h1>
          <p className="text-gray-600">
            Kelola pengingat ibadah harian kamu
          </p>
        </div>

        {/* Notification Settings Component */}
        <NotificationSettings />

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Tentang Notifikasi</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Pengingat Waktu Sholat</p>
                <p>Notifikasi otomatis saat waktu sholat Subuh, Dzuhur, Ashar, Maghrib, dan Isya tiba berdasarkan lokasi kamu.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Pengingat Input Ibadah</p>
                <p>Reminder untuk mencatat ibadah harian jika kamu belum mengisi sebelum tidur.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">Streak & Achievements</p>
                <p>Notifikasi saat kamu mencapai streak tertentu atau mendapatkan pencapaian baru.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-800">
            <strong>Privasi:</strong> Notifikasi hanya digunakan untuk pengingat ibadah. Data notifikasi kamu tidak dibagikan ke pihak ketiga. Kamu bisa menonaktifkan kapan saja.
          </p>
        </div>
      </div>
    </main>
  )
}
