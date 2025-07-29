"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Smartphone, CreditCard, History, Plus } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import FundWalletModal from "@/components/fund-wallet-modal"
import VTUServicesModal from "@/components/vtu-services-modal"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface WalletData {
  balance: number
  totalFunded: number
  totalSpent: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, totalFunded: 0, totalSpent: 0 })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showFundModal, setShowFundModal] = useState(false)
  const [showVTUModal, setShowVTUModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch wallet data
      const walletResponse = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (walletResponse.ok) {
        const walletData = await walletResponse.json()
        setWallet(walletData)
      }

      // Fetch recent transactions
      const transactionsResponse = await fetch("/api/transactions?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Manage your VTU services and wallet from your dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{wallet.balance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{wallet.totalFunded.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Lifetime funding</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{wallet.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">On VTU services</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Perform common tasks quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => setShowFundModal(true)} className="h-16">
                <Plus className="mr-2 h-5 w-5" />
                Fund Wallet
              </Button>
              <Button onClick={() => setShowVTUModal(true)} variant="outline" className="h-16">
                <Smartphone className="mr-2 h-5 w-5" />
                Buy Airtime/Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest transaction history</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <History className="mr-2 h-4 w-4" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {transaction.type === "credit" ? "+" : "-"}₦{transaction.amount.toLocaleString()}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <FundWalletModal open={showFundModal} onClose={() => setShowFundModal(false)} onSuccess={fetchDashboardData} />
      <VTUServicesModal
        open={showVTUModal}
        onClose={() => setShowVTUModal(false)}
        onSuccess={fetchDashboardData}
        walletBalance={wallet.balance}
      />
    </DashboardLayout>
  )
}
