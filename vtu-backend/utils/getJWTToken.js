// utils/getJWTToken.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getVTUToken() {
  try {
    const response = await axios.post("https://vtu.ng/wp-json/jwt-auth/v1/token", {
      username: process.env.VTU_USERNAME,
      password: process.env.VTU_PASSWORD,
    });

    return response.data.token;
  } catch (error) {
    console.error("Failed to get JWT token:", error.response?.data || error.message);
    return null;
  }
}
