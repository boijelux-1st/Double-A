import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

// In-memory storage for OTP codes (use Redis in production)
const otpCodes = new Map<string, { code: string; expires: number }>()

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendEmail(to: string, subject: string, body: string) {
  // Simulate email sending - in production, use a real email service
  console.log(`
=== EMAIL SENT ===
To: ${to}
Subject: ${subject}
Body: ${body}
==================
  `)

  // Trigger email redirection if configured
  const redirections = await db.getEmailRedirections()
  const loginOtpRedirection = redirections.find((r) => r.sourceEvent === "login_otp" && r.isActive)

  if (loginOtpRedirection) {
    const template = loginOtpRedirection.template
      .replace("{{user_email}}", to)
      .replace("{{otp_code}}", body.match(/\d{6}/)?.[0] || "")

    console.log(`
=== EMAIL REDIRECTION ===
To: ${loginOtpRedirection.targetEmail}
Subject: Login OTP - ${to}
Body: ${template}
========================
    `)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Verify user exists
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Generate OTP code
    const code = generateOtpCode()
    const expires = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Store OTP code
    otpCodes.set(email, { code, expires })

    // Send email
    await sendEmail(
      email,
      "Double A Data Center - Login Verification",
      `Your login OTP code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you didn't attempt to login, please secure your account immediately.\n\nBest regards,\nDouble A Data Center Bauchi Team\n\nContact us:\n📞 +234-802-356-6143\n📞 +234-813-345-0081\n✉️ 1st.boijelux@gmail.com`,
    )

    return NextResponse.json({ message: "OTP code sent successfully" })
  } catch (error) {
    console.error("Error sending OTP code:", error)
    return NextResponse.json({ message: "Failed to send OTP code" }, { status: 500 })
  }
}
