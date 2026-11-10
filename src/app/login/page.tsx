'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useRoleStore } from '@/store/use-role-store'

type AuthMode = 'login' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password' | 'forgot_success'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallback = searchParams.get('callbackUrl') ?? '/admin'
  let callbackUrl = '/admin'
  try {
    const decoded = decodeURIComponent(rawCallback)
    if (
      decoded.startsWith('/') &&
      !decoded.startsWith('/login') &&
      decoded !== '/admin/login' &&
      !decoded.includes('%2F')
    ) {
      callbackUrl = decoded
    }
  } catch (_) {
    callbackUrl = '/admin'
  }
  const initialMode = searchParams.get('mode') === 'forgot' ? 'forgot_email' : 'login'

  const { setRole } = useRoleStore()

  // State mode
  const [mode, setMode] = useState<AuthMode>(initialMode)

  // Login inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const errorParam = searchParams.get('error')
  const [error, setError] = useState(
    errorParam === 'google_denied'
      ? 'Login Google dibatalkan.'
      : errorParam === 'not_authorized'
      ? 'Akun Google ini tidak memiliki izin.'
      : errorParam === 'not_configured'
      ? 'Google OAuth belum dikonfigurasi.'
      : errorParam
      ? 'Gagal masuk dengan akun Google.'
      : ''
  )

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  async function handleLoginRequest(payload: { email?: string; password?: string; isDemo?: boolean }) {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Email atau kata sandi tidak valid.')
        return
      }

      setRole('admin')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('Gagal terhubung ke server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleLoginRequest({ email, password })
  }

  function handleSocialLogin(provider: string) {
    if (provider === 'Google') {
      window.location.href = `/api/auth/google/redirect?callbackUrl=${encodeURIComponent(callbackUrl)}`
    } else {
      handleLoginRequest({ isDemo: true })
    }
  }

  // Tahap 1: Kirim OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail) {
      setError('Masukkan alamat email Anda terlebih dahulu.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Gagal mengirim kode OTP. Periksa konfigurasi email.')
        return
      }

      setOtpCode(['', '', '', '', '', ''])
      setMode('forgot_otp')
    } catch {
      setError('Gagal terhubung ke server untuk mengirim OTP.')
    } finally {
      setLoading(false)
    }
  }

  // Tahap 2: Verifikasi Kode OTP saja
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const fullOtp = otpCode.join('')
    if (fullOtp.length < 6) {
      setError('Masukkan 6 digit kode OTP lengkap.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: fullOtp }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Kode OTP salah atau telah kadaluwarsa.')
        return
      }

      setMode('forgot_new_password')
    } catch {
      setError('Gagal memverifikasi kode OTP.')
    } finally {
      setLoading(false)
    }
  }

  // Tahap 3: Simpan Kata Sandi Baru
  async function handleSaveNewPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak sesuai.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const fullOtp = otpCode.join('')
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: fullOtp,
          newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Gagal menyimpan kata sandi baru.')
        return
      }

      setMode('forgot_success')
    } catch {
      setError('Gagal menyimpan kata sandi baru.')
    } finally {
      setLoading(false)
    }
  }

  // Handle input digit OTP
  function handleOtpChange(index: number, val: string) {
    const cleanVal = val.replace(/\D/g, '').slice(-1)
    const newOtp = [...otpCode]
    newOtp[index] = cleanVal
    setOtpCode(newOtp)

    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden select-none">
      {/* ── Background: Light mode ── */}
      <div className="absolute inset-0 -z-10 dark:hidden" style={{ background: 'linear-gradient(180deg, #aecfed 0%, #c8e0f4 20%, #ddedfb 45%, #eef6ff 70%, #f8fbff 100%)' }}>
        {/* Cloud silhouette — SVG at bottom */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,224 C60,224 80,200 120,196 C140,193 155,200 170,196 C190,190 200,180 230,178 C260,176 275,185 300,180 C340,172 360,155 400,150 C440,145 460,158 500,155 C540,152 560,138 600,135 C650,131 670,148 710,145 C750,142 770,128 820,122 C870,116 895,130 940,128 C985,126 1005,112 1050,108 C1100,103 1125,118 1170,115 C1210,112 1230,98 1270,96 C1310,94 1330,105 1370,104 C1400,103 1420,96 1440,95 L1440,320 L0,320 Z" fill="white" fillOpacity="0.65" />
          <path d="M0,260 C80,255 120,240 180,238 C220,236 245,245 280,242 C320,239 345,228 390,224 C430,220 455,232 500,229 C545,226 570,215 620,210 C670,205 700,218 750,215 C800,212 825,200 880,196 C930,192 960,204 1010,201 C1060,198 1085,187 1140,183 C1195,179 1220,191 1270,189 C1315,187 1335,178 1380,176 C1405,175 1425,180 1440,179 L1440,320 L0,320 Z" fill="white" fillOpacity="0.85" />
          <path d="M0,290 C60,286 100,278 150,276 C200,274 230,282 280,279 C330,276 360,267 420,264 C475,261 505,270 560,268 C615,266 645,257 710,254 C770,251 800,260 860,258 C920,256 950,247 1020,244 C1085,241 1115,250 1180,248 C1240,246 1270,238 1340,236 C1385,234 1415,241 1440,240 L1440,320 L0,320 Z" fill="white" fillOpacity="1" />
        </svg>
      </div>

      {/* ── Background: Dark mode ── */}
      <div className="absolute inset-0 -z-10 hidden dark:block" style={{ background: 'linear-gradient(180deg, #020617 0%, #050e20 20%, #08152c 45%, #0c1c3a 70%, #0f2348 100%)' }}>
        {/* Cloud silhouette — dark */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,224 C60,224 80,200 120,196 C140,193 155,200 170,196 C190,190 200,180 230,178 C260,176 275,185 300,180 C340,172 360,155 400,150 C440,145 460,158 500,155 C540,152 560,138 600,135 C650,131 670,148 710,145 C750,142 770,128 820,122 C870,116 895,130 940,128 C985,126 1005,112 1050,108 C1100,103 1125,118 1170,115 C1210,112 1230,98 1270,96 C1310,94 1330,105 1370,104 C1400,103 1420,96 1440,95 L1440,320 L0,320 Z" fill="#14213d" fillOpacity="0.75" />
          <path d="M0,260 C80,255 120,240 180,238 C220,236 245,245 280,242 C320,239 345,228 390,224 C430,220 455,232 500,229 C545,226 570,215 620,210 C670,205 700,218 750,215 C800,212 825,200 880,196 C930,192 960,204 1010,201 C1060,198 1085,187 1140,183 C1195,179 1220,191 1270,189 C1315,187 1335,178 1380,176 C1405,175 1425,180 1440,179 L1440,320 L0,320 Z" fill="#192a4c" fillOpacity="0.85" />
          <path d="M0,290 C60,286 100,278 150,276 C200,274 230,282 280,279 C330,276 360,267 420,264 C475,261 505,270 560,268 C615,266 645,257 710,254 C770,251 800,260 860,258 C920,256 950,247 1020,244 C1085,241 1115,250 1180,248 C1240,246 1270,238 1340,236 C1385,234 1415,241 1440,240 L1440,320 L0,320 Z" fill="#0d1b34" fillOpacity="1" />
        </svg>
      </div>

      {/* ── Main Auth Card ── */}
      <div className="relative w-full max-w-[340px] sm:max-w-[350px] bg-white/72 dark:bg-[#1c263d]/95 backdrop-blur-2xl rounded-[26px] shadow-[0_8px_32px_rgba(80,130,255,0.10)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] border border-blue-100/60 dark:border-slate-600/70 p-6 sm:p-7 transition-all duration-300">
        
        {/* Top Logo Container */}
        <div className="flex justify-center mb-4">
          <div className="size-11 rounded-full bg-white dark:bg-slate-700/80 shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-slate-100/80 dark:border-slate-600/70 flex items-center justify-center">
            {mode === 'forgot_email' || mode === 'forgot_otp' ? (
              <KeyRound size={20} className="text-[#3B66E4]" />
            ) : mode === 'forgot_new_password' ? (
              <Lock size={19} className="text-[#3B66E4]" />
            ) : mode === 'forgot_success' ? (
              <CheckCircle2 size={22} className="text-emerald-600" />
            ) : (
              <Logo size="sm" showText={false} />
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            MODE 1: LOGIN UTAMA
        ════════════════════════════════════════════════════════════════ */}
        {mode === 'login' && (
          <div>
            <div className="text-center mb-5">
              <h1 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">
                Horas, Selamat Datang! 
              </h1>
              <p className="text-[12.5px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                Masuk untuk kelola data &amp; anggaran Toba.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-2.5">
              {/* Email field */}
              <div className="flex items-center gap-2.5 rounded-xl bg-[#f2f4f7] dark:bg-slate-900/80 px-3 py-2.5 border border-transparent dark:border-slate-700/50 focus-within:border-blue-400/80 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat Email"
                  className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center gap-2.5 rounded-xl bg-[#f2f4f7] dark:bg-slate-900/80 px-3 py-2.5 border border-transparent dark:border-slate-700/50 focus-within:border-blue-400/80 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                  <Lock size={14} className="text-slate-400 shrink-0" />
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kata Sandi"
                    className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div className="text-right mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError('')
                      setForgotEmail(email)
                      setMode('forgot_email')
                    }}
                    className="text-[11px] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2.5 py-2 text-[11px] text-red-600 dark:text-red-400">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1a1d24] hover:bg-[#252830] active:scale-[0.99] text-white text-[13px] font-semibold py-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Dasbor'}
              </button>
            </form>

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal whitespace-nowrap">
                Atau masuk dengan
              </span>
              <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
            </div>

            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              title="Masuk dengan Google"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all shadow-2xs cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODE 2: LUPA KATA SANDI - MASUKKAN EMAIL
        ════════════════════════════════════════════════════════════════ */}
        {mode === 'forgot_email' && (
          <div>
            <div className="text-center mb-5">
              <h1 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
                Lupa Kata Sandi?
              </h1>
              <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                Masukkan email Anda untuk menerima 6 digit kode OTP verifikasi.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-[#f2f4f7] dark:bg-slate-900/80 px-3 py-2.5 border border-transparent dark:border-slate-700/50 focus-within:border-blue-400/80 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoFocus
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Masukkan alamat email Anda"
                  className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2.5 py-2 text-[11px] text-red-600 dark:text-red-400">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1a1d24] hover:bg-[#252830] active:scale-[0.99] text-white text-[13px] font-semibold py-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMode('login')
                }}
                className="w-full flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Kembali ke Halaman Masuk</span>
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODE 3: VERIFIKASI 6 DIGIT KODE OTP (TERPISAH, TANPA DEMO)
        ════════════════════════════════════════════════════════════════ */}
        {mode === 'forgot_otp' && (
          <div>
            <div className="text-center mb-5">
              <h1 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
                Masukkan Kode OTP
              </h1>
              <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                Kode 6 digit telah dikirim ke<br />
                <strong className="text-slate-700 dark:text-slate-200 font-semibold">{forgotEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* 6 Digit Boxes */}
              <div className="flex justify-between gap-1.5">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={idx === 0}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="size-10 sm:size-10.5 text-center text-sm font-bold font-mono rounded-xl bg-[#f2f4f7] dark:bg-slate-900/80 border border-transparent dark:border-slate-700/50 focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none transition-all shadow-2xs"
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-start gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2.5 py-2 text-[11px] text-red-600 dark:text-red-400">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1a1d24] hover:bg-[#252830] active:scale-[0.99] text-white text-[13px] font-semibold py-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi Kode OTP'}
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setError('')
                    setOtpCode(['', '', '', '', '', ''])
                    setLoading(true)
                    try {
                      const res = await fetch('/api/auth/otp/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: forgotEmail }),
                      })
                      const data = await res.json()
                      if (!res.ok || !data.success) {
                        setError(data.error ?? 'Gagal mengirim ulang kode.')
                      }
                    } catch {
                      setError('Gagal terhubung ke server.')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Kirim ulang kode
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setMode('login')
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODE 4: ATUR KATA SANDI BARU (TERPISAH SENDIRI)
        ════════════════════════════════════════════════════════════════ */}
        {mode === 'forgot_new_password' && (
          <div>
            <div className="text-center mb-5">
              <h1 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
                Atur Kata Sandi Baru
              </h1>
              <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                Buat kata sandi baru yang aman untuk akun Anda.
              </p>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-3">
              {/* Input Kata Sandi Baru */}
              <div className="flex items-center gap-2.5 rounded-xl bg-[#f2f4f7] dark:bg-slate-900/80 px-3 py-2.5 border border-transparent dark:border-slate-700/50 focus-within:border-blue-400/80 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <Lock size={14} className="text-slate-400 shrink-0" />
                <input
                  id="new-password"
                  type={showNewPass ? 'text' : 'password'}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kata Sandi Baru"
                  className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showNewPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Input Konfirmasi Kata Sandi */}
              <div className="flex items-center gap-2.5 rounded-xl bg-[#f2f4f7] dark:bg-slate-900/80 px-3 py-2.5 border border-transparent dark:border-slate-700/50 focus-within:border-blue-400/80 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <Lock size={14} className="text-slate-400 shrink-0" />
                <input
                  id="confirm-password"
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi Kata Sandi Baru"
                  className="flex-1 bg-transparent text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showConfirmPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2.5 py-2 text-[11px] text-red-600 dark:text-red-400">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1a1d24] hover:bg-[#252830] active:scale-[0.99] text-white text-[13px] font-semibold py-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMode('login')
                }}
                className="w-full text-center text-[11.5px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            MODE 5: SUKSES RESET KATA SANDI
        ════════════════════════════════════════════════════════════════ */}
        {mode === 'forgot_success' && (
          <div className="text-center py-2">
            <h1 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Kata Sandi Diperbarui!
            </h1>
            <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-2 leading-relaxed">
              Kata sandi akun Anda berhasil diganti.
            </p>

            <button
              type="button"
              onClick={() => handleLoginRequest({ isDemo: true })}
              className="w-full mt-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold py-2.5 transition-all shadow-xs cursor-pointer"
            >
              Masuk
            </button>

            <button
              type="button"
              onClick={() => {
                setError('')
                setMode('login')
              }}
              className="mt-3 text-[11.5px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 block w-full text-center transition-colors cursor-pointer"
            >
              Kembali ke Halaman Masuk
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-[340px] h-80 rounded-[26px] bg-white animate-pulse" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
