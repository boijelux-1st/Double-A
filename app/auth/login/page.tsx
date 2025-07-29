"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [step, setStep] = useState(1) // 1: Login, 2: OTP Verification
  const [otpCode, setOtpCode] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [tempToken, setTempToken] = useState("")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Send OTP for email verification
        const otpResponse = await fetch("/api/auth/send-login-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        })

        if (otpResponse.ok) {
          setTempToken(data.token)
          setMessage("OTP sent to your email. Please verify to complete login.")
          setStep(2)
        } else {
          setMessage("Failed to send OTP. Please try again.")
        }
      } else {
        setMessage(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setMessage("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyingOtp(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/verify-login-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpCode,
          tempToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        setMessage("Login successful! Redirecting...")

        setTimeout(() => {
          if (data.user.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        }, 1000)
      } else {
        setMessage(data.message || "OTP verification failed")
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      setMessage("Network error. Please try again.")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const resendOtp = async () => {
    try {
      await fetch("/api/auth/send-login-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })
      setMessage("New OTP sent to your email.")
    } catch (error) {
      setMessage("Failed to resend OTP.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg">
              <span className="text-white font-bold text-lg">DA</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-900">Double A Data Center</span>
              <span className="text-xs text-blue-700 font-medium">Bauchi</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">
            {step === 1 ? "Welcome Back" : "Verify Login"}
          </CardTitle>
          <CardDescription className="text-blue-700">
            {step === 1 ? "Sign in to your Double A Data Center account" : "Enter the OTP code sent to your email"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.includes("successful") ? "border-green-200 bg-green-50" : ""}`}>
              {message.includes("successful") ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-sm text-blue-900 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">We've sent a 6-digit OTP code to:</p>
                <p className="font-medium text-blue-900">{formData.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otpCode">OTP Code</Label>
                <Input
                  id="otpCode"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                  disabled={verifyingOtp}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={verifyingOtp}>
                {verifyingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="text-center">
                <Button type="button" variant="link" onClick={resendOtp} className="text-blue-900">
                  Didn't receive the code? Resend
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-blue-900 hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>

          {/* Contact Information */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Need help? Contact us:</p>
              <div className="space-y-1">
                <p className="text-xs text-blue-900">📞 +234-802-356-6143</p>
                <p className="text-xs text-blue-900">📞 +234-813-345-0081</p>
                <p className="text-xs text-blue-900">✉️ 1st.boijelux@gmail.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
