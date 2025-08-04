import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code are required" }, { status: 400 })
    }

    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const otpRecord = await db.otp.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: { gt: new Date() }
      }
    })

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 })
    }

    // Mark user as verified
    await db.updateUser(user.id, { isActive: true })

    // Delete used OTP
    await db.otp.delete({ where: { id: otpRecord.id } })

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
