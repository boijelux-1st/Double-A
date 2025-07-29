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

// Mock usage data
const mockUsageData = [
  {
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    requests: 45,
    successful: 43,
    failed: 2,
  },
  {
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    requests: 67,
    successful: 65,
    failed: 2,
  },
  {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    requests: 89,
    successful: 87,
    failed: 2,
  },
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    requests: 123,
    successful: 120,
    failed: 3,
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    requests: 156,
    successful: 152,
    failed: 4,
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    requests: 78,
    successful: 76,
    failed: 2,
  },
  {
    date: new Date().toISOString(),
    requests: 34,
    successful: 33,
    failed: 1,
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const payload = verifyToken(authHeader)

    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(mockUsageData)
  } catch (error) {
    console.error("API usage fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
