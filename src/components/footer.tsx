'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'

export function Footer() {
  const pathname = usePathname()
  const [showTopBtn, setShowTopBtn] = useState(false)
  const isAdminDashboard = pathname === '/admin'

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

        <div className="relative z-10 mx-auto max-w-3xl px-6 py-5 sm:py-6 flex flex-col items-center text-center space-y-2">
          
          {/* Logo Utama NalarPublik */}
          <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
            <Logo size="md" variant="light" />
          </Link>

          {/* Lokasi Wilayah Netral & Hak Cipta */}
          <div className="space-y-0.5">
            <p className="text-xs font-semibold tracking-wide text-white">
              Kabupaten Toba, Sumatera Utara
            </p>
            <p className="text-[10px] text-blue-200/70 font-normal">
              © 2026 NalarPublik · Inisiatif independen warga untuk transparansi anggaran Kabupaten Toba.
            </p>
          </div>

        </div>

      </footer>

      {/* ── Floating Back to Top Arrow Button (Otomatis Muncul Saat Scroll) ── */}
      <button
        onClick={scrollToTop}
        aria-label="Kembali ke atas halaman"
        title="Kembali ke atas"
        className={cn(
          'fixed z-40 flex items-center justify-center size-10 rounded-full',
          'bg-blue-600 hover:bg-blue-700 text-white shadow-xl border border-white/20',
          'transition-all duration-300 ease-out cursor-pointer',
          'hover:scale-110 active:scale-95',
          isAdminDashboard ? 'bottom-22 right-7' : 'bottom-6 right-6',
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
