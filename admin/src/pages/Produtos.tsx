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

                <button
                  onClick={() => remover(p.id)}
                  style={{
                    background: "#f44336",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Remover
                </button>

                {/* PREPARADO PARA FUTURO */}
                <button
                  onClick={() => alert("Em breve: edição de preço")}
                  style={{
                    background: "#2196f3",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Editar preço
                </button>

              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}