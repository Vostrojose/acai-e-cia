import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Carrinho from '../pages/Carrinho'
import Checkout from '../pages/Checkout'
import Acompanhamento from '../pages/Acompanhamento'
import Pagamento from '../pages/Pagamento'
import Cozinha from "../pages/Cozinha"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/m/:origem" element={<Home />} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/pagamento/:id" element={<Pagamento />} />
      <Route path="/acompanhamento/:id" element={<Acompanhamento />} />
      <Route path="/cozinha" element={<Cozinha />} />
      
    </Routes>
  )
}
