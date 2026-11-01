'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { NavbarSearch } from '@/components/navbar-search'
import { useRoleStore } from '@/store/use-role-store'

// ── Nav links per mode ───────────────────────────────────────────────────────
const WARGA_LINKS = [
  { href: '/',            label: 'Beranda' },
  { href: '/map',         label: 'Peta Kesenjangan' },
  { href: '/simulator',   label: 'Simulasi Anggaran' },
  { href: '/compare',     label: 'Perbandingan' },
  { href: '/open-data',   label: 'Data Terbuka' },
]

const ADMIN_LINKS = [
  { href: '/admin',       label: 'Dasbor Anggaran' },
  { href: '/map',         label: 'Peta Kesenjangan' },
  { href: '/compare',     label: 'Perbandingan' },
  { href: '/open-data',   label: 'Data Terbuka' },
  { href: '/admin/report',label: 'Laporan' },
]

// ── Mode Switch ──────────────────────────────────────────────────────────────
function ModeSwitch() {
  const { role, setRole } = useRoleStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div
      className="flex items-center rounded-lg border border-border bg-muted p-0.5 text-xs font-semibold"
      role="group"
      aria-label="Pilih mode"
    >
      <button
        onClick={() => setRole('public')}
        className={cn(
          'rounded-md px-3 py-1.5 transition-all duration-200',
          role === 'public'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Warga
      </button>
      <button
        onClick={() => setRole('admin')}
        className={cn(
          'rounded-md px-3 py-1.5 transition-all duration-200',
          role === 'admin'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Admin
      </button>
    </div>
  )
}

// ── Theme Toggle — sets .dark & [data-theme="dark"] on <html> globally ───────
function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark =
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    setDark(isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
      try {
        localStorage.setItem('nalarpublik-theme', 'dark')
      } catch (_) {}
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      try {
        localStorage.setItem('nalarpublik-theme', 'light')
      } catch (_) {}
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Ubah ke tema terang' : 'Ubah ke tema gelap'}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
      <span>{dark ? 'Terang' : 'Gelap'}</span>
    </button>
  )
}

// ── Floating Rounded Navbar ──────────────────────────────────────────────────
export function Navbar() {
  const { role } = useRoleStore()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const links = mounted && role === 'admin' ? ADMIN_LINKS : WARGA_LINKS

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent">
      {/* Floating inner nav */}
      <div
        className={cn(
          'mx-auto mt-3.5 flex items-center justify-between px-4 transition-all duration-300',
          'rounded-[14px] border border-border',
          'bg-card/95 backdrop-blur-[16px]',
          'w-[calc(100%-24px)] max-w-[1400px]',
          'h-[58px]',
          scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.18)]' : 'shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Navigasi utama">
          {links.map((link) => {
            const active = isActive(link.href)
            const isAdminLink = link.href.startsWith('/admin')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150',
                  active
                    ? 'text-foreground font-semibold bg-muted/60 md:bg-transparent'
                    : isAdminLink
                      ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search bar di sebelah kiri toggle mode warga/admin */}
          <NavbarSearch />

          <div className="hidden sm:flex items-center gap-2">
            <ModeSwitch />
            <ThemeToggle />
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={cn(
          'md:hidden mx-3 mt-1 overflow-hidden rounded-[10px] border border-border bg-card shadow-lg transition-all duration-300',
          mobileOpen ? 'max-h-96 opacity-100 p-2' : 'max-h-0 opacity-0 p-0 border-transparent shadow-none'
        )}
      >
        <div className="space-y-0.5">
          {links.map((link) => {
            const active = isActive(link.href)
            const isAdminLink = link.href.startsWith('/admin')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-primary font-semibold'
                    : isAdminLink
                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="flex items-center gap-2 px-3 pt-2 pb-1 border-t border-border mt-1">
            <ModeSwitch />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
