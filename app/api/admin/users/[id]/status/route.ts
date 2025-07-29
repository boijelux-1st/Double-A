import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get existing user
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Prevent status change for admin users
    if (existingUser.role === "admin") {
      return NextResponse.json({ message: "Cannot change status of admin users" }, { status: 400 })
    }

    // Toggle status
    const newStatus = existingUser.status === "active" ? "suspended" : "active"
    const updatedUser = await db.updateUser(id, { status: newStatus })

    return NextResponse.json({ user: updatedUser, message: "User status updated successfully" })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ message: "Failed to update user status" }, { status: 500 })
  }
}
