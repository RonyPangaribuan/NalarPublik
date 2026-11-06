'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  MapPin,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { INITIAL_DISTRICTS, formatRupiah } from '@/lib/data'
import { District, SectorKey } from '@/types'
import {
  SECTORS,
  calculateSectorGaps,
  calculateGapStatus,
  calculateOverallGap,
  getStatusColor,
} from '@/lib/gap-calculator'
import { cn } from '@/lib/utils'
import { TobaTopoBackground } from '@/components/toba-topo-background'

// Dynamic import for Leaflet client-only rendering
const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-2xl bg-muted/30 border border-border flex flex-col items-center justify-center gap-3 text-muted-foreground animate-pulse">
      <MapPin className="size-8 text-primary animate-bounce" />
      <p className="text-xs font-mono uppercase tracking-wider">Memuat Peta Wilayah Kabupaten Toba...</p>
    </div>
  ),
})

export default function MapPage() {
  const [districts, setDistricts] = useState<District[]>(INITIAL_DISTRICTS)
  const [selectedDistrict, setSelectedDistrict] = useState<District>(INITIAL_DISTRICTS[3]) // Default Habinsaran (kritis)
  const [activeSector, setActiveSector] = useState<SectorKey | undefined>(undefined)

  useEffect(() => {
    fetch('/api/districts')
      .then((res) => res.json())
      .then((json) => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setDistricts(json.data)
          setSelectedDistrict((prev) => json.data.find((d: District) => d.id === prev.id) || json.data[3])
        }
      })
      .catch((err) => console.warn('Gagal memuat data kecamatan dari API:', err))
  }, [])

  const gaps = calculateSectorGaps(selectedDistrict)
  const overallGap = calculateOverallGap(selectedDistrict)
  const currentStatus = calculateGapStatus(selectedDistrict, activeSector)
  const statusColors = getStatusColor(currentStatus)

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <TobaTopoBackground variant="feature" />
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">

        {/* ── Page Header (Editorial Swiss Style) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 animate-fade-in">
              <span className="size-1.5 bg-primary" />
              PETA WILAYAH KABUPATEN TOBA
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap animate-fade-in"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Peta Kesenjangan Anggaran Kabupaten Toba
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mt-1 animate-fade-in">
              Pilih kecamatan pada peta untuk melihat perbedaan antara kebutuhan masyarakat dan pembagian anggaran daerah.
            </p>
          </div>

          {/* Quick Legend Indicator (Crisp Monospace) */}
          <div className="flex items-center gap-3 text-[11px] font-mono bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm animate-fade-in">
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-1.5 rounded-full bg-rose-500" />
              Perlu Perhatian (&ge;+20)
            </span>
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Perlu Pantauan (+10..+19)
            </span>
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Sesuai Kebutuhan (&lt;+10)
            </span>
          </div>
        </div>

        {/* ── Sector Filter Bar (Clean Segmented Control - Solid Blue Background) ── */}
        <div className="flex items-center gap-1.5 bg-blue-600 dark:bg-blue-700 p-1.5 rounded-xl border border-blue-500 shadow-sm overflow-x-auto select-none animate-fade-in" style={{ animationDelay: '150ms' }}>
          <button
            onClick={() => setActiveSector(undefined)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
              activeSector === undefined
                ? 'bg-white text-blue-700 dark:text-blue-800 shadow-md font-bold'
                : 'text-white/85 hover:text-white hover:bg-white/15'
            )}
          >
            Semua Sektor (Umum)
          </button>
          {SECTORS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSector(s.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                activeSector === s.key
                  ? 'bg-white text-blue-700 dark:text-blue-800 shadow-md font-bold'
                  : 'text-white/85 hover:text-white hover:bg-white/15'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Map Canvas & Detail Drawer Grid (Ukuran Sama: 50% - 50% & Tinggi Sejajar) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch animate-fade-in" style={{ animationDelay: '280ms' }}>

          {/* Left: Interactive Map Container (50% Lebar & Tinggi Sejajar) */}
          <div className="flex flex-col h-full bg-card border border-border rounded-2xl p-3 shadow-sm overflow-hidden">
            <div className="relative w-full h-full min-h-[560px] flex-1 rounded-xl overflow-hidden">
              <MapView
                districts={districts}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(d) => setSelectedDistrict(d)}
                activeSector={activeSector}
              />

              {/* Float helper pill on map */}
              <div className="absolute bottom-4 left-4 z-10 bg-card/95 backdrop-blur-md border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground shadow-md flex items-center gap-2">
                <Info className="size-3.5 text-primary" />
                Klik marker pada peta untuk memeriksa rincian sektor
              </div>
            </div>
          </div>

          {/* Right: Selected District Inspector Drawer (50% Lebar & Tinggi Sejajar) */}
          <div className="flex flex-col justify-between h-full bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="space-y-6">

              {/* Header info */}
              <div className="flex items-start justify-between gap-3 border-b border-border pb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    KODE BPS: {selectedDistrict.bps_code}
                  </span>
                  <h2
                    className="text-2xl font-extrabold text-foreground mt-0.5"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {selectedDistrict.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    Populasi: {selectedDistrict.population.toLocaleString('id-ID')} jiwa · APBD: {formatRupiah(selectedDistrict.total_budget_idr)}
                  </p>
                </div>

                {/* Swiss Status Tag */}
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-[11px] font-mono font-semibold text-foreground">
                    <span className={cn('size-1.5 rounded-full', statusColors.dot)} />
                    {statusColors.label}
                  </span>
                  <div className="text-[11px] text-muted-foreground mt-1 font-mono">
                    Gap: <strong className="text-foreground">+{overallGap} poin</strong>
                  </div>
                </div>
              </div>

              {/* Source indicator */}
              <div className="flex items-center justify-between text-xs bg-muted/30 rounded-xl px-3.5 py-2 border border-border">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Database className="size-3.5 text-muted-foreground" />
                  Sumber Data:
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-foreground">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  LIVE BPS HYBRID (1212)
                </span>
              </div>

              {/* Sector Breakdown Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase text-muted-foreground">
                  <span>SEKTOR &amp; MASALAH VS APBD</span>
                  <span>GAP SCORE</span>
                </div>

                {gaps.map((item) => {
                  return (
                    <div
                      key={item.sector}
                      className={cn(
                        'p-3 rounded-xl border transition-colors',
                        activeSector === item.sector
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card'
                      )}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-foreground">
                          {item.label}
                        </span>
                        <span className="font-mono font-bold text-[11px] text-foreground">
                          {item.gap > 0 ? `+${item.gap}` : item.gap} poin
                        </span>
                      </div>

                      {/* Progress bars: Problem vs Budget */}
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-20 text-muted-foreground shrink-0 text-[10px]">
                            BPS: {item.problemPct}%
                          </span>
                          <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden flex">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.min(100, item.problemPct)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-20 text-muted-foreground shrink-0 text-[10px]">
                            APBD: {item.budgetPct}%
                          </span>
                          <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${Math.min(100, item.budgetPct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Quick Actions (Pinned to Bottom) */}
            <div className="pt-4 mt-6 border-t border-border/60 flex flex-col sm:flex-row gap-2.5">
              <Link
                href={`/simulator?district=${selectedDistrict.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Sliders className="size-3.5" />
                Simulasikan Anggaran
              </Link>
              <Link
                href={`/compare?districtA=${selectedDistrict.id}&districtB=balige`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Bandingkan <ArrowRight className="size-3.5" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
