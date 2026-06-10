// pages/api/send-otp.js
if (!global.otpStore) global.otpStore = {}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' })

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = Date.now() + 10 * 60 * 1000

  global.otpStore[email.toLowerCase()] = { otp, expires }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'booAI_bot <onboarding@resend.dev>',
      to: email,
      subject: '🔐 Your booAI_bot login code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#06060f;color:#eeeef5;border-radius:16px">
          <div style="font-size:32px;margin-bottom:16px">🤖</div>
          <h2 style="font-size:24px;font-weight:700;margin:0 0 8px;color:#eeeef5">booAI_bot Login</h2>
          <p style="color:#52526a;font-size:14px;margin:0 0 32px">Your one-time login code:</p>
          <div style="background:#0d0d1a;border:1px solid rgba(139,111,255,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <div style="font-family:monospace;font-size:40px;font-weight:700;letter-spacing:12px;color:#8b6fff">${otp}</div>
          </div>
          <p style="color:#52526a;font-size:12px;margin:0">Expires in <strong style="color:#eeeef5">10 minutes</strong>. Do not share.</p>
          <p style="color:#3a3a52;font-size:11px;margin:16px 0 0">booAI_bot · AI Agent on ARC Testnet</p>
        </div>
      `,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Send OTP error:', err)
    res.status(500).json({ error: 'Failed to send: ' + err.message })
  }
}
