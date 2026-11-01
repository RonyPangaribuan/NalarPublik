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
function ModeSwitch({ className, fullWidth }: { className?: string; fullWidth?: boolean }) {
  const { role, setRole } = useRoleStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div
      className={cn(
        'flex items-center rounded-lg border border-border bg-muted p-0.5 text-xs font-semibold',
        fullWidth && 'w-full',
        className
      )}
      role="group"
      aria-label="Pilih mode"
    >
      <button
        onClick={() => setRole('public')}
        className={cn(
          'rounded-md px-3 py-1.5 transition-all duration-200',
          fullWidth && 'flex-1 text-center',
          role === 'public'
            ? 'bg-card text-foreground shadow-sm font-bold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Warga
      </button>
      <button
        onClick={() => setRole('admin')}
        className={cn(
          'rounded-md px-3 py-1.5 transition-all duration-200',
          fullWidth && 'flex-1 text-center',
          role === 'admin'
            ? 'bg-card text-foreground shadow-sm font-bold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Admin
      </button>
    </div>
  )
}

// ── Theme Toggle — sets .dark & [data-theme="dark"] on <html> globally ───────
function ThemeToggle({ className, fullWidth }: { className?: string; fullWidth?: boolean }) {
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
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors',
        fullWidth && 'w-full',
        className
      )}
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
          'mx-auto mt-2.5 sm:mt-3.5 flex items-center justify-between px-3 sm:px-4 transition-all duration-300',
          'rounded-[14px] border border-border',
          'bg-card/95 backdrop-blur-[16px]',
          'w-[calc(100%-20px)] sm:w-[calc(100%-24px)] max-w-[1400px]',
          'h-[54px] sm:h-[58px]',
          scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.18)]' : 'shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav (Hidden on Mobile) */}
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search bar: desktop inline input, mobile icon trigger modal */}
          <NavbarSearch />

          {/* Desktop Only: Role Switch & Theme Toggle (HIDDEN on Mobile/Tablet to eliminate redundancy) */}
          <div className="hidden md:flex items-center gap-2">
            <ModeSwitch />
            <ThemeToggle />
          </div>

          {/* Mobile Only: Hamburger Toggle Button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center size-9 rounded-lg border border-border bg-muted/30 p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay (Tap to close) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Dropdown Drawer */}
      <div
        className={cn(
          'md:hidden relative z-50 mx-2.5 sm:mx-3 mt-1.5 overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl transition-all duration-300',
          mobileOpen ? 'max-h-[500px] opacity-100 p-3' : 'max-h-0 opacity-0 p-0 border-transparent shadow-none pointer-events-none'
        )}
      >
        <div className="space-y-1">
          {links.map((link) => {
            const active = isActive(link.href)
            const isAdminLink = link.href.startsWith('/admin')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : isAdminLink
                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{link.label}</span>
                {active && <span className="size-2 rounded-full bg-primary" />}
              </Link>
            )
          })}

          {/* Section Divider & Settings in Mobile Drawer */}
          <div className="pt-3 pb-1 border-t border-border mt-2 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
              <span>Peran Pengguna</span>
              <span>Tampilan</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ModeSwitch fullWidth />
              <ThemeToggle fullWidth />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
