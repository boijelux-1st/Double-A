import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

function verifyToken(authHeader: string | null): any {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = authHeader.split(" ")[1]
    const payload = JSON.parse(atob(token))

    if (Date.now() > payload.exp) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const tokenData = verifyToken(authHeader)

    if (!tokenData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters long" }, { status: 400 })
    }

    // Get current user
    const user = await db.getUserById(tokenData.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify current password (in production, use bcrypt.compare)
    if (currentPassword !== user.password) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // Update password (in production, use bcrypt.hash)
    const updatedUser = await db.updateUser(tokenData.userId, {
      password: newPassword,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
