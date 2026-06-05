import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function Dashboard() {
  const navigate = useNavigate()
  const timeoutRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)

  const [dados, setDados] = useState({
    totalHoje: 0,
    produtoTop: '-',
    pedidosAbertos: 0,
    tempoMedio: 0,
    tendencia: 0,
  })

  const [fiados, setFiados] = useState<any[]>([])
  const [semanaAtual, setSemanaAtual] = useState<any[]>([])
  const [resumoMes, setResumoMes] = useState<any[]>([])
  const [mediaSemanaAtual, setMediaSemanaAtual] = useState(0)
  const [totalSemanaAtual, setTotalSemanaAtual] = useState(0)
  const [pedidosSemanaAtual, setPedidosSemanaAtual] = useState(0)

  const [ticketMedioSemana, setTicketMedioSemana] = useState(0)

  useEffect(() => {
    async function ativarWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.error('WakeLock error:', err)
      }
    }

    ativarWakeLock()

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.error(err)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)

      wakeLockRef.current?.release()
    }
  }, [])

  function resetarTimeout() {
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(
      () => {
        navigate('/cozinha')
      },
      3 * 60 * 1000,
    )
  }
  useEffect(() => {
    resetarTimeout()

    window.addEventListener('pointerdown', resetarTimeout)
    window.addEventListener('keydown', resetarTimeout)
    window.addEventListener('click', resetarTimeout)
    window.addEventListener('touchstart', resetarTimeout)
    window.addEventListener('scroll', resetarTimeout)
    window.addEventListener('input', resetarTimeout)

    return () => {
      clearTimeout(timeoutRef.current)

      window.removeEventListener('pointerdown', resetarTimeout)
      window.removeEventListener('keydown', resetarTimeout)
      window.removeEventListener('click', resetarTimeout)
      window.removeEventListener('touchstart', resetarTimeout)
      window.removeEventListener('scroll', resetarTimeout)
      window.removeEventListener('input', resetarTimeout)
    }
  }, [])

  useEffect(() => {
    async function carregar() {
      try {
        const resPedidos = await api.get('/pedidos/dashboard')

        const pedidos = resPedidos.data?.data || []
        const pedidosValidos = pedidos.filter(
          (p: any) => p.status !== 'CANCELADO',
        )

        const resProdutos = await api.get('/produtos')
        const listaProdutos = resProdutos.data?.data || []

        const resFiados = await api.get('/pedidos/fiados')
        setFiados(resFiados.data.data || [])

        const mapaProdutos: any = {}
        listaProdutos.forEach((p: any) => {
          mapaProdutos[p.id] = p.nome
        })

        const hoje = new Date()

        const pedidosHoje = pedidosValidos.filter((p: any) => {
          const data = new Date(p.criadoEm)
          return data.toDateString() === hoje.toDateString()
        })

        const totalHoje = pedidosHoje.reduce(
          (acc: number, p: any) => acc + p.total,
          0,
        )

        const pedidosAbertos = pedidosValidos.filter((p: any) =>
          ['RECEBIDO', 'EM_PREPARO', 'PRONTO'].includes(p.status),
        ).length

        const contador: any = {}

        pedidos
          .filter((p: any) => p.status !== 'CANCELADO')
          .forEach((p: any) => {
            p.itens?.forEach((item: any) => {
              contador[item.produtoId] =
                (contador[item.produtoId] || 0) + item.quantidade
            })
          })

        let produtoTop = '-'
        let max = 0

        Object.entries(contador).forEach(([id, qtd]: any) => {
          if (qtd > max) {
            max = qtd
            produtoTop = `${mapaProdutos[id] || 'Produto'} (${qtd}x)`
          }
        })

        const entregues = pedidosValidos.filter(
          (p: any) => p.status === 'ENTREGUE',
        )

        const tempoMedio =
          entregues.reduce((acc: number, p: any) => {
            const inicio = new Date(p.criadoEm).getTime()

            const fim = new Date(p.entregueEm || p.atualizadoEm).getTime()

            return acc + (fim - inicio)
          }, 0) / (entregues.length || 1)

        const tempoMin = Math.round(tempoMedio / 60000)

        const ontem = new Date()
        ontem.setDate(ontem.getDate() - 1)

        const pedidosOntem = pedidosValidos.filter((p: any) => {
          const data = new Date(p.criadoEm)
          return data.toDateString() === ontem.toDateString()
        })

        const totalOntem = pedidosOntem.reduce(
          (acc: number, p: any) => acc + p.total,
          0,
        )

        const tendencia = totalHoje - totalOntem

        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

        const hojeAtual = new Date()

        const inicioSemana = new Date(hojeAtual)

        inicioSemana.setDate(hojeAtual.getDate() - hojeAtual.getDay())

        inicioSemana.setHours(0, 0, 0, 0)

        const semana = diasSemana.map((dia) => ({
          dia,
          total: 0,
          pedidos: 0,
        }))

        pedidos
          .filter((p: any) => {
            return (
              p.status === 'ENTREGUE' && new Date(p.criadoEm) >= inicioSemana
            )
          })
          .forEach((p: any) => {
            const indice = new Date(p.criadoEm).getDay()

            semana[indice].total += Number(p.total || 0)
            semana[indice].pedidos += 1
          })

        const totalSemana = semana.reduce((acc, d) => acc + d.total, 0)
        const totalPedidosSemana = semana.reduce((acc, d) => acc + d.pedidos, 0)
        const ticketMedioSemana = totalSemana / Math.max(totalPedidosSemana, 1)

        const diasComVenda = semana.filter((d) => d.total > 0).length

        const mediaSemana = totalSemana / Math.max(diasComVenda, 1)

        setSemanaAtual(semana)
        setTotalSemanaAtual(totalSemana)
        setMediaSemanaAtual(mediaSemana)
        setPedidosSemanaAtual(totalPedidosSemana)

        setTicketMedioSemana(ticketMedioSemana)

        const mesAtual = hojeAtual.getMonth()
        const anoAtual = hojeAtual.getFullYear()

        const semanasMes: any = {}

        pedidos
          .filter((p: any) => {
            if (p.status !== 'ENTREGUE') return false

            const data = new Date(p.criadoEm)

            return (
              data.getMonth() === mesAtual && data.getFullYear() === anoAtual
            )
          })
          .forEach((p: any) => {
            const data = new Date(p.criadoEm)

            const numeroSemana = Math.ceil(data.getDate() / 7)

            if (!semanasMes[numeroSemana]) {
              semanasMes[numeroSemana] = {
                balcao: 0,
                online: 0,
                dias: new Set<number>(),
              }
            }

            if (p.origem === 'BALCAO') {
              semanasMes[numeroSemana].balcao += Number(p.total || 0)
            } else {
              semanasMes[numeroSemana].online += Number(p.total || 0)
            }

            semanasMes[numeroSemana].dias.add(data.getDate())
          })

        setResumoMes(
          Object.entries(semanasMes)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([semana, valores]: any) => {
              const total = valores.balcao + valores.online

              const media = total / Math.max(valores.dias.size, 1)

              return {
                semana,
                balcao: valores.balcao,
                online: valores.online,
                total,
                media,
              }
            }),
        )

        setDados({
          totalHoje,
          produtoTop,
          pedidosAbertos,
          tempoMedio: tempoMin,
          tendencia,
        })
      } catch (err) {
        console.error('Erro ao carregar dashboard', err)
      }
    }

    carregar()

    const interval = setInterval(carregar, 10000)

    return () => clearInterval(interval)
  }, [])

  async function quitar(id: string) {
    await api.patch(`/pedidos/${id}/pagar`)
    setFiados((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div style={theme.page}>
      <CardMenu navigate={navigate} />

      <h1 style={{ ...theme.title, textAlign: 'center' }}>📋 Dashboard</h1>

      <div style={grid}>
        <Card
          titulo="💰 Vendas hoje"
          valor={`R$ ${dados.totalHoje.toFixed(2)}`}
          cor="#4caf50"
        />
        <Card
          titulo="🔥 Produto mais vendido"
          valor={dados.produtoTop}
          cor="#ff9800"
        />
        <Card
          titulo="📦 Pedidos em aberto"
          valor={dados.pedidosAbertos}
          cor="#2196f3"
        />
        <Card
          titulo="⏱ Tempo médio"
          valor={`${dados.tempoMedio} min`}
          cor="#9c27b0"
        />
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
            padding: 20,
            borderRadius: 16,
            color: '#fff',
            border: '1px solid #f44336',
            width: '100%',
          }}
        >
          <div
            style={{
              opacity: 0.8,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            📊 RESUMO SEMANAL
          </div>

          {semanaAtual.map((d) => (
            <div
              key={d.dia}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <span>{d.dia}</span>

              <strong>
                R$ {d.total.toFixed(2)} ({d.pedidos})
              </strong>
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            💰 Total: R$ {totalSemanaAtual.toFixed(2)}
            <div
              style={{
                fontSize: 13,
              }}
            >
              🧾 Pedidos: {pedidosSemanaAtual}
            </div>
          </div>

          <div
            style={{
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            📈 Média: R$ {mediaSemanaAtual.toFixed(2)}/dia
            <div
              style={{
                fontSize: 13,
              }}
            >
              🎟 Ticket: R$ {ticketMedioSemana.toFixed(2)}
            </div>
          </div>

          <hr
            style={{
              borderColor: '#444',
              margin: '10px 0',
            }}
          />

          <div
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              marginBottom: 8,
            }}
          >
            📊 Semanas do mês
          </div>

          {resumoMes.map((s: any) => (
            <div
              key={s.semana}
              style={{
                marginBottom: 12,
                fontSize: 12,
                borderBottom: '1px solid #333',
                paddingBottom: 8,
              }}
            >
              <div>
                <strong>Semana {s.semana}</strong>
              </div>

              <div>🥤 R$ {s.balcao.toFixed(2)}</div>

              <div>📱 R$ {s.online.toFixed(2)}</div>

              <div>💰 R$ {s.total.toFixed(2)}</div>

              <div>📈 R$ {s.media.toFixed(2)}/dia</div>
            </div>
          ))}
        </div>
      </div>

      {fiados.length > 0 && (
        <div style={fiadoBox}>
          <h2>💰 Fiados em aberto</h2>

          {fiados.map((f) => (
            <div key={f.id} style={linhaFiado}>
              <div>
                <strong>{f.clienteNome}</strong>
                <div>R$ {Number(f.total).toFixed(2)}</div>
              </div>

              <button style={btnQuitar} onClick={() => quitar(f.id)}>
                ✔ Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CardMenu({ navigate }: any) {
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
        <button style={btnMenu} onClick={() => navigate('/cozinha')}>
          👨‍🍳
        </button>
        <button style={btnMenu} onClick={() => navigate('/pedidos')}>
          📦
        </button>
        <button style={btnMenu} onClick={() => navigate('/produtos')}>
          🛒
        </button>
        <button style={btnMenu} onClick={() => navigate('/auditoria')}>
          📊
        </button>
        <button style={btnMenu} onClick={() => navigate('/clientes')}>
          💳
        </button>
        <button style={btnMenu} onClick={() => navigate('/financeiro')}>
          💰
        </button>
        <button
          style={btnMenu}
          onClick={() => navigate('/auditoria-pagamentos')}
        >
          🧾
        </button>
      </div>
    </div>
  )
}

function Card({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
        padding: 20,
        borderRadius: 16,
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        border: `1px solid ${cor}`,
        position: 'relative',
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
        }}
      >
        {valor}
      </div>
    </div>
  )
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
  gap: 16,
  width: '100%',
}
const btnMenu: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '12px 16px',
  minWidth: 48,
  minHeight: 48,
  borderRadius: 6,
  fontSize: 18,
  cursor: 'pointer',
}

const fiadoBox: React.CSSProperties = {
  marginTop: 30,
  background: '#111',
  padding: 20,
  borderRadius: 12,
  color: '#fff',
}

const linhaFiado: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 10,
}

const btnQuitar: React.CSSProperties = {
  background: '#4caf50',
  color: '#fff',
  border: 'none',
  padding: '8px 12px',
  borderRadius: 6,
  cursor: 'pointer',
}
