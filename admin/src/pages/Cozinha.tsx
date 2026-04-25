import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

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
    <div style={theme.page}>

      <CardMenu navigate={navigate} />

      <div style={headerGrid}>
        <CardRelogio />
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#e53935" />
        <CardStatus titulo="👨‍🍳 Preparo" valor={preparo.length} cor="#fb8c00" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#43a047" />

        <div onClick={() => setMostrarEntregues(!mostrarEntregues)}>
          <CardStatus titulo="📦 Entregues" valor={entregues.length} cor="#757575" />
        </div>
      </div>

      <div style={colunas}>
        <Coluna titulo="🆕 NOVOS" pedidos={novos} />
        <Coluna titulo="👨‍🍳 PREPARO" pedidos={preparo} />
        <Coluna titulo="✅ PRONTOS" pedidos={prontos} />
      </div>

      {/* 🔥 CORREÇÃO: MOSTRAR ENTREGUES ABAIXO */}
      {mostrarEntregues && (
        <div style={{ marginTop: 20 }}>
          <div style={theme.column}>
            <h2 style={theme.title}>📦 ENTREGUES HOJE</h2>

            {entregues.map((pedido: any) => (
              <PedidoCard key={pedido.id} pedido={pedido} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

/* COMPONENTES */

function CardMenu({ navigate }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
      <div style={{ background: '#000', padding: 10, borderRadius: 10, display: 'flex', gap: 10 }}>
        <button style={btnMenu} onClick={() => navigate('/auditoria')}>📊</button>
        <button style={btnMenu} onClick={() => navigate('/pedidos')}>📦</button>
        <button style={btnMenu} onClick={() => navigate('/produtos')}>🛒</button>
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
    <div style={{ ...theme.card, textAlign: 'center' }}>
      <div>{hora.toLocaleDateString('pt-BR')}</div>
      <div style={{ fontSize: 22 }}>{hora.toLocaleTimeString('pt-BR')}</div>
    </div>
  )
}

function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div style={{
      background: cor,
      padding: 16,
      borderRadius: 12,
      minWidth: 140,
      textAlign: 'center',
      fontWeight: 'bold'
    }}>
      <div>{titulo}</div>
      <div style={{ fontSize: 32 }}>{valor}</div>
    </div>
  )
}

function Coluna({ titulo, pedidos }: any) {
  return (
    <div style={theme.column}>
      <h2 style={theme.title}>{titulo}</h2>

      {pedidos.map((pedido: any) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}
    </div>
  )
}

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
    <div style={theme.card}>
      <h3>Pedido #{pedido.codigo}</h3>

      <p style={theme.textMuted}>
        {pedido.status} – ⏱ {tempo}
      </p>

      {pedido.itens?.map((item: any) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <strong style={{ fontSize: 18 }}>
            {item.quantidade}x {item.produto?.nome}
          </strong>

          {item.adicionais?.length > 0 && (
            <div style={{ marginLeft: 10, color: '#ffcc80' }}>
              {item.adicionais.map((add: any) => (
                <div key={add.id}>+ {add.nome}</div>
              ))}
            </div>
          )}
        </div>
      ))}

      {pedido.status === 'RECEBIDO' && (
        <button style={{ ...theme.button, ...theme.buttonWarning }} onClick={() => atualizarStatus('EM_PREPARO')}>
          INICIAR
        </button>
      )}

      {pedido.status === 'EM_PREPARO' && (
        <button style={{ ...theme.button, ...theme.buttonSuccess }} onClick={() => atualizarStatus('PRONTO')}>
          PRONTO
        </button>
      )}

      {pedido.status === 'PRONTO' && (
        <>
          <button style={{ ...theme.button, ...theme.buttonPrimary }} onClick={() => atualizarStatus('ENTREGUE')}>
            ENTREGUE
          </button>

          {pedido.telefone && (
            <button
              style={{ ...theme.button, ...theme.buttonWhatsapp }}
              onClick={() => {
                const numero = pedido.telefone.replace(/\D/g, '')
                const mensagem = encodeURIComponent(`Seu pedido #${pedido.codigo} está PRONTO! 🎉`)
                window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank')
              }}
            >
              📲 WhatsApp
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* ESTILOS */

const headerGrid = {
  display: 'flex',
  gap: 20,
  flexWrap: 'wrap' as const,
  marginBottom: 20
}

const colunas = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 20
}

const btnMenu = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16,
  cursor: 'pointer'
}