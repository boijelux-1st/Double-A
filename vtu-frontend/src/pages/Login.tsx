// src/pages/Login.tsx
import { useState } from "react";
import axios from "axios";

function Login() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login");
      localStorage.setItem("vtu_token", response.data.token);
      setToken(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">VTU System Login</h1>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded-xl"
        >
          {loading ? "Logging in..." : "Login to Get VTU Token"}
        </button>

        {token && (
          <p className="mt-3 text-green-600 break-all">
            Token: {token}
          </p>
        )}

        {error && (
          <p className="mt-3 text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}

export default Login;
