// pages/Login.tsx
import React, { useState } from "react";
import axios from "axios";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login");
      const jwt = res.data.token;

      localStorage.setItem("vtu_token", jwt); // save token
      setToken(jwt);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
