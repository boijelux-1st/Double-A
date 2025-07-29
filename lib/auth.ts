import jwt from "jsonwebtoken"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    return decoded
  } catch (error) {
    return null
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" },
  )
}
