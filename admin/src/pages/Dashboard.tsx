import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function Dashboard() {
  const navigate = useNavigate()

  const [dados, setDados] = useState({
    totalHoje: 0,
    produtoTop: '-',
    pedidosAbertos: 0,
    tempoMedio: 0,
    tendencia: 0,
  })

  const [fiados, setFiados] = useState<any[]>([])

  useEffect(() => {
    async function carregar() {
      try {
        const resPedidos = await api.get('/pedidos')
        const pedidos = resPedidos.data?.data || []

        const resProdutos = await api.get('/produtos')
        const listaProdutos = resProdutos.data?.data || []

        const resFiados = await api.get('/pedidos/fiados')
        setFiados(resFiados.data.data || [])

        const mapaProdutos: any = {}
        listaProdutos.forEach((p: any) => {
          mapaProdutos[p.id] = p.nome
        })

        const hoje = new Date()

        const pedidosHoje = pedidos.filter((p: any) => {
          const data = new Date(p.criadoEm)
          return data.toDateString() === hoje.toDateString()
        })

        const totalHoje = pedidosHoje.reduce(
          (acc: number, p: any) => acc + p.total,
          0,
        )

        const pedidosAbertos = pedidos.filter(
          (p: any) => p.status !== 'ENTREGUE',
        ).length

        const contador: any = {}

        pedidos.forEach((p: any) => {
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

        const entregues = pedidos.filter((p: any) => p.status === 'ENTREGUE')

        const tempoMedio =
          entregues.reduce((acc: number, p: any) => {
            const inicio = new Date(p.criadoEm).getTime()
            const fim = new Date(p.atualizadoEm).getTime()
            return acc + (fim - inicio)
          }, 0) / (entregues.length || 1)

        const tempoMin = Math.round(tempoMedio / 60000)

        const ontem = new Date()
        ontem.setDate(ontem.getDate() - 1)

        const pedidosOntem = pedidos.filter((p: any) => {
          const data = new Date(p.criadoEm)
          return data.toDateString() === ontem.toDateString()
        })

        const totalOntem = pedidosOntem.reduce(
          (acc: number, p: any) => acc + p.total,
          0,
        )

        const tendencia = totalHoje - totalOntem

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

    // 🔥 atualiza automático
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

      <h1 style={{ ...theme.title, textAlign: 'center' }}>📊 Dashboard</h1>

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
        <Card
          titulo="📈 Tendência"
          valor={`R$ ${dados.tendencia}`}
          cor="#f44336"
        />
      </div>

      {/* 🔥 FIADOS */}
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

/* COMPONENTES */

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
          🍳
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
       <button style={btnMenu} onClick={() => navigate("/financeiro")}>
        💰
        </button>
      </div>
    </div>
  )
}

function Card({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        flex: 1, // 🔥 ESSENCIAL
        background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
        padding: 20,
        borderRadius: 16,
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        border: `1px solid ${cor}`,
        position: 'relative',
      }}
    >
      {/* LINHA DE COR */}
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

/* ESTILOS */

const grid: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  width: '100%',
}

const btnMenu: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16,
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
