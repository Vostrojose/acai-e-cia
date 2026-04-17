import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Dashboard() {

  const navigate = useNavigate()

  const [dados, setDados] = useState({
    totalHoje: 0,
    produtoTop: "-",
    pedidosAbertos: 0,
    tempoMedio: 0,
    tendencia: 0
  })

  useEffect(() => {
    async function carregar() {
      try {
        const resPedidos = await api.get("/pedidos")
        const pedidos = resPedidos.data?.data || []

        const resProdutos = await api.get("/produtos")
        const listaProdutos = resProdutos.data?.data || []

        /* 🔥 MAPA ID → NOME */
        const mapaProdutos: any = {}
        listaProdutos.forEach((p: any) => {
          mapaProdutos[p.id] = p.nome
        })

        const hoje = new Date()

        /* 💰 TOTAL HOJE */
        const pedidosHoje = pedidos.filter((p: any) => {
          const data = new Date(p.criadoEm)
          return data.toDateString() === hoje.toDateString()
        })

        const totalHoje = pedidosHoje.reduce(
          (acc: number, p: any) => acc + p.total,
          0
        )

        /* 📦 PEDIDOS EM ABERTO */
        const pedidosAbertos = pedidos.filter(
          (p: any) => p.status !== "ENTREGUE"
        ).length

        /* 🔥 PRODUTO MAIS VENDIDO */
        const contador: any = {}

        pedidos.forEach((p: any) => {
          p.itens?.forEach((item: any) => {
            contador[item.produtoId] =
              (contador[item.produtoId] || 0) + item.quantidade
          })
        })

        let produtoTop = "-"
        let max = 0

        Object.entries(contador).forEach(([id, qtd]: any) => {
          if (qtd > max) {
            max = qtd
            produtoTop = `${mapaProdutos[id] || "Produto desconhecido"} (${qtd}x)`
          }
        })

        /* ⏱ TEMPO MÉDIO */
        const entregues = pedidos.filter(
          (p: any) => p.status === "ENTREGUE"
        )

        const tempoMedio =
          entregues.reduce((acc: number, p: any) => {
            const inicio = new Date(p.criadoEm).getTime()
            const fim = new Date(p.atualizadoEm).getTime()
            return acc + (fim - inicio)
          }, 0) / (entregues.length || 1)

        const tempoMin = Math.round(tempoMedio / 60000)

        /* 📈 TENDÊNCIA */
        const ontem = new Date()
        ontem.setDate(ontem.getDate() - 1)

        const pedidosOntem = pedidos.filter((p: any) => {
          const data = new Date(p.criadoEm)
          return data.toDateString() === ontem.toDateString()
        })

        const totalOntem = pedidosOntem.reduce(
          (acc: number, p: any) => acc + p.total,
          0
        )

        const tendencia = totalHoje - totalOntem

        setDados({
          totalHoje,
          produtoTop,
          pedidosAbertos,
          tempoMedio: tempoMin,
          tendencia
        })

      } catch (err) {
        console.error("Erro ao carregar dashboard", err)
      }
    }

    carregar()
  }, [])

  return (
    <div style={page}>

      <CardMenu navigate={navigate} />

      <h1 style={h1Style}>📊 Dashboard</h1>

      <div style={grid}>

        <Card titulo="💰 Vendas hoje" valor={`R$ ${dados.totalHoje.toFixed(2)}`} cor="#4caf50" />

        <Card titulo="🔥 Produto mais vendido" valor={dados.produtoTop} cor="#ff9800" />

        <Card titulo="📦 Pedidos em aberto" valor={dados.pedidosAbertos} cor="#2196f3" />

        <Card titulo="⏱ Tempo médio" valor={`${dados.tempoMedio} min`} cor="#9c27b0" />

        <Card titulo="📈 Tendência" valor={`R$ ${dados.tendencia}`} cor="#f44336" />

      </div>

    </div>
  )
}

/* ========================= */
/* 🎨 VISUAL                 */
/* ========================= */

const page = {
  padding: 20,
  background: "#6d10f9a2",
  minHeight: "100vh",
}

function CardMenu({ navigate }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <div style={{
        background: "#111",
        padding: 10,
        borderRadius: 10,
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }}>
        <button onClick={() => navigate("/cozinha")} style={botaoMenu}>🍳 Cozinha</button>
        <button onClick={() => navigate("/pedidos")} style={botaoMenu}>📦 Pedidos</button>
        <button onClick={() => navigate("/produtos")} style={botaoMenu}>🛒 Produtos</button>
        <button onClick={() => navigate("/auditoria")} style={botaoMenu}>📊 Auditoria</button>
      </div>
    </div>
  )
}

const botaoMenu = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  background: "#333",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
}

/* GRID */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
}

/* CARD */
function Card({ titulo, valor, cor }: any) {
  return (
    <div style={{
      background: cor,
      padding: 20,
      borderRadius: 12,
      color: "#4e06f7",
      fontWeight: "bold",
      textAlign: "center"
    }}>
      <div style={{ marginBottom: 10 }}>{titulo}</div>
      <div style={{ fontSize: 22 }}>{valor}</div>
    </div>
  )
}

/* TÍTULO */
const h1Style = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: 20,
  textAlign: "center" as const,
}