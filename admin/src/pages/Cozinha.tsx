import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function Cozinha() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [mostrarEntregues, setMostrarEntregues] = useState(false)

  const navigate = useNavigate()

  function tocarSom() {
    try {
      const audio = new Audio('/novo-pedido.mp3')
      audio.play().catch(() => {})
    } catch {}
  }
useEffect(() => {
  const socket = io('https://api.acaiecompanhia.com.br')

  async function carregarPedidos(): Promise<void> {
    try {
      const res = await api.get('/pedidos')
      setPedidos(res.data?.data || [])
    } catch (err) {
      console.error('Erro ao carregar pedidos', err)
    }
  }

  carregarPedidos()

  socket.on('novo_pedido', (pedido: any) => {
    tocarSom()
    setPedidos((prev) => [pedido, ...prev])
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

  function ordenar(lista: any[]) {
    return [...lista].sort(
      (a, b) =>
        new Date(a.criadoEm).getTime() -
        new Date(b.criadoEm).getTime()
    )
  }

  function isHoje(data: any) {
    if (!data) return false
    const d = new Date(data)
    const hoje = new Date()

    return (
      d.getDate() === hoje.getDate() &&
      d.getMonth() === hoje.getMonth() &&
      d.getFullYear() === hoje.getFullYear()
    )
  }

  const novos = ordenar(pedidos.filter(p => p.status === 'RECEBIDO'))
  const preparo = ordenar(pedidos.filter(p => p.status === 'EM_PREPARO'))
  const prontos = ordenar(pedidos.filter(p => p.status === 'PRONTO'))

  const entregues = ordenar(
    pedidos.filter(
      p => p.status === 'ENTREGUE' && isHoje(p.criadoEm)
    )
  )

  return (
    <div style={theme.page}>

      <CardMenu navigate={navigate} />

      <div style={headerGrid}>
        <CardRelogio />
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#e53935" />
        <CardStatus titulo="👨‍🍳 Preparo" valor={preparo.length} cor="#fb8c00" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#43a047" />

        <div onClick={() => setMostrarEntregues(!mostrarEntregues)}>
          <CardStatus titulo="📦 Entregues Hoje" valor={entregues.length} cor="#757575" />
        </div>
      </div>

      <div style={colunas}>
        <Coluna titulo="🆕 NOVOS" pedidos={novos} />
        <Coluna titulo="👨‍🍳 PREPARO" pedidos={preparo} />
        <Coluna titulo="✅ PRONTOS" pedidos={prontos} />
      </div>

      {mostrarEntregues && (
        <div style={{ marginTop: 20 }}>
          <div style={theme.column}>
            <h2 style={theme.title}>📦 ENTREGUES HOJE</h2>

            {entregues.length === 0 && (
              <p style={theme.textMuted}>Nenhum pedido entregue hoje</p>
            )}

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
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => navigate('/pedidos')}>Pedidos</button>
      <button onClick={() => navigate('/produtos')}>Produtos</button>
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
    <div style={theme.card}>
      <div>{hora.toLocaleTimeString()}</div>
    </div>
  )
}

function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div style={{ background: cor, padding: 10, borderRadius: 10 }}>
      <div>{titulo}</div>
      <strong>{valor}</strong>
    </div>
  )
}

function Coluna({ titulo, pedidos }: any) {
  return (
    <div style={theme.column}>
      <h2>{titulo}</h2>
      {pedidos.map((p: any) => (
        <PedidoCard key={p.id} pedido={p} />
      ))}
    </div>
  )
}

function PedidoCard({ pedido }: any) {

  async function atualizarStatus(status: string) {
    await api.patch(`/pedidos/${pedido.id}/status`, { status })
  }

  function enviarWhatsApp() {
    if (!pedido.telefone) return

    const numero = pedido.telefone.replace(/\D/g, '')

    const mensagem = encodeURIComponent(
      `🍧 Pedido #${pedido.codigo}\nSeu pedido está PRONTO para retirada!`
    )

    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank')
  }

  return (
    <div style={theme.card}>
      <strong>Pedido #{pedido.codigo}</strong>

      {pedido.itens?.map((item: any) => (
        <div key={item.id}>
          {item.quantidade}x {item.produto?.nome}
        </div>
      ))}

      {pedido.status === 'RECEBIDO' && (
        <button onClick={() => atualizarStatus('EM_PREPARO')}>
          INICIAR
        </button>
      )}

      {pedido.status === 'EM_PREPARO' && (
        <button onClick={() => atualizarStatus('PRONTO')}>
          PRONTO
        </button>
      )}

      {pedido.status === 'PRONTO' && (
        <>
          <button onClick={() => atualizarStatus('ENTREGUE')}>
            ENTREGUE
          </button>

          {pedido.telefone && (
            <button onClick={enviarWhatsApp} style={{ marginTop: 8 }}>
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
  gap: 10,
  marginBottom: 20,
  flexWrap: 'wrap' as const
}

const colunas = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 20
}