'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Database, TrendingDown, AlertCircle, Activity } from 'lucide-react'

export interface KPICardData {
  title: string
  icon: typeof Database
  iconColor: string
  value: string
  unit: string
  desc: string
  source: string
}

export const TOBA_KPI_CARDS: KPICardData[] = [
  {
    title: 'TOTAL BELANJA ANGGARAN',
    icon: Database,
    iconColor: 'text-primary',
    value: 'Rp 1,42 T',
    unit: '',
    desc: 'Pagu APBD Kabupaten Toba Tahun Anggaran 2026.',
    source: 'Sumber: BPKAD Toba 2026',
  },
  {
    title: 'TINGKAT KEMISKINAN',
    icon: TrendingDown,
    iconColor: 'text-emerald-500',
    value: '8,12%',
    unit: '',
    desc: 'Persentase penduduk miskin, turun 0,34% dari survei 2024.',
    source: 'Sumber: BPS Toba DDA 2026',
  },
  {
    title: 'WILAYAH DENGAN SELISIH TINGGI',
    icon: AlertCircle,
    iconColor: 'text-rose-500',
    value: '2 / 4',
    unit: 'Kecamatan',
    desc: 'Habinsaran & Porsea memerlukan perhatian dan penyesuaian alokasi.',
    source: 'Formula: Kebutuhan % - Anggaran %',
  },
  {
    title: 'PARTISIPASI WARGA',
    icon: Activity,
    iconColor: 'text-amber-500',
    value: '2.841',
    unit: 'Suara',
    desc: 'Masukan alokasi anggaran melalui simulasi mandiri warga.',
    source: 'Terverifikasi Tanpa Akun',
  },
]

export function TobaKpiSlider() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  // Triple set of items for perfectly seamless infinite continuous wrap
  const items = [...TOBA_KPI_CARDS, ...TOBA_KPI_CARDS, ...TOBA_KPI_CARDS]

  // Continuous auto-sliding animation loop (NEVER stops on cursor hover!)
  useEffect(() => {
    let animId: number
    const speed = 0.8 // Kecepatan gerak santai & halus

    const step = () => {
      const container = containerRef.current
      if (container) {
        // Hanya jeda otomatis saat user SEDANG menekan & menyeret kursor (isDownRef)
        // Saat kursor hanya melayang / hover, pergerakan TETAP berjalan lancar!
        if (!isDownRef.current) {
          container.scrollLeft += speed
        }

        // Loop wrapping logic: Saat mencapai 1/3 dari total scrollable width, reset balik
        const singleSetWidth = container.scrollWidth / 3
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += singleSetWidth
          }
        }
      }
      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Mouse Drag Events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return
    isDownRef.current = true
    setIsDragging(true)
    startXRef.current = e.pageX - container.offsetLeft
    scrollLeftRef.current = container.scrollLeft
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDownRef.current) return
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const x = e.pageX - container.offsetLeft
    const walk = (x - startXRef.current) * 1.4 // drag multiplier
    container.scrollLeft = scrollLeftRef.current - walk
  }, [])

  const handleMouseUp = useCallback(() => {
    isDownRef.current = false
    setIsDragging(false)
  }, [])

  // Touch Events (Mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current
    if (!container) return
    isDownRef.current = true
    setIsDragging(true)
    startXRef.current = e.touches[0].pageX - container.offsetLeft
    scrollLeftRef.current = container.scrollLeft
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDownRef.current) return
    const container = containerRef.current
    if (!container) return
    const x = e.touches[0].pageX - container.offsetLeft
    const walk = (x - startXRef.current) * 1.4
    container.scrollLeft = scrollLeftRef.current - walk
  }, [])

  const handleTouchEnd = useCallback(() => {
    isDownRef.current = false
    setIsDragging(false)
  }, [])

  return (
    <div className="relative w-full py-3">
      {/* Draggable & Auto-Sliding Viewport Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex gap-4 overflow-x-hidden select-none py-2 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ scrollBehavior: 'auto' }}
        title="Geser bebas dengan kursor mouse atau sentuhan"
      >
        {items.map((kpi, idx) => {
          const IconComponent = kpi.icon
          return (
            <div
              key={`kpi-slider-${idx}`}
              className="w-[280px] sm:w-[320px] shrink-0 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-200 space-y-2 select-none"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                  {kpi.title}
                </span>
                <IconComponent size={15} className={kpi.iconColor} />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground">
                {kpi.value}{' '}
                {kpi.unit && (
                  <span className="text-xs text-muted-foreground font-sans font-normal">
                    {kpi.unit}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {kpi.desc}
              </p>
              <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground">
                {kpi.source}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

