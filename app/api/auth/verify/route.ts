import { type NextRequest, NextResponse } from "next/server"

// Simple token verification without external dependencies
function verifySimpleToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token))

    // Check if token is expired
    if (payload.exp && Date.now() > payload.exp) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = verifySimpleToken(token)

    if (!payload) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ message: "Token verification failed" }, { status: 500 })
  }
}
