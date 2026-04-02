import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

/* ========================= */
/* SOCKET GLOBAL (FIXO)      */
/* ========================= */
const socket = io('https://api.acaiecompanhia.com.br', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
})

/* ========================= */
/* ÁUDIO GLOBAL              */
/* ========================= */
const audioGlobal = new Audio('/novo-pedido.mp3')
audioGlobal.volume = 1

export default function Cozinha() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [mostrarEntregues, setMostrarEntregues] = useState(false)
  const [hora, setHora] = useState(new Date())

  const intervaloSom = useRef<any>(null)
  const navigate = useNavigate()

  /* ========================= */
  /* TOCAR SOM                 */
  /* ========================= */
  function tocarSom() {
    try {
      audioGlobal.currentTime = 0
      audioGlobal.play().catch(() => {
        console.warn('🔇 Áudio bloqueado pelo navegador')
      })
    } catch {}
  }

  /* ========================= */
  /* LIBERAR ÁUDIO (TABLET)    */
  /* ========================= */
  useEffect(() => {
    const liberarAudio = () => {
      audioGlobal.play()
        .then(() => {
          audioGlobal.pause()
          audioGlobal.currentTime = 0
          console.log('🔊 Áudio liberado')
        })
        .catch(() => {})

      window.removeEventListener('click', liberarAudio)
    }

    window.addEventListener('click', liberarAudio)
  }, [])

  /* ========================= */
  /* SOCKET + PEDIDOS          */
  /* ========================= */
  useEffect(() => {

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
      console.log('🔥 NOVO PEDIDO RECEBIDO')

      tocarSom()

      setPedidos((prev) => {
        const jaExiste = prev.find((p) => p.id === pedido.id)
        if (jaExiste) return prev
        return [pedido, ...prev]
      })
    })

    socket.on('pedido_atualizado', (pedidoAtualizado) => {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoAtualizado.id ? pedidoAtualizado : p
        )
      )
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('novo_pedido')
      socket.off('pedido_atualizado')
    }

  }, [])

  /* ========================= */
  /* SOM REPETITIVO            */
  /* ========================= */
  useEffect(() => {
    const temPedidoNovo = pedidos.some((p) => p.status === 'RECEBIDO')

    if (temPedidoNovo && !intervaloSom.current) {
      console.log('🔔 Iniciando alerta sonoro')

      intervaloSom.current = setInterval(() => {
        tocarSom()
      }, 60000)
    }

    if (!temPedidoNovo && intervaloSom.current) {
      console.log('🔕 Parando alerta')

      clearInterval(intervaloSom.current)
      intervaloSom.current = null
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

      {/* MENU */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/auditoria')} style={botaoMenu}>📊 Auditoria</button>
        <button onClick={() => navigate('/pedidos')} style={botaoMenu}>📦 Pedidos</button>
        <button onClick={() => navigate('/produtos')} style={botaoMenu}>🛒 Produtos</button>
      </div>

      <h1 style={{ marginBottom: 30 }}>
        {diaSemana} – {data} – {horaAtual}
      </h1>

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
/* ESTILO MENU               */
/* ========================= */
const botaoMenu = {
  padding: '10px 15px',
  borderRadius: 8,
  border: 'none',
  background: '#333',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 'bold',
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
      background: '#fff',
      borderRadius: 10,
      padding: 20,
      minHeight: reduzido ? 200 : 400,
    }}>
      <h2>{titulo}</h2>
      {pedidos.map((p: any) => <PedidoCard key={p.id} pedido={p} />)}
    </div>
  )
}

function PedidoCard({ pedido }: any) {
  const [tempo, setTempo] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const inicio = new Date(pedido.updatedAt || pedido.criadoEm)
      const diff = Date.now() - inicio.getTime()
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTempo(`${m}m ${s}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [pedido])

  async function atualizarStatus(status: string) {
    await api.patch(`/pedidos/${pedido.id}/status`, { status })
  }

  function enviarWhatsApp(telefone: string) {
    const numero = telefone.replace(/\D/g, '')
    const msg = encodeURIComponent('🍧 Seu pedido está PRONTO!')
    window.open(`https://wa.me/55${numero}?text=${msg}`, '_blank')
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 15, marginBottom: 10 }}>
      <h3>Pedido #{pedido.id.slice(0, 6)}</h3>
      <p>{pedido.status} – ⏱ {tempo}</p>

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
        <>
          <button onClick={() => atualizarStatus('ENTREGUE')}>
            QUITADO
          </button>

          {pedido.telefone && (
            <button onClick={() => enviarWhatsApp(pedido.telefone)}>
              📲 Avisar cliente
            </button>
          )}
        </>
      )}
    </div>
  )
}