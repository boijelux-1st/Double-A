import { type NextRequest, NextResponse } from "next/server"

// Simple token verification
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const payload = verifyToken(authHeader)

    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // In a real app, delete the API key from database
    console.log(`Deleting API key ${params.id} for user ${payload.userId}`)

    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    console.error("Delete API key error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
