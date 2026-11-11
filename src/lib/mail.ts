import nodemailer from 'nodemailer'

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('Konfigurasi SMTP_USER atau SMTP_PASS belum disetel di .env.local')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  })

  const mailOptions = {
    from: `"NalarPublik Keamanan" <${user}>`,
    to: toEmail,
    subject: `Kode Verifikasi OTP: ${otpCode} - NalarPublik`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 700;">NalarPublik</h2>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Platform Transparansi & Kebijakan Anggaran</p>
        </div>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px; border: 1px solid #f1f5f9;">
          <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0;">Gunakan kode OTP berikut untuk mengatur ulang kata sandi akun Anda:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; font-family: monospace; padding: 6px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 10px 0 0 0;">Kode ini hanya berlaku selama 5 menit.</p>
        </div>
        <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin: 0; text-align: center;">
          Jangan berikan kode ini kepada siapapun. Jika Anda tidak merasa meminta kode ini, abaikan email ini.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

