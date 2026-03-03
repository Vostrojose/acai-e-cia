import { useCart } from '../context/CartContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Checkout() {
  const { itens, total } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

async function finalizarPedido() {
  try {
    setLoading(true)

    const pedidoResponse = await api.post('/pedido', {
      itens: itens.map((item) => ({
        produtoId: item.id,
        quantidade: item.quantidade,
      })),
    })

    const pedidoId = pedidoResponse.data.data.id

    navigate(`/pagamento/${pedidoId}`)

  } catch (error) {
    console.error('Erro ao finalizar pedido:', error)
    alert('Erro ao processar pedido')
  } finally {
    setLoading(false)
  }
}
  return (
    <div style={{ padding: 20 }}>
      <h1>💳 Checkout</h1>
      <p>Total: R$ {total}</p>

      <button onClick={finalizarPedido} disabled={loading}>
        {loading ? 'Processando...' : 'Confirmar Pedido'}
      </button>
    </div>
  )
}
