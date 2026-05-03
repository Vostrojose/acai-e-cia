import { useEffect, useState, useRef, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

import BalcaoModal from '../components/BalcaoModal'

export default function Cozinha() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [mostrarEntregues, setMostrarEntregues] = useState(false)
  const [totalEntreguesHoje, setTotalEntreguesHoje] = useState(0)
  const [abrirBalcao, setAbrirBalcao] = useState(false)

  const navigate = useNavigate()

  const carregandoRef = useRef(false)
  const socketRef = useRef<Socket | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  /* ============================= */
  /* AUDIO                      */
  /* ============================= */

  useEffect(() => {
    audioRef.current = new Audio('/novo-pedido.mp3')
  }, [])

  function tocarSom() {
    if (!audioRef.current) return

    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  /* ============================= */
  /* WAKE LOCK                  */
  /* ============================= */

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

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        ativarWakeLock()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLock?.release()
    }
  }, [])

  /* ============================= */
  /*  API                        */
  /* ============================= */

  async function carregarPedidos() {
    try {
      const res = await api.get('/pedidos')
      setPedidos(res.data?.data || [])
    } catch (err) {
      console.error('Erro ao carregar pedidos', err)
    }
  }

  async function carregarResumo() {
    try {
      const res = await api.get('/pedidos/entregues/hoje/count')
      setTotalEntreguesHoje(res.data.total || 0)
    } catch (err) {
      console.error('Erro ao carregar resumo', err)
    }
  }

  async function atualizarTudo() {
    if (carregandoRef.current) return

    try {
      carregandoRef.current = true
      await Promise.all([carregarPedidos(), carregarResumo()])
    } catch (err) {
      console.error('Erro geral atualização', err)
    } finally {
      carregandoRef.current = false
    }
  }

  /* ============================= */
  /* 🔌 SOCKET + POLLING SAFE      */
  /* ============================= */

  useEffect(() => {
    atualizarTudo()

    socketRef.current = io('https://api.acaiecompanhia.com.br', {
      transports: ['websocket'],
    })

    const socket = socketRef.current
    if (!socket) return

    socket.on('novo_pedido', async () => {
      tocarSom()
      await atualizarTudo()
    })

    socket.on('pedido_atualizado', async () => {
      await atualizarTudo()
    })

    const intervalo = setInterval(async () => {
      try {
        if (!carregandoRef.current) {
          await atualizarTudo()
        }
      } catch (err) {
        console.warn('Erro no refresh automático', err)
      }
    }, 15000)

    return () => {
      socket.off('novo_pedido')
      socket.off('pedido_atualizado')
      socket.disconnect()
      clearInterval(intervalo)
    }
  }, [])

  /* ============================= */
  /*  HELPERS                    */
  /* ============================= */

  function ordenar(lista: any[]) {
    return [...lista].sort(
      (a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime(),
    )
  }

  function isHoje(data: any) {
    if (!data) return false
    return new Date(data).toDateString() === new Date().toDateString()
  }

  /* ============================= */
  /*  PERFORMANCE                */
  /* ============================= */

  const novos = useMemo(
    () => ordenar(pedidos.filter((p) => p.status === 'RECEBIDO')),
    [pedidos],
  )

  const preparo = useMemo(
    () => ordenar(pedidos.filter((p) => p.status === 'EM_PREPARO')),
    [pedidos],
  )

  const prontos = useMemo(
    () => ordenar(pedidos.filter((p) => p.status === 'PRONTO')),
    [pedidos],
  )

  const entregues = useMemo(
    () =>
      ordenar(
        pedidos.filter((p) => p.status === 'ENTREGUE' && isHoje(p.entregueEm)),
      ),
    [pedidos],
  )

  /* ============================= */
  /*  RENDER                     */
  /* ============================= */

  return (
    <div style={theme.page}>
      <CardMenu navigate={navigate} onBalcao={() => setAbrirBalcao(true)} />

      <div style={headerGrid}>
        <CardRelogio />
        <CardClima />
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#e53935" />
        <CardStatus titulo="👨‍🍳 Preparo" valor={preparo.length} cor="#fb8c00" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#43a047" />

        <div
          onClick={() => setMostrarEntregues(!mostrarEntregues)}
          style={{ flex: 1, display: 'flex', cursor: 'pointer' }}
        >
          <CardStatus
            titulo="📦 Entregues Hoje"
            valor={totalEntreguesHoje}
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
          onSuccess={() => atualizarTudo()}
        />
      )}
    </div>
  )
}

/* ============================= */
/*  CARD CLIMA                 */
/* ============================= */

