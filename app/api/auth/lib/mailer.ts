// lib/mailer.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailVerification(email: string, code: string) {
  try {
    const response = await resend.emails.send({
      from: "Double A <noreply@doublea.com>",
      to: email,
      subject: "Verify your email",
      html: `<p>Hello,</p><p>Your OTP verification code is:</p><h2>${code}</h2><p>This code will expire in 5 minutes.</p>`,
    })

    console.log("OTP email sent:", response)
    return response
  } catch (error) {
    console.error("Failed to send OTP:", error)
    throw new Error("Email send failed")
  }
}
