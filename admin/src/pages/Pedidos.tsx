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
        <Botao onClick={() => navigate("/dashboard")}>📊 Dashboard</Botao>
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
                background: "#fff"
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
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                {pedido.status !== "PRONTO" && (
                  <Botao onClick={() => atualizarStatus(pedido.id, "PRONTO")} cor="#4caf50">
                    Marcar como pronto
                  </Botao>
                )}

                {pedido.status !== "EM_PREPARO" && (
                  <Botao onClick={() => atualizarStatus(pedido.id, "EM_PREPARO")} cor="#ff9800">
                    Marcar como em preparo
                  </Botao>
                )}
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
