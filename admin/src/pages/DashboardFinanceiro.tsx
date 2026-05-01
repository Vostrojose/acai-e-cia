import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function DashboardFinanceiro() {
  const navigate = useNavigate()

  type Financeiro = {
    totalVendas: number
    totalPago: number
    totalFiado: number
    totalCredito: number
  }

  const [data, setData] = useState<Financeiro | null>(null)

  async function carregar() {
    try {
      const res = await api.get('/dashboard-financeiro')
      setData(res.data.data)
    } catch (err) {
      console.error('Erro ao carregar financeiro', err)
      alert('Erro ao carregar dados financeiros')
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  if (!data) return <p style={{ padding: 20 }}>Carregando...</p>

  return (
    <div style={theme.page}>
      {/* 🔥 MENU DE NAVEGAÇÃO */}
      <CardMenu navigate={navigate} />

      <h1 style={{ ...theme.title, textAlign: 'center', marginBottom: 20 }}>
        📊 Financeiro
      </h1>

      {/* 🔥 CARDS */}
      <div style={grid}>
        <Card titulo="💰 Vendas" valor={data.totalVendas} cor="#4caf50" />
        <Card titulo="💵 Pago" valor={data.totalPago} cor="#2196f3" />
        <Card titulo="🧾 Fiado" valor={data.totalFiado} cor="#ff9800" />
        <Card titulo="💳 Crédito" valor={data.totalCredito} cor="#9c27b0" />
      </div>
    </div>
  )
}

/* ============================= */
/* MENU PADRÃO                   */
/* ============================= */

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
        <button style={btnMenu} onClick={() => navigate('/financeiro')}>
          💰
        </button>
      </div>
    </div>
  )
}

/* ============================= */
/* COMPONENTE CARD               */
/* ============================= */

function Card({
  titulo,
  valor,
  cor,
}: {
  titulo: string
  valor: number
  cor: string
}) {
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
      }}
    >
      {/* LINHA DE DESTAQUE */}
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
        {formatarMoeda(valor)}
      </div>
    </div>
  )
}
function formatarMoeda(valor: any) {
const numero = isNaN(Number(valor)) ? 0 : Number(valor)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numero)
}

/* ============================= */
/* GRID                          */
/* ============================= */

const grid: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  width: '100%',
  flexWrap: 'wrap',
}

/* ============================= */
/* ESTILO BOTÃO                  */
/* ============================= */

const btnMenu: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16,
  cursor: 'pointer',
}
