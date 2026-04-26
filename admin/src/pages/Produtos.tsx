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
};

export default function Produtos() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState(0);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /* 🔐 AUTH */
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function temToken() {
    return !!localStorage.getItem("token");
  }

  function logout() {
    localStorage.removeItem("token");
    alert("Sessão encerrada");
  }

  /* ============================= */
  /* 🔐 LOGIN REAL                 */
  /* ============================= */
  async function login() {
    try {
      const res = await api.post("/auth/login", {
        email,
        senha,
      });

      const token = res.data.data.token;

      localStorage.setItem("token", token);

      // limpa campos
      setEmail("");
      setSenha("");
      setMostrarLogin(false);

    } catch {
      alert("Credenciais inválidas");
    }
  }

  /* ============================= */
  /* 🔐 VERIFICA TOKEN             */
  /* ============================= */
  function exigirLogin(callback: () => void) {
    if (!temToken()) {
      setMostrarLogin(true);
      return;
    }
    callback();
  }

  /* ============================= */
  /* 📦 PRODUTOS                   */
  /* ============================= */
  async function carregarProdutos() {
    setCarregando(true);
    setErro(null);

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
    exigirLogin(async () => {
      if (!confirm("Deseja remover este produto?")) return;
      await api.delete(`/produtos/${id}`);
      carregarProdutos();
    });
  }

  function iniciarEdicao(p: Produto) {
    exigirLogin(() => {
      setEditando(p.id);
      setNovoPreco(p.preco);
    });
  }

  async function salvarPreco(id: string) {
    exigirLogin(async () => {
      await api.put(`/produtos/${id}`, { preco: novoPreco });
      setEditando(null);
      carregarProdutos();
    });
  }

  async function toggleAtivo(p: Produto) {
    exigirLogin(async () => {
      await api.patch(`/produtos/${p.id}/status`, {
        ativo: !p.ativo,
      });
      carregarProdutos();
    });
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={theme.page}>

      <CardMenu navigate={navigate} exigirLogin={exigirLogin} />

      <h1 style={{ ...theme.title, textAlign: "center" }}>
        🛒 Painel do Cardápio
      </h1>

      {/* 🔐 BOTÃO LOGOUT */}
      {temToken() && (
        <button
          onClick={logout}
          style={{ ...theme.button, ...theme.buttonDanger, marginBottom: 10 }}
        >
          🚪 Sair
        </button>
      )}

      <div style={theme.card}>
        <h2 style={theme.title}>Adicionar novo produto</h2>

        <button
          style={{ ...theme.button, ...theme.buttonPrimary }}
          onClick={() => exigirLogin(() => {})}
        >
          🔐 Fazer login para cadastrar
        </button>

        {temToken() && (
          <ProdutoForm onCreated={carregarProdutos} />
        )}
      </div>

      <input
        placeholder="🔍 Buscar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={input}
      />

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: "#ff5252" }}>{erro}</p>}

      <div style={grid}>
        {produtosFiltrados.map((p) => (
          <div key={p.id} style={theme.card}>

            <strong>{p.nome}</strong>

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
              <p>💰 R$ {p.preco.toFixed(2)}</p>
            )}

            <div style={acoes}>
              <button onClick={() => iniciarEdicao(p)} style={btn}>
                ✏️ Editar
              </button>

              <button onClick={() => toggleAtivo(p)} style={btn}>
                🔄 Status
              </button>

              <button onClick={() => remover(p.id)} style={btnDanger}>
                🗑 Remover
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 🔐 LOGIN MODAL */}
      {mostrarLogin && (
        <div style={overlay}>
          <div style={modal}>
            <h2>🔐 Login Admin</h2>

            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
            />

            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={input}
            />

            <button onClick={login} style={btn}>
              Entrar
            </button>

            <button
              onClick={() => setMostrarLogin(false)}
              style={btnDanger}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ========================= */
/* 🎨 ESTILOS                */
/* ========================= */

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
};

const acoes = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
};

const btn = {
  background: "#2196f3",
  color: "#fff",
  padding: 10,
  border: "none",
  borderRadius: 6,
};

const btnDanger = {
  background: "#e53935",
  color: "#fff",
  padding: 10,
  border: "none",
  borderRadius: 6,
};

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#111",
  padding: 20,
  borderRadius: 10,
  width: 300,
  color: "#fff",
};

function CardMenu({ navigate, exigirLogin }: any) {
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
        <button onClick={() => navigate("/cozinha")} style={btnMenu}>🍳</button>
        <button onClick={() => navigate("/pedidos")} style={btnMenu}>📦</button>
        <button onClick={() => navigate("/dashboard")} style={btnMenu}>📈</button>
        <button onClick={() => navigate("/auditoria")} style={btnMenu}>📊</button>
        <button onClick={() => exigirLogin(() => navigate("/change-password"))}>🔑</button>
      </div>
    </div>
  );
}

const btnMenu = {
  background: "#333",
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 6,
  fontSize: 16,
  cursor: "pointer",
};