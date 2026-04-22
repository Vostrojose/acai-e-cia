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

  /* ============================= */
  /* LIMPAR CARRINHO               */
  /* ============================= */
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

  /* ============================= */
  /* CARREGAR PEDIDO + SOCKET      */
  /* ============================= */
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
    })

    socket.on('pedido_atualizado', (pedidoAtualizado: any) => {
      if (pedidoAtualizado.id === id) {
        setStatus(pedidoAtualizado.status)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [id])

  /* ============================= */
  /* STATUS FORMATADO              */
  /* ============================= */
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

  /* ============================= */
  /* LOADING                       */
  /* ============================= */
  if (!pedido) {
    return (
      <div className="acompanhamento-page">
        <p className="acompanhamento-loading">
          Carregando pedido...
        </p>
      </div>
    )
  }

  /* ============================= */
  /* UI                            */
  /* ============================= */
  return (
    <div className="acompanhamento-page">

      <div className="acompanhamento-card">

        <h1 className="acompanhamento-title">
          📡 Acompanhamento
        </h1>

        <div className="acompanhamento-bloco">
          <div className="acompanhamento-label">
            Número do pedido
          </div>
          <div className="acompanhamento-valor">
            {pedido.id}
          </div>
        </div>

        <div className="acompanhamento-bloco">
          <div className="acompanhamento-label">
            Total
          </div>
          <div className="acompanhamento-valor">
            R$ {Number(pedido.total).toFixed(2)}
          </div>
        </div>

        <div className="acompanhamento-bloco">
          <div className="acompanhamento-label">
            Status do pedido
          </div>

          <div className={`acompanhamento-status status-${status}`}>
            {statusInfo.texto}
          </div>
        </div>

        {/* ========================= */}
        /* BARRA DE PROGRESSO        */
        /* ========================= */

        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${statusInfo.progresso}%` }}
          />
        </div>

      </div>

    </div>
  )
}