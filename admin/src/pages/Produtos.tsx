import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProdutoForm from "../components/ProdutoForm";

type Produto = {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  ativo?: boolean;
  destaque?: boolean;
};

export default function Produtos() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState<string>(""); // 🔥 NOVO
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarProdutos() {
    setCarregando(true);
    setErro(null);

    try {
      const res = await api.get("/produtos");

      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setProdutos(res.data.data);
      } else {
        setErro("Resposta inesperada do servidor.");
      }
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar produtos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function remover(id: string) {
    try {
      await api.delete(`/produtos/${id}`);
      carregarProdutos();
    } catch (e: any) {
      console.error("Erro ao remover produto:", e);
      setErro("Erro ao remover produto.");
    }
  }

  /* 🔍 FILTRO */
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={page}>

      <CardMenu navigate={navigate} />

      <h1 style={h1Style}>🍧 Painel do Cardápio</h1>

      {/* FORM */}
      <div style={card}>
        <h2 style={h2Style}>Adicionar novo produto</h2>
        <ProdutoForm onCreated={carregarProdutos} />
      </div>

      {/* 🔍 BUSCA */}
      <div style={buscaContainer}>
        <input
          type="text"
          placeholder="🔍 Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={inputBusca}
        />
      </div>

      {/* STATUS */}
      {carregando && <p>Carregando produtos...</p>}

      {erro && (
        <p style={{ color: "red", marginBottom: 16 }}>
          Erro: {erro}
        </p>
      )}

      {!carregando && !erro && produtosFiltrados.length === 0 && (
        <p>Nenhum produto encontrado.</p>
      )}

      {/* LISTA */}
      {!carregando && !erro && produtosFiltrados.length > 0 && (
        <div style={grid}>
          {produtosFiltrados.map((p) => (
            <div key={p.id} style={cardAçai}>

              <div style={cardContent}>

                <div style={{ marginBottom: 8 }}>
                  <strong>{p.nome}</strong>
                </div>

                <div style={{ marginBottom: 8 }}>
                  💰 R$ {p.preco.toFixed(2)}
                </div>

                {p.descricao && (
                  <div style={{ marginBottom: 8, color: "#555" }}>
                    {p.descricao}
                  </div>
                )}

                <div style={badges}>
                  {p.ativo && <span style={badgeVerde}>Ativo</span>}
                  {p.destaque && <span style={badgeRoxo}>Destaque</span>}
                </div>

                <div style={acoes}>
                  <Botao onClick={() => remover(p.id)} cor="#f44336">
                    Remover
                  </Botao>

                  <Botao onClick={() => alert("Em breve: edição de preço")} cor="#2196f3">
                    Editar preço
                  </Botao>
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
  background: "#6d10f9a2",
  minHeight: "100vh",
}

/* 🔍 BUSCA */
const buscaContainer = {
  marginBottom: 20,
}

const inputBusca = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  fontSize: 16,
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
        <button onClick={() => navigate("/pedidos")} style={botaoMenu}>📦 Pedidos</button>
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
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
}

/* CARD */
const card = {
   background: "#4e06f7",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
}

/* CARD AÇAÍ */
const cardAçai = {
  background: "#4e06f7",
  borderRadius: 12,
  padding: 4,
}

const cardContent = {
 background: "#6d10f9a2",
  borderRadius: 10,
  padding: 15,
}

/* BADGES */
const badges = {
  display: "flex",
  gap: 8,
  marginBottom: 10,
}

const badgeVerde = {
  background: "#4caf50",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
}

const badgeRoxo = {
  background: "#9c27b0",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
}

/* AÇÕES */
const acoes = {
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
  textAlign: "center" as const,
}

const h2Style = {
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: 15,
}