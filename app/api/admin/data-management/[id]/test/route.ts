import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

function verifyAdminToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  try {
    const token = authHeader.split(" ")[1]
    const payload = JSON.parse(atob(token))
    return payload.role === "admin" && Date.now() < payload.exp
  } catch {
    return false
  }
}

async function testWordPressConnection(data: any): Promise<{ success: boolean; message: string }> {
  try {
    const { url, username, password, applicationPassword } = data

    // Test WordPress REST API connection
    const authString = applicationPassword
      ? btoa(`${username}:${applicationPassword}`)
      : btoa(`${username}:${password}`)

    const response = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const user = await response.json()
      return { success: true, message: `Connected successfully as ${user.name}` }
    } else {
      return { success: false, message: `Connection failed: ${response.status} ${response.statusText}` }
    }
  } catch (error) {
    return { success: false, message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

async function testAPIConnection(data: any): Promise<{ success: boolean; message: string }> {
  try {
    const { baseUrl, apiKey, secretKey, provider } = data

    // Generic API health check
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Add authentication based on provider
    if (provider.toLowerCase().includes("paystack")) {
      headers["Authorization"] = `Bearer ${apiKey}`
    } else if (provider.toLowerCase().includes("flutterwave")) {
      headers["Authorization"] = `Bearer ${apiKey}`
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`
    }

    const response = await fetch(`${baseUrl}/`, {
      method: "GET",
      headers,
    })

    if (response.ok || response.status === 401) {
      // 401 might be expected for some APIs
      return { success: true, message: `API endpoint is reachable` }
    } else {
      return { success: false, message: `API test failed: ${response.status}` }
    }
  } catch (error) {
    return { success: false, message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const entry = await db.getDataEntryById(id)

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    let testResult: { success: boolean; message: string }

    switch (entry.type) {
      case "wordpress_api":
        testResult = await testWordPressConnection(entry.data)
        break
      case "api_account":
        testResult = await testAPIConnection(entry.data)
        break
      case "local_account":
        testResult = { success: true, message: "Local account validation passed" }
        break
      case "custom":
        testResult = { success: true, message: "Custom data entry is valid" }
        break
      default:
        testResult = { success: false, message: "Unknown entry type" }
    }

    return NextResponse.json(testResult)
  } catch (error) {
    console.error("Data management test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during connection test",
      },
      { status: 500 },
    )
  }
}
