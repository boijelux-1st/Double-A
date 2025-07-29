import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { generateId } from "@/lib/utils"

// Mock VTU providers data
const mockVTUProviders = [
  {
    id: "1",
    name: "VTU.ng",
    baseUrl: "https://vtu.ng/wp-json/api/v1",
    apiKey: "vtu_ng_api_key_***",
    isActive: true,
    priority: 1,
    status: "online" as const,
    lastChecked: new Date().toISOString(),
    successRate: 98.5,
    responseTime: 234,
  },
  {
    id: "2",
    name: "EasyAccess",
    baseUrl: "https://easyaccess.com.ng/api/v1",
    apiKey: "easyaccess_api_key_***",
    isActive: true,
    priority: 2,
    status: "online" as const,
    lastChecked: new Date().toISOString(),
    successRate: 96.2,
    responseTime: 456,
  },
  {
    id: "3",
    name: "ClubKonnect",
    baseUrl: "https://clubkonnect.com/api/v1",
    apiKey: "clubkonnect_api_key_***",
    isActive: false,
    priority: 3,
    status: "offline" as const,
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
    successRate: 94.8,
    responseTime: 678,
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(mockVTUProviders)
  } catch (error) {
    console.error("VTU providers fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { name, baseUrl, apiKey, priority } = await request.json()

    const newProvider = {
      id: generateId(),
      name,
      baseUrl,
      apiKey,
      isActive: true,
      priority,
      status: "online" as const,
      lastChecked: new Date().toISOString(),
      successRate: 100,
      responseTime: 0,
    }

    mockVTUProviders.push(newProvider)

    return NextResponse.json(newProvider, { status: 201 })
  } catch (error) {
    console.error("Add VTU provider error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
