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

  return () => {
    socket.off("novo_pedido")
  }

}, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>🍧 Painel da Cozinha</h1>

      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 15,
            marginBottom: 15,
            background: "#fff8e1"
          }}
        >
          <h2>Pedido #{pedido.id}</h2>

          <p>Status: {pedido.status}</p>

          <p>Total: R$ {pedido.total}</p>
        </div>
      ))}
    </div>
  )
}