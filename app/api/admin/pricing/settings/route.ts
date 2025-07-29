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

// Mock commission settings storage
let commissionSettings = {
  airtimeCommission: 2.5,
  dataCommission: 3.0,
  resellerDiscount: 5.0,
  minimumProfit: 10,
  autoCalculatePrice: true,
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(commissionSettings)
  } catch (error) {
    console.error("Commission settings fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const newSettings = await request.json()

    // Validate settings
    if (newSettings.airtimeCommission < 0 || newSettings.dataCommission < 0) {
      return NextResponse.json({ message: "Commission rates cannot be negative" }, { status: 400 })
    }

    if (newSettings.resellerDiscount < 0 || newSettings.resellerDiscount > 100) {
      return NextResponse.json({ message: "Reseller discount must be between 0 and 100" }, { status: 400 })
    }

    // Update settings
    commissionSettings = {
      ...commissionSettings,
      ...newSettings,
    }

    return NextResponse.json({
      message: "Commission settings updated successfully",
      settings: commissionSettings,
    })
  } catch (error) {
    console.error("Commission settings update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
