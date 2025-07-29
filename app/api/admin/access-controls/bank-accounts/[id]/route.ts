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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    // If this is set as primary, clear other primary accounts
    if (updates.isPrimary) {
      await db.clearPrimaryBankAccount()
    }

    const account = await db.updateBankAccount(params.id, updates)

    if (!account) {
      return NextResponse.json({ message: "Bank account not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Bank account updated successfully",
      account,
    })
  } catch (error) {
    console.error("Error updating bank account:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const success = await db.deleteBankAccount(params.id)

    if (!success) {
      return NextResponse.json({ message: "Bank account not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Bank account deleted successfully" })
  } catch (error) {
    console.error("Error deleting bank account:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
