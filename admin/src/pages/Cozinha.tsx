import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Cozinha() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [mostrarEntregues, setMostrarEntregues] = useState(false)
  const [hora, setHora] = useState(new Date())

  const intervaloSom = useRef<any>(null)
  const navigate = useNavigate()

  function tocarSom() {
    try {
      const audio = new Audio('/novo-pedido.mp3')
      audio.volume = 1
      audio.play().catch(() => {})
    } catch {}
  }

  useEffect(() => {
    const socket = io('https://api.acaiecompanhia.com.br', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    async function carregarPedidos() {
      try {
        const res = await api.get('/pedidos')
        setPedidos(res.data.data || [])
      } catch (err) {
        console.error('Erro ao carregar pedidos', err)
      }
    }

    carregarPedidos()

    socket.on('connect', () => {
      console.log('🟢 Socket conectado:', socket.id)
      carregarPedidos()
    })

    socket.on('disconnect', () => {
      console.log('🔴 Socket desconectado')
    })

    socket.on('novo_pedido', (pedido) => {
      tocarSom()

      setPedidos((prev) => {
        const jaExiste = prev.find((p) => p.id === pedido.id)
        if (jaExiste) return prev
        return [pedido, ...prev]
      })
    })

    socket.on('pedido_atualizado', (pedidoAtualizado) => {
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p)),
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  /* ========================= */
  /* SOM REPETITIVO            */
  /* ========================= */
  useEffect(() => {
    const temPedidoNovo = pedidos.some((p) => p.status === 'RECEBIDO')

    if (temPedidoNovo) {
      if (!intervaloSom.current) {
        intervaloSom.current = setInterval(() => {
          console.log('🔔 Lembrete de pedido pendente')
          tocarSom()
        }, 60000)
      }
    } else {
      if (intervaloSom.current) {
        clearInterval(intervaloSom.current)
        intervaloSom.current = null
      }
    }
  }, [pedidos])

  /* ========================= */
  /* RELÓGIO                   */
  /* ========================= */
  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date()
      setHora(agora)

      if (
        agora.getHours() === 0 &&
        agora.getMinutes() === 0 &&
        agora.getSeconds() === 0
      ) {
        console.log('⏰ Virou o dia!')
        setPedidos([])
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function ordenar(lista: any[]) {
    return [...lista].sort(
      (a, b) =>
        new Date(a.criadoEm || a.createdAt).getTime() -
        new Date(b.criadoEm || b.createdAt).getTime(),
    )
  }

  const novos = ordenar(pedidos.filter((p) => p.status === 'RECEBIDO'))
  const preparo = ordenar(pedidos.filter((p) => p.status === 'EM_PREPARO'))
  const prontos = ordenar(pedidos.filter((p) => p.status === 'PRONTO'))
  const entregues = ordenar(pedidos.filter((p) => p.status === 'ENTREGUE'))

  const diaSemana = hora.toLocaleDateString('pt-BR', { weekday: 'long' })
  const data = hora.toLocaleDateString('pt-BR')
  const horaAtual = hora.toLocaleTimeString('pt-BR')

  return (
    <div style={{ padding: 20, background: '#f5f5f5', minHeight: '100vh' }}>

      {/* ========================= */}
      {/* MENU DE NAVEGAÇÃO         */}
      {/* ========================= */}
      <h1 style={{ marginBottom: 30 }}>
        {diaSemana} – {data} – {horaAtual}
      </h1>
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        flexWrap: 'wrap'
      }}>
        <button onClick={() => navigate('/auditoria')} style={botaoMenu}>📊 Auditoria</button>
        <button onClick={() => navigate('/pedidos')} style={botaoMenu}>📦 Pedidos</button>
        <button onClick={() => navigate('/produtos')} style={botaoMenu}>🛒 Produtos</button>
        <button onClick={() => navigate('/dashboard')} style={botaoMenu}>📈 Dashboard</button>
        
      </div>

      

      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#f44336" />
        <CardStatus titulo="👨‍🍳 Em preparo" valor={preparo.length} cor="#ff9800" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#4caf50" />

        <div onClick={() => setMostrarEntregues(!mostrarEntregues)} style={{ cursor: 'pointer' }}>
          <CardStatus titulo="📦 Entregues" valor={entregues.length} cor="#9e9e9e" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        <Coluna titulo="🆕 Novos Pedidos" pedidos={novos} />
        <Coluna titulo="👨‍🍳 Em Preparo" pedidos={preparo} />
        <Coluna titulo="✅ Prontos" pedidos={prontos} />
      </div>

      {mostrarEntregues && (
        <div style={{ marginTop: 30 }}>
          <Coluna titulo="📦 Entregues" pedidos={entregues} reduzido />
        </div>
      )}
    </div>
  )
}

/* ========================= */
/* ESTILO BOTÃO MENU         */
/* ========================= */

const botaoMenu = {
  padding: '10px 15px',
  borderRadius: 8,
  border: 'none',
  background: '#333',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 'bold'
}

/* ========================= */
/* COMPONENTES               */
/* ========================= */

function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div style={{
      background: cor,
      padding: 15,
      borderRadius: 10,
      minWidth: 120,
      textAlign: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      color: '#fff',
      fontWeight: 'bold',
    }}>
      <strong>{titulo}</strong>
      <div style={{ fontSize: 24 }}>{valor}</div>
    </div>
  )
}

