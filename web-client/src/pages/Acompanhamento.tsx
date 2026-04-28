import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import '../assets/css/Acompanhamento.css'

const socketUrl = 'https://api.acaiecompanhia.com.br'

export default function Acompanhamento() {
  const { id } = useParams()
  const [pedido, setPedido] = useState<any>(null)
  const [status, setStatus] = useState<string | null>(null)

  const { limparCarrinho } = useCart()

  useEffect(() => {
    if (id) {
      try {
        limparCarrinho()
        localStorage.removeItem('pedidoId')
      } catch (err) {
        console.warn('Erro ao limpar carrinho:', err)
      }
    }
  }, [id, limparCarrinho])

  useEffect(() => {
    if (!id) return

    async function loadPedido() {
      try {
        const response = await api.get(`/pedidos/${id}`)
        const pedidoData = response.data.data

        if (!pedidoData) return

        setPedido(pedidoData)
        setStatus(pedidoData.status)
      } catch (error) {
        console.error('Erro ao carregar pedido:', error)
      }
    }

    loadPedido()

    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
    })

    socket.on('pedido_atualizado', (pedidoAtualizado: any) => {
      if (String(pedidoAtualizado.id) === String(id)) {
        setStatus(pedidoAtualizado.status)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [id])
  const [jaVibrou, setJaVibrou] = useState(false)

  useEffect(() => {
    if (!status) return
    if (!('vibrate' in navigator)) return
    if (status !== 'PRONTO') return
    if (document.visibilityState === 'visible') return
    if (jaVibrou) return

    navigator.vibrate([120, 60, 120])
    setJaVibrou(true)
  }, [status, jaVibrou])

  useEffect(() => {
    if (status !== 'PRONTO') {
      setJaVibrou(false)
    }
  }, [status])

  function sairDoApp() {
    try {
      window.close()
    } catch {}
    {
      /* em produção a linha abaixo, trocar para -> navigate('/m/1') */
    }
    window.location.href = '/m/1'
  }

  function getStatusInfo(status: string | null) {
    switch (status) {
      case 'AGUARDANDO_PAGAMENTO':
        return { texto: 'Aguardando pagamento 💳', progresso: 10 }
      case 'RECEBIDO':
        return { texto: 'Pedido recebido 📥', progresso: 30 }
      case 'EM_PREPARO':
        return { texto: 'Estamos preparando 🍳', progresso: 60 }
      case 'PRONTO':
        return { texto: 'Seu pedido está pronto! ✅', progresso: 90 }
      case 'ENTREGUE':
        return { texto: 'Pedido entregue 🚚', progresso: 100 }
      case 'CANCELADO':
        return { texto: 'Pedido cancelado ❌', progresso: 0 }
      default:
        return { texto: status || '', progresso: 0 }
    }
  }

  const statusInfo = getStatusInfo(status)

  if (!pedido) {
    return (
      <div className="acompanhamento-page">
        <p className="acompanhamento-loading">Carregando pedido...</p>
      </div>
    )
  }

  return (
    <div className="acompanhamento-page">
      {/* 🔥 TEXTO AGORA ACIMA DO CARD */}
      <p className="banner-texto-topo">🍓 Enquanto seu pedido é preparado...</p>

      <div className="acompanhamento-card">
        <h1 className="acompanhamento-title">📡 Acompanhamento</h1>

        <div className="acompanhamento-bloco">
          <div className="acompanhamento-label">Número do pedido</div>
          <div className="acompanhamento-valor">
            #{pedido.codigo?.toString().padStart(4, '0') || '----'}
          </div>
        </div>

        <div className="acompanhamento-bloco">
          <div className="acompanhamento-label">Total</div>
          <div className="acompanhamento-valor">
            R$ {Number(pedido.total).toFixed(2)}
          </div>
        </div>

        <div className="acompanhamento-bloco">
          <div className="acompanhamento-label">Status do pedido</div>

          <div
            key={status} // 🔥 ESSENCIAL para animar troca
            className={`acompanhamento-status status-${status} fade-status`}
          >
            {statusInfo.texto}
          </div>
        </div>

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${statusInfo.progresso}%` }}
          />
        </div>

        {status === 'ENTREGUE' && (
          <button className="acompanhamento-btn-sair" onClick={sairDoApp}>
            🚪 Finalizar / Sair
          </button>
        )}
      </div>

      {/* 🔥 BANNER CONTINUA ABAIXO (INALTERADO) */}
      <div className="acompanhamento-banner">
        <div className="banner-card">
          <strong>Aproveite!</strong>

          <p>Adicione uma bebida gelada por apenas R$ 5,00 no balcão 😋</p>
        </div>
      </div>
    </div>
  )
}
