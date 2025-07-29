"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Database,
  Plus,
  Edit,
  Trash2,
  Key,
  Globe,
  User,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface DataEntry {
  id: string
  type: "wordpress_api" | "local_account" | "api_account" | "custom"
  name: string
  description: string
  data: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface WordPressAPI {
  url: string
  username: string
  password: string
  applicationPassword?: string
  version?: string
}

interface LocalAccount {
  username: string
  email: string
  password: string
  role: string
  permissions: string[]
  lastLogin?: string
}

interface APIAccount {
  provider: string
  apiKey: string
  secretKey?: string
  baseUrl: string
  version?: string
  rateLimit?: number
  endpoints: string[]
}

export default function DataManagementPage() {
  const [entries, setEntries] = useState<DataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("wordpress")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})

  // Form states
  const [wordpressForm, setWordpressForm] = useState<WordPressAPI>({
    url: "",
    username: "",
    password: "",
    applicationPassword: "",
    version: "6.0",
  })

  const [localAccountForm, setLocalAccountForm] = useState<LocalAccount>({
    username: "",
    email: "",
    password: "",
    role: "user",
    permissions: [],
  })

  const [apiAccountForm, setApiAccountForm] = useState<APIAccount>({
    provider: "",
    apiKey: "",
    secretKey: "",
    baseUrl: "",
    version: "1.0",
    rateLimit: 1000,
    endpoints: [],
  })

  const [customForm, setCustomForm] = useState({
    name: "",
    description: "",
    jsonData: "",
  })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/data-management", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
      setMessage("Error fetching data entries")
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (type: string, data: any, name: string, description: string) => {
    setSaving(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")
      const payload = {
        type,
        name,
        description,
        data,
        isActive: true,
      }

      const url = editingEntry ? `/api/admin/data-management/${editingEntry.id}` : "/api/admin/data-management"
      const method = editingEntry ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setMessage(`Entry ${editingEntry ? "updated" : "created"} successfully!`)
        setIsDialogOpen(false)
        setEditingEntry(null)
        resetForms()
        fetchEntries()
        setTimeout(() => setMessage(""), 3000)
      } else {
        const error = await response.json()
        setMessage(error.message || "Failed to save entry")
      }
    } catch (error) {
      console.error("Error saving entry:", error)
      setMessage("Error saving entry")
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/data-management/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setMessage("Entry deleted successfully!")
        fetchEntries()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
      setMessage("Error deleting entry")
    }
  }

  const toggleEntryStatus = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/data-management/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchEntries()
      }
    } catch (error) {
      console.error("Error toggling entry status:", error)
    }
  }

  const testConnection = async (entry: DataEntry) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/data-management/${entry.id}/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await response.json()
      setMessage(result.success ? "Connection successful!" : `Connection failed: ${result.message}`)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error testing connection:", error)
      setMessage("Error testing connection")
    }
  }

  const resetForms = () => {
    setWordpressForm({
      url: "",
      username: "",
      password: "",
      applicationPassword: "",
      version: "6.0",
    })
    setLocalAccountForm({
      username: "",
      email: "",
      password: "",
      role: "user",
      permissions: [],
    })
    setApiAccountForm({
      provider: "",
      apiKey: "",
      secretKey: "",
      baseUrl: "",
      version: "1.0",
      rateLimit: 1000,
      endpoints: [],
    })
    setCustomForm({
      name: "",
      description: "",
      jsonData: "",
    })
  }

  const editEntry = (entry: DataEntry) => {
    setEditingEntry(entry)
    setActiveTab(
      entry.type === "wordpress_api"
        ? "wordpress"
        : entry.type === "local_account"
          ? "local"
          : entry.type === "api_account"
            ? "api"
            : "custom",
    )

    if (entry.type === "wordpress_api") {
      setWordpressForm(entry.data)
    } else if (entry.type === "local_account") {
      setLocalAccountForm(entry.data)
    } else if (entry.type === "api_account") {
      setApiAccountForm(entry.data)
    } else {
      setCustomForm({
        name: entry.name,
        description: entry.description,
        jsonData: JSON.stringify(entry.data, null, 2),
      })
    }

    setIsDialogOpen(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage("Copied to clipboard!")
    setTimeout(() => setMessage(""), 2000)
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleWordPressSubmit = () => {
    if (!wordpressForm.url || !wordpressForm.username || !wordpressForm.password) {
      setMessage("Please fill in all required fields")
      return
    }
    saveEntry(
      "wordpress_api",
      wordpressForm,
      `WordPress - ${new URL(wordpressForm.url).hostname}`,
      `WordPress API for ${wordpressForm.url}`,
    )
  }

  const handleLocalAccountSubmit = () => {
    if (!localAccountForm.username || !localAccountForm.email || !localAccountForm.password) {
      setMessage("Please fill in all required fields")
      return
    }
    saveEntry(
      "local_account",
      localAccountForm,
      `Local Account - ${localAccountForm.username}`,
      `Local account for ${localAccountForm.email}`,
    )
  }

  const handleAPIAccountSubmit = () => {
    if (!apiAccountForm.provider || !apiAccountForm.apiKey || !apiAccountForm.baseUrl) {
      setMessage("Please fill in all required fields")
      return
    }
    saveEntry(
      "api_account",
      apiAccountForm,
      `${apiAccountForm.provider} API`,
      `API account for ${apiAccountForm.provider}`,
    )
  }

  const handleCustomSubmit = () => {
    if (!customForm.name || !customForm.jsonData) {
      setMessage("Please fill in all required fields")
      return
    }

    try {
      const parsedData = JSON.parse(customForm.jsonData)
      saveEntry("custom", parsedData, customForm.name, customForm.description)
    } catch (error) {
      setMessage("Invalid JSON data")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "wordpress_api":
        return <Globe className="h-4 w-4" />
      case "local_account":
        return <User className="h-4 w-4" />
      case "api_account":
        return <Key className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "wordpress_api":
        return "bg-blue-100 text-blue-800"
      case "local_account":
        return "bg-green-100 text-green-800"
      case "api_account":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
            <p className="text-gray-600">Manage WordPress APIs, local accounts, API accounts, and custom data</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchEntries} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingEntry(null)
                    resetForms()
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Data Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEntry ? "Edit Data Entry" : "Add New Data Entry"}</DialogTitle>
                  <DialogDescription>
                    Add or edit WordPress APIs, local accounts, API accounts, or custom data entries.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="wordpress" className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>WordPress</span>
                    </TabsTrigger>
                    <TabsTrigger value="local" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Local Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="api" className="flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>API Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span>Custom Data</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* WordPress API Form */}
                  <TabsContent value="wordpress" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wp-url">WordPress URL *</Label>
                        <Input
                          id="wp-url"
                          placeholder="https://example.com"
                          value={wordpressForm.url}
                          onChange={(e) => setWordpressForm((prev) => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wp-version">WordPress Version</Label>
                        <Input
                          id="wp-version"
                          placeholder="6.0"
                          value={wordpressForm.version}
                          onChange={(e) => setWordpressForm((prev) => ({ ...prev, version: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wp-username">Username *</Label>
                        <Input
                          id="wp-username"
                          placeholder="admin"
                          value={wordpressForm.username}
                          onChange={(e) => setWordpressForm((prev) => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wp-password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="wp-password"
                            type={showPasswords["wp-password"] ? "text" : "password"}
                            value={wordpressForm.password}
                            onChange={(e) => setWordpressForm((prev) => ({ ...prev, password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility("wp-password")}
                          >
                            {showPasswords["wp-password"] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="wp-app-password">Application Password (Optional)</Label>
                        <div className="relative">
                          <Input
                            id="wp-app-password"
                            type={showPasswords["wp-app-password"] ? "text" : "password"}
                            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                            value={wordpressForm.applicationPassword}
                            onChange={(e) =>
                              setWordpressForm((prev) => ({ ...prev, applicationPassword: e.target.value }))
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility("wp-app-password")}
                          >
                            {showPasswords["wp-app-password"] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleWordPressSubmit} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingEntry ? "Update WordPress API" : "Add WordPress API"}
                    </Button>
                  </TabsContent>

                  {/* Local Account Form */}
                  <TabsContent value="local" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="local-username">Username *</Label>
                        <Input
                          id="local-username"
                          placeholder="johndoe"
                          value={localAccountForm.username}
                          onChange={(e) => setLocalAccountForm((prev) => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="local-email">Email *</Label>
                        <Input
                          id="local-email"
                          type="email"
                          placeholder="john@example.com"
                          value={localAccountForm.email}
                          onChange={(e) => setLocalAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="local-password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="local-password"
                            type={showPasswords["local-password"] ? "text" : "password"}
                            value={localAccountForm.password}
                            onChange={(e) => setLocalAccountForm((prev) => ({ ...prev, password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility("local-password")}
                          >
                            {showPasswords["local-password"] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="local-role">Role</Label>
                        <Select
                          value={localAccountForm.role}
                          onValueChange={(value) => setLocalAccountForm((prev) => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="reseller">Reseller</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="local-permissions">Permissions (comma-separated)</Label>
                        <Input
                          id="local-permissions"
                          placeholder="read, write, delete, manage_users"
                          value={localAccountForm.permissions.join(", ")}
                          onChange={(e) =>
                            setLocalAccountForm((prev) => ({
                              ...prev,
                              permissions: e.target.value
                                .split(",")
                                .map((p) => p.trim())
                                .filter((p) => p),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={handleLocalAccountSubmit} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingEntry ? "Update Local Account" : "Add Local Account"}
                    </Button>
                  </TabsContent>

                  {/* API Account Form */}
                  <TabsContent value="api" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-provider">Provider *</Label>
                        <Input
                          id="api-provider"
                          placeholder="Paystack, Flutterwave, VTU.ng, etc."
                          value={apiAccountForm.provider}
                          onChange={(e) => setApiAccountForm((prev) => ({ ...prev, provider: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-base-url">Base URL *</Label>
                        <Input
                          id="api-base-url"
                          placeholder="https://api.provider.com"
                          value={apiAccountForm.baseUrl}
                          onChange={(e) => setApiAccountForm((prev) => ({ ...prev, baseUrl: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key *</Label>
                        <div className="relative">
                          <Input
                            id="api-key"
                            type={showPasswords["api-key"] ? "text" : "password"}
                            placeholder="sk_test_..."
                            value={apiAccountForm.apiKey}
                            onChange={(e) => setApiAccountForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility("api-key")}
                          >
                            {showPasswords["api-key"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-secret">Secret Key (Optional)</Label>
                        <div className="relative">
                          <Input
                            id="api-secret"
                            type={showPasswords["api-secret"] ? "text" : "password"}
                            placeholder="sk_secret_..."
                            value={apiAccountForm.secretKey}
                            onChange={(e) => setApiAccountForm((prev) => ({ ...prev, secretKey: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility("api-secret")}
                          >
                            {showPasswords["api-secret"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-version">API Version</Label>
                        <Input
                          id="api-version"
                          placeholder="v1, v2, 2023-01-01"
                          value={apiAccountForm.version}
                          onChange={(e) => setApiAccountForm((prev) => ({ ...prev, version: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-rate-limit">Rate Limit (requests/hour)</Label>
                        <Input
                          id="api-rate-limit"
                          type="number"
                          placeholder="1000"
                          value={apiAccountForm.rateLimit}
                          onChange={(e) =>
                            setApiAccountForm((prev) => ({ ...prev, rateLimit: Number(e.target.value) }))
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="api-endpoints">Available Endpoints (comma-separated)</Label>
                        <Textarea
                          id="api-endpoints"
                          placeholder="/transactions, /balance, /purchase, /verify"
                          value={apiAccountForm.endpoints.join(", ")}
                          onChange={(e) =>
                            setApiAccountForm((prev) => ({
                              ...prev,
                              endpoints: e.target.value
                                .split(",")
                                .map((e) => e.trim())
                                .filter((e) => e),
                            }))
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAPIAccountSubmit} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingEntry ? "Update API Account" : "Add API Account"}
                    </Button>
                  </TabsContent>

                  {/* Custom Data Form */}
                  <TabsContent value="custom" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="custom-name">Name *</Label>
                        <Input
                          id="custom-name"
                          placeholder="Custom Integration Name"
                          value={customForm.name}
                          onChange={(e) => setCustomForm((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-description">Description</Label>
                        <Input
                          id="custom-description"
                          placeholder="Description of this custom data entry"
                          value={customForm.description}
                          onChange={(e) => setCustomForm((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-json">JSON Data *</Label>
                        <Textarea
                          id="custom-json"
                          placeholder='{"key": "value", "config": {...}}'
                          value={customForm.jsonData}
                          onChange={(e) => setCustomForm((prev) => ({ ...prev, jsonData: e.target.value }))}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-sm text-gray-500">Enter valid JSON data for your custom integration</p>
                      </div>
                    </div>
                    <Button onClick={handleCustomSubmit} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingEntry ? "Update Custom Data" : "Add Custom Data"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
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

        {/* Data Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Entries ({entries.length})</span>
            </CardTitle>
            <CardDescription>
              Manage all your data entries including APIs, accounts, and custom integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge className={getTypeColor(entry.type)}>
                        {getTypeIcon(entry.type)}
                        <span className="ml-1">
                          {entry.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                    <TableCell>
                      <Badge variant={entry.isActive ? "default" : "secondary"}>
                        {entry.isActive ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(entry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testConnection(entry)}
                          title="Test Connection"
                        >
                          <Server className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => editEntry(entry)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleEntryStatus(entry.id, entry.isActive)}
                          title={entry.isActive ? "Deactivate" : "Activate"}
                        >
                          {entry.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteEntry(entry.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No data entries found. Click "Add Data Entry" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
