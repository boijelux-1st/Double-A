import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import bcrypt from "bcryptjs"

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
  console.log("=== LOGIN API CALLED ===")

  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user in database
    const user = await db.getUserByEmail(email)
    if (!user) {
      console.log("User not found for email:", email)
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    console.log("User found:", { id: user.id, email: user.email, role: user.role })

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    console.log("Password verified, generating token")

    // Generate token
    const token = generateToken(user)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    const response = {
      token,
      user: userWithoutPassword,
      message: "Login successful",
    }

    console.log("Login successful for:", email)
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("=== LOGIN ERROR ===")
    console.error("Error:", error)

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