function CardClima() {
  const [status, setStatus] = useState<'ok' | 'alerta' | 'critico'>('ok')
  const [texto, setTexto] = useState('Carregando clima...')

  useEffect(() => {
    async function carregarClima() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-23.52&longitude=-46.83&current=precipitation',
        )

        const data = await res.json()
        const chuva = data?.current?.precipitation || 0

        if (chuva > 5) {
          setStatus('critico')
          setTexto('🚨 CHUVA FORTE RÍSCO DE ALAGAMENTO')
        } else if (chuva > 0) {
          setStatus('alerta')
          setTexto('🌧️ Possível Chuva')
        } else {
          setStatus('ok')
          setTexto('☀️ Não Há Ríscos de Tempestades')
        }
      } catch {
        setTexto('Clima indisponível')
      }
    }

    carregarClima()
    const interval = setInterval(carregarClima, 60000)

    return () => clearInterval(interval)
  }, [])

  const cor =
    status === 'critico'
      ? '#e53935'
      : status === 'alerta'
        ? '#fb8c00'
        : '#43a047'

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
        padding: 20,
        borderRadius: 16,
        color: '#fff',
        border: `1px solid ${cor}`,
        textAlign: 'center',
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.8 }}>Clima</div>

      <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
        {texto}
      </div>
    </div>
  )
}

/* ============================= */
/*  CARD STATUS NOVO ESTILO    */
/* ============================= */

function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
        padding: 20,
        borderRadius: 16,
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        border: `1px solid ${cor}`,
        position: 'relative',
        textAlign: 'center',
        minWidth: 120,
      }}
    >
      <div
        style={{
          position: 'absolute',
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

      <div
        style={{
          fontSize: 26,
          fontWeight: 'bold',
          marginTop: 10,
          textAlign: 'left', //  move número
          paddingLeft: 10, // ajuste fino
        }}
      >
        {valor}
      </div>
    </div>
  )
}

/* ============================= */
/*  PEDIDO CARD NOVO ESTILO    */
/* ============================= */

function PedidoCard({ pedido }: any) {
  const [loading, setLoading] = useState(false)

  async function atualizarStatus(status: string) {
    if (loading) return

    try {
      setLoading(true)
      await api.patch(`/pedidos/${pedido.id}/status`, { status })
    } catch (err) {
      console.error('Erro ao atualizar status', err)
    } finally {
      setLoading(false)
    }
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
        background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
        borderRadius: 16,
        border: '1px solid #333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <strong>Pedido #{pedido.codigo}</strong>

      {pedido.status === 'PRONTO' && (
        <div style={{ marginTop: 6, color: '#4caf50', fontWeight: 'bold' }}>
          💰 Total: R$ {Number(pedido.total).toFixed(2)}
        </div>
      )}

      {pedido.itens?.map((item: any) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <strong>
            {item.quantidade}x {item.produto?.nome || 'Produto'}
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
        <button
          onClick={() => atualizarStatus('EM_PREPARO')}
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processando...' : 'INICIAR'}
        </button>
      )}

      {pedido.status === 'EM_PREPARO' && (
        <button
          onClick={() => atualizarStatus('PRONTO')}
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processando...' : 'PRONTO'}
        </button>
      )}

      {pedido.status === 'PRONTO' && (
        <>
          <button
            onClick={() => atualizarStatus('ENTREGUE')}
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processando...' : 'ENTREGUE'}
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

/* ============================= */
/* RESTANTE INALTERADO           */
/* ============================= */

function CardMenu({ navigate, onBalcao }: any) {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
    >
      <div
        style={{
          background: '#000',
          padding: 10,
          borderRadius: 10,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button onClick={() => navigate('/pedidos')} style={btnMenu}>
          📦
        </button>
        <button onClick={() => navigate('/produtos')} style={btnMenu}>
          🛒
        </button>
        <button onClick={() => navigate('/dashboard')} style={btnMenu}>
          📈
        </button>
        <button onClick={() => navigate('/auditoria')} style={btnMenu}>
          📊
        </button>
        <button onClick={onBalcao} style={btnMenu}>
          🧾 Vendas Balcão
        </button>
      </div>
    </div>
  )
}

function CardRelogio() {
  const [hora, setHora] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const horaFormatada = hora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
        padding: 20,
        borderRadius: 16,
        color: '#fff',
        border: '1px solid #2196f3',
        textAlign: 'center',
        minWidth: 160,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.7 }}>Hora Atual</div>

      <div
        style={{
          fontSize: 42, //  GRANDE
          fontWeight: 'bold',
          marginTop: 5,
          letterSpacing: 2, //  melhora leitura
        }}
      >
        {horaFormatada}
      </div>
    </div>
  )
}
const headerGrid: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginBottom: 20,
  flexWrap: 'wrap',
}

const colunas: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
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

function Coluna({ titulo, pedidos }: any) {
  return (
    <div style={theme.column}>
      <h2 style={theme.title}>{titulo}</h2>

      {pedidos.length === 0 && <p style={theme.textMuted}>Nenhum pedido</p>}

      {pedidos.map((pedido: any) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}
    </div>
  )
}
