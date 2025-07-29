"use client"

import type React from "react"

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
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CreditCard,
  Building2,
  Mail,
  Plus,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  TestTube,
  Star,
  AlertCircle,
  Loader2,
} from "lucide-react"
import AdminLayout from "@/components/admin-layout"

interface PaymentGateway {
  id: string
  name: string
  type: "paystack" | "flutterwave" | "monnify" | "custom"
  publicKey: string
  secretKey: string
  webhookUrl: string
  isActive: boolean
  testMode: boolean
  createdAt: string
}

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  bankCode: string
  isActive: boolean
  isPrimary: boolean
  createdAt: string
}

interface EmailRedirection {
  id: string
  name: string
  description: string
  sourceEvent: string
  targetEmail: string
  isActive: boolean
  template: string
  createdAt: string
}

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "SunTrust Bank", code: "100" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank For Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
]

const EMAIL_EVENTS = [
  { value: "user_registration", label: "User Registration" },
  { value: "email_confirmation", label: "Email Confirmation" },
  { value: "login_otp", label: "Login OTP" },
  { value: "transaction_completed", label: "Transaction Completed" },
  { value: "wallet_funded", label: "Wallet Funded" },
  { value: "payment_received", label: "Payment Received" },
  { value: "password_reset", label: "Password Reset" },
  { value: "account_suspended", label: "Account Suspended" },
]

