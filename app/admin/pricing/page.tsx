"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DollarSign, Save, Plus, Edit, Trash2, CheckCircle, AlertCircle, Loader2, Smartphone, Wifi } from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface PricingRule {
  id: string
  serviceType: "airtime" | "data"
  network: string
  planName?: string
  buyingPrice: number
  sellingPrice: number
  commission: number
  isActive: boolean
  userType: "all" | "user" | "reseller"
  createdAt: string
}

interface CommissionSettings {
  airtimeCommission: number
  dataCommission: number
  resellerDiscount: number
  minimumProfit: number
  autoCalculatePrice: boolean
}

export default function AdminPricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
    airtimeCommission: 2.5,
    dataCommission: 3.0,
    resellerDiscount: 5.0,
    minimumProfit: 10,
    autoCalculatePrice: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // New rule form
  const [newRule, setNewRule] = useState({
    serviceType: "airtime" as "airtime" | "data",
    network: "",
    planName: "",
    buyingPrice: 0,
    sellingPrice: 0,
    userType: "all" as "all" | "user" | "reseller",
  })

  const networks = [
    { value: "mtn", label: "MTN" },
    { value: "glo", label: "Glo" },
    { value: "airtel", label: "Airtel" },
    { value: "9mobile", label: "9mobile" },
  ]

  const dataPlan = [
    { value: "1gb_30days", label: "1GB - 30 Days" },
    { value: "2gb_30days", label: "2GB - 30 Days" },
    { value: "5gb_30days", label: "5GB - 30 Days" },
    { value: "10gb_30days", label: "10GB - 30 Days" },
    { value: "15gb_30days", label: "15GB - 30 Days" },
    { value: "20gb_30days", label: "20GB - 30 Days" },
  ]

  useEffect(() => {
    fetchPricingData()
  }, [])

  const fetchPricingData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch pricing rules
      const rulesResponse = await fetch("/api/admin/pricing/rules", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json()
        setPricingRules(rulesData)
      }

      // Fetch commission settings
      const settingsResponse = await fetch("/api/admin/pricing/settings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setCommissionSettings(settingsData)
      }
    } catch (error) {
      console.error("Error fetching pricing data:", error)
      setError("Failed to load pricing data")
    } finally {
      setLoading(false)
    }
  }

  const saveCommissionSettings = async () => {
    setSaving(true)
    setMessage("")
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/pricing/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commissionSettings),
      })

      if (response.ok) {
        setMessage("Commission settings updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setError("Failed to update commission settings")
      }
    } catch (error) {
      console.error("Error updating commission settings:", error)
      setError("Error updating commission settings")
    } finally {
      setSaving(false)
    }
  }

  const addPricingRule = async () => {
    setSaving(true)
    setMessage("")
    setError("")

    const commission = ((newRule.sellingPrice - newRule.buyingPrice) / newRule.buyingPrice) * 100

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/pricing/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newRule,
          commission,
          isActive: true,
        }),
      })

      if (response.ok) {
        const newRuleData = await response.json()
        setPricingRules([...pricingRules, newRuleData])
        setMessage("Pricing rule added successfully!")
        setShowAddDialog(false)
        setNewRule({
          serviceType: "airtime",
          network: "",
          planName: "",
          buyingPrice: 0,
          sellingPrice: 0,
          userType: "all",
        })
        setTimeout(() => setMessage(""), 3000)
      } else {
        setError("Failed to add pricing rule")
      }
    } catch (error) {
      console.error("Error adding pricing rule:", error)
      setError("Error adding pricing rule")
    } finally {
      setSaving(false)
    }
  }

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/pricing/rules/${ruleId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setPricingRules(pricingRules.map((rule) => (rule.id === ruleId ? { ...rule, isActive } : rule)))
      }
    } catch (error) {
      console.error("Error toggling rule status:", error)
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this pricing rule?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/pricing/rules/${ruleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setPricingRules(pricingRules.filter((rule) => rule.id !== ruleId))
        setMessage("Pricing rule deleted successfully!")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting rule:", error)
      setError("Error deleting rule")
    }
  }

  const calculateCommission = (buyingPrice: number, sellingPrice: number) => {
    if (buyingPrice === 0) return 0
    return ((sellingPrice - buyingPrice) / buyingPrice) * 100
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
            <p className="text-gray-600">Manage VTU pricing, commissions, and profit margins</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-900 hover:bg-blue-800">
                <Plus className="mr-2 h-4 w-4" />
                Add Pricing Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Pricing Rule</DialogTitle>
                <DialogDescription>Create a new pricing rule for VTU services</DialogDescription>
              </DialogHeader>
              <AddPricingRuleForm
                newRule={newRule}
                setNewRule={setNewRule}
                networks={networks}
                dataPlan={dataPlan}
                onSave={addPricingRule}
                saving={saving}
                calculateCommission={calculateCommission}
              />
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="commission" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="commission" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Commission Settings</span>
            </TabsTrigger>
            <TabsTrigger value="airtime" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Airtime Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>Data Pricing</span>
            </TabsTrigger>
          </TabsList>

          {/* Commission Settings Tab */}
          <TabsContent value="commission" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Commission & Profit Settings</span>
                </CardTitle>
                <CardDescription>Configure default commission rates and profit margins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="airtimeCommission">Default Airtime Commission (%)</Label>
                    <Input
                      id="airtimeCommission"
                      type="number"
                      step="0.1"
                      value={commissionSettings.airtimeCommission}
                      onChange={(e) =>
                        setCommissionSettings({
                          ...commissionSettings,
                          airtimeCommission: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataCommission">Default Data Commission (%)</Label>
                    <Input
                      id="dataCommission"
                      type="number"
                      step="0.1"
                      value={commissionSettings.dataCommission}
                      onChange={(e) =>
                        setCommissionSettings({
                          ...commissionSettings,
                          dataCommission: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resellerDiscount">Reseller Discount (%)</Label>
                    <Input
                      id="resellerDiscount"
                      type="number"
                      step="0.1"
                      value={commissionSettings.resellerDiscount}
                      onChange={(e) =>
                        setCommissionSettings({
                          ...commissionSettings,
                          resellerDiscount: Number.parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumProfit">Minimum Profit (₦)</Label>
                    <Input
                      id="minimumProfit"
                      type="number"
                      value={commissionSettings.minimumProfit}
                      onChange={(e) =>
                        setCommissionSettings({
                          ...commissionSettings,
                          minimumProfit: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoCalculatePrice">Auto-Calculate Selling Price</Label>
                    <p className="text-sm text-gray-500">Automatically calculate selling price based on commission</p>
                  </div>
                  <Switch
                    id="autoCalculatePrice"
                    checked={commissionSettings.autoCalculatePrice}
                    onCheckedChange={(checked) =>
                      setCommissionSettings({ ...commissionSettings, autoCalculatePrice: checked })
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveCommissionSettings} disabled={saving} className="bg-blue-900 hover:bg-blue-800">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Airtime Pricing Tab */}
          <TabsContent value="airtime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Airtime Pricing Rules</CardTitle>
                <CardDescription>Manage airtime pricing for different networks and user types</CardDescription>
              </CardHeader>
              <CardContent>
                <PricingTable
                  rules={pricingRules.filter((rule) => rule.serviceType === "airtime")}
                  onToggleStatus={toggleRuleStatus}
                  onDelete={deleteRule}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Pricing Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Pricing Rules</CardTitle>
                <CardDescription>Manage data bundle pricing for different networks and plans</CardDescription>
              </CardHeader>
              <CardContent>
                <PricingTable
                  rules={pricingRules.filter((rule) => rule.serviceType === "data")}
                  onToggleStatus={toggleRuleStatus}
                  onDelete={deleteRule}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

// Add Pricing Rule Form Component
function AddPricingRuleForm({ newRule, setNewRule, networks, dataPlan, onSave, saving, calculateCommission }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serviceType">Service Type</Label>
          <Select value={newRule.serviceType} onValueChange={(value) => setNewRule({ ...newRule, serviceType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="airtime">Airtime</SelectItem>
              <SelectItem value="data">Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="network">Network</Label>
          <Select value={newRule.network} onValueChange={(value) => setNewRule({ ...newRule, network: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network: any) => (
                <SelectItem key={network.value} value={network.value}>
                  {network.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {newRule.serviceType === "data" && (
        <div className="space-y-2">
          <Label htmlFor="planName">Data Plan</Label>
          <Select value={newRule.planName} onValueChange={(value) => setNewRule({ ...newRule, planName: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select data plan" />
            </SelectTrigger>
            <SelectContent>
              {dataPlan.map((plan: any) => (
                <SelectItem key={plan.value} value={plan.value}>
                  {plan.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buyingPrice">Buying Price (₦)</Label>
          <Input
            id="buyingPrice"
            type="number"
            value={newRule.buyingPrice}
            onChange={(e) => setNewRule({ ...newRule, buyingPrice: Number.parseFloat(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price (₦)</Label>
          <Input
            id="sellingPrice"
            type="number"
            value={newRule.sellingPrice}
            onChange={(e) => setNewRule({ ...newRule, sellingPrice: Number.parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="userType">User Type</Label>
        <Select value={newRule.userType} onValueChange={(value) => setNewRule({ ...newRule, userType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="user">Regular Users</SelectItem>
            <SelectItem value="reseller">Resellers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {newRule.buyingPrice > 0 && newRule.sellingPrice > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Commission:{" "}
            <span className="font-semibold">
              {calculateCommission(newRule.buyingPrice, newRule.sellingPrice).toFixed(2)}%
            </span>
          </p>
          <p className="text-sm text-blue-800">
            Profit: <span className="font-semibold">₦{(newRule.sellingPrice - newRule.buyingPrice).toFixed(2)}</span>
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving} className="bg-blue-900 hover:bg-blue-800">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Rule
        </Button>
      </div>
    </div>
  )
}

// Pricing Table Component
function PricingTable({ rules, onToggleStatus, onDelete }: any) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Network</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Buying Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No pricing rules found
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule: PricingRule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.network.toUpperCase()}</TableCell>
                <TableCell>{rule.planName || "All Plans"}</TableCell>
                <TableCell>₦{rule.buyingPrice.toLocaleString()}</TableCell>
                <TableCell>₦{rule.sellingPrice.toLocaleString()}</TableCell>
                <TableCell>{rule.commission.toFixed(2)}%</TableCell>
                <TableCell className="capitalize">{rule.userType}</TableCell>
                <TableCell>
                  <Switch checked={rule.isActive} onCheckedChange={(checked) => onToggleStatus(rule.id, checked)} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDelete(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
