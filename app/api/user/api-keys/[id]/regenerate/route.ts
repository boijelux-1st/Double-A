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

// Generate API key
function generateAPIKey(): string {
  const prefix = "da_"
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return prefix + randomPart
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const payload = verifyToken(authHeader)

    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // In a real app, find and update the API key in database
    const newKey = generateAPIKey()

    const updatedAPIKey = {
      id: params.id,
      key: newKey,
      lastUsed: null,
      requestCount: 0,
      // Keep other properties the same
    }

    console.log(`Regenerated API key ${params.id} for user ${payload.userId}`)

    return NextResponse.json(updatedAPIKey)
  } catch (error) {
    console.error("Regenerate API key error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
