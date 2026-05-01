import { useEffect, useState } from "react";
import api from "../services/api";

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    try {
      setLoading(true);
      const res = await api.get("/clientes");
      setClientes(res.data.data || []);
    } catch {
      alert("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionarCredito(id: string) {
    const valorNumber = Number(valor);

    if (!valorNumber || valorNumber <= 0) {
      alert("Valor inválido");
      return;
    }

    try {
      await api.post(`/clientes/${id}/credito`, {
        valor: valorNumber,
      });

      setValor("");
      carregar();
    } catch {
      alert("Erro ao adicionar crédito");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>💳 Clientes</h1>

      {loading && <p>Carregando...</p>}

      {!loading && clientes.length === 0 && (
        <p>Nenhum cliente encontrado</p>
      )}

      {clientes.map((c) => (
        <div
          key={c.id}
          style={{
            marginBottom: 10,
            padding: 10,
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <strong>{c.nome}</strong>

          <div>Saldo: R$ {Number(c.credito).toFixed(2)}</div>

          <input
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={{ marginRight: 10 }}
          />

          <button onClick={() => adicionarCredito(c.id)}>
            ➕ Adicionar crédito
          </button>
        </div>
      ))}
    </div>
  );
}