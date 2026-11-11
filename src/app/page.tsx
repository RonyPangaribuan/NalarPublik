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
  Scale,
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
    perCapita: 'Rp 1,13 Jt / jiwa',
    editorialHeadline: 'Defisit Jalan 30%: Warga Butuh 46%, Pagu Fisik Hanya 16%',
    editorialVerdict: 'Kesenjangan Kritis: Beban logistik perkebunan rakyat tertahan jalan rusak parah tanpa dukungan fiskal proporsional.',
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
    perCapita: 'Rp 1,58 Jt / jiwa',
    editorialHeadline: 'Kesenjangan Gizi 15.5%: Stunting 29.5% Berbanding Pagu 14%',
    editorialVerdict: 'Kesenjangan Waspada: Pusat keramaian ekonomi dan industri namun alokasi intervensi balita masih minim pagu.',
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
    perCapita: 'Rp 1,24 Jt / jiwa',
    editorialHeadline: 'Pendidikan Berimbang: Ruang Kelas Rusak 24% vs Alokasi 27%',
    editorialVerdict: 'Mendekati Keseimbangan: Pagu sarana pendidikan relatif selaras, tantangan beralih ke mutu pengawasan lapangan.',
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
    perCapita: 'Rp 1,05 Jt / jiwa',
    editorialHeadline: 'Surplus Fiskal Kota: 40% Belanja Modal Terpusat di Ibu Kota',
    editorialVerdict: 'Konsentrasi Anggaran: Kebutuhan dasar terkendali (14.5%), namun menyerap 40% belanja modal kabupaten.',
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

          {/* 2. Peta Vektor Borderless — GAMBAR MAP (Ukuran Sedang-Pas, Abu-Abu Jelas Lembut, Efek Glow Tiap Warna) */}
          <div className="lg:col-span-5 lg:order-2 flex flex-col items-center lg:items-end justify-center select-none w-full animate-fade-in">
            <div className="w-full max-w-[285px] xs:max-w-[315px] sm:max-w-[370px] md:max-w-[410px] lg:max-w-[455px] xl:max-w-[475px] space-y-2">

              {/* Peta Vektor Kabupaten Toba — ViewBox Snug & Proporsional */}
              <div className="relative w-full aspect-[625/520] select-none">
                <svg
                  viewBox="155 20 625 520"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Pola Titik Rapat Biru (12 Kecamatan Sekitar) — Elegan, Senada Tema & Tidak Gelap */}
                    <pattern id="hero-dots-blue" width="5.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-2) skewX(14)">
                      <ellipse cx="2.6" cy="2.1" rx="1.5" ry="1.2" fill="#2563eb" fillOpacity="0.65" className="dark:fill-sky-400 dark:fill-opacity-60" />
                    </pattern>

                    {/* Pola Titik Rapat Emerald / Hijau (Balige - Selaras) */}
                    <pattern id="hero-dots-emerald" width="5.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-2) skewX(14)">
                      <ellipse cx="2.6" cy="2.1" rx="1.6" ry="1.3" fill="#10b981" />
                    </pattern>

                    {/* Pola Titik Rapat Amber / Oranye (Porsea & Laguboti - Waspada) */}
                    <pattern id="hero-dots-amber" width="5.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-2) skewX(14)">
                      <ellipse cx="2.6" cy="2.1" rx="1.6" ry="1.3" fill="#f59e0b" />
                    </pattern>

                    {/* Pola Titik Rapat Rose / Merah (Habinsaran - Kritis) */}
                    <pattern id="hero-dots-rose" width="5.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-2) skewX(14)">
                      <ellipse cx="2.6" cy="2.1" rx="1.6" ry="1.3" fill="#f43f5e" />
                    </pattern>

                    {/* Pin Drop Shadow */}
                    <filter id="heroPinShadow" x="-50%" y="-30%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.32" />
                    </filter>

                    {/* Efek Sederhana Glow Lembut untuk Masing-Masing Warna */}
                    <filter id="glow-emerald" x="-40%" y="-40%" width="180%" height="180%">
                      <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#10b981" floodOpacity="0.75" />
                    </filter>
                    <filter id="glow-amber" x="-40%" y="-40%" width="180%" height="180%">
                      <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#f59e0b" floodOpacity="0.75" />
                    </filter>
                    <filter id="glow-rose" x="-40%" y="-40%" width="180%" height="180%">
                      <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#f43f5e" floodOpacity="0.85" />
                    </filter>

                    {/* Pin Head Gradients */}
                    <linearGradient id="pinEmeraldGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="pinAmberGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="pinRoseGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                      <stop offset="0%" stopColor="#fb7185" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* 12 Kecamatan Sekitar — Layer 1: Tint Transparan Biru Lembut */}
                  <g id="hero-kecamatan-blue-tint" fill="#3b82f6" fillOpacity="0.10" className="dark:fill-sky-400 dark:fill-opacity-12">
                    <path d="M 178,28 L 184,38 L 205,55 L 206,72 L 224,92 L 234,92 L 228,118 L 218,136 L 215,134 L 192,124 L 176,108 L 178,86 L 165,68 L 168,48 L 184,32 Z" />
                    <path d="M 234,92 L 255,86 L 288,65 L 305,88 L 318,92 L 315,118 L 308,148 L 298,172 L 288,192 L 265,178 L 248,154 L 232,152 L 218,136 L 228,118 Z" />
                    <path d="M 315,118 L 348,128 L 362,134 L 396,134 L 406,160 L 418,164 L 402,175 L 375,182 L 372,198 L 358,205 L 325,192 L 298,172 L 308,148 Z" />
                    <path d="M 298,172 L 308,198 L 332,218 L 352,248 L 325,268 L 305,282 L 280,286 L 288,275 L 285,255 L 296,228 L 288,212 L 288,192 Z" />
                    <path d="M 372,198 L 375,182 L 402,175 L 418,164 L 442,175 L 445,192 L 425,212 L 392,225 L 385,205 Z" />
                    <path d="M 445,192 L 465,192 L 488,212 L 458,232 L 435,245 L 415,245 L 392,238 L 392,225 L 425,212 Z" />
                    <path d="M 418,164 L 436,164 L 442,175 L 458,152 L 490,150 L 512,138 L 546,146 L 576,145 L 596,124 L 618,108 L 624,122 L 638,118 L 648,102 L 656,106 L 654,125 L 642,140 L 658,150 L 646,185 L 632,212 L 605,202 L 575,202 L 548,205 L 522,182 L 515,202 L 488,212 L 465,192 L 445,192 L 442,175 Z" />
                    <path d="M 488,212 L 515,202 L 522,182 L 548,205 L 575,202 L 552,252 L 538,272 L 485,268 L 458,288 L 455,332 L 432,345 L 432,332 L 412,305 L 425,288 L 418,265 L 435,245 L 458,232 Z" />
                    <path d="M 378,248 L 392,238 L 415,245 L 435,245 L 418,265 L 425,288 L 412,305 L 375,285 L 382,265 Z" />
                    <path d="M 234,345 L 245,342 L 258,328 L 272,352 L 262,382 L 258,408 L 246,408 L 242,375 Z" />
                    <path d="M 658,255 L 668,255 L 696,282 L 706,258 L 702,235 L 708,224 L 716,230 L 714,275 L 722,315 L 745,338 L 768,342 L 770,355 L 750,362 L 735,360 L 742,392 L 724,418 L 685,425 L 652,438 L 618,446 L 595,432 L 578,385 L 592,355 L 615,332 L 598,302 L 622,288 Z" />
                    <path d="M 432,360 L 478,375 L 528,395 L 562,408 L 568,432 L 595,432 L 618,446 L 622,458 L 606,478 L 582,492 L 552,515 L 512,532 L 485,522 L 462,502 L 438,492 L 435,455 L 412,432 L 395,418 L 372,405 L 395,392 Z" />
                  </g>

                  {/* 12 Kecamatan Sekitar — Layer 2: Pola Titik Biru Senada & Garis Batas Proporsional */}
                  <g id="hero-kecamatan-blue-dots" fill="url(#hero-dots-blue)" stroke="#2563eb" strokeWidth="0.85" strokeOpacity="0.48" className="dark:stroke-sky-400 dark:stroke-opacity-40">
                    <path id="ajibata" d="M 178,28 L 184,38 L 205,55 L 206,72 L 224,92 L 234,92 L 228,118 L 218,136 L 215,134 L 192,124 L 176,108 L 178,86 L 165,68 L 168,48 L 184,32 Z" />
                    <path id="lumban-julu" d="M 234,92 L 255,86 L 288,65 L 305,88 L 318,92 L 315,118 L 308,148 L 298,172 L 288,192 L 265,178 L 248,154 L 232,152 L 218,136 L 228,118 Z" />
                    <path id="bonatua-lunasi" d="M 315,118 L 348,128 L 362,134 L 396,134 L 406,160 L 418,164 L 402,175 L 375,182 L 372,198 L 358,205 L 325,192 L 298,172 L 308,148 Z" />
                    <path id="uluan" d="M 298,172 L 308,198 L 332,218 L 352,248 L 325,268 L 305,282 L 280,286 L 288,275 L 285,255 L 296,228 L 288,212 L 288,192 Z" />
                    <path id="parmaksian" d="M 372,198 L 375,182 L 402,175 L 418,164 L 442,175 L 445,192 L 425,212 L 392,225 L 385,205 Z" />
                    <path id="siantar-narumonda" d="M 445,192 L 465,192 L 488,212 L 458,232 L 435,245 L 415,245 L 392,238 L 392,225 L 425,212 Z" />
                    <path id="pintu-pohan-meranti" d="M 418,164 L 436,164 L 442,175 L 458,152 L 490,150 L 512,138 L 546,146 L 576,145 L 596,124 L 618,108 L 624,122 L 638,118 L 648,102 L 656,106 L 654,125 L 642,140 L 658,150 L 646,185 L 632,212 L 605,202 L 575,202 L 548,205 L 522,182 L 515,202 L 488,212 L 465,192 L 445,192 L 442,175 Z" />
                    <path id="silaen" d="M 488,212 L 515,202 L 522,182 L 548,205 L 575,202 L 552,252 L 538,272 L 485,268 L 458,288 L 455,332 L 432,345 L 432,332 L 412,305 L 425,288 L 418,265 L 435,245 L 458,232 Z" />
                    <path id="sigumpar" d="M 378,248 L 392,238 L 415,245 L 435,245 L 418,265 L 425,288 L 412,305 L 375,285 L 382,265 Z" />
                    <path id="tampahan" d="M 234,345 L 245,342 L 258,328 L 272,352 L 262,382 L 258,408 L 246,408 L 242,375 Z" />
                    <path id="nassau" d="M 658,255 L 668,255 L 696,282 L 706,258 L 702,235 L 708,224 L 716,230 L 714,275 L 722,315 L 745,338 L 768,342 L 770,355 L 750,362 L 735,360 L 742,392 L 724,418 L 685,425 L 652,438 L 618,446 L 595,432 L 578,385 L 592,355 L 615,332 L 598,302 L 622,288 Z" />
                    <path id="borbor" d="M 432,360 L 478,375 L 528,395 L 562,408 L 568,432 L 595,432 L 618,446 L 622,458 L 606,478 L 582,492 L 552,515 L 512,532 L 485,522 L 462,502 L 438,492 L 435,455 L 412,432 L 395,418 L 372,405 L 395,392 Z" />
                  </g>

                  {/* 4 Wilayah Sorotan — Efek Glow & Denyut Halus Pada Setiap Warna */}
                  <g id="hero-kecamatan-highlight">
                    {/* 1. Balige (Selaras / Surplus - Hijau Emerald) */}
                    <g className="cursor-pointer group" onClick={() => setSelectedDistrict('balige')}>
                      {/* Efek Aura Glow Hijau Emerald dengan Animasi Denyut Halus */}
                      <path
                        d="M 258,328 L 272,315 L 288,325 L 298,338 L 318,328 L 336,306 L 352,345 L 368,368 L 372,405 L 355,408 L 330,395 L 302,406 L 285,395 L 265,408 L 258,408 L 262,382 L 272,352 Z"
                        fill="#10b981"
                        fillOpacity={selectedDistrict === 'balige' ? 0.38 : 0.22}
                        filter="url(#glow-emerald)"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeOpacity="0.7"
                        className="transition-all duration-300 group-hover:fill-opacity-50"
                      >
                        <animate attributeName="fill-opacity" values="0.20;0.45;0.20" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.45;0.95;0.45" dur="3s" repeatCount="indefinite" />
                      </path>
                      <path
                        d="M 258,328 L 272,315 L 288,325 L 298,338 L 318,328 L 336,306 L 352,345 L 368,368 L 372,405 L 355,408 L 330,395 L 302,406 L 285,395 L 265,408 L 258,408 L 262,382 L 272,352 Z"
                        fill="url(#hero-dots-emerald)"
                        stroke="#10b981"
                        strokeWidth={selectedDistrict === 'balige' ? 2.2 : 1.4}
                        className="transition-all duration-200"
                      />
                    </g>

                    {/* 2. Porsea (Waspada - Oranye / Amber) */}
                    <g className="cursor-pointer group" onClick={() => setSelectedDistrict('porsea')}>
                      {/* Efek Aura Glow Oranye Amber dengan Animasi Denyut Halus */}
                      <path
                        d="M 298,172 L 325,192 L 358,205 L 372,198 L 385,205 L 392,225 L 392,238 L 378,248 L 352,248 L 332,218 L 308,198 Z"
                        fill="#f59e0b"
                        fillOpacity={selectedDistrict === 'porsea' ? 0.38 : 0.22}
                        filter="url(#glow-amber)"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeOpacity="0.7"
                        className="transition-all duration-300 group-hover:fill-opacity-50"
                      >
                        <animate attributeName="fill-opacity" values="0.20;0.45;0.20" dur="2.8s" begin="0.3s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.45;0.95;0.45" dur="2.8s" begin="0.3s" repeatCount="indefinite" />
                      </path>
                      <path
                        d="M 298,172 L 325,192 L 358,205 L 372,198 L 385,205 L 392,225 L 392,238 L 378,248 L 352,248 L 332,218 L 308,198 Z"
                        fill="url(#hero-dots-amber)"
                        stroke="#f59e0b"
                        strokeWidth={selectedDistrict === 'porsea' ? 2.2 : 1.4}
                        className="transition-all duration-200"
                      />
                    </g>

                    {/* 3. Laguboti (Waspada - Oranye / Amber) */}
                    <g className="cursor-pointer group" onClick={() => setSelectedDistrict('laguboti')}>
                      {/* Efek Aura Glow Oranye Amber dengan Animasi Denyut Halus */}
                      <path
                        d="M 375,285 L 412,305 L 432,332 L 432,360 L 395,392 L 372,405 L 368,368 L 352,345 L 336,306 L 362,298 Z"
                        fill="#f59e0b"
                        fillOpacity={selectedDistrict === 'laguboti' ? 0.38 : 0.22}
                        filter="url(#glow-amber)"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeOpacity="0.7"
                        className="transition-all duration-300 group-hover:fill-opacity-50"
                      >
                        <animate attributeName="fill-opacity" values="0.20;0.45;0.20" dur="3.1s" begin="0.6s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.45;0.95;0.45" dur="3.1s" begin="0.6s" repeatCount="indefinite" />
                      </path>
                      <path
                        d="M 375,285 L 412,305 L 432,332 L 432,360 L 395,392 L 372,405 L 368,368 L 352,345 L 336,306 L 362,298 Z"
                        fill="url(#hero-dots-amber)"
                        stroke="#f59e0b"
                        strokeWidth={selectedDistrict === 'laguboti' ? 2.2 : 1.4}
                        className="transition-all duration-200"
                      />
                    </g>

                    {/* 4. Habinsaran (Kritis - Merah / Rose) */}
                    <g className="cursor-pointer group" onClick={() => setSelectedDistrict('habinsaran')}>
                      {/* Efek Aura Glow Merah Rose dengan Animasi Denyut Halus */}
                      <path
                        d="M 575,202 L 605,202 L 632,212 L 648,232 L 658,255 L 622,288 L 598,302 L 615,332 L 592,355 L 578,385 L 595,432 L 568,432 L 562,408 L 528,395 L 478,375 L 432,360 L 432,345 L 455,332 L 458,288 L 485,268 L 538,272 L 552,252 Z"
                        fill="#f43f5e"
                        fillOpacity={selectedDistrict === 'habinsaran' ? 0.42 : 0.25}
                        filter="url(#glow-rose)"
                        stroke="#f43f5e"
                        strokeWidth="2.8"
                        strokeOpacity="0.75"
                        className="transition-all duration-300 group-hover:fill-opacity-55"
                      >
                        <animate attributeName="fill-opacity" values="0.22;0.50;0.22" dur="2.4s" begin="0.2s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.50;1.0;0.50" dur="2.4s" begin="0.2s" repeatCount="indefinite" />
                      </path>
                      <path
                        d="M 575,202 L 605,202 L 632,212 L 648,232 L 658,255 L 622,288 L 598,302 L 615,332 L 592,355 L 578,385 L 595,432 L 568,432 L 562,408 L 528,395 L 478,375 L 432,360 L 432,345 L 455,332 L 458,288 L 485,268 L 538,272 L 552,252 Z"
                        fill="url(#hero-dots-rose)"
                        stroke="#f43f5e"
                        strokeWidth={selectedDistrict === 'habinsaran' ? 2.4 : 1.6}
                        className="transition-all duration-200"
                      />
                    </g>
                  </g>

                  {/* Standing 3D Location Pins & Efek Gelombang Ping */}
                  {/* 1. Porsea (Amber) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedDistrict('porsea')}>
                    <ellipse
                      cx="354"
                      cy="213"
                      rx={selectedDistrict === 'porsea' ? 14 : 10}
                      ry={selectedDistrict === 'porsea' ? 5 : 3.5}
                      fill="rgba(15,23,42,0.22)"
                    />
                    {/* Gelombang Radar Halus Oranye — Berdenyut Asli dari Titik Pin */}
                    <circle cx="354" cy="213" r="8" fill="none" stroke="#f59e0b" pointerEvents="none">
                      <animate attributeName="r" values="8;24;36" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0.35;0" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.2;1.2;0.3" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="354" cy="213" r="8" fill="none" stroke="#f59e0b" pointerEvents="none">
                      <animate attributeName="r" values="8;24;36" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0.35;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.2;1.2;0.3" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                    </circle>
                    <line x1="354" y1="213" x2="354" y2="178" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                    <g
                      transform={`translate(354, ${selectedDistrict === 'porsea' ? 166 : 172})`}
                      filter="url(#heroPinShadow)"
                      className="transition-transform duration-200"
                    >
                      <path
                        d="M 0,11 C -8,3 -11,-5 -11,-13 A 11,11 0 1 1 11,-13 C 11,-5 8,3 0,11 Z"
                        fill="url(#pinAmberGrad)"
                        stroke="white"
                        strokeWidth="1.6"
                      />
                      <circle cx="0" cy="-13" r="4" fill="white" fillOpacity="0.75" />
                    </g>
                  </g>

                  {/* 2. Balige (Emerald) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedDistrict('balige')}>
                    <ellipse
                      cx="305"
                      cy="365"
                      rx={selectedDistrict === 'balige' ? 14 : 10}
                      ry={selectedDistrict === 'balige' ? 5 : 3.5}
                      fill="rgba(15,23,42,0.22)"
                    />
                    {/* Gelombang Radar Halus Hijau — Berdenyut Asli dari Titik Pin */}
                    <circle cx="305" cy="365" r="8" fill="none" stroke="#10b981" pointerEvents="none">
                      <animate attributeName="r" values="8;24;36" dur="2.8s" begin="0.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0.35;0" dur="2.8s" begin="0.4s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.2;1.2;0.3" dur="2.8s" begin="0.4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="305" cy="365" r="8" fill="none" stroke="#10b981" pointerEvents="none">
                      <animate attributeName="r" values="8;24;36" dur="2.8s" begin="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0.35;0" dur="2.8s" begin="1.8s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.2;1.2;0.3" dur="2.8s" begin="1.8s" repeatCount="indefinite" />
                    </circle>
                    <line x1="305" y1="365" x2="305" y2="330" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
                    <g
                      transform={`translate(305, ${selectedDistrict === 'balige' ? 318 : 324})`}
                      filter="url(#heroPinShadow)"
                      className="transition-transform duration-200"
                    >
                      <path
                        d="M 0,11 C -8,3 -11,-5 -11,-13 A 11,11 0 1 1 11,-13 C 11,-5 8,3 0,11 Z"
                        fill="url(#pinEmeraldGrad)"
                        stroke="white"
                        strokeWidth="1.6"
                      />
                      <circle cx="0" cy="-13" r="4" fill="white" fillOpacity="0.75" />
                    </g>
                  </g>

                  {/* 3. Laguboti (Amber) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedDistrict('laguboti')}>
                    <ellipse
                      cx="384"
                      cy="340"
                      rx={selectedDistrict === 'laguboti' ? 14 : 10}
                      ry={selectedDistrict === 'laguboti' ? 5 : 3.5}
                      fill="rgba(15,23,42,0.22)"
                    />
                    {/* Gelombang Radar Halus Oranye — Berdenyut Asli dari Titik Pin */}
                    <circle cx="384" cy="340" r="8" fill="none" stroke="#f59e0b" pointerEvents="none">
                      <animate attributeName="r" values="8;24;36" dur="2.9s" begin="0.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0.35;0" dur="2.9s" begin="0.8s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.2;1.2;0.3" dur="2.9s" begin="0.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="384" cy="340" r="8" fill="none" stroke="#f59e0b" pointerEvents="none">
                      <animate attributeName="r" values="8;24;36" dur="2.9s" begin="2.25s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.85;0.35;0" dur="2.9s" begin="2.25s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.2;1.2;0.3" dur="2.9s" begin="2.25s" repeatCount="indefinite" />
                    </circle>
                    <line x1="384" y1="340" x2="384" y2="305" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                    <g
                      transform={`translate(384, ${selectedDistrict === 'laguboti' ? 293 : 299})`}
                      filter="url(#heroPinShadow)"
                      className="transition-transform duration-200"
                    >
                      <path
                        d="M 0,11 C -8,3 -11,-5 -11,-13 A 11,11 0 1 1 11,-13 C 11,-5 8,3 0,11 Z"
                        fill="url(#pinAmberGrad)"
                        stroke="white"
                        strokeWidth="1.6"
                      />
                      <circle cx="0" cy="-13" r="4" fill="white" fillOpacity="0.75" />
                    </g>
                  </g>

                  {/* 4. Habinsaran (Rose) */}
                  <g className="cursor-pointer group" onClick={() => setSelectedDistrict('habinsaran')}>
                    <ellipse
                      cx="555"
                      cy="315"
                      rx={selectedDistrict === 'habinsaran' ? 14 : 10}
                      ry={selectedDistrict === 'habinsaran' ? 5 : 3.5}
                      fill="rgba(15,23,42,0.22)"
                    />
                    {/* Gelombang Radar Halus Merah — Berdenyut Asli dari Titik Pin */}
                    <circle cx="555" cy="315" r="8" fill="none" stroke="#f43f5e" pointerEvents="none">
                      <animate attributeName="r" values="8;26;40" dur="2.2s" begin="0.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.4;0" dur="2.2s" begin="0.2s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.5;1.4;0.3" dur="2.2s" begin="0.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="555" cy="315" r="8" fill="none" stroke="#f43f5e" pointerEvents="none">
                      <animate attributeName="r" values="8;26;40" dur="2.2s" begin="1.3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.4;0" dur="2.2s" begin="1.3s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2.5;1.4;0.3" dur="2.2s" begin="1.3s" repeatCount="indefinite" />
                    </circle>
                    <line x1="555" y1="315" x2="555" y2="280" stroke="#be123c" strokeWidth="2" strokeLinecap="round" />
                    <g
                      transform={`translate(555, ${selectedDistrict === 'habinsaran' ? 268 : 274})`}
                      filter="url(#heroPinShadow)"
                      className="transition-transform duration-200"
                    >
                      <path
                        d="M 0,11 C -8,3 -11,-5 -11,-13 A 11,11 0 1 1 11,-13 C 11,-5 8,3 0,11 Z"
                        fill="url(#pinRoseGrad)"
                        stroke="white"
                        strokeWidth="1.6"
                      />
                      <circle cx="0" cy="-13" r="4" fill="white" fillOpacity="0.75" />
                    </g>
                  </g>
                </svg>
              </div>

              {/* Tombol Aksi — Hanya Teks 'Lihat Peta' Sesuai Instruksi */}
              <div className="flex items-center justify-end px-1 pt-0.5">
                <Link
                  href={current.href}
                  className="group inline-flex items-center gap-1.5 text-primary dark:text-sky-400 hover:text-blue-700 dark:hover:text-sky-300 font-bold text-xs sm:text-sm py-1 px-2.5 rounded-md hover:bg-primary/5 transition-all shrink-0"
                >
                  <span>Lihat Peta</span>
                  <span className="size-5 rounded-full bg-primary/15 dark:bg-sky-400/20 text-primary dark:text-sky-300 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all shadow-xs">
                    <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

            {/* 3. Deskripsi dengan Efek Ketik (Typewriter) Muncul Bertahap Setelah Elemen Utama Spawn (Desktop Only) */}
            <p className="hidden lg:block text-xs sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 px-2 sm:px-0 min-h-[46px] sm:min-h-[52px]">
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
                <span>Peta Anggaran</span>
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
      <section className="relative z-10 py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border/70 bg-gradient-to-b from-[#f8fafc] via-[#ebf3fe] to-[#f1f5f9] dark:from-[#090d16] dark:via-[#0b1730] dark:to-[#090d16] animate-fade-in">
        {/* Background Decor: Soft Ambient Orbs (Tanpa Dot Grid) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* Soft Floating Ambient Orbs */}
          <div className="absolute top-1/4 -left-20 size-[550px] rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 size-[550px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/10 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto">
          
          {/* Section Header with Editorial Authority */}
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5 sm:mb-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  AUDIT DISPARITAS KEBIJAKAN // APBD KAB. TOBA 2026
                </p>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Ketimpangan Kebutuhan Warga vs Pagu Fiskal
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Menyandingkan survei BPS dan proporsi belanja APBD untuk identifikasi defisit dan surplus wilayah.
              </p>
            </div>

            {/* Micro Global Legend */}
            <div className="flex items-center gap-3 text-xs font-mono shrink-0 bg-card/60 backdrop-blur-xs border border-border px-3.5 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                Kebutuhan BPS
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                Alokasi APBD
              </span>
            </div>
          </FadeIn>

          {/* ── 1. The District Dossier Switcher (4 Wilayah Terpantau) ── */}
          <FadeIn delay={100} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
            {(Object.keys(DISTRICTS_CONFIG) as DistrictId[]).map((key) => {
              const d = DISTRICTS_CONFIG[key]
              const isSelected = selectedDistrict === key
              const isDeficit = parseFloat(d.gapScore) > 0
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDistrict(key)}
                  className={cn(
                    'group relative text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer overflow-hidden',
                    isSelected
                      ? 'bg-card border-primary shadow-md ring-1 ring-primary/30 -translate-y-0.5'
                      : 'bg-card/50 hover:bg-card border-border/80 hover:border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {/* Top indicator bar for selected */}
                  {isSelected && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
                  )}

                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="text-[10.5px] font-mono font-medium tracking-wide text-muted-foreground">
                      {d.type}
                    </span>
                    <span
                      className={cn(
                        'size-2 rounded-full shrink-0',
                        d.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' :
                        d.status === 'WASPADA' ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>

                  <div className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                    {d.name}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={cn(
                        'text-[11px] sm:text-xs font-mono font-bold tracking-tight',
                        d.status === 'CRITICAL'
                          ? 'text-rose-600 dark:text-rose-400'
                          : d.status === 'WASPADA'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {isDeficit ? `+${d.gapScore.replace('+', '')}%` : `${d.gapScore}%`}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {isDeficit ? 'Defisit' : 'Surplus'}
                    </span>
                  </div>
                </button>
              )
            })}
          </FadeIn>

          {/* ── 2. The Visual Tension Chamber (Command Center: Atas Biru Glassmorphism & Bawah Tombol Tetap Putih) ── */}
          <FadeIn delay={150} className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white shadow-2xl shadow-blue-900/30 overflow-hidden">
            
            {/* ── BAGIAN ATAS: Visual Tension & Continuum Scale (Warna Biru Command Center) ── */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              
              {/* Row 1: Dual Opposing Force Columns with Center Tension Delta */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-5 items-center">
                
                {/* Left Force: Kebutuhan Warga (BPS) - Glassmorphism Card */}
                <div className="md:col-span-5 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 hover:border-white/25 p-3.5 sm:p-4.5 relative overflow-hidden shadow-xs text-white transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-200">
                      <Users size={14} className="text-sky-300" />
                      KEBUTUHAN RIIL WARGA
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-100 border border-sky-400/30 font-semibold">
                      SURVEI BPS
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
                      {current.bpsIssue}%
                    </span>
                    <span className="text-xs text-blue-200/80 font-mono">
                      Masalah {current.topSector.split(' ')[0]}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all duration-700 shadow-xs"
                      style={{ width: `${Math.min(100, (current.bpsIssue / 50) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-blue-100/75 mt-1.5 leading-snug">
                    Tingkat urgensi penanganan berdasarkan data sensus dan survei kebutuhan dasar masyarakat.
                  </p>
                </div>

                {/* Center Tension Epicenter: Jurang Kesenjangan */}
                <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-1 px-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-blue-200 font-bold mb-0.5">
                    JURANG KESENJANGAN
                  </span>

                  <div className={cn(
                    'text-2xl sm:text-3xl font-extrabold font-mono tracking-tight my-0.5 drop-shadow-sm',
                    current.status === 'CRITICAL' ? 'text-rose-300' :
                    current.status === 'WASPADA' ? 'text-amber-300' :
                    'text-emerald-300'
                  )}>
                    {current.gapScore}%
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-blue-100 mt-0.5">
                    <span className="font-semibold">
                      {parseFloat(current.gapScore) > 0 ? 'Defisit Pagu' : 'Surplus Fiskal'}
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-center gap-1.5 mt-1.5 text-blue-300/60 text-xs font-mono">
                    <span>◄</span>
                    <span className="h-px w-8 sm:w-14 bg-blue-300/30" />
                    <span>►</span>
                  </div>
                </div>

                {/* Right Force: Alokasi Belanja APBD - Glassmorphism Card */}
                <div className="md:col-span-5 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 hover:border-white/25 p-3.5 sm:p-4.5 relative overflow-hidden shadow-xs text-white transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
                      <Building2 size={14} className="text-emerald-300" />
                      ALOKASI APBD TOBA
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-400/30 font-semibold">
                      BELANJA 2026
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
                      {current.apbdBudget}%
                    </span>
                    <span className="text-xs text-blue-200/80 font-mono">
                      Porsi Pagu Sektor
                    </span>
                  </div>

                  <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-700 shadow-xs"
                      style={{ width: `${Math.min(100, (current.apbdBudget / 50) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-blue-100/75 mt-1.5 leading-snug">
                    Porsi realisasi belanja modal daerah yang disalurkan dari total belanja bidang terkait.
                  </p>
                </div>

              </div>

              {/* Row 2: Unified Fiscal Continuum Track - Glassmorphism Card */}
              <div className="rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 p-3.5 sm:p-5 space-y-3 shadow-xs text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-blue-200 block font-bold">
                      SUMBU KONTINUUM FISKAL // SKALA 0% — 50%
                    </span>
                    <p className="text-xs text-blue-100/75 mt-0.5">
                      Visualisasi jurang disparitas antara posisi kebutuhan masyarakat dengan posisi realisasi pagu belanja.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white">
                    Rentang Jurang: {Math.abs(current.bpsIssue - current.apbdBudget).toFixed(1)} Poin Persentase
                  </span>
                </div>

                {/* The Continuous Scale Track */}
                <div className="pt-6 pb-2 px-2 sm:px-3">
                  <div className="relative h-3.5 w-full bg-black/25 dark:bg-black/40 rounded-full border border-white/10">
                    
                    {/* The Chasm Span Band */}
                    {(() => {
                      const minVal = Math.min(current.bpsIssue, current.apbdBudget)
                      const maxVal = Math.max(current.bpsIssue, current.apbdBudget)
                      const leftPct = (minVal / 50) * 100
                      const widthPct = ((maxVal - minVal) / 50) * 100
                      const isDeficit = parseFloat(current.gapScore) > 0
                      return (
                        <div
                          className={cn(
                            'absolute top-0 bottom-0 rounded-full transition-all duration-700 flex items-center justify-center overflow-hidden border',
                            isDeficit
                              ? 'bg-rose-500/35 border-rose-400/60 text-rose-200 shadow-sm'
                              : 'bg-emerald-500/35 border-emerald-400/60 text-emerald-200 shadow-sm'
                          )}
                          style={{
                            left: `${leftPct}%`,
                            width: `${Math.max(4, widthPct)}%`,
                          }}
                        >
                          {/* Striped tension pattern overlay */}
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-30"
                            style={{
                              backgroundImage:
                                'repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 6px)',
                            }}
                          />
                        </div>
                      )
                    })()}

                    {/* Marker: Kebutuhan Warga BPS */}
                    {(() => {
                      const posPct = Math.min(100, Math.max(0, (current.bpsIssue / 50) * 100))
                      return (
                        <div
                          className="absolute -top-7 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-700"
                          style={{ left: `${posPct}%` }}
                        >
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-400 text-slate-950 shadow-md whitespace-nowrap">
                            Kebutuhan {current.bpsIssue}%
                          </span>
                          <span className="size-2 rounded-full bg-sky-300 mt-1 shadow-sm" />
                        </div>
                      )
                    })()}

                    {/* Marker: Alokasi APBD */}
                    {(() => {
                      const posPct = Math.min(100, Math.max(0, (current.apbdBudget / 50) * 100))
                      return (
                        <div
                          className="absolute -bottom-7 -translate-x-1/2 flex flex-col-reverse items-center pointer-events-none transition-all duration-700"
                          style={{ left: `${posPct}%` }}
                        >
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 shadow-md whitespace-nowrap">
                            APBD {current.apbdBudget}%
                          </span>
                          <span className="size-2 rounded-full bg-emerald-300 mb-1 shadow-sm" />
                        </div>
                      )
                    })()}
                  </div>

                  {/* Ticks and percentage labels below */}
                  <div className="relative mt-6 pt-1 flex justify-between text-[10px] font-mono text-blue-200/60 border-t border-white/15">
                    <span>0% (Awal)</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                    <span>40%</span>
                    <span>50% (Batas Skala)</span>
                  </div>
                </div>

              </div>

            </div>

            {/* ── BAGIAN BAWAH: White Footer Strip (Info Wilayah & Tombol Tetap Putih) ── */}
            <div className="bg-white dark:bg-slate-900 border-t border-blue-400/20 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-foreground">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="font-bold text-foreground font-mono">Kecamatan {current.name}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">{current.topSector}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400">Pagu {current.paguAPBD}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400">{current.populasi}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href={`/compare?districtA=${current.id}&districtB=balige`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Scale size={13} className="text-primary" />
                  <span>Bandingkan vs Balige (Ibu Kota)</span>
                  <ArrowUpRight size={13} className="text-slate-400" />
                </Link>

                <Link
                  href={current.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 text-xs font-bold transition-all shadow-sm"
                >
                  <span>Buka Pada Peta Anggaran</span>
                  <ArrowRight size={14} />
                </Link>
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
          
          <FadeIn className="max-w-2xl mb-8 sm:mb-10">
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Empat Pilar Transparansi NalarPublik
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Modul analisis independen berbasis data BPS &amp; BPKAD — terbuka penuh tanpa pembatas login.
            </p>
          </FadeIn>

          <FadeIn delay={150} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Feature 1: Peta Anggaran */}
            <Link
              href="/map"
              className="group rounded-2xl border border-border/80 bg-card p-5 sm:p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Peta Anggaran
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    Pantau disparitas alokasi belanja daerah dan kebutuhan warga 16 kecamatan secara spasial.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                <span>Buka Peta Wilayah</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 2: Simulasi Anggaran */}
            <Link
              href="/simulator"
              className="group rounded-2xl border border-border/80 bg-card p-5 sm:p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <Sliders className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Simulasi Anggaran Partisipatif
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    Rancang proporsi pagu APBD versi warga secara seimbang dan realistis.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                <span>Mulai Simulasi Anggaran</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 3: Perbandingan Antarwilayah */}
            <Link
              href="/compare"
              className="group rounded-2xl border border-border/80 bg-card p-5 sm:p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <Scale className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Perbandingan Antarwilayah
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    Uji keadilan alokasi anggaran antar-kecamatan antara ibu kota dan dataran tinggi.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                <span>Mulai Perbandingan Wilayah</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 4: Portal Data Terbuka */}
            <Link
              href="/open-data"
              className="group rounded-2xl border border-border/80 bg-card p-5 sm:p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <Database className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    Data Terbuka Anggaran
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    Unduh mentah seluruh dataset tabel APBD dan kamus konversi biaya fisik per unit.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
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
                <span>Untuk Warga</span>
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
                <span>Untuk Pengelola</span>
              </button>
            </div>
          </FadeIn>

          {/* Tombol Aksi Borderless Terpusat - Space Lega ke Tombol Aksi */}
          <FadeIn delay={250} className="pt-3 sm:pt-5 pb-2 flex items-center justify-center">
            {activePerspective === 'warga' ? (
              <Link
                href="/simulator"
                className="group inline-flex items-center gap-2 text-sm sm:text-base font-bold text-primary dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all cursor-pointer py-2 px-4 rounded-xl hover:bg-blue-600/10"
              >
                <span>Mulai Simulasi Anggaran Warga</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/admin"
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
