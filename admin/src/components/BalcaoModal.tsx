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
          adicionais: [], // 🔥 NOVO
        },
      ]);
    }
  }

  /* ============================= */
  /* 🔢 ALTERAR QUANTIDADE ITEM    */
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
  /* ➕ TOGGLE ADICIONAL           */
  /* ============================= */
  function toggleAdicional(itemId: string, adicional: any) {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const existente = item.adicionais?.find(
          (a: any) => a.id === adicional.id
        );

        if (existente) {
          return {
            ...item,
            adicionais: item.adicionais.filter(
              (a: any) => a.id !== adicional.id
            ),
          };
        }

        return {
          ...item,
          adicionais: [
            ...(item.adicionais || []),
            {
              id: adicional.id,
              nome: adicional.nome,
              quantidade: 1,
            },
          ],
        };
      })
    );
  }

  /* ============================= */
  /* 🔢 ALTERAR QTD ADICIONAL      */
  /* ============================= */
  function alterarQtdAdicional(
    itemId: string,
    adicionalId: string,
    delta: number
  ) {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        return {
          ...item,
          adicionais: item.adicionais.map((a: any) =>
            a.id === adicionalId
              ? {
                  ...a,
                  quantidade: Math.max(1, a.quantidade + delta),
                }
              : a
          ),
        };
      })
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
      onClose();
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

                {/* 🔥 ADICIONAIS (SE EXISTIREM) */}
                {selecionado && p.adicionais?.length > 0 && (
                  <div style={{ marginLeft: 20 }}>
                    {p.adicionais.map((add: any) => {
                      const item = itens.find((i) => i.id === p.id);
                      const ativo = item?.adicionais?.find(
                        (a: any) => a.id === add.id
                      );

                      return (
                        <div key={add.id}>
                          <input
                            type="checkbox"
                            checked={!!ativo}
                            onChange={() => toggleAdicional(p.id, add)}
                          />
                          + {add.nome}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 🔥 ITENS SELECIONADOS */}
        <h3>Itens selecionados</h3>

        {itens.map((i) => (
          <div key={i.id} style={linha}>
            <strong>{i.nome}</strong>

            <button onClick={() => alterarQuantidade(i.id, -1)}>-</button>
            {i.quantidade}
            <button onClick={() => alterarQuantidade(i.id, 1)}>+</button>

            {/* 🔥 ADICIONAIS SELECIONADOS */}
            {i.adicionais?.length > 0 && (
              <div style={{ marginLeft: 10 }}>
                {i.adicionais.map((a: any) => (
                  <div key={a.id}>
                    + {a.nome}

                    <button
                      onClick={() =>
                        alterarQtdAdicional(i.id, a.id, -1)
                      }
                    >
                      -
                    </button>
                    {a.quantidade}
                    <button
                      onClick={() =>
                        alterarQtdAdicional(i.id, a.id, 1)
                      }
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
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
/* ESTILOS                       */
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