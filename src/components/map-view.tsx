'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { District, SectorKey } from '@/types'
import { calculateGapStatus, getStatusColor, calculateSectorGaps } from '@/lib/gap-calculator'
import { formatRupiah } from '@/lib/data'

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

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 11, { duration: 1.2 })
  }, [center, map])
  return null
}

export default function MapView({
  districts,
  selectedDistrict,
  onSelectDistrict,
  activeSector,
}: MapViewProps) {
  const centerPosition: [number, number] = selectedDistrict
    ? [selectedDistrict.latitude, selectedDistrict.longitude]
    : [2.35, 99.15]

  return (
    <MapContainer
      center={centerPosition}
      zoom={11}
      scrollWheelZoom={true}
      className="w-full h-full rounded-2xl z-0"
      style={{ minHeight: '520px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={centerPosition} />

      {districts.map((d) => {
        const status = calculateGapStatus(d, activeSector)
        const colors = getStatusColor(status)
        const isSelected = selectedDistrict?.id === d.id

        return (
          <Marker
            key={d.id}
            position={[d.latitude, d.longitude]}
            icon={createPinIcon(colors.hex, d.name.replace('Kecamatan ', ''), isSelected)}
            eventHandlers={{
              click: () => onSelectDistrict(d),
            }}
          />
        )
      })}
    </MapContainer>
  )
}

