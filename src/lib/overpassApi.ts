export interface MasjidResult {
  name: string
  latitude: number
  longitude: number
  distance: number
}

export async function findNearestMasjid(
  latitude: number,
  longitude: number,
  radius: number = 500
): Promise<MasjidResult[]> {
  try {
    const query = `
      [out:json];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});
      );
      out center;
    `

    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch masjid data')
    }

    const data = await response.json()

    const results: MasjidResult[] = data.elements
      .filter((element: any) => {
        const lat = element.lat || element.center?.lat
        const lon = element.lon || element.center?.lon
        return lat && lon && element.tags?.name
      })
      .map((element: any) => {
        const lat = element.lat || element.center?.lat
        const lon = element.lon || element.center?.lon
        const distance = calculateDistance(
          latitude,
          longitude,
          lat,
          lon
        )
        return {
          name: element.tags.name,
          latitude: lat,
          longitude: lon,
          distance: Math.round(distance),
        }
      })
      .sort((a: MasjidResult, b: MasjidResult) => a.distance - b.distance)

    return results
  } catch (error) {
    console.error('Error finding nearest masjid:', error)
    return []
  }
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
