'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeftRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  Heart,
  GraduationCap,
  Users,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { INITIAL_DISTRICTS, formatRupiah } from '@/lib/data'
import { calculateSectorGaps, calculateOverallGap, calculateGapStatus, getStatusColor } from '@/lib/gap-calculator'
import { CompareRadarChart } from '@/components/charts/compare-radar-chart'
import { cn } from '@/lib/utils'
import { TobaTopoBackground } from '@/components/toba-topo-background'

export default function ComparePage() {
  const [districtAId, setDistrictAId] = useState<string>('habinsaran')
  const [districtBId, setDistrictBId] = useState<string>('balige')

  const distA = INITIAL_DISTRICTS.find((d) => d.id === districtAId) || INITIAL_DISTRICTS[3]
  const distB = INITIAL_DISTRICTS.find((d) => d.id === districtBId) || INITIAL_DISTRICTS[0]

  const gapsA = calculateSectorGaps(distA)
  const gapsB = calculateSectorGaps(distB)

  const overallGapA = calculateOverallGap(distA)
  const overallGapB = calculateOverallGap(distB)

  const statusA = calculateGapStatus(distA)
  const statusB = calculateGapStatus(distB)

  const colorA = getStatusColor(statusA)
  const colorB = getStatusColor(statusB)

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <TobaTopoBackground variant="feature" />
      <div className="relative z-10 max-w-[1240px] mx-auto space-y-8">

        {/* ── Page Header (Editorial Swiss Style) ── */}
        <div className="text-center max-w-4xl mx-auto space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground animate-fade-in">
            <span className="size-1.5 bg-primary" />
            PERBANDINGAN WILAYAH KABUPATEN TOBA
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap animate-fade-in"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Perbandingan Anggaran Antarwilayah
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Bandingkan data kebutuhan masyarakat dan alokasi anggaran antar-kecamatan di Kabupaten Toba.
          </p>
        </div>

        {/* ── Selectors & Header Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch animate-fade-in" style={{ animationDelay: '180ms' }}>

          {/* Kecamatan A Selector Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                WILAYAH A - SISI KIRI
              </span>
              {/* Swiss Monospace Status Tag */}
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold',
                colorA.label === 'KRITIS' || colorA.label === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : colorA.label === 'WASPADA' || colorA.label === 'WARNING'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
              )}>
                <span className="size-1.5 rounded-full bg-white/70" />
                {colorA.label} <span className="opacity-80 font-normal">| +{overallGapA}%</span>
              </span>
            </div>

            <select
              value={districtAId}
              onChange={(e) => setDistrictAId(e.target.value)}
              className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/70 dark:bg-slate-800 px-4 py-3 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-xs hover:border-border dark:hover:border-slate-600 transition-colors"
            >
              {INITIAL_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id} className="bg-card dark:bg-slate-800 text-foreground">
                  {d.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-muted/50 dark:bg-slate-800/60 p-3 rounded-xl border border-border/70 dark:border-slate-700/60">
                <span className="text-muted-foreground block text-[10px] font-mono uppercase tracking-wider">Total Alokasi APBD</span>
                <strong className="text-sm font-mono text-foreground">{formatRupiah(distA.total_budget_idr)}</strong>
              </div>
              <div className="bg-muted/50 dark:bg-slate-800/60 p-3 rounded-xl border border-border/70 dark:border-slate-700/60">
                <span className="text-muted-foreground block text-[10px] font-mono uppercase tracking-wider">Jumlah Penduduk</span>
                <strong className="text-sm font-mono text-foreground">{distA.population.toLocaleString('id-ID')} jiwa</strong>
              </div>
            </div>
          </div>

          {/* Kecamatan B Selector Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                WILAYAH B - SISI KANAN
              </span>
              {/* Swiss Monospace Status Tag */}
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold',
                colorB.label === 'KRITIS' || colorB.label === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : colorB.label === 'WASPADA' || colorB.label === 'WARNING'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
              )}>
                <span className="size-1.5 rounded-full bg-white/70" />
                {colorB.label} <span className="opacity-80 font-normal">| +{overallGapB}%</span>
              </span>
            </div>

            <select
              value={districtBId}
              onChange={(e) => setDistrictBId(e.target.value)}
              className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/70 dark:bg-slate-800 px-4 py-3 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-xs hover:border-border dark:hover:border-slate-600 transition-colors"
            >
              {INITIAL_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id} className="bg-card dark:bg-slate-800 text-foreground">
                  {d.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-muted/50 dark:bg-slate-800/60 p-3 rounded-xl border border-border/70 dark:border-slate-700/60">
                <span className="text-muted-foreground block text-[10px] font-mono uppercase tracking-wider">Total Alokasi APBD</span>
                <strong className="text-sm font-mono text-foreground">{formatRupiah(distB.total_budget_idr)}</strong>
              </div>
              <div className="bg-muted/50 dark:bg-slate-800/60 p-3 rounded-xl border border-border/70 dark:border-slate-700/60">
                <span className="text-muted-foreground block text-[10px] font-mono uppercase tracking-wider">Jumlah Penduduk</span>
                <strong className="text-sm font-mono text-foreground">{distB.population.toLocaleString('id-ID')} jiwa</strong>
              </div>
            </div>
          </div>

        </div>

        {/* ── Visual Bar & Radar Comparison per Sector (Ukuran Sama: 50% - 50% & Tinggi Sejajar) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch animate-fade-in" style={{ animationDelay: '320ms' }}>

          {/* Left: Interactive Radar Polygon Chart (Equal 50% & Full Height) */}
          <div className="flex flex-col h-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <CompareRadarChart distA={distA} distB={distB} />
          </div>

          {/* Right: Technical Sector Progress Rows (Equal 50% & Full Height) */}
          <div className="flex flex-col justify-between h-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h2
                  className="text-base font-bold text-foreground"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Rincian Gap Score 4 Sektor
                </h2>
                <p className="text-xs text-muted-foreground">
                  Kondisi masalah BPS (%) berbanding alokasi anggaran APBD (%).
                </p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                METRIK
              </span>
            </div>

            <div className="space-y-4">

              {/* Sektor 1: Infrastruktur */}
              <div className="bg-muted/40 dark:bg-slate-800/60 border border-border/80 dark:border-slate-700/60 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <Building2 className="size-3.5 text-muted-foreground" /> Infrastruktur Jalan
                  </span>
                  <div className="font-mono text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">Gap:</span>
                    <span className={cn('font-bold', gapsA[0].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsA[0].gap}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className={cn('font-bold', gapsB[0].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsB[0].gap}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distA.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distA.infra_problem_pct}%</strong> · APBD <strong className="text-foreground">{distA.budget_infra_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted-foreground/15 dark:bg-slate-700/70 rounded-sm overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${distA.infra_problem_pct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distB.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distB.infra_problem_pct}%</strong> · APBD <strong className="text-foreground">{distB.budget_infra_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted-foreground/15 dark:bg-slate-700/70 rounded-sm overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${distB.infra_problem_pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sektor 2: Kesehatan */}
              <div className="bg-muted/40 dark:bg-slate-800/60 border border-border/80 dark:border-slate-700/60 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <Heart className="size-3.5 text-muted-foreground" /> Kesehatan &amp; Stunting
                  </span>
                  <div className="font-mono text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">Gap:</span>
                    <span className={cn('font-bold', gapsA[1].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsA[1].gap}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className={cn('font-bold', gapsB[1].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsB[1].gap}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distA.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distA.health_problem_pct}%</strong> · APBD <strong className="text-foreground">{distA.budget_health_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted-foreground/15 dark:bg-slate-700/70 rounded-sm overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${distA.health_problem_pct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distB.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distB.health_problem_pct}%</strong> · APBD <strong className="text-foreground">{distB.budget_health_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted-foreground/15 dark:bg-slate-700/70 rounded-sm overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${distB.health_problem_pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sektor 3: Pendidikan */}
              <div className="bg-muted/40 dark:bg-slate-800/60 border border-border/80 dark:border-slate-700/60 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="size-3.5 text-muted-foreground" /> Pendidikan &amp; Ruang Kelas
                  </span>
                  <div className="font-mono text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">Gap:</span>
                    <span className={cn('font-bold', gapsA[2].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsA[2].gap}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className={cn('font-bold', gapsB[2].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsB[2].gap}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distA.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distA.edu_problem_pct}%</strong> · APBD <strong className="text-foreground">{distA.budget_edu_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted-foreground/15 dark:bg-slate-700/70 rounded-sm overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${distA.edu_problem_pct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distB.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distB.edu_problem_pct}%</strong> · APBD <strong className="text-foreground">{distB.budget_edu_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted-foreground/15 dark:bg-slate-700/70 rounded-sm overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${distB.edu_problem_pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sektor 4: Sosial */}
              <div className="bg-muted/40 dark:bg-slate-800/60 border border-border/80 dark:border-slate-700/60 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <Users className="size-3.5 text-muted-foreground" /> Penduduk Miskin &amp; Sosial
                  </span>
                  <div className="font-mono text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">Gap:</span>
                    <span className={cn('font-bold', gapsA[3].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsA[3].gap}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className={cn('font-bold', gapsB[3].gap >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground')}>
                      +{gapsB[3].gap}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distA.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distA.social_problem_pct}%</strong> · APBD <strong className="text-foreground">{distA.budget_social_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-sm overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${distA.social_problem_pct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground font-medium">{distB.name}</span>
                      <span className="font-mono text-muted-foreground">
                        Masalah <strong className="text-foreground">{distB.social_problem_pct}%</strong> · APBD <strong className="text-foreground">{distB.budget_social_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-sm overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${distB.social_problem_pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── Direct Comparison Table ── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div>
              <h3
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Tabel Komparasi Langsung
              </h3>
              <p className="text-xs text-muted-foreground">
                Parameter data BPS Kabupaten Toba dan Alokasi APBD 2026.
              </p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              TABULAR
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Indikator Metrik</th>
                  <th className="px-6 py-3.5 font-bold text-foreground">{distA.name}</th>
                  <th className="px-6 py-3.5 font-bold text-foreground">{distB.name}</th>
                  <th className="px-6 py-3.5">Delta Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-6 py-3.5 font-medium text-foreground">Pagu Alokasi APBD</td>
                  <td className="px-6 py-3.5 font-mono">{formatRupiah(distA.total_budget_idr)}</td>
                  <td className="px-6 py-3.5 font-mono">{formatRupiah(distB.total_budget_idr)}</td>
                  <td className="px-6 py-3.5 font-mono text-muted-foreground">
                    {formatRupiah(Math.abs(distA.total_budget_idr - distB.total_budget_idr))}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-foreground">Jalan Rusak Sedang/Berat (BPS)</td>
                  <td className="px-6 py-3.5 font-mono">{distA.infra_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono">{distB.infra_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-foreground">
                    {Math.abs(distA.infra_problem_pct - distB.infra_problem_pct).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-foreground">Prevalensi Stunting &amp; Faskes (BPS)</td>
                  <td className="px-6 py-3.5 font-mono">{distA.health_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono">{distB.health_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-foreground">
                    {Math.abs(distA.health_problem_pct - distB.health_problem_pct).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-foreground">Ruang Kelas SD Rusak (BPS)</td>
                  <td className="px-6 py-3.5 font-mono">{distA.edu_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono">{distB.edu_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-foreground">
                    {Math.abs(distA.edu_problem_pct - distB.edu_problem_pct).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-medium text-foreground">Penduduk Miskin (BPS)</td>
                  <td className="px-6 py-3.5 font-mono">{distA.social_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono">{distB.social_problem_pct}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-foreground">
                    {Math.abs(distA.social_problem_pct - distB.social_problem_pct).toFixed(1)}%
                  </td>
                </tr>
                <tr className="bg-muted/30 font-bold">
                  <td className="px-6 py-4 text-foreground">Status &amp; Overall Gap Score</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted border border-border text-[11px] font-mono text-foreground">
                      <span className={cn('size-1.5 rounded-full', colorA.dot)} />
                      {colorA.label} (+{overallGapA})
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted border border-border text-[11px] font-mono text-foreground">
                      <span className={cn('size-1.5 rounded-full', colorB.dot)} />
                      {colorB.label} (+{overallGapB})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">
                    Δ {Math.abs(overallGapA - overallGapB).toFixed(2)} poin
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
