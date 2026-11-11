'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { District, SectorKey } from '@/types'
import { calculateGapStatus, getStatusColor } from '@/lib/gap-calculator'

interface MapViewProps {
  districts: District[]
  selectedDistrict: District | null
  onSelectDistrict: (d: District) => void
  activeSector?: SectorKey
}

function createPinIcon(colorHex: string, label: string, isSelected: boolean) {
  const size = isSelected ? 38 : 30
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          background: ${colorHex};
          transform: rotate(-45deg);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        ">
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ffffff;
          "></div>
        </div>
        <div style="
          margin-top: 4px;
          padding: 2px 7px;
          background: rgba(16, 24, 40, 0.85);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.15);
        ">
          ${label}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

export default function MapView({
  districts,
  selectedDistrict,
  onSelectDistrict,
  activeSector,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  // 1. Inisialisasi Map Leaflet murni sekali saat mounted
  useEffect(() => {
    if (!containerRef.current) return

    const initialCenter: [number, number] = selectedDistrict
      ? [selectedDistrict.latitude, selectedDistrict.longitude]
      : [2.35, 99.15]

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer
    mapRef.current = map

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [])

  // 2. Update Marker Pins saat data atau filter sektor berganti
  useEffect(() => {
    const map = mapRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    markersLayer.clearLayers()

    districts.forEach((d) => {
      const status = calculateGapStatus(d, activeSector)
      const colors = getStatusColor(status)
      const isSelected = selectedDistrict?.id === d.id

      const marker = L.marker([d.latitude, d.longitude], {
        icon: createPinIcon(colors.hex, d.name.replace('Kecamatan ', ''), isSelected),
      })

      marker.on('click', () => {
        onSelectDistrict(d)
      })

      marker.addTo(markersLayer)
    })
  }, [districts, selectedDistrict, activeSector, onSelectDistrict])

  // 3. Smooth FlyTo saat selectedDistrict berganti
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedDistrict) return

    map.flyTo([selectedDistrict.latitude, selectedDistrict.longitude], 11, {
      duration: 1.2,
    })
  }, [selectedDistrict])

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] rounded-xl z-0 overflow-hidden"
      style={{ height: '100%', minHeight: '100%', width: '100%' }}
    />
  )
}
