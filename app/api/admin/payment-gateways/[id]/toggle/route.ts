import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { isActive } = await request.json()

    // In a real app, update the gateway in database
    console.log(`Toggling payment gateway ${params.id} to ${isActive ? "active" : "inactive"}`)

    return NextResponse.json({ message: "Gateway status updated" })
  } catch (error) {
    console.error("Toggle payment gateway error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
