'use client'

import { useState, useRef } from 'react'
import { parseEXIF, hasGPSMetadata, EXIFData } from '@/lib/exifParser'
import { calculatePrayerTimes, isWithinSubuhTime } from '@/lib/prayerTime'
import { findNearestMasjid, MasjidResult } from '@/lib/overpassApi'
import { createClient } from '@/lib/supabase'
import { VerificationStatus } from '@/lib/types'

interface SubuhUploaderProps {
  userId: string
  date: string
  onSuccess?: () => void
}

interface VerificationResult {
  status: VerificationStatus
  message: string
  photoTakenAt: Date
  subuhStart: Date
  syuruqTime: Date
  nearestMasjid: MasjidResult | null
  latitude: number
  longitude: number
}

export default function SubuhUploader({ userId, date, onSuccess }: SubuhUploaderProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhoto(file)
    setError(null)
    setVerification(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Parse EXIF
    setVerifying(true)
    try {
      const exifData = await parseEXIF(file)

      if (!hasGPSMetadata(exifData)) {
        setError('Foto tidak memiliki metadata GPS. Mohon ambil foto dengan mengaktifkan izin lokasi.')
        setVerifying(false)
        return
      }

      if (!exifData?.dateTime) {
        setError('Foto tidak memiliki metadata waktu. Mohon ambil foto langsung dari kamera.')
        setVerifying(false)
        return
      }

      const { latitude, longitude, dateTime } = exifData

      // Calculate prayer times
      const prayerTimes = calculatePrayerTimes(latitude!, longitude!, dateTime)
      if (!prayerTimes) {
        setError('Gagal menghitung waktu sholat. Periksa koordinat lokasi.')
        setVerifying(false)
        return
      }

      // Check if photo is within subuh time
      const isWithinTime = isWithinSubuhTime(dateTime, prayerTimes.subuh, prayerTimes.syuruq)

      // Find nearest masjid
      const masjids = await findNearestMasjid(latitude!, longitude!)
      const nearestMasjid = masjids.length > 0 ? masjids[0] : null

      // Determine verification status
      let status: VerificationStatus
      let message: string

      if (!isWithinTime) {
        status = 'failed'
        message = `Waktu foto di luar rentang Subuh. Subuh: ${prayerTimes.subuh.toLocaleTimeString('id-ID')}, Syuruq: ${prayerTimes.syuruq.toLocaleTimeString('id-ID')}`
      } else if (nearestMasjid) {
        status = 'verified_masjid'
        message = `Terverifikasi: Foto diambil saat Subuh di dekat ${nearestMasjid.name} (${nearestMasjid.distance}m)`
      } else {
        status = 'verified_time'
        message = 'Terverifikasi: Foto diambil saat waktu Subuh (mungkin sholat di rumah)'
      }

      setVerification({
        status,
        message,
        photoTakenAt: dateTime,
        subuhStart: prayerTimes.subuh,
        syuruqTime: prayerTimes.syuruq,
        nearestMasjid,
        latitude: latitude!,
        longitude: longitude!,
      })
    } catch (err) {
      setError('Gagal memverifikasi foto. Coba lagi.')
      console.error(err)
    } finally {
      setVerifying(false)
    }
  }

  const handleUpload = async () => {
    if (!photo || !verification) return

    setUploading(true)
    setError(null)

    try {
      // Upload photo to Supabase Storage
      const fileExt = photo.name.split('.').pop()
      const fileName = `${userId}_${date}_${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('subuh-photos')
        .upload(fileName, photo)

      if (uploadError) {
        setError('Gagal mengupload foto')
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('subuh-photos')
        .getPublicUrl(fileName)

      // Save verification data
      const { error: dbError } = await supabase
        .from('subuh_verifications')
        .insert({
          user_id: userId,
          date,
          photo_url: urlData.publicUrl,
          photo_taken_at: verification.photoTakenAt.toISOString(),
          latitude: verification.latitude,
          longitude: verification.longitude,
          nearest_masjid: verification.nearestMasjid?.name || null,
          masjid_distance: verification.nearestMasjid?.distance || null,
          subuh_start: verification.subuhStart.toISOString(),
          syuruq_time: verification.syuruqTime.toISOString(),
          verification_status: verification.status,
        })

      if (dbError) {
        setError('Gagal menyimpan data verifikasi')
        return
      }

      // Update daily record - ensure record exists
      const { error: recordError } = await supabase
        .from('daily_records')
        .upsert({
          user_id: userId,
          date,
          tahajud: false,
          duha: false,
          istigfar: 0,
          sholawat: 0,
          odoc: false,
          odoc_title: null,
        })

      if (recordError) {
        console.error('Error updating daily record:', recordError)
      }

      onSuccess?.()
    } catch (err) {
      setError('Terjadi kesalahan')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'verified_masjid':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'verified_time':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300'
    }
  }

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'verified_masjid':
        return '✓'
      case 'verified_time':
        return '⌂'
      case 'failed':
        return '✗'
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📸 Upload Foto Subuh
      </h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!photo ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl 
            hover:border-green-500 transition-colors flex flex-col items-center gap-2"
        >
          <span className="text-4xl">📷</span>
          <span className="text-gray-600">Tap untuk ambil/pilih foto</span>
        </button>
      ) : (
        <div className="space-y-4">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Foto Subuh"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          {verifying && (
            <div className="text-center py-4">
              <div className="animate-spin text-2xl mx-auto">⏳</div>
              <p className="text-gray-600 mt-2">Memverifikasi foto...</p>
            </div>
          )}

          {verification && (
            <div className={`p-4 rounded-lg border ${getStatusColor(verification.status)}`}>
              <div className="flex items-start gap-2">
                <span className="text-xl">{getStatusIcon(verification.status)}</span>
                <div>
                  <p className="font-medium">{verification.message}</p>
                  <div className="text-sm mt-2 space-y-1">
                    <p>Waktu foto: {verification.photoTakenAt.toLocaleTimeString('id-ID')}</p>
                    <p>Subuh: {verification.subuhStart.toLocaleTimeString('id-ID')}</p>
                    <p>Syuruq: {verification.syuruqTime.toLocaleTimeString('id-ID')}</p>
                    {verification.nearestMasjid && (
                      <p>Masjid: {verification.nearestMasjid.name} ({verification.nearestMasjid.distance}m)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 border-2 border-gray-300 rounded-lg hover:border-green-500 
                transition-colors text-gray-700"
            >
              Ganti Foto
            </button>
            {verification && verification.status !== 'failed' && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                  transition-colors disabled:opacity-50"
              >
                {uploading ? 'Menyimpan...' : 'Konfirmasi'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
