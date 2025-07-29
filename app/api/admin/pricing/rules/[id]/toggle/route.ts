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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { isActive } = await request.json()

    // In a real app, update the rule in database
    console.log(`Toggling pricing rule ${params.id} to ${isActive ? "active" : "inactive"}`)

    return NextResponse.json({ message: "Pricing rule status updated" })
  } catch (error) {
    console.error("Toggle pricing rule error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
