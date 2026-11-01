'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Database,
  MapPin,
  Sliders,
  ArrowUp,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

export function Footer() {
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowTopBtn(true)
      } else {
        setShowTopBtn(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* ── Footer Kompak Minimalis Elegan (Ramping, Background Biru) ── */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-[#0f4bb8] via-[#0b3b94] to-[#07296b] text-white border-t border-blue-400/30">
        
        {/* Subtle Background Accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-6 py-6 sm:py-8 flex flex-col items-center text-center space-y-3.5">
          
          {/* ── Baris 1: Akses Cepat Menu Utama ── */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-blue-100">
            {/* Peta Kesenjangan */}
            <Link
              href="/map"
              aria-label="Peta Kesenjangan Anggaran"
              className="p-2 rounded-full bg-blue-900/40 hover:bg-white/20 border border-blue-300/30 text-white transition-all duration-200 hover:scale-110 shadow-xs"
              title="Peta Kesenjangan"
            >
              <MapPin size={15} />
            </Link>

            {/* Simulasi Anggaran */}
            <Link
              href="/simulator"
              aria-label="Simulasi Anggaran Warga"
              className="p-2 rounded-full bg-blue-900/40 hover:bg-white/20 border border-blue-300/30 text-white transition-all duration-200 hover:scale-110 shadow-xs"
              title="Simulasi Anggaran"
            >
              <Sliders size={15} />
            </Link>

            {/* Data Terbuka */}
            <Link
              href="/open-data"
              aria-label="Data Terbuka Anggaran"
              className="p-2 rounded-full bg-blue-900/40 hover:bg-white/20 border border-blue-300/30 text-white transition-all duration-200 hover:scale-110 shadow-xs"
              title="Data Terbuka"
            >
              <Database size={15} />
            </Link>
          </div>

          {/* ── Baris 2: Deskripsi Ringkas & Netral (Bahasa Indonesia murni) ── */}
          <div className="max-w-md mx-auto">
            <p className="text-xs text-blue-100/85 leading-relaxed font-normal">
              Platform independen transparansi anggaran Kabupaten Toba untuk mendorong perumusan kebijakan publik yang bernalar.
            </p>
          </div>

          {/* ── Baris 3: Logo Utama NalarPublik ── */}
          <div className="pt-0.5">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <Logo size="md" variant="light" />
            </Link>
          </div>

          {/* ── Baris 4: Lokasi Wilayah Netral & Hak Cipta ── */}
          <div className="space-y-0.5">
            <p className="text-xs font-semibold tracking-wide text-white">
              Kabupaten Toba, Sumatera Utara
            </p>
            <p className="text-[10px] text-blue-200/60">
              © 2026 NalarPublik · Inisiatif independen warga untuk transparansi anggaran Kabupaten Toba.
            </p>
          </div>

        </div>

      </footer>

      {/* ── Floating Back to Top Arrow Button (Otomatis Muncul Saat Scroll) ── */}
      <button
        onClick={scrollToTop}
        aria-label="Kembali ke atas halaman"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center size-10 rounded-full',
          'bg-primary text-primary-foreground shadow-xl border border-white/20',
          'transition-all duration-300 ease-out cursor-pointer',
          'hover:scale-110 active:scale-95 hover:bg-primary/90',
          showTopBtn
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <ArrowUp size={18} className="stroke-[2.5]" />
      </button>
    </>
  )
}
