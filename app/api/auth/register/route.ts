import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, role } = await request.json()

    console.log("Registration attempt for:", email)

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      console.log("User already exists:", email)
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Create user (in production, hash the password)
    const user = await db.createUser({
      firstName,
      lastName,
      email,
      phone,
      password, // In production, use bcrypt.hash(password, 12)
      role: role || "user",
      isActive: true,
    })

    console.log("User created successfully:", user.email)

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
