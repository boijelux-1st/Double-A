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

    const { pin } = await request.json()

    // Validate PIN
    if (!pin || pin.length !== 5 || !/^\d{5}$/.test(pin)) {
      return NextResponse.json({ message: "PIN must be exactly 5 digits" }, { status: 400 })
    }

    // Update transaction PIN (in production, hash the PIN)
    const updatedUser = await db.updateUser(tokenData.userId, {
      transactionPin: pin,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to set transaction PIN" }, { status: 500 })
    }

    return NextResponse.json({ message: "Transaction PIN set successfully" })
  } catch (error) {
    console.error("Transaction PIN error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
