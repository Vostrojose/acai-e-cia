import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Dashboard() {

  const [produtos, setProdutos] = useState(0)
  const [pedidos, setPedidos] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    async function carregar() {
      try {
        const p = await api.get("/produtos")
        if (p.data?.data) {
          setProdutos(p.data.data.length)
        }

        const pe = await api.get("/pedidos")
        if (pe.data?.data) {
          setPedidos(pe.data.data.length)
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard", err)
      }
    }
    carregar()
  }, [])

  return (
    <div style={{ padding: 40, background: "#f5f5f5", minHeight: "100vh" }}>

      {/* ========================= */}
      {/* MENU DE NAVEGAÇÃO         */}
      {/* ========================= */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap"
      }}>
        <Botao onClick={() => navigate("/cozinha")}>🍳 Cozinha</Botao>
        <Botao onClick={() => navigate("/pedidos")}>📦 Pedidos</Botao>
        <Botao onClick={() => navigate("/produtos")}>🛒 Produtos</Botao>
        <Botao onClick={() => navigate("/auditoria")}>📊 Auditoria</Botao>
      </div>

      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 20 }}>
        <CardResumo titulo="Produtos" valor={produtos} />
        <CardResumo titulo="Pedidos" valor={pedidos} />
      </div>
    </div>
  )
}

/* ========================= */
/* ESTILO PADRÃO DE BOTÕES   */
/* ========================= */
const botaoPadrao = {
  padding: "10px 15px",
  borderRadius: 8,
  border: "none",
  background: "#333",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background 0.3s"
}

function Botao({ children, onClick, cor, type }: any) {
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      style={{
        ...botaoPadrao,
        background: cor || botaoPadrao.background
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
      onMouseOut={(e) => (e.currentTarget.style.background = cor || "#333")}
    >
      {children}
    </button>
  )
}

/* ========================= */
/* CARD RESUMO               */
/* ========================= */
function CardResumo({ titulo, valor }: any) {
  return (
    <div style={{
      padding: 20,
      background: "#eee",
      borderRadius: 10,
      minWidth: 150,
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h2>{titulo}</h2>
      <h3>{valor}</h3>
    </div>
  )
}
