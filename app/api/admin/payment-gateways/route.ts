import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { generateId } from "@/lib/utils"

// Mock payment gateways data
const mockPaymentGateways = [
  {
    id: "1",
    name: "Paystack",
    publicKey: "pk_test_***",
    secretKey: "sk_test_***",
    isActive: true,
    status: "online" as const,
    lastChecked: new Date().toISOString(),
    transactionFee: 1.5,
  },
  {
    id: "2",
    name: "Flutterwave",
    publicKey: "FLWPUBK_TEST-***",
    secretKey: "FLWSECK_TEST-***",
    isActive: true,
    status: "online" as const,
    lastChecked: new Date().toISOString(),
    transactionFee: 1.4,
  },
  {
    id: "3",
    name: "Monnify",
    publicKey: "MK_TEST_***",
    secretKey: "MK_SECRET_***",
    isActive: false,
    status: "offline" as const,
    lastChecked: new Date(Date.now() - 7200000).toISOString(),
    transactionFee: 1.0,
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

    return NextResponse.json(mockPaymentGateways)
  } catch (error) {
    console.error("Payment gateways fetch error:", error)
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

    const { name, publicKey, secretKey, transactionFee } = await request.json()

    const newGateway = {
      id: generateId(),
      name,
      publicKey,
      secretKey,
      isActive: true,
      status: "online" as const,
      lastChecked: new Date().toISOString(),
      transactionFee,
    }

    mockPaymentGateways.push(newGateway)

    return NextResponse.json(newGateway, { status: 201 })
  } catch (error) {
    console.error("Add payment gateway error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
