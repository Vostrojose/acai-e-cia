import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Cozinha() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [mostrarEntregues, setMostrarEntregues] = useState(false)
  const [hora, setHora] = useState(new Date())

 const intervaloSom = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  function tocarSom() {
    try {
      const audio = new Audio('/novo-pedido.mp3')
      audio.volume = 1
      audio.play().catch(() => {})
    } catch {}
  }

  /* SOCKET */
  useEffect(() => {
    const socket = io('https://api.acaiecompanhia.com.br', {
      transports: ['websocket'],
      reconnection: true,
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

    socket.on('connect', carregarPedidos)

    socket.on('novo_pedido', (pedido: any) => {
      tocarSom()
      setPedidos((prev) => {
        const jaExiste = prev.find((p) => p.id === pedido.id)
        if (jaExiste) return prev
        return [pedido, ...prev]
      })
    })

    socket.on('pedido_atualizado', (pedidoAtualizado: any) => {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoAtualizado.id ? pedidoAtualizado : p
        )
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  /* SOM REPETITIVO */
  useEffect(() => {
    const temPedidoNovo = pedidos.some((p) => p.status === 'RECEBIDO')

    if (temPedidoNovo && !intervaloSom.current) {
      intervaloSom.current = setInterval(() => {
        tocarSom()
      }, 60000)
    }

    if (!temPedidoNovo && intervaloSom.current) {
      clearInterval(intervaloSom.current)
      intervaloSom.current = null
    }
  }, [pedidos])

  /* RELÓGIO */
  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date()
      setHora(agora)

      if (
        agora.getHours() === 0 &&
        agora.getMinutes() === 0 &&
        agora.getSeconds() === 0
      ) {
        setPedidos([])
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function ordenar(lista: any[]) {
    return [...lista].sort(
      (a, b) =>
        new Date(a.criadoEm || a.createdAt).getTime() -
        new Date(b.criadoEm || b.createdAt).getTime()
    )
  }

  const novos = ordenar(pedidos.filter((p) => p.status === 'RECEBIDO'))
  const preparo = ordenar(pedidos.filter((p) => p.status === 'EM_PREPARO'))
  const prontos = ordenar(pedidos.filter((p) => p.status === 'PRONTO'))
  const entregues = ordenar(pedidos.filter((p) => p.status === 'ENTREGUE'))

  return (
    <div style={{ padding: 20, background: '#f5f5f5', minHeight: '100vh' }}>

      {/* TOPO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >

        {/* ESQUERDA */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              gap: 20,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <CardRelogio hora={hora} />

            <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#f44336" />
            <CardStatus titulo="👨‍🍳 Em preparo" valor={preparo.length} cor="#ff9800" />
            <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#4caf50" />

            <div
              onClick={() => setMostrarEntregues(!mostrarEntregues)}
              style={{ cursor: 'pointer' }}
            >
              <CardStatus titulo="📦 Entregues" valor={entregues.length} cor="#9e9e9e" />
            </div>
          </div>
        </div>

        {/* DIREITA */}
        <CardMenu navigate={navigate} />
      </div>

      {/* COLUNAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 20,
        }}
      >
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

/* BOTÃO */
const botaoMenu = {
  padding: '10px',
  borderRadius: 8,
  border: 'none',
  background: '#333',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 'bold',
}

/* RELÓGIO */
function CardRelogio({ hora }: { hora: Date }) {
  const diaSemana = hora
    .toLocaleDateString('pt-BR', { weekday: 'long' })
    .replace('-feira', '')
  const data = hora.toLocaleDateString('pt-BR').replace(/\//g, '-')
  const horaAtual = hora.toLocaleTimeString('pt-BR')

  return (
 <div
  style={{
    background: '#111',
    color: '#fff',
    padding: 5,        // 👈 diminui espaço interno
    borderRadius: 10,    // 👈 opcional (mais compacto)
    minWidth: 140,      // 👈 diminui largura
    textAlign: 'center',
  }}
>
      <div>{diaSemana.toUpperCase()}</div>
      <div style={{ fontSize: 22 }}>{data}</div>
      <div style={{ fontSize: 26 }}>{horaAtual}</div>
    </div>
  )
}

/* MENU */
function CardMenu({ navigate }: any) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 15,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 180,
        position: 'sticky',
        top: 20,
      }}
    >
      <button onClick={() => navigate('/auditoria')} style={botaoMenu}>📊 Auditoria</button>
      <button onClick={() => navigate('/pedidos')} style={botaoMenu}>📦 Pedidos</button>
      <button onClick={() => navigate('/produtos')} style={botaoMenu}>🛒 Produtos</button>
      <button onClick={() => navigate('/dashboard')} style={botaoMenu}>📈 Dashboard</button>
    </div>
  )
}

/* STATUS */
function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        background: cor,
        padding: 15,
        borderRadius: 10,
        minWidth: 140,
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
      }}
    >
      <strong>{titulo}</strong>
      <div style={{ fontSize: 34 }}>{valor}</div>
    </div>
  )
}

/* COLUNA */
function Coluna({ titulo, pedidos, reduzido }: any) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: 20,
        minHeight: reduzido ? 200 : 400,
      }}
    >
      <h2>{titulo}</h2>
      {pedidos.length === 0 && <p>Nenhum pedido</p>}
      {pedidos.map((pedido: any) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}
    </div>
  )
}

/* PEDIDO */
function PedidoCard({ pedido }: any) {
  const [tempo, setTempo] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const inicio = new Date(
        pedido.atualizadoEm || pedido.updatedAt || pedido.criadoEm
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

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        background: '#fff',
      }}
    >
      <h3>Pedido #{pedido.id.slice(0, 6)}</h3>
      <p>Status: {pedido.status} – ⏱ {tempo}</p>

      {pedido.status === 'RECEBIDO' && (
        <button onClick={() => atualizarStatus('EM_PREPARO')}>
          Iniciar preparo
        </button>
      )}

      {pedido.status === 'EM_PREPARO' && (
        <button onClick={() => atualizarStatus('PRONTO')}>
          Marcar pronto
        </button>
      )}

      {pedido.status === 'PRONTO' && (
        <button onClick={() => atualizarStatus('ENTREGUE')}>
          QUITADO
        </button>
      )}
    </div>
  )
}