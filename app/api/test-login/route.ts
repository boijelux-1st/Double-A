import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const password = "password"
    const hash = await bcrypt.hash(password, 12)

    // Test the hash
    const isValid = await bcrypt.compare(password, hash)

    return NextResponse.json({
      password,
      hash,
      isValid,
      message: "Password hash test completed",
    })
  } catch (error) {
    return NextResponse.json({ error: "Hash test failed" }, { status: 500 })
  }
}
