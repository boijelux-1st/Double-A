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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const redirections = await db.getEmailRedirections()
    return NextResponse.json(redirections)
  } catch (error) {
    console.error("Error fetching email redirections:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const redirectionData = await request.json()
    const redirection = await db.createEmailRedirection(redirectionData)

    return NextResponse.json({
      message: "Email redirection created successfully",
      redirection,
    })
  } catch (error) {
    console.error("Error creating email redirection:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
