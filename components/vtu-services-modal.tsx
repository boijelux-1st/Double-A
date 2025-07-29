"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Smartphone } from "lucide-react"

interface VTUServicesModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  walletBalance: number
}

export default function VTUServicesModal({ open, onClose, onSuccess, walletBalance }: VTUServicesModalProps) {
  const [serviceType, setServiceType] = useState("airtime")
  const [network, setNetwork] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [dataBundle, setDataBundle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const networks = [
    { value: "mtn", label: "MTN" },
    { value: "glo", label: "Glo" },
    { value: "airtel", label: "Airtel" },
    { value: "9mobile", label: "9mobile" },
  ]

  const dataBundles = [
    { value: "1gb_30days", label: "1GB - 30 Days", price: 300 },
    { value: "2gb_30days", label: "2GB - 30 Days", price: 600 },
    { value: "5gb_30days", label: "5GB - 30 Days", price: 1500 },
    { value: "10gb_30days", label: "10GB - 30 Days", price: 3000 },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const purchaseAmount =
      serviceType === "airtime"
        ? Number.parseFloat(amount)
        : dataBundles.find((bundle) => bundle.value === dataBundle)?.price || 0

    if (purchaseAmount > walletBalance) {
      setError("Insufficient wallet balance")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/vtu/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType,
          network,
          phoneNumber,
          amount: purchaseAmount,
          dataBundle: serviceType === "data" ? dataBundle : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        setError(data.message || "Purchase failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNetwork("")
    setPhoneNumber("")
    setAmount("")
    setDataBundle("")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>VTU Services</span>
          </DialogTitle>
          <DialogDescription>Buy airtime or data bundles instantly</DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Wallet Balance: <span className="font-semibold">₦{walletBalance.toLocaleString()}</span>
          </p>
        </div>

        <Tabs value={serviceType} onValueChange={setServiceType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="airtime">Airtime</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select value={network} onValueChange={setNetwork} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((net) => (
                    <SelectItem key={net.value} value={net.value}>
                      {net.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <TabsContent value="airtime" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="50"
                  required
                />
                <p className="text-xs text-gray-500">Minimum: ₦50</p>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="dataBundle">Data Bundle</Label>
                <Select value={dataBundle} onValueChange={setDataBundle} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data bundle" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataBundles.map((bundle) => (
                      <SelectItem key={bundle.value} value={bundle.value}>
                        {bundle.label} - ₦{bundle.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Purchase
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
