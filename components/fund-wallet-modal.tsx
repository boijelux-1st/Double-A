"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard } from "lucide-react"

interface FundWalletModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function FundWalletModal({ open, onClose, onSuccess }: FundWalletModalProps) {
  const [amount, setAmount] = useState("")
  const [gateway, setGateway] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/payments/fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          gateway,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to payment gateway
        if (data.paymentUrl) {
          window.open(data.paymentUrl, "_blank")
        }
        onSuccess()
        onClose()
        setAmount("")
        setGateway("")
      } else {
        setError(data.message || "Failed to initiate payment")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Fund Wallet</span>
          </DialogTitle>
          <DialogDescription>Add money to your wallet using your preferred payment method</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              required
            />
            <p className="text-xs text-gray-500">Minimum amount: ₦100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gateway">Payment Gateway</Label>
            <Select value={gateway} onValueChange={setGateway} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="monnify">Monnify (Bank Transfer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed to Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
