import { useEffect, useState } from "react";
import api from "../services/api";

export default function Fiados() {
  const [fiados, setFiados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function carregar() {
    try {
      setLoading(true);

      //  ROTA CORRETA
      const res = await api.get("/pedidos/fiados");

      setFiados(res.data.data || []);
    } catch (err) {
      console.error("Erro ao carregar fiados:", err);
      alert("Erro ao carregar fiados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function marcarComoPago(id: string) {
    try {
      await api.patch(`/pedidos/${id}/pagar`);
      carregar(); //  atualiza lista
    } catch (err) {
      console.error("Erro ao marcar como pago:", err);
      alert("Erro ao atualizar pedido");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>💰 Fiados</h1>

      {loading && <p>Carregando...</p>}

      {!loading && fiados.length === 0 && (
        <p>Nenhum fiado encontrado</p>
      )}

      {fiados.map((p) => (
        <div
          key={p.id}
          style={{
            marginBottom: 12,
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <strong>{p.clienteNome || "Sem nome"}</strong>
          </div>

          {/*  VALOR CORRIGIDO */}
          <div>
            Valor: <strong>R$ {Number(p.total).toFixed(2)}</strong>
          </div>

          {/* OPCIONAL (se quiser mostrar data) */}
          {p.criadoEm && (
            <div style={{ fontSize: 12, color: "#666" }}>
              {new Date(p.criadoEm).toLocaleString()}
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => marcarComoPago(p.id)}
              style={{
                background: "#4caf50",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✔ Marcar como pago
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}