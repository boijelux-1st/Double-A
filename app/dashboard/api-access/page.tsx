"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { Key, Copy, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Book, Activity } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface APIKey {
  id: string
  name: string
  key: string
  isActive: boolean
  lastUsed: string | null
  requestCount: number
  rateLimit: number
  createdAt: string
}

interface APIUsage {
  date: string
  requests: number
  successful: number
  failed: number
}

export default function APIAccessPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [usage, setUsage] = useState<APIUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [newKeyName, setNewKeyName] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchAPIData()
  }, [])

  const fetchAPIData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch API keys
      const keysResponse = await fetch("/api/user/api-keys", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (keysResponse.ok) {
        const keysData = await keysResponse.json()
        setApiKeys(keysData)
      }

      // Fetch usage statistics
      const usageResponse = await fetch("/api/user/api-usage", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setUsage(usageData)
      }
    } catch (error) {
      console.error("Error fetching API data:", error)
      setError("Failed to load API data")
    } finally {
      setLoading(false)
    }
  }

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      setError("Please enter a name for your API key")
      return
    }

    setCreating(true)
    setMessage("")
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const newKey = await response.json()
        setApiKeys([...apiKeys, newKey])
        setMessage("API key created successfully!")
        setNewKeyName("")
        setShowCreateDialog(false)
        setTimeout(() => setMessage(""), 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create API key")
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      setError("Error creating API key")
    } finally {
      setCreating(false)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys({ ...showKeys, [keyId]: !showKeys[keyId] })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage("Copied to clipboard!")
    setTimeout(() => setMessage(""), 2000)
  }

  const regenerateKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to regenerate this API key? The old key will stop working immediately.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/user/api-keys/${keyId}/regenerate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const updatedKey = await response.json()
        setApiKeys(apiKeys.map((key) => (key.id === keyId ? updatedKey : key)))
        setMessage("API key regenerated successfully!")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error regenerating API key:", error)
      setError("Error regenerating API key")
    }
  }

  const deleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== keyId))
        setMessage("API key deleted successfully!")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      setError("Error deleting API key")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Access</h1>
            <p className="text-gray-600">Manage your API keys and integrate with Double A Data Center services</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-900 hover:bg-blue-800">
                <Key className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key to access Double A Data Center services programmatically
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">API Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., My Mobile App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAPIKey} disabled={creating} className="bg-blue-900 hover:bg-blue-800">
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                    Create Key
                  </Button>
                </div>
              </div>
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

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="keys" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Usage</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>Documentation</span>
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Your API Keys</span>
                </CardTitle>
                <CardDescription>Manage your API keys for accessing Double A Data Center services</CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first API key to start integrating with our services
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-900 hover:bg-blue-800">
                      <Key className="mr-2 h-4 w-4" />
                      Create API Key
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                            <p className="text-sm text-gray-500">
                              Created {new Date(apiKey.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                              {apiKey.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => regenerateKey(apiKey.id)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteKey(apiKey.id)}>
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={showKeys[apiKey.id] ? apiKey.key : "•".repeat(32)}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button size="sm" variant="outline" onClick={() => toggleKeyVisibility(apiKey.id)}>
                              {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(apiKey.key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Requests</p>
                            <p className="font-medium">{apiKey.requestCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Rate Limit</p>
                            <p className="font-medium">{apiKey.rateLimit}/hour</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Used</p>
                            <p className="font-medium">
                              {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Never"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>API Usage Statistics</span>
                </CardTitle>
                <CardDescription>Monitor your API usage and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Total Requests</TableHead>
                        <TableHead>Successful</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usage.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No usage data available
                          </TableCell>
                        </TableRow>
                      ) : (
                        usage.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                            <TableCell>{day.requests.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600">{day.successful.toLocaleString()}</TableCell>
                            <TableCell className="text-red-600">{day.failed.toLocaleString()}</TableCell>
                            <TableCell>
                              {day.requests > 0 ? ((day.successful / day.requests) * 100).toFixed(1) : 0}%
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>API Documentation</span>
                </CardTitle>
                <CardDescription>Learn how to integrate with Double A Data Center API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                      https://api.doubleadatacenter.com/v1
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                    <p className="text-gray-600 mb-3">Include your API key in the Authorization header:</p>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Available Endpoints</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            GET
                          </Badge>
                          <code className="text-sm">/balance</code>
                        </div>
                        <p className="text-sm text-gray-600">Get your wallet balance</p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            POST
                          </Badge>
                          <code className="text-sm">/airtime</code>
                        </div>
                        <p className="text-sm text-gray-600">Purchase airtime</p>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Request Body:</p>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {`{
  "network": "mtn",
  "phone": "08012345678",
  "amount": 1000
}`}
                          </pre>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            POST
                          </Badge>
                          <code className="text-sm">/data</code>
                        </div>
                        <p className="text-sm text-gray-600">Purchase data bundle</p>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Request Body:</p>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {`{
  "network": "mtn",
  "phone": "08012345678",
  "plan": "1gb_30days"
}`}
                          </pre>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            GET
                          </Badge>
                          <code className="text-sm">/transactions</code>
                        </div>
                        <p className="text-sm text-gray-600">Get transaction history</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Response Format</h3>
                    <p className="text-gray-600 mb-3">All API responses follow this format:</p>
                    <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                      {`{
  "success": true,
  "message": "Transaction successful",
  "data": {
    "transactionId": "TXN123456789",
    "status": "completed",
    "amount": 1000
  }
}`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Error Codes</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <code className="text-sm">400</code>
                        <span className="text-sm text-gray-600">Bad Request - Invalid parameters</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <code className="text-sm">401</code>
                        <span className="text-sm text-gray-600">Unauthorized - Invalid API key</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <code className="text-sm">429</code>
                        <span className="text-sm text-gray-600">Rate Limit Exceeded</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <code className="text-sm">500</code>
                        <span className="text-sm text-gray-600">Internal Server Error</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
