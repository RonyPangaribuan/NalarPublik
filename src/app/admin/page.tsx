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
import { cn } from '@/lib/utils'

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

  const currentDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[3]
  const gaps = calculateSectorGaps(currentDistrict)

  // Calculate citizen average submissions for current district
  const districtSubmissions = INITIAL_SUBMISSIONS.filter((s) => s.district_id === currentDistrict.id)
  const avgAspirations = {
    infra: districtSubmissions.length
      ? districtSubmissions.reduce((acc, s) => acc + s.alloc_infra_pct, 0) / districtSubmissions.length
      : 0,
    health: districtSubmissions.length
      ? districtSubmissions.reduce((acc, s) => acc + s.alloc_health_pct, 0) / districtSubmissions.length
      : 0,
    edu: districtSubmissions.length
      ? districtSubmissions.reduce((acc, s) => acc + s.alloc_edu_pct, 0) / districtSubmissions.length
      : 0,
    social: districtSubmissions.length
      ? districtSubmissions.reduce((acc, s) => acc + s.alloc_social_pct, 0) / districtSubmissions.length
      : 0,
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
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* ── Role Warning Banner if role === 'public' ── */}
        {role !== 'admin' && (
          <div className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-card border border-border text-foreground">
                <ShieldAlert className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                  MODE PUBLIK / TAMU AKTIF
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dasbor ini dioptimalkan untuk tim perencana Bappeda &amp; Musrenbang. Beralih ke Mode Admin untuk mengedit pagu alokasi anggaran.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRole('admin')}
              className="rounded-xl bg-primary text-primary-foreground font-bold px-4 py-2 text-xs shrink-0 cursor-pointer shadow-sm hover:opacity-90"
            >
              Aktifkan Mode Admin
            </button>
          </div>
        )}

        {/* ── Page Header (Editorial Swiss Style) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
              <span className="size-1.5 bg-primary" />
              PENGELOLAAN ANGGARAN KABUPATEN TOBA
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Dasbor Pengelolaan Anggaran Daerah
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mt-1">
              Sandingkan data kebutuhan masyarakat, alokasi anggaran, dan usulan warga untuk perencanaan yang tepat sasaran.
            </p>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncBPS}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted shadow-sm cursor-pointer shrink-0"
          >
            <RefreshCw className={cn('size-3.5 text-primary', syncing && 'animate-spin')} />
            {syncing ? 'Memperbarui Data...' : syncedSuccess ? '✓ Data Diperbarui' : 'Perbarui Data BPS'}
          </button>
        </div>

        {/* ── 4 Top Metrics Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Total APBD Pilot (4 Kec)
            </span>
            <p className="text-2xl font-black font-mono text-foreground">
              Rp 126,0 M
            </p>
            <span className="text-xs text-muted-foreground">Alokasi resmi tahun 2026</span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Wilayah Prioritas Kritis
            </span>
            <p className="text-2xl font-black font-mono text-rose-500">
              Habinsaran (+30.0)
            </p>
            <span className="text-xs text-muted-foreground">Gap jalan rusak mendesak</span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Partisipasi Suara Warga
            </span>
            <p className="text-2xl font-black font-mono text-foreground">
              {districtSubmissions.length} Aspirasi
            </p>
            <span className="text-xs text-muted-foreground">100% tervalidasi kuota</span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Wilayah Fiskal Stabil
            </span>
            <p className="text-2xl font-black font-mono text-emerald-500">
              Balige (-25.5)
            </p>
            <span className="text-xs text-muted-foreground">Potensi subsidi silang</span>
          </div>
        </div>

        {/* ── Main Analytical Section: 3-Bar Chart Comparison ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: 3-Bar Comparison Inspector (Span 8) */}
          <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

            {/* Filter and District Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <h3
                  className="text-base font-bold text-foreground"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Perbandingan 3 Batang: Masalah vs APBD vs Aspirasi Warga
                </h3>
                <p className="text-xs text-muted-foreground">
                  Menyandingkan kebutuhan riil (BPS), rencana dinas (APBD), dan kehendak masyarakat.
                </p>
              </div>

              {/* District Selector Tabs */}
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border overflow-x-auto">
                {districts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistrictId(d.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                      selectedDistrictId === d.id
                        ? 'bg-card text-foreground shadow-sm font-bold border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {d.name.replace('Kecamatan ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Bar Grouped Recharts Chart */}
            <AdminBarChart district={currentDistrict} avgAspirations={avgAspirations} />
          </div>

          {/* Right: Anomaly Alerts & Realocation Recommendations (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-sm font-bold text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Detektor Anomali Kebijakan
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                PRIORITAS
              </span>
            </div>

            {/* Alert Card 1: Habinsaran (Critical) — Technical border-l-4 style, NOT neon pastel */}
            <div className="bg-card border border-border border-l-4 border-l-rose-500 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  PERINGATAN KRITIS // HABINSARAN
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">GAP +30.0</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                Tingkat kerusakan jalan mencapai <strong>46.0%</strong>, namun alokasi jalan APBD hanya <strong>16.0%</strong> (Aspirasi warga: <strong>47.5%</strong>).
              </p>
              <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground border border-border font-sans leading-relaxed">
                💡 <strong>Rekomendasi Bappeda:</strong> Realokasi minimal <strong>+15%</strong> ke sektor infrastruktur jalan sebelum musim hujan dari pos surplus.
              </div>
            </div>

            {/* Alert Card 2: Porsea (Warning) — Technical border-l-4 style */}
            <div className="bg-card border border-border border-l-4 border-l-amber-500 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  PERINGATAN WASPADA // PORSEA
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">GAP +15.5</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                Prevalensi stunting mencapai <strong>29.5%</strong>, berbanding alokasi faskes APBD <strong>14.0%</strong>.
              </p>
              <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground border border-border font-sans leading-relaxed">
                💡 <strong>Rekomendasi Bappeda:</strong> Realokasi minimal <strong>+8%</strong> untuk pengadaan makanan tambahan balita pesisir.
              </div>
            </div>

            {/* Feedback Suara Warga Feed */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-border pb-2.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquareQuote className="size-3.5 text-muted-foreground" /> Suara Aspirasi Warga
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">TERKINI</span>
              </div>
              <div className="space-y-2.5 text-xs">
                {districtSubmissions.slice(0, 2).map((sub, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-xl border border-border space-y-1">
                    <p className="text-foreground text-xs leading-relaxed">"{sub.notes}"</p>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      Usulan Infra: {sub.alloc_infra_pct}% · Kesehatan: {sub.alloc_health_pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ── District Budget Management Table ── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-0">
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

                {/* Total check */}
                <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs font-mono flex items-center justify-between">
                  <span>TOTAL ALOKASI (WAJIB 100%):</span>
                  <span className={cn('font-bold', isEditValid ? 'text-emerald-500' : 'text-rose-500')}>
                    {editTotal}%
                  </span>
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

      </div>
    </div>
  )
}
