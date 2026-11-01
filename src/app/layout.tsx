import type { Metadata } from 'next'
import { DM_Sans, Manrope } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NalarPublik — Transparansi Anggaran Daerah Kabupaten Toba',
    template: '%s | NalarPublik',
  },
  description:
    'Platform data-driven decision support yang menyandingkan data BPS, APBD Kabupaten Toba, dan aspirasi warga untuk kebijakan anggaran berbasis bukti.',
  keywords: ['APBD', 'Kabupaten Toba', 'transparansi anggaran', 'BPS', 'Musrenbang', 'civic tech'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('nalarpublik-theme');
                const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${manrope.variable} antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200`}
        style={{ fontFamily: 'var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif' }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
