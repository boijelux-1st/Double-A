import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

function verifyAdminToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  try {
    const token = authHeader.split(" ")[1]
    const payload = JSON.parse(atob(token))
    return payload.role === "admin" && Date.now() < payload.exp
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const accounts = await db.getBankAccounts()
    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching bank accounts:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const accountData = await request.json()

    // If this is set as primary, clear other primary accounts
    if (accountData.isPrimary) {
      await db.clearPrimaryBankAccount()
    }

    const account = await db.createBankAccount(accountData)

    return NextResponse.json({
      message: "Bank account created successfully",
      account,
    })
  } catch (error) {
    console.error("Error creating bank account:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
