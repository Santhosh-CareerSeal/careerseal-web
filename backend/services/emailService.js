const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

const sendOTPEmail = async (email, name, otp) => {
  try {
    await resend.emails.send({
      from: 'CareerSeal <onboarding@resend.dev>',
      to: email,
      subject: `${otp} is your CareerSeal verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #1A3C6E; padding: 12px 24px; border-radius: 50px;">
              <span style="color: white; font-size: 18px; font-weight: 700;">CareerSeal</span>
            </div>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="color: #1A3C6E; margin: 0 0 8px;">Verify your email</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">Hi ${name}, enter this code to complete your registration:</p>
            <div style="background: #f0f4ff; border: 2px dashed #1A3C6E; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
              <p style="font-size: 40px; font-weight: 700; color: #1A3C6E; letter-spacing: 10px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin: 0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">If you didn't create a CareerSeal account, ignore this email.</p>
        </div>
      `
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

module.exports = { sendOTPEmail }
