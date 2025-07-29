"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("tx_ref") || searchParams.get("paymentReference")
    const status = searchParams.get("status")

    if (reference) {
      verifyPayment(reference, status)
    } else {
      setStatus("failed")
      setMessage("Invalid payment reference")
    }
  }, [searchParams])

  const verifyPayment = async (reference: string, paymentStatus: string | null) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference, status: paymentStatus }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setMessage("Payment successful! Your wallet has been credited.")
      } else {
        setStatus("failed")
        setMessage(data.message || "Payment verification failed")
      }
    } catch (error) {
      setStatus("failed")
      setMessage("Error verifying payment")
    }
  }

  const handleContinue = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />}
            {status === "success" && <CheckCircle className="h-16 w-16 text-green-600" />}
            {status === "failed" && <XCircle className="h-16 w-16 text-red-600" />}
          </div>
          <CardTitle>
            {status === "loading" && "Processing Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status !== "loading" && (
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
