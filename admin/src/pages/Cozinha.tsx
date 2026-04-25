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
      background: '#1a1a1a',
      minHeight: '100vh',
      color: '#fff'
    }}>
      <CardMenu navigate={navigate} />

      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 20,
      }}>
        <CardRelogio />
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#e53935" />
        <CardStatus titulo="👨‍🍳 Preparo" valor={preparo.length} cor="#fb8c00" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#43a047" />

        <div onClick={() => setMostrarEntregues(!mostrarEntregues)}>
          <CardStatus titulo="📦 Entregues" valor={entregues.length} cor="#757575" />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
      }}>
        <Coluna titulo="🆕 NOVOS" pedidos={novos} />
        <Coluna titulo="👨‍🍳 PREPARO" pedidos={preparo} />
        <Coluna titulo="✅ PRONTOS" pedidos={prontos} />
      </div>
    </div>
  )
}

/* COMPONENTES */

function CardMenu({ navigate }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
      <div style={{ background: '#000', padding: 10, borderRadius: 10, display: 'flex', gap: 10 }}>
        <button onClick={() => navigate('/auditoria')} style={btnMenu}>📊</button>
        <button onClick={() => navigate('/pedidos')} style={btnMenu}>📦</button>
        <button onClick={() => navigate('/produtos')} style={btnMenu}>🛒</button>
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
    <div style={{ background: '#000', padding: 12, borderRadius: 10, textAlign: 'center', fontSize: 18 }}>
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
      fontSize: 18,
      fontWeight: 'bold'
    }}>
      <div>{titulo}</div>
      <div style={{ fontSize: 32 }}>{valor}</div>
    </div>
  )
}

function Coluna({ titulo, pedidos }: any) {
  return (
    <div style={{ background: '#2a2a2a', borderRadius: 12, padding: 15 }}>
      <h2 style={{ fontSize: 22 }}>{titulo}</h2>
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
    <div style={{
      background: '#111',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      border: '2px solid #444'
    }}>
      <h3 style={{ fontSize: 20 }}>
        Pedido #{pedido.codigo}
      </h3>

      <p style={{ fontSize: 14, color: '#ccc' }}>
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

      {/* BOTÕES */}

      {pedido.status === 'RECEBIDO' && (
        <button style={btnPreparo} onClick={() => atualizarStatus('EM_PREPARO')}>
          INICIAR
        </button>
      )}

      {pedido.status === 'EM_PREPARO' && (
        <button style={btnPronto} onClick={() => atualizarStatus('PRONTO')}>
          PRONTO
        </button>
      )}

      {pedido.status === 'PRONTO' && (
        <>
          <button style={btnEntregar} onClick={() => atualizarStatus('ENTREGUE')}>
            ENTREGUE
          </button>

          {pedido.telefone && (
            <button
              style={btnWhatsapp}
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

const btnMenu = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16
}

const btnPreparo = {
  background: '#fb8c00',
  color: '#fff',
  border: 'none',
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  fontSize: 16,
  width: '100%'
}

const btnPronto = {
  background: '#43a047',
  color: '#fff',
  border: 'none',
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  fontSize: 16,
  width: '100%'
}

const btnEntregar = {
  background: '#2196f3',
  color: '#fff',
  border: 'none',
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  fontSize: 16,
  width: '100%'
}

const btnWhatsapp = {
  background: '#25D366',
  color: '#fff',
  border: 'none',
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  fontSize: 16,
  width: '100%'
}