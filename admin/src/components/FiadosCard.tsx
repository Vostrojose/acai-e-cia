import { useEffect, useState } from "react";
import api from "../services/api";

export default function FiadosCard() {
  const [fiados, setFiados] = useState<any[]>([]);

  async function carregar() {
    try {
      const res = await api.get("/pedidos/fiados");
      setFiados(res.data.data || []);
    } catch (err) {
      console.error("Erro ao carregar fiados", err);
    }
  }

  useEffect(() => {
    carregar();

    // atualiza automático a cada 10s
    const interval = setInterval(carregar, 10000);

    return () => clearInterval(interval);
  }, []);

  async function quitar(id: string) {
    try {
      await api.patch(`/pedidos/${id}/pagar`);
      carregar();
    } catch {
      alert("Erro ao quitar");
    }
  }

  if (fiados.length === 0) return null;

  return (
    <div style={card}>
      <h3>💰 Fiados</h3>

      {fiados.map((p) => (
        <div key={p.id} style={linha}>
          <div>
            <strong>{p.clienteNome || "Sem nome"}</strong>
            <div>R$ {Number(p.total).toFixed(2)}</div>
          </div>

          <button style={btn} onClick={() => quitar(p.id)}>
            ✔ Quitar
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================= */
/* ESTILO                        */
/* ============================= */

const card: React.CSSProperties = {
  position: "fixed",
  top: 20,
  right: 20,
  width: 250,
  background: "#111",
  color: "#fff",
  padding: 15,
  borderRadius: 10,
  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  zIndex: 9999,
};

const linha: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const btn: React.CSSProperties = {
  background: "#4caf50",
  border: "none",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
};