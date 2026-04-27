import { useState } from "react";
import api from "../services/api";

export default function BalcaoModal({ onClose, onSuccess }: any) {
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);

  async function buscar() {
    const res = await api.get("/produtos");
    const filtrados = res.data.data.filter((p: any) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
    setProdutos(filtrados);
  }

  function adicionar(produto: any) {
    const existente = itens.find((i) => i.id === produto.id);

    if (existente) {
      setItens(
        itens.map((i) =>
          i.id === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      );
    } else {
      setItens([...itens, { ...produto, quantidade: 1 }]);
    }
  }

  async function salvar() {
    await api.post("/balcao", {
      itens,
    });

    onSuccess();
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0009" }}>
      <div style={{ background: "#111", padding: 20, margin: "10% auto", width: 400 }}>
        
        <h2>🧾 Venda Balcão</h2>

        <input
          placeholder="Buscar produto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <button onClick={buscar}>Buscar</button>

        {produtos.map((p) => (
          <div key={p.id} onClick={() => adicionar(p)}>
            {p.nome} - R$ {p.preco}
          </div>
        ))}

        <h3>Itens</h3>

        {itens.map((i) => (
          <div key={i.id}>
            {i.nome} x{i.quantidade}
          </div>
        ))}

        <button onClick={salvar}>Salvar Venda</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}