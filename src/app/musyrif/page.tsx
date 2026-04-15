'use client'

import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Profile, DailyRecord, SubuhVerification } from '@/lib/types'
import { useEffect, useState, useMemo, useCallback } from 'react'

interface SantriData {
  profile: Profile
  record: DailyRecord | null
  verification: SubuhVerification | null
}

export default function MusyrifPage() {
  const { user, loading: authLoading } = useAuth()
  const [santriList, setSantriList] = useState<SantriData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete' | 'no-report'>('all')
  const [selectedSantri, setSelectedSantri] = useState<SantriData | null>(null)
  
  // Memoize supabase client
  const supabase = useMemo(() => createClient(), [])

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchSantriData = async () => {
      if (!user || (user.role !== 'musyrif' && user.role !== 'admin')) return

      try {
        // Run all queries in parallel
        const [profilesResult, recordsResult, verificationsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('community_code', user.community_code)
            .eq('role', 'santri')
            .order('full_name'),
          
          supabase
            .from('daily_records')
            .select('*')
            .eq('date', today),
          
          supabase
            .from('subuh_verifications')
            .select('*')
            .eq('date', today),
        ])

        if (!profilesResult.data) {
          setSantriList([])
          setLoading(false)
          return
        }

        // Create maps for faster lookup
        const recordsMap = new Map((recordsResult.data || []).map(r => [r.user_id, r]))
        const verificationsMap = new Map((verificationsResult.data || []).map(v => [v.user_id, v]))

        // Map profiles with their data
        const santriData: SantriData[] = profilesResult.data.map(profile => ({
          profile,
          record: recordsMap.get(profile.id) || null,
          verification: verificationsMap.get(profile.id) || null,
        }))

        setSantriList(santriData)
      } catch (error) {
        console.error('Error fetching santri data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSantriData()
  }, [user, today, supabase])

  const getFilteredSantri = () => {
    switch (filter) {
      case 'complete':
        return santriList.filter(s => {
          const hasVerification = s.verification && s.verification.verification_status !== 'failed'
          const hasRecord = s.record
          return hasVerification && hasRecord
        })
      case 'incomplete':
        return santriList.filter(s => {
          const hasVerification = s.verification && s.verification.verification_status !== 'failed'
          const hasRecord = s.record
          return (hasVerification || hasRecord) && (!hasVerification || !hasRecord)
        })
      case 'no-report':
        return santriList.filter(s => !s.record && !s.verification)
      default:
        return santriList
    }
  }

  const handleExportCSV = async () => {
    // Generate CSV data
    const headers = ['Nama', 'Tahajud', 'Duha', 'Subuh', 'Istigfar', 'Sholawat', 'ODOC', 'Status Subuh']
    const rows = santriList.map(s => [
      s.profile.full_name,
      s.record?.tahajud ? '✓' : '✗',
      s.record?.duha ? '✓' : '✗',
      s.verification && s.verification.verification_status !== 'failed' ? '✓' : '✗',
      s.record?.istigfar || 0,
      s.record?.sholawat || 0,
      s.record?.odoc ? '✓' : '✗',
      s.verification?.verification_status || 'Belum upload',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekap-ibadah-${today}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mx-auto">⏳</div>
          <p className="text-gray-600 mt-4">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'musyrif' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Akses ditolak</p>
        </div>
      </div>
    )
  }

  const filteredSantri = getFilteredSantri()

  const stats = {
    total: santriList.length,
    complete: santriList.filter(s => {
      const hasVerification = s.verification && s.verification.verification_status !== 'failed'
      const hasRecord = s.record
      return hasVerification && hasRecord
    }).length,
    incomplete: santriList.filter(s => {
      const hasVerification = s.verification && s.verification.verification_status !== 'failed'
      const hasRecord = s.record
      return (hasVerification || hasRecord) && (!hasVerification || !hasRecord)
    }).length,
    noReport: santriList.filter(s => !s.record && !s.verification).length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard Musyrif</h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Santri</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-green-600">Lengkap</p>
            <p className="text-3xl font-bold text-green-700">{stats.complete}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-yellow-600">Belum Lengkap</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.incomplete}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-red-600">Tidak Ada Laporan</p>
            <p className="text-3xl font-bold text-red-700">{stats.noReport}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua ({santriList.length})
            </button>
            <button
              onClick={() => setFilter('complete')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lengkap ({stats.complete})
            </button>
            <button
              onClick={() => setFilter('incomplete')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'incomplete' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Belum Lengkap ({stats.incomplete})
            </button>
            <button
              onClick={() => setFilter('no-report')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'no-report' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tidak Ada Laporan ({stats.noReport})
            </button>
          </div>
        </div>

        {/* Santri Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tahajud</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Duha</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Subuh</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Istigfar</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Sholawat</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">ODOC</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSantri.map((santri) => (
                  <tr key={santri.profile.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {santri.profile.full_name}
                    </td>
                    <td className="px-4 py-3 text-center text-2xl">
                      {santri.record?.tahajud ? '✓' : '✗'}
                    </td>
                    <td className="px-4 py-3 text-center text-2xl">
                      {santri.record?.duha ? '✓' : '✗'}
                    </td>
                    <td className="px-4 py-3 text-center text-2xl">
                      {santri.verification && santri.verification.verification_status !== 'failed' ? '✓' : '✗'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {santri.record?.istigfar || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {santri.record?.sholawat || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-2xl">
                      {santri.record?.odoc ? '✓' : '✗'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedSantri(santri)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedSantri && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Detail Santri</h2>
                <button
                  onClick={() => setSelectedSantri(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedSantri.profile.full_name}</h3>
                  <p className="text-sm text-gray-600">@{selectedSantri.profile.username}</p>
                </div>

                {selectedSantri.verification && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Foto Subuh</h4>
                    <img
                      src={selectedSantri.verification.photo_url}
                      alt="Foto Subuh"
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <div className="text-sm space-y-1">
                      <p><strong>Status:</strong> {selectedSantri.verification.verification_status}</p>
                      <p><strong>Waktu Foto:</strong> {new Date(selectedSantri.verification.photo_taken_at).toLocaleTimeString('id-ID')}</p>
                      {selectedSantri.verification.nearest_masjid && (
                        <p><strong>Masjid:</strong> {selectedSantri.verification.nearest_masjid}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedSantri.record && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Detail Ibadah</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Tahajud: {selectedSantri.record.tahajud ? '✓' : '✗'}</p>
                      <p>Duha: {selectedSantri.record.duha ? '✓' : '✗'}</p>
                      <p>Istigfar: {selectedSantri.record.istigfar}</p>
                      <p>Sholawat: {selectedSantri.record.sholawat}</p>
                      <p>ODOC: {selectedSantri.record.odoc ? '✓' : '✗'}</p>
                      {selectedSantri.record.odoc_title && (
                        <p className="col-span-2">Judul ODOC: {selectedSantri.record.odoc_title}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
