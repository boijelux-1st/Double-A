import { type NextRequest, NextResponse } from "next/server"
import { generateId } from "@/lib/utils"

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

// Mock API keys storage
const userAPIKeys = new Map<string, any[]>([
  ["1", []], // Admin user
  ["2", []], // Regular user
])

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const payload = verifyToken(authHeader)

    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const apiKeys = userAPIKeys.get(payload.userId) || []
    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("API keys fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const payload = verifyToken(authHeader)

    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "API key name is required" }, { status: 400 })
    }

    const userKeys = userAPIKeys.get(payload.userId) || []

    // Limit to 5 API keys per user
    if (userKeys.length >= 5) {
      return NextResponse.json({ message: "Maximum of 5 API keys allowed per user" }, { status: 400 })
    }

    const newAPIKey = {
      id: generateId(),
      name: name.trim(),
      key: generateAPIKey(),
      isActive: true,
      lastUsed: null,
      requestCount: 0,
      rateLimit: 1000, // 1000 requests per hour
      createdAt: new Date().toISOString(),
    }

    userKeys.push(newAPIKey)
    userAPIKeys.set(payload.userId, userKeys)

    return NextResponse.json(newAPIKey, { status: 201 })
  } catch (error) {
    console.error("Create API key error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
