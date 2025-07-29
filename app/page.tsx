import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Wallet, Smartphone, Users, Zap, CreditCard } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg">
              <span className="text-white font-bold text-lg">DA</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-900">Double A Data Center</span>
              <span className="text-xs text-blue-700 font-medium">Bauchi</span>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white bg-transparent"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-blue-900 hover:bg-blue-800">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-blue-900 mb-4">Double A Data Center</h1>
            <p className="text-xl text-blue-800 font-semibold mb-2">Your Trusted VTU Partner in Bauchi</p>
            <p className="text-lg text-blue-700 mb-8 max-w-3xl mx-auto">
              Buy airtime, data bundles, pay bills, and manage your digital transactions with ease. Serving individuals
              and resellers across Bauchi State with reliable VTU services.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8 bg-blue-900 hover:bg-blue-800">
                Start Now
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white bg-transparent"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>Email verification and OTP-based login with role-based access control</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Wallet className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Digital Wallet</CardTitle>
                <CardDescription>Manage your balance, fund wallet, and track transactions</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>VTU Services</CardTitle>
                <CardDescription>Buy airtime, data bundles, and pay utility bills instantly</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Multiple Payment Options</CardTitle>
                <CardDescription>Fund via Flutterwave, Paystack, Monnify, and bank transfers</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Complete admin control over users, pricing, and transactions</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>API Integration</CardTitle>
                <CardDescription>Multiple VTU API providers with automatic switching</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-blue-900 mb-2">Phone Support</h3>
              <p className="text-blue-700">+234-802-356-6143</p>
              <p className="text-blue-700">+234-813-345-0081</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-blue-900 mb-2">Email Support</h3>
              <p className="text-blue-700">1st.boijelux@gmail.com</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-blue-900 mb-2">Location</h3>
              <p className="text-blue-700">Bauchi State, Nigeria</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                <span className="text-white font-bold">DA</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xl font-bold">Double A Data Center</span>
                <span className="text-sm text-blue-200">Bauchi</span>
              </div>
            </div>
            <p className="text-blue-200 mb-2">Powered by Triple A-Ahal Global Concept</p>
            <div className="text-blue-300 text-sm space-y-1">
              <p>📞 +234-802-356-6143 | +234-813-345-0081</p>
              <p>✉️ 1st.boijelux@gmail.com</p>
            </div>
            <p className="text-blue-300 text-sm mt-4">© 2024 Double A Data Center Bauchi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
