import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

// In-memory storage for OTP codes (use Redis in production)
const otpCodes = new Map<string, { code: string; expires: number }>()

// Simple JWT-like token generation
function generateToken(user: any): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  return btoa(JSON.stringify(payload))
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp, tempToken } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 })
    }

    // Check OTP code
    const storedData = otpCodes.get(email)
    if (!storedData) {
      return NextResponse.json({ message: "No OTP code found for this email" }, { status: 400 })
    }

    if (Date.now() > storedData.expires) {
      otpCodes.delete(email)
      return NextResponse.json({ message: "OTP code has expired" }, { status: 400 })
    }

    if (storedData.code !== otp) {
      return NextResponse.json({ message: "Invalid OTP code" }, { status: 400 })
    }

    // Find user
    const user = await db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Generate new token
    const token = generateToken(user)

    // Clean up OTP code
    otpCodes.delete(email)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json({ message: "OTP verification failed" }, { status: 500 })
  }
}
