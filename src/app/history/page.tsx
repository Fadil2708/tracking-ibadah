'use client'

import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'
import { DailyRecord, SubuhVerification } from '@/lib/types'
import { useEffect, useState } from 'react'

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [records, setRecords] = useState<DailyRecord[]>([])
  const [verifications, setVerifications] = useState<SubuhVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const supabase = createClient()

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      const startDate = new Date(selectedYear, selectedMonth, 1)
      const endDate = new Date(selectedYear, selectedMonth + 1, 0)

      const { data: recordsData } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      const { data: verificationsData } = await supabase
        .from('subuh_verifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      setRecords(recordsData || [])
      setVerifications(verificationsData || [])
      setLoading(false)
    }

    fetchHistory()
  }, [user, selectedMonth, selectedYear, supabase])

  const getDayStatus = (day: number): 'green' | 'yellow' | 'red' | 'empty' => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = records.find(r => r.date === dateStr)
    const verification = verifications.find(v => v.date === dateStr)

    if (!record && !verification) return 'empty'

    let completed = 0
    let total = 5

    if (verification && verification.verification_status !== 'failed') completed++
    if (record) {
      if (record.tahajud) completed++
      if (record.duha) completed++
      if (record.odoc) completed++
      if (record.istigfar >= 100) completed++
      if (record.sholawat >= 100) completed++
    }

    if (completed === total) return 'green'
    if (completed > 0) return 'yellow'
    return 'red'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500'
      case 'yellow': return 'bg-yellow-500'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-200'
    }
  }

  const calculateStreak = (): number => {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const record = records.find(r => r.date === dateStr)
      const verification = verifications.find(v => v.date === dateStr)
      
      let completed = 0
      if (verification && verification.verification_status !== 'failed') completed++
      if (record) {
        if (record.tahajud) completed++
        if (record.duha) completed++
        if (record.odoc) completed++
        if (record.istigfar >= 100) completed++
        if (record.sholawat >= 100) completed++
      }
      
      if (completed >= 5) {
        streak++
      } else {
        break
      }
    }
    
    return streak
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

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay()
  const streak = calculateStreak()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">📅 Riwayat Ibadah</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Streak Counter */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-lg font-medium opacity-90">Streak Saat Ini</h2>
          <p className="text-5xl font-bold mt-2">{streak} Hari</p>
          <p className="text-sm opacity-75 mt-2">Terus pertahankan! 🔥</p>
        </div>

        {/* Month Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11)
                  setSelectedYear(selectedYear - 1)
                } else {
                  setSelectedMonth(selectedMonth - 1)
                }
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              ←
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0)
                  setSelectedYear(selectedYear + 1)
                } else {
                  setSelectedMonth(selectedMonth + 1)
                }
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const status = getDayStatus(day)
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                    ${getStatusColor(status)} text-white cursor-pointer hover:opacity-75 transition`}
                  title={`Hari ${day}: ${status === 'green' ? 'Lengkap' : status === 'yellow' ? 'Sebagian' : status === 'red' ? 'Kosong' : 'Belum ada data'}`}
                >
                  {day}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>Lengkap</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>Sebagian</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>Tidak Ada</span>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Grafik Minggu Ini</h2>
          <div className="space-y-3">
            {['Tahajud', 'Duha', 'Subuh', 'Istigfar', 'Sholawat', 'ODOC'].map((item, idx) => {
              const count = records.filter(r => {
                if (idx === 0) return r.tahajud
                if (idx === 1) return r.duha
                if (idx === 2) return verifications.some(v => v.date === r.date && v.verification_status !== 'failed')
                if (idx === 3) return r.istigfar >= 100
                if (idx === 4) return r.sholawat >= 100
                if (idx === 5) return r.odoc
                return false
              }).length

              return (
                <div key={item} className="flex items-center gap-3">
                  <span className="text-sm w-20">{item}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all"
                      style={{ width: `${(count / Math.max(records.length, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
