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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { type, name, description, data, isActive } = await request.json()
    const { id } = params

    const updatedEntry = await db.updateDataEntry(id, {
      type,
      name,
      description,
      data,
      isActive,
    })

    if (!updatedEntry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error("Data management update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!verifyAdminToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const success = await db.deleteDataEntry(id)

    if (!success) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Entry deleted successfully" })
  } catch (error) {
    console.error("Data management delete error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
