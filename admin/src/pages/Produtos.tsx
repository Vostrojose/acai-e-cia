import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProdutoForm from "../components/ProdutoForm";
import { theme } from "../assets/styles/adminTheme";

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

  async function remover(id: string) {
    if (!confirm("Deseja remover este produto?")) return;

    await api.delete(`/produtos/${id}`);
    carregarProdutos();
  }

  function iniciarEdicao(p: Produto) {
    setEditando(p.id);
    setNovoPreco(p.preco);
  }

  async function salvarPreco(id: string) {
    await api.put(`/produtos/${id}`, { preco: novoPreco });
    setEditando(null);
    carregarProdutos();
  }

  async function toggleAtivo(p: Produto) {
    await api.patch(`/produtos/${p.id}/status`, {
      ativo: !p.ativo,
    });
    carregarProdutos();
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={theme.page}>

      <CardMenu navigate={navigate} />

      <h1 style={{ ...theme.title, textAlign: "center" }}>
        🛒 Painel do Cardápio
      </h1>

      {/* FORM */}
      <div style={theme.card}>
        <h2 style={theme.title}>Adicionar novo produto</h2>
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
      {erro && <p style={{ color: "#ff5252" }}>{erro}</p>}

      {/* LISTA */}
      <div style={grid}>
        {produtosFiltrados.map((p) => (
          <div key={p.id} style={theme.card}>

            <strong style={{ fontSize: 18 }}>{p.nome}</strong>

            {/* PREÇO */}
            {editando === p.id ? (
              <>
                <input
                  type="number"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(Number(e.target.value))}
                  style={input}
                />

                <button
                  onClick={() => salvarPreco(p.id)}
                  style={{ ...theme.button, ...theme.buttonSuccess }}
                >
                  Salvar
                </button>
              </>
            ) : (
              <p style={theme.textMuted}>
                💰 R$ {p.preco.toFixed(2)}
              </p>
            )}

            {p.descricao && (
              <p style={theme.textMuted}>{p.descricao}</p>
            )}

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
              <button
                onClick={() => iniciarEdicao(p)}
                style={{ ...theme.button, ...theme.buttonPrimary }}
              >
                ✏️ Editar preço
              </button>

              <button
                onClick={() => toggleAtivo(p)}
                style={{ ...theme.button, ...theme.buttonWarning }}
              >
                🔄 Ativar/Desativar
              </button>

              <button
                onClick={() => remover(p.id)}
                style={{ ...theme.button, background: "#e53935", color: "#fff" }}
              >
                🗑 Remover
              </button>

              <button
                onClick={() => navigate(`/produtos/${p.id}/adicionais`)}
                style={{ ...theme.button, ...theme.buttonPrimary }}
              >
                ➕ Adicionais
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

/* COMPONENTES */

function CardMenu({ navigate }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <div style={{
        background: "#000",
        padding: 10,
        borderRadius: 10,
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }}>
        <button style={btnMenu} onClick={() => navigate("/cozinha")}>🍳</button>
        <button style={btnMenu} onClick={() => navigate("/pedidos")}>📦</button>
        <button style={btnMenu} onClick={() => navigate("/dashboard")}>📊</button>
        <button style={btnMenu} onClick={() => navigate("/auditoria")}>📈</button>
      </div>
    </div>
  );
}

/* ESTILOS */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "none",
  marginBottom: 10,
  fontSize: 16
};

const acoes = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
  marginTop: 10
};

const badgeVerde = {
  background: "#43a047",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: 6
};

const badgeCinza = {
  background: "#777",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: 6
};

const btnMenu = {
  background: "#333",
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 6,
  fontSize: 16,
  cursor: "pointer"
};