import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext' // ✅ NOVO

// 🔥 PRODUÇÃO (usar API real)
const socketUrl = 'https://api.acaiecompanhia.com.br'

export default function Acompanhamento() {
  const { id } = useParams()
  const [pedido, setPedido] = useState<any>(null)
  const [status, setStatus] = useState<string | null>(null)

  const { limparCarrinho } = useCart() // ✅ NOVO

  /* ============================= */
  /* LIMPAR CARRINHO AO ENTRAR     */
  /* ============================= */
  useEffect(() => {
    if (id) {
      try {
        limparCarrinho()
        localStorage.removeItem('pedidoId')
        console.log('🧹 Carrinho limpo após acesso ao acompanhamento')
      } catch (err) {
        console.warn('⚠️ Erro ao limpar carrinho:', err)
      }
    }
  }, [id, limparCarrinho])

  /* ============================= */
  /* CARREGAR PEDIDO + SOCKET      */
  /* ============================= */
  useEffect(() => {
    if (!id) return

    // 🔎 1️⃣ Buscar pedido inicial
    async function loadPedido() {
      try {
        const response = await api.get(`/pedidos/${id}`)
        const pedidoData = response.data.data

        if (!pedidoData) {
          console.log('❌ Pedido não encontrado')
          return
        }

        setPedido(pedidoData)
        setStatus(pedidoData.status)
      } catch (error) {
        console.error('Erro ao carregar pedido:', error)
      }
    }

    loadPedido()

    // 🔌 2️⃣ Conectar websocket
    const socket = io(socketUrl, {
      transports: ['websocket'], // ✅ mais estável em produção
    })

    socket.on('connect', () => {
      console.log('🟢 Conectado ao socket')
    })

    socket.on('pedido_atualizado', (pedidoAtualizado: any) => {
      console.log('📡 Evento recebido:', pedidoAtualizado)

      if (pedidoAtualizado.id === id) {
        setStatus(pedidoAtualizado.status)
      }
    })

    socket.on('disconnect', () => {
      console.log('🔌 Socket desconectado')
    })

    return () => {
      socket.disconnect()
    }
  }, [id])

  /* ============================= */
  /* LOADING                       */
  /* ============================= */
  if (!pedido) {
    return <p style={{ padding: 20 }}>Carregando pedido...</p>
  }

  /* ============================= */
  /* WHATSAPP                      */
  /* ============================= */
  const origem = localStorage.getItem('origemPedido') || 'site'

  const mensagem = `
Olá! 

Recebemos seu pedido #${pedido.id}

Total: R$ ${Number(pedido.total).toFixed(2)}

Origem: ${origem}

Status atual: ${status}

Em breve confirmaremos seu pedido.
  `

  const numeroLoja = "5511914176406" // ajuste se necessário

  const whatsappLink =
    `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`

  /* ============================= */
  /* UI                            */
  /* ============================= */
  return (
    <div style={{ padding: 20 }}>
      <h1>📡 Acompanhamento</h1>

      <p>Número do pedido:</p>
      <h2>{pedido.id}</h2>

      <p>Total:</p>
      <h2>R$ {Number(pedido.total).toFixed(2)}</h2>

      <p>Status:</p>
      <h2>{status}</h2>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "15px 25px",
          backgroundColor: "#25D366",
          color: "white",
          textDecoration: "none",
          borderRadius: 8,
          fontWeight: "bold"
        }}
      >
        📲 Confirmar no WhatsApp
      </a>
    </div>
  )
}