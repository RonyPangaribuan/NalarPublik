// Store OTP in global scope to persist across Next.js dev hot-reloads
interface OtpEntry {
  code: string
  expiresAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __otpStore: Map<string, OtpEntry> | undefined
}

const otpMap = global.__otpStore ?? new Map<string, OtpEntry>()
if (process.env.NODE_ENV !== 'production') {
  global.__otpStore = otpMap
}

export function saveOtp(email: string, code: string, ttlSeconds = 300) {
  otpMap.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

export function verifyOtp(email: string, code: string): { valid: boolean; reason?: string } {
  const entry = otpMap.get(email.toLowerCase().trim())
  if (!entry) {
    return { valid: false, reason: 'Kode OTP tidak ditemukan atau belum diminta.' }
  }
  if (Date.now() > entry.expiresAt) {
    otpMap.delete(email.toLowerCase().trim())
    return { valid: false, reason: 'Kode OTP telah kadaluwarsa. Silakan minta kode baru.' }
  }
  if (entry.code !== code.trim()) {
    return { valid: false, reason: 'Kode OTP salah. Periksa kembali email Anda.' }
  }
  return { valid: true }
}

export function consumeOtp(email: string): void {
  otpMap.delete(email.toLowerCase().trim())
}

