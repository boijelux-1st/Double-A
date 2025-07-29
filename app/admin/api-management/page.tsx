"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface VTUProvider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  isActive: boolean
  priority: number
  status: "online" | "offline" | "error"
  lastChecked: string
  successRate: number
  responseTime: number
}

interface PaymentGateway {
  id: string
  name: string
  publicKey: string
  secretKey: string
  isActive: boolean
  status: "online" | "offline" | "error"
  lastChecked: string
  transactionFee: number
}

export default function APIManagementPage() {
  const [vtuProviders, setVtuProviders] = useState<VTUProvider[]>([])
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingProvider, setEditingProvider] = useState<VTUProvider | null>(null)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)

  useEffect(() => {
    fetchAPIData()
  }, [])

  const fetchAPIData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch VTU providers
      const vtuResponse = await fetch("/api/admin/vtu-providers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (vtuResponse.ok) {
        const vtuData = await vtuResponse.json()
        setVtuProviders(vtuData)
      }

      // Fetch payment gateways
      const paymentResponse = await fetch("/api/admin/payment-gateways", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        setPaymentGateways(paymentData)
      }
    } catch (error) {
      console.error("Error fetching API data:", error)
      setError("Failed to load API configurations")
    } finally {
      setLoading(false)
    }
  }

  const toggleProviderStatus = async (providerId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/vtu-providers/${providerId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setVtuProviders((prev) =>
          prev.map((provider) => (provider.id === providerId ? { ...provider, isActive } : provider)),
        )
      }
    } catch (error) {
      console.error("Error toggling provider:", error)
    }
  }

  const toggleGatewayStatus = async (gatewayId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/payment-gateways/${gatewayId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setPaymentGateways((prev) =>
          prev.map((gateway) => (gateway.id === gatewayId ? { ...gateway, isActive } : gateway)),
        )
      }
    } catch (error) {
      console.error("Error toggling gateway:", error)
    }
  }

  const testAPIConnection = async (type: "vtu" | "payment", id: string) => {
    try {
      const token = localStorage.getItem("token")
      const endpoint = type === "vtu" ? "vtu-providers" : "payment-gateways"

      const response = await fetch(`/api/admin/${endpoint}/${id}/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await response.json()

      if (type === "vtu") {
        setVtuProviders((prev) =>
          prev.map((provider) =>
            provider.id === id
              ? { ...provider, status: result.success ? "online" : "error", lastChecked: new Date().toISOString() }
              : provider,
          ),
        )
      } else {
        setPaymentGateways((prev) =>
          prev.map((gateway) =>
            gateway.id === id
              ? { ...gateway, status: result.success ? "online" : "error", lastChecked: new Date().toISOString() }
              : gateway,
          ),
        )
      }
    } catch (error) {
      console.error("Error testing API:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offline":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600">Manage VTU providers and payment gateways</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="vtu-providers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="vtu-providers">VTU Providers</TabsTrigger>
            <TabsTrigger value="payment-gateways">Payment Gateways</TabsTrigger>
            <TabsTrigger value="api-logs">API Logs</TabsTrigger>
          </TabsList>

          {/* VTU Providers Tab */}
          <TabsContent value="vtu-providers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">VTU API Providers</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Provider
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add VTU Provider</DialogTitle>
                    <DialogDescription>Configure a new VTU API provider</DialogDescription>
                  </DialogHeader>
                  <AddProviderForm onSuccess={fetchAPIData} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {vtuProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(provider.status)}
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(provider.status)}>{provider.status.toUpperCase()}</Badge>
                        <Badge variant="outline">Priority: {provider.priority}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={provider.isActive}
                          onCheckedChange={(checked) => toggleProviderStatus(provider.id, checked)}
                        />
                        <Button variant="outline" size="sm" onClick={() => testAPIConnection("vtu", provider.id)}>
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{provider.baseUrl}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-500">Success Rate</p>
                        <p className="text-lg font-semibold text-green-600">{provider.successRate}%</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Response Time</p>
                        <p className="text-lg font-semibold">{provider.responseTime}ms</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Last Checked</p>
                        <p className="text-sm">{new Date(provider.lastChecked).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payment Gateways Tab */}
          <TabsContent value="payment-gateways" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Payment Gateways</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Gateway
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Gateway</DialogTitle>
                    <DialogDescription>Configure a new payment gateway</DialogDescription>
                  </DialogHeader>
                  <AddGatewayForm onSuccess={fetchAPIData} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {paymentGateways.map((gateway) => (
                <Card key={gateway.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(gateway.status)}
                          <CardTitle className="text-lg">{gateway.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(gateway.status)}>{gateway.status.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={gateway.isActive}
                          onCheckedChange={(checked) => toggleGatewayStatus(gateway.id, checked)}
                        />
                        <Button variant="outline" size="sm" onClick={() => testAPIConnection("payment", gateway.id)}>
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-500">Transaction Fee</p>
                        <p className="text-lg font-semibold">{gateway.transactionFee}%</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Last Checked</p>
                        <p className="text-sm">{new Date(gateway.lastChecked).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Logs Tab */}
          <TabsContent value="api-logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent API Activity</CardTitle>
                <CardDescription>Monitor API calls and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">VTU.ng - Airtime Purchase</p>
                        <p className="text-sm text-gray-500">MTN ₦500 - Success (234ms)</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2 minutes ago</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Paystack - Payment Verification</p>
                        <p className="text-sm text-gray-500">₦10,000 funding - Success (156ms)</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">5 minutes ago</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">EasyAccess - Data Purchase</p>
                        <p className="text-sm text-gray-500">GLO 5GB - Failed (timeout)</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">8 minutes ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

// Add Provider Form Component
function AddProviderForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
    priority: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/vtu-providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        setFormData({ name: "", baseUrl: "", apiKey: "", priority: 1 })
      }
    } catch (error) {
      console.error("Error adding provider:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Provider Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseUrl">Base URL</Label>
        <Input
          id="baseUrl"
          value={formData.baseUrl}
          onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Input
          id="priority"
          type="number"
          min="1"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) })}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Add Provider
      </Button>
    </form>
  )
}

// Add Gateway Form Component
function AddGatewayForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    publicKey: "",
    secretKey: "",
    transactionFee: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/payment-gateways", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        setFormData({ name: "", publicKey: "", secretKey: "", transactionFee: 0 })
      }
    } catch (error) {
      console.error("Error adding gateway:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Gateway Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publicKey">Public Key</Label>
        <Input
          id="publicKey"
          value={formData.publicKey}
          onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secretKey">Secret Key</Label>
        <Input
          id="secretKey"
          type="password"
          value={formData.secretKey}
          onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
        <Input
          id="transactionFee"
          type="number"
          step="0.01"
          min="0"
          value={formData.transactionFee}
          onChange={(e) => setFormData({ ...formData, transactionFee: Number.parseFloat(e.target.value) })}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Add Gateway
      </Button>
    </form>
  )
}
