import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import api from "../services/api"

const socket = io("https://api.acaiecompanhia.com.br", {
  transports: ["websocket"],
  reconnection: true
})

export default function Cozinha() {

  const [pedidos, setPedidos] = useState<any[]>([])

  useEffect(() => {

    async function carregarPedidos() {
      try {
        const res = await api.get("/pedidos")
        setPedidos(res.data.data || [])
      } catch (err) {
        console.error("Erro ao carregar pedidos", err)
      }
    }

    carregarPedidos()

    /* ========================= */
    /* NOVO PEDIDO               */
    /* ========================= */

    socket.on("novo_pedido", (pedido) => {

      try {
        const audio = new Audio("./novo-pedido.mp3")
        audio.play()
      } catch {}

      setPedidos((prev) => {

        const jaExiste = prev.find(p => p.id === pedido.id)

        if (jaExiste) return prev

        return [pedido, ...prev]
      })
    })

    /* ========================= */
    /* PEDIDO ATUALIZADO         */
    /* ========================= */

    socket.on("pedido_atualizado", (pedidoAtualizado) => {

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoAtualizado.id ? pedidoAtualizado : p
        )
      )
    })

    /* ========================= */
    /* RECONEXÃO SOCKET          */
    /* ========================= */

    socket.on("connect", () => {
      console.log("Socket conectado")
    })

    socket.on("disconnect", () => {
      console.log("Socket desconectado")
    })

    return () => {
      socket.off("novo_pedido")
      socket.off("pedido_atualizado")
    }

  }, [])

  /* ========================= */
  /* ORDENAR PEDIDOS           */
  /* ========================= */

  function ordenar(lista: any[]) {
    return [...lista].sort(
      (a, b) =>
        new Date(a.criadoEm || a.createdAt).getTime() -
        new Date(b.criadoEm || b.createdAt).getTime()
    )
  }

  const novos = ordenar(
    pedidos.filter((p) => p.status === "RECEBIDO")
  )

  const preparo = ordenar(
    pedidos.filter((p) => p.status === "EM_PREPARO")
  )

  const prontos = ordenar(
    pedidos.filter((p) => p.status === "PRONTO")
  )

  return (

    <div style={{ padding: 20, background: "#f5f5f5", minHeight: "100vh" }}>

      <h1 style={{ marginBottom: 30 }}>Pedidos – Status</h1>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 30
        }}
      >

        <CardStatus titulo="🆕 Novos" valor={novos.length} />
        <CardStatus titulo="👨‍🍳 Em preparo" valor={preparo.length} />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} />

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20
        }}
      >

        <Coluna titulo="🆕 Novos Pedidos" pedidos={novos} />
        <Coluna titulo="👨‍🍳 Em Preparo" pedidos={preparo} />
        <Coluna titulo="✅ Prontos" pedidos={prontos} />

      </div>

    </div>
  )
}

/* ========================= */
/* CARD STATUS               */
/* ========================= */

function CardStatus({ titulo, valor }: any) {

  return (
    <div
      style={{
        background: "#fff",
        padding: 15,
        borderRadius: 10,
        minWidth: 120,
        textAlign: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}
    >
      <strong>{titulo}</strong>
      <div style={{ fontSize: 24 }}>{valor}</div>
    </div>
  )
}

/* ========================= */
/* COLUNA                    */
/* ========================= */

function Coluna({ titulo, pedidos }: any) {

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 10,
        padding: 20,
        minHeight: 400
      }}
    >

      <h2 style={{ marginBottom: 20 }}>{titulo}</h2>

      {pedidos.length === 0 && (
        <p style={{ color: "#777" }}>Nenhum pedido</p>
      )}

      {pedidos.map((pedido: any) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}

    </div>
  )
}

/* ========================= */
/* CARD DO PEDIDO            */
/* ========================= */

function PedidoCard({ pedido }: any) {

  async function atualizarStatus(status: string) {
    try {
      await api.patch(`/pedidos/${pedido.id}/status`, { status })
    } catch {
      alert("Erro ao atualizar pedido")
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        background: "#fff8e1"
      }}
    >

      <h3>Pedido #{pedido.id.slice(0, 6)}</h3>

      {pedido.tipo && (
        <p>
          {pedido.tipo === "MESA" && "🪑 Mesa"}
          {pedido.tipo === "RETIRADA" && "🏪 Retirada"}
          {pedido.tipo === "ENTREGA" && "🚚 Entrega"}
          {pedido.tipo === "ONLINE" && "🌐 Online"}
        </p>
      )}

      {pedido.origem && <p>📍 {pedido.origem}</p>}
      {pedido.telefone && <p>📱 {pedido.telefone}</p>}
      {pedido.endereco && <p>🏠 {pedido.endereco}</p>}

      <p>
        <strong>Total:</strong> R$ {pedido.total}
      </p>

      <div style={{ marginTop: 10 }}>

        {pedido.status === "RECEBIDO" && (
          <button
            onClick={() => atualizarStatus("EM_PREPARO")}
            style={{
              padding: "8px 12px",
              borderRadius: 5,
              border: "none",
              background: "#ff9800",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Iniciar preparo
          </button>
        )}

        {pedido.status === "EM_PREPARO" && (
          <button
            onClick={() => atualizarStatus("PRONTO")}
            style={{
              padding: "8px 12px",
              borderRadius: 5,
              border: "none",
              background: "#4caf50",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Marcar pronto
          </button>
        )}

        {pedido.status === "PRONTO" && (
          <button
            onClick={() => atualizarStatus("ENTREGUE")}
            style={{
              padding: "8px 12px",
              borderRadius: 5,
              border: "none",
              background: "#2196f3",
              color: "#fff",
              cursor: "pointer",
              marginLeft: 10
            }}
          >
            QUITADO
          </button>
        )}

      </div>

    </div>
  )
}