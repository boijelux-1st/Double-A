import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { sendOTP } from "@/lib/mailer"
import { generateOTP } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, role } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const user = await db.createUser({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || "user",
      isActive: true,
    })

    const otp = generateOTP()
    await db.otp.create({
      data: {
        code: otp,
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    await sendOTP(email, otp)

    return NextResponse.json(
      {
        message: "User created and OTP sent",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
