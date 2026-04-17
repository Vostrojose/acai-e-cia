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
    <div style={page}>

      <CardMenu navigate={navigate} />

      <h1 style={h1Style}>📦 Pedidos</h1>

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
        <div style={gridPedidos}>
          {pedidos.map((pedido) => (
            <div key={pedido.id} style={cardAçai}>

              {/* 🔥 CONTEÚDO INTERNO */}
              <div style={cardContent}>

                <div><strong>ID:</strong> {pedido.id}</div>
                <div><strong>Status:</strong> {pedido.status}</div>
                <div><strong>Total:</strong> R$ {pedido.total.toFixed(2)}</div>

                {pedido.telefone && (
                  <div><strong>Telefone:</strong> {pedido.telefone}</div>
                )}

                {pedido.endereco && (
                  <div><strong>Endereço:</strong> {pedido.endereco}</div>
                )}

                <div>
                  <strong>Itens:</strong>
                  <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                    {pedido.itens.map((item) => (
                      <li key={item.id}>
                        {item.quantidade} × R$ {item.precoUnit.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={acoes}>
                  {pedido.status !== "PRONTO" && (
                    <Botao onClick={() => atualizarStatus(pedido.id, "PRONTO")} cor="#4caf50">
                      ✔ Pronto
                    </Botao>
                  )}

                  {pedido.status !== "EM_PREPARO" && (
                    <Botao onClick={() => atualizarStatus(pedido.id, "EM_PREPARO")} cor="#ff9800">
                      🔥 Em preparo
                    </Botao>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================= */
/* 🎨 VISUAL                 */
/* ========================= */

const page = {
  padding: 20,
  background: "#f5f5f5",
  minHeight: "100vh",
}

/* MENU */
function CardMenu({ navigate }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <div style={{
        background: "#111",
        padding: 10,
        borderRadius: 10,
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }}>
        <button onClick={() => navigate("/cozinha")} style={botaoMenu}>🍳 Cozinha</button>
        <button onClick={() => navigate("/produtos")} style={botaoMenu}>🛒 Produtos</button>
        <button onClick={() => navigate("/dashboard")} style={botaoMenu}>📊 Dashboard</button>
        <button onClick={() => navigate("/auditoria")} style={botaoMenu}>📊 Auditoria</button>
      </div>
    </div>
  )
}

const botaoMenu = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  background: "#333",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
}

/* GRID */
const gridPedidos = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 20,
}

/* 🔥 CARD AÇAÍ */
const cardAçai = {
  background: "#4e06f7",
  borderRadius: 12,
  padding: 4,
}

/* 🔥 CONTEÚDO BRANCO */
const cardContent = {
  background: "#fff",
  borderRadius: 10,
  padding: 15,
}

/* AÇÕES */
const acoes = {
  marginTop: 12,
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
}

/* BOTÃO */
const botaoPadrao = {
  padding: "10px 15px",
  borderRadius: 8,
  border: "none",
  background: "#333",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
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
    >
      {children}
    </button>
  )
}

/* TÍTULOS */
const h1Style = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: 20,
  color: "#222",
  textAlign: "center" as const,
}