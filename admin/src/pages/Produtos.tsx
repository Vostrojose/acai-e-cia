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
  const [busca, setBusca] = useState<string>("");
  const [editando, setEditando] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState<number>(0);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarProdutos() {
    setCarregando(true);
    try {
      const res = await api.get("/produtos");
      setProdutos(res.data.data || []);
    } catch {
      setErro("Erro ao carregar produtos");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  /* ========================= */
  /* 🔥 REMOVER                */
  /* ========================= */
  async function remover(id: string) {
    if (!confirm("Deseja remover este produto?")) return;

    await api.delete(`/produtos/${id}`);
    carregarProdutos();
  }

  /* ========================= */
  /* ✏️ EDITAR PREÇO           */
  /* ========================= */
  function iniciarEdicao(p: Produto) {
    setEditando(p.id);
    setNovoPreco(p.preco);
  }

  async function salvarPreco(id: string) {
    await api.put(`/produtos/${id}`, { preco: novoPreco });
    setEditando(null);
    carregarProdutos();
  }

  /* ========================= */
  /* 🔄 ATIVAR / DESATIVAR     */
  /* ========================= */
  async function toggleAtivo(p: Produto) {
    await api.put(`/produtos/${p.id}`, {
      ativo: !p.ativo,
    });
    carregarProdutos();
  }

  /* ========================= */
  /* 🔍 FILTRO                 */
  /* ========================= */
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

      {/* BUSCA */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="🔍 Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={input}
        />
      </div>

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {/* LISTA */}
      <div style={grid}>
        {produtosFiltrados.map((p) => (
          <div key={p.id} style={cardAçai}>
            <div style={cardContent}>

              <strong>{p.nome}</strong>

              {/* PREÇO */}
              {editando === p.id ? (
                <div>
                  <input
                    type="number"
                    value={novoPreco}
                    onChange={(e) => setNovoPreco(Number(e.target.value))}
                    style={inputPreco}
                  />
                  <button onClick={() => salvarPreco(p.id)} style={btnVerde}>
                    Salvar
                  </button>
                </div>
              ) : (
                <p>💰 R$ {p.preco.toFixed(2)}</p>
              )}

              {p.descricao && <p>{p.descricao}</p>}

              {/* STATUS */}
              <div style={{ marginBottom: 10 }}>
                {p.ativo ? (
                  <span style={badgeVerde}>Ativo</span>
                ) : (
                  <span style={badgeCinza}>Inativo</span>
                )}
              </div>

              {/* AÇÕES */}
              <div style={acoes}>
                <button onClick={() => iniciarEdicao(p)} style={btnAzul}>
                  ✏️ Editar preço
                </button>

                <button onClick={() => toggleAtivo(p)} style={btnAmarelo}>
                  🔄 Ativar/Desativar
                </button>

                <button onClick={() => remover(p.id)} style={btnVermelho}>
                  🗑 Remover
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
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
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const card = {
  background: "#e80e0e",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
};

const cardAçai = {
  background: "#4e06f7",
  borderRadius: 12,
  padding: 4,
};

const cardContent = {
  background: "#0b67f2",
  borderRadius: 10,
  padding: 15,
};

const input = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const inputPreco = {
  width: "100%",
  padding: 8,
  marginBottom: 5,
};

const acoes = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 5,
};

const badgeVerde = {
  background: "#4caf50",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
};

const badgeCinza = {
  background: "#999",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
};

/* BOTÕES */
const btnVerde = { background: "#4caf50", color: "#fff", padding: 8 };
const btnAzul = { background: "#2196f3", color: "#fff", padding: 8 };
const btnAmarelo = { background: "#ff9800", color: "#fff", padding: 8 };
const btnVermelho = { background: "#f44336", color: "#fff", padding: 8 };

/* MENU */
function CardMenu({ navigate }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={() => navigate("/cozinha")}>Cozinha</button>
      <button onClick={() => navigate("/pedidos")}>Pedidos</button>
      <button onClick={() => navigate("/dashboard")}>Dashboard</button>
      <button onClick={() => navigate("/auditoria")}>Auditoria</button>
    </div>
  );
}

/* TITULOS */
const h1Style = { textAlign: "center" as const };
const h2Style = {};