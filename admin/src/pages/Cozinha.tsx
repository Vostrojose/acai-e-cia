import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import api from "../services/api"

const socket = io("https://api.acaiecompanhia.com.br")

export default function Cozinha() {

  const [pedidos, setPedidos] = useState<any[]>([])

  useEffect(() => {

    async function carregarPedidos() {
      const res = await api.get("/pedidos")
      setPedidos(res.data.data)
    }

    carregarPedidos()

    socket.on("novo_pedido", (pedido) => {
      setPedidos((prev) => [pedido, ...prev])
    })

    socket.on("pedido_atualizado", (pedidoAtualizado) => {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoAtualizado.id ? pedidoAtualizado : p
        )
      )
    })

    return () => {
      socket.off("novo_pedido")
      socket.off("pedido_atualizado")
    }

  }, [])

  const novos = pedidos.filter((p) => p.status === "RECEBIDO")
  const preparo = pedidos.filter((p) => p.status === "EM_PREPARO")
  const prontos = pedidos.filter((p) => p.status === "PRONTO")

  return (
    <div style={{ padding: 20 }}>

      <h1>🍧 Painel da Cozinha</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 20
      }}>

        <Coluna titulo="🆕 Novos Pedidos" pedidos={novos} />
        <Coluna titulo="👨‍🍳 Em Preparo" pedidos={preparo} />
        <Coluna titulo="✅ Prontos" pedidos={prontos} />

      </div>

    </div>
  )
}

function Coluna({ titulo, pedidos }: any) {

  return (
    <div>

      <h2 style={{ marginBottom: 20 }}>{titulo}</h2>

      {pedidos.map((pedido: any) => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}

    </div>
  )
}

function PedidoCard({ pedido }: any) {

  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      background: "#fff8e1"
    }}>

      <h3>Pedido #{pedido.id.slice(0,6)}</h3>

      {pedido.tipo && (
        <p>
          {pedido.tipo === "MESA" && "🪑 Mesa"}
          {pedido.tipo === "RETIRADA" && "🏪 Retirada"}
          {pedido.tipo === "ENTREGA" && "🚚 Entrega"}
          {pedido.tipo === "ONLINE" && "🌐 Online"}
        </p>
      )}

      {pedido.origem && (
        <p>📍 {pedido.origem}</p>
      )}

      {pedido.telefone && (
        <p>📱 {pedido.telefone}</p>
      )}

      {pedido.endereco && (
        <p>🏠 {pedido.endereco}</p>
      )}

      <p><strong>Total:</strong> R$ {pedido.total}</p>

    </div>
  )
}