function Coluna({ titulo, pedidos, reduzido }: any) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 10,
      padding: 20,
      minHeight: reduzido ? 200 : 400,
    }}>
      <h2 style={{ marginBottom: 20 }}>{titulo}</h2>
      {pedidos.length === 0 && <p style={{ color: '#777' }}>Nenhum pedido</p>}
      {pedidos.map((pedido: any) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}
    </div>
  )
}

/* ========================= */
/* CARD DO PEDIDO            */
/* ========================= */

function PedidoCard({ pedido }: any) {
  const [tempo, setTempo] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const inicio = new Date(
        pedido.atualizadoEm || pedido.updatedAt || pedido.criadoEm,
      )
      const diff = Date.now() - inicio.getTime()
      const minutos = Math.floor(diff / 60000)
      const segundos = Math.floor((diff % 60000) / 1000)
      setTempo(`${minutos}m ${segundos}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [pedido])

  async function atualizarStatus(status: string) {
    try {
      await api.patch(`/pedidos/${pedido.id}/status`, { status })
    } catch {
      alert('Erro ao atualizar pedido')
    }
  }

  function enviarWhatsApp(telefone: string) {
    const numero = telefone.replace(/\D/g, '')
    const mensagem = encodeURIComponent(
      '🍧 Seu pedido está PRONTO para retirada no balcão!',
    )
    const url = `https://wa.me/55${numero}?text=${mensagem}`
    window.open(url, '_blank')
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      background: '#fff',
    }}>
      <h3>Pedido #{pedido.id.slice(0, 6)}</h3>
      <p><strong>Status:</strong> {pedido.status} – ⏱ {tempo}</p>
      <p><strong>Total:</strong> R$ {pedido.total}</p>

      <div style={{ marginTop: 10 }}>
        {pedido.status === 'RECEBIDO' && (
          <button onClick={() => atualizarStatus('EM_PREPARO')}>
            Iniciar preparo
          </button>
        )}

        {pedido.status === 'EM_PREPARO' && (
          <button
            onClick={() => atualizarStatus('PRONTO')}
            style={{ marginLeft: 10, background: '#4caf50', color: '#fff' }}
          >
            Marcar pronto
          </button>
        )}

        {pedido.status === 'PRONTO' && (
          <>
            <button
              onClick={() => atualizarStatus('ENTREGUE')}
              style={{ marginLeft: 10, background: '#2196f3', color: '#fff' }}
            >
              QUITADO
            </button>

            {pedido.telefone && (
              <button
                onClick={() => enviarWhatsApp(pedido.telefone)}
                style={{ marginLeft: 10, background: '#25D366', color: '#fff' }}
              >
                📲 Avisar cliente
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}