import jwt from "jsonwebtoken";

const ADMIN_ROLE = "admin";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Should be set in environment

/**
 * Verifies that the Authorization header contains a valid admin JWT.
 * Returns true if the token is valid and the role is admin.
 */
export function verifyAdminToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.role === ADMIN_ROLE;
  } catch {
    return false;
  }
}