export default function AdminAccessControlsPage() {
  const [activeTab, setActiveTab] = useState("payment-gateways")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Payment Gateways State
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([])
  const [showGatewayDialog, setShowGatewayDialog] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)
  const [showSecretKey, setShowSecretKey] = useState<{ [key: string]: boolean }>({})

  // Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null)

  // Email Redirections State
  const [emailRedirections, setEmailRedirections] = useState<EmailRedirection[]>([])
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [editingEmail, setEditingEmail] = useState<EmailRedirection | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      // Fetch payment gateways
      const gatewaysResponse = await fetch("/api/admin/access-controls/payment-gateways", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (gatewaysResponse.ok) {
        const gatewaysData = await gatewaysResponse.json()
        setPaymentGateways(gatewaysData)
      }

      // Fetch bank accounts
      const banksResponse = await fetch("/api/admin/access-controls/bank-accounts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (banksResponse.ok) {
        const banksData = await banksResponse.json()
        setBankAccounts(banksData)
      }

      // Fetch email redirections
      const emailsResponse = await fetch("/api/admin/access-controls/email-redirections", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json()
        setEmailRedirections(emailsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setMessage("Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGateway = async (gatewayData: Partial<PaymentGateway>) => {
    try {
      const token = localStorage.getItem("token")
      const url = editingGateway
        ? `/api/admin/access-controls/payment-gateways/${editingGateway.id}`
        : "/api/admin/access-controls/payment-gateways"

      const response = await fetch(url, {
        method: editingGateway ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gatewayData),
      })

      if (response.ok) {
        setMessage("Payment gateway saved successfully!")
        setShowGatewayDialog(false)
        setEditingGateway(null)
        fetchData()
      } else {
        setMessage("Failed to save payment gateway")
      }
    } catch (error) {
      console.error("Error saving gateway:", error)
      setMessage("Error saving payment gateway")
    }
  }

  const handleSaveBankAccount = async (bankData: Partial<BankAccount>) => {
    try {
      const token = localStorage.getItem("token")
      const url = editingBank
        ? `/api/admin/access-controls/bank-accounts/${editingBank.id}`
        : "/api/admin/access-controls/bank-accounts"

      const response = await fetch(url, {
        method: editingBank ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bankData),
      })

      if (response.ok) {
        setMessage("Bank account saved successfully!")
        setShowBankDialog(false)
        setEditingBank(null)
        fetchData()
      } else {
        setMessage("Failed to save bank account")
      }
    } catch (error) {
      console.error("Error saving bank account:", error)
      setMessage("Error saving bank account")
    }
  }

  const handleSaveEmailRedirection = async (emailData: Partial<EmailRedirection>) => {
    try {
      const token = localStorage.getItem("token")
      const url = editingEmail
        ? `/api/admin/access-controls/email-redirections/${editingEmail.id}`
        : "/api/admin/access-controls/email-redirections"

      const response = await fetch(url, {
        method: editingEmail ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        setMessage("Email redirection saved successfully!")
        setShowEmailDialog(false)
        setEditingEmail(null)
        fetchData()
      } else {
        setMessage("Failed to save email redirection")
      }
    } catch (error) {
      console.error("Error saving email redirection:", error)
      setMessage("Error saving email redirection")
    }
  }

  const toggleGatewayStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/access-controls/payment-gateways/${id}/toggle`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error toggling gateway status:", error)
    }
  }

  const toggleBankStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/access-controls/bank-accounts/${id}/toggle`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error toggling bank status:", error)
    }
  }

  const toggleEmailStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/access-controls/email-redirections/${id}/toggle`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error toggling email status:", error)
    }
  }

  const testGatewayConnection = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/access-controls/payment-gateways/${id}/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await response.json()
      setMessage(result.message)
    } catch (error) {
      console.error("Error testing gateway:", error)
      setMessage("Error testing gateway connection")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <h1 className="text-3xl font-bold text-gray-900">Access Controls</h1>
            <p className="text-gray-600">Manage payment gateways, bank accounts, and email redirections</p>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payment-gateways" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Payment Gateways</span>
            </TabsTrigger>
            <TabsTrigger value="bank-accounts" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Bank Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="email-redirections" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Redirections</span>
            </TabsTrigger>
          </TabsList>

          {/* Payment Gateways Tab */}
          <TabsContent value="payment-gateways" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Gateways</span>
                    </CardTitle>
                    <CardDescription>Configure payment processing gateways</CardDescription>
                  </div>
                  <Dialog open={showGatewayDialog} onOpenChange={setShowGatewayDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingGateway(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Gateway
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <PaymentGatewayForm
                        gateway={editingGateway}
                        onSave={handleSaveGateway}
                        onCancel={() => {
                          setShowGatewayDialog(false)
                          setEditingGateway(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentGateways.map((gateway) => (
                      <TableRow key={gateway.id}>
                        <TableCell className="font-medium">{gateway.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {gateway.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={gateway.testMode ? "secondary" : "default"}>
                            {gateway.testMode ? "Test" : "Live"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={gateway.isActive ? "default" : "secondary"}>
                            {gateway.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => testGatewayConnection(gateway.id)}>
                              <TestTube className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingGateway(gateway)
                                setShowGatewayDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toggleGatewayStatus(gateway.id)}>
                              {gateway.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Accounts Tab */}
          <TabsContent value="bank-accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Bank Accounts</span>
                    </CardTitle>
                    <CardDescription>Manage settlement bank accounts</CardDescription>
                  </div>
                  <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingBank(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Bank Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <BankAccountForm
                        bankAccount={editingBank}
                        onSave={handleSaveBankAccount}
                        onCancel={() => {
                          setShowBankDialog(false)
                          setEditingBank(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank Name</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Primary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.bankName}</TableCell>
                        <TableCell>{account.accountNumber}</TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>{account.isPrimary && <Star className="h-4 w-4 text-yellow-500" />}</TableCell>
                        <TableCell>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingBank(account)
                                setShowBankDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toggleBankStatus(account.id)}>
                              {account.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Redirections Tab */}
          <TabsContent value="email-redirections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Email Redirections</span>
                    </CardTitle>
                    <CardDescription>Configure automatic email notifications</CardDescription>
                  </div>
                  <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingEmail(null)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Email Redirection
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <EmailRedirectionForm
                        emailRedirection={editingEmail}
                        onSave={handleSaveEmailRedirection}
                        onCancel={() => {
                          setShowEmailDialog(false)
                          setEditingEmail(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Target Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailRedirections.map((redirection) => (
                      <TableRow key={redirection.id}>
                        <TableCell className="font-medium">{redirection.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {EMAIL_EVENTS.find((e) => e.value === redirection.sourceEvent)?.label ||
                              redirection.sourceEvent}
                          </Badge>
                        </TableCell>
                        <TableCell>{redirection.targetEmail}</TableCell>
                        <TableCell>
                          <Badge variant={redirection.isActive ? "default" : "secondary"}>
                            {redirection.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingEmail(redirection)
                                setShowEmailDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toggleEmailStatus(redirection.id)}>
                              {redirection.isActive ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

// Payment Gateway Form Component
function PaymentGatewayForm({
  gateway,
  onSave,
  onCancel,
}: {
  gateway: PaymentGateway | null
  onSave: (data: Partial<PaymentGateway>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: gateway?.name || "",
    type: gateway?.type || "paystack",
    publicKey: gateway?.publicKey || "",
    secretKey: gateway?.secretKey || "",
    webhookUrl: gateway?.webhookUrl || "",
    isActive: gateway?.isActive ?? true,
    testMode: gateway?.testMode ?? true,
  })
  const [showSecret, setShowSecret] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{gateway ? "Edit Payment Gateway" : "Add Payment Gateway"}</DialogTitle>
        <DialogDescription>Configure payment gateway settings</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Gateway Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Primary Paystack"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Gateway Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paystack">Paystack</SelectItem>
              <SelectItem value="flutterwave">Flutterwave</SelectItem>
              <SelectItem value="monnify">Monnify</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publicKey">Public Key</Label>
          <Input
            id="publicKey"
            value={formData.publicKey}
            onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
            placeholder="pk_test_..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secretKey">Secret Key</Label>
          <div className="relative">
            <Input
              id="secretKey"
              type={showSecret ? "text" : "password"}
              value={formData.secretKey}
              onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
              placeholder="sk_test_..."
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            value={formData.webhookUrl}
            onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
            placeholder="https://doubleadatacenter.com/webhook/paystack"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="testMode"
              checked={formData.testMode}
              onCheckedChange={(checked) => setFormData({ ...formData, testMode: checked })}
            />
            <Label htmlFor="testMode">Test Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Gateway</Button>
        </DialogFooter>
      </form>
    </>
  )
}

// Bank Account Form Component
function BankAccountForm({
  bankAccount,
  onSave,
  onCancel,
}: {
  bankAccount: BankAccount | null
  onSave: (data: Partial<BankAccount>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    bankName: bankAccount?.bankName || "",
    bankCode: bankAccount?.bankCode || "",
    accountNumber: bankAccount?.accountNumber || "",
    accountName: bankAccount?.accountName || "",
    isActive: bankAccount?.isActive ?? true,
    isPrimary: bankAccount?.isPrimary ?? false,
  })

  const handleBankChange = (bankName: string) => {
    const bank = NIGERIAN_BANKS.find((b) => b.name === bankName)
    setFormData({
      ...formData,
      bankName,
      bankCode: bank?.code || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{bankAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
        <DialogDescription>Configure settlement bank account</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name</Label>
          <Select value={formData.bankName} onValueChange={handleBankChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select bank" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIAN_BANKS.map((bank) => (
                <SelectItem key={bank.code} value={bank.name}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankCode">Bank Code</Label>
          <Input id="bankCode" value={formData.bankCode} readOnly className="bg-gray-50" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="0123456789"
            maxLength={10}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountName">Account Name</Label>
          <Input
            id="accountName"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value.toUpperCase() })}
            placeholder="DOUBLE A DATA CENTER BAUCHI"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
            />
            <Label htmlFor="isPrimary">Primary Account</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Account</Button>
        </DialogFooter>
      </form>
    </>
  )
}

// Email Redirection Form Component
function EmailRedirectionForm({
  emailRedirection,
  onSave,
  onCancel,
}: {
  emailRedirection: EmailRedirection | null
  onSave: (data: Partial<EmailRedirection>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: emailRedirection?.name || "",
    description: emailRedirection?.description || "",
    sourceEvent: emailRedirection?.sourceEvent || "",
    targetEmail: emailRedirection?.targetEmail || "",
    template: emailRedirection?.template || "",
    isActive: emailRedirection?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{emailRedirection ? "Edit Email Redirection" : "Add Email Redirection"}</DialogTitle>
        <DialogDescription>Configure automatic email notifications</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., New User Registration"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceEvent">Source Event</Label>
            <Select
              value={formData.sourceEvent}
              onValueChange={(value) => setFormData({ ...formData, sourceEvent: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_EVENTS.map((event) => (
                  <SelectItem key={event.value} value={event.value}>
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this redirection"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetEmail">Target Email</Label>
          <Input
            id="targetEmail"
            type="email"
            value={formData.targetEmail}
            onChange={(e) => setFormData({ ...formData, targetEmail: e.target.value })}
            placeholder="admin@doubleadatacenter.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template">Email Template</Label>
          <Textarea
            id="template"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            placeholder="Use variables like {{user_name}}, {{user_email}}, {{amount}}, etc."
            rows={4}
            required
          />
          <p className="text-xs text-gray-500">
            Available variables: user_name, user_email, amount, transaction_id, event_data
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Redirection</Button>
        </DialogFooter>
      </form>
    </>
  )
}
