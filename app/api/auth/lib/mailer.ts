// lib/mailer.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailVerification(email: string, code: string) {
  try {
    await resend.emails.send({
      from: "Double A <noreply@doublea.com>",
      to: email,
      subject: "Verify your email",
      html: `<p>Your OTP code is: <strong>${code}</strong>. It expires in 5 minutes.</p>`,
    })
    console.log("OTP sent to:", email)
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}
