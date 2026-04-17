import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import Botao from "../components/Botao"
import { Bar, Pie } from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function Auditoria() {
  const navigate = useNavigate()

  const [vendas, setVendas] = useState<any>({
    diarias: 0,
    semanais: 0,
    mensais: 0,
    produtos: []
  })

  useEffect(() => {
    async function carregarAuditoria() {
      try {
        const res = await api.get("/auditoria")
        setVendas(res.data)
      } catch (err) {
        console.error("Erro ao carregar auditoria", err)
      }
    }
    carregarAuditoria()
  }, [])

  async function registrarVenda(produto: string) {
    try {
      await api.post("/auditoria/venda", { produto })
      const res = await api.get("/auditoria")
      setVendas(res.data)
    } catch {
      alert("Erro ao registrar venda")
    }
  }

  const dataMaisVendidos = {
    labels: vendas.produtos.map((p: any) => p.nome),
    datasets: [
      {
        label: "Mais vendidos",
        data: vendas.produtos.map((p: any) => p.qtd),
        backgroundColor: "#4caf50"
      }
    ]
  }

  const dataParticipacao = {
    labels: vendas.produtos.map((p: any) => p.nome),
    datasets: [
      {
        data: vendas.produtos.map((p: any) => p.qtd),
        backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#2196f3", "#9c27b0"]
      }
    ]
  }

  return (
    <div style={page}>

      <CardMenu navigate={navigate} />

      <h1 style={h1Style}>📊 Auditoria de Vendas</h1>

      <div style={resumoContainer}>
        <CardResumo titulo="Diárias" valor={vendas.diarias} cor="#4caf50" />
        <CardResumo titulo="Semanais" valor={vendas.semanais} cor="#ff9800" />
        <CardResumo titulo="Mensais" valor={vendas.mensais} cor="#f44336" />
      </div>

      <div style={gridGraficos}>
        <div style={card}>
          <h2 style={h2Style}>Produtos mais vendidos</h2>
          <Bar data={dataMaisVendidos} />
        </div>

        <div style={card}>
          <h2 style={h2Style}>Participação dos produtos</h2>
          <Pie data={dataParticipacao} />
        </div>
      </div>

      <div style={card}>
        <h2 style={h2Style}>Registrar venda rápida</h2>

        <div style={acoes}>
          {vendas.produtos.map((p: any) => (
            <Botao key={p.nome} onClick={() => registrarVenda(p.nome)}>
              {p.nome}
            </Botao>
          ))}
        </div>
      </div>

      <p style={aviso}>
        ⚠️ Os pedidos entregues serão apagados ao final de cada mês. Apenas os indicadores
        consolidados permanecerão para orientar decisões estratégicas.
      </p>

    </div>
  )
}

/* ========================= */
/* 🎨 PADRÃO VISUAL GLOBAL   */
/* ========================= */

const page = {
  padding: 20,
  background: "#f5f5f5",
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
        <button onClick={() => navigate("/dashboard")} style={botaoMenu}>📈 Dashboard</button>
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

const resumoContainer = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap" as const,
  marginBottom: 30,
}

const gridGraficos = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 20,
  marginBottom: 30,
}

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  border: "1px solid #ddd",
}

const acoes = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 10,
}

const aviso = {
  marginTop: 30,
  color: "#555",
}

function CardResumo({ titulo, valor, cor }: any) {
  return (
    <div style={{
      background: cor,
      padding: 20,
      borderRadius: 10,
      minWidth: 150,
      textAlign: "center",
      color: "#fff",
      fontWeight: "bold"
    }}>
      <strong>{titulo}</strong>
      <div style={{ fontSize: 24 }}>R$ {valor}</div>
    </div>
  )
}

/* ========================= */
/* 🔥 TÍTULOS PADRÃO         */
/* ========================= */

const h1Style = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: 20,
  color: "#222",
  textAlign: "center" as const,
}

const h2Style = {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: 15,
  color: "#333",
}



