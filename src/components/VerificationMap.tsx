'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface VerificationMapProps {
  latitude: number
  longitude: number
  masjidLatitude?: number
  masjidLongitude?: number
  masjidName?: string
}

export default function VerificationMap({
  latitude,
  longitude,
  masjidLatitude,
  masjidLongitude,
  masjidName,
}: VerificationMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([latitude, longitude], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapRef.current)

    // Add marker for photo location
    L.marker([latitude, longitude], { icon })
      .addTo(mapRef.current)
      .bindPopup('Lokasi foto')

    // Add marker for masjid if available
    if (masjidLatitude && masjidLongitude) {
      const masjidIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #10B981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">🕌</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      L.marker([masjidLatitude, masjidLongitude], { icon: masjidIcon })
        .addTo(mapRef.current)
        .bindPopup(masjidName || 'Masjid terdekat')
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, masjidLatitude, masjidLongitude, masjidName])

  return <div ref={containerRef} className="w-full h-48 rounded-lg" />
}
