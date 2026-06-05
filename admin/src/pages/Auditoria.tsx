import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'
import { Bar, Pie } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
)

export default function Auditoria() {
  const navigate = useNavigate()
  const timeoutRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)

  const [vendas, setVendas] = useState<any>({
    diarias: 0,
    semanais: 0,
    mensais: 0,
    produtos: [],
  })

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [loadingVenda, setLoadingVenda] = useState(false)

  async function carregarAuditoria() {
    try {
      setLoading(true)
      const res = await api.get('/auditoria')

      const data = res.data?.data || res.data

      setVendas({
        diarias: Number(data?.diarias || 0),
        semanais: Number(data?.semanais || 0),
        mensais: Number(data?.mensais || 0),
        produtos: Array.isArray(data?.produtos) ? data.produtos : [],
      })

      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }
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

    return () => {
      clearTimeout(timeoutRef.current)

      window.removeEventListener('pointerdown', resetarTimeout)
      window.removeEventListener('keydown', resetarTimeout)
      window.removeEventListener('click', resetarTimeout)
      window.removeEventListener('touchstart', resetarTimeout)
    }
  }, [])
  useEffect(() => {
    carregarAuditoria()
  }, [])

  async function registrarVenda(produto: string) {
    try {
      setLoadingVenda(true)
      await api.post('/auditoria/venda', { produto })
      await carregarAuditoria()
    } finally {
      setLoadingVenda(false)
    }
  }

  const moeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)

  const produtos = vendas.produtos || []

  const dataMaisVendidos = useMemo(
    () => ({
      labels: produtos.map((p: any) => p.nome),
      datasets: [
        {
          label: 'Mais vendidos',
          data: produtos.map((p: any) => p.qtd),
          backgroundColor: '#4caf50',
        },
      ],
    }),
    [produtos],
  )

  const dataParticipacao = useMemo(
    () => ({
      labels: produtos.map((p: any) => p.nome),
      datasets: [
        {
          data: produtos.map((p: any) => p.qtd),
          backgroundColor: [
            '#4caf50',
            '#ff9800',
            '#f44336',
            '#2196f3',
            '#9c27b0',
            '#00bcd4',
          ],
        },
      ],
    }),
    [produtos],
  )

  if (loading) {
    return <div style={theme.page}>Carregando auditoria...</div>
  }

  if (erro) {
    return <div style={theme.page}>{erro}</div>
  }

  return (
    <div style={theme.page}>
      <CardMenu navigate={navigate} />

      <h1 style={{ ...theme.title, textAlign: 'center' }}>
        📊 Auditoria de Vendas
      </h1>

      <div style={resumoContainer}>
        <CardResumo
          titulo="Diárias"
          valor={moeda(vendas.diarias)}
          cor="#4caf50"
        />
        <CardResumo
          titulo="Semanais"
          valor={moeda(vendas.semanais)}
          cor="#ff9800"
        />
        <CardResumo
          titulo="Mensais"
          valor={moeda(vendas.mensais)}
          cor="#f44336"
        />
      </div>

      <div style={gridGraficos}>
        <div style={theme.card}>
          <h2 style={theme.title}>Produtos mais vendidos</h2>
          {produtos.length > 0 ? <Bar data={dataMaisVendidos} /> : 'Sem dados'}
        </div>

        <div style={theme.card}>
          <h2 style={theme.title}>Participação dos produtos</h2>
          {produtos.length > 0 ? <Pie data={dataParticipacao} /> : 'Sem dados'}
        </div>
      </div>

      <div style={theme.card}>
        <h2 style={theme.title}>Registrar venda rápida</h2>

        <div style={acoes}>
          {produtos.map((p: any) => (
            <button
              key={p.nome}
              onClick={() => registrarVenda(p.nome)}
              disabled={loadingVenda}
              style={btnPadrao}
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      <p style={aviso}>
        ⚠️ Os pedidos entregues serão apagados ao final de cada mês.
      </p>
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
        <button onClick={() => navigate('/cozinha')} style={btnMenu}>
          👨‍🍳
        </button>
        <button onClick={() => navigate('/pedidos')} style={btnMenu}>
          📦
        </button>
        <button onClick={() => navigate('/produtos')} style={btnMenu}>
          🛒
        </button>
        <button onClick={() => navigate('/dashboard')} style={btnMenu}>
          {' '}
          📋
        </button>
      </div>
    </div>
  )
}

function CardResumo({ titulo, valor, cor }: any) {
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
      <div style={{ fontSize: 26, fontWeight: 'bold', marginTop: 10 }}>
        {valor}
      </div>
    </div>
  )
}
const resumoContainer = {
  display: 'flex',
  gap: 20,
  flexWrap: 'wrap' as const,
  marginBottom: 30,
}

const gridGraficos = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 20,
  marginBottom: 30,
}

const acoes = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 10,
}

const aviso = {
  marginTop: 30,
  color: '#ccc',
}
const btnPadrao = {
  background: '#222',
  color: '#fff',
  border: '1px solid #444',
  padding: '12px 14px',
  borderRadius: 10,
  fontSize: 14,
  cursor: 'pointer',
  transition: '0.2s',
}

const btnMenu = {
  background: "#333",
  color: "#fff",
  border: "none",
  padding: "12px 16px",
  minWidth: 48,
  minHeight: 48,
  borderRadius: 6,
  fontSize: 18,
  cursor: "pointer"
}
