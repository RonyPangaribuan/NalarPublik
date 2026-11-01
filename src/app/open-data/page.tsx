'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Database,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Coins,
  Building,
  HeartHandshake,
  GraduationCap,
} from 'lucide-react'
import { INITIAL_DISTRICTS, formatRupiah } from '@/lib/data'
import { calculateSectorGaps, calculateOverallGap } from '@/lib/gap-calculator'
import { TobaTopoBackground } from '@/components/toba-topo-background'

const CONVERSIONS = [
  {
    icon: Building,
    rupiah: 'Rp 1 Miliar APBD',
    unit: '≈ 1,25 Km Aspal Hotmix Jalan',
    desc: 'Standar bina marga jalan kabupaten kelas III di dataran tinggi Toba.',
    baseCost: 'Biaya rata-rata: Rp 800 Juta per kilometer.',
    tag: 'Infrastruktur',
  },
  {
    icon: HeartHandshake,
    rupiah: 'Rp 250 Juta APBD',
    unit: '≈ 1 Unit Posyandu Terpadu Gizi',
    desc: 'Pengadaan timbangan antropometri digital, PMT balita, dan insentif kader 1 tahun.',
    baseCost: 'Biaya standar faskes tingkat desa pedalaman.',
    tag: 'Kesehatan',
  },
  {
    icon: GraduationCap,
    rupiah: 'Rp 150 Juta APBD',
    unit: '≈ 1 Ruang Kelas SD Direhab Total',
    desc: 'Perbaikan atap bocor, lantai keramik, ventilasi, meja kursi, dan papan tulis.',
    baseCost: 'Biaya rata-rata renovasi fisik ruang belajar dinas pendidikan.',
    tag: 'Pendidikan',
  },
  {
    icon: Coins,
    rupiah: 'Rp 50 Juta APBD',
    unit: '≈ Bantuan Bibit & Pupuk 10 Petani',
    desc: 'Subsidi bibit kopi arabika, pupuk organik, dan alat pelindung tanaman.',
    baseCost: 'Pemberdayaan kelompok tani rentan di kawasan lumbung pangan.',
    tag: 'Sosial & Ekonomi',
  },
]

export default function OpenDataPage() {
  const [downloaded, setDownloaded] = useState<boolean>(false)

  const downloadCSV = () => {
    const headers = [
      'id',
      'bps_code',
      'name',
      'population',
      'total_budget_idr',
      'infra_problem_pct',
      'health_problem_pct',
      'edu_problem_pct',
      'social_problem_pct',
      'budget_infra_pct',
      'budget_health_pct',
      'budget_edu_pct',
      'budget_social_pct',
      'overall_gap_score',
      'gap_status',
    ]

    const rows = INITIAL_DISTRICTS.map((d) => [
      d.id,
      d.bps_code,
      `"${d.name}"`,
      d.population,
      d.total_budget_idr,
      d.infra_problem_pct,
      d.health_problem_pct,
      d.edu_problem_pct,
      d.social_problem_pct,
      d.budget_infra_pct,
      d.budget_health_pct,
      d.budget_edu_pct,
      d.budget_social_pct,
      d.overall_gap_score,
      d.gap_status,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `nalarpublik_toba_apbd_bps_2026.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <TobaTopoBackground variant="feature" />
      <div className="relative z-10 max-w-[1240px] mx-auto space-y-10">

        {/* ── Page Header (Editorial Swiss Style) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
              <span className="size-1.5 bg-primary" />
              DATA TERBUKA KABUPATEN TOBA
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Data Terbuka Anggaran Kabupaten Toba
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mt-1">
              Lihat dan unduh data anggaran daerah serta kebutuhan masyarakat dalam bentuk yang mudah dipahami.
            </p>
          </div>

          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm shrink-0 cursor-pointer"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-300" />
                Data Terunduh!
              </>
            ) : (
              <>
                <Download className="size-4" />
                Unduh Data Terbuka (CSV)
              </>
            )}
          </button>
        </div>

        {/* ── Conversion Cards (Editorial Tech) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2
              className="text-base font-bold text-foreground"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Kamus Konversi Anggaran Fisik Toba
            </h2>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              STANDAR BIAYA SATUAN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONVERSIONS.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-muted border border-border text-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        [{item.tag}]
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {item.rupiah}
                      </span>
                      <p
                        className="text-base font-bold text-foreground mt-0.5 leading-snug"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        {item.unit}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border text-[11px] text-muted-foreground font-mono">
                    {item.baseCost}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Open Dataset Table ── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-0">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Katalog Gabungan APBD &amp; Indikator Masalah BPS Toba (2026)
              </h3>
              <p className="text-xs text-muted-foreground">
                Tersedia 4 kecamatan percontohan untuk analisis reproduktif dan penelitian independen.
              </p>
            </div>
            <span className="text-[10px] font-mono text-foreground bg-muted px-2.5 py-1 rounded-md border border-border shrink-0 font-semibold">
              LISENSI TERBUKA PUBLIK
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Wilayah Kecamatan</th>
                  <th className="px-4 py-3.5">Kode BPS</th>
                  <th className="px-4 py-3.5">Populasi</th>
                  <th className="px-5 py-3.5">Total APBD</th>
                  <th className="px-4 py-3.5">Infrastruktur (Masalah / APBD)</th>
                  <th className="px-4 py-3.5">Kesehatan (Masalah / APBD)</th>
                  <th className="px-4 py-3.5">Pendidikan (Masalah / APBD)</th>
                  <th className="px-4 py-3.5">Sosial (Masalah / APBD)</th>
                  <th className="px-4 py-3.5">Gap Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {INITIAL_DISTRICTS.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground">{d.name}</td>
                    <td className="px-4 py-4 font-mono text-muted-foreground">{d.bps_code}</td>
                    <td className="px-4 py-4 font-mono">{d.population.toLocaleString('id-ID')} jiwa</td>
                    <td className="px-5 py-4 font-mono font-semibold text-foreground">
                      {formatRupiah(d.total_budget_idr)}
                    </td>
                    <td className="px-4 py-4 font-mono">
                      <span className="font-bold text-foreground">{d.infra_problem_pct}%</span> /{' '}
                      <span className="text-muted-foreground">{d.budget_infra_pct}%</span>
                    </td>
                    <td className="px-4 py-4 font-mono">
                      <span className="font-bold text-foreground">{d.health_problem_pct}%</span> /{' '}
                      <span className="text-muted-foreground">{d.budget_health_pct}%</span>
                    </td>
                    <td className="px-4 py-4 font-mono">
                      <span className="font-bold text-foreground">{d.edu_problem_pct}%</span> /{' '}
                      <span className="text-muted-foreground">{d.budget_edu_pct}%</span>
                    </td>
                    <td className="px-4 py-4 font-mono">
                      <span className="font-bold text-foreground">{d.social_problem_pct}%</span> /{' '}
                      <span className="text-muted-foreground">{d.budget_social_pct}%</span>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold">
                      <span className={d.overall_gap_score && d.overall_gap_score >= 15 ? 'text-rose-500' : 'text-foreground'}>
                        +{d.overall_gap_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
