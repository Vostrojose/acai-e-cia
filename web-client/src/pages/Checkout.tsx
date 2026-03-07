import { useCart } from '../context/CartContext'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Checkout() {
  const { itens, total } = useCart()
  const navigate = useNavigate()

  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)

  async function finalizarPedido() {
    try {
      if (!telefone) {
        alert('Informe seu WhatsApp para confirmação do pedido.')
        return
      }

      setLoading(true)

      const origem = localStorage.getItem('origemPedido')

      const pedidoResponse = await api.post('/pedido', {
        telefone,
        origem,
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
    <div style={{ padding: 20, maxWidth: 500, margin: 'auto' }}>
      <h1>💳 Checkout</h1>

      <p>Total do pedido:</p>
      <h2>R$ {total.toFixed(2)}</h2>

      <div style={{ marginTop: 20 }}>
        <label>WhatsApp para confirmação</label>

        <input
          type="tel"
          placeholder="(11) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 5,
            borderRadius: 6,
            border: '1px solid #ccc'
          }}
        />
      </div>

      <button
        onClick={finalizarPedido}
        disabled={loading}
        style={{
          marginTop: 25,
          width: '100%',
          padding: 15,
          backgroundColor: '#00c853',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Processando...' : 'Confirmar Pedido'}
      </button>
    </div>
  )
}