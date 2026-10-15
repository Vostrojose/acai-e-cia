import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Carrinho from '../pages/Carrinho'
import Checkout from '../pages/Checkout'
import Acompanhamento from '../pages/Acompanhamento'
import Pagamento from '../pages/Pagamento'
import CardapioSemana from '../pages/CardapioSemana'
import Sucesso from '../pages/Sucesso'
import SplashMenu from '../pages/SplashMenu'
import RetornoPagamento from '../pages/RetornoPagamento'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashMenu />} />
      <Route path="/m/:origem" element={<Home />} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/pagamento/:id" element={<Pagamento />} />
      <Route path="/acompanhamento/:id" element={<Acompanhamento />} />
      <Route path="/sucesso/:id" element={<Sucesso />} />
      <Route path="/erro" element={<RetornoPagamento tipo="erro" />} />
      <Route path="/pendente" element={<RetornoPagamento tipo="pendente" />} />
      <Route path="/cardapio-semana/:origem" element={<CardapioSemana />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}