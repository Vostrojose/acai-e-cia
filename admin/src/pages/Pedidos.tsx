// src/pages/Pedidos.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

type ItemPedido = {
  id: string;
  quantidade: number;
  precoUnit: number;
  pedidoId: string;
  produtoId: string;
};

type Pedido = {
  id: string;
  status: string;
  tipo: string;
  total: number;
  telefone: string | null;
  origem: string | null;
  endereco: string | null;
  criadoEm: string;
  atualizadoEm: string;
  itens: ItemPedido[];
};

export default function Pedidos() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarPedidos() {
    setCarregando(true);
    setErro(null);

    try {
      const res = await api.get("/pedidos");

      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setPedidos(res.data.data);
      } else {
        setErro("Resposta inesperada do servidor.");
      }
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar pedidos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function atualizarStatus(id: string, novoStatus: string) {
    try {
      await api.patch(`/pedidos/${id}/status`, { status: novoStatus });
      carregarPedidos();
    } catch (e: any) {
      console.error("Erro ao atualizar status:", e);
    }
  }

  return (
    <div style={{ padding: 40 }}>

      {/* ========================= */}
      {/* MENU DE NAVEGAÇÃO         */}
      {/* ========================= */}
      <div style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap"
      }}>
        <button onClick={() => navigate("/cozinha")}>🍳 Cozinha</button>
        <button onClick={() => navigate("/pedidos")}>📦 Pedidos</button>
        <button onClick={() => navigate("/produtos")}>🛒 Produtos</button>
        <button onClick={() => navigate("/dashboard")}>📊 Dashboard</button>
      </div>

      <h1>Pedidos</h1>

      {carregando && <p>Carregando pedidos...</p>}

      {erro && (
        <p style={{ color: "red", marginBottom: 16 }}>
          Erro: {erro}
        </p>
      )}

      {!carregando && !erro && pedidos.length === 0 && (
        <p>Nenhum pedido encontrado.</p>
      )}

      {!carregando && !erro && pedidos.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pedidos.map((pedido) => (
            <li
              key={pedido.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: 16,
                padding: 16,
                borderRadius: 6,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>ID:</strong> {pedido.id}
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Status:</strong> {pedido.status}
              </div>

              <div style={{ marginBottom: 8 }}>
                <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
              </div>

              {pedido.telefone && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Telefone:</strong> {pedido.telefone}
                </div>
              )}

              {pedido.endereco && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Endereço:</strong> {pedido.endereco}
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <strong>Itens:</strong>
                <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                  {pedido.itens.map((item) => (
                    <li key={item.id}>
                      {item.quantidade} × R$ {item.precoUnit.toFixed(2)} (Produto {item.produtoId})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botões de status */}
              <div style={{ marginTop: 12 }}>
                {pedido.status !== "PRONTO" && (
                  <button
                    style={{ marginRight: 8 }}
                    onClick={() => atualizarStatus(pedido.id, "PRONTO")}
                  >
                    Marcar como pronto
                  </button>
                )}

                {pedido.status !== "EM_PREPARO" && (
                  <button
                    style={{ marginRight: 8 }}
                    onClick={() => atualizarStatus(pedido.id, "EM_PREPARO")}
                  >
                    Marcar como em preparo
                  </button>
                )}
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}