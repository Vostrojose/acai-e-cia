import { useEffect, useState } from "react";
import api from "../services/api";
import ProdutoForm from "../components/ProdutoForm";

export default function Produtos() {
  const [produtos, setProdutos] = useState<any[]>([]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const res = await api.get("/produtos");
    setProdutos(res.data.data);
  }

  async function remover(id: string) {
    await api.delete(`/produtos/${id}`);
    carregarProdutos();
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Painel do Cardápio</h1>

      <ProdutoForm onCreated={carregarProdutos} />

      <h2>Produtos</h2>

      <ul>
        {produtos.map((p) => (
          <li key={p.id}>
            {p.nome} - R$ {p.preco}
            <button onClick={() => remover(p.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}