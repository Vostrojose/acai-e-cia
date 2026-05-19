import { CartProvider } from './context/CartContext'
import AppRoutes from './routes/AppRoutes'
import PedidoFloatingBar from './components/ui/PedidoFloatingBar'

function App() {
  return (
    <CartProvider>
      <AppRoutes />

      <PedidoFloatingBar />
    </CartProvider>
  )
}

export default App
