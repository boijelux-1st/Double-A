// controllers/authController.js
import { getVTUToken } from "../utils/getJWTToken.js";

export async function loginUser(req, res) {
  try {
    const token = await getVTUToken();

    if (!token) {
      return res.status(401).json({ message: "Authentication failed." });
    }

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
