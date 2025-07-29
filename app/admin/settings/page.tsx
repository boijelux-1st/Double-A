"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  DollarSign,
  Bell,
  Database,
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface PlatformSettings {
  general: {
    platformName: string
    platformDescription: string
    supportEmail: string
    supportPhone: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    defaultUserRole: string
  }
  pricing: {
    airtimeCommission: number
    dataCommission: number
    minimumFunding: number
    maximumFunding: number
    transactionFee: number
    resellerDiscount: number
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    transactionAlerts: boolean
    systemAlerts: boolean
    marketingEmails: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireStrongPassword: boolean
    ipWhitelist: string[]
  }
  integrations: {
    defaultVTUProvider: string
    defaultPaymentGateway: string
    webhookUrl: string
    apiRateLimit: number
    enableAPILogging: boolean
  }
  appearance: {
    primaryColor: string
    secondaryColor: string
    logoUrl: string
    faviconUrl: string
    customCSS: string
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
      platformName: "VTU Platform",
      platformDescription: "Your complete VTU solution for airtime, data, and bill payments",
      supportEmail: "support@vtuplatform.com",
      supportPhone: "+234-800-123-4567",
      maintenanceMode: false,
      registrationEnabled: true,
      defaultUserRole: "user",
    },
    pricing: {
      airtimeCommission: 2.5,
      dataCommission: 3.0,
      minimumFunding: 100,
      maximumFunding: 500000,
      transactionFee: 0.5,
      resellerDiscount: 5.0,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      transactionAlerts: true,
      systemAlerts: true,
      marketingEmails: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
      ipWhitelist: [],
    },
    integrations: {
      defaultVTUProvider: "vtu.ng",
      defaultPaymentGateway: "paystack",
      webhookUrl: "",
      apiRateLimit: 100,
      enableAPILogging: true,
    },
    appearance: {
      primaryColor: "#3b82f6",
      secondaryColor: "#64748b",
      logoUrl: "",
      faviconUrl: "",
      customCSS: "",
    },
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage("Settings saved successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof PlatformSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const addIPToWhitelist = () => {
    const ip = prompt("Enter IP address to whitelist:")
    if (ip && ip.trim()) {
      setSettings((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          ipWhitelist: [...prev.security.ipWhitelist, ip.trim()],
        },
      }))
    }
  }

  const removeIPFromWhitelist = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        ipWhitelist: prev.security.ipWhitelist.filter((_, i) => i !== index),
      },
    }))
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
            <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600">Configure your VTU platform settings and preferences</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchSettings} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={message.includes("successfully") ? "border-green-200 bg-green-50" : ""}>
            {message.includes("successfully") ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>Basic platform configuration and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.general.platformName}
                      onChange={(e) => updateSetting("general", "platformName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={settings.general.supportPhone}
                      onChange={(e) => updateSetting("general", "supportPhone", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultUserRole">Default User Role</Label>
                    <Select
                      value={settings.general.defaultUserRole}
                      onValueChange={(value) => updateSetting("general", "defaultUserRole", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="reseller">Reseller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformDescription">Platform Description</Label>
                  <Textarea
                    id="platformDescription"
                    value={settings.general.platformDescription}
                    onChange={(e) => updateSetting("general", "platformDescription", e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Platform Status</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Temporarily disable platform access</p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => updateSetting("general", "maintenanceMode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registrationEnabled">User Registration</Label>
                      <p className="text-sm text-gray-500">Allow new users to register</p>
                    </div>
                    <Switch
                      id="registrationEnabled"
                      checked={settings.general.registrationEnabled}
                      onCheckedChange={(checked) => updateSetting("general", "registrationEnabled", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Settings */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing & Commission</span>
                </CardTitle>
                <CardDescription>Configure pricing, commissions, and transaction limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="airtimeCommission">Airtime Commission (%)</Label>
                    <Input
                      id="airtimeCommission"
                      type="number"
                      step="0.1"
                      value={settings.pricing.airtimeCommission}
                      onChange={(e) => updateSetting("pricing", "airtimeCommission", Number.parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataCommission">Data Commission (%)</Label>
                    <Input
                      id="dataCommission"
                      type="number"
                      step="0.1"
                      value={settings.pricing.dataCommission}
                      onChange={(e) => updateSetting("pricing", "dataCommission", Number.parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumFunding">Minimum Funding (₦)</Label>
                    <Input
                      id="minimumFunding"
                      type="number"
                      value={settings.pricing.minimumFunding}
                      onChange={(e) => updateSetting("pricing", "minimumFunding", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximumFunding">Maximum Funding (₦)</Label>
                    <Input
                      id="maximumFunding"
                      type="number"
                      value={settings.pricing.maximumFunding}
                      onChange={(e) => updateSetting("pricing", "maximumFunding", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                    <Input
                      id="transactionFee"
                      type="number"
                      step="0.1"
                      value={settings.pricing.transactionFee}
                      onChange={(e) => updateSetting("pricing", "transactionFee", Number.parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resellerDiscount">Reseller Discount (%)</Label>
                    <Input
                      id="resellerDiscount"
                      type="number"
                      step="0.1"
                      value={settings.pricing.resellerDiscount}
                      onChange={(e) => updateSetting("pricing", "resellerDiscount", Number.parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Configure notification preferences and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Send notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Send notifications via SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "smsNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Send browser push notifications</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "pushNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="transactionAlerts">Transaction Alerts</Label>
                      <p className="text-sm text-gray-500">Alert users about transaction status</p>
                    </div>
                    <Switch
                      id="transactionAlerts"
                      checked={settings.notifications.transactionAlerts}
                      onCheckedChange={(checked) => updateSetting("notifications", "transactionAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemAlerts">System Alerts</Label>
                      <p className="text-sm text-gray-500">Send system maintenance and update alerts</p>
                    </div>
                    <Switch
                      id="systemAlerts"
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateSetting("notifications", "systemAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Send promotional and marketing emails</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={settings.notifications.marketingEmails}
                      onCheckedChange={(checked) => updateSetting("notifications", "marketingEmails", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>Configure security policies and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting("security", "sessionTimeout", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting("security", "maxLoginAttempts", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Password Min Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting("security", "passwordMinLength", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireStrongPassword">Strong Password Policy</Label>
                      <p className="text-sm text-gray-500">Require uppercase, lowercase, numbers, and symbols</p>
                    </div>
                    <Switch
                      id="requireStrongPassword"
                      checked={settings.security.requireStrongPassword}
                      onCheckedChange={(checked) => updateSetting("security", "requireStrongPassword", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>IP Whitelist</Label>
                    <Button size="sm" onClick={addIPToWhitelist}>
                      Add IP
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {settings.security.ipWhitelist.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button size="sm" variant="outline" onClick={() => removeIPFromWhitelist(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    {settings.security.ipWhitelist.length === 0 && (
                      <p className="text-sm text-gray-500">No IP addresses whitelisted</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>API Integrations</span>
                </CardTitle>
                <CardDescription>Configure third-party API integrations and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultVTUProvider">Default VTU Provider</Label>
                    <Select
                      value={settings.integrations.defaultVTUProvider}
                      onValueChange={(value) => updateSetting("integrations", "defaultVTUProvider", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vtu.ng">VTU.ng</SelectItem>
                        <SelectItem value="easyaccess">EasyAccess</SelectItem>
                        <SelectItem value="clubkonnect">ClubKonnect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultPaymentGateway">Default Payment Gateway</Label>
                    <Select
                      value={settings.integrations.defaultPaymentGateway}
                      onValueChange={(value) => updateSetting("integrations", "defaultPaymentGateway", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paystack">Paystack</SelectItem>
                        <SelectItem value="flutterwave">Flutterwave</SelectItem>
                        <SelectItem value="monnify">Monnify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={settings.integrations.apiRateLimit}
                      onChange={(e) => updateSetting("integrations", "apiRateLimit", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://your-domain.com/webhook"
                    value={settings.integrations.webhookUrl}
                    onChange={(e) => updateSetting("integrations", "webhookUrl", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAPILogging">API Logging</Label>
                    <p className="text-sm text-gray-500">Log all API requests and responses</p>
                  </div>
                  <Switch
                    id="enableAPILogging"
                    checked={settings.integrations.enableAPILogging}
                    onCheckedChange={(checked) => updateSetting("integrations", "enableAPILogging", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Appearance & Branding</span>
                </CardTitle>
                <CardDescription>Customize the look and feel of your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting("appearance", "primaryColor", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting("appearance", "primaryColor", e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.appearance.secondaryColor}
                        onChange={(e) => updateSetting("appearance", "secondaryColor", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.appearance.secondaryColor}
                        onChange={(e) => updateSetting("appearance", "secondaryColor", e.target.value)}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      placeholder="https://your-domain.com/logo.png"
                      value={settings.appearance.logoUrl}
                      onChange={(e) => updateSetting("appearance", "logoUrl", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <Input
                      id="faviconUrl"
                      placeholder="https://your-domain.com/favicon.ico"
                      value={settings.appearance.faviconUrl}
                      onChange={(e) => updateSetting("appearance", "faviconUrl", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <Textarea
                    id="customCSS"
                    placeholder="/* Add your custom CSS here */"
                    value={settings.appearance.customCSS}
                    onChange={(e) => updateSetting("appearance", "customCSS", e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
