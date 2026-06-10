// pages/api/verify-otp.js
import { createHash } from 'crypto'

// Import cùng store từ send-otp (Next.js giữ module trong memory)
// Dùng global để share giữa 2 API routes
if (!global.otpStore) global.otpStore = {}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'Missing email or OTP' })

  const key = email.toLowerCase()
  const record = global.otpStore[key]

  if (!record) return res.status(400).json({ error: 'No OTP found. Please request a new code.' })
  if (Date.now() > record.expires) {
    delete global.otpStore[key]
    return res.status(400).json({ error: 'OTP expired. Please request a new code.' })
  }
  if (record.otp !== otp.toString()) {
    return res.status(400).json({ error: 'Invalid code. Please try again.' })
  }

  // OTP đúng — xóa khỏi store
  delete global.otpStore[key]

  // Tạo wallet address từ email hash (deterministic)
  // Dùng ethers để tạo wallet từ private key được derive từ email
  const { ethers } = await import('ethers')
  const emailHash = createHash('sha256').update(email.toLowerCase() + process.env.WALLET_SALT || 'booai_salt_2025').digest('hex')
  const privateKey = '0x' + emailHash
  const wallet = new ethers.Wallet(privateKey)

  res.json({
    success: true,
    address: wallet.address,
    // KHÔNG trả về privateKey — lưu phía client
  })
}
