"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TestAPIPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, result: any) => {
    setResults((prev) => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const testHealthAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      addResult("Health Check", { status: response.status, data })
    } catch (error) {
      addResult("Health Check", { error: error instanceof Error ? error.message : "Unknown error" })
    }
    setLoading(false)
  }

  const testLoginAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@vtu.com",
          password: "password",
        }),
      })
      const data = await response.json()
      addResult("Login Test", { status: response.status, data })
    } catch (error) {
      addResult("Login Test", { error: error instanceof Error ? error.message : "Unknown error" })
    }
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API Test Panel</CardTitle>
            <CardDescription>Test API endpoints to debug issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={testHealthAPI} disabled={loading}>
                  Test Health API
                </Button>
                <Button onClick={testLoginAPI} disabled={loading}>
                  Test Login API
                </Button>
                <Button onClick={clearResults} variant="outline">
                  Clear Results
                </Button>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <Alert key={index}>
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-semibold">{result.test}</div>
                        <div className="text-xs text-gray-500">{result.timestamp}</div>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
