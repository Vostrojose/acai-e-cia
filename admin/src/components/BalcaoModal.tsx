import { useEffect, useState } from "react";
import api from "../services/api";

export default function BalcaoModal({ onClose, onSuccess }: any) {
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);

  const [formaPagamento, setFormaPagamento] = useState("PAGO");
  const [clienteNome, setClienteNome] = useState("");

  // 🔥 NOVO (opcional - não quebra nada)
  const [pularPreparo, setPularPreparo] = useState(false);

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
          adicionais: [],
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
          ? { ...i, quantidade: Math.max(1, (i.quantidade || 1) + delta) }
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
              preco: adicional.preco,
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
          adicionais: (item.adicionais || []).map((a: any) =>
            a.id === adicionalId
              ? {
                  ...a,
                  quantidade: Math.max(1, (a.quantidade || 1) + delta),
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

    const nomeNormalizado = clienteNome
      ? clienteNome.toUpperCase().trim()
      : null;

    if (formaPagamento !== "PAGO" && !nomeNormalizado) {
      alert("Informe o nome do cliente");
      return;
    }

    try {
      await api.post("/balcao", {
        itens,
        forma: formaPagamento,
        clienteNome: formaPagamento !== "PAGO" ? nomeNormalizado : null,
        pularPreparo, // 🔥 opcional (backend já suporta)
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

        {/* PRODUTOS */}
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

                {/* ADICIONAIS */}
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

        {/* ITENS */}
        <h3>Itens selecionados</h3>

        {itens.map((i) => (
          <div key={i.id} style={linha}>
            <strong>{i.nome}</strong>

            <button onClick={() => alterarQuantidade(i.id, -1)}>-</button>
            {i.quantidade}
            <button onClick={() => alterarQuantidade(i.id, 1)}>+</button>

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

        {/* FORMA DE PAGAMENTO */}
        <select
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        >
          <option value="PAGO">💵 Pago</option>
          <option value="FIADO">🧾 Fiado</option>
          <option value="CREDITO">💳 Usar Crédito</option>
        </select>

        {/* NOME */}
        {formaPagamento !== "PAGO" && (
          <input
            placeholder="Nome do cliente"
            value={clienteNome}
            onChange={(e) =>
              setClienteNome(e.target.value.toUpperCase().trim())
            }
            style={input}
          />
        )}

        {/* 🔥 NOVO (OPCIONAL) */}
        <label style={{ marginTop: 10, display: "block" }}>
          <input
            type="checkbox"
            checked={pularPreparo}
            onChange={(e) => setPularPreparo(e.target.checked)}
          />
          Pedido já pronto
        </label>

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