import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { generateId } from "@/lib/utils"
import { apiManager } from "@/lib/real-api-integrations"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    const { serviceType, network, phoneNumber, amount, dataBundle } = await request.json()

    // Validate input
    if (!serviceType || !network || !phoneNumber || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check user's wallet balance (in a real app, fetch from database)
    // For demo, we'll assume they have sufficient balance

    try {
      let vtuResult

      if (serviceType === "airtime") {
        vtuResult = await apiManager.purchaseVTU("airtime", {
          network: network.toLowerCase(),
          phone: phoneNumber,
          amount: amount,
        })
      } else {
        // Map data bundle to plan ID (this would be stored in database)
        const planMapping: Record<string, string> = {
          "1gb_30days": "MTN_1GB_30",
          "2gb_30days": "MTN_2GB_30",
          "5gb_30days": "MTN_5GB_30",
          "10gb_30days": "MTN_10GB_30",
        }

        vtuResult = await apiManager.purchaseVTU("data", {
          network: network.toLowerCase(),
          phone: phoneNumber,
          planId: planMapping[dataBundle] || dataBundle,
          amount: amount,
        })
      }

      if (!vtuResult.success) {
        return NextResponse.json({ message: vtuResult.message || "VTU purchase failed" }, { status: 400 })
      }

      // Create transaction record
      const transaction = {
        id: generateId(),
        userId: decoded.userId,
        type: "debit",
        amount,
        description: `${network.toUpperCase()} ${serviceType === "airtime" ? "Airtime" : "Data"} - ${phoneNumber}`,
        status: "completed",
        serviceType,
        network,
        phoneNumber,
        dataBundle,
        vtuTransactionId: vtuResult.transactionId,
        provider: vtuResult.provider,
        createdAt: new Date().toISOString(),
      }

      // In a real app, save transaction and update wallet balance
      console.log("VTU purchase transaction:", transaction)

      return NextResponse.json({
        message: "Purchase successful",
        transactionId: transaction.id,
        vtuTransactionId: vtuResult.transactionId,
        provider: vtuResult.provider,
      })
    } catch (error) {
      console.error("VTU API error:", error)

      // Fallback to mock response for demo
      const mockResult = {
        success: Math.random() > 0.1, // 90% success rate
        transactionId: "MOCK_" + generateId(),
        provider: "demo",
      }

      if (!mockResult.success) {
        return NextResponse.json({ message: "All VTU providers are currently unavailable" }, { status: 503 })
      }

      const transaction = {
        id: generateId(),
        userId: decoded.userId,
        type: "debit",
        amount,
        description: `${network.toUpperCase()} ${serviceType === "airtime" ? "Airtime" : "Data"} - ${phoneNumber}`,
        status: "completed",
        serviceType,
        network,
        phoneNumber,
        dataBundle,
        vtuTransactionId: mockResult.transactionId,
        provider: "demo",
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json({
        message: "Purchase successful (demo mode)",
        transactionId: transaction.id,
        vtuTransactionId: mockResult.transactionId,
        provider: "demo",
      })
    }
  } catch (error) {
    console.error("VTU purchase error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
