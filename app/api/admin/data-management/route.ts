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

    const entries = await db.getAllDataEntries()
    return NextResponse.json(entries)
  } catch (error) {
    console.error("Data management fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { type, name, description, data, isActive } = await request.json()

    if (!type || !name || !data) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const entry = await db.createDataEntry({
      type,
      name,
      description: description || "",
      data,
      isActive: isActive !== undefined ? isActive : true,
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Data management create error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
