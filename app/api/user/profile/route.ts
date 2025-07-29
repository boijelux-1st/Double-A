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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const tokenData = verifyToken(authHeader)

    if (!tokenData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await db.getUserById(tokenData.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user profile without password
    const { password, ...profile } = user
    const profileWithPin = {
      ...profile,
      hasTransactionPin: !!user.transactionPin,
    }

    return NextResponse.json(profileWithPin)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const tokenData = verifyToken(authHeader)

    if (!tokenData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { firstName, lastName, phone } = await request.json()

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json({ message: "First name and last name are required" }, { status: 400 })
    }

    const updatedUser = await db.updateUser(tokenData.userId, {
      firstName,
      lastName,
      phone,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return updated profile without password
    const { password, ...profile } = updatedUser
    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
