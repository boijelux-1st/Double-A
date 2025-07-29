import { type NextRequest, NextResponse } from "next/server"

// Simple admin token verification
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // In a real app, delete the rule from database
    console.log(`Deleting pricing rule ${params.id}`)

    return NextResponse.json({ message: "Pricing rule deleted successfully" })
  } catch (error) {
    console.error("Delete pricing rule error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
