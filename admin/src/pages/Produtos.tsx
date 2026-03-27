// src/pages/Produtos.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import ProdutoForm from "../components/ProdutoForm";

type Produto = {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  ativo?: boolean;
  destaque?: boolean;
  // demais campos conforme o seu modelo
};

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Função para carregar produtos
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

  // Carregar ao montar
  useEffect(() => {
    carregarProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para remover um produto
  async function remover(id: string) {
    try {
      await api.delete(`/produtos/${id}`);
      // Atualiza a lista após remoção
      carregarProdutos();
    } catch (e: any) {
      console.error("Erro ao remover produto:", e);
      // Você pode setar um erro visível se quiser
      setErro("Erro ao remover produto.");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Painel do Cardápio</h1>

      {/* Form de criação */}
      <ProdutoForm onCreated={carregarProdutos} />

      {/* Informações de loading e erro */}
      {carregando && <p>Carregando produtos...</p>}

      {erro && (
        <p style={{ color: "red", marginBottom: 16 }}>
          Erro: {erro}
        </p>
      )}

      {/* Lista de produtos */}
      {!carregando && !erro && produtos.length === 0 && (
        <p>Nenhum produto encontrado.</p>
      )}

      {!carregando && !erro && produtos.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {produtos.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: 12,
                padding: 12,
                borderRadius: 4,
              }}
            >
              <div style={{ marginBottom: 4 }}>
                <strong>{p.nome}</strong>
              </div>
              <div style={{ marginBottom: 4 }}>
                R$ {p.preco.toFixed(2)}
              </div>
              {/* Exibir campos adicionais se quiser */}
              {p.descricao && (
                <div style={{ marginBottom: 4 }}>
                  {p.descricao}
                </div>
              )}
              <button onClick={() => remover(p.id)}>Remover</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}