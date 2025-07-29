"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSimplePage() {
  const [result, setResult] = useState("")

  const testBasicFetch = async () => {
    try {
      setResult("Testing basic fetch...")

      const response = await fetch("/api/health")
      const data = await response.json()

      setResult(`Success: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown"}`)
    }
  }

  const testLogin = async () => {
    try {
      setResult("Testing login...")

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

      setResult(`Login result: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`Login error: ${error instanceof Error ? error.message : "Unknown"}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Simple API Test</CardTitle>
            <CardDescription>Basic API testing without complex dependencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={testBasicFetch}>Test Health API</Button>
                <Button onClick={testLogin}>Test Login</Button>
                <Button onClick={() => setResult("")} variant="outline">
                  Clear
                </Button>
              </div>

              {result && (
                <div className="p-4 bg-gray-100 rounded">
                  <pre className="text-sm whitespace-pre-wrap">{result}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
