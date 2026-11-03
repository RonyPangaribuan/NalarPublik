'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import {
  FileText,
  Printer,
  ArrowLeft,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { INITIAL_DISTRICTS, formatRupiah } from '@/lib/data'
import { TobaTopoBackground } from '@/components/toba-topo-background'
import { cn } from '@/lib/utils'

interface ReportMetric {
  label: string
  value: string
  sub: string
  isWarning?: boolean
}

interface ReportItem {
  id: string
  code: string
  title: string
  category: string
  date: string
  scope: string
  metrics: ReportMetric[]
  physicalTranslation: {
    amount: string
    unit: string
    note: string
  }
  suggestedAction: string
  detailedFindings: string[]
}

const REPORTS_CATALOG: ReportItem[] = [
  {
    id: 'lap-2026-01',
    code: 'LAP-NP-2026-01',
    title: 'Kajian Keseimbangan Alokasi Anggaran & Kebutuhan Lapangan Kabupaten Toba 2026',
    category: 'Prioritas Daerah',
    date: '15 Jan 2026',
    scope: '4 Kecamatan Pilot',
    metrics: [
      { label: 'Cakupan', value: '4 Kecamatan', sub: 'Habinsaran, Porsea, Laguboti, Balige' },
      { label: 'Defisit Terbesar', value: '-30.0%', sub: 'Jalan Habinsaran (Rusak 46% vs APBD 16%)', isWarning: true },
      { label: 'Saran Realokasi', value: '+15.0%', sub: 'Subsidi silang dari surplus perkotaan' },
    ],
    physicalTranslation: {
      amount: '≈ 15,2 Km',
      unit: 'Aspal Hotmix Jalan Tani & 6 Posyandu',
      note: 'Fokus pemulihan akses logistik pelosok dan gizi balita',
    },
    suggestedAction:
      'Memindahkan surplus alokasi 15% dari pos infrastruktur kota Balige untuk mempercepat pengaspalan jalan tani Habinsaran dan pemenuhan gizi balita Porsea.',
    detailedFindings: [
      'Kecamatan Habinsaran menghadapi tingkat jalan rusak berat 46,0%, sementara alokasi APBD hanya 16,0% (Defisit 30,0%).',
      'Kecamatan Porsea mencatat stunting balita 29,5%, sedangkan alokasi kesehatan daerah baru 14,0% (Defisit 15,5%).',
      'Kecamatan Laguboti memiliki 24,0% ruang kelas rusak, dengan alokasi pendidikan 27,0% yang relatif seimbang.',
      'Kecamatan Balige memiliki jalan mantap (kerusakan hanya 14,5%) dengan pagu jalan 40,0% (Surplus 25,5%).',
    ],
  },
  {
    id: 'lap-2026-02',
    code: 'LAP-NP-2026-02',
    title: 'Kajian Khusus: Urgensi Perbaikan Jalan Usaha Tani & Jembatan Habinsaran',
    category: 'Infrastruktur Jalan',
    date: '20 Jan 2026',
    scope: 'Kecamatan Habinsaran',
    metrics: [
      { label: 'Tingkat Jalan Rusak', value: '46.0%', sub: 'Data resmi terbuka BPS', isWarning: true },
      { label: 'Porsi APBD Saat Ini', value: '16.0%', sub: 'Alokasi jalan dinas terkait' },
      { label: 'Target Realokasi', value: '35.0%', sub: 'Kenaikan terarah +19.0%' },
    ],
    physicalTranslation: {
      amount: '≈ 15,2 Km',
      unit: 'Pengaspalan Jalan Hotmix Desa',
      note: 'Membuka akses sentra tani Lumban Rau & Parsoburan',
    },
    suggestedAction:
      'Menaikkan porsi pagu jalan Habinsaran dari 16% menjadi 35% untuk penanganan darurat jalan poros tani sebelum musim hujan.',
    detailedFindings: [
      'Akses jalan tanah bebatuan di desa pelosok Habinsaran kerap longsor dan memutus distribusi hasil tani kopi dan sayur.',
      'Aspirasi warga setempat rata-rata menuntut 50,0% anggaran dialokasikan untuk pemeliharaan jalan desa.',
      'Penambahan pagu ke 35% mampu menyelesaikan 15,2 Km pengaspalan jalan utama antar desa.',
    ],
  },
  {
    id: 'lap-2026-03',
    code: 'LAP-NP-2026-03',
    title: 'Kajian Pemantauan: Fasilitas Gizi Balita & Sarana Posyandu Porsea',
    category: 'Kesehatan & Gizi',
    date: '25 Jan 2026',
    scope: 'Kecamatan Porsea',
    metrics: [
      { label: 'Stunting Balita', value: '29.5%', sub: 'Di atas ambang rata-rata kabupaten', isWarning: true },
      { label: 'Porsi APBD Saat Ini', value: '14.0%', sub: 'Pagu pos kesehatan daerah' },
      { label: 'Target Realokasi', value: '30.0%', sub: 'Kenaikan terarah +16.0%' },
    ],
    physicalTranslation: {
      amount: '≈ 6 Unit',
      unit: 'Posyandu Terpadu Gizi & PMT Balita',
      note: 'Pengadaan antropometri digital & nutrisi seribu hari pertama',
    },
    suggestedAction:
      'Menaikkan alokasi kesehatan Porsea dari 14% menjadi 30% yang diprioritaskan untuk paket asupan gizi balita dan kelengkapan alat timbang posyandu.',
    detailedFindings: [
      'Angka stunting di pesisir Porsea memerlukan penanganan nutrisi terarah pada 1.000 hari pertama kehidupan.',
      'Alokasi kesehatan saat ini belum memadai untuk pengadaan rutin makanan tambahan dan insentif kader posyandu.',
      'Aspirasi warga setempat mengusulkan alokasi kesehatan dinaikkan hingga 40,0%.',
    ],
  },
  {
    id: 'lap-2026-04',
    code: 'LAP-NP-2026-04',
    title: 'Telaah Mandiri: Ruang Efisiensi & Pemerataan Anggaran Antar Wilayah Balige',
    category: 'Pemerataan Anggaran',
    date: '28 Jan 2026',
    scope: 'Kecamatan Balige',
    metrics: [
      { label: 'Kondisi Jalan Mantap', value: '85.5%', sub: 'Kerusakan jalan perkotaan hanya 14.5%' },
      { label: 'Porsi APBD Saat Ini', value: '40.0%', sub: 'Kawasan pusat kota pemerintahan' },
      { label: 'Ruang Subsidi Silang', value: '+25.5%', sub: 'Potensi pemerataan ke pelosok' },
    ],
    physicalTranslation: {
      amount: '≈ Rp 7,2 Miliar',
      unit: 'Ruang Subsidi Silang Daerah',
      note: 'Dapat dialihkan ke jalan darurat tanpa mengurangi layanan dasar kota',
    },
    suggestedAction:
      'Mengalihkan sebagian porsi surplus infrastruktur kota Balige secara terukur untuk mendanai sektor kritis di kecamatan sekitar.',
    detailedFindings: [
      'Balige menikmati kondisi sarana paling prima di Kabupaten Toba dengan fasilitas dasar yang telah memadai.',
      'Kebutuhan sekunder warga perkotaan Balige lebih condong ke penataan saluran pembuangan air dan kebersihan pasar.',
      'Pemberian subsidi silang tidak akan mengurangi kualitas pelayanan publik di Balige.',
    ],
  },
  {
    id: 'lap-2026-05',
    code: 'LAP-NP-2026-05',
    title: 'Kajian Kebutuhan Ruang Belajar & Sanitasi SD Pedalaman Silaen',
    category: 'Pemerataan Anggaran',
    date: '02 Feb 2026',
    scope: 'Kecamatan Silaen',
    metrics: [
      { label: 'Ruang Rusak Berat', value: '38.0%', sub: 'Data lapangan sekolah dasar percontohan', isWarning: true },
      { label: 'Porsi APBD Saat Ini', value: '18.0%', sub: 'Alokasi sarana pendidikan dinas' },
      { label: 'Kebutuhan Tambahan', value: '+20.0%', sub: 'Target renovasi sarpras ruang kelas' },
    ],
    physicalTranslation: {
      amount: '≈ 4 Ruang Kelas',
      unit: 'Renovasi Total SD & MCK Higienis',
      note: 'Prioritas perbaikan gedung sekolah dasar lereng bukit Silaen',
    },
    suggestedAction:
      'Menambah belanja modal rehabilitasi ruang kelas dasar di Silaen agar kegiatan belajar mengajar berjalan aman sebelum musim penghujan.',
    detailedFindings: [
      'Beberapa atap kelas dan plafon bocor mengganggu konsentrasi siswa saat intensitas hujan tinggi.',
      'Fasilitas sanitasi MCK siswa memerlukan pembaruan saluran air dan septictank higienis standar dinas kesehatan.',
    ],
  },
  {
    id: 'lap-2026-06',
    code: 'LAP-NP-2026-06',
    title: 'Telaah Khusus: Irigasi Sawah & Bantuan Pupuk Organik Laguboti',
    category: 'Prioritas Daerah',
    date: '05 Feb 2026',
    scope: 'Kecamatan Laguboti',
    metrics: [
      { label: 'Keluhan Petani Padi', value: '42.0%', sub: 'Masalah debit air irigasi tersier', isWarning: true },
      { label: 'Porsi APBD Pertanian', value: '15.0%', sub: 'Bantuan saprodi dinas' },
      { label: 'Target Usulan', value: '32.0%', sub: 'Prioritas ketahanan pangan desa' },
    ],
    physicalTranslation: {
      amount: '≈ 2.400 Meter',
      unit: 'Normalisasi Saluran Irigasi Tersier',
      note: 'Mengairi 350 hektar hamparan sawah Sitoluama & sekitarnya',
    },
    suggestedAction:
      'Mengalokasikan dana pemeliharaan berkala jaringan irigasi desa untuk menopang surplus panen beras lokal Toba.',
    detailedFindings: [
      'Pendangkalan saluran irigasi tanah menyebabkan air terbuang saat musim tanam serentak.',
      'Petani memerlukan subsidi pupuk organik dan perbaikan pintu air bendung primer.',
    ],
  },
  {
    id: 'lap-2026-07',
    code: 'LAP-NP-2026-07',
    title: 'Kajian Ketahanan Akses Logistik Perikanan & Pelabuhan Ajibata',
    category: 'Infrastruktur Jalan',
    date: '10 Feb 2026',
    scope: 'Kecamatan Ajibata',
    metrics: [
      { label: 'Beban Muatan Logistik', value: '88.0%', sub: 'Kepadatan truk hasil danau & sembako' },
      { label: 'Porsi APBD Saat Ini', value: '12.0%', sub: 'Belanja pemeliharaan jalan pelabuhan', isWarning: true },
      { label: 'Kebutuhan Pelebaran', value: '+16.0%', sub: 'Bahu jalan dan drainase lintas' },
    ],
    physicalTranslation: {
      amount: '≈ 3,5 Km',
      unit: 'Pelebaran Bahu Jalan & Drainase Beton',
      note: 'Mengurai simpul kemacetan rute distribusi logistik Danau Toba',
    },
    suggestedAction:
      'Memperlebar bahu jalan dan memperkuat drainase jalan penghubung pelabuhan Ajibata guna menjamin kelancaran arus logistik antar pulau.',
    detailedFindings: [
      'Penyempitan di beberapa titik jalan memicu antrean kendaraan pengangkut ikan dan sembako menuju feri penyeberangan.',
    ],
  },
  {
    id: 'lap-2026-08',
    code: 'LAP-NP-2026-08',
    title: 'Pemantauan Faskes Daerah Terpencil & Poskesdes Borbor',
    category: 'Kesehatan & Gizi',
    date: '14 Feb 2026',
    scope: 'Kecamatan Borbor',
    metrics: [
      { label: 'Akses ke Puskesmas', value: '18 Km', sub: 'Jarak terjauh dari desa pelosok', isWarning: true },
      { label: 'Porsi APBD Kesehatan', value: '11.0%', sub: 'Operasional poskesdes desa' },
      { label: 'Target Intervensi', value: '25.0%', sub: 'Layanan keliling & alat darurat' },
    ],
    physicalTranslation: {
      amount: '≈ 2 Unit',
      unit: 'Puskesmas Pembantu Plus Ambulans Desa',
      note: 'Layanan darurat persalinan dan kesehatan primer dataran tinggi',
    },
    suggestedAction:
      'Menyediakan pos kesehatan pembantu siaga 24 jam beserta kendaraan ambulans medan berat untuk evakuasi medis darurat di Borbor.',
    detailedFindings: [
      'Kondisi medan perbukitan terjal menuntut ketersediaan faskes mandiri yang lebih dekat ke permukiman warga terpencil.',
    ],
  },
  {
    id: 'lap-2026-09',
    code: 'LAP-NP-2026-09',
    title: 'Telaah Pemulihan Ruas Penghubung Lumban Julu - Nassau',
    category: 'Infrastruktur Jalan',
    date: '18 Feb 2026',
    scope: 'Kecamatan Nassau',
    metrics: [
      { label: 'Titik Rawan Longsor', value: '34.0%', sub: 'Jalur utama komoditas pinus & kopi', isWarning: true },
      { label: 'Porsi APBD Tanggap', value: '10.0%', sub: 'Dana penanganan darurat dinas' },
      { label: 'Kebutuhan Perkuatan', value: '+20.0%', sub: 'Dinding penahan tanah bertulang' },
    ],
    physicalTranslation: {
      amount: '≈ 8,2 Km',
      unit: 'Perkuatan Tebing & Pengaspalan Penetrasi',
      note: 'Mengamankan akses keluar hasil bumi masyarakat Nassau',
    },
    suggestedAction:
      'Membangun dinding penahan tebing permanen dan perkerasan aspal hotmix di ruas-ruas kritis yang rawan tergerus curah hujan ekstrem.',
    detailedFindings: [
      'Jalan terputus seringkali mengisolasi hasil pertanian selama berhari-hari saat longsoran tebing menutup badan jalan.',
    ],
  },
  {
    id: 'lap-2026-10',
    code: 'LAP-NP-2026-10',
    title: 'Evaluasi Sarana Laboratorium IPA & Komputer SMP Sigumpar',
    category: 'Pemerataan Anggaran',
    date: '22 Feb 2026',
    scope: 'Kecamatan Sigumpar',
    metrics: [
      { label: 'Kekurangan Perangkat', value: '30.0%', sub: 'Kebutuhan ujian berbasis komputer' },
      { label: 'Porsi APBD Saat Ini', value: '15.0%', sub: 'Belanja sarpras pendidikan' },
      { label: 'Alokasi Solusi', value: '+12.0%', sub: 'Pengadaan komputer hemat daya' },
    ],
    physicalTranslation: {
      amount: '≈ 3 Paket',
      unit: 'Lab Komputer & Sambungan Internet Sekolah',
      note: 'Pemerataan kualitas teknologi belajar jenjang menengah pertama',
    },
    suggestedAction:
      'Menyalurkan paket perangkat TIK dan penguat sinyal internet pendidikan ke sekolah-sekolah di wilayah Sigumpar.',
    detailedFindings: [
      'Kesenjangan fasilitas komputer sekolah antar kecamatan dapat diatasi dengan pemerataan alokasi pengadaan TIK secara bertahap.',
    ],
  },
  {
    id: 'lap-2026-11',
    code: 'LAP-NP-2026-11',
    title: 'Kajian Pemenuhan Air Bersih & Sanitasi Desa Uluan',
    category: 'Kesehatan & Gizi',
    date: '26 Feb 2026',
    scope: 'Kecamatan Uluan',
    metrics: [
      { label: 'Kebutuhan Pamsimas', value: '52.0%', sub: 'Warga mengandalkan tampungan air hujan', isWarning: true },
      { label: 'Porsi APBD Sanitasi', value: '13.0%', sub: 'Program air bersih pedesaan' },
      { label: 'Kenaikan Sasaran', value: '+17.0%', sub: 'Pemasangan pipa transmisi gravitasi' },
    ],
    physicalTranslation: {
      amount: '≈ 12 Titik',
      unit: 'Kran Umum Air Minum Terlindungi',
      note: 'Sumber mata air perbukitan Uluan dialirkan ke permukiman padat',
    },
    suggestedAction:
      'Memperluas jaringan pipa distribusi air minum pedesaan untuk menekan insiden penyakit diare dan mendukung hidup bersih sehat.',
    detailedFindings: [
      'Penyediaan sarana air bersih yang memadai berkorelasi langsung dengan penurunan risiko stunting anak di pedesaan.',
    ],
  },
  {
    id: 'lap-2026-12',
    code: 'LAP-NP-2026-12',
    title: 'Analisis Alokasi Pelatihan UMKM Tenun Ulos & Kerajinan Tampahan',
    category: 'Prioritas Daerah',
    date: '01 Mar 2026',
    scope: 'Kecamatan Tampahan',
    metrics: [
      { label: 'Peminat Pelatihan Ekspor', value: '65.0%', sub: 'Komunitas pengrajin tenun ulos khas Toba' },
      { label: 'Porsi APBD UMKM', value: '14.0%', sub: 'Pemberdayaan ekonomi kreatif', isWarning: true },
      { label: 'Target Usulan Baru', value: '28.0%', sub: 'Inkubasi desain wastra & sertifikasi' },
    ],
    physicalTranslation: {
      amount: '≈ 150 Penenun',
      unit: 'Paket Benang Kualitas Ekspor & Sertifikasi',
      note: 'Penguatan rantai pasok ekonomi kreatif berbasis budaya lokal',
    },
    suggestedAction:
      'Meningkatkan porsi pendampingan teknis dan bahan baku berkualitas tinggi bagi komunitas penenun tradisional di Tampahan.',
    detailedFindings: [
      'Sentra tenun ulos Tampahan memiliki nilai tambah tinggi jika didukung pasokan bahan baku stabil dan akses pameran.',
    ],
  },
]

