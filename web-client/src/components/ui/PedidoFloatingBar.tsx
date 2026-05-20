import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function PedidoFloatingBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [popupFechado, setPopupFechado] = useState(false)

  useEffect(() => {
    const atualizarDados = () => {
      const id = localStorage.getItem('pedidoId')

      const statusSalvo =
        localStorage.getItem('pedidoStatus')

      const fechado =
        localStorage.getItem('pedidoPopupFechado')

      setPedidoId(id)

      setStatus(statusSalvo || '')

      setPopupFechado(fechado === 'true')
    }

    atualizarDados()

    window.addEventListener('storage', atualizarDados)

    return () => {
      window.removeEventListener(
        'storage',
        atualizarDados,
      )
    }
  }, [])

  // NÃO mostrar na tela acompanhamento
  if (
    location.pathname.includes('/acompanhar') ||
    location.pathname.includes('/acompanhamento')
  ) {
    return null
  }

  // sem pedido
  if (!pedidoId || !status) {
    return null
  }

  // popup fechado
  if (popupFechado) {
    return null
  }

  const fecharPopup = () => {
    localStorage.setItem(
      'pedidoPopupFechado',
      'true',
    )

    setPopupFechado(true)
  }

  const abrirPedido = () => {
    navigate(`/acompanhar/${pedidoId}`)
  }

  return (
    <div
      style={{
        position: 'fixed',

        bottom: 16,

        left: 16,

        right: 16,

        zIndex: 9999,

        maxWidth: 420,

        margin: '0 auto',

        backdropFilter: 'blur(14px)',

        background: 'rgba(20,20,20,0.88)',

        border:
          '1px solid rgba(255,255,255,0.08)',

        borderRadius: 20,

        padding: 16,

        boxShadow:
          '0 10px 30px rgba(0,0,0,0.35)',

        color: '#fff',
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
        onClick={abrirPedido}
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