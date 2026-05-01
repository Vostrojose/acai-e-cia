import { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardFinanceiro() {
  const [data, setData] = useState<any>(null);

  async function carregar() {
    try {
      const res = await api.get("/dashboard-financeiro");
      setData(res.data.data);
    } catch (err) {
      console.error("Erro ao carregar financeiro", err);
      alert("Erro ao carregar dados financeiros");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (!data) return <p style={{ padding: 20 }}>Carregando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>📊 Financeiro</h1>

      {/* 🔥 CARDS */}
      <div style={grid}>
        <Card titulo="💰 Vendas" valor={data.totalVendas} cor="#4caf50" />
        <Card titulo="💵 Pago" valor={data.totalPago} cor="#2196f3" />
        <Card titulo="🧾 Fiado" valor={data.totalFiado} cor="#ff9800" />
        <Card titulo="💳 Crédito" valor={data.totalCredito} cor="#9c27b0" />
      </div>
    </div>
  );
}

/* ============================= */
/* COMPONENTE CARD               */
/* ============================= */

function Card({ titulo, valor, cor }: any) {
  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(135deg, #1e1e1e, #2a2a2a)",
        padding: 20,
        borderRadius: 16,
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        border: `1px solid ${cor}`,
        position: "relative",
        textAlign: "center",
      }}
    >
      {/* LINHA DE DESTAQUE */}
      <div
        style={{
          position: "absolute",
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
          fontWeight: "bold",
          marginTop: 10,
        }}
      >
        R$ {Number(valor).toFixed(2)}
      </div>
    </div>
  );
}

/* ============================= */
/* GRID                          */
/* ============================= */

const grid: React.CSSProperties = {
  display: "flex",
  gap: 16,
  width: "100%",
};