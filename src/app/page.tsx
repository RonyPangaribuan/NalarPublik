'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Sliders,
  Database,
  MapPin,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Activity,
  ExternalLink,
  Users,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TobaTopoBackground } from '@/components/toba-topo-background'
import { useRoleStore } from '@/store/use-role-store'

// ── Master District Data (Synced with official Kabupaten Toba BPS & APBD 2026) ──
const DISTRICTS_CONFIG = {
  habinsaran: {
    id: 'habinsaran',
    name: 'Habinsaran',
    bpsCode: '1212020',
    type: 'Dataran Tinggi Parsoburan',
    status: 'CRITICAL',
    gapScore: '+30.0',
    topSector: 'Infrastruktur Jalan',
    bpsIssue: 46.0,
    apbdBudget: 16.0,
    paguAPBD: 'Rp 21,5 M',
    populasi: '18.950 jiwa',
    physicalImpact: '46.0% jalan desa rusak berat, namun hanya mendapat 16.0% pagu infrastruktur.',
    href: '/map?district=habinsaran',
  },
  porsea: {
    id: 'porsea',
    name: 'Porsea',
    bpsCode: '1212070',
    type: 'Sentra Perdagangan & Industri',
    status: 'WASPADA',
    gapScore: '+15.5',
    topSector: 'Kesehatan & Stunting',
    bpsIssue: 29.5,
    apbdBudget: 14.0,
    paguAPBD: 'Rp 26,8 M',
    populasi: '16.890 jiwa',
    physicalImpact: 'Prevalensi stunting mencapai 29.5%, alokasi kesehatan daerah baru 14.0%.',
    href: '/map?district=porsea',
  },
  laguboti: {
    id: 'laguboti',
    name: 'Laguboti',
    bpsCode: '1212040',
    type: 'Sentra Riset & Pendidikan',
    status: 'WASPADA',
    gapScore: '+7.0',
    topSector: 'Pendidikan & Ruang Kelas',
    bpsIssue: 24.0,
    apbdBudget: 27.0,
    paguAPBD: 'Rp 29,2 M',
    populasi: '23.410 jiwa',
    physicalImpact: '24.0% ruang kelas rusak, pagu pendidikan 27.0% mendekati kebutuhan riil.',
    href: '/map?district=laguboti',
  },
  balige: {
    id: 'balige',
    name: 'Balige',
    bpsCode: '1212010',
    type: 'Ibu Kota & Pariwisata Danau',
    status: 'SELARAS',
    gapScore: '-25.5',
    topSector: 'Infrastruktur Publik',
    bpsIssue: 14.5,
    apbdBudget: 40.0,
    paguAPBD: 'Rp 48,5 M',
    populasi: '45.820 jiwa',
    physicalImpact: 'Kebutuhan dasar 14.5% terserap oleh alokasi fiskal tinggi 40.0% (surplus infrastruktur).',
    href: '/map?district=balige',
  },
} as const

type DistrictId = keyof typeof DISTRICTS_CONFIG

// ── Swiss Status Helper (Neutral Matte, No Excessive Neon) ──
function getStatusBadge(status: string) {
  switch (status) {
    case 'CRITICAL':
      return {
        label: 'KRITIS',
        badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
        dotClass: 'bg-rose-500',
      }
    case 'WASPADA':
      return {
        label: 'WASPADA',
        badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        dotClass: 'bg-amber-500',
      }
    default:
      return {
        label: 'SELARAS',
        badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        dotClass: 'bg-emerald-500',
      }
  }
}

