import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { firstName, lastName, email, phone, role, password } = body

    // Get existing user
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if email is being changed and if it's already taken
    if (email !== existingUser.email) {
      const emailExists = await db.getUserByEmail(email)
      if (emailExists) {
        return NextResponse.json({ message: "Email already exists" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      email,
      phone,
      role,
    }

    // Hash new password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await db.updateUser(id, updateData)

    return NextResponse.json({ user: updatedUser, message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get user to check if it's an admin
    const user = await db.getUserById(id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Prevent deletion of admin users
    if (user.role === "admin") {
      return NextResponse.json({ message: "Cannot delete admin users" }, { status: 400 })
    }

    const deleted = await db.deleteUser(id)
    if (!deleted) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 })
  }
}
