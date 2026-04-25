import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Cozinha() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [mostrarEntregues, setMostrarEntregues] = useState(false)

  const intervaloSom = useRef<ReturnType<typeof setInterval> | null>(null)
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
    })

    async function carregarPedidos() {
      try {
        const res = await api.get('/pedidos')
        setPedidos(res.data?.data || [])
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
      if (intervaloSom.current) {
        clearInterval(intervaloSom.current)
        intervaloSom.current = null
      }
    }
  }, [])

  useEffect(() => {
    const temPedidoNovo = pedidos.some((p) => p.status === 'RECEBIDO')

    if (temPedidoNovo && !intervaloSom.current) {
      intervaloSom.current = setInterval(tocarSom, 60000)
    }

    if (!temPedidoNovo && intervaloSom.current) {
      clearInterval(intervaloSom.current)
      intervaloSom.current = null
    }
  }, [pedidos])

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
    <div style={{
      padding: 20,
      background: '#6d10f9a2',
      minHeight: '100vh',
    }}>
      <CardMenu navigate={navigate} />

      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 20,
      }}>
        <CardRelogio />
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#f44336" />
        <CardStatus titulo="👨‍🍳 Em preparo" valor={preparo.length} cor="#ff9800" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#4caf50" />
        <div onClick={() => setMostrarEntregues(!mostrarEntregues)}>
          <CardStatus titulo="📦 Entregues" valor={entregues.length} cor="#9e9e9e" />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 30,
      }}>
        <Coluna titulo="🆕 Novos Pedidos" pedidos={novos} />
        <Coluna titulo="👨‍🍳 Em Preparo" pedidos={preparo} />
        <Coluna titulo="✅ Prontos" pedidos={prontos} />
      </div>

      {mostrarEntregues && (
        <div style={{ marginTop: 30 }}>
          <Coluna titulo="📦 Entregues" pedidos={entregues} />
        </div>
      )}
    </div>
  )
}

/* COMPONENTES */

function CardMenu({ navigate }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
      <div style={{ background: '#111', padding: 10, borderRadius: 10, display: 'flex', gap: 10 }}>
        <button onClick={() => navigate('/auditoria')} style={botaoMenu}>📊 Auditoria</button>
        <button onClick={() => navigate('/pedidos')} style={botaoMenu}>📦 Pedidos</button>
        <button onClick={() => navigate('/produtos')} style={botaoMenu}>🛒 Produtos</button>
        <button onClick={() => navigate('/dashboard')} style={botaoMenu}>📈 Dashboard</button>
      </div>
    </div>
  )
}

function CardRelogio() {
  const [hora, setHora] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ background: '#111', color: '#fff', padding: 10, borderRadius: 10 }}>
      <div>{hora.toLocaleDateString('pt-BR')}</div>
      <div>{hora.toLocaleTimeString('pt-BR')}</div>
    </div>
  )
}

function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div style={{
      background: cor,
      padding: 12,
      borderRadius: 10,
      minWidth: 120,
      textAlign: 'center',
      color: '#fff',
      fontWeight: 'bold'
    }}>
      <strong>{titulo}</strong>
      <div style={{ fontSize: 26 }}>{valor}</div>
    </div>
  )
}

function Coluna({ titulo, pedidos }: any) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 10, padding: 15 }}>
      <h2>{titulo}</h2>
      {pedidos.map((pedido: any) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}
    </div>
  )
}

/* 🔥 PEDIDO COM ADICIONAIS */

function PedidoCard({ pedido }: any) {
  const [tempo, setTempo] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const inicio = new Date(pedido.criadoEm)
      const diff = Date.now() - inicio.getTime()
      const minutos = Math.floor(diff / 60000)
      const segundos = Math.floor((diff % 60000) / 1000)
      setTempo(`${minutos}m ${segundos}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [pedido])

  async function atualizarStatus(status: string) {
    await api.patch(`/pedidos/${pedido.id}/status`, { status })
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12
    }}>
      <h3>Pedido #{pedido.codigo}</h3>
      <p>{pedido.status} – ⏱ {tempo}</p>

      <strong>Itens:</strong>

      {pedido.itens?.map((item: any) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <div>
            <strong>{item.quantidade}x {item.produto?.nome}</strong>
            {item.produto?.descricao && (
              <span style={{ fontSize: 12 }}> – {item.produto.descricao}</span>
            )}
          </div>

          {/* 🔥 ADICIONAIS */}
          {item.adicionais?.length > 0 && (
            <div style={{ marginLeft: 10 }}>
              {item.adicionais.map((add: any) => (
                <div key={add.id}>+ {add.nome}</div>
              ))}
            </div>
          )}
        </div>
      ))}

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
          Entregar
        </button>
      )}
    </div>
  )
}

const botaoMenu = {
  padding: '8px 12px',
  borderRadius: 6,
  border: 'none',
  background: '#333',
  color: '#fff',
  cursor: 'pointer',
}