export default function HomePage() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId>('habinsaran')
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [activePerspective, setActivePerspective] = useState<'warga' | 'pengelola'>('warga')
  const { setRole } = useRoleStore()
  const current = DISTRICTS_CONFIG[selectedDistrict]
  const statusInfo = getStatusBadge(current.status)

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHero(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-200">

      {/* ── Background Topografi Wilayah Toba (Mencegah Layar Putih Polos) ── */}
      <TobaTopoBackground />

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 1: HERO SECTION (FULL 100VH 1-PAGE VIEWPORT)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col justify-between pt-24 pb-8 sm:pt-28 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Main Hero Row (Centered Vertically) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center my-auto">

          {/* Left Column: Headline (Strictly 2 lines) & Action */}
          <div className="lg:col-span-7 space-y-6">
            <h1
              className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.14] text-foreground"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Kawal APBD Kabupaten Toba,
              <br />
              <span className="text-primary">Berbasis Data Nyata.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 font-normal leading-relaxed max-w-xl">
              Menyandingkan data kebutuhan warga dengan alokasi anggaran daerah untuk memastikan
              setiap rupiah tepat sasaran bagi masyarakat Kabupaten Toba. 
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/map"
                className="inline-flex items-center gap-2.5 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm"
              >
                <span>Peta Kesenjangan Anggaran</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/simulator"
                className="inline-flex items-center gap-2.5 rounded-lg border border-border bg-card/90 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98] shadow-sm"
              >
                <Sliders size={16} className="text-muted-foreground" />
                <span>Simulasi Anggaran Warga</span>
              </Link>
            </div>

            {/* Verification Proofs */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                Data BPS &amp; Anggaran Resmi
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                Formula Terbuka
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                Tanpa Login
              </span>
            </div>
          </div>

          {/* Right Column: Peta & Animasi Borderless (Tanpa Card Box Apapun) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center select-none">
            <div className="w-full max-w-[420px] space-y-3">
              
              {/* Header HUD Borderless */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold tracking-wider text-foreground uppercase drop-shadow-xs">
                    PANTAUAN KABUPATEN TOBA
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  KLIK TITIK KECAMATAN
                </span>
              </div>

              {/* Interactive Radar SVG (100% Borderless, Melayang Bebas di Atas Wallpaper) */}
              <div className="relative w-full aspect-[4/3] flex items-center justify-center select-none">
                <svg
                  viewBox="0 0 360 260"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Circular ambient radar glow */}
                    <radialGradient id="radarAmbient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.16" />
                      <stop offset="70%" stopColor="#0284c7" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                    </radialGradient>

                    {/* Sweeping radar scanner sector gradient */}
                    <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Radar Scope Ambient Glow */}
                  <circle cx="160" cy="140" r="110" fill="url(#radarAmbient)" />

                  {/* Concentric Radar Rings */}
                  <circle cx="160" cy="140" r="110" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-500/40 dark:text-slate-400/40" strokeDasharray="3 3" />
                  <circle cx="160" cy="140" r="70" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-500/50 dark:text-slate-400/50" />
                  <circle cx="160" cy="140" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/40" />
                  
                  {/* Radar Crosshairs */}
                  <line x1="160" y1="20" x2="160" y2="250" stroke="currentColor" strokeWidth="0.7" className="text-slate-500/40 dark:text-slate-400/40" />
                  <line x1="40" y1="140" x2="280" y2="140" stroke="currentColor" strokeWidth="0.7" className="text-slate-500/40 dark:text-slate-400/40" />
                  
                  {/* Lake Toba Southern Coastline Silhouette */}
                  <path
                    d="M 60,30 
                       C 80,70 100,100 115,130 
                       C 125,150 120,180 145,210 
                       C 160,225 180,215 200,225 
                       L 20,240 L 20,30 Z"
                    fill="#0284c7"
                    fillOpacity="0.18"
                    stroke="#0284c7"
                    strokeWidth="1.4"
                    strokeOpacity="0.55"
                  />
                  <text x="75" y="115" className="font-mono text-[9px] fill-sky-800 dark:fill-sky-300 font-bold italic select-none">
                    Danau Toba
                  </text>

                  {/* Animated Rotating Radar Sweep (Native GPU SVG Animation, 60fps) */}
                  <g pointerEvents="none">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 160 140"
                      to="360 160 140"
                      dur="5.5s"
                      repeatCount="indefinite"
                    />
                    {/* Sweeping 36-degree sector arc */}
                    <path
                      d="M 160,140 L 160,30 A 110,110 0 0,1 224.65,51.01 Z"
                      fill="url(#radarSweepGradient)"
                    />
                    {/* Leading beam line */}
                    <line
                      x1="160"
                      y1="140"
                      x2="224.65"
                      y2="51.01"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeOpacity="0.9"
                    />
                  </g>

                  {/* ── District Node 1: Balige (Ibu Kota) ── */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedDistrict('balige')}
                  >
                    {/* Hitbox to prevent hover jitter */}
                    <circle cx="150" cy="190" r="20" fill="transparent" />

                    {/* Animated Pulse Wave when Selected */}
                    {selectedDistrict === 'balige' && (
                      <circle cx="150" cy="190" r="7" fill="none" stroke="#10b981" strokeWidth="1.5">
                        <animate attributeName="r" values="7;16;22" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.3;0" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="150"
                      cy="190"
                      r={selectedDistrict === 'balige' ? 7 : 5}
                      className={cn(
                        'fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-2 transition-all duration-150',
                        'group-hover:stroke-emerald-300 dark:group-hover:stroke-emerald-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="162"
                      y="194"
                      className={cn(
                        'font-mono text-[10px] select-none font-bold transition-colors',
                        selectedDistrict === 'balige' ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-slate-900 dark:fill-slate-100'
                      )}
                    >
                      Balige
                    </text>
                  </g>

                  {/* ── District Node 2: Laguboti ── */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedDistrict('laguboti')}
                  >
                    {/* Hitbox to prevent hover jitter */}
                    <circle cx="205" cy="175" r="20" fill="transparent" />

                    {/* Animated Pulse Wave when Selected */}
                    {selectedDistrict === 'laguboti' && (
                      <circle cx="205" cy="175" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                        <animate attributeName="r" values="7;16;22" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.3;0" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="205"
                      cy="175"
                      r={selectedDistrict === 'laguboti' ? 7 : 5}
                      className={cn(
                        'fill-amber-500 stroke-white dark:stroke-slate-900 stroke-2 transition-all duration-150',
                        'group-hover:stroke-amber-300 dark:group-hover:stroke-amber-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="216"
                      y="179"
                      className={cn(
                        'font-mono text-[10px] select-none font-bold transition-colors',
                        selectedDistrict === 'laguboti' ? 'fill-amber-600 dark:fill-amber-400' : 'fill-slate-900 dark:fill-slate-100'
                      )}
                    >
                      Laguboti
                    </text>
                  </g>

                  {/* ── District Node 3: Porsea (North/River outlet) ── */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedDistrict('porsea')}
                  >
                    {/* Hitbox to prevent hover jitter */}
                    <circle cx="180" cy="85" r="20" fill="transparent" />

                    {/* Animated Pulse Wave when Selected */}
                    {selectedDistrict === 'porsea' && (
                      <circle cx="180" cy="85" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                        <animate attributeName="r" values="7;16;22" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.3;0" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="180"
                      cy="85"
                      r={selectedDistrict === 'porsea' ? 7 : 5}
                      className={cn(
                        'fill-amber-500 stroke-white dark:stroke-slate-900 stroke-2 transition-all duration-150',
                        'group-hover:stroke-amber-300 dark:group-hover:stroke-amber-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="192"
                      y="89"
                      className={cn(
                        'font-mono text-[10px] select-none font-bold transition-colors',
                        selectedDistrict === 'porsea' ? 'fill-amber-600 dark:fill-amber-400' : 'fill-slate-900 dark:fill-slate-100'
                      )}
                    >
                      Porsea
                    </text>
                  </g>

                  {/* ── District Node 4: Habinsaran (Highland Southeast) ── */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedDistrict('habinsaran')}
                  >
                    {/* Hitbox to prevent hover jitter */}
                    <circle cx="280" cy="145" r="22" fill="transparent" />

                    {/* Animated Pulse Wave when Selected */}
                    {selectedDistrict === 'habinsaran' && (
                      <circle cx="280" cy="145" r="8" fill="none" stroke="#f43f5e" strokeWidth="1.5">
                        <animate attributeName="r" values="8;18;24" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.85;0.3;0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="280"
                      cy="145"
                      r={selectedDistrict === 'habinsaran' ? 7.5 : 5.5}
                      className={cn(
                        'fill-rose-500 stroke-white dark:stroke-slate-900 stroke-2 transition-all duration-150',
                        'group-hover:stroke-rose-300 dark:group-hover:stroke-rose-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="235"
                      y="130"
                      className={cn(
                        'font-mono text-[10px] select-none font-bold transition-colors',
                        selectedDistrict === 'habinsaran' ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-900 dark:fill-slate-100'
                      )}
                    >
                      Habinsaran
                    </text>
                  </g>
                </svg>
              </div>

              {/* Micro Status Readout Borderless */}
              <div className="flex items-center justify-between text-xs px-1 pt-1">
                <div>
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <span>Kecamatan {current.name}</span>
                    <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded border', statusInfo.badgeClass)}>
                      Selisih {current.gapScore}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                    {current.topSector} · Kebutuhan {current.bpsIssue}% vs Anggaran {current.apbdBudget}%
                  </p>
                </div>

                <Link
                  href={current.href}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-semibold transition-colors shrink-0 ml-2"
                >
                  <span>Lihat Peta</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* ── Bottom Scroll Indicator (Pemberitahuan Menuju Modul Data - Auto-Hide Saat Scrolled) ── */}
        <div
          className={cn(
            'flex items-center justify-center pt-4 transition-all duration-300 ease-out',
            scrolledPastHero ? 'opacity-0 pointer-events-none translate-y-3' : 'opacity-100 translate-y-0'
          )}
        >
          <a
            href="#ringkasan-fiskal"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-foreground transition-all shadow-sm"
          >
            <span>Ringkasan Anggaran &amp; Kebutuhan Warga</span>
            <ArrowDown size={12} className="animate-bounce" />
          </a>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 2: FISCAL & SOCIAL KPI STRIP (TERPISAH & MODULAR)
      ══════════════════════════════════════════════════════════════════ */}
      <section
        id="ringkasan-fiskal"
        className="relative z-10 border-y border-border/80 bg-slate-50/70 dark:bg-slate-900/50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Decorative Square Grid & Gradient Glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* Subtle Blueprint Square Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:32px_32px]" />
          {/* Ambient Top Glow */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(2, 132, 199, 0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
                RINGKASAN DATA KABUPATEN TOBA
              </p>
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Fakta Anggaran dan Kebutuhan Warga
              </h2>
            </div>
            <Link
              href="/open-data"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary hover:underline self-start md:self-auto"
            >
              <span>BUKA DATA TERBUKA</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* 4 Modular KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1 */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-mono uppercase">TOTAL BELANJA ANGGARAN</span>
                <Database size={15} className="text-primary" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground">
                Rp 1,42 T
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pagu APBD Kabupaten Toba Tahun Anggaran 2026.
              </p>
              <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground">
                Sumber: BPKAD Toba 2026
              </div>
            </div>

            {/* KPI 2 */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-mono uppercase">TINGKAT KEMISKINAN</span>
                <TrendingDown size={15} className="text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground">
                8,12%
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Persentase penduduk miskin, turun 0,34% dari survei 2024.
              </p>
              <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground">
                Sumber: BPS Toba DDA 2026
              </div>
            </div>

            {/* KPI 3 */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-mono uppercase">WILAYAH DENGAN SELISIH TINGGI</span>
                <AlertCircle size={15} className="text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground">
                2 / 4 <span className="text-xs text-muted-foreground font-sans font-normal">Kecamatan</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Habinsaran &amp; Porsea memerlukan perhatian dan penyesuaian alokasi.
              </p>
              <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground">
                Formula: Kebutuhan % - Anggaran %
              </div>
            </div>

            {/* KPI 4 */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-mono uppercase">PARTISIPASI WARGA</span>
                <Activity size={15} className="text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground">
                2.841 <span className="text-xs text-muted-foreground font-sans font-normal">Suara</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Masukan alokasi anggaran melalui simulasi mandiri warga.
              </p>
              <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground">
                Terverifikasi Tanpa Akun
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 3: LIVE ANOMALY & GAP INSPECTOR (TERPISAH & BERNAFAS)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border/70">
        {/* Background Decor: Radial Mesh & Technical Dot Grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* Soft Floating Ambient Orbs */}
          <div className="absolute top-1/4 -left-20 size-[550px] rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 size-[550px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/10 blur-[120px]" />
          
          {/* Fine Precision Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#475569_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-45 dark:opacity-35" />
        </div>

        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="max-w-2xl mb-8">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
              DETEKSI KESENJANGAN KEBIJAKAN
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Pantauan Kesenjangan Antarwilayah
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Sandingkan data kebutuhan masyarakat dengan alokasi anggaran daerah tahun 2026.
              Pilih kecamatan untuk memeriksa bidang prioritas.
            </p>
          </div>

        {/* Modular Card Container */}
        <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-xl overflow-hidden">
          
          {/* Tab Selector Bar */}
          <div className="flex items-center overflow-x-auto border-b border-border bg-muted/40 p-2 gap-1.5">
            {(Object.keys(DISTRICTS_CONFIG) as DistrictId[]).map((key) => {
              const d = DISTRICTS_CONFIG[key]
              const isSelected = selectedDistrict === key
              const badge = getStatusBadge(d.status)
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDistrict(key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer',
                    isSelected
                      ? 'bg-card text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                >
                  <span className={cn('size-2 rounded-full', badge.dotClass)} />
                  <span>Kec. {d.name}</span>
                  <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded border', badge.badgeClass)}>
                    Selisih {d.gapScore}%
                  </span>
                </button>
              )
            })}
          </div>

          {/* Workbench Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            
            {/* Left Area (8 cols): Sector Comparison */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                    BIDANG PRIORITAS UTAMA
                  </span>
                  <h3
                    className="text-xl font-bold text-foreground mt-0.5"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {current.topSector} · {current.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-muted-foreground">KODE WILAYAH:</span>
                  <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                    {current.bpsCode}
                  </span>
                </div>
              </div>

              {/* Side-by-side Progress Metrics */}
              <div className="space-y-5 rounded-xl border border-border/80 bg-background/60 p-5">
                
                {/* Metric Row 1: BPS Problem */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="flex items-center gap-2 font-bold text-foreground">
                      <span className="size-2 rounded-sm bg-primary" />
                      Tingkat Kebutuhan Warga
                    </span>
                    <span className="text-sm font-extrabold text-foreground">{current.bpsIssue}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${current.bpsIssue}%` }}
                    />
                  </div>
                </div>

                {/* Metric Row 2: APBD Allocation */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="flex items-center gap-2 font-bold text-foreground">
                      <span className="size-2 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
                      Porsi Alokasi Anggaran Daerah
                    </span>
                    <span className="text-sm font-extrabold text-foreground">{current.apbdBudget}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${current.apbdBudget}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Physical Reality Impact Box */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-start gap-3">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block font-medium mb-0.5">Kondisi di Lapangan:</strong>
                  {current.physicalImpact}
                </div>
              </div>

              {/* Sector Quick-Links */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-mono text-muted-foreground mr-1">Pilihan Bidang:</span>
                {['Infrastruktur', 'Kesehatan', 'Pendidikan', 'Sosial'].map((sec) => (
                  <Link
                    key={sec}
                    href={`/map?sector=${sec.toLowerCase()}`}
                    className="text-xs px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {sec}
                  </Link>
                ))}
              </div>

            </div>

            {/* Right Area (4 cols): Gap Priority & District Telemetry */}
            <div className="lg:col-span-4 p-6 sm:p-8 bg-muted/20 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    STATUS PRIORITAS
                  </span>
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold border', statusInfo.badgeClass)}>
                    {statusInfo.label}
                  </span>
                </div>

                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-foreground">
                    {current.gapScore}
                    <span className="text-base text-muted-foreground font-normal ml-1">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {parseFloat(current.gapScore) >= 20
                      ? 'Kesenjangan tinggi. Alokasi anggaran tertinggal di belakang kebutuhan nyata warga.'
                      : parseFloat(current.gapScore) >= 10
                        ? 'Kesenjangan waspada. Perlu peninjauan alokasi sebelum penetapan anggaran.'
                        : 'Alokasi anggaran telah seimbang dengan tingkat kebutuhan masyarakat.'}
                  </p>
                </div>

                {/* District Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">DANA DAERAH</span>
                    <strong className="text-sm font-bold font-mono text-foreground">{current.paguAPBD}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">POPULASI</span>
                    <strong className="text-sm font-bold font-mono text-foreground">{current.populasi}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Link
                  href={current.href}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span>Lihat Pada Peta Wilayah</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={`/compare?districtA=${current.id}&districtB=balige`}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <span>Bandingkan dengan Balige</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

            </div>

          </div>

        </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 4: MODULAR FEATURE ECOSYSTEM (BENTO GRID 4 PILAR)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-b border-border/80 bg-slate-100/70 dark:bg-slate-950/70 py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decor: Large Square Architectural Grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 85% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
              ALAT ANALISIS WARGA &amp; PEMDA
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Empat Pilar Transparansi NalarPublik
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Semua modul dapat diakses langsung oleh masyarakat umum maupun pengambil keputusan di Bappeda
              tanpa dinding pembatas akun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 1: Peta Kesenjangan */}
            <Link
              href="/map"
              className="group rounded-2xl border border-border/80 bg-card p-6 sm:p-8 hover:border-primary/60 hover:shadow-lg transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Peta Kesenjangan Anggaran
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lihat titik 4 kecamatan percontohan. Pantau perbedaan anggaran dan kebutuhan nyata masyarakat
                  dengan penanda warna yang mudah dipahami.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-border/70 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Buka Peta Wilayah</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 2: Simulasi Anggaran */}
            <Link
              href="/simulator"
              className="group rounded-2xl border border-border/80 bg-card p-6 sm:p-8 hover:border-primary/60 hover:shadow-lg transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Simulasi Anggaran Partisipatif
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Rancang pembagian anggaran daerah versi Anda secara seimbang. Batas 100% memastikan
                  setiap usulan warga realistis terhadap kemampuan keuangan daerah.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-border/70 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Mulai Simulasi Anggaran</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 3: Perbandingan Antarwilayah */}
            <Link
              href="/compare"
              className="group rounded-2xl border border-border/80 bg-card p-6 sm:p-8 hover:border-primary/60 hover:shadow-lg transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Perbandingan Antarwilayah
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Sandingkan 2 kecamatan secara berdampingan. Periksa keadilan pembagian dana anggaran
                  antara wilayah ibu kota dan dataran tinggi.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-border/70 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Mulai Perbandingan Wilayah</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 4: Portal Data Terbuka */}
            <Link
              href="/open-data"
              className="group rounded-2xl border border-border/80 bg-card p-6 sm:p-8 hover:border-primary/60 hover:shadow-lg transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Data Terbuka Anggaran
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Unduh seluruh data anggaran dan kebutuhan warga dalam format tabel (CSV) dengan satu klik,
                  dilengkapi kamus konversi biaya fisik yang mudah dipahami warga.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-border/70 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Unduh Data Terbuka CSV</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 5: DUA SUDUT PANDANG TRANSPARANSI (INTERACTIVE TAB SWITCHER)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/70 dark:bg-slate-950/70 overflow-hidden">
        {/* Ambient Radial Atmosphere (Tanpa Grid Kotak-Kotak) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(2, 132, 199, 0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto space-y-8 text-center">
          
          {/* Section Header */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              DUA SUDUT PANDANG TRANSPARANSI
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Satu Data, Dua Peran untuk Kabupaten Toba
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Pilih sudut pandang Anda untuk merasakan bagaimana data terbuka dapat digunakan
              oleh masyarakat luas maupun tim pengambil kebijakan daerah.
            </p>
          </div>

          {/* Segmented Switcher Control (Swiss Pill Toggle) */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-card border border-border shadow-sm">
            <button
              type="button"
              onClick={() => setActivePerspective('warga')}
              className={cn(
                'flex items-center gap-2.5 px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer',
                activePerspective === 'warga'
                  ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users size={16} />
              <span>Untuk Warga (Publik)</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePerspective('pengelola')}
              className={cn(
                'flex items-center gap-2.5 px-5 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer',
                activePerspective === 'pengelola'
                  ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Building2 size={16} />
              <span>Untuk Pengelola (Pemda)</span>
            </button>
          </div>

          {/* Tombol Aksi yang Ter-spawn (Sederhana & Tanpa Card) */}
          <div className="pt-2 min-h-[96px] flex flex-col items-center justify-center">
            {activePerspective === 'warga' ? (
              <div className="space-y-4 animate-in fade-in duration-300 flex flex-col items-center">
                <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                  Rancang simulasi alokasi anggaran daerah secara mandiri dan sampaikan aspirasi warga tanpa hambatan.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/simulator"
                    onClick={() => setRole('public')}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm hover:shadow"
                  >
                    <span>Mulai Simulasi Anggaran Warga</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-5 py-3.5 text-xs sm:text-sm font-semibold text-foreground transition-all"
                  >
                    <span>Buka Peta Kesenjangan</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300 flex flex-col items-center">
                <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                  Akses dasbor perencanaan dan evaluasi kebijakan belanja daerah berbasis bukti lapangan Bappeda.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/admin"
                    onClick={() => setRole('admin')}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm hover:shadow"
                  >
                    <span>Buka Dasbor Anggaran Daerah</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/admin/report"
                    onClick={() => setRole('admin')}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-muted px-5 py-3.5 text-xs sm:text-sm font-semibold text-foreground transition-all"
                  >
                    <span>Lihat Format Laporan PDF</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  )
}
