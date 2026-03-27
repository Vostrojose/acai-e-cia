// src/pages/Pedidos.tsx
import { useEffect, useState } from "react";
import api from "../services/api";

type ItemPedido = {
  id: string;
  quantidade: number;
  precoUnit: number;
  pedidoId: string;
  produtoId: string;
};

type Pedido = {
  id: string;
  status: string;
  tipo: string;
  total: number;
  telefone: string | null;
  origem: string | null;
  endereco: string | null;
  criadoEm: string;
  atualizadoEm: string;
  itens: ItemPedido[];
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Função para carregar pedidos do backend
  async function carregarPedidos() {
    setCarregando(true);
    setErro(null);

    try {
      // Ajuste: se o seu api já tem baseURL /api, basta usar '/pedidos'
      const res = await api.get("/pedidos");
      // Supondo resposta { success: true, data: [...] }
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setPedidos(res.data.data);
      } else {
        // Caso o formato seja diferente, ajustar aqui
        setErro("Resposta inesperada do servidor.");
      }
    } catch (e: any) {
      // Captura erro do fetch/axios
      setErro(e?.message || "Erro ao carregar pedidos.");
    } finally {
      setCarregando(false);
    }
  }

  // Carregar ao montar o componente
  useEffect(() => {
    carregarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exemplo simples de atualização de status (se sua API permitir)
  async function atualizarStatus(id: string, novoStatus: string) {
    try {
      await api.patch(`/pedidos/${id}/status`, { status: novoStatus });
      // Recarrega a lista após alteração
      carregarPedidos();
    } catch (e: any) {
      // Pode melhorar a UX mostrando mensagem, mas por hora:
      console.error("Erro ao atualizar status:", e);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Pedidos</h1>

      {carregando && <p>Carregando pedidos...</p>}

      {erro && (
        <p style={{ color: "red", marginBottom: 16 }}>
          Erro: {erro}
        </p>
      )}

      {!carregando && !erro && pedidos.length === 0 && (
        <p>Nenhum pedido encontrado.</p>
      )}

      {!carregando && !erro && pedidos.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pedidos.map((pedido) => (
            <li
              key={pedido.id}
              style={{
                border: "1px solid #ccc",
                marginBottom: 16,
                padding: 16,
                borderRadius: 6,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>ID:</strong> {pedido.id}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Status:</strong> {pedido.status}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Total:</strong> R$ {pedido.total.toFixed(2)}
              </div>
              {pedido.telefone && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Telefone:</strong> {pedido.telefone}
                </div>
              )}
              {pedido.endereco && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Endereço:</strong> {pedido.endereco}
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <strong>Itens:</strong>
                <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                  {pedido.itens.map((item) => (
                    <li key={item.id}>
                      {item.quantidade} × R$ {item.precoUnit.toFixed(2)}{" "}
                      (Produto {item.produtoId})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botões de exemplo para mudar status */}
              <div style={{ marginTop: 12 }}>
                {/* Ajuste os estados conforme os usados no backend */}
                {pedido.status !== "PRONTO" && (
                  <button
                    style={{ marginRight: 8 }}
                    onClick={() => atualizarStatus(pedido.id, "PRONTO")}
                  >
                    Marcar como pronto
                  </button>
                )}
                {pedido.status !== "EM_PREPARO" && (
                  <button
                    style={{ marginRight: 8 }}
                    onClick={() => atualizarStatus(pedido.id, "EM_PREPARO")}
                  >
                    Marcar como em preparo
                  </button>
                )}
                {/* Adicione mais ações se necessário */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}