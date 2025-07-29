import { type NextRequest, NextResponse } from "next/server"
import { generateId } from "@/lib/utils"

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

// Mock pricing rules storage
const pricingRules = [
  {
    id: "1",
    serviceType: "airtime" as const,
    network: "mtn",
    buyingPrice: 95,
    sellingPrice: 100,
    commission: 5.26,
    isActive: true,
    userType: "all" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    serviceType: "data" as const,
    network: "mtn",
    planName: "1gb_30days",
    buyingPrice: 280,
    sellingPrice: 300,
    commission: 7.14,
    isActive: true,
    userType: "all" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    serviceType: "data" as const,
    network: "glo",
    planName: "5gb_30days",
    buyingPrice: 1400,
    sellingPrice: 1500,
    commission: 7.14,
    isActive: true,
    userType: "reseller" as const,
    createdAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(pricingRules)
  } catch (error) {
    console.error("Pricing rules fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, network, planName, buyingPrice, sellingPrice, userType, commission, isActive } =
      await request.json()

    // Validate required fields
    if (!serviceType || !network || !buyingPrice || !sellingPrice || !userType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (buyingPrice <= 0 || sellingPrice <= 0) {
      return NextResponse.json({ message: "Prices must be greater than 0" }, { status: 400 })
    }

    if (sellingPrice <= buyingPrice) {
      return NextResponse.json({ message: "Selling price must be greater than buying price" }, { status: 400 })
    }

    const newRule = {
      id: generateId(),
      serviceType,
      network,
      planName: serviceType === "data" ? planName : undefined,
      buyingPrice,
      sellingPrice,
      commission,
      isActive: isActive !== undefined ? isActive : true,
      userType,
      createdAt: new Date().toISOString(),
    }

    pricingRules.push(newRule)

    return NextResponse.json(newRule, { status: 201 })
  } catch (error) {
    console.error("Add pricing rule error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