export default function AdminReportPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([])

  const handlePrint = () => {
    window.print()
  }

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const selectedReport = REPORTS_CATALOG.find((r) => r.id === selectedReportId) || null

  const filteredReports = REPORTS_CATALOG.filter((report) => {
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE))
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const toggleExpand = (id: string) => {
    setExpandedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <TobaTopoBackground variant="feature" className="no-print" />
      <div className="relative z-10 max-w-[1080px] mx-auto space-y-6">

        {/* ── View 1: Encapsulated Visual Catalog of Reports (No Newspaper Wall of Text!) ── */}
        {!selectedReport && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Kembali ke Dasbor Admin
              </Link>
            </div>

            {/* Catalog Page Header (Solid Blue Theme) */}
            <div className="bg-blue-600 dark:bg-blue-700 border border-blue-500/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-white">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-200 block mb-1 font-semibold">
                    KATALOG DOKUMEN MANDIRI
                  </span>
                  <h1
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Katalog Laporan Anggaran &amp; Kebutuhan Daerah
                  </h1>
                </div>

                <div className="text-xs font-mono text-blue-100 shrink-0 self-start md:self-end">
                  Laporan Tersedia: <span className="font-bold text-white">{REPORTS_CATALOG.length} Laporan</span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-200" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Cari berdasarkan judul, topik, wilayah, atau nomor laporan..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/25 bg-white/10 text-xs text-white placeholder:text-blue-200 focus:outline-hidden focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'Prioritas Daerah', 'Infrastruktur Jalan', 'Kesehatan & Gizi', 'Pemerataan Anggaran'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat)
                        setCurrentPage(1)
                      }}
                      className={cn(
                        'px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                        categoryFilter === cat
                          ? 'bg-white text-blue-700 font-bold shadow-xs'
                          : 'bg-white/15 text-white/90 hover:bg-white/25 hover:text-white'
                      )}
                    >
                      {cat === 'all' ? 'Semua Topik' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Controls Toolbar */}
            {filteredReports.length > 0 && (
              <div className="flex items-center justify-between gap-3 px-1">
                <span className="text-xs text-muted-foreground font-mono">
                  Menampilkan{' '}
                  <strong className="text-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)}
                  </strong>{' '}
                  dari <strong className="text-foreground">{filteredReports.length}</strong> dokumen telaah (Maks. 10 per halaman)
                </span>
              </div>
            )}

            {/* ── Table View with Expandable Rows ("Extend") ── */}
            {filteredReports.length > 0 && (
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 font-bold w-[140px]">Kode</th>
                      <th className="py-3 px-4 font-bold">Judul Laporan</th>
                      <th className="py-3 px-4 font-bold w-[160px]">Kategori</th>
                      <th className="py-3 px-4 font-bold w-[120px]">Tanggal</th>
                      <th className="py-3 px-4 font-bold text-right w-[150px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedReports.map((report) => {
                      const isExpanded = expandedRowIds.includes(report.id)

                      return (
                        <Fragment key={report.id}>
                          {/* Main Row */}
                          <tr
                            onClick={() => toggleExpand(report.id)}
                            className={cn(
                              'hover:bg-muted/40 transition-colors cursor-pointer group',
                              isExpanded && 'bg-blue-50/50 dark:bg-blue-950/20'
                            )}
                          >
                            {/* 1. Code */}
                            <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {report.code}
                            </td>

                            {/* 2. Title & Scope */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-foreground text-xs leading-snug group-hover:text-blue-600 transition-colors">
                                {report.title}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                Cakupan: {report.scope}
                              </div>
                            </td>

                            {/* 3. Category */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold border border-border">
                                {report.category}
                              </span>
                            </td>

                            {/* 4. Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-muted-foreground text-xs">
                              {report.date}
                            </td>

                            {/* 5. Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleExpand(report.id)
                                  }}
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                                    isExpanded
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-muted hover:bg-muted/80 text-foreground'
                                  )}
                                  title={isExpanded ? 'Tutup rincian' : 'Rentangkan rincian'}
                                >
                                  <span>{isExpanded ? 'Tutup' : 'Rincian'}</span>
                                  <ChevronDown
                                    className={cn(
                                      'size-3.5 transition-transform duration-200',
                                      isExpanded && 'rotate-180'
                                    )}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedReportId(report.id)
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
                                  title="Buka dokumen telaah lengkap"
                                >
                                  <FileText className="size-3.5" />
                                  <span>Buka</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Extended Detail Card (Accordion Body) */}
                          {isExpanded && (
                            <tr className="bg-muted/15 border-t border-border">
                              <td colSpan={5} className="p-0">
                                  <div className="p-5 sm:p-7 space-y-5 animate-fade-in border-b border-border/80">
                                    {/* Subheader */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
                                          RINGKASAN EKSEKUTIF TELAAH
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                          · Cakupan: {report.scope}
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-mono text-muted-foreground">
                                        Kode Dokumen: <strong className="text-foreground">{report.code}</strong>
                                      </span>
                                    </div>

                                    {/* 3 Metric Chips */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {report.metrics.map((m, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3.5 bg-card rounded-2xl border border-border shadow-2xs space-y-1"
                                        >
                                          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block leading-tight">
                                            {m.label}
                                          </span>
                                          <span
                                            className={cn(
                                              'text-base font-black font-mono block',
                                              m.isWarning
                                                ? 'text-rose-600 dark:text-rose-400'
                                                : 'text-foreground'
                                            )}
                                          >
                                            {m.value}
                                          </span>
                                          <span className="text-[11px] text-muted-foreground block line-clamp-1">
                                            {m.sub}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Side by side: Physical Impact & Suggested Action */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {/* Physical Impact */}
                                      <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 flex items-start gap-3.5 shadow-2xs">
                                        <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                                          <Layers className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="text-[9px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-300 font-bold block leading-none mb-1">
                                            ESTIMASI WUJUD NYATA FISIK:
                                          </span>
                                          <p className="text-xs font-bold text-foreground">
                                            {report.physicalTranslation.amount} {report.physicalTranslation.unit}
                                          </p>
                                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                            {report.physicalTranslation.note}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Suggested Action */}
                                      <div className="p-4 bg-card rounded-2xl border border-border flex items-start gap-3.5 shadow-2xs">
                                        <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20 mt-0.5">
                                          <Sparkles className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block leading-none mb-1">
                                            SARAN KEBIJAKAN TERARAH:
                                          </span>
                                          <p className="text-xs text-foreground leading-relaxed">
                                            {report.suggestedAction}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Findings Bullet Points */}
                                    <div className="p-4 bg-card rounded-2xl border border-border space-y-2.5">
                                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                                        POIN TEMUAN UTAMA LAPANGAN:
                                      </span>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {report.detailedFindings.map((finding, fIdx) => (
                                          <div
                                            key={fIdx}
                                            className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                                          >
                                            <span className="size-5 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                              {fIdx + 1}
                                            </span>
                                            <span>{finding}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Action row inside extended section */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleExpand(report.id)}
                                        className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-muted"
                                      >
                                        <ChevronUp className="size-3.5" /> Ciutkan Rincian
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setSelectedReportId(report.id)}
                                        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                      >
                                        <FileText className="size-3.5" />
                                        <span>Buka Dokumen Telaah Lengkap</span>
                                        <ArrowRight className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Toolbar (Maksimal 10 dokumen per halaman) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20 text-xs">
                  <span className="text-muted-foreground font-mono">
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({filteredReports.length} total dokumen)
                  </span>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'size-7 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-border bg-card text-foreground hover:bg-muted'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filteredReports.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-foreground">Tidak ada laporan yang sesuai pencarian.</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCategoryFilter('all')
                  }}
                  className="px-4 py-2 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── View 2: Full Document Preview (When a report is opened) ── */}
        {selectedReport && (
          <div className="space-y-6 animate-fade-in">

            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-border pb-4">
              <button
                onClick={() => setSelectedReportId(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Kembali ke Katalog Laporan
              </button>

              <div className="flex items-center gap-3">
                {/* Switcher Dropdown inside preview */}
                <div className="relative">
                  <select
                    value={selectedReport.id}
                    onChange={(e) => setSelectedReportId(e.target.value)}
                    className="appearance-none bg-card border border-border text-foreground font-semibold text-xs rounded-xl px-3.5 py-2 pr-8 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {REPORTS_CATALOG.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code}: {r.title.slice(0, 36)}...
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                </div>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Printer className="size-3.5" /> Cetak Dokumen
                </button>
              </div>
            </div>

            {/* Document Card: Editorial Whitepaper Layout */}
            <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">

              {/* Document Header */}
              <div className="border-b border-border pb-6 text-center space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-500/10 px-3.5 py-1 rounded-full uppercase">
                  <ShieldCheck className="size-3.5" /> Platform Independen NalarPublik · Riset Data Terbuka
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  {selectedReport.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Dokumen Telaah Mandiri Anggaran Daerah 2026 · {selectedReport.scope}
                </p>

                {/* Metadata Strip */}
                <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground font-mono">
                  <span>Nomor: {selectedReport.code}</span>
                  <span>•</span>
                  <span>Tanggal: {selectedReport.date}</span>
                  <span>•</span>
                  <span>Topik: {selectedReport.category}</span>
                </div>
              </div>

              {/* 1. Visual 3 KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedReport.metrics.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block">
                      {m.label}
                    </span>
                    <span
                      className={cn(
                        'text-xl font-black font-mono block',
                        m.isWarning ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                      )}
                    >
                      {m.value}
                    </span>
                    <span className="text-xs text-muted-foreground block leading-tight">
                      {m.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* 2. Structured Matriks Data Table (Mirip Image 2) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Matriks Perbandingan Indikator Lapangan vs Alokasi APBD
                  </h2>
                  <span className="text-[10px] font-mono text-muted-foreground">SUMBER: DATA PUBLIK TERBUKA 2026</span>
                </div>
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
                        <th className="px-4 py-3">Status Evaluasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {INITIAL_DISTRICTS.map((d) => (
                        <tr key={d.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-bold">{d.name}</td>
                          <td className="px-4 py-3 font-mono">{formatRupiah(d.total_budget_idr)}</td>
                          <td className="px-4 py-3 font-mono">{d.infra_problem_pct}%</td>
                          <td className="px-4 py-3 font-mono">{d.health_problem_pct}%</td>
                          <td className="px-4 py-3 font-mono">{d.edu_problem_pct}%</td>
                          <td className="px-4 py-3 font-mono">{d.social_problem_pct}%</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'font-bold text-[10px] px-2 py-0.5 rounded font-mono',
                                d.gap_status === 'CRITICAL'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : d.gap_status === 'WARNING'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              )}
                            >
                              {d.gap_status === 'CRITICAL'
                                ? 'Prioritas Mendesak'
                                : d.gap_status === 'WARNING'
                                ? 'Butuh Evaluasi'
                                : 'Terkendali'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Encapsulated Physical Conversion & Solution Box (Inspired by Image 1) */}
              <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 dark:border-blue-800 pb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5">
                    💡 Rekomendasi Solusi Berkeadilan:
                  </span>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 font-mono">
                    Kajian Mandiri NalarPublik
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Solution Action */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                      Uraian Langkah:
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      {selectedReport.suggestedAction}
                    </p>
                  </div>

                  {/* Right: Physical Conversion Result */}
                  <div className="p-3.5 bg-white dark:bg-card rounded-2xl border border-blue-100 dark:border-border flex items-center gap-3.5 shadow-2xs">
                    <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Layers className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block leading-tight">
                        Estimasi Wujud Nyata Fisik:
                      </span>
                      <p className="text-sm font-black text-foreground truncate">
                        {selectedReport.physicalTranslation.amount} {selectedReport.physicalTranslation.unit}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {selectedReport.physicalTranslation.note}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Temuan Kunci Lapangan (Bullet Poin Terstruktur) */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Temuan Kunci Lapangan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedReport.detailedFindings.map((finding, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-muted/30 border border-border text-xs leading-relaxed text-foreground flex items-start gap-2.5">
                      <span className="size-5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-muted-foreground">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Signoff / Independence Notice */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-bold text-foreground">Sistem Analisis Mandiri NalarPublik</p>
                  <p>Inisiatif Warga untuk Transparansi Anggaran Berbasis Data Terbuka</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-semibold text-foreground">Sumber Data Terbuka Resmi:</p>
                  <p>Publikasi BPS &amp; Ringkasan APBD Toba 2026 (Diolah Mandiri)</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}
