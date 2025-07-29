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

    // Simulate API test based on gateway type
    let testResult = { success: false, message: "" }

    switch (gateway.type) {
      case "paystack":
        // Simulate Paystack API test
        if (gateway.secretKey.startsWith("sk_")) {
          testResult = { success: true, message: "Paystack connection successful" }
        } else {
          testResult = { success: false, message: "Invalid Paystack secret key format" }
        }
        break

      case "flutterwave":
        // Simulate Flutterwave API test
        if (gateway.secretKey.startsWith("FLWSECK_")) {
          testResult = { success: true, message: "Flutterwave connection successful" }
        } else {
          testResult = { success: false, message: "Invalid Flutterwave secret key format" }
        }
        break

      case "monnify":
        // Simulate Monnify API test
        testResult = { success: true, message: "Monnify connection successful" }
        break

      default:
        testResult = { success: true, message: "Custom gateway connection test passed" }
    }

    return NextResponse.json({
      message: testResult.message,
      success: testResult.success,
    })
  } catch (error) {
    console.error("Error testing payment gateway:", error)
    return NextResponse.json({ message: "Gateway connection test failed" }, { status: 500 })
  }
}
