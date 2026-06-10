// pages/api/verify-otp.js
import { createHmac } from 'crypto'

// Tạo OTP giống hệt send-otp.js — verify bằng cách tạo lại và so sánh
function generateOTP(email, windowMinutes = 10, offset = 0) {
  const salt = process.env.WALLET_SALT || 'booai_salt_2025'
  const window = Math.floor(Date.now() / (windowMinutes * 60 * 1000)) + offset
  const hmac = createHmac('sha256', salt)
  hmac.update(email.toLowerCase() + ':' + window)
  const hash = hmac.digest('hex')
  const num = parseInt(hash.slice(0, 8), 16)
  return String(num % 1000000).padStart(6, '0')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'Missing email or OTP' })

  const emailLower = email.toLowerCase()
  const inputOtp = otp.toString().trim()

  // Kiểm tra window hiện tại và window trước (phòng trường hợp gửi cuối window)
  const validOtps = [
    generateOTP(emailLower, 10, 0),
    generateOTP(emailLower, 10, -1),
  ]

  if (!validOtps.includes(inputOtp)) {
    return res.status(400).json({ error: 'Invalid or expired code. Please try again.' })
  }

  // OTP đúng — trả về success (wallet tạo phía client)
  res.json({ success: true, email: emailLower })
}
