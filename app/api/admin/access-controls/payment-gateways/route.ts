import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

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

    const gateways = await db.getPaymentGateways()
    return NextResponse.json(gateways)
  } catch (error) {
    console.error("Error fetching payment gateways:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const gatewayData = await request.json()
    const gateway = await db.createPaymentGateway(gatewayData)

    return NextResponse.json({
      message: "Payment gateway created successfully",
      gateway,
    })
  } catch (error) {
    console.error("Error creating payment gateway:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
