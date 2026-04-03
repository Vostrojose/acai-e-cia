import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

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
      alert(`Venda registrada: ${produto}`)
      const res = await api.get("/auditoria")
      setVendas(res.data)
    } catch {
      alert("Erro ao registrar venda")
    }
  }

  return (
    <div style={{ padding: 20, background: "#fafafa", minHeight: "100vh" }}>

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
        <Botao onClick={() => navigate("/dashboard")}>📊 Dashboard</Botao>
      </div>

      <h1>📊 Auditoria de Vendas</h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <CardResumo titulo="Diárias" valor={vendas.diarias} cor="#4caf50" />
        <CardResumo titulo="Semanais" valor={vendas.semanais} cor="#ff9800" />
        <CardResumo titulo="Mensais" valor={vendas.mensais} cor="#f44336" />
      </div>

      <h2>Produtos mais vendidos</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 20
      }}>
        {vendas.produtos.map((p: any, i: number) => {
          const cor =
            i === 0 ? "#4caf50" :
            i < vendas.produtos.length / 2 ? "#ffeb3b" :
            "#f44336"

          return (
            <div key={p.nome} style={{
              background: cor,
              padding: 15,
              borderRadius: 10
            }}>
              <strong>{p.nome}</strong>
              <p>{p.qtd} vendidos</p>
            </div>
          )
        })}
      </div>

      <h2 style={{ marginTop: 30 }}>Registrar venda rápida</h2>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10
      }}>
        {vendas.produtos.map((p: any) => (
          <Botao key={p.nome} onClick={() => registrarVenda(p.nome)}>
            {p.nome}
          </Botao>
        ))}
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

function Botao({ children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={botaoPadrao}
      onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
      onMouseOut={(e) => (e.currentTarget.style.background = "#333")}
    >
      {children}
    </button>
  )
}

/* ========================= */
/* CARD RESUMO               */
/* ========================= */
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
