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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const gateway = await db.getPaymentGatewayById(params.id)
    if (!gateway) {
      return NextResponse.json({ message: "Payment gateway not found" }, { status: 404 })
    }

    const updatedGateway = await db.updatePaymentGateway(params.id, {
      isActive: !gateway.isActive,
    })

    return NextResponse.json({
      message: `Payment gateway ${updatedGateway?.isActive ? "activated" : "deactivated"} successfully`,
      gateway: updatedGateway,
    })
  } catch (error) {
    console.error("Error toggling payment gateway status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
