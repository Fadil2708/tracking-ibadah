'use client'

import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase'
import { DailyRecord } from '@/lib/types'
import { useEffect, useState, useCallback } from 'react'
import DailyChecklist from '@/components/DailyChecklist'
import DzikirCounter from '@/components/DzikirCounter'
import SubuhUploader from '@/components/SubuhUploader'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const [record, setRecord] = useState<DailyRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchRecord = async () => {
      if (!user) return

      const { data } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

      // Create default record if none exists
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
    }

    fetchRecord()
  }, [user, today, supabase])

  const saveRecord = useCallback(async (updates: Partial<DailyRecord>) => {
    if (!user) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('daily_records')
        .upsert({
          user_id: user.id,
          date: today,
          ...updates,
        })
        .select()
        .single()

      if (data) {
        setRecord(data)
      }
    } catch (err) {
      console.error('Error saving record:', err)
    } finally {
      setSaving(false)
    }
  }, [user, today, supabase])

  const handleToggle = useCallback((id: string) => {
    if (!record) return

    const updates: Partial<DailyRecord> = {}

    switch (id) {
      case 'tahajud':
        updates.tahajud = !record.tahajud
        break
      case 'duha':
        updates.duha = !record.duha
        break
      case 'odoc':
        updates.odoc = !record.odoc
        break
    }

    // Update local state immediately
    setRecord({ ...record, ...updates })

    // Save to database
    saveRecord(updates)
  }, [record, saveRecord])

  const handleDzikirChange = useCallback((type: 'istigfar' | 'sholawat', value: number) => {
    if (!record) return

    // Update local state immediately
    setRecord({ ...record, [type]: value })

    // Save to database
    saveRecord({ [type]: value })
  }, [record, saveRecord])

  const handleSubuhSuccess = useCallback(() => {
    if (!record) return
    // Update local state immediately
    setRecord({ ...record, tahajud: true })
    // Save to database
    saveRecord({ tahajud: true })
  }, [record, saveRecord])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mx-auto">⏳</div>
          <p className="text-gray-600 mt-4">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const checklistItems = [
    { id: 'tahajud', label: 'Sholat Tahajud', checked: record?.tahajud || false, icon: '🌙' },
    { id: 'duha', label: 'Sholat Duha', checked: record?.duha || false, icon: '☀️' },
    { id: 'odoc', label: 'ODOC (One Day One Concept)', checked: record?.odoc || false, icon: '📚' },
  ]

  const completedCount = record ? [
    record.tahajud,
    record.duha,
    record.odoc,
    record.istigfar >= 100,
    record.sholawat >= 100,
  ].filter(Boolean).length : 0

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
            <div className="text-right">
              <p className="text-sm text-gray-600">Assalamu'alaikum,</p>
              <p className="font-semibold text-gray-800">{user.full_name}</p>
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

        {/* Sholat Subuh Section */}
        <SubuhUploader 
          userId={user.id} 
          date={today}
          onSuccess={handleSubuhSuccess}
        />

        {/* Daily Checklist */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ibadah Lainnya</h2>
          <DailyChecklist items={checklistItems} onToggle={handleToggle} />
        </div>

        {/* Dzikir Counters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DzikirCounter
            label="Istigfar"
            value={record?.istigfar || 0}
            onChange={(value) => handleDzikirChange('istigfar', value)}
            color="green"
          />
          <DzikirCounter
            label="Sholawat"
            value={record?.sholawat || 0}
            onChange={(value) => handleDzikirChange('sholawat', value)}
            color="blue"
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/history')}
            className="flex-1 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition text-gray-700 font-medium"
          >
            📅 Riwayat
          </button>
          {user.role !== 'santri' && (
            <button
              onClick={() => router.push('/musyrif')}
              className="flex-1 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition text-gray-700 font-medium"
            >
              📊 Dashboard
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
