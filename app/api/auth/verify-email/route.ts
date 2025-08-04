import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

// In-memory storage for verification codes (use Redis in production)
const verificationCodes = new Map<string, { code: string; expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code are required" }, { status: 400 })
    }

    // Check verification code
    const storedData = verificationCodes.get(email)
    if (!storedData) {
      return NextResponse.json({ message: "No verification code found for this email" }, { status: 400 })
    }

    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email)
      return NextResponse.json({ message: "Verification code has expired" }, { status: 400 })
    }

    if (storedData.code !== code) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 })
    }

    // Find user and mark as verified
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update user as verified (in production, add emailVerified field)
    await db.updateUser(user.id, { isActive: true })

    // Clean up verification code
    verificationCodes.delete(email)

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ message: "Email verification failed" }, { status: 500 })
  }
}
