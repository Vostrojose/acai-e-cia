// src/pages/Auditoria.tsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import Botao from "../components/Botao"
import { Bar, Pie } from "react-chartjs-2"

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

  // Gráfico de mais vendidos
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

  // Gráfico de participação (pizza)
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
    <div style={{ padding: 20, background: "#fafafa", minHeight: "100vh" }}>
      {/* Menu de navegação */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Botao onClick={() => navigate("/cozinha")}>🍳 Cozinha</Botao>
        <Botao onClick={() => navigate("/pedidos")}>📦 Pedidos</Botao>
        <Botao onClick={() => navigate("/produtos")}>🛒 Produtos</Botao>
        <Botao onClick={() => navigate("/dashboard")}>📊 Dashboard</Botao>
      </div>

      <h1>📊 Auditoria de Vendas</h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <CardResumo titulo="Diárias" valor={vendas.diarias} cor="#4caf50" />
        <CardResumo titulo="Semanais" valor={vendas.semanais} cor="#ff9800" />
        <CardResumo titulo="Mensais" valor={vendas.mensais} cor="#f44336" />
      </div>

      <h2>Produtos mais vendidos</h2>
      <Bar data={dataMaisVendidos} />

      <h2 style={{ marginTop: 30 }}>Participação dos produtos</h2>
      <Pie data={dataParticipacao} />

      <h2 style={{ marginTop: 30 }}>Registrar venda rápida</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {vendas.produtos.map((p: any) => (
          <Botao key={p.nome} onClick={() => registrarVenda(p.nome)}>
            {p.nome}
          </Botao>
        ))}
      </div>

      <p style={{ marginTop: 30, color: "#555" }}>
        ⚠️ Os pedidos entregues serão apagados ao final de cada mês. Apenas os indicadores
        consolidados permanecerão para orientar decisões estratégicas.
      </p>
    </div>
  )
}

function CardResumo({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        background: cor,
        padding: 20,
        borderRadius: 10,
        minWidth: 150,
        textAlign: "center",
        color: "#fff",
        fontWeight: "bold",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}
    >
      <strong>{titulo}</strong>
      <div style={{ fontSize: 24 }}>R$ {valor}</div>
    </div>
  )
}



