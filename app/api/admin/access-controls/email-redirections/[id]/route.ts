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
    const redirection = await db.updateEmailRedirection(params.id, updates)

    if (!redirection) {
      return NextResponse.json({ message: "Email redirection not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Email redirection updated successfully",
      redirection,
    })
  } catch (error) {
    console.error("Error updating email redirection:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const success = await db.deleteEmailRedirection(params.id)

    if (!success) {
      return NextResponse.json({ message: "Email redirection not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Email redirection deleted successfully" })
  } catch (error) {
    console.error("Error deleting email redirection:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
