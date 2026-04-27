import { useEffect, useState } from "react";
import api from "../services/api";

export default function BalcaoModal({ onClose, onSuccess }: any) {
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);

  /* ============================= */
  /* 🔍 BUSCAR PRODUTOS            */
  /* ============================= */
  useEffect(() => {
    async function carregar() {
      const res = await api.get("/produtos");
      setProdutos(res.data.data || []);
    }

    carregar();
  }, []);

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  /* ============================= */
  /* ➕ SELECIONAR ITEM            */
  /* ============================= */
  function toggleItem(produto: any) {
    const existente = itens.find((i) => i.id === produto.id);

    if (existente) {
      setItens(itens.filter((i) => i.id !== produto.id));
    } else {
      setItens([
        ...itens,
        {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
        },
      ]);
    }
  }

  /* ============================= */
  /* 🔢 ALTERAR QUANTIDADE         */
  /* ============================= */
  function alterarQuantidade(id: string, delta: number) {
    setItens((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantidade: Math.max(1, i.quantidade + delta) }
          : i
      )
    );
  }

  /* ============================= */
  /* 💾 SALVAR VENDA               */
  /* ============================= */
  async function salvar() {
    if (itens.length === 0) {
      alert("Selecione pelo menos um item");
      return;
    }

    try {
      await api.post("/balcao", {
        itens,
      });

      onSuccess();
      onClose(); // 🔥 fecha automaticamente
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar venda");
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>🧾 Venda Balcão</h2>

        <input
          placeholder="🔍 Buscar produto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={input}
        />

        {/* 🔥 LISTA DE PRODUTOS */}
        <div style={{ maxHeight: 200, overflow: "auto" }}>
          {produtosFiltrados.map((p) => {
            const selecionado = itens.find((i) => i.id === p.id);

            return (
              <div key={p.id} style={linha}>
                <input
                  type="checkbox"
                  checked={!!selecionado}
                  onChange={() => toggleItem(p)}
                />

                {p.nome} - R$ {p.preco}
              </div>
            );
          })}
        </div>

        {/* 🔥 ITENS SELECIONADOS */}
        <h3>Itens selecionados</h3>

        {itens.map((i) => (
          <div key={i.id} style={linha}>
            {i.nome}

            <button onClick={() => alterarQuantidade(i.id, -1)}>-</button>
            {i.quantidade}
            <button onClick={() => alterarQuantidade(i.id, 1)}>+</button>
          </div>
        ))}

        {/* 🔥 AÇÕES */}
        <button onClick={salvar} style={btn}>
          💾 Salvar venda
        </button>

        <button onClick={onClose} style={btnDanger}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ============================= */
/* ESTILOS (SEPARADOS)           */
/* ============================= */

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#111",
  padding: 20,
  borderRadius: 10,
  width: 400,
  color: "#fff",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};

const linha = {
  marginBottom: 8,
};

const btn = {
  background: "#4caf50",
  color: "#fff",
  padding: 10,
  marginTop: 10,
  border: "none",
};

const btnDanger = {
  background: "#e53935",
  color: "#fff",
  padding: 10,
  marginTop: 10,
  border: "none",
};