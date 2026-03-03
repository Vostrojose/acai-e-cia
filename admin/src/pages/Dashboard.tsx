import { useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import {
  getDashboardPedidos,
  getPedidos,
  atualizarStatusPedido,
} from '../services/api'
import './Dashboard.css'
import AnimatedNumber from '../components/AnimatedNumber'

interface Pedido {
  id: string
  status: string
  total: number
  criadoEm: string
}

interface DashboardData {
  RECEBIDO: number
  EM_PREPARO: number
  PRONTO: number
  ENTREGUE: number
  CANCELADO: number
  TOTAL: number
}

const STATUS_OPTIONS = [
  'TODOS',
  'RECEBIDO',
  'EM_PREPARO',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO',
]

const socketUrl = 'http://localhost:3000'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    RECEBIDO: 0,
    EM_PREPARO: 0,
    PRONTO: 0,
    ENTREGUE: 0,
    CANCELADO: 0,
    TOTAL: 0,
  })

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const newOrderAudioRef = useRef<HTMLAudioElement | null>(null)
  const previousPedidosRef = useRef<Pedido[]>([])
  const [pedidosPendentes, setPedidosPendentes] = useState<string[]>([])

  const loadData = useCallback(async (statusFiltro?: string) => {
    try {
      const dashPromise = getDashboardPedidos()

      const pedidosPromise =
        statusFiltro && statusFiltro !== 'TODOS'
          ? getPedidos(statusFiltro)
          : getPedidos()

      const [dash, pedidosData] = await Promise.all([
        dashPromise,
        pedidosPromise,
      ])

      setDashboard(dash.data)
      setPedidos(pedidosData.data)
    } catch (error) {
      console.error('Erro ao atualizar dados', error)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ============================= */
  /* WEBSOCKET INTEGRAÇÃO */
  /* ============================= */

  useEffect(() => {
    const socket = io(socketUrl)

    socket.on('connect', () => {
      console.log('🔌 WebSocket conectado')
    })

    socket.on('novo_pedido', () => {
      loadData(filtroStatus)
    })

    socket.on('pedido_atualizado', () => {
      loadData(filtroStatus)
    })

    socket.on('connect_error', (err) => {
      console.error('Erro conexão socket:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [loadData, filtroStatus])

  /* ============================= */
  /* POLLING (mantido como fallback) */
  /* ============================= */

  useEffect(() => {
    setLoading(true)
    loadData(filtroStatus)

    const interval = setInterval(() => {
      loadData(filtroStatus)
    }, 5000)

    return () => clearInterval(interval)
  }, [filtroStatus, loadData])

  /* ============================= */
  /* DETECÇÃO PEDIDO NOVO */
  /* ============================= */

  useEffect(() => {
    const previousPedidos = previousPedidosRef.current

    if (previousPedidos.length > 0) {
      pedidos.forEach((pedidoAtual) => {
        const pedidoAnterior = previousPedidos.find(
          (p) => p.id === pedidoAtual.id
        )

        if (!pedidoAnterior && pedidoAtual.status === 'RECEBIDO') {
          newOrderAudioRef.current?.play().catch(() => {})
          setPedidosPendentes((prev) => [...prev, pedidoAtual.id])
        }
      })
    }

    previousPedidosRef.current = pedidos
  }, [pedidos])

  async function handleStatusChange(id: string, status: string) {
    try {
      await atualizarStatusPedido(id, status)

      if (status === 'EM_PREPARO') {
        setPedidosPendentes((prev) =>
          prev.filter((pedidoId) => pedidoId !== id)
        )
      }

      await loadData(filtroStatus)
    } catch (error) {
      console.error('Erro ao atualizar status', error)
    }
  }

  if (loading) return <p className="loading">Carregando...</p>

  return (
    <>
      <audio
        ref={newOrderAudioRef}
        src="/notification.mp3"
        preload="auto"
      />

      <div className="dashboard-container">
        <h1>Dashboard de Pedidos</h1>

        <div className="cards">
          <div className="card recebido">
            Recebidos: <AnimatedNumber value={dashboard.RECEBIDO} />
          </div>
          <div className="card preparo">
            Em Preparo: <AnimatedNumber value={dashboard.EM_PREPARO} />
          </div>
          <div className="card pronto">
            Prontos: <AnimatedNumber value={dashboard.PRONTO} />
          </div>
          <div className="card entregue">
            Entregues: <AnimatedNumber value={dashboard.ENTREGUE} />
          </div>
          <div className="card cancelado">
            Cancelados: <AnimatedNumber value={dashboard.CANCELADO} />
          </div>
          <div className="card total">
            Total: <AnimatedNumber value={dashboard.TOTAL} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>
            <strong>Filtrar por status: </strong>
          </label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{ padding: 8, marginLeft: 10 }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <h2>Pedidos</h2>

        <div className="pedido-list">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className={`pedido-card ${
                pedidosPendentes.includes(pedido.id)
                  ? 'novo-pedido'
                  : ''
              }`}
            >
              <div>
                <strong>ID:</strong> #{pedido.id.slice(0, 8)}
              </div>

              <div>
                <strong>Status:</strong> {pedido.status}
              </div>

              <div>
                <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
              </div>

              <div>
                <strong>Criado:</strong>{' '}
                {new Date(pedido.criadoEm).toLocaleString()}
              </div>

              <div className="buttons">
                {pedido.status === 'RECEBIDO' && (
                  <button
                    onClick={() =>
                      handleStatusChange(pedido.id, 'EM_PREPARO')
                    }
                  >
                    Iniciar Preparo
                  </button>
                )}

                {pedido.status === 'EM_PREPARO' && (
                  <button
                    onClick={() =>
                      handleStatusChange(pedido.id, 'PRONTO')
                    }
                  >
                    Marcar Pronto
                  </button>
                )}

                {pedido.status === 'PRONTO' && (
                  <button
                    onClick={() =>
                      handleStatusChange(pedido.id, 'ENTREGUE')
                    }
                  >
                    Entregar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
