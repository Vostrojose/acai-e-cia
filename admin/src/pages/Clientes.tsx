import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Clientes() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<any[]>([]);
  const [valores, setValores] = useState<{ [key: string]: string }>({});
  const [novoNome, setNovoNome] = useState("");
  const [novoCredito, setNovoCredito] = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    try {
      setLoading(true);
      const res = await api.get("/clientes");
      setClientes(res.data.data || []);
    } catch {
      alert("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  /* ============================= */
  /* 💰 ADICIONAR CRÉDITO EXISTENTE */
  /* ============================= */
  async function adicionarCredito(id: string) {
    const valorNumber = Number(valores[id]);

    if (!valorNumber || valorNumber <= 0) {
      alert("Valor inválido");
      return;
    }

    try {
      await api.post(`/clientes/${id}/credito`, {
        valor: valorNumber,
      });

      setValores({ ...valores, [id]: "" });
      carregar();
    } catch {
      alert("Erro ao adicionar crédito");
    }
  }

  /* ============================= */
  /* ➕ CRIAR CLIENTE COM CRÉDITO  */
  /* ============================= */
  async function criarCliente() {
    const credito = Number(novoCredito);

    if (!novoNome.trim()) {
      alert("Informe o nome");
      return;
    }

    try {
      await api.post("/clientes", {
        nome: novoNome.toUpperCase().trim(),
        credito: credito || 0,
      });

      setNovoNome("");
      setNovoCredito("");
      carregar();
    } catch {
      alert("Erro ao criar cliente");
    }
  }

  return (
    <div style={{ padding: 20 }}>

      {/* 🔥 MENU DE NAVEGAÇÃO */}
      <CardMenu navigate={navigate} />

      <h1>💳 Clientes</h1>

      {/* 🔥 NOVO CLIENTE */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome do cliente"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          placeholder="Crédito inicial"
          value={novoCredito}
          onChange={(e) => setNovoCredito(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <button onClick={criarCliente}>
          ➕ Criar cliente
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      {!loading && clientes.length === 0 && (
        <p>Nenhum cliente encontrado</p>
      )}

      {clientes.map((c) => (
        <div
          key={c.id}
          style={{
            marginBottom: 10,
            padding: 10,
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <strong>{c.nome}</strong>

          <div>Saldo: R$ {Number(c.credito).toFixed(2)}</div>

          <input
            placeholder="Valor"
            value={valores[c.id] || ""}
            onChange={(e) =>
              setValores({ ...valores, [c.id]: e.target.value })
            }
            style={{ marginRight: 10 }}
          />

          <button onClick={() => adicionarCredito(c.id)}>
            ➕ Adicionar crédito
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================= */
/* MENU PADRÃO                   */
/* ============================= */

function CardMenu({ navigate }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <div
        style={{
          background: "#000",
          padding: 10,
          borderRadius: 10,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button style={btnMenu} onClick={() => navigate("/cozinha")}>🍳</button>
        <button style={btnMenu} onClick={() => navigate("/pedidos")}>📦</button>
        <button style={btnMenu} onClick={() => navigate("/produtos")}>🛒</button>
        <button style={btnMenu} onClick={() => navigate("/auditoria")}>📊</button>
        <button style={btnMenu} onClick={() => navigate("/clientes")}>💳</button>
        <button style={btnMenu} onClick={() => navigate("/financeiro")}>💰</button>
      </div>
    </div>
  );
}

/* ============================= */
/* ESTILO BOTÃO                  */
/* ============================= */

const btnMenu: React.CSSProperties = {
  background: "#333",
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 6,
  fontSize: 16,
  cursor: "pointer",
};