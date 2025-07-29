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
    const user = verifyToken(authHeader)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = url.searchParams.get("limit")
    const limitNumber = limit ? Number.parseInt(limit) : undefined

    const transactions = await db.getTransactionsByUserId(user.userId, limitNumber)

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Transactions fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
