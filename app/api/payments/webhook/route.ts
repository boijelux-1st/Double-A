import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Webhook handlers for payment confirmations
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature =
      request.headers.get("x-paystack-signature") ||
      request.headers.get("verif-hash") ||
      request.headers.get("x-monnify-signature")

    // Determine which gateway sent the webhook
    let gateway = "unknown"
    if (request.headers.get("x-paystack-signature")) {
      gateway = "paystack"
    } else if (request.headers.get("verif-hash")) {
      gateway = "flutterwave"
    } else if (request.headers.get("x-monnify-signature")) {
      gateway = "monnify"
    }

    // Verify webhook signature (implement based on gateway documentation)
    const isValidSignature = verifyWebhookSignature(gateway, body, signature)

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
    }

    const data = JSON.parse(body)

    // Process webhook based on gateway
    switch (gateway) {
      case "paystack":
        await handlePaystackWebhook(data)
        break
      case "flutterwave":
        await handleFlutterwaveWebhook(data)
        break
      case "monnify":
        await handleMonnifyWebhook(data)
        break
    }

    return NextResponse.json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 })
  }
}

function verifyWebhookSignature(gateway: string, body: string, signature: string | null): boolean {
  if (!signature) return false

  try {
    switch (gateway) {
      case "paystack":
        const paystackSecret = process.env.PAYSTACK_SECRET_KEY || ""
        const paystackHash = crypto.createHmac("sha512", paystackSecret).update(body).digest("hex")
        return paystackHash === signature

      case "flutterwave":
        const flutterwaveSecret = process.env.FLUTTERWAVE_SECRET_HASH || ""
        return signature === flutterwaveSecret

      case "monnify":
        // Monnify signature verification logic
        return true // Implement based on Monnify documentation

      default:
        return false
    }
  } catch (error) {
    console.error("Signature verification error:", error)
    return false
  }
}

async function handlePaystackWebhook(data: any) {
  if (data.event === "charge.success") {
    const { reference, amount, status } = data.data

    // Update transaction status in database
    console.log(`Paystack payment confirmed: ${reference}, Amount: ${amount / 100}, Status: ${status}`)

    // In a real app:
    // 1. Find transaction by reference
    // 2. Update transaction status to "completed"
    // 3. Credit user's wallet
    // 4. Send confirmation email/SMS
  }
}

async function handleFlutterwaveWebhook(data: any) {
  if (data.event === "charge.completed") {
    const { tx_ref, amount, status } = data.data

    console.log(`Flutterwave payment confirmed: ${tx_ref}, Amount: ${amount}, Status: ${status}`)

    // Similar processing as Paystack
  }
}

async function handleMonnifyWebhook(data: any) {
  if (data.eventType === "SUCCESSFUL_TRANSACTION") {
    const { paymentReference, amountPaid, paymentStatus } = data.eventData

    console.log(`Monnify payment confirmed: ${paymentReference}, Amount: ${amountPaid}, Status: ${paymentStatus}`)

    // Similar processing as other gateways
  }
}
