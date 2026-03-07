import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const socketUrl = 'http://localhost:3000'

export default function Acompanhamento() {
  const { id } = useParams()
  const [pedido, setPedido] = useState<any>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    // 🔎 1️⃣ Buscar pedido inicial
    async function loadPedido() {
      try {
        const response = await api.get(`/pedido/${id}`)
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
    const socket = io(socketUrl)

    socket.on('connect', () => {
      console.log('🟢 Conectado ao socket')
    })

    socket.on('pedido_atualizado', (pedidoAtualizado) => {
      console.log('📡 Evento recebido:', pedidoAtualizado)

      if (pedidoAtualizado.id === id) {
        setStatus(pedidoAtualizado.status)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [id])

  if (!pedido) {
    return <p style={{ padding: 20 }}>Carregando pedido...</p>
  }

  const origem = localStorage.getItem("origemPedido") || "site"

  const mensagem = `
Olá! 

Recebemos seu pedido #${pedido.id}

Total: R$ ${pedido.total}

Origem: ${origem}

Status atual: ${status}

Em breve confirmaremos seu pedido.
  `

  const numeroLoja = "5511914176406" // coloque seu WhatsApp aqui

  const whatsappLink =
    `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`

  return (
    <div style={{ padding: 20 }}>
      <h1>📡 Acompanhamento</h1>

      <p>Número do pedido:</p>
      <h2>{pedido.id}</h2>

      <p>Total:</p>
      <h2>R$ {pedido.total}</h2>

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
