import { type NextRequest, NextResponse } from "next/server"

// Mock settings storage - in production, this would be in a database
let platformSettings = {
  general: {
    platformName: "Double A Data Center Bauchi",
    platformDescription:
      "Your trusted VTU partner in Bauchi State. Buy airtime, data bundles, and pay bills with ease.",
    supportEmail: "support@doubleadatacenter.com",
    supportPhone: "+234-803-123-4567",
    maintenanceMode: false,
    registrationEnabled: true,
    defaultUserRole: "user",
  },
  pricing: {
    airtimeCommission: 2.5,
    dataCommission: 3.0,
    minimumFunding: 100,
    maximumFunding: 500000,
    transactionFee: 0.5,
    resellerDiscount: 5.0,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    transactionAlerts: true,
    systemAlerts: true,
    marketingEmails: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    ipWhitelist: ["127.0.0.1", "::1"],
  },
  integrations: {
    defaultVTUProvider: "vtu.ng",
    defaultPaymentGateway: "paystack",
    webhookUrl: "",
    apiRateLimit: 100,
    enableAPILogging: true,
  },
  appearance: {
    primaryColor: "#1e3a8a",
    secondaryColor: "#1e40af",
    logoUrl: "",
    faviconUrl: "",
    customCSS: "",
  },
}

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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(platformSettings)
  } catch (error) {
    console.error("Settings fetch error:", error)
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

    // Validate and update settings
    platformSettings = {
      ...platformSettings,
      ...newSettings,
    }

    console.log("Settings updated:", platformSettings)

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: platformSettings,
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
