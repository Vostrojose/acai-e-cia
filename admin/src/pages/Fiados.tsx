import { useEffect, useState } from "react";
import api from "../services/api";

export default function Fiados() {
  const [fiados, setFiados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function carregar() {
    try {
      setLoading(true);

      const res = await api.get("/pedidos?fiado=true");
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
      carregar();
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
            marginBottom: 10,
            padding: 10,
            borderBottom: "1px solid #ccc",
            background: "#f9f9f9",
            borderRadius: 8,
          }}
        >
          <div>
            <strong>{p.clienteNome || "Sem nome"}</strong>
          </div>

          <div>Valor: R$ {p.total}</div>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => marcarComoPago(p.id)}
              style={{
                background: "#4caf50",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
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