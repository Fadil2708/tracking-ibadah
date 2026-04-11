import exifr from 'exifr'

export interface EXIFData {
  dateTime: Date | null
  latitude: number | null
  longitude: number | null
}

export async function parseEXIF(file: File): Promise<EXIFData | null> {
  try {
    const exif = await exifr.parse(file, {
      gps: true,
      tiff: true,
    })

    if (!exif) {
      return null
    }

    return {
      dateTime: exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate || null,
      latitude: exif.latitude || null,
      longitude: exif.longitude || null,
    }
  } catch (error) {
    console.error('Error parsing EXIF:', error)
    return null
  }
}

export function hasGPSMetadata(data: EXIFData | null): boolean {
  return !!(data?.latitude && data?.longitude)
}
