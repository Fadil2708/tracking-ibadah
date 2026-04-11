export interface Profile {
  id: string
  username: string
  full_name: string
  role: 'santri' | 'musyrif' | 'admin'
  community_code: string
  created_at: string
  updated_at: string
}

export interface DailyRecord {
  id: string
  user_id: string
  date: string
  tahajud: boolean
  duha: boolean
  istigfar: number
  sholawat: number
  odoc: boolean
  odoc_title: string | null
  created_at: string
  updated_at: string
}

export interface SubuhVerification {
  id: string
  user_id: string
  date: string
  photo_url: string
  photo_taken_at: string
  latitude: number
  longitude: number
  nearest_masjid: string | null
  masjid_distance: number | null
  subuh_start: string | null
  syuruq_time: string | null
  verification_status: 'verified_masjid' | 'verified_time' | 'failed'
  created_at: string
}

export type VerificationStatus = SubuhVerification['verification_status']
