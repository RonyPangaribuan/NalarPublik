'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  MapPin,
  Layers,
  Sliders,
  FileText,
  Clock,
  Trash2,
  SearchX,
  Building2,
  Heart,
  TrendingUp,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchItem {
  id: string
  title: string
  category: 'Wilayah' | 'Sektor' | 'Fitur' | 'Data'
  desc: string
  href: string
  keywords: string[]
}

const SEARCH_DATABASE: SearchItem[] = [
  // Wilayah
  {
    id: 'habinsaran',
    title: 'Kecamatan Habinsaran',
    category: 'Wilayah',
    desc: 'Status Kritis (+30.0 Gap). Jalan rusak 46.0%, alokasi APBD 16.0%.',
    href: '/map?district=habinsaran',
    keywords: ['habinsaran', 'kritis', 'jalan rusak', 'parsoburan', 'dataran tinggi', '1212020'],
  },
  {
    id: 'balige',
    title: 'Kecamatan Balige',
    category: 'Wilayah',
    desc: 'Ibu kota Kabupaten Toba. Status Selaras (-25.5 Gap). Pagu APBD Rp 48,5 M.',
    href: '/map?district=balige',
    keywords: ['balige', 'ibu kota', 'selaras', 'stabil', 'surplus', 'pariwisata', '1212010'],
  },
  {
    id: 'porsea',
    title: 'Kecamatan Porsea',
    category: 'Wilayah',
    desc: 'Kawasan industri & sentra dagang. Stunting 29.5%, status Waspada (+15.5 Gap).',
    href: '/map?district=porsea',
    keywords: ['porsea', 'stunting', 'waspada', 'kesehatan', 'balita', 'posyandu', '1212070'],
  },
  {
    id: 'laguboti',
    title: 'Kecamatan Laguboti',
    category: 'Wilayah',
    desc: 'Sentra pendidikan. Ruang kelas rusak 24.0%, status Waspada (+7.0 Gap).',
    href: '/map?district=laguboti',
    keywords: ['laguboti', 'pendidikan', 'ruang kelas', 'sekolah', 'waspada', '1212040'],
  },
  // Sektor
  {
    id: 'infra',
    title: 'Infrastruktur Jalan & Jembatan',
    category: 'Sektor',
    desc: 'Tingkat jalan rusak sedang/berat dan alokasi aspal hotmix Toba.',
    href: '/map?sector=infra',
    keywords: ['infrastruktur', 'jalan', 'aspal', 'hotmix', 'jembatan', 'drainase', 'rusak'],
  },
  {
    id: 'health',
    title: 'Kesehatan & Penanganan Stunting',
    category: 'Sektor',
    desc: 'Prevalensi stunting anak balita dan pengadaan fasilitas posyandu.',
    href: '/map?sector=health',
    keywords: ['kesehatan', 'stunting', 'gizi', 'balita', 'posyandu', 'puskesmas', 'faskes'],
  },
  {
    id: 'edu',
    title: 'Pendidikan & Ruang Kelas Rusak',
    category: 'Sektor',
    desc: 'Renovasi gedung sekolah dasar dan peningkatan fasilitas belajar.',
    href: '/map?sector=education',
    keywords: ['pendidikan', 'sekolah', 'ruang kelas', 'sd', 'guru', 'perpustakaan'],
  },
  {
    id: 'social',
    title: 'Sosial & Bantuan Petani Rentan',
    category: 'Sektor',
    desc: 'Pemberdayaan kelompok tani dan perlindungan sosial kemiskinan BPS.',
    href: '/map?sector=social',
    keywords: ['sosial', 'kemiskinan', 'bansos', 'petani', 'pupuk', 'bibit', 'ekonomi'],
  },
  // Fitur & Data
  {
    id: 'map-feature',
    title: 'Peta Geospasial Gap Analysis',
    category: 'Fitur',
    desc: 'Eksplorasi pin marker koordinat 4 kecamatan dan anomali APBD vs BPS.',
    href: '/map',
    keywords: ['peta', 'map', 'geospasial', 'pin', 'marker', 'gis', 'wilayah'],
  },
  {
    id: 'simulator-feature',
    title: 'Simulator Partisipatif Kuota 100%',
    category: 'Fitur',
    desc: 'Bagi 100% alokasi anggaran daerah menurut aspirasi masyarakat.',
    href: '/simulator',
    keywords: ['simulator', 'simulasi', 'aspirasi', 'kuota', '100%', 'partisipasi', 'suara warga'],
  },
  {
    id: 'compare-feature',
    title: 'Komparasi Head-to-Head Wilayah',
    category: 'Fitur',
    desc: 'Sandingkan 2 kecamatan dengan spider/radar polygon chart.',
    href: '/compare',
    keywords: ['komparasi', 'bandingkan', 'radar', 'spider', 'head to head', 'tabel'],
  },
  {
    id: 'open-data-feature',
    title: 'Portal Data Terbuka (Unduh CSV)',
    category: 'Data',
    desc: 'Katalog dataset APBD & BPS Toba lengkap dengan kamus konversi fisik.',
    href: '/open-data',
    keywords: ['data terbuka', 'open data', 'csv', 'unduh', 'download', 'konversi', 'rupiah'],
  },
  {
    id: 'admin-feature',
    title: 'Dasbor Keputusan Musrenbang Pemda',
    category: 'Fitur',
    desc: 'Detektor anomali kebijakan dan simulasi realokasi anggaran.',
    href: '/admin',
    keywords: ['admin', 'pemda', 'musrenbang', 'dasbor', 'keputusan', 'rekomendasi', 'bappeda'],
  },
  {
    id: 'report-feature',
    title: 'Laporan Rekomendasi Pra-Musrenbang (PDF)',
    category: 'Data',
    desc: 'Dokumen eksekutif hasil analisis kesenjangan siap cetak.',
    href: '/admin/report',
    keywords: ['laporan', 'report', 'pdf', 'cetak', 'print', 'dokumen', 'musrenbang'],
  },
]

// Diverse Top Recommendations (Multi-Category, not only Wilayah)
const TOP_RECOMMENDATIONS: SearchItem[] = [
  SEARCH_DATABASE[8], // Peta Geospasial (Fitur)
  SEARCH_DATABASE[4], // Infrastruktur Jalan (Sektor)
  SEARCH_DATABASE[5], // Kesehatan & Stunting (Sektor)
  SEARCH_DATABASE[9], // Simulator Partisipatif (Fitur)
  SEARCH_DATABASE[11], // Portal Data Terbuka CSV (Data)
  SEARCH_DATABASE[0], // Kecamatan Habinsaran (Wilayah Kritis)
]

// Helper function to highlight matching search query in text
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground font-bold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

function getItemIcon(category: string) {
  switch (category) {
    case 'Wilayah':
      return <MapPin className="size-3.5 text-muted-foreground" />
    case 'Sektor':
      return <Layers className="size-3.5 text-muted-foreground" />
    case 'Data':
      return <FileText className="size-3.5 text-muted-foreground" />
    default:
      return <Sliders className="size-3.5 text-muted-foreground" />
  }
}

export function NavbarSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load search history from localStorage (max 5 items)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nalarpublik-search-history')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 5))
        }
      }
    } catch (_) {}
  }, [])

  // Save history to localStorage
  const saveHistory = (items: string[]) => {
    setHistory(items)
    try {
      localStorage.setItem('nalarpublik-search-history', JSON.stringify(items))
    } catch (_) {}
  }

  const addToHistory = (text: string) => {
    const clean = text.trim()
    if (!clean) return
    const filtered = history.filter((h) => h.toLowerCase() !== clean.toLowerCase())
    const next = [clean, ...filtered].slice(0, 5)
    saveHistory(next)
  }

  const removeFromHistory = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = history.filter((h) => h !== itemToRemove)
    saveHistory(next)
  }

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation()
    saveHistory([])
  }

  // Filter items matching query
  const trimmed = query.trim().toLowerCase()
  const results = trimmed
    ? SEARCH_DATABASE.filter((item) => {
        return (
          item.title.toLowerCase().includes(trimmed) ||
          item.desc.toLowerCase().includes(trimmed) ||
          item.category.toLowerCase().includes(trimmed) ||
          item.keywords.some((k) => k.toLowerCase().includes(trimmed))
        )
      })
    : []

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (item: SearchItem) => {
    addToHistory(item.title)
    setIsOpen(false)
    setQuery('')
    router.push(item.href)
  }

  const handleHistoryClick = (keyword: string) => {
    setQuery(keyword)
    inputRef.current?.focus()
    // If exact match found in db, user can jump or inspect
  }

  return (
    <div ref={containerRef} className="relative select-none">
      {/* ── Search Input Bar ── */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cari data, wilayah, sektor..."
          className={cn(
            'h-8 w-32 sm:w-44 lg:w-56 rounded-lg border border-border bg-muted/40 pl-8 pr-7 text-xs text-foreground',
            'placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary',
            'transition-all duration-200'
          )}
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
            aria-label="Hapus kata kunci"
          >
            <X className="size-3" />
          </button>
        ) : (
          <kbd className="hidden lg:inline-flex absolute right-2 text-[9px] font-mono text-muted-foreground/60 border border-border rounded px-1 bg-card pointer-events-none">
            Ctrl+K
          </kbd>
        )}
      </div>

      {/* ── Sleek Command-Palette Style Dropdown (Non-Card) ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[400px] max-h-[440px] overflow-y-auto rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-slide-down">

          {/* ══════════════════════════════════════════════════════════════
              CASE 1: HASIL PENCARIAN (Ketika user mengetik kata kunci)
          ══════════════════════════════════════════════════════════════ */}
          {trimmed && results.length > 0 && (
            <div className="space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-border mb-1">
                <span>HASIL PENCARIAN ({results.length})</span>
                <span className="text-primary font-bold">KATA TERKAIT DITANDAI</span>
              </div>

              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-muted/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="shrink-0">{getItemIcon(item.category)}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        <HighlightedText text={item.title} query={trimmed} />
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        <HighlightedText text={item.desc} query={trimmed} />
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shrink-0">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              CASE 2: TIDAK ADA HASIL (Empty State)
          ══════════════════════════════════════════════════════════════ */}
          {trimmed && results.length === 0 && (
            <div className="p-6 text-center space-y-3">
              <div className="size-10 rounded-xl bg-muted/60 border border-border text-muted-foreground flex items-center justify-center mx-auto">
                <SearchX className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold uppercase text-foreground">
                  Data Tidak Ditemukan
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Tidak ditemukan hasil untuk <strong className="text-rose-500 font-mono">"{query}"</strong>.
                </p>
              </div>
              <div className="pt-2 border-t border-border text-[10px] font-mono text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
                <span>Coba:</span>
                {['Habinsaran', 'Stunting', 'Jalan', 'Simulator', 'CSV'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="text-primary hover:underline font-semibold"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              CASE 3: DEFAULT STATE (Riwayat Pencarian + Rekomendasi Beragam)
          ══════════════════════════════════════════════════════════════ */}
          {!trimmed && (
            <div className="space-y-3 p-1">

              {/* ── Section A: Riwayat Pencarian (Maksimal 5 item + Clear All + Delete per item) ── */}
              {history.length > 0 && (
                <div className="space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between border-b border-border pb-1 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> RIWAYAT PENCARIAN
                    </span>
                    <button
                      onClick={clearAllHistory}
                      className="text-[10px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1 font-sans"
                    >
                      <Trash2 className="size-2.5" /> Hapus Semua
                    </button>
                  </div>

                  {history.map((histItem, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleHistoryClick(histItem)}
                      className="w-full px-3 py-1.5 rounded-lg hover:bg-muted/70 transition-colors flex items-center justify-between gap-2 group cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Clock className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-foreground truncate font-medium text-xs">
                          {histItem}
                        </span>
                      </div>

                      {/* Tombol Hapus Satu per Satu */}
                      <button
                        onClick={(e) => removeFromHistory(histItem, e)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Hapus dari riwayat"
                        aria-label={`Hapus ${histItem}`}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Section B: Rekomendasi Beragam (List Style, BUKAN Card Box) ── */}
              <div className="space-y-0.5 pt-1">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border pb-1 mb-1">
                  PINTASAN &amp; REKOMENDASI POPULER
                </div>

                {TOP_RECOMMENDATIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-muted/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="shrink-0">{getItemIcon(item.category)}</span>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground text-xs block truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shrink-0">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  )
}
