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
  Check,
  CheckCircle2,
  AlertCircle,
  Activity,
  Users,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TobaTopoBackground } from '@/components/toba-topo-background'
import { useRoleStore } from '@/store/use-role-store'
import { FadeIn } from '@/components/fade-in'
import { TobaKpiSlider } from '@/components/toba-kpi-slider'

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

// ── Swiss Status Helper (Solid Micro-Badge Opsi 3) ──
function getStatusBadge(status: string) {
  switch (status) {
    case 'CRITICAL':
      return {
        label: 'KRITIS',
        badgeClass: 'bg-rose-600 text-white font-bold shadow-xs',
        dotClass: 'bg-rose-500',
      }
    case 'WASPADA':
      return {
        label: 'WASPADA',
        badgeClass: 'bg-amber-600 text-white font-bold shadow-xs',
        dotClass: 'bg-amber-500',
      }
    default:
      return {
        label: 'SELARAS',
        badgeClass: 'bg-emerald-600 text-white font-bold shadow-xs',
        dotClass: 'bg-emerald-500',
      }
  }
}

// ── Full Hero Description (Digunakan untuk efek ketik bertahap) ──
const FULL_HERO_DESC =
  'Menyandingkan data kebutuhan warga dengan alokasi anggaran daerah untuk memastikan setiap rupiah tepat sasaran bagi masyarakat Toba.'

