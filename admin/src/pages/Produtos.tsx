// src/pages/Produtos.tsx
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
        <Botao onClick={() => navigate("/dashboard")}>📊 Dashboard</Botao>
        <Botao onClick={() => navigate("/auditoria")}>📊 Auditoria</Botao>
      </div>

      <h1>Painel do Cardápio</h1>

      {/* ========================= */}
      {/* FORM CRIAÇÃO              */}
      {/* ========================= */}
      <ProdutoForm onCreated={carregarProdutos} />

      {/* ========================= */}
      {/* STATUS                    */}
      {/* ========================= */}
      {carregando && <p>Carregando produtos...</p>}

      {erro && (
        <p style={{ color: "red", marginBottom: 16 }}>
          Erro: {erro}
        </p>
      )}

      {!carregando && !erro && produtos.length === 0 && (
        <p>Nenhum produto encontrado.</p>
      )}

      {/* ========================= */}
      {/* LISTA                     */}
      {/* ========================= */}
      {!carregando && !erro && produtos.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {produtos.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: 12,
                padding: 12,
                borderRadius: 6,
                background: "#fff"
              }}
            >
              <div style={{ marginBottom: 6 }}>
                <strong>{p.nome}</strong>
              </div>

              <div style={{ marginBottom: 6 }}>
                💰 R$ {p.preco.toFixed(2)}
              </div>

              {p.descricao && (
                <div style={{ marginBottom: 6 }}>
                  {p.descricao}
                </div>
              )}

              {/* ========================= */}
              {/* AÇÕES                     */}
              {/* ========================= */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Botao onClick={() => remover(p.id)} cor="#f44336">
                  Remover
                </Botao>

                <Botao onClick={() => alert("Em breve: edição de preço")} cor="#2196f3">
                  Editar preço
                </Botao>
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
