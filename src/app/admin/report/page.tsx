'use client'

import Link from 'next/link'
import { FileText, Printer, Download, ArrowLeft, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react'
import { INITIAL_DISTRICTS, formatRupiah } from '@/lib/data'
import { calculateSectorGaps, calculateOverallGap, calculateGapStatus } from '@/lib/gap-calculator'
import { TobaTopoBackground } from '@/components/toba-topo-background'

export default function AdminReportPage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <TobaTopoBackground variant="feature" className="no-print" />
      <div className="relative z-10 max-w-[1000px] mx-auto space-y-8">

        {/* Action bar */}
        <div className="flex items-center justify-between no-print">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Kembali ke Dasbor Admin
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm cursor-pointer hover:opacity-90"
          >
            <Printer className="size-3.5" /> Cetak / Ekspor PDF Resmi
          </button>
        </div>

        {/* Official Report Document */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">

          {/* Document Header */}
          <div className="border-b border-border pb-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
              <Building2 className="size-3.5" /> Pemerintah Kabupaten Toba · Bappeda
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Laporan Kesenjangan Anggaran Daerah
            </h1>
            <p className="text-xs text-muted-foreground">
              Dokumen Rekomendasi Pra-Musrenbang RKPD 2026 · Wilayah Pilot Kode BPS 1212
            </p>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              1. Ringkasan Eksekutif &amp; Temuan Kritis
            </h2>
            <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs leading-relaxed text-foreground space-y-2">
              <p>
                Berdasarkan penyandingan data statistik masalah riil BPS 2026 dan penetapan pagu APBD Kabupaten Toba,
                ditemukan kesenjangan alokasi yang sangat tajam di <strong>Kecamatan Habinsaran</strong> dengan Gap Score <strong>+30.0 (Status: CRITICAL)</strong>,
                di mana tingkat kerusakan jalan mencapai <strong>46.0%</strong> namun porsi alokasi jalan hanya <strong>16.0%</strong>.
              </p>
              <p>
                Sebaliknya, <strong>Kecamatan Balige</strong> memiliki ruang fiskal yang longgar dengan alokasi infrastruktur <strong>40.0%</strong> berbanding tingkat kerusakan <strong>14.5%</strong>.
                Disarankan realokasi terarah minimal <strong>+15%</strong> dari pos surplus ke infrastruktur Habinsaran dan penguatan gizi balita Porsea.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              2. Matriks Gap Score 4 Kecamatan Pilot
            </h2>
            <div className="overflow-x-auto border border-border rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border uppercase text-[10px] font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Kecamatan</th>
                    <th className="px-4 py-3">Pagu APBD</th>
                    <th className="px-4 py-3">Jalan Rusak</th>
                    <th className="px-4 py-3">Stunting</th>
                    <th className="px-4 py-3">Kelas Rusak</th>
                    <th className="px-4 py-3">Kemiskinan</th>
                    <th className="px-4 py-3">Gap Score</th>
                    <th className="px-4 py-3">Klasifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {INITIAL_DISTRICTS.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 font-bold">{d.name}</td>
                      <td className="px-4 py-3 font-mono">{formatRupiah(d.total_budget_idr)}</td>
                      <td className="px-4 py-3 font-mono">{d.infra_problem_pct}%</td>
                      <td className="px-4 py-3 font-mono">{d.health_problem_pct}%</td>
                      <td className="px-4 py-3 font-mono">{d.edu_problem_pct}%</td>
                      <td className="px-4 py-3 font-mono">{d.social_problem_pct}%</td>
                      <td className="px-4 py-3 font-mono font-bold">+{d.overall_gap_score}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-[10px]">
                          {d.gap_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff */}
          <div className="pt-6 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <div>
              <p className="font-bold text-foreground">Sistem Analitik NalarPublik</p>
              <p>Platform Pendukung Keputusan Berbasis Bukti</p>
            </div>
            <div className="text-right">
              <p>BPS Kabupaten Toba · APBD 2026</p>
              <p>Verifikasi Otomatis Terbuka</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

