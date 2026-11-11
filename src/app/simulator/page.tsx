'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
  Heart,
  GraduationCap,
  Users,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react'
import { INITIAL_DISTRICTS, formatRupiah } from '@/lib/data'
import { District, SectorKey } from '@/types'
import { BudgetDonutChart } from '@/components/charts/budget-donut-chart'
import { cn } from '@/lib/utils'
import { TobaTopoBackground } from '@/components/toba-topo-background'
import { useSubmissionsStore } from '@/store/use-submissions-store'

export default function SimulatorPage() {
  const { addSubmission } = useSubmissionsStore()
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('habinsaran')
  const [allocations, setAllocations] = useState<{
    infra: number
    health: number
    education: number
    social: number
  }>({
    infra: 35,
    health: 25,
    education: 20,
    social: 20,
  })
  const [notes, setNotes] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)

  const district = INITIAL_DISTRICTS.find((d) => d.id === selectedDistrictId) || INITIAL_DISTRICTS[3]

  const totalAlloc = allocations.infra + allocations.health + allocations.education + allocations.social
  const remaining = 100 - totalAlloc
  const isValid = totalAlloc === 100

  const handleSliderChange = (key: keyof typeof allocations, val: number) => {
    setAllocations((prev) => ({
      ...prev,
      [key]: val,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    const aspirationData = {
      district_id: selectedDistrictId,
      district_name: district.name,
      author: 'Warga Partisipatif',
      avatar: 'WP',
      avatarBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      alloc_infra_pct: allocations.infra,
      alloc_health_pct: allocations.health,
      alloc_edu_pct: allocations.education,
      alloc_social_pct: allocations.social,
      notes: notes.trim() || 'Aspirasi mandiri warga untuk prioritas pembangunan.',
    }

    // 1. Simpan aspirasi warga ke shared client store
    addSubmission(aspirationData)

    // 2. Kirim aspirasi ke API backend secara persisten
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district_id: selectedDistrictId,
          district_name: district.name,
          alloc_infra_pct: allocations.infra,
          alloc_health_pct: allocations.health,
          alloc_edu_pct: allocations.education,
          alloc_social_pct: allocations.social,
          notes: aspirationData.notes,
        }),
      })
    } catch {
      // Fallback graceful jika server sedang offline
    }

    setSubmitted(true)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <TobaTopoBackground variant="feature" />
      <div className="relative z-10 max-w-[1240px] mx-auto space-y-8">

        {/* ── Page Header (Editorial Swiss Style) ── */}
        <div className="text-center max-w-4xl mx-auto space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground animate-fade-in">
            <span className="size-1.5 bg-primary" />
            SUARA WARGA KABUPATEN TOBA
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap animate-fade-in"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Andai Anda yang Membagi Anggaran Daerah
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Tentukan prioritas dana pembangunan di kecamatan Anda. Bagikan 100% anggaran
            ke 4 bidang utama agar kebutuhan nyata warga terpenuhi.
          </p>
        </div>

        {submitted ? (
          /* ── Submission Confirmation Card ── */
          <div className="max-w-xl mx-auto bg-card border border-border rounded-3xl p-8 sm:p-10 text-center shadow-sm animate-rise space-y-6">
            <div className="size-14 rounded-2xl bg-muted border border-border text-foreground flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-7 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h2
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Aspirasi Berhasil Dicatat
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Partisipasi Anda untuk <strong>{district.name}</strong> telah tersimpan dalam pangkalan data
                aspirasi warga NalarPublik dan langsung disandingkan dengan APBD daerah.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-muted/30 rounded-2xl p-5 text-xs space-y-2.5 border border-border text-left font-mono">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">WILAYAH TARGET:</span>
                <span className="font-bold text-foreground">{district.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Infrastruktur &amp; Jalan:</span>
                <span className="font-bold text-foreground">{allocations.infra}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kesehatan &amp; Stunting:</span>
                <span className="font-bold text-foreground">{allocations.health}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pendidikan:</span>
                <span className="font-bold text-foreground">{allocations.education}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sosial &amp; Kemiskinan:</span>
                <span className="font-bold text-foreground">{allocations.social}%</span>
              </div>
              {notes && (
                <div className="pt-2 border-t border-border text-muted-foreground italic font-sans text-xs">
                  &ldquo;{notes}&rdquo;
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setSubmitted(false)
                  setNotes('')
                }}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
              >
                Kirim Aspirasi Lain
              </button>
              <Link
                href="/admin"
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                Lihat di Dasbor Admin <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── Interactive Simulator Form ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" style={{ animationDelay: '200ms' }}>

            {/* Left: Interactive Sliders (Span 7) — order-2 di mobile agar visual chart di atas */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 order-2 lg:order-1 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

              {/* District Selector Dropdown */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  01 - PILIH WILAYAH KECAMATAN
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/70 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-xs hover:border-border dark:hover:border-slate-600 transition-colors"
                >
                  {INITIAL_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id} className="bg-card dark:bg-slate-800 text-foreground">
                      {d.name} (Pagu: {formatRupiah(d.total_budget_idr)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sliders Container */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    02 - ALOKASIKAN PORSI 4 SEKTOR
                  </label>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    PAGU: {formatRupiah(district.total_budget_idr)}
                  </span>
                </div>

                {/* Sektor 1: Infrastruktur */}
                <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      Infrastruktur &amp; Jalan
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted border border-border text-foreground">
                      {allocations.infra}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    value={allocations.infra}
                    onChange={(e) => handleSliderChange('infra', Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg touch-none"
                    style={{ touchAction: 'none' }}
                  />
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Masalah Lapangan: {district.infra_problem_pct}%</span>
                    <span>APBD Saat Ini: {district.budget_infra_pct}%</span>
                  </div>
                </div>

                {/* Sektor 2: Kesehatan */}
                <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <Heart className="size-3.5 text-muted-foreground" />
                      Kesehatan &amp; Gizi Stunting
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted border border-border text-foreground">
                      {allocations.health}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    value={allocations.health}
                    onChange={(e) => handleSliderChange('health', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-muted rounded-lg touch-none"
                    style={{ touchAction: 'none' }}
                  />
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Masalah Lapangan: {district.health_problem_pct}%</span>
                    <span>APBD Saat Ini: {district.budget_health_pct}%</span>
                  </div>
                </div>

                {/* Sektor 3: Pendidikan */}
                <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <GraduationCap className="size-3.5 text-muted-foreground" />
                      Pendidikan &amp; Sekolah
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted border border-border text-foreground">
                      {allocations.education}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    value={allocations.education}
                    onChange={(e) => handleSliderChange('education', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-muted rounded-lg touch-none"
                    style={{ touchAction: 'none' }}
                  />
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Masalah Lapangan: {district.edu_problem_pct}%</span>
                    <span>APBD Saat Ini: {district.budget_edu_pct}%</span>
                  </div>
                </div>

                {/* Sektor 4: Sosial */}
                <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <Users className="size-3.5 text-muted-foreground" />
                      Sosial &amp; Kemiskinan
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted border border-border text-foreground">
                      {allocations.social}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    value={allocations.social}
                    onChange={(e) => handleSliderChange('social', Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer h-2 bg-muted rounded-lg touch-none"
                    style={{ touchAction: 'none' }}
                  />
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Masalah Lapangan: {district.social_problem_pct}%</span>
                    <span>APBD Saat Ini: {district.budget_social_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Optional Notes Input (Max 200 chars) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    03 - CATATAN ASPIRASI LAPANGAN (OPSIONAL)
                  </label>
                  <span className={cn('text-xs font-mono', notes.length > 200 ? 'text-rose-500 font-bold' : 'text-muted-foreground')}>
                    {notes.length}/200
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={200}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan catatan konkret lapangan..."
                  className="w-full rounded-xl border border-border/80 dark:border-slate-700 bg-muted/70 dark:bg-slate-800 p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none shadow-xs hover:border-border dark:hover:border-slate-600 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isValid}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all',
                  isValid
                    ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-sm'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60 border border-border'
                )}
              >
                <Send className="size-3.5" />
                Kirim Aspirasi Anggaran Warga
              </button>
            </form>

            {/* Right: Balance Gauge & Live Preview Panel (Span 5) — order-1 di mobile tampil pertama */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">

              {/* Dynamic Recharts Donut */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Visual Proporsi Anggaran
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">100% KUOTA</span>
                </div>
                <BudgetDonutChart allocations={allocations} />
              </div>

              {/* Total Balance Card (Clean Swiss style, not neon pastel) */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    STATUS VALIDASI KUOTA
                  </span>
                  <span
                    className={cn(
                      'text-xl font-bold font-mono',
                      isValid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : totalAlloc > 100
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {totalAlloc}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isValid
                        ? 'bg-emerald-500'
                        : totalAlloc > 100
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                    )}
                    style={{ width: `${Math.min(100, totalAlloc)}%` }}
                  />
                </div>

                <div className="pt-1 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  {isValid ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground"><strong>Alokasi Seimbang 100%.</strong> Porsi 4 sektor tepat dan siap dikirimkan ke Musrenbang.</span>
                    </>
                  ) : totalAlloc > 100 ? (
                    <>
                      <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Kelebihan {totalAlloc - 100}% poin!</strong> Kurangi salah satu sektor agar pas 100%.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Sisa {remaining}% kuota</strong> belum dialokasikan. Tambahkan ke sektor prioritas Anda.</span>
                    </>
                  )}
                </div>
              </div>

              {/* Side-by-Side: Usulan Warga vs APBD Saat Ini */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Komparasi dengan APBD Resmi
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {district.name}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Infra comparison */}
                  <div>
                    <div className="flex justify-between mb-1 font-mono text-[11px]">
                      <span className="text-foreground">Infrastruktur</span>
                      <span className="text-muted-foreground">
                        Simulasi <strong className="text-foreground">{allocations.infra}%</strong> · APBD <strong className="text-foreground">{district.budget_infra_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden flex gap-1">
                      <div className="h-full bg-primary" style={{ width: `${(allocations.infra / 70) * 100}%` }} />
                    </div>
                  </div>

                  {/* Health comparison */}
                  <div>
                    <div className="flex justify-between mb-1 font-mono text-[11px]">
                      <span className="text-foreground">Kesehatan</span>
                      <span className="text-muted-foreground">
                        Simulasi <strong className="text-foreground">{allocations.health}%</strong> · APBD <strong className="text-foreground">{district.budget_health_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden flex gap-1">
                      <div className="h-full bg-emerald-500" style={{ width: `${(allocations.health / 70) * 100}%` }} />
                    </div>
                  </div>

                  {/* Education comparison */}
                  <div>
                    <div className="flex justify-between mb-1 font-mono text-[11px]">
                      <span className="text-foreground">Pendidikan</span>
                      <span className="text-muted-foreground">
                        Simulasi <strong className="text-foreground">{allocations.education}%</strong> · APBD <strong className="text-foreground">{district.budget_edu_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden flex gap-1">
                      <div className="h-full bg-amber-500" style={{ width: `${(allocations.education / 70) * 100}%` }} />
                    </div>
                  </div>

                  {/* Social comparison */}
                  <div>
                    <div className="flex justify-between mb-1 font-mono text-[11px]">
                      <span className="text-foreground">Sosial</span>
                      <span className="text-muted-foreground">
                        Simulasi <strong className="text-foreground">{allocations.social}%</strong> · APBD <strong className="text-foreground">{district.budget_social_pct}%</strong>
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden flex gap-1">
                      <div className="h-full bg-violet-500" style={{ width: `${(allocations.social / 70) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}
