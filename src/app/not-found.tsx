import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Halaman tidak ditemukan.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}

