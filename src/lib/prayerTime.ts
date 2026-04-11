import { Coordinates, CalculationMethod, Madhab, PrayerTimes as AdhanPrayerTimes, CalculationParameters } from 'adhan'

export interface PrayerTimes {
  subuh: Date
  syuruq: Date
  dzuhur: Date
  ashar: Date
  maghrib: Date
  isya: Date
}

export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): PrayerTimes | null {
  try {
    const coordinates = new Coordinates(latitude, longitude)
    // Using Singapore method (closest to Indonesia/Kemenag)
    const params = CalculationMethod.Singapore()
    params.madhab = Madhab.Shafi
    
    const prayerTimes = new AdhanPrayerTimes(coordinates, date, params)
    
    return {
      subuh: prayerTimes.fajr,
      syuruq: prayerTimes.sunrise,
      dzuhur: prayerTimes.dhuhr,
      ashar: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isya: prayerTimes.isha,
    }
  } catch (error) {
    console.error('Error calculating prayer times:', error)
    return null
  }
}

export function isWithinSubuhTime(
  photoTime: Date,
  subuhStart: Date,
  syuruqTime: Date
): boolean {
  return photoTime >= subuhStart && photoTime <= syuruqTime
}