export default function HomePage() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId>('habinsaran')
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [activePerspective, setActivePerspective] = useState<'warga' | 'pengelola'>('warga')
  const { setRole } = useRoleStore()
  const current = DISTRICTS_CONFIG[selectedDistrict]
  const statusInfo = getStatusBadge(current.status)

  // Typewriter effect state for hero description
  const [typedDesc, setTypedDesc] = useState('')
  const [isTypingDone, setIsTypingDone] = useState(false)

  useEffect(() => {
    // Mulai efek ketik setelah headline & elemen visual utama selesai spawn (~900ms)
    const timeout = setTimeout(() => {
      let i = 0
      const timer = setInterval(() => {
        if (i < FULL_HERO_DESC.length) {
          setTypedDesc(FULL_HERO_DESC.slice(0, i + 1))
          i++
        } else {
          clearInterval(timer)
          setIsTypingDone(true)
        }
      }, 22)

      return () => clearInterval(timer)
    }, 900)

    return () => clearTimeout(timeout)
  }, [])

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
      <section className="relative z-10 min-h-0 lg:min-h-screen flex flex-col justify-start lg:justify-between pt-[84px] sm:pt-24 lg:pt-28 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
        
        {/* Main Hero Row (Mobile: Judul -> Gambar -> Deskripsi -> Tombol, Desktop: Side-by-Side Centered) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 lg:gap-12 items-center my-0 lg:my-auto">

          {/* 1. Mobile Headline (Hanya di mobile < lg) — JUDUL (Lebih Melebar) */}
          <div className="lg:hidden text-center w-full px-0 pt-0.5 pb-0.5 animate-fade-in">
            <h1
              className="text-[29px] xs:text-[33px] sm:text-4xl font-extrabold tracking-tight leading-[1.12] text-slate-950 dark:text-white"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Kawal APBD Kabupaten Toba,
              <br />
              <span className="text-blue-900 dark:text-sky-300 font-black">Berbasis Data Nyata.</span>
            </h1>
          </div>

          {/* 2. Peta & Animasi Borderless — GAMBAR (Diperkecil di mobile, kolom kanan [order-2] di desktop) */}
          <div className="lg:col-span-5 lg:order-2 flex flex-col items-center lg:items-end justify-center select-none w-full animate-fade-in">
            <div className="w-full max-w-[255px] xs:max-w-[275px] sm:max-w-[380px] lg:max-w-[420px] space-y-1.5 sm:space-y-3">
              
              {/* Header HUD Borderless — Sebaris di Mobile */}
              <div className="flex items-center justify-between px-0.5 sm:px-1 gap-1">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  <span className="size-1.5 sm:size-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] font-mono font-bold tracking-wide sm:tracking-wider text-foreground uppercase drop-shadow-xs whitespace-nowrap">
                    PANTAUAN KABUPATEN TOBA
                  </span>
                </div>
                <span className="text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap shrink-0">
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
                    {/* Circular ambient radar glow — dipertegas */}
                    <radialGradient id="radarAmbient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1668e8" stopOpacity="0.30" />
                      <stop offset="70%" stopColor="#1668e8" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#1668e8" stopOpacity="0" />
                    </radialGradient>

                    {/* Siluet Danau Toba Blue Gradient — dipertegas & solid */}
                    <linearGradient id="lakeFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1668e8" stopOpacity="0.55" />
                      <stop offset="60%" stopColor="#0284c7" stopOpacity="0.42" />
                      <stop offset="100%" stopColor="#0369a1" stopOpacity="0.32" />
                    </linearGradient>

                    {/* Sweeping radar scanner sector gradient — dipertegas */}
                    <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1668e8" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Radar Scope Ambient Glow */}
                  <circle cx="160" cy="140" r="110" fill="url(#radarAmbient)" />

                  {/* Concentric Radar Rings — Garis Hitam Pekat Dipertegas */}
                  <circle cx="160" cy="140" r="110" fill="none" stroke="#0f172a" strokeWidth="1.6" strokeOpacity="0.75" strokeDasharray="4 3" className="dark:stroke-slate-200 dark:stroke-opacity-70" />
                  <circle cx="160" cy="140" r="70" fill="none" stroke="#0f172a" strokeWidth="1.8" strokeOpacity="0.85" className="dark:stroke-slate-200 dark:stroke-opacity-80" />
                  <circle cx="160" cy="140" r="30" fill="none" stroke="#0f172a" strokeWidth="2.0" strokeOpacity="0.9" className="dark:stroke-slate-200 dark:stroke-opacity-90" />
                  
                  {/* Radar Crosshairs — Garis Hitam Pekat Dipertegas */}
                  <line x1="160" y1="20" x2="160" y2="250" stroke="#0f172a" strokeWidth="1.6" strokeOpacity="0.75" className="dark:stroke-slate-200 dark:stroke-opacity-75" />
                  <line x1="40" y1="140" x2="280" y2="140" stroke="#0f172a" strokeWidth="1.6" strokeOpacity="0.75" className="dark:stroke-slate-200 dark:stroke-opacity-75" />
                  
                  {/* Radar Center Pivot Point */}
                  <circle cx="160" cy="140" r="2.5" fill="#0f172a" className="dark:fill-slate-200" />
                  
                  {/* Lake Toba Southern Coastline Silhouette — Garis & Warna Biru Dipertegas Nyata */}
                  <path
                    d="M 60,30 
                       C 80,70 100,100 115,130 
                       C 125,150 120,180 145,210 
                       C 160,225 180,215 200,225 
                       L 20,240 L 20,30 Z"
                    fill="url(#lakeFillGradient)"
                    stroke="#1668e8"
                    strokeWidth="2.4"
                    strokeOpacity="0.95"
                  />
                  <text
                    x="75"
                    y="115"
                    className="font-mono text-[10px] fill-blue-700 dark:fill-blue-600 font-extrabold italic select-none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    paintOrder="stroke fill"
                  >
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
                    {/* Leading beam line — dipertegas */}
                    <line
                      x1="160"
                      y1="140"
                      x2="224.65"
                      y2="51.01"
                      stroke="#2563eb"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeOpacity="0.95"
                    />
                  </g>

                  {/* ── District Node 1: Balige (Ibu Kota) ── */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedDistrict('balige')}
                  >
                    {/* Hitbox to prevent hover jitter */}
                    <circle cx="150" cy="190" r="22" fill="transparent" />

                    {/* Continuous Dual Radar Waves (Selalu Aktif & Jelas Terlihat) */}
                    <circle cx="150" cy="190" r="7" fill="none" stroke="#10b981" strokeWidth="2">
                      <animate attributeName="r" values="7;18;27" dur="2.4s" begin="0s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.95;0.4;0" dur="2.4s" begin="0s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="150" cy="190" r="7" fill="none" stroke="#10b981" strokeWidth="1.6">
                      <animate attributeName="r" values="7;18;27" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.75;0.25;0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                    </circle>

                    {/* Extra Selected Accent Wave */}
                    {selectedDistrict === 'balige' && (
                      <circle cx="150" cy="190" r="10" fill="none" stroke="#10b981" strokeWidth="2.2">
                        <animate attributeName="r" values="7;22;32" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.4;0" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="150"
                      cy="190"
                      r={selectedDistrict === 'balige' ? 7.5 : 6}
                      className={cn(
                        'fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-[2.5px] transition-all duration-150',
                        'group-hover:stroke-emerald-300 dark:group-hover:stroke-emerald-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="162"
                      y="194"
                      className={cn(
                        'font-mono text-[10.5px] select-none font-extrabold transition-colors',
                        selectedDistrict === 'balige' ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-slate-950 dark:fill-slate-950'
                      )}
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
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
                    <circle cx="205" cy="175" r="22" fill="transparent" />

                    {/* Continuous Dual Radar Waves (Selalu Aktif & Jelas Terlihat) */}
                    <circle cx="205" cy="175" r="7" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <animate attributeName="r" values="7;18;27" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.95;0.4;0" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="205" cy="175" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.6">
                      <animate attributeName="r" values="7;18;27" dur="2.4s" begin="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.75;0.25;0" dur="2.4s" begin="1.8s" repeatCount="indefinite" />
                    </circle>

                    {/* Extra Selected Accent Wave */}
                    {selectedDistrict === 'laguboti' && (
                      <circle cx="205" cy="175" r="10" fill="none" stroke="#f59e0b" strokeWidth="2.2">
                        <animate attributeName="r" values="7;22;32" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.4;0" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="205"
                      cy="175"
                      r={selectedDistrict === 'laguboti' ? 7.5 : 6}
                      className={cn(
                        'fill-amber-500 stroke-white dark:stroke-slate-900 stroke-[2.5px] transition-all duration-150',
                        'group-hover:stroke-amber-300 dark:group-hover:stroke-amber-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="216"
                      y="179"
                      className={cn(
                        'font-mono text-[10.5px] select-none font-extrabold transition-colors',
                        selectedDistrict === 'laguboti'
                          ? 'fill-amber-700 dark:fill-slate-950 font-black'
                          : 'fill-slate-950 dark:fill-slate-950'
                      )}
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
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
                    <circle cx="180" cy="85" r="22" fill="transparent" />

                    {/* Continuous Dual Radar Waves (Selalu Aktif & Jelas Terlihat) */}
                    <circle cx="180" cy="85" r="7" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <animate attributeName="r" values="7;18;27" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.95;0.4;0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="180" cy="85" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.6">
                      <animate attributeName="r" values="7;18;27" dur="2.4s" begin="0.0s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.75;0.25;0" dur="2.4s" begin="0.0s" repeatCount="indefinite" />
                    </circle>

                    {/* Extra Selected Accent Wave */}
                    {selectedDistrict === 'porsea' && (
                      <circle cx="180" cy="85" r="10" fill="none" stroke="#f59e0b" strokeWidth="2.2">
                        <animate attributeName="r" values="7;22;32" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.4;0" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="180"
                      cy="85"
                      r={selectedDistrict === 'porsea' ? 7.5 : 6}
                      className={cn(
                        'fill-amber-500 stroke-white dark:stroke-slate-900 stroke-[2.5px] transition-all duration-150',
                        'group-hover:stroke-amber-300 dark:group-hover:stroke-amber-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="192"
                      y="89"
                      className={cn(
                        'font-mono text-[10.5px] select-none font-extrabold transition-colors',
                        selectedDistrict === 'porsea'
                          ? 'fill-amber-700 dark:fill-slate-950 font-black'
                          : 'fill-slate-950 dark:fill-slate-950'
                      )}
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
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
                    <circle cx="280" cy="145" r="24" fill="transparent" />

                    {/* Continuous Dual Radar Waves (Selalu Aktif & Jelas Terlihat) */}
                    <circle cx="280" cy="145" r="8" fill="none" stroke="#f43f5e" strokeWidth="2.2">
                      <animate attributeName="r" values="8;19;28" dur="2.4s" begin="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.95;0.4;0" dur="2.4s" begin="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="280" cy="145" r="8" fill="none" stroke="#f43f5e" strokeWidth="1.6">
                      <animate attributeName="r" values="8;19;28" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.75;0.25;0" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
                    </circle>

                    {/* Extra Selected Accent Wave */}
                    {selectedDistrict === 'habinsaran' && (
                      <circle cx="280" cy="145" r="11" fill="none" stroke="#f43f5e" strokeWidth="2.4">
                        <animate attributeName="r" values="8;24;34" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.45;0" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      cx="280"
                      cy="145"
                      r={selectedDistrict === 'habinsaran' ? 8 : 6.5}
                      className={cn(
                        'fill-rose-500 stroke-white dark:stroke-slate-900 stroke-[2.5px] transition-all duration-150',
                        'group-hover:stroke-rose-300 dark:group-hover:stroke-rose-400 group-hover:stroke-[3.5px]'
                      )}
                    />
                    <text
                      x="235"
                      y="130"
                      className={cn(
                        'font-mono text-[10.5px] select-none font-black transition-colors',
                        selectedDistrict === 'habinsaran'
                          ? 'fill-rose-700 dark:fill-slate-950'
                          : 'fill-slate-950 dark:fill-slate-950'
                      )}
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                    >
                      Habinsaran
                    </text>
                  </g>
                </svg>
              </div>

              {/* Micro Status Readout Borderless (Opsi 3: Solid Micro-Tag & Minimalist Pin Action) */}
              <div className="flex items-center justify-between text-[11px] sm:text-xs px-1 pt-1 gap-1.5 sm:gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] sm:text-xs">Kecamatan {current.name}</span>
                    <span className={cn('text-[9px] sm:text-[9.5px] font-mono px-1.5 py-0.5 rounded shadow-xs shrink-0 tracking-wide', statusInfo.badgeClass)}>
                      Selisih {current.gapScore}%
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 truncate sm:whitespace-normal">
                    {current.topSector} · Kebutuhan {current.bpsIssue}% vs Anggaran {current.apbdBudget}%
                  </p>
                </div>

                <Link
                  href={current.href}
                  className="group inline-flex items-center gap-1.5 text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-[10.5px] sm:text-xs py-0.5 px-1 rounded-md transition-all shrink-0"
                >
                  <span>Lihat Peta</span>
                  <span className="size-4.5 rounded-full bg-primary/15 dark:bg-blue-400/20 text-primary dark:text-blue-300 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                    <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </div>

            </div>
          </div>

          {/* 3 & 4. Deskripsi & Tombol — Tampil ke-3 & ke-4 di mobile, kolom kiri (order-1) di desktop */}
          <div className="lg:col-span-7 lg:order-1 space-y-3 sm:space-y-6 text-center lg:text-left animate-fade-in">
            {/* Desktop Headline (Hanya tampil di desktop >= lg) */}
            <h1
              className="hidden lg:block text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.14] text-slate-950 dark:text-white mx-auto lg:mx-0 animate-fade-in"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Kawal APBD Kabupaten Toba,
              <br />
              <span className="text-blue-900 dark:text-sky-300 font-black">Berbasis Data Nyata.</span>
            </h1>

            {/* 3. Deskripsi dengan Efek Ketik (Typewriter) Muncul Bertahap Setelah Elemen Utama Spawn */}
            <p className="text-xs sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0 min-h-[46px] sm:min-h-[52px]">
              <span>{typedDesc}</span>
              {!isTypingDone && (
                <span className="inline-block w-1.5 h-4 sm:h-5 ml-1 bg-primary animate-blink-cursor align-middle rounded-xs" />
              )}
            </p>

            {/* 4. Tombol CTAs dengan Efek Gerak Nambang-Nambang Halus 3x Lalu Stop */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-0.5 sm:pt-1 w-full max-w-[340px] xs:max-w-sm sm:max-w-none mx-auto lg:mx-0">
              <Link
                href="/map"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-2 rounded-lg bg-primary px-2.5 py-1.5 sm:px-5 sm:py-3 text-[10px] xs:text-[11px] sm:text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] shadow-sm whitespace-nowrap animate-nambang-1 cursor-pointer"
              >
                <span>Peta Kesenjangan Anggaran</span>
                <ArrowRight size={12} className="sm:size-4 shrink-0" />
              </Link>
              <Link
                href="/simulator"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-2 rounded-lg border border-border bg-card/90 backdrop-blur-sm px-2.5 py-1.5 sm:px-5 sm:py-3 text-[10px] xs:text-[11px] sm:text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98] shadow-sm whitespace-nowrap animate-nambang-2 cursor-pointer"
              >
                <Sliders size={12} className="sm:size-4 text-muted-foreground shrink-0" />
                <span>Simulasi Anggaran Warga</span>
              </Link>
            </div>

            {/* Verification Proofs (Muncul Anggun Bertahap) */}
            <div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 sm:gap-x-6 sm:gap-y-2 pt-0.5 sm:pt-1 text-[9.5px] sm:text-xs font-bold text-slate-950 dark:text-white animate-fade-in"
              style={{ animationDelay: '1.5s' }}
            >
              <div className="inline-flex items-center gap-1 sm:gap-2">
                <span className="size-3.5 sm:size-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="size-2 sm:size-3 stroke-[3.5]" />
                </span>
                <span>Data BPS &amp; Anggaran Resmi</span>
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-2">
                <span className="size-3.5 sm:size-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="size-2 sm:size-3 stroke-[3.5]" />
                </span>
                <span>Formula Terbuka</span>
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-2">
                <span className="size-3.5 sm:size-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="size-2 sm:size-3 stroke-[3.5]" />
                </span>
                <span>Tanpa Login</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Scroll Indicator (Pemberitahuan Menuju Modul Data - Auto-Hide Saat Scrolled) ── */}
        <div
          className={cn(
            'flex items-center justify-center pt-8 sm:pt-9 lg:pt-5 pb-2 sm:pb-3 transition-all duration-300 ease-out',
            scrolledPastHero ? 'opacity-0 pointer-events-none translate-y-3' : 'opacity-100 translate-y-0'
          )}
        >
          <a
            href="#ringkasan-fiskal"
            className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/70 backdrop-blur-md border border-white/50 dark:border-white/10 text-[8.5px] sm:text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-foreground transition-all shadow-xs"
          >
            <span>Ringkasan Anggaran &amp; Kebutuhan Warga</span>
            <ArrowDown size={9} className="sm:size-3 animate-bounce" />
          </a>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 2: FISCAL & SOCIAL KPI STRIP (TERPISAH & MODULAR)
      ══════════════════════════════════════════════════════════════════ */}
      <section
        id="ringkasan-fiskal"
        className="relative z-10 border-y border-border/80 bg-slate-50/70 dark:bg-slate-900/50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden animate-fade-in"
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
          
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
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
          </FadeIn>

          {/* Continuous Infinite Sliding & Draggable KPI Strip (Tidak berhenti kena kursor & bisa digeser bebas) */}
          <FadeIn delay={120}>
            <TobaKpiSlider />
          </FadeIn>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 3: LIVE ANOMALY & GAP INSPECTOR (TERPISAH & BERNAFAS)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border/70 animate-fade-in">
        {/* Background Decor: Soft Ambient Orbs (Tanpa Dot Grid) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* Soft Floating Ambient Orbs */}
          <div className="absolute top-1/4 -left-20 size-[550px] rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 size-[550px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/10 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <FadeIn className="max-w-2xl mb-8">
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
          </FadeIn>

        {/* Modular Card Container */}
        <FadeIn delay={150} className="rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-xl overflow-hidden">
          
          {/* Tab Selector Bar - Text Only, No Card Background */}
          <div className="flex items-center overflow-x-auto border-b border-border px-4 sm:px-6 gap-6 sm:gap-8 bg-card/60">
            {(Object.keys(DISTRICTS_CONFIG) as DistrictId[]).map((key) => {
              const d = DISTRICTS_CONFIG[key]
              const isSelected = selectedDistrict === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDistrict(key)}
                  className={cn(
                    'py-3.5 text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer border-b-2',
                    isSelected
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground font-medium'
                  )}
                >
                  <span>Kecamatan {d.name}</span>
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

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-muted-foreground">KODE WILAYAH:</span>
                  <span className="font-bold text-foreground">{current.bpsCode}</span>
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
                  <span className={cn(
                    'text-xs font-mono font-bold uppercase tracking-wider',
                    current.status === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' :
                    current.status === 'WASPADA' ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  )}>
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

        </FadeIn>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 4: MODULAR FEATURE ECOSYSTEM (BENTO GRID 4 PILAR)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-b border-border/80 bg-slate-100/70 dark:bg-slate-950/70 py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden animate-fade-in">
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
          
          <FadeIn className="max-w-2xl mb-12">
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
          </FadeIn>

          <FadeIn delay={150} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
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

          </FadeIn>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          MODULE 5: DUA SUDUT PANDANG TRANSPARANSI (INTERACTIVE TAB SWITCHER)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#edf4fe]/90 via-[#eaf2fc]/70 to-[#e4eefb]/90 dark:from-[#091122] dark:via-[#0c162b] dark:to-[#091122] overflow-hidden border-t border-blue-200/60 dark:border-blue-900/40">
        {/* Background Decorative Layer: Motif Halus Topografi Toba & Grid Koordinat */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
          {/* 1. Fine Dot-Matrix Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f633_1px,transparent_1px)] dark:bg-[radial-gradient(#60a5fa25_1px,transparent_1px)] [background-size:22px_22px] opacity-45 dark:opacity-30" />

          {/* 2. Soft Architectural Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f60c_1px,transparent_1px),linear-gradient(to_bottom,#3b82f60c_1px,transparent_1px)] bg-[size:88px_88px]" />

          {/* 3. Ambient Mesh Radial Glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_45%,rgba(59,130,246,0.14),transparent_75%)]" />
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-indigo-500/12 dark:bg-indigo-500/10 rounded-full blur-3xl" />

          {/* 4. Topographic Elevation Contour Lines & Concentric Geodetic Rings */}
          <svg
            className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40"
            viewBox="0 0 1440 460"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Concentric subtle perspective circles around the center toggle */}
            <circle cx="720" cy="230" r="160" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" className="text-blue-500/20 dark:text-blue-400/20" fill="none" />
            <circle cx="720" cy="230" r="280" stroke="currentColor" strokeWidth="0.75" className="text-blue-500/15 dark:text-blue-400/15" fill="none" />
            <circle cx="720" cy="230" r="440" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 8" className="text-blue-500/10 dark:text-blue-400/10" fill="none" />

            {/* Organic Topographic Contour Lines of Toba */}
            <path
              d="M -40 85 C 280 40, 520 120, 840 70 C 1120 25, 1320 95, 1480 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-blue-500/25 dark:text-blue-400/20"
            />
            <path
              d="M -40 160 C 260 210, 560 130, 890 180 C 1180 220, 1340 150, 1480 170"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="4 6"
              className="text-blue-500/20 dark:text-blue-400/15"
            />
            <path
              d="M -40 270 C 310 230, 590 320, 920 260 C 1190 210, 1350 280, 1480 250"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-blue-500/25 dark:text-blue-400/20"
            />
            <path
              d="M -40 370 C 350 420, 680 340, 990 390 C 1220 425, 1380 365, 1480 380"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="5 7"
              className="text-blue-500/20 dark:text-blue-400/15"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-8 sm:space-y-10 text-center">
          
          {/* Section Header */}
          <FadeIn className="space-y-3 sm:space-y-4">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              DUA SUDUT PANDANG TRANSPARANSI
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Satu Data, Dua Peran untuk Kabupaten Toba
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
              Pilih sudut pandang Anda untuk merasakan bagaimana data terbuka dapat digunakan
              oleh masyarakat luas maupun tim pengambil kebijakan daerah.
            </p>
          </FadeIn>

          {/* Segmented Switcher Control (Swiss Pill Toggle) - Space Lega di Tengah */}
          <FadeIn delay={150} className="pt-2 sm:pt-4">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-blue-200/80 dark:border-blue-800/60 shadow-md">
              <button
                type="button"
                onClick={() => setActivePerspective('warga')}
                className={cn(
                  'flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer',
                  activePerspective === 'warga'
                    ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Users size={16} />
                <span>Untuk Warga (Publik)</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('pengelola')}
                className={cn(
                  'flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer',
                  activePerspective === 'pengelola'
                    ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Building2 size={16} />
                <span>Untuk Pengelola (Pemda)</span>
              </button>
            </div>
          </FadeIn>

          {/* Tombol Aksi Borderless Terpusat - Space Lega ke Tombol Aksi */}
          <FadeIn delay={250} className="pt-3 sm:pt-5 pb-2 flex items-center justify-center">
            {activePerspective === 'warga' ? (
              <Link
                href="/simulator"
                onClick={() => setRole('public')}
                className="group inline-flex items-center gap-2 text-sm sm:text-base font-bold text-primary dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all cursor-pointer py-2 px-4 rounded-xl hover:bg-blue-600/10"
              >
                <span>Mulai Simulasi Anggaran Warga</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={() => setRole('admin')}
                className="group inline-flex items-center gap-2 text-sm sm:text-base font-bold text-primary dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all cursor-pointer py-2 px-4 rounded-xl hover:bg-blue-600/10"
              >
                <span>Buka Dasbor Anggaran Daerah</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            )}
          </FadeIn>

        </div>
      </section>

    </div>
  )
}
