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

    const { amount, gateway } = await request.json()

    if (!amount || amount < 100) {
      return NextResponse.json({ message: "Minimum funding amount is ₦100" }, { status: 400 })
    }

    // Generate payment reference
    const reference = `VTU_${generateId()}`

    try {
      let paymentResult

      // Get user details (in a real app, fetch from database)
      const userEmail = decoded.email || "user@example.com"
      const userName = "User Name" // Would fetch from database

      switch (gateway.toLowerCase()) {
        case "paystack":
          paymentResult = await apiManager.initializePayment("paystack", {
            email: userEmail,
            amount: amount * 100, // Convert to kobo
            reference: reference,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
          })
          break

        case "flutterwave":
          paymentResult = await apiManager.initializePayment("flutterwave", {
            tx_ref: reference,
            amount: amount,
            currency: "NGN",
            customer: {
              email: userEmail,
              phonenumber: "08012345678", // Would fetch from database
              name: userName,
            },
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
          })
          break

        case "monnify":
          paymentResult = await apiManager.initializePayment("monnify", {
            amount: amount,
            customerName: userName,
            customerEmail: userEmail,
            paymentReference: reference,
            paymentDescription: "Wallet Funding",
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
          })
          break

        default:
          return NextResponse.json({ message: "Invalid payment gateway" }, { status: 400 })
      }

      if (!paymentResult.success) {
        return NextResponse.json({ message: paymentResult.message || "Payment initialization failed" }, { status: 400 })
      }

      // Create pending transaction
      const transaction = {
        id: generateId(),
        userId: decoded.userId,
        type: "credit",
        amount,
        description: `Wallet funding via ${gateway}`,
        status: "pending",
        reference,
        gateway,
        createdAt: new Date().toISOString(),
      }

      // In a real app, save transaction to database
      console.log("Created funding transaction:", transaction)

      return NextResponse.json({
        reference,
        paymentUrl: paymentResult.authorization_url || paymentResult.link || paymentResult.checkoutUrl,
        message: "Payment initiated successfully",
      })
    } catch (error) {
      console.error("Payment API error:", error)

      // Fallback to mock payment URL for demo
      let paymentUrl = ""
      switch (gateway) {
        case "paystack":
          paymentUrl = `https://checkout.paystack.com/pay/${reference}`
          break
        case "flutterwave":
          paymentUrl = `https://checkout.flutterwave.com/v3/hosted/pay/${reference}`
          break
        case "monnify":
          paymentUrl = `https://monnify.com/pay/${reference}`
          break
        default:
          return NextResponse.json({ message: "Invalid payment gateway" }, { status: 400 })
      }

      // Create pending transaction
      const transaction = {
        id: generateId(),
        userId: decoded.userId,
        type: "credit",
        amount,
        description: `Wallet funding via ${gateway} (demo)`,
        status: "pending",
        reference,
        gateway,
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json({
        reference,
        paymentUrl,
        message: "Payment initiated successfully (demo mode)",
      })
    }
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
