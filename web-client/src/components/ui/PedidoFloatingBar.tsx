import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function PedidoPopup() {
  const navigate = useNavigate()
  const location = useLocation()

  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [popupFechado, setPopupFechado] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('pedidoId')
    const statusSalvo = localStorage.getItem('pedidoStatus')
    const fechado = localStorage.getItem('pedidoPopupFechado')

    if (id) setPedidoId(id)

    if (statusSalvo) setStatus(statusSalvo)

    setPopupFechado(fechado === 'true')
  }, [])

  // NÃO mostrar na página de acompanhamento
  if (location.pathname.includes('/acompanhar')) {
    return null
  }

  // NÃO mostrar se não existir pedido
  if (!pedidoId || !status) {
    return null
  }

  // NÃO mostrar se usuário fechou
  if (popupFechado) {
    return null
  }

  const fecharPopup = () => {
    localStorage.setItem('pedidoPopupFechado', 'true')

    setPopupFechado(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 9999,

        backdropFilter: 'blur(14px)',
        background: 'rgba(20,20,20,0.85)',

        border: '1px solid rgba(255,255,255,0.08)',

        borderRadius: 20,

        padding: 16,

        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',

        color: '#fff',

        animation: 'slideUp 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 6,
            }}
          >
            🟣 Pedido {status.toLowerCase()}
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.8,
            }}
          >
            ⌛ acompanhe seu pedido em tempo real
          </div>
        </div>

        <button
          onClick={fecharPopup}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <button
        onClick={() => navigate(`/acompanhar/${pedidoId}`)}
        style={{
          marginTop: 14,

          width: '100%',

          background: '#8b5cf6',

          border: 'none',

          borderRadius: 14,

          padding: '12px 16px',

          color: '#fff',

          fontWeight: 700,

          cursor: 'pointer',
        }}
      >
        Acompanhar pedido
      </button>
    </div>
  )
}