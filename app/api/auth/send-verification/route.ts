import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

// In-memory storage for verification codes (use Redis in production)
const verificationCodes = new Map<string, { code: string; expires: number }>()

function generateVerificationCode(): string {
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
  const emailConfirmationRedirection = redirections.find((r) => r.sourceEvent === "email_confirmation" && r.isActive)

  if (emailConfirmationRedirection) {
    const template = emailConfirmationRedirection.template
      .replace("{{user_email}}", to)
      .replace("{{verification_code}}", body.match(/\d{6}/)?.[0] || "")

    console.log(`
=== EMAIL REDIRECTION ===
To: ${emailConfirmationRedirection.targetEmail}
Subject: Email Confirmation - ${to}
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

    // Generate verification code
    const code = generateVerificationCode()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store verification code
    verificationCodes.set(email, { code, expires })

    // Send email
    await sendEmail(
      email,
      "Double A Data Center - Email Verification",
      `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nDouble A Data Center Bauchi Team`,
    )

    return NextResponse.json({ message: "Verification code sent successfully" })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json({ message: "Failed to send verification code" }, { status: 500 })
  }
}
