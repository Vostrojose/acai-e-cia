import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

import BalcaoModal from "../components/BalcaoModal";

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

  const [abrirBalcao, setAbrirBalcao] = useState(false)

  useEffect(() => {
    let wakeLock: any = null

    async function ativarWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen')
        }
      } catch {}
    }

    ativarWakeLock()

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        ativarWakeLock()
      }
    })

    return () => {
      wakeLock?.release()
    }
  }, [])

  useEffect((): (() => void) => {
    const socket = io('https://api.acaiecompanhia.com.br', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    const carregarPedidos = async () => {
      try {
        const res = await api.get('/pedidos')
        setPedidos(res.data?.data || [])
      } catch {}
    }

    carregarPedidos()

    socket.on('novo_pedido', (pedido: any) => {
      tocarSom()

      setPedidos((prev) => {
        const index = prev.findIndex((p) => p.id === pedido.id)

        if (index !== -1) {
          const copia = [...prev]
          copia[index] = pedido
          return copia
        }

        return [pedido, ...prev]
      })
    })

    socket.on('pedido_atualizado', (pedidoAtualizado: any) => {
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p)),
      )
    })

    const intervalo = setInterval(carregarPedidos, 10000)

    return () => {
      socket.disconnect()
      clearInterval(intervalo)
    }
  }, [])

  function ordenar(lista: any[]) {
    return [...lista].sort(
      (a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime(),
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

  const novos = ordenar(pedidos.filter((p) => p.status === 'RECEBIDO'))
  const preparo = ordenar(pedidos.filter((p) => p.status === 'EM_PREPARO'))
  const prontos = ordenar(pedidos.filter((p) => p.status === 'PRONTO'))

  const entregues = ordenar(
    pedidos.filter((p) => p.status === 'ENTREGUE' && isHoje(p.criadoEm)),
  )

  return (
    <div style={theme.page}>
      <CardMenu navigate={navigate} onBalcao={() => setAbrirBalcao(true)} />

      <div style={headerGrid}>
        <CardRelogio />
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#e53935" />
        <CardStatus titulo="👨‍🍳 Preparo" valor={preparo.length} cor="#fb8c00" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#43a047" />

        <div onClick={() => setMostrarEntregues(!mostrarEntregues)}>
          <CardStatus
            titulo="📦 Entregues Hoje"
            valor={entregues.length}
            cor="#757575"
          />
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

      {abrirBalcao && (
        <BalcaoModal
          onClose={() => setAbrirBalcao(false)}
          onSuccess={() => console.log('Venda registrada')}
        />
      )}
    </div>
  )
}

/* ============================= */
/* 🔥 CARD STATUS NOVO ESTILO    */
/* ============================= */

function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(135deg, #1e1e1e, #2a2a2a)",
        padding: 20,
        borderRadius: 16,
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        border: `1px solid ${cor}`,
        position: "relative",
        textAlign: "center",
        minWidth: 120,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: cor,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />

      <div style={{ opacity: 0.8, fontSize: 14 }}>{titulo}</div>

      <div style={{ fontSize: 26, fontWeight: "bold", marginTop: 10 }}>
        {valor}
      </div>
    </div>
  )
}

/* ============================= */
/* 🔥 PEDIDO CARD NOVO ESTILO    */
/* ============================= */

function PedidoCard({ pedido }: any) {
  async function atualizarStatus(status: string) {
    await api.patch(`/pedidos/${pedido.id}/status`, { status })
  }

  function enviarWhatsApp() {
    if (!pedido.telefone) return

    const numero = pedido.telefone.replace(/\D/g, '')

    const mensagem = encodeURIComponent(
      ` Pedido #${pedido.codigo}\nSeu pedido está PRONTO para retirada!`,
    )

    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank')
  }

  return (
    <div
      style={{
        ...theme.card,
        background: "linear-gradient(135deg, #1e1e1e, #2a2a2a)",
        borderRadius: 16,
        border: "1px solid #333",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <strong>Pedido #{pedido.codigo}</strong>

      {pedido.itens?.map((item: any) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <strong>
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
        <button onClick={() => atualizarStatus('EM_PREPARO')}>INICIAR</button>
      )}

      {pedido.status === 'EM_PREPARO' && (
        <button onClick={() => atualizarStatus('PRONTO')}>PRONTO</button>
      )}

      {pedido.status === 'PRONTO' && (
        <>
          <button onClick={() => atualizarStatus('ENTREGUE')}>ENTREGUE</button>

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

/* ============================= */
/* RESTANTE INALTERADO           */
/* ============================= */

function CardMenu({ navigate, onBalcao }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
      <div style={{
        background: '#000',
        padding: 10,
        borderRadius: 10,
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <button onClick={() => navigate('/pedidos')} style={btnMenu}>📦</button>
        <button onClick={() => navigate('/produtos')} style={btnMenu}>🛒</button>
        <button onClick={() => navigate('/dashboard')} style={btnMenu}>📈</button>
        <button onClick={() => navigate('/auditoria')} style={btnMenu}>📊</button>
        <button onClick={onBalcao} style={btnMenu}>🧾 Vendas Balcão</button>
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

  return <div style={theme.card}>{hora.toLocaleTimeString()}</div>
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

const headerGrid = {
  display: 'flex',
  gap: 10,
  marginBottom: 20,
  flexWrap: 'wrap' as const,
}

const colunas = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 20,
}

const btnMenu = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16,
  cursor: 'pointer',
}
