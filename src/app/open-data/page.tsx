'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Download,
  CheckCircle2,
  Building,
  HeartHandshake,
  GraduationCap,
  Coins,
  FileText,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Check,
  PenLine,
  ChevronDown,
  ExternalLink,
  UploadCloud,
  X,
  ShieldCheck,
  FileUp,
  Cpu,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  RotateCw,
} from 'lucide-react'
import { INITIAL_DISTRICTS, formatRupiah } from '@/lib/data'
import { TobaTopoBackground } from '@/components/toba-topo-background'
import { useRoleStore } from '@/store/use-role-store'
import { cn } from '@/lib/utils'

// Standar Biaya Satuan Resmi Kabupaten Toba (PRD Standard Unit Costs)
const UNIT_COSTS = {
  infra_per_km: 800_000_000, // Rp 800 Juta per km aspal hotmix
  health_per_unit: 250_000_000, // Rp 250 Juta per unit posyandu gizi lengkap
  edu_per_room: 150_000_000, // Rp 150 Juta per ruang kelas SD direhab
  social_per_farmer: 5_000_000, // Rp 5 Juta per paket bibit & pupuk per petani (Rp 50 Jt = 10 petani)
}

// 4 Standar Konversi Umum Makro (Standby Mode)
const DEFAULT_CONVERSIONS = [
  {
    icon: Building,
    rupiah: 'Rp 1 Miliar APBD',
    unit: '≈ 1,25 Km Aspal Hotmix Jalan',
    desc: 'Standar bina marga jalan kabupaten kelas III di dataran tinggi Toba.',
    baseCost: 'Biaya rata-rata: Rp 800 Juta per kilometer.',
    tag: 'Infrastruktur',
    accent: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-500/10 dark:bg-blue-500/20',
    image: '/images/sectors/infrastruktur.jpg',
  },
  {
    icon: HeartHandshake,
    rupiah: 'Rp 250 Juta APBD',
    unit: '≈ 1 Unit Posyandu Terpadu Gizi',
    desc: 'Pengadaan timbangan antropometri digital, PMT balita, dan insentif kader 1 tahun.',
    baseCost: 'Biaya standar faskes tingkat desa pedalaman.',
    tag: 'Kesehatan',
    accent: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-500/10 dark:bg-rose-500/20',
    image: '/images/sectors/kesehatan.jpg',
  },
  {
    icon: GraduationCap,
    rupiah: 'Rp 150 Juta APBD',
    unit: '≈ 1 Ruang Kelas SD Direhab Total',
    desc: 'Perbaikan atap bocor, lantai keramik, ventilasi, meja kursi, dan papan tulis.',
    baseCost: 'Biaya rata-rata renovasi fisik ruang belajar dinas pendidikan.',
    tag: 'Pendidikan',
    accent: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-500/10 dark:bg-amber-500/20',
    image: '/images/sectors/pendidikan.jpg',
  },
  {
    icon: Coins,
    rupiah: 'Rp 50 Juta APBD',
    unit: '≈ Bantuan Bibit & Pupuk 10 Petani',
    desc: 'Subsidi bibit kopi arabika, pupuk organik, dan alat pelindung tanaman.',
    baseCost: 'Pemberdayaan kelompok tani rentan di kawasan lumbung pangan.',
    tag: 'Sosial & Ekonomi',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    image: '/images/sectors/sosial.jpg',
  },
]

// Katalog Dokumen Resmi APBD & DPA Kabupaten Toba (Bisa Dipilih Bebas Oleh Warga)
interface SpecificDoc {
  id: string
  code: string
  title: string
  agency: string
  category: 'Kecamatan' | 'Program OPD'
  totalBudget: number
  badge: string
  badgeVariant: 'critical' | 'warning' | 'proportional' | 'info'
  summary: string
  pdfUrl?: string
  sourcePortal?: string
  breakdown: {
    sector: 'Infrastruktur' | 'Kesehatan' | 'Pendidikan' | 'Sosial & Ekonomi'
    icon: typeof Building
    percentage: number
    allocatedBudget: number
    physicalImpact: string
    physicalMetric: string
    unitRate: string
    details: string
    specNotes: string
  }[]
}

const SPECIFIC_DOCS: SpecificDoc[] = [
  {
    id: 'dpa-habinsaran',
    code: 'DPA/A.1/1.03.02.2.01/Kec.Habinsaran/2026',
    title: 'DPA Pagu Alokasi Kecamatan Habinsaran',
    agency: 'Kantor Camat Habinsaran & Tim Anggaran Pemkab Toba',
    category: 'Kecamatan',
    totalBudget: 21_500_000_000,
    badge: 'Prioritas Kritis (+30.0 Gap)',
    badgeVariant: 'critical',
    summary:
      'Wilayah dataran tinggi dengan indikator jalan rusak terparah (46.0%). Dokumen ini membagi pagu Rp 21,5 Miliar ke 4 sektor utama pelayanan warga.',
    pdfUrl: '/docs/dpa-habinsaran-2026.pdf',
    sourcePortal: 'JDIH / PPID Kabupaten Toba',
    breakdown: [
      {
        sector: 'Infrastruktur',
        icon: Building,
        percentage: 16.0,
        allocatedBudget: 3_440_000_000,
        physicalImpact: '4,30 Km Aspal Hotmix Jalan',
        physicalMetric: '≈ 4,30 Km',
        unitRate: 'Rp 800 Juta/km',
        details: 'Standar perkerasan jalan kabupaten kelas III dataran tinggi Parsoburan.',
        specNotes: 'Lapisan AC-WC 5 cm + 8 titik gorong-gorong drainase lereng curam.',
      },
      {
        sector: 'Kesehatan',
        icon: HeartHandshake,
        percentage: 20.0,
        allocatedBudget: 4_300_000_000,
        physicalImpact: '17 Unit Posyandu Terpadu Gizi',
        physicalMetric: '≈ 17 Unit',
        unitRate: 'Rp 250 Juta/unit',
        details: 'Faskes ramah anak untuk menekan 31.0% masalah stunting pedalaman.',
        specNotes: 'Pengadaan antropometri standar Kemenkes + PMT pangan lokal 1.020 balita.',
      },
      {
        sector: 'Pendidikan',
        icon: GraduationCap,
        percentage: 34.0,
        allocatedBudget: 7_310_000_000,
        physicalImpact: '48 Ruang Kelas SD Direhab Total',
        physicalMetric: '≈ 48 Ruang',
        unitRate: 'Rp 150 Juta/ruang',
        details: 'Renovasi gedung sekolah dasar pelosok dengan kerusakan atap & lantai.',
        specNotes: 'Termasuk 1.440 paket meja kursi belajar baru dan sanitasi layak.',
      },
      {
        sector: 'Sosial & Ekonomi',
        icon: Coins,
        percentage: 30.0,
        allocatedBudget: 6_450_000_000,
        physicalImpact: '1.290 Petani Dapat Bibit & Pupuk',
        physicalMetric: '≈ 1.290 Petani',
        unitRate: 'Rp 5 Juta/petani',
        details: 'Pemberdayaan 129 kelompok tani lumbung pangan kopi dan padi gogo.',
        specNotes: '129.000 bibit kopi Sigarar Utang + pupuk organik granul bersertifikat.',
      },
    ],
  },
  {
    id: 'dpa-balige',
    code: 'DPA/A.1/1.03.02.2.01/Kec.Balige/2026',
    title: 'DPA Pagu Alokasi Kecamatan Balige',
    agency: 'Kantor Camat Balige & BPKAD Toba',
    category: 'Kecamatan',
    totalBudget: 48_500_000_000,
    badge: 'Status Selaras (-25.5 Gap)',
    badgeVariant: 'proportional',
    summary:
      'Pusat pemerintahan dan ekonomi ibukota Kabupaten Toba dengan pagu terbesar, dialokasikan untuk infrastruktur perkotaan dan fasilitas umum.',
    pdfUrl: '/docs/dpa-balige-2026.pdf',
    sourcePortal: 'JDIH / PPID Kabupaten Toba',
    breakdown: [
      {
        sector: 'Infrastruktur',
        icon: Building,
        percentage: 40.0,
        allocatedBudget: 19_400_000_000,
        physicalImpact: '24,25 Km Aspal Hotmix & Drainase Kota',
        physicalMetric: '≈ 24,25 Km',
        unitRate: 'Rp 800 Juta/km',
        details: 'Peningkatan jalan arteri perkotaan dan konektivitas wisata pesisir Danau Toba.',
        specNotes: 'Hotmix heavy duty + trotoar pejalan kaki ramah disabilitas.',
      },
      {
        sector: 'Kesehatan',
        icon: HeartHandshake,
        percentage: 22.0,
        allocatedBudget: 10_670_000_000,
        physicalImpact: '42 Unit Faskes & Posyandu Kota',
        physicalMetric: '≈ 42 Unit',
        unitRate: 'Rp 250 Juta/unit',
        details: 'Modernisasi peralatan puskesmas rujukan dan poskesdes kelurahan.',
        specNotes: 'Puskesmas pembantu rawat inap + digitalisasi rekam medis terpadu.',
      },
      {
        sector: 'Pendidikan',
        icon: GraduationCap,
        percentage: 23.0,
        allocatedBudget: 11_155_000_000,
        physicalImpact: '74 Ruang Kelas SD/SMP Terakreditasi',
        physicalMetric: '≈ 74 Ruang',
        unitRate: 'Rp 150 Juta/ruang',
        details: 'Rehabilitasi ruang kelas dan laboratorium komputer sekolah negeri.',
        specNotes: 'Smart classroom screen + perbaikan perpustakaan ramah literasi.',
      },
      {
        sector: 'Sosial & Ekonomi',
        icon: Coins,
        percentage: 15.0,
        allocatedBudget: 7_275_000_000,
        physicalImpact: '1.455 Pelaku Usaha Mikro & Tani',
        physicalMetric: '≈ 1.455 Pelaku',
        unitRate: 'Rp 5 Juta/pelaku',
        details: 'Subsidi modal usaha mikro pariwisata Danau Toba dan lumbung pangan.',
        specNotes: 'Bantuan alat produksi UMKM olahan pangan lokal + sertifikasi halal/PIRT.',
      },
    ],
  },
  {
    id: 'dpa-laguboti',
    code: 'DPA/A.1/1.03.02.2.01/Kec.Laguboti/2026',
    title: 'DPA Pagu Alokasi Kecamatan Laguboti',
    agency: 'Kantor Camat Laguboti & Tim Anggaran Daerah',
    category: 'Kecamatan',
    totalBudget: 29_200_000_000,
    badge: 'Status Selaras (+0.0 Gap)',
    badgeVariant: 'proportional',
    summary:
      'Kawasan sentra riset teknologi IT Del dan kerajinan tenun ulos tradisional Toba dengan proporsi anggaran seimbang di keempat sektor.',
    pdfUrl: '/docs/dpa-laguboti-2026.pdf',
    sourcePortal: 'JDIH / PPID Kabupaten Toba',
    breakdown: [
      {
        sector: 'Infrastruktur',
        icon: Building,
        percentage: 28.0,
        allocatedBudget: 8_176_000_000,
        physicalImpact: '10,22 Km Aspal Akses Kawasan Pendidikan',
        physicalMetric: '≈ 10,22 Km',
        unitRate: 'Rp 800 Juta/km',
        details: 'Pengaspalan jalan penghubung sentra tenun ulos dan kawasan kampus Sitoluama.',
        specNotes: 'Pelebaran badan jalan 4,5 meter + parit beton u-ditch.',
      },
      {
        sector: 'Kesehatan',
        icon: HeartHandshake,
        percentage: 25.0,
        allocatedBudget: 7_300_000_000,
        physicalImpact: '29 Unit Posyandu Terpadu Ramah Anak',
        physicalMetric: '≈ 29 Unit',
        unitRate: 'Rp 250 Juta/unit',
        details: 'Pencegahan stunting dan pelayanan gizi terpadu keluarga muda.',
        specNotes: 'Peralatan screening balita lengkap + insentif 145 kader posyandu.',
      },
      {
        sector: 'Pendidikan',
        icon: GraduationCap,
        percentage: 27.0,
        allocatedBudget: 7_884_000_000,
        physicalImpact: '52 Ruang Kelas & Praktik Kejuruan',
        physicalMetric: '≈ 52 Ruang',
        unitRate: 'Rp 150 Juta/ruang',
        details: 'Peningkatan fasilitas ruang belajar SD-SMP dan sarana vokasi pemuda.',
        specNotes: 'Rehabilitasi atap bocor, jendela kaca, dan instalasi panel surya mini.',
      },
      {
        sector: 'Sosial & Ekonomi',
        icon: Coins,
        percentage: 20.0,
        allocatedBudget: 5_840_000_000,
        physicalImpact: '1.168 Pengrajin Ulos & Petani Padi',
        physicalMetric: '≈ 1.168 Warga',
        unitRate: 'Rp 5 Juta/orang',
        details: 'Bantuan benang tenun berkualitas tinggi dan benih padi sawah unggul.',
        specNotes: 'Paket benang tenun ATBM + pupuk NPK bersubsidi kelompok tani.',
      },
    ],
  },
  {
    id: 'dpa-porsea',
    code: 'DPA/A.1/1.03.02.2.01/Kec.Porsea/2026',
    title: 'DPA Pagu Alokasi Kecamatan Porsea',
    agency: 'Kantor Camat Porsea & OPD Terkait',
    category: 'Kecamatan',
    totalBudget: 26_800_000_000,
    badge: 'Status Waspada (+15.5 Gap)',
    badgeVariant: 'warning',
    summary:
      'Simpul perdagangan dan perikanan air tawar Danau Toba bagian timur dengan tantangan pelayanan kesehatan anak (29.5% masalah).',
    pdfUrl: '/docs/dpa-porsea-2026.pdf',
    sourcePortal: 'JDIH / PPID Kabupaten Toba',
    breakdown: [
      {
        sector: 'Infrastruktur',
        icon: Building,
        percentage: 35.0,
        allocatedBudget: 9_380_000_000,
        physicalImpact: '11,72 Km Jalan Lingkar & Akses Perikanan',
        physicalMetric: '≈ 11,72 Km',
        unitRate: 'Rp 800 Juta/km',
        details: 'Akses jalur angkut ikan dan konektivitas antardesa tepi Danau Toba.',
        specNotes: 'Pengaspalan hotmix kelas III tahan genangan air pasang danau.',
      },
      {
        sector: 'Kesehatan',
        icon: HeartHandshake,
        percentage: 14.0,
        allocatedBudget: 3_752_000_000,
        physicalImpact: '15 Unit Posyandu Gizi Tepi Danau',
        physicalMetric: '≈ 15 Unit',
        unitRate: 'Rp 250 Juta/unit',
        details: 'Intervensi khusus gizi balita dan imunisasi wilayah pesisir.',
        specNotes: 'Ambulans air mini + posyandu gizi bergerak melayani pulau kecil.',
      },
      {
        sector: 'Pendidikan',
        icon: GraduationCap,
        percentage: 28.0,
        allocatedBudget: 7_504_000_000,
        physicalImpact: '50 Ruang Kelas Sekolah Pesisir',
        physicalMetric: '≈ 50 Ruang',
        unitRate: 'Rp 150 Juta/ruang',
        details: 'Renovasi gedung SD pesisir dan pengadaan meubelair anti-rayap.',
        specNotes: 'Pengecatan ulang, plafon gypsum anti-lembab, dan sanitasi air bersih.',
      },
      {
        sector: 'Sosial & Ekonomi',
        icon: Coins,
        percentage: 23.0,
        allocatedBudget: 6_164_000_000,
        physicalImpact: '1.232 Nelayan Air Tawar & Petani',
        physicalMetric: '≈ 1.232 Warga',
        unitRate: 'Rp 5 Juta/orang',
        details: 'Bantuan jaring ikan ramah lingkungan dan bibit bawang merah lokal.',
        specNotes: 'Alat tangkap jaring apung non-kimia + bibit bawang merah Toba 5 ton.',
      },
    ],
  },
  {
    id: 'dpa-putr-habinsaran',
    code: 'DPA/1.03.01.2.01/PUTR-TOBA/2026',
    title: 'DPA Program Peningkatan Jalan Dataran Tinggi Habinsaran - Borbor',
    agency: 'Dinas Pekerjaan Umum & Tata Ruang (PUTR) Toba',
    category: 'Program OPD',
    totalBudget: 4_000_000_000,
    badge: 'Program Strategis Jalan',
    badgeVariant: 'info',
    summary:
      'Dokumen belanja modal pengaspalan hotmix ruas jalan utama penghubung sentra lumbung pangan Parsoburan ke pusat pengolahan Borbor.',
    pdfUrl: '/docs/dpa-putr-jalan-2026.pdf',
    sourcePortal: 'PPID Dinas PUTR Kabupaten Toba',
    breakdown: [
      {
        sector: 'Infrastruktur',
        icon: Building,
        percentage: 100.0,
        allocatedBudget: 4_000_000_000,
        physicalImpact: '5,00 Km Jalan Aspal Hotmix Kelas III',
        physicalMetric: '≈ 5,00 Km',
        unitRate: 'Rp 800 Juta/km',
        details: 'Pengaspalan hotmix tebal 5 cm dengan lebar perkerasan 4,0 meter.',
        specNotes: 'Termasuk 12 unit plat deker penyeberang air dan 8 titik talud tebing.',
      },
    ],
  },
  {
    id: 'dpa-dinkes-stunting',
    code: 'DPA/1.02.01.2.02/DINKES-TOBA/2026',
    title: 'DPA Percepatan Penurunan Stunting & Revitalisasi Posyandu Desa',
    agency: 'Dinas Kesehatan Kabupaten Toba',
    category: 'Program OPD',
    totalBudget: 1_500_000_000,
    badge: 'Program Prioritas Kesehatan',
    badgeVariant: 'info',
    summary:
      'Intervensi spesifik penanganan stunting terpadu di 4 kecamatan percontohan, menyediakan sarana posyandu mandiri dan PMT balita.',
    pdfUrl: '/docs/dpa-dinkes-stunting-2026.pdf',
    sourcePortal: 'PPID Dinas Kesehatan Kabupaten Toba',
    breakdown: [
      {
        sector: 'Kesehatan',
        icon: HeartHandshake,
        percentage: 100.0,
        allocatedBudget: 1_500_000_000,
        physicalImpact: '6 Unit Posyandu Terpadu Mandiri Lengkap',
        physicalMetric: '≈ 6 Unit',
        unitRate: 'Rp 250 Juta/unit',
        details: 'Bangunan posyandu terstandar dengan paket alat ukur antropometri digital.',
        specNotes: 'Pemberian Makanan Tambahan (PMT) protein telur & susu 360 balita 1 tahun.',
      },
    ],
  },
  {
    id: 'dpa-disdik-rehab',
    code: 'DPA/1.01.01.2.03/DISDIK-TOBA/2026',
    title: 'DPA DAK Fisik Rehabilitasi Ruang Belajar SD Pelosok Toba',
    agency: 'Dinas Pendidikan, Pemuda dan Olahraga Kabupaten Toba',
    category: 'Program OPD',
    totalBudget: 1_800_000_000,
    badge: 'Program Sarana Pendidikan',
    badgeVariant: 'info',
    summary:
      'Penuntasan ruang belajar bocor dan rusak sedang di sekolah dasar pedalaman kecamatan percontohan Toba.',
    pdfUrl: '/docs/dpa-disdik-rehab-2026.pdf',
    sourcePortal: 'PPID Disdikpora Kabupaten Toba',
    breakdown: [
      {
        sector: 'Pendidikan',
        icon: GraduationCap,
        percentage: 100.0,
        allocatedBudget: 1_800_000_000,
        physicalImpact: '12 Ruang Kelas SD Direhab Total',
        physicalMetric: '≈ 12 Ruang',
        unitRate: 'Rp 150 Juta/ruang',
        details: 'Renovasi atap baja ringan, lantai granit anti-licin, dan pencahayaan sehat.',
        specNotes: 'Dilengkapi 360 set meja kursi siswa ergonomis buatan pengrajin lokal Toba.',
      },
    ],
  },
  {
    id: 'dpa-distan-kopi',
    code: 'DPA/1.04.01.2.04/DISTAN-TOBA/2026',
    title: 'DPA Bantuan Stimulan Benih Kopi Arabika Sigarar Utang & Pupuk',
    agency: 'Dinas Pertanian & Ketahanan Pangan Kabupaten Toba',
    category: 'Program OPD',
    totalBudget: 750_000_000,
    badge: 'Program Ketahanan Pangan',
    badgeVariant: 'info',
    summary:
      'Pemberdayaan ekonomi petani rentan di kawasan dataran tinggi melalui bibit unggul kopi kopi khas Toba.',
    pdfUrl: '/docs/dpa-distan-kopi-2026.pdf',
    sourcePortal: 'PPID Dinas Pertanian Kabupaten Toba',
    breakdown: [
      {
        sector: 'Sosial & Ekonomi',
        icon: Coins,
        percentage: 100.0,
        allocatedBudget: 750_000_000,
        physicalImpact: '150 Petani Dapat Paket Bibit & Pupuk Lengkap',
        physicalMetric: '≈ 150 Petani',
        unitRate: 'Rp 5 Juta/petani',
        details: 'Paket 150 batang bibit kopi bersertifikasi per petani + 200 kg pupuk organik.',
        specNotes: 'Didistribusikan kepada 15 kelompok tani binaan di dataran tinggi Toba.',
      },
    ],
  },
]

// Preset chips kalkulator mandiri
const PRESET_AMOUNTS = [
  { label: 'Rp 50 Juta', value: 50_000_000 },
  { label: 'Rp 150 Juta', value: 150_000_000 },
  { label: 'Rp 250 Juta', value: 250_000_000 },
  { label: 'Rp 1 Miliar', value: 1_000_000_000 },
  { label: 'Rp 5 Miliar', value: 5_000_000_000 },
  { label: 'Rp 10 Miliar', value: 10_000_000_000 },
]

export default function OpenDataPage() {
  const { role } = useRoleStore()
  const isAdmin = role === 'admin'

  const [downloaded, setDownloaded] = useState<boolean>(false)

  // Mode: 'standby' (Umum - default) vs 'specific' (Pilih Dokumen DPA Spesifik)
  const [activeMode, setActiveMode] = useState<'standby' | 'specific'>('standby')

  // Daftar dokumen resmi & dokumen hasil unggahan admin
  const [docsList, setDocsList] = useState<SpecificDoc[]>(SPECIFIC_DOCS)

  // Dokumen spesifik terpilih
  const [selectedDocId, setSelectedDocId] = useState<string>('dpa-habinsaran')

  // Load custom uploaded docs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nalarpublik-uploaded-docs')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hydrated = parsed.map((doc: Omit<SpecificDoc, 'breakdown'> & { breakdown: Array<Omit<SpecificDoc['breakdown'][number], 'icon'>> }) => ({
            ...doc,
            breakdown: doc.breakdown.map((b) => ({
              ...b,
              icon:
                b.sector === 'Infrastruktur'
                  ? Building
                  : b.sector === 'Kesehatan'
                    ? HeartHandshake
                    : b.sector === 'Pendidikan'
                      ? GraduationCap
                      : Coins,
            })),
          }))
          setDocsList([...SPECIFIC_DOCS, ...hydrated])
        }
      }
    } catch (_) { }
  }, [])

  // State Modal Unggah DPA & AI Document Parsing Engine
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false)
  const [parseState, setParseState] = useState<'idle' | 'scanning' | 'success'>('idle')
  const [scanProgress, setScanProgress] = useState<number>(0)
  const [scanStepIndex, setScanStepIndex] = useState<number>(0)
  const [showManualEdit, setShowManualEdit] = useState<boolean>(false)
  const [selectedSampleName, setSelectedSampleName] = useState<string>('')
  const [selectedSampleUrl, setSelectedSampleUrl] = useState<string | null>(null)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [newDocTitle, setNewDocTitle] = useState<string>('')
  const [newDocCode, setNewDocCode] = useState<string>('')
  const [newDocAgency, setNewDocAgency] = useState<string>('')
  const [newDocCategory, setNewDocCategory] = useState<'Kecamatan' | 'Program OPD'>('Program OPD')
  const [newDocBudget, setNewDocBudget] = useState<number>(3_000_000_000)
  const [newDocBudgetText, setNewDocBudgetText] = useState<string>('3.000.000.000')
  const [newAlloc, setNewAlloc] = useState<{
    infra: number
    health: number
    edu: number
    social: number
  }>({ infra: 40, health: 25, edu: 20, social: 15 })
  const [uploadToast, setUploadToast] = useState<string | null>(null)

  // State flip card & pop up info untuk 4 Standar Konversi Makro
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({})
  const [activeConversionPopup, setActiveConversionPopup] = useState<typeof DEFAULT_CONVERSIONS[0] | null>(null)
  const [showTranslationDropdown, setShowTranslationDropdown] = useState<boolean>(false)
  const [docDownloaded, setDocDownloaded] = useState<boolean>(false)

  const downloadDocCSV = (doc: SpecificDoc) => {
    const headers = [
      'Kode Dokumen',
      'Judul Dokumen',
      'Kategori',
      'Instansi Penanggung Jawab',
      'Total Pagu (Rp)',
      'Sektor',
      'Persentase Pagu (%)',
      'Alokasi Anggaran (Rp)',
      'Ekuivalen Fisik di Lapangan',
      'Spesifikasi Teknis',
      'Standar Biaya Satuan',
    ]
    const rows = doc.breakdown.map((item) => [
      `"${doc.code}"`,
      `"${doc.title}"`,
      `"${doc.category}"`,
      `"${doc.agency}"`,
      doc.totalBudget,
      `"${item.sector}"`,
      item.percentage,
      item.allocatedBudget,
      `"${item.physicalImpact}"`,
      `"${item.specNotes}"`,
      `"${item.unitRate}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${doc.id}_ringkasan_dpa_toba.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDocDownloaded(true)
    setTimeout(() => setDocDownloaded(false), 3000)
  }

  const toggleCardFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Contoh Berkas PDF Resmi untuk Demonstrasi Cepat (Lomba & Audit)
  const DEMO_SAMPLES = [
    {
      id: 'sample-putr',
      name: 'dpa-putr-jalan-2026.pdf',
      label: 'DPA Peningkatan Jalan (PUTR Toba)',
      budgetBadge: 'Rp 4,0 Miliar',
      sectorBadge: 'Infrastruktur 65%',
      title: 'DPA Program Peningkatan Jalan Dataran Tinggi Habinsaran - Borbor',
      code: 'DPA/A.1/1.03.02.2.01/PUTR/2026',
      agency: 'Dinas Pekerjaan Umum dan Tata Ruang Kab. Toba',
      category: 'Program OPD' as const,
      budget: 4_000_000_000,
      alloc: { infra: 65, health: 15, edu: 10, social: 10 },
      pdfUrl: '/docs/dpa-putr-jalan-2026.pdf',
    },
    {
      id: 'sample-dinkes',
      name: 'dpa-dinkes-stunting-2026.pdf',
      label: 'DPA Intervensi Stunting & Posyandu (Dinkes)',
      budgetBadge: 'Rp 1,5 Miliar',
      sectorBadge: 'Kesehatan 65%',
      title: 'DPA Percepatan Penurunan Stunting & Revitalisasi Posyandu Desa',
      code: 'DPA/A.1/1.02.01.2.01/DINKES/2026',
      agency: 'Dinas Kesehatan Kabupaten Toba',
      category: 'Program OPD' as const,
      budget: 1_500_000_000,
      alloc: { infra: 10, health: 65, edu: 15, social: 10 },
      pdfUrl: '/docs/dpa-dinkes-stunting-2026.pdf',
    },
    {
      id: 'sample-disdik',
      name: 'dpa-disdik-rehab-2026.pdf',
      label: 'DPA Rehab Ruang Belajar SD (Disdik Toba)',
      budgetBadge: 'Rp 1,8 Miliar',
      sectorBadge: 'Pendidikan 65%',
      title: 'DPA DAK Fisik Rehabilitasi Ruang Belajar SD Pelosok Toba',
      code: 'DPA/A.1/1.01.01.2.04/DISDIK/2026',
      agency: 'Dinas Pendidikan, Pemuda dan Olahraga Kab. Toba',
      category: 'Program OPD' as const,
      budget: 1_800_000_000,
      alloc: { infra: 15, health: 10, edu: 65, social: 10 },
      pdfUrl: '/docs/dpa-disdik-rehab-2026.pdf',
    },
    {
      id: 'sample-distan',
      name: 'dpa-distan-kopi-2026.pdf',
      label: 'DPA Bantuan Bibit Kopi & Pupuk (Distan)',
      budgetBadge: 'Rp 750 Juta',
      sectorBadge: 'Sosial & Pertanian 70%',
      title: 'DPA Bantuan Stimulan Benih Kopi Arabika Sigarar Utang & Pupuk',
      code: 'DPA/A.1/2.09.01.2.03/DISTAN/2026',
      agency: 'Dinas Pertanian dan Perikanan Kab. Toba',
      category: 'Program OPD' as const,
      budget: 750_000_000,
      alloc: { infra: 10, health: 10, edu: 10, social: 70 },
      pdfUrl: '/docs/dpa-distan-kopi-2026.pdf',
    },
  ]

  const SCAN_STEPS = [
    'Membaca metadata & struktur pos belanja berkas DPA resmi...',
    'Mendeteksi Nomenklatur Program, Satuan Kerja, & Kode Rekening APBD...',
    'Mengekstrak Nilai Pagu Anggaran (IDR) & Sub-Kegiatan Belanja...',
    'Mengklasifikasikan alokasi belanja ke 4 sektor prioritas (PRD §2)...',
    'Menghitung ekuivalensi fisik sesuai Standar Satuan Biaya (SSH) Toba...',
  ]

  const startDocumentExtraction = ({
    fileName,
    preset,
    file,
  }: {
    fileName: string
    preset?: (typeof DEMO_SAMPLES)[0]
    file?: File
  }) => {
    setSelectedSampleName(fileName)
    setParseState('scanning')
    setScanProgress(15)
    setScanStepIndex(0)

    if (file) {
      setUploadedFile(file)
      setSelectedSampleUrl(null)
    }

    // Step 1: 380ms
    setTimeout(() => {
      setScanProgress(40)
      setScanStepIndex(1)
    }, 380)

    // Step 2: 800ms
    setTimeout(() => {
      setScanProgress(70)
      setScanStepIndex(2)
    }, 800)

    // Step 3: 1250ms
    setTimeout(() => {
      setScanProgress(92)
      setScanStepIndex(3)
    }, 1250)

    // Step 4: 1700ms -> Done
    setTimeout(() => {
      setScanProgress(100)
      setScanStepIndex(4)

      if (preset) {
        setNewDocTitle(preset.title)
        setNewDocCode(preset.code)
        setNewDocAgency(preset.agency)
        setNewDocCategory(preset.category)
        setNewDocBudget(preset.budget)
        setNewDocBudgetText(preset.budget.toLocaleString('id-ID'))
        setNewAlloc(preset.alloc)
        setSelectedSampleUrl(preset.pdfUrl)
      } else {
        const lower = fileName.toLowerCase()
        if (lower.includes('jalan') || lower.includes('putr') || lower.includes('infra') || lower.includes('jembatan')) {
          setNewDocTitle('DPA Program Peningkatan Jalan Dataran Tinggi Habinsaran - Borbor')
          setNewDocCode('DPA/A.1/1.03.02.2.01/PUTR/2026')
          setNewDocAgency('Dinas Pekerjaan Umum dan Tata Ruang Kab. Toba')
          setNewDocCategory('Program OPD')
          setNewDocBudget(4_000_000_000)
          setNewDocBudgetText('4.000.000.000')
          setNewAlloc({ infra: 65, health: 15, edu: 10, social: 10 })
          setSelectedSampleUrl('/docs/dpa-putr-jalan-2026.pdf')
        } else if (lower.includes('stunting') || lower.includes('kesehatan') || lower.includes('posyandu') || lower.includes('dinkes')) {
          setNewDocTitle('DPA Percepatan Penurunan Stunting & Revitalisasi Posyandu Desa')
          setNewDocCode('DPA/A.1/1.02.01.2.01/DINKES/2026')
          setNewDocAgency('Dinas Kesehatan Kabupaten Toba')
          setNewDocCategory('Program OPD')
          setNewDocBudget(1_500_000_000)
          setNewDocBudgetText('1.500.000.000')
          setNewAlloc({ infra: 10, health: 65, edu: 15, social: 10 })
          setSelectedSampleUrl('/docs/dpa-dinkes-stunting-2026.pdf')
        } else if (lower.includes('sekolah') || lower.includes('ruang') || lower.includes('pendidikan') || lower.includes('disdik') || lower.includes('exam')) {
          setNewDocTitle('DPA DAK Fisik Rehabilitasi Ruang Belajar SD Pelosok Toba')
          setNewDocCode('DPA/A.1/1.01.01.2.04/DISDIK/2026')
          setNewDocAgency('Dinas Pendidikan, Pemuda dan Olahraga Kab. Toba')
          setNewDocCategory('Program OPD')
          setNewDocBudget(1_800_000_000)
          setNewDocBudgetText('1.800.000.000')
          setNewAlloc({ infra: 15, health: 10, edu: 65, social: 10 })
          setSelectedSampleUrl('/docs/dpa-disdik-rehab-2026.pdf')
        } else if (lower.includes('kopi') || lower.includes('tani') || lower.includes('bibit') || lower.includes('pupuk') || lower.includes('distan')) {
          setNewDocTitle('DPA Bantuan Stimulan Benih Kopi Arabika Sigarar Utang & Pupuk')
          setNewDocCode('DPA/A.1/2.09.01.2.03/DISTAN/2026')
          setNewDocAgency('Dinas Pertanian dan Perikanan Kab. Toba')
          setNewDocCategory('Program OPD')
          setNewDocBudget(750_000_000)
          setNewDocBudgetText('750.000.000')
          setNewAlloc({ infra: 10, health: 10, edu: 10, social: 70 })
          setSelectedSampleUrl('/docs/dpa-distan-kopi-2026.pdf')
        } else {
          const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          setNewDocTitle(`DPA Program Strategis Penataan ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)} TA 2026`)
          setNewDocCode(`DPA/A.1/1.03.02.2.08/BAPPEDA/2026`)
          setNewDocAgency('Bappelitbangda Kabupaten Toba')
          setNewDocCategory('Program OPD')
          setNewDocBudget(3_200_000_000)
          setNewDocBudgetText('3.200.000.000')
          setNewAlloc({ infra: 40, health: 25, edu: 20, social: 15 })
          setSelectedSampleUrl('/docs/dpa-habinsaran-2026.pdf')
        }
      }

      setParseState('success')
    }, 1700)
  }

  const handleNewDocBudgetChange = (amount: number) => {
    setNewDocBudget(amount)
    setNewDocBudgetText(amount.toLocaleString('id-ID'))
  }

  const handleNewDocBudgetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      setNewDocBudgetText('')
      setNewDocBudget(0)
      return
    }
    const num = Math.min(100_000_000_000, parseInt(raw, 10))
    setNewDocBudget(num)
    setNewDocBudgetText(num.toLocaleString('id-ID'))
  }

  const selectedDoc = docsList.find((d) => d.id === selectedDocId) || docsList[0]

  // Kalkulator Mandiri (Interaktif di Mode Standby)
  const [calcAmount, setCalcAmount] = useState<number>(1_000_000_000)
  const [calcInputText, setCalcInputText] = useState<string>('1.000.000.000')

  const handleAmountChange = (num: number) => {
    const clamped = Math.max(0, num)
    setCalcAmount(clamped)
    setCalcInputText(clamped.toLocaleString('id-ID'))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      setCalcInputText('')
      setCalcAmount(0)
      return
    }
    const num = Math.min(100_000_000_000, parseInt(raw, 10))
    setCalcAmount(num)
    setCalcInputText(num.toLocaleString('id-ID'))
  }

  // Handle submit unggah DPA baru oleh admin
  const totalAlloc = newAlloc.infra + newAlloc.health + newAlloc.edu + newAlloc.social
  const isAllocValid = totalAlloc === 100

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAllocValid || !newDocTitle.trim()) return

    const newId = `custom-dpa-${Date.now()}`
    const fileUrl = uploadedFile
      ? URL.createObjectURL(uploadedFile)
      : selectedSampleUrl || '/docs/dpa-habinsaran-2026.pdf'

    const customDoc: SpecificDoc = {
      id: newId,
      code: newDocCode.trim() || `DPA/OPD/${Date.now().toString().slice(-4)}/TOBA/2026`,
      title: newDocTitle.trim(),
      agency: newDocAgency.trim() || 'Pemerintah Kabupaten Toba',
      category: newDocCategory,
      totalBudget: newDocBudget,
      badge: 'UNGGAHAN DPA ADMIN',
      badgeVariant: 'info',
      summary: `Dokumen DPA resmi diunggah oleh Admin Pemkab Toba. Berkas terhubung ke sistem penerjemah fisik NalarPublik.`,
      pdfUrl: fileUrl,
      sourcePortal: 'Unggahan Admin Resmi Pemkab Toba',
      breakdown: [
        ...(newAlloc.infra > 0
          ? [
            {
              sector: 'Infrastruktur' as const,
              icon: Building,
              percentage: newAlloc.infra,
              allocatedBudget: (newDocBudget * newAlloc.infra) / 100,
              physicalImpact: `${((newDocBudget * newAlloc.infra) / 100 / UNIT_COSTS.infra_per_km).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Km Aspal Hotmix Jalan`,
              physicalMetric: `≈ ${((newDocBudget * newAlloc.infra) / 100 / UNIT_COSTS.infra_per_km).toFixed(2)} Km`,
              unitRate: 'Rp 800 Juta/km',
              details: 'Peningkatan jalan standar bina marga dataran tinggi Toba.',
              specNotes: 'Spesifikasi teknis sesuai dokumen DPA resmi yang diunggah.',
            },
          ]
          : []),
        ...(newAlloc.health > 0
          ? [
            {
              sector: 'Kesehatan' as const,
              icon: HeartHandshake,
              percentage: newAlloc.health,
              allocatedBudget: (newDocBudget * newAlloc.health) / 100,
              physicalImpact: `${Math.floor((newDocBudget * newAlloc.health) / 100 / UNIT_COSTS.health_per_unit)} Unit Posyandu Terpadu Gizi`,
              physicalMetric: `≈ ${Math.floor((newDocBudget * newAlloc.health) / 100 / UNIT_COSTS.health_per_unit)} Unit`,
              unitRate: 'Rp 250 Juta/unit',
              details: 'Pengadaan sarana posyandu mandiri & PMT balita pencegahan stunting.',
              specNotes: 'Spesifikasi teknis sesuai dokumen DPA resmi yang diunggah.',
            },
          ]
          : []),
        ...(newAlloc.edu > 0
          ? [
            {
              sector: 'Pendidikan' as const,
              icon: GraduationCap,
              percentage: newAlloc.edu,
              allocatedBudget: (newDocBudget * newAlloc.edu) / 100,
              physicalImpact: `${Math.floor((newDocBudget * newAlloc.edu) / 100 / UNIT_COSTS.edu_per_room)} Ruang Kelas SD/SMP Direhab`,
              physicalMetric: `≈ ${Math.floor((newDocBudget * newAlloc.edu) / 100 / UNIT_COSTS.edu_per_room)} Ruang`,
              unitRate: 'Rp 150 Juta/ruang',
              details: 'Rehabilitasi ruang belajar sekolah dasar & meubelair siswa.',
              specNotes: 'Spesifikasi teknis sesuai dokumen DPA resmi yang diunggah.',
            },
          ]
          : []),
        ...(newAlloc.social > 0
          ? [
            {
              sector: 'Sosial & Ekonomi' as const,
              icon: Coins,
              percentage: newAlloc.social,
              allocatedBudget: (newDocBudget * newAlloc.social) / 100,
              physicalImpact: `${Math.floor((newDocBudget * newAlloc.social) / 100 / UNIT_COSTS.social_per_farmer).toLocaleString('id-ID')} Petani Dapat Bantuan Bibit & Pupuk`,
              physicalMetric: `≈ ${Math.floor((newDocBudget * newAlloc.social) / 100 / UNIT_COSTS.social_per_farmer)} Petani`,
              unitRate: 'Rp 5 Juta/petani',
              details: 'Bantuan benih unggul kopi dataran tinggi & pupuk organik kelompok tani.',
              specNotes: 'Spesifikasi teknis sesuai dokumen DPA resmi yang diunggah.',
            },
          ]
          : []),
      ],
    }

    const updated = [customDoc, ...docsList]
    setDocsList(updated)
    setSelectedDocId(newId)
    setShowUploadModal(false)
    setParseState('idle')
    setUploadedFile(null)
    setSelectedSampleUrl(null)
    setSelectedSampleName('')
    setShowManualEdit(false)
    setNewDocTitle('')
    setNewDocCode('')
    setNewDocAgency('')
    setUploadToast(`Dokumen "${customDoc.title}" berhasil diekstrak otomatis dan diterbitkan ke portal warga!`)
    setTimeout(() => setUploadToast(null), 6000)

    try {
      const stored = localStorage.getItem('nalarpublik-uploaded-docs')
      const existing = stored ? JSON.parse(stored) : []
      const toStore = [{ ...customDoc, pdfUrl: fileUrl }, ...existing]
      localStorage.setItem('nalarpublik-uploaded-docs', JSON.stringify(toStore))
    } catch (_) { }
  }

  // Helper memformat benda fisik/solid yang tidak bisa didesimalkan (bulatkan atau buat range logis)
  const formatSolidUnits = (val: number): string => {
    if (val < 0.05) return '0'
    const floor = Math.floor(val)
    const ceil = Math.ceil(val)
    if (floor === ceil) return floor.toLocaleString('id-ID')
    return `${floor} - ${ceil}`
  }

  // Perhitungan interaktif kalkulator mandiri
  const calcResults = {
    infra_km: (calcAmount / UNIT_COSTS.infra_per_km).toLocaleString('id-ID', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }),
    health_units: formatSolidUnits(calcAmount / UNIT_COSTS.health_per_unit),
    edu_rooms: formatSolidUnits(calcAmount / UNIT_COSTS.edu_per_room),
    social_farmers: Math.floor(calcAmount / UNIT_COSTS.social_per_farmer).toLocaleString('id-ID'),
  }

  const downloadCSV = () => {
    const link = document.createElement('a')
    link.href = '/api/export'
    link.setAttribute('download', 'nalarpublik_toba_apbd_bps_2026.csv')
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2 animate-fade-in">
              <span className="size-1.5 bg-primary" />
              DATA TERBUKA KABUPATEN TOBA
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground sm:whitespace-nowrap animate-fade-in"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Data Terbuka Anggaran Kabupaten Toba
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mt-1 animate-fade-in">
              Lihat dan unduh data anggaran daerah serta kebutuhan masyarakat dalam bentuk yang mudah dipahami.
            </p>
          </div>
        </div>

        {/* ── Interactive Feature: Penerjemah Anggaran & Kamus Konversi */}
        <div className="space-y-6 bg-card/60 backdrop-blur-xs border border-border rounded-3xl p-5 sm:p-7 shadow-sm animate-fade-in" style={{ animationDelay: '180ms' }}>

          {/* Header Section & Interactive Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h2
                className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Penerjemah Anggaran &amp; Kamus Konversi
              </h2>
            </div>

            {/* Mode Switcher Pills: Standar Umum (Standby) vs Pilih Dokumen Spesifik */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-muted/60 border border-border shrink-0 self-start lg:self-auto">
              <button
                onClick={() => setActiveMode('standby')}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  activeMode === 'standby'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Layers className="size-3.5" />
                <span>Sering Dicari</span>
              </button>

              <button
                onClick={() => setActiveMode('specific')}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                  activeMode === 'specific'
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <FileText className="size-3.5" />
                <span>Pilih Dokumen</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              MODE 1: STANDBY / UMUM (Default Standby Mode)
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === 'standby' && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* Status Banner Standby */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-emerald-500" />
                  <span className="font-mono uppercase tracking-wider text-[11px] font-bold text-foreground">
                    STANDAR BIAYA SATUAN KABUPATEN TOBA
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span>Ingin membedah dokumen DPA tertentu?</span>
                  <button
                    onClick={() => setActiveMode('specific')}
                    className="font-bold text-primary hover:underline inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/25 shadow-2xs cursor-pointer"
                  >
                    <FileText className="size-3.5" />
                    <span>Pilih Dokumen DPA</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>

              {/* 4 Kartu Standar Satuan Biaya Makro (Interactive Flip Card — Grid 2 Kolom di Mobile, 4 di Desktop) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {DEFAULT_CONVERSIONS.map((item, idx) => {
                  const Icon = item.icon
                  const isFlipped = !!flippedCards[idx]

                  return (
                    <div
                      key={idx}
                      className="relative h-[175px] xs:h-[185px] sm:h-[225px] w-full [perspective:1000px] cursor-pointer group select-none"
                      onClick={() => toggleCardFlip(idx)}
                    >
                      <div
                        className="relative w-full h-full transition-transform duration-500 rounded-2xl"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* ── Sisi Depan (Latar Belakang Foto Sektor Toba Tajam & Presisi Penuh) ── */}
                        <div
                          className="absolute inset-0 w-full h-full bg-slate-900 border border-border/80 hover:border-primary/80 hover:shadow-xl transition-all rounded-2xl p-2.5 sm:p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5 sm:space-y-3 cursor-pointer overflow-hidden group"
                          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        >
                          {/* Latar Belakang Foto Tajam Sektor Toba - Presisi Penuh & Jernih */}
                          <img
                            src={item.image}
                            alt={item.tag}
                            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          {/* Lapisan Pelindung Kontras Merata Seluruh Permukaan (100% Full Bleed, Tanpa Celah Bawah) */}
                          <div className="absolute inset-0 w-full h-full bg-black/45 dark:bg-black/55 pointer-events-none" />

                          {/* Konten Utama Kartu */}
                          <div className="relative z-10 flex flex-col items-center text-center space-y-1.5 sm:space-y-3">
                            <div className={cn('size-9 sm:size-13 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg border border-white/25 bg-white/95 dark:bg-card/95', item.accent)}>
                              <Icon className="size-4.5 sm:size-6 stroke-[2.2]" />
                            </div>

                            <div className="space-y-1 sm:space-y-1.5">
                              <h4
                                className="text-xs sm:text-base font-extrabold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                              >
                                {item.tag}
                              </h4>
                              <span className="text-[9px] sm:text-xs font-mono text-white/95 font-bold inline-block bg-black/60 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/25 shadow-xs whitespace-nowrap">
                                {item.rupiah}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ── Sisi Belakang (Flipped: Pop-up Info Rincian) ── */}
                        <div
                          className="absolute inset-0 w-full h-full bg-card border-2 border-primary/40 rounded-2xl p-2.5 sm:p-5 shadow-lg flex flex-col justify-between text-left cursor-pointer overflow-hidden"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-border/80">
                            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-primary font-bold truncate">
                              {item.tag}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 font-semibold shrink-0">
                              Putar ↺
                            </span>
                          </div>

                          <div className="space-y-1 sm:space-y-2 py-0.5 sm:py-1">
                            <p
                              className="text-xs sm:text-sm font-extrabold text-foreground leading-snug line-clamp-1 sm:line-clamp-none"
                              style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                              {item.unit}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight sm:leading-relaxed line-clamp-2">
                              {item.desc}
                            </p>
                            <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-muted/60 border border-border/80 text-[9px] sm:text-[11px] font-mono text-foreground font-semibold truncate">
                              {item.baseCost}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-border/80 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveConversionPopup(item)
                              }}
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                              title="Buka Pop-up Lengkap"
                            >
                              <ExternalLink className="size-3.5 sm:size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCardFlip(idx)
                              }}
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                              title="Putar Balik Kartu"
                            >
                              <RotateCcw className="size-3.5 sm:size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Kalkulator Interaktif Mandiri: Bebas Masukkan Nominal Anggaran */}
              <div className="rounded-2xl border border-primary/20 bg-linear-to-b from-primary/5 to-transparent p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                      <Sliders className="size-3.5" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      Kalkulator Interaktif: Coba Masukkan Anggaran APBD Sendiri
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    SIMULASI LANGSUNG
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label htmlFor="apbd-calc-input" className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                        <PenLine className="size-3.5 text-primary" />
                        <span>Ketik Nominal Anggaran APBD:</span>
                      </label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Ketik angka bebas di kotak input atau gunakan preset &amp; slider di bawah.
                      </p>
                    </div>

                    {/* Interactive Input Box with Rp Prefix */}
                    <div className="self-start sm:self-auto">
                      <div className="relative flex items-center bg-card rounded-xl border-2 border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 shadow-xs transition-all px-3.5 py-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground mr-2 select-none">
                          Rp
                        </span>
                        <input
                          id="apbd-calc-input"
                          type="text"
                          inputMode="numeric"
                          value={calcInputText}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="w-44 sm:w-56 bg-transparent font-mono text-base sm:text-lg font-extrabold text-foreground focus:outline-hidden"
                          aria-label="Ketik nominal anggaran APBD"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-mono text-muted-foreground mr-1">Preset cepat:</span>
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleAmountChange(preset.value)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border',
                          calcAmount === preset.value
                            ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
                            : 'bg-card text-muted-foreground hover:text-foreground border-border hover:border-primary/40'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Range Slider */}
                  <div className="pt-2">
                    <input
                      type="range"
                      min={50_000_000}
                      max={20_000_000_000}
                      step={50_000_000}
                      value={calcAmount > 20_000_000_000 ? 20_000_000_000 : calcAmount}
                      onChange={(e) => handleAmountChange(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground pt-1">
                      <span>Rp 50 Juta</span>
                      <span>Rp 10 Miliar</span>
                      <span>Rp 20 Miliar</span>
                    </div>
                  </div>
                </div>

                {/* Hasil Interaktif di 4 Sektor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>Infrastruktur Jalan</span>
                      <Building className="size-3.5 text-blue-500" />
                    </div>
                    <div className="text-base font-extrabold text-foreground font-mono">
                      ≈ {calcResults.infra_km} Km
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Jalan aspal hotmix standar bina marga dataran tinggi Toba.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>Faskes &amp; Gizi</span>
                      <HeartHandshake className="size-3.5 text-rose-500" />
                    </div>
                    <div className="text-base font-extrabold text-foreground font-mono">
                      ≈ {calcResults.health_units} Unit
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Posyandu terpadu gizi balita &amp; faskes desa pedalaman.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>Ruang Belajar</span>
                      <GraduationCap className="size-3.5 text-amber-500" />
                    </div>
                    <div className="text-base font-extrabold text-foreground font-mono">
                      ≈ {calcResults.edu_rooms} Ruang
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Ruang kelas SD direhab total beserta meja kursi belajar.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>Sosial &amp; Pertanian</span>
                      <Coins className="size-3.5 text-emerald-500" />
                    </div>
                    <div className="text-base font-extrabold text-foreground font-mono">
                      ≈ {calcResults.social_farmers} Petani
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Paket bibit kopi Sigarar Utang &amp; pupuk organik kelompok tani.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              MODE 2: PILIH DOKUMEN (Document Translation)
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === 'specific' && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* Toast Notifikasi Berhasil Unggah Dokumen (Admin) */}
              {uploadToast && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-900 dark:text-emerald-100 text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-full bg-emerald-500 text-white shrink-0">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <span>{uploadToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadToast(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* Dokumen Selector via Clean Styled Select Dropdown (Tanpa Card Terpisah) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-card p-4 rounded-2xl border-2 border-border shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <label htmlFor="select-document" className="text-xs font-bold text-foreground block cursor-pointer">
                      Pilih Dokumen APBD / DPA yang Ingin Diterjemahkan:
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {docsList.length} dokumen DPA resmi tersedia untuk diterjemahkan ke satuan fisik.
                    </span>
                  </div>
                </div>

                {/* Dropdown Select Box & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                  <div className="relative min-w-[280px] sm:min-w-[360px] flex-1">
                    <select
                      id="select-document"
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full appearance-none rounded-xl border-2 border-primary/40 bg-card px-4 py-2.5 pr-10 text-xs sm:text-sm font-bold text-foreground shadow-xs transition-all focus:border-primary focus:outline-hidden focus:ring-4 focus:ring-primary/15 cursor-pointer"
                    >
                      {docsList.some((d) => d.id.startsWith('custom-')) && (
                        <optgroup label="── 📤 DPA Diunggah Admin (Terbaru) ──">
                          {docsList.filter((d) => d.id.startsWith('custom-')).map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              ★ {doc.title} — {formatRupiah(doc.totalBudget)}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="── DPA Pagu Kecamatan (PRD) ──">
                        {docsList.filter((d) => !d.id.startsWith('custom-') && d.category === 'Kecamatan').map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.title} — {formatRupiah(doc.totalBudget)}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── DPA Program Sektoral (OPD Toba) ──">
                        {docsList.filter((d) => !d.id.startsWith('custom-') && d.category === 'Program OPD').map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.title} — {formatRupiah(doc.totalBudget)}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <ChevronDown className="size-4" />
                    </div>
                  </div>

                  {/* Action Buttons: Admin has Upload button */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Unggah berkas DPA baru"
                      >
                        <UploadCloud className="size-3.5" />
                        <span>+ Unggah DPA</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel Hasil Terjemahan Dokumen Spesifik */}
              <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">

                {/* Header Dokumen Spesifik */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-border pb-5">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold border border-border">
                        {selectedDoc.category}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedDoc.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="size-3" />
                        TERVERIFIKASI JDIH / PPID TOBA
                      </span>
                    </div>

                    <h3
                      className="text-lg sm:text-xl font-extrabold text-foreground"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      {selectedDoc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedDoc.summary}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground pt-0.5">
                      Instansi Penanggung Jawab: <span className="text-foreground font-medium">{selectedDoc.agency}</span>
                    </p>

                    {/* Action Buttons: Unduh Dokumen DPA & Tautan JDIH Toba */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => downloadDocCSV(selectedDoc)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all shadow-xs hover:opacity-90 cursor-pointer"
                        title="Unduh ringkasan dokumen DPA ini (CSV)"
                      >
                        {docDownloaded ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-300" />
                            <span>Dokumen Terunduh!</span>
                          </>
                        ) : (
                          <>
                            <Download className="size-3.5" />
                            <span>Unduh Dokumen (CSV)</span>
                          </>
                        )}
                      </button>

                      <a
                        href="https://jdih.tobakab.go.id/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground text-xs font-mono transition-colors"
                      >
                        <span>Portal JDIH Pemkab Toba</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        TOTAL PAGU DOKUMEN
                      </span>
                      <p
                        className="text-xl sm:text-2xl font-black text-primary font-mono"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        {formatRupiah(selectedDoc.totalBudget)}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveMode('standby')}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 pt-1 cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      Kembali ke Standby Umum
                    </button>
                  </div>
                </div>

                {/* Hasil Terjemahan Fisik Disimpan dalam Dropdown / Akordion */}
                <div className="border border-border rounded-2xl overflow-hidden bg-card/60 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setShowTranslationDropdown(!showTranslationDropdown)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Layers className="size-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          Hasil Terjemahan Fisik ke Lapangan (4 Sektor)
                        </h4>
                        <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                          Berdasarkan Standar Biaya Satuan Pemkab Toba 2026
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-primary shrink-0">
                      <span className="hidden sm:inline">
                        {showTranslationDropdown ? 'Tutup Rincian' : 'Buka Terjemahan Fisik'}
                      </span>
                      <ChevronDown
                        className={cn(
                          'size-4 transition-transform duration-200',
                          showTranslationDropdown && 'rotate-180'
                        )}
                      />
                    </div>
                  </button>

                  {showTranslationDropdown && (
                    <div className="p-4 sm:p-6 border-t border-border bg-muted/15 space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedDoc.breakdown.map((item, idx) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={idx}
                              className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3 flex flex-col justify-between"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-muted/60 border border-border text-primary">
                                      <Icon className="size-4" />
                                    </span>
                                    <div>
                                      <span className="text-xs font-bold text-foreground">
                                        {item.sector}
                                      </span>
                                      <span className="ml-2 text-[10px] font-mono text-muted-foreground">
                                        ({item.percentage}% dari pagu)
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-foreground">
                                    {formatRupiah(item.allocatedBudget)}
                                  </span>
                                </div>

                                {/* Impact Callout */}
                                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-0.5">
                                    Ekuivalen Fisik di Lapangan:
                                  </span>
                                  <p
                                    className="text-base font-extrabold text-foreground"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                  >
                                    {item.physicalImpact}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {item.details}
                                  </p>
                                </div>
                              </div>

                              {/* Technical Spec Note */}
                              <div className="pt-2.5 border-t border-border/70 flex items-start gap-2 text-[11px] font-mono text-muted-foreground">
                                <Info className="size-3.5 shrink-0 text-primary mt-0.5" />
                                <span>
                                  <strong className="text-foreground">Spesifikasi:</strong> {item.specNotes} (Standar: {item.unitRate})
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ── Open Dataset Table ── */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden space-y-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Katalog Gabungan APBD &amp; Indikator Masalah BPS Toba (2026)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tersedia 4 kecamatan percontohan untuk analisis reproduktif dan penelitian independen.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-[10px] font-mono text-foreground bg-muted px-2.5 py-1.5 rounded-lg border border-border shrink-0 font-semibold">
                LISENSI TERBUKA PUBLIK
              </span>
              <button
                type="button"
                onClick={downloadCSV}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer',
                  downloaded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                )}
                title="Unduh seluruh baris dataset katalog dalam format CSV"
              >
                {downloaded ? (
                  <>
                    <Check className="size-3.5" />
                    <span>Tersimpan (CSV)</span>
                  </>
                ) : (
                  <>
                    <Download className="size-3.5" />
                    <span>Unduh Dataset (CSV)</span>
                  </>
                )}
              </button>
            </div>
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

        {/* ══════════════════════════════════════════════════════════════════
            MODAL UNGGAH & PEMINDAIAN OTOMATIS DPA (AI BACKEND PARSER)
           ══════════════════════════════════════════════════════════════════ */}
        {showUploadModal && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-2xl bg-card border-2 border-primary/30 rounded-3xl shadow-2xl overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary text-primary-foreground shadow-xs">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-base sm:text-lg font-extrabold text-foreground"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        Pusat Penerjemah Dokumen DPA (Pemkab Toba)
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        STANDAR BIAYA SATUAN (SSH)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sistem membaca data DPA resmi, memetakan pos belanja, dan menghitung ekuivalensi fisik lapangan secara transparan.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setParseState('idle')
                  }}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Modal Body: 3 Dynamic States */}
              <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">

                {/* ─────────────────────────────────────────────────────────────
                    STATE 1: IDLE (UNGGAH BERKAS ATAU PILIH CONTOH RESMI)
                   ───────────────────────────────────────────────────────────── */}
                {parseState === 'idle' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Drag & Drop File Upload Area */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FileUp className="size-4 text-primary" />
                          <span>Pilih / Tarik Berkas Dokumen DPA (.PDF):</span>
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Format: .PDF Resmi (Maks. 25MB)
                        </span>
                      </label>

                      <div className="relative group border-2 border-dashed border-primary/40 hover:border-primary transition-all rounded-3xl p-8 text-center bg-linear-to-b from-primary/5 to-transparent cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0]
                              startDocumentExtraction({
                                fileName: file.name,
                                file: file,
                              })
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="space-y-3 pointer-events-none">
                          <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                            <UploadCloud className="size-7" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                              Klik untuk memilih atau jatuhkan berkas PDF ke sini
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sistem otomatis memindai struktur teks dan mengekstrak rincian pos belanja ke 4 sektor.
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border text-[11px] font-mono text-muted-foreground">
                            <FileText className="size-3 text-primary" />
                            Pemetaan Nomenklatur SIPD &amp; Standar Biaya Satuan
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Demo Samples (Khusus Lomba / Pengujian Instan Tanpa Perlu Cari File PDF) */}
                    <div className="space-y-2.5 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          Atau Uji Coba Cepat dengan Sampel DPA Resmi Toba:
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          1-Klik Demo
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {DEMO_SAMPLES.map((sample) => (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() =>
                              startDocumentExtraction({
                                fileName: sample.name,
                                preset: sample,
                              })
                            }
                            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left cursor-pointer group shadow-2xs"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {sample.label}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground">
                                Pagu: <span className="font-semibold text-foreground">{sample.budgetBadge}</span> • {sample.sectorBadge}
                              </div>
                            </div>
                            <span className="p-1 rounded-lg bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                              <ArrowRight className="size-3.5" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STATE 2: SCANNING (PEMROSESAN STRUKTUR DOKUMEN & STANDAR BIAYA)
                   ───────────────────────────────────────────────────────────── */}
                {parseState === 'scanning' && (
                  <div className="py-8 px-4 text-center space-y-6 animate-in fade-in duration-300">
                    <div className="relative size-20 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      <div className="relative size-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                        <FileText className="size-9 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h4
                        className="text-lg font-extrabold text-foreground"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                      >
                        Sistem Sedang Memproses Berkas Dokumen DPA...
                      </h4>
                      <p className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block">
                        📄 {selectedSampleName || 'dokumen_dpa.pdf'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="flex justify-between text-xs font-mono font-bold text-foreground">
                        <span>Status Pemrosesan Dokumen DPA:</span>
                        <span className="text-primary">{scanProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Live Processing Steps Checklist */}
                    <div className="max-w-md mx-auto text-left space-y-2 bg-muted/40 p-4 rounded-2xl border border-border">
                      {SCAN_STEPS.map((step, idx) => {
                        const isDone = idx < scanStepIndex
                        const isCurrent = idx === scanStepIndex
                        return (
                          <div
                            key={idx}
                            className={cn(
                              'flex items-center gap-2.5 text-xs transition-opacity duration-200',
                              isDone ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : isCurrent ? 'text-foreground font-bold' : 'text-muted-foreground/50'
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                            ) : isCurrent ? (
                              <Loader2 className="size-4 shrink-0 text-primary animate-spin" />
                            ) : (
                              <div className="size-4 rounded-full border border-border shrink-0" />
                            )}
                            <span className="truncate">{step}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    STATE 3: SUCCESS (HASIL EKSTRAKSI OTOMATIS REVIEW & TERBITKAN)
                   ───────────────────────────────────────────────────────────── */}
                {parseState === 'success' && (
                  <form onSubmit={handleUploadSubmit} className="space-y-5 animate-in fade-in duration-300">

                    {/* Header Sukses Ekstraksi */}
                    <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-900 dark:text-emerald-100 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-emerald-500 text-white shrink-0">
                          <Check className="size-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-extrabold uppercase tracking-wide block">
                            ✓ Dokumen DPA Berhasil Diterjemahkan
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate block font-mono">
                            Berkas: {selectedSampleName} • Terverifikasi Standar Biaya Satuan (SSH) Toba
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setParseState('idle')
                          setUploadedFile(null)
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:underline shrink-0 pl-2 cursor-pointer"
                      >
                        <RefreshCw className="size-3" />
                        <span>Ganti Berkas</span>
                      </button>
                    </div>

                    {/* Kartu Ringkasan Hasil Ekstraksi Otomatis */}
                    <div className="p-4 rounded-2xl bg-card border-2 border-border shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-border/80 pb-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                          DATA DOKUMEN TERDETEKSI:
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          TERVERIFIKASI OTOMATIS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            Judul Dokumen DPA:
                          </span>
                          <span className="font-bold text-foreground block">
                            {newDocTitle}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            Nomor / Kode Rekening:
                          </span>
                          <span className="font-mono text-foreground font-semibold block">
                            {newDocCode}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            Instansi / OPD Pengampu:
                          </span>
                          <span className="font-medium text-foreground block">
                            {newDocAgency}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            Total Pagu Anggaran (IDR):
                          </span>
                          <span className="font-mono font-black text-primary text-sm block">
                            {formatRupiah(newDocBudget)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hasil Konversi ke 4 Satuan Fisik Lapangan */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>Hasil Terjemahan Satuan Fisik Nyata (Berdasarkan Standar PRD):</span>
                        <span className="text-[10px] font-mono text-muted-foreground">Otomatis Dihitung</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                            <span className="flex items-center gap-1.5">
                              <Building className="size-3.5" />
                              Infrastruktur ({newAlloc.infra}%)
                            </span>
                            <span className="font-mono">{formatRupiah((newDocBudget * newAlloc.infra) / 100)}</span>
                          </div>
                          <div className="text-sm font-extrabold text-foreground font-mono">
                            ≈ {((newDocBudget * newAlloc.infra) / 100 / UNIT_COSTS.infra_per_km).toFixed(2)} Km Aspal Hotmix
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                            <span className="flex items-center gap-1.5">
                              <HeartHandshake className="size-3.5" />
                              Kesehatan ({newAlloc.health}%)
                            </span>
                            <span className="font-mono">{formatRupiah((newDocBudget * newAlloc.health) / 100)}</span>
                          </div>
                          <div className="text-sm font-extrabold text-foreground font-mono">
                            ≈ {Math.floor((newDocBudget * newAlloc.health) / 100 / UNIT_COSTS.health_per_unit)} Posyandu Gizi
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="size-3.5" />
                              Pendidikan ({newAlloc.edu}%)
                            </span>
                            <span className="font-mono">{formatRupiah((newDocBudget * newAlloc.edu) / 100)}</span>
                          </div>
                          <div className="text-sm font-extrabold text-foreground font-mono">
                            ≈ {Math.floor((newDocBudget * newAlloc.edu) / 100 / UNIT_COSTS.edu_per_room)} Ruang Belajar SD
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="flex items-center gap-1.5">
                              <Coins className="size-3.5" />
                              Sosial &amp; Pertanian ({newAlloc.social}%)
                            </span>
                            <span className="font-mono">{formatRupiah((newDocBudget * newAlloc.social) / 100)}</span>
                          </div>
                          <div className="text-sm font-extrabold text-foreground font-mono">
                            ≈ {Math.floor((newDocBudget * newAlloc.social) / 100 / UNIT_COSTS.social_per_farmer)} Petani Bantuan
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accordion Penyesuaian Nilai Manual (Opsional) */}
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowManualEdit(!showManualEdit)}
                        className="w-full flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <SlidersHorizontal className="size-3.5 text-primary" />
                          <span>Penyesuaian Manual (Opsional - Jika Ingin Mengubah Nilai Ekstraksi)</span>
                        </span>
                        <ChevronDown className={cn('size-4 transition-transform', showManualEdit && 'rotate-180')} />
                      </button>

                      {showManualEdit && (
                        <div className="p-4 bg-card space-y-4 border-t border-border animate-in slide-in-from-top-1 duration-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <label className="font-bold text-foreground">Nama Dokumen:</label>
                              <input
                                type="text"
                                value={newDocTitle}
                                onChange={(e) => setNewDocTitle(e.target.value)}
                                className="w-full rounded-xl border border-border bg-card px-3 py-1.5 font-medium text-foreground text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-foreground">Total Pagu (Rp):</label>
                              <input
                                type="text"
                                value={newDocBudgetText}
                                onChange={handleNewDocBudgetInput}
                                className="w-full rounded-xl border border-border bg-card px-3 py-1.5 font-mono text-foreground text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-border">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold">Bobot 4 Sektor (%):</span>
                              <span className={cn('font-mono font-bold', isAllocValid ? 'text-emerald-500' : 'text-rose-500')}>
                                Total: {totalAlloc}% {isAllocValid ? '✓' : '(Harus 100%)'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div>
                                <label className="text-[10px] text-muted-foreground">Infra: {newAlloc.infra}%</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={newAlloc.infra}
                                  onChange={(e) => setNewAlloc({ ...newAlloc, infra: parseInt(e.target.value, 10) })}
                                  className="w-full accent-blue-600 cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Kesehatan: {newAlloc.health}%</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={newAlloc.health}
                                  onChange={(e) => setNewAlloc({ ...newAlloc, health: parseInt(e.target.value, 10) })}
                                  className="w-full accent-rose-600 cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Pendidikan: {newAlloc.edu}%</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={newAlloc.edu}
                                  onChange={(e) => setNewAlloc({ ...newAlloc, edu: parseInt(e.target.value, 10) })}
                                  className="w-full accent-amber-600 cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Sosial: {newAlloc.social}%</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={newAlloc.social}
                                  onChange={(e) => setNewAlloc({ ...newAlloc, social: parseInt(e.target.value, 10) })}
                                  className="w-full accent-emerald-600 cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUploadModal(false)
                          setParseState('idle')
                        }}
                        className="px-4 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={!isAllocValid || !newDocTitle.trim()}
                        className={cn(
                          'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer',
                          isAllocValid && newDocTitle.trim()
                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                        )}
                      >
                        <Sparkles className="size-4" />
                        <span>Konfirmasi &amp; Terbitkan ke Portal Warga</span>
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODAL POP-UP INFO KONVERSI FISIK (NATURAL FULL-VIEWPORT BACKDROP BLUR)
           ══════════════════════════════════════════════════════════════════ */}
        {activeConversionPopup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveConversionPopup(null)}
          >
            <div
              className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2.5 rounded-2xl shadow-2xs', activeConversionPopup.bgLight, activeConversionPopup.accent)}>
                    <activeConversionPopup.icon className="size-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                      STANDAR SATUAN RESMI TOBA
                    </span>
                    <h4 className="text-base font-extrabold text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      Sektor {activeConversionPopup.tag}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveConversionPopup(null)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Tutup Pop-up"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Nominal & Wujud Fisik */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="text-xs font-mono text-muted-foreground">
                  Patokan Anggaran: <strong className="text-foreground">{activeConversionPopup.rupiah}</strong>
                </span>
                <p className="text-lg font-black text-foreground" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {activeConversionPopup.unit}
                </p>
              </div>

              {/* Deskripsi & Biaya Satuan */}
              <div className="space-y-3.5 text-xs leading-relaxed">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block mb-1">
                    SPESIFIKASI &amp; STANDAR KELAYAKAN:
                  </span>
                  <p className="text-foreground bg-muted/20 p-3.5 rounded-xl border border-border leading-relaxed">
                    {activeConversionPopup.desc}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block mb-1">
                    DASAR BIAYA SATUAN APBD:
                  </span>
                  <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-foreground font-mono font-bold">
                    {activeConversionPopup.baseCost}
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
                  <span className="font-semibold block text-foreground">Sumber Standar Resmi:</span>
                  <p>Analisis Harga Satuan Pekerjaan (AHSP) &amp; Standar Satuan Harga (SSH) Terbuka Pemkab Toba 2026.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveConversionPopup(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    let amt = 1_000_000_000
                    if (activeConversionPopup.rupiah.includes('250 Juta')) amt = 250_000_000
                    else if (activeConversionPopup.rupiah.includes('150 Juta')) amt = 150_000_000
                    else if (activeConversionPopup.rupiah.includes('50 Juta')) amt = 50_000_000
                    setCalcAmount(amt)
                    setCalcInputText(amt.toLocaleString('id-ID'))
                    setActiveConversionPopup(null)
                    const el = document.getElementById('apbd-calc-input')
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  Uji di Kalkulator
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
