'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Building2,
  RefreshCw,
  Edit3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  Users2,
  MessageSquareQuote,
  Sparkles,
  ArrowRight,
  MessageCircle,
  MessagesSquare,
  Search,
  Bookmark,
  BookmarkCheck,
  Zap,
  ChevronRight,
  ChevronDown,
  Filter,
  Layers,
  FileText,
} from 'lucide-react'
import { INITIAL_DISTRICTS, INITIAL_SUBMISSIONS, formatRupiah } from '@/lib/data'
import { District, SectorKey } from '@/types'
import {
  calculateSectorGaps,
  calculateOverallGap,
  calculateGapStatus,
  getStatusColor,
} from '@/lib/gap-calculator'
import { AdminBarChart } from '@/components/charts/admin-bar-chart'
import { useRoleStore } from '@/store/use-role-store'
import { useSubmissionsStore } from '@/store/use-submissions-store'
import { cn } from '@/lib/utils'
import { TobaTopoBackground } from '@/components/toba-topo-background'

export default function AdminPage() {
  const { role, setRole } = useRoleStore()
  const [districts, setDistricts] = useState<District[]>(INITIAL_DISTRICTS)
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('habinsaran')
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [syncing, setSyncing] = useState<boolean>(false)
  const [syncedSuccess, setSyncedSuccess] = useState<boolean>(false)

  // Edit modal draft state
  const [editBudget, setEditBudget] = useState<{
    infra: number
    health: number
    edu: number
    social: number
  }>({ infra: 0, health: 0, edu: 0, social: 0 })

  // State Pop-up Chat Aspirasi Warga
  const [showChatModal, setShowChatModal] = useState<boolean>(false)
  const [chatDistrictFilter, setChatDistrictFilter] = useState<string>('all')
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('')
  const [bookmarkedAspirations, setBookmarkedAspirations] = useState<string[]>([])
  const [showAdvisoryDetails, setShowAdvisoryDetails] = useState<boolean>(false)

  const currentDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[3]
  const gaps = calculateSectorGaps(currentDistrict)

  // Dataset Aspirasi Komunitas Warga Toba (Tersambung Live ke Simulator via Zustand & localStorage)
  const { submissions: ALL_SUBMISSIONS } = useSubmissionsStore()

  // Anomali & Rekomendasi Kebijakan Dinamis Berdasarkan Kecamatan Terpilih
  const DISTRICT_ADVISORIES: Record<
    string,
    {
      status: 'KRITIS' | 'WASPADA' | 'TERKENDALI'
      statusColor: string
      borderColor: string
      badgeBg: string
      badgeText: string
      gapLabel: string
      headline: string
      sectorName: string
      problemPct: number
      budgetPct: number
      aspirasiPct: number
      shiftLabel: string
      physicalImpact: string
      impactSub: string
      suggestedBudget: { infra: number; health: number; edu: number; social: number }
    }
  > = {
    habinsaran: {
      status: 'KRITIS',
      statusColor: 'bg-rose-500',
      borderColor: 'border-l-rose-500',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      badgeText: 'text-rose-600 dark:text-rose-400',
      gapLabel: 'DEFISIT -30.0%',
      headline: 'Kebutuhan Pengaspalan Jalan Dataran Tinggi',
      sectorName: 'Infrastruktur Jalan Tani',
      problemPct: 46.0,
      budgetPct: 16.0,
      aspirasiPct: 50.0,
      shiftLabel: '16% ➔ 35% (+19%)',
      physicalImpact: '≈ 15,2 Km Pengaspalan Jalan Hotmix',
      impactSub: 'Menghubungkan akses tani Lumban Rau & Parsoburan',
      suggestedBudget: { infra: 35, health: 25, edu: 20, social: 20 },
    },
    porsea: {
      status: 'WASPADA',
      statusColor: 'bg-amber-500',
      borderColor: 'border-l-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badgeText: 'text-amber-600 dark:text-amber-400',
      gapLabel: 'DEFISIT -15.5%',
      headline: 'Fasilitas Gizi Balita & Posyandu Pesisir',
      sectorName: 'Kesehatan & Gizi Balita',
      problemPct: 29.5,
      budgetPct: 14.0,
      aspirasiPct: 40.0,
      shiftLabel: '14% ➔ 30% (+16%)',
      physicalImpact: '≈ 6 Unit Posyandu & Paket Gizi Balita',
      impactSub: 'Pengadaan antropometri digital & PMT balita desa',
      suggestedBudget: { infra: 25, health: 30, edu: 25, social: 20 },
    },
    laguboti: {
      status: 'WASPADA',
      statusColor: 'bg-amber-500',
      borderColor: 'border-l-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badgeText: 'text-amber-600 dark:text-amber-400',
      gapLabel: 'DEFISIT -12.0%',
      headline: 'Rehabilitasi Gedung Sekolah Dasar',
      sectorName: 'Pendidikan & Ruang Kelas',
      problemPct: 24.0,
      budgetPct: 27.0,
      aspirasiPct: 35.0,
      shiftLabel: '27% ➔ 35% (+8%)',
      physicalImpact: '≈ 12 Ruang Kelas SD Direhab Total',
      impactSub: 'Perbaikan atap bocor, sanitasi, dan meja belajar',
      suggestedBudget: { infra: 25, health: 20, edu: 35, social: 20 },
    },
    balige: {
      status: 'TERKENDALI',
      statusColor: 'bg-emerald-500',
      borderColor: 'border-l-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      gapLabel: 'SURPLUS +25.5%',
      headline: 'Kawasan Fiskal Relatif Mantap',
      sectorName: 'Efisiensi Anggaran Kota',
      problemPct: 14.5,
      budgetPct: 40.0,
      aspirasiPct: 35.0,
      shiftLabel: '40% ➔ 35% (-5% Surplus)',
      physicalImpact: '≈ Ruang Subsidi Silang Antar Wilayah',
      impactSub: 'Penyaluran ke pemeliharaan jalan darurat Habinsaran',
      suggestedBudget: { infra: 35, health: 25, edu: 22, social: 18 },
    },
  }

  const currentAdvisory = DISTRICT_ADVISORIES[currentDistrict.id] || DISTRICT_ADVISORIES['habinsaran']

  // Filter submissions by current district for chart averaging
  const districtSubmissions = ALL_SUBMISSIONS.filter((s) => s.district_id === currentDistrict.id)
  const avgAspirations = {
    infra: districtSubmissions.length
      ? Math.round((districtSubmissions.reduce((acc, s) => acc + s.alloc_infra_pct, 0) / districtSubmissions.length) * 10) / 10
      : 0,
    health: districtSubmissions.length
      ? Math.round((districtSubmissions.reduce((acc, s) => acc + s.alloc_health_pct, 0) / districtSubmissions.length) * 10) / 10
      : 0,
    edu: districtSubmissions.length
      ? Math.round((districtSubmissions.reduce((acc, s) => acc + s.alloc_edu_pct, 0) / districtSubmissions.length) * 10) / 10
      : 0,
    social: districtSubmissions.length
      ? Math.round((districtSubmissions.reduce((acc, s) => acc + s.alloc_social_pct, 0) / districtSubmissions.length) * 10) / 10
      : 0,
  }

  // Filter submissions for the Pop-up Chat Dialog
  const chatFilteredSubmissions = ALL_SUBMISSIONS.filter((sub) => {
    const matchesDistrict =
      chatDistrictFilter === 'all'
        ? true
        : chatDistrictFilter === 'bookmarked'
          ? bookmarkedAspirations.includes(sub.id)
          : sub.district_id === chatDistrictFilter
    const matchesSearch =
      chatSearchQuery.trim() === '' ||
      sub.notes.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
      sub.author.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
      sub.district_name.toLowerCase().includes(chatSearchQuery.toLowerCase())
    return matchesDistrict && matchesSearch
  })

  const toggleBookmark = (id: string) => {
    setBookmarkedAspirations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Handle opening edit modal
  const handleOpenEdit = (d: District) => {
    setEditingDistrict(d)
    setEditBudget({
      infra: d.budget_infra_pct,
      health: d.budget_health_pct,
      edu: d.budget_edu_pct,
      social: d.budget_social_pct,
    })
  }

  // Handle opening edit modal with custom prefilled budget (e.g. from Musrenbang or Citizen Aspirations)
  const handleOpenEditWithBudget = (
    d: District,
    customBudget: { infra: number; health: number; edu: number; social: number }
  ) => {
    setEditingDistrict(d)
    setEditBudget(customBudget)
  }

  const editTotal = editBudget.infra + editBudget.health + editBudget.edu + editBudget.social
  const isEditValid = editTotal === 100

  // Save budget changes
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDistrict || !isEditValid) return

    setDistricts((prev) =>
      prev.map((d) => {
        if (d.id === editingDistrict.id) {
          const updated: District = {
            ...d,
            budget_infra_pct: editBudget.infra,
            budget_health_pct: editBudget.health,
            budget_edu_pct: editBudget.edu,
            budget_social_pct: editBudget.social,
          }
          return {
            ...updated,
            overall_gap_score: calculateOverallGap(updated),
            gap_status: calculateGapStatus(updated),
          }
        }
        return d
      })
    )

    setEditingDistrict(null)
  }

  // Trigger BPS Sync simulation
  const handleSyncBPS = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setSyncedSuccess(true)
      setTimeout(() => setSyncedSuccess(false), 3500)
    }, 1500)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <TobaTopoBackground variant="feature" />
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">

        {/* ── Role Warning Banner if role === 'public' ── */}
        {role !== 'admin' && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldAlert className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300 font-bold">
                  AKSES TERBATAS — MODE PUBLIK
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">
                  Dasbor ini hanya dapat dikelola oleh admin platform. Silakan masuk terlebih dahulu.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 text-xs shrink-0 cursor-pointer shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              Masuk sebagai Admin
            </Link>
          </div>
        )}

        {/* ── Page Header (Editorial Swiss Style) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 animate-fade-in">
              <span className="size-1.5 bg-primary" />
              PENGELOLAAN ANGGARAN KABUPATEN TOBA
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap animate-fade-in"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Dasbor Pengelolaan Anggaran Daerah
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mt-1 animate-fade-in">
              Sandingkan data kebutuhan masyarakat, alokasi anggaran, dan usulan warga untuk perencanaan yang tepat sasaran.
            </p>
          </div>

          {/* Action Buttons: Report Link & BPS Sync */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href="/admin/report"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0 animate-fade-in"
            >
              <FileText className="size-3.5" />
              <span>Katalog Dokumen Laporan</span>
            </Link>

            {/* Sync Button */}
            <button
              onClick={handleSyncBPS}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted shadow-xs cursor-pointer shrink-0 animate-fade-in"
            >
              <RefreshCw className={cn('size-3.5 text-primary', syncing && 'animate-spin')} />
              {syncing ? 'Memperbarui Data...' : syncedSuccess ? '✓ Data Diperbarui' : 'Perbarui Data Publik (BPS)'}
            </button>
          </div>
        </div>

        {/* ── 4 Top Metrics Summary Cards (Biru Elegan) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="bg-blue-600 text-white border border-blue-500/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-100 font-semibold block">
              Total APBD Pilot (4 Kec)
            </span>
            <p className="text-2xl font-black font-mono text-white">
              Rp 126,0 M
            </p>
            <span className="text-xs text-blue-100/80 block">Alokasi resmi tahun 2026</span>
          </div>

          <div className="bg-blue-600 text-white border border-blue-500/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-100 font-semibold block">
              Wilayah Prioritas Kritis
            </span>
            <p className="text-2xl font-black font-mono text-white flex items-baseline gap-2 flex-wrap">
              <span>Habinsaran</span>
              <span className="text-rose-300 font-mono text-lg font-black tracking-tight">
                (+30.0)
              </span>
            </p>
            <span className="text-xs text-blue-100/80 block">Gap jalan rusak mendesak</span>
          </div>

          <div className="bg-blue-600 text-white border border-blue-500/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-100 font-semibold block">
              Partisipasi Suara Warga
            </span>
            <p className="text-2xl font-black font-mono text-white">
              {districtSubmissions.length} Aspirasi
            </p>
            <span className="text-xs text-blue-100/80 block">100% tervalidasi kuota</span>
          </div>

          <div className="bg-blue-600 text-white border border-blue-500/40 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-100 font-semibold block">
              Wilayah Fiskal Stabil
            </span>
            <p className="text-2xl font-black font-mono text-white flex items-baseline gap-2 flex-wrap">
              <span>Balige</span>
              <span className="text-emerald-300 font-mono text-lg font-black tracking-tight">
                (-25.5)
              </span>
            </p>
            <span className="text-xs text-blue-100/80 block">Potensi subsidi silang</span>
          </div>
        </div>

        {/* ── Main Analytical Section: 3-Bar Chart Comparison ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-stretch animate-fade-in" style={{ animationDelay: '300ms' }}>

          {/* Left: 3-Bar Comparison Inspector (Span 8) */}
          <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">

            {/* Filter and District Switcher */}
            <div className="border-b border-border pb-4 space-y-3.5">
              <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3">
                <div>
                  <h3
                    className="text-base font-bold text-foreground"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Perbandingan 3 Batang: Masalah Lapangan vs APBD vs Aspirasi Warga
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Menyandingkan tingkat masalah nyata (data terbuka resmi), alokasi pagu APBD, dan aspirasi masyarakat.
                  </p>
                </div>

                {/* District Selector Tabs (Bebas Swipe, Semua Wilayah Terlihat Utuh) */}
                <div className="inline-flex items-center gap-1 bg-blue-600 dark:bg-blue-700 p-1 rounded-xl border border-blue-500 shadow-sm shrink-0 self-start">
                  {districts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDistrictId(d.id)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                        selectedDistrictId === d.id
                          ? 'bg-white text-blue-700 dark:text-blue-800 shadow-sm font-bold'
                          : 'text-white/85 hover:text-white hover:bg-white/15'
                      )}
                    >
                      {d.name.replace('Kecamatan ', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3-Bar Grouped Recharts Chart */}
            <div className="my-auto py-2">
              <AdminBarChart district={currentDistrict} avgAspirations={avgAspirations} />
            </div>

            {/* Bottom Chart Legend & Transparency Note */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>* Batang Merah: Tingkat Masalah · Biru: Alokasi APBD · Hijau: Usulan Warga</span>
              <span className="font-mono text-[10px]">Data Publik Terbuka 2026</span>
            </div>
          </div>

          {/* Right: Pusat Analisis & Selisih Anggaran Dinamis (Span 4) */}
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">

            {/* Header & Status */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3
                className="text-xs font-bold text-foreground uppercase tracking-wider"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Pusat Selisih Anggaran
              </h3>
              <span className={cn(
                'text-xs font-mono font-bold uppercase tracking-wider',
                currentAdvisory.status === 'KRITIS'
                  ? 'text-rose-600 dark:text-rose-400'
                  : currentAdvisory.status === 'WASPADA'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
              )}>
                {currentAdvisory.status}
              </span>
            </div>

            {/* Dropdown Pemilihan Wilayah (Menggantikan 4 tab yang bikin rame) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                Pilih Wilayah Telaah:
              </label>
              <div className="relative">
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/60 text-xs font-bold text-foreground cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-10 shadow-2xs transition-colors"
                >
                  {districts.map((d) => {
                    const adv = DISTRICT_ADVISORIES[d.id]
                    return (
                      <option key={d.id} value={d.id}>
                        {d.name} ({adv?.gapLabel || 'Normal'})
                      </option>
                    )
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <ChevronDown className="size-4" />
                </div>
              </div>
            </div>

            {/* Ringkasan Telaah Kebijakan (Alami, Tanpa Nested Card) */}
            <div className="space-y-3 py-1">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Sektor Fokus:
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                    {currentAdvisory.shiftLabel}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-foreground leading-snug" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {currentAdvisory.sectorName}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {currentAdvisory.headline}.
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <span className="text-foreground font-semibold shrink-0">Estimasi wujud:</span>
                <span className="text-foreground font-medium">{currentAdvisory.physicalImpact}</span>
              </div>
            </div>

            {/* Dropdown Akordion Rincian Data Komparasi (Sembunyi Default Biar Depannya Tenang & Ringkas) */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <button
                type="button"
                onClick={() => setShowAdvisoryDetails(!showAdvisoryDetails)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <span>Rincian Komparasi BPS &amp; APBD</span>
                <ChevronDown className={cn('size-3.5 transition-transform duration-200', showAdvisoryDetails && 'rotate-180')} />
              </button>

              {showAdvisoryDetails && (
                <div className="p-3.5 border-t border-border bg-muted/20 space-y-2.5 animate-in fade-in duration-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Masalah Lapangan (BPS):</span>
                    <span className="font-mono font-bold text-foreground">{currentAdvisory.problemPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Alokasi Pagu APBD:</span>
                    <span className="font-mono font-bold text-foreground">{currentAdvisory.budgetPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Usulan Aspirasi Warga:</span>
                    <span className="font-mono font-bold text-foreground">{currentAdvisory.aspirasiPct}%</span>
                  </div>
                  <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground leading-relaxed">
                    Catatan: {currentAdvisory.impactSub}.
                  </div>
                </div>
              )}
            </div>

            {/* Action Button & Link ke Laporan */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleOpenEditWithBudget(currentDistrict, currentAdvisory.suggestedBudget)}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-[0.99]"
              >
                <span>Uji Saran ke Simulasi</span>
                <ArrowRight className="size-3.5" />
              </button>

              <Link
                href="/admin/report"
                className="w-full py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <FileText className="size-3.5" />
                <span>Lihat Dokumen Kajian Lengkap</span>
              </Link>
            </div>

            {/* Bottom Note */}
            <p className="text-[10px] text-muted-foreground text-center font-mono">
              Data Terbuka BPS &amp; APBD Kabupaten Toba 2026
            </p>

          </div>

        </div>

        {/* ── District Budget Management Table ── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-0 animate-fade-in" style={{ animationDelay: '420ms' }}>
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Manajemen Alokasi Anggaran 4 Kecamatan
              </h3>
              <p className="text-xs text-muted-foreground">
                Ubah persentase pagu untuk menyimulasikan dampak perubahan kebijakan terhadap Gap Score secara instan.
              </p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              MANAGEMENT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kecamatan</th>
                  <th className="px-4 py-3.5">Pagu APBD</th>
                  <th className="px-4 py-3.5">Infrastruktur</th>
                  <th className="px-4 py-3.5">Kesehatan</th>
                  <th className="px-4 py-3.5">Pendidikan</th>
                  <th className="px-4 py-3.5">Sosial</th>
                  <th className="px-4 py-3.5">Gap Score</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {districts.map((d) => {
                  const status = d.gap_status || 'PROPORTIONAL'
                  const color = getStatusColor(status)

                  return (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-foreground">{d.name}</td>
                      <td className="px-4 py-4 font-mono">{formatRupiah(d.total_budget_idr)}</td>
                      <td className="px-4 py-4 font-mono font-semibold text-foreground">{d.budget_infra_pct}%</td>
                      <td className="px-4 py-4 font-mono font-semibold text-foreground">{d.budget_health_pct}%</td>
                      <td className="px-4 py-4 font-mono font-semibold text-foreground">{d.budget_edu_pct}%</td>
                      <td className="px-4 py-4 font-mono font-semibold text-foreground">{d.budget_social_pct}%</td>
                      <td className="px-4 py-4 font-mono font-bold">+{d.overall_gap_score}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted border border-border text-[10px] font-mono text-foreground font-semibold">
                          <span className={cn('size-1.5 rounded-full', color.dot)} />
                          {color.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
                        >
                          <Edit3 className="size-3" /> Edit Alokasi
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Edit Budget Modal ── */}
        {editingDistrict && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3
                    className="text-base font-bold text-foreground"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Simulasi Realokasi Anggaran
                  </h3>
                  <p className="text-xs text-muted-foreground">{editingDistrict.name}</p>
                </div>
                <button
                  onClick={() => setEditingDistrict(null)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="space-y-4">
                {/* 4 Inputs */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span>Infrastruktur &amp; Jalan</span>
                      <span className="font-mono text-foreground">{editBudget.infra}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="70"
                      value={editBudget.infra}
                      onChange={(e) => setEditBudget((p) => ({ ...p, infra: Number(e.target.value) }))}
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span>Kesehatan &amp; Stunting</span>
                      <span className="font-mono text-foreground">{editBudget.health}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="70"
                      value={editBudget.health}
                      onChange={(e) => setEditBudget((p) => ({ ...p, health: Number(e.target.value) }))}
                      className="w-full accent-emerald-500 h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span>Pendidikan</span>
                      <span className="font-mono text-foreground">{editBudget.edu}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="70"
                      value={editBudget.edu}
                      onChange={(e) => setEditBudget((p) => ({ ...p, edu: Number(e.target.value) }))}
                      className="w-full accent-amber-500 h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span>Sosial &amp; Kemiskinan</span>
                      <span className="font-mono text-foreground">{editBudget.social}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="70"
                      value={editBudget.social}
                      onChange={(e) => setEditBudget((p) => ({ ...p, social: Number(e.target.value) }))}
                      className="w-full accent-violet-500 h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Total Alokasi Indicator Card (Desain Elegan & Jelas) */}
                <div
                  className={cn(
                    'p-3.5 rounded-2xl border transition-all duration-200 space-y-2.5 shadow-xs',
                    isEditValid
                      ? 'bg-emerald-500/8 border-emerald-500/30 dark:bg-emerald-950/20 dark:border-emerald-700/40'
                      : 'bg-rose-500/8 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-700/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'size-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs',
                          isEditValid
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        )}
                      >
                        {isEditValid ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <AlertTriangle className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-foreground block leading-tight">
                          Total Alokasi Anggaran
                        </span>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          {isEditValid
                            ? 'Alokasi pas 100% — Siap disimulasikan'
                            : editTotal < 100
                            ? `Kurang ${100 - editTotal}% lagi untuk mencapai 100%`
                            : `Kelebihan ${editTotal - 100}% — Harap kurangi alokasi`}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'px-3 py-1 rounded-xl text-sm font-black font-mono shrink-0 shadow-2xs',
                        isEditValid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      )}
                    >
                      {editTotal}%
                    </div>
                  </div>

                  {/* Multi-segment visual bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
                    <div style={{ width: `${Math.min(100, editBudget.infra)}%` }} className="bg-primary h-full transition-all" title={`Infrastruktur: ${editBudget.infra}%`} />
                    <div style={{ width: `${Math.min(100, editBudget.health)}%` }} className="bg-emerald-500 h-full transition-all" title={`Kesehatan: ${editBudget.health}%`} />
                    <div style={{ width: `${Math.min(100, editBudget.edu)}%` }} className="bg-amber-500 h-full transition-all" title={`Pendidikan: ${editBudget.edu}%`} />
                    <div style={{ width: `${Math.min(100, editBudget.social)}%` }} className="bg-violet-500 h-full transition-all" title={`Sosial: ${editBudget.social}%`} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDistrict(null)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!isEditValid}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-xs font-bold text-primary-foreground shadow-sm transition-opacity',
                      isEditValid ? 'bg-primary hover:opacity-90 cursor-pointer' : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                    )}
                  >
                    Simpan &amp; Perbarui
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Floating Bubble Chat Trigger Widget (Bottom Right) ── */}
        {!showChatModal && (
          <button
            type="button"
            onClick={() => {
              setChatDistrictFilter('all')
              setShowChatModal(true)
            }}
            className="fixed bottom-6 right-6 z-40 size-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-blue-500/25 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/20"
            title="Aspirasi Warga"
            aria-label="Buka Aspirasi Warga"
          >
            <MessageCircle className="size-5" />
            {ALL_SUBMISSIONS.length > 0 && (
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center border-2 border-background shadow-xs">
                {ALL_SUBMISSIONS.length}
              </span>
            )}
          </button>
        )}

        {/* ── Modern Floating Chat Widget (Bottom Right Popover) ── */}
        {showChatModal && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[400px] sm:w-[440px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-5rem)] bg-card/95 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">

            {/* Chat Widget Header */}
            <div className="px-4 py-3.5 border-b border-border/80 flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <MessagesSquare className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div>
                    <h3
                      className="text-sm font-bold text-foreground truncate"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      Dialog Aspirasi Warga
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {ALL_SUBMISSIONS.length} usulan riil warga 4 kecamatan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChatModal(false)}
                className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
                title="Tutup Chat"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Filter Toolbar & Search */}
            <div className="p-3 border-b border-border/60 bg-muted/15 space-y-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Cari kata kunci (jalan, stunting, pupuk, jembatan)..."
                  className="w-full pl-8.5 pr-7 py-2 rounded-xl bg-card border border-border/70 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
                {chatSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setChatSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* District Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setChatDistrictFilter('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer',
                    chatDistrictFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60'
                  )}
                >
                  Semua ({ALL_SUBMISSIONS.length})
                </button>
                {districts.map((d) => {
                  const count = ALL_SUBMISSIONS.filter((s) => s.district_id === d.id).length
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setChatDistrictFilter(d.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer',
                        chatDistrictFilter === d.id
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60'
                      )}
                    >
                      {d.name.replace('Kecamatan ', '')} ({count})
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setChatDistrictFilter('bookmarked')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1',
                    chatDistrictFilter === 'bookmarked'
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60'
                  )}
                >
                  <Bookmark className="size-3" />
                  <span>Ditandai ({bookmarkedAspirations.length})</span>
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-muted/5">
              {chatFilteredSubmissions.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <MessageCircle className="size-9 text-muted-foreground mx-auto opacity-40" />
                  <p className="text-xs font-semibold text-foreground">Tidak ada aspirasi yang cocok</p>
                  <p className="text-[11px] text-muted-foreground">
                    Coba ganti kata kunci atau ubah filter kecamatan.
                  </p>
                </div>
              ) : (
                chatFilteredSubmissions.map((sub) => {
                  const isBookmarked = bookmarkedAspirations.includes(sub.id)
                  return (
                    <div
                      key={sub.id}
                      className={cn(
                        'group relative rounded-2xl p-4 transition-all duration-200 border',
                        isBookmarked
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/50 shadow-xs'
                          : 'bg-card hover:bg-card/90 border-border/80 hover:border-blue-400/50 dark:hover:border-blue-600/50 shadow-xs'
                      )}
                    >
                      {/* Author & Header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn('size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs', sub.avatarBg)}>
                            {sub.avatar}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-foreground block truncate">
                              {sub.author}
                            </span>
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold block">
                              {sub.district_name}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                          {sub.timeAgo}
                        </span>
                      </div>

                      {/* Citizen Message Text (Readable, comfortable 13px) */}
                      <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-100 font-normal">
                        {sub.notes}
                      </p>

                      {/* Rincian Persentase Alokasi Warga & Tombol Aksi */}
                      <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-col gap-2">
                        {/* 4 Angka Alokasi Manual dari Tabel citizen_submissions */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground flex-wrap gap-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Infra: <strong className="text-foreground">{sub.alloc_infra_pct}%</strong>
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Kes: <strong className="text-foreground">{sub.alloc_health_pct}%</strong>
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Edu: <strong className="text-foreground">{sub.alloc_edu_pct}%</strong>
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Sos: <strong className="text-foreground">{sub.alloc_social_pct}%</strong>
                          </span>
                        </div>

                        {/* Actions Row (Tandai & Uji Usulan - Pasti Sebaris) */}
                        <div className="flex items-center justify-end gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(sub.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0',
                              isBookmarked
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold'
                                : 'bg-muted/40 hover:bg-muted border-border/70 text-muted-foreground hover:text-foreground'
                            )}
                            title={isBookmarked ? 'Ditandai untuk rujukan Musrenbang' : 'Tandai usulan untuk rujukan Musrenbang'}
                          >
                            <Bookmark className={cn('size-3.5', isBookmarked && 'fill-amber-500 text-amber-500')} />
                            <span className="whitespace-nowrap">{isBookmarked ? 'Ditandai' : 'Tandai'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const targetDistrict = districts.find((d) => d.id === sub.district_id) || currentDistrict
                              setShowChatModal(false)
                              handleOpenEditWithBudget(targetDistrict, {
                                infra: sub.alloc_infra_pct,
                                health: sub.alloc_health_pct,
                                edu: sub.alloc_edu_pct,
                                social: sub.alloc_social_pct,
                              })
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                            title="Simulasikan usulan spesifik warga ini ke kalkulator APBD"
                          >
                            <Zap className="size-3.5 fill-white shrink-0" />
                            <span className="whitespace-nowrap">Uji Usulan Ini</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Chat Footer */}
            <div className="px-4 py-3 border-t border-border/80 bg-muted/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>Menampilkan <strong>{chatFilteredSubmissions.length}</strong> usulan warga</span>
              </div>
              <button
                type="button"
                onClick={() => setShowChatModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-border/80 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
