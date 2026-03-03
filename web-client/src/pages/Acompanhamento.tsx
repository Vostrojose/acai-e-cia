import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'
import api from '../services/api'

const socketUrl = 'http://localhost:3000'

export default function Acompanhamento() {
  const { id } = useParams()
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    // 🔎 1️⃣ Buscar status inicial
    async function loadPedido() {
      try {
        const response = await api.get(`/pedidos`)
        const pedido = response.data.data.find(
          (p: any) => p.id === id
        )

        if (!pedido) {
          console.log('❌ Pedido não encontrado')
          return
        }

        setStatus(pedido.status)
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

    socket.on('pedido_atualizado', (pedido) => {
      console.log('📡 Evento recebido:', pedido)

      if (pedido.id === id) {
        setStatus(pedido.status)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [id])

  if (!status) {
    return <div style={{ padding: 20 }}>Carregando status...</div>
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📡 Acompanhamento</h1>
      <h2>Status: {status}</h2>
    </div>
  )
}
