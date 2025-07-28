import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BuyData from "./pages/BuyData";
import BuyAirtime from "./pages/BuyAirtime";
import Wallet from "./pages/Wallet";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buy-data" element={<BuyData />} />
        <Route path="/buy-airtime" element={<BuyAirtime />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </BrowserRouter>
  );
}
