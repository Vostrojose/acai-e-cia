import { Routes, Route } from "react-router-dom"
import Produtos from "../pages/Produtos"
import Cozinha from "../pages/Cozinha"
import QRCodes from "../pages/QRCodes"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Cozinha />} />
      <Route path="/produtos" element={<Produtos />} />
      <Route path="/cozinha" element={<Cozinha />} />
      <Route path="/qr" element={<QRCodes />} />
    </Routes>
  )
}