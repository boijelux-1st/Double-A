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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const redirection = await db.getEmailRedirectionById(params.id)
    if (!redirection) {
      return NextResponse.json({ message: "Email redirection not found" }, { status: 404 })
    }

    const updatedRedirection = await db.updateEmailRedirection(params.id, {
      isActive: !redirection.isActive,
    })

    return NextResponse.json({
      message: `Email redirection ${updatedRedirection?.isActive ? "activated" : "deactivated"} successfully`,
      redirection: updatedRedirection,
    })
  } catch (error) {
    console.error("Error toggling email redirection status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
