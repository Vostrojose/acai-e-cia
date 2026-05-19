import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function PedidoFloatingBar() {
  const navigate = useNavigate()

  const [pedido, setPedido] = useState<any>(null)
  const [oculto, setOculto] = useState(false)

  useEffect(() => {
    const pedidoId = localStorage.getItem('pedidoId')

    if (!pedidoId) return

    async function carregarPedido() {
      try {
        const response = await api.get(`/pedidos/${pedidoId}`)

        const pedidoData = response.data.data

        if (!pedidoData) return

        // NÃO mostra pedidos finalizados
        if (
          pedidoData.status === 'ENTREGUE' ||
          pedidoData.status === 'CANCELADO'
        ) {
          return
        }

        setPedido(pedidoData)
      } catch (err) {
        console.warn('Erro floating bar:', err)
      }
    }

    carregarPedido()
  }, [])

  if (!pedido || oculto) return null

  function getTextoStatus(status: string) {
    switch (status) {
      case 'AGUARDANDO_PAGAMENTO':
        return 'aguardando pagamento 💳'

      case 'RECEBIDO':
        return 'recebido 📥'

      case 'EM_PREPARO':
        return 'em preparo 🍳'

      case 'PRONTO':
        return 'pronto para retirada ✅'

      default:
        return status
    }
  }

  return (
    <div style={container}>
      <div style={info}>
        <div style={titulo}>📦 Pedido #{pedido.codigo}</div>

        <div style={status}>{getTextoStatus(pedido.status)}</div>
      </div>

      <div style={acoes}>
        <button
          style={btnAcompanhar}
          onClick={() => navigate(`/acompanhamento/${pedido.id}`)}
        >
          Acompanhar
        </button>

        <button style={btnFechar} onClick={() => setOculto(true)}>
          ✕
        </button>
      </div>
    </div>
  )
}

const container = {
  position: 'fixed' as const,
  bottom: 12,
  left: 12,
  right: 12,

  background: '#111',
  border: '1px solid rgba(255,255,255,0.08)',

  borderRadius: 16,

  padding: '12px 14px',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  zIndex: 9999,

  boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
}

const info = {
  display: 'flex',
  flexDirection: 'column' as const,
}

const titulo = {
  color: '#fff',
  fontWeight: 700,
  fontSize: 14,
}

const status = {
  color: '#aaa',
  fontSize: 12,
  marginTop: 2,
}

const acoes = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const btnAcompanhar = {
  background: '#7b2cbf',
  color: '#fff',

  border: 'none',

  borderRadius: 10,

  padding: '8px 12px',

  fontSize: 12,
  fontWeight: 700,

  cursor: 'pointer',
}

const btnFechar = {
  background: 'transparent',
  color: '#999',

  border: 'none',

  fontSize: 18,

  cursor: 'pointer',
}
