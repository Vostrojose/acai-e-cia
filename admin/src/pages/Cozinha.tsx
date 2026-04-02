import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import api from "../services/api"

export default function Cozinha() {

  const [pedidos, setPedidos] = useState<any[]>([])
  const [mostrarEntregues, setMostrarEntregues] = useState(false)
  const [hora, setHora] = useState(new Date())

  const intervaloSom = useRef<any>(null)

  useEffect(() => {
    const socket = io("https://api.acaiecompanhia.com.br", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })

    async function carregarPedidos() {
      try {
        const res = await api.get("/pedidos")
        setPedidos(res.data.data || [])
      } catch (err) {
        console.error("Erro ao carregar pedidos", err)
      }
    }

    carregarPedidos()

    socket.on("connect", () => {
      console.log("🟢 Socket conectado:", socket.id)
      carregarPedidos()
    })

    socket.on("disconnect", () => {
      console.log("🔴 Socket desconectado")
    })

    socket.on("novo_pedido", (pedido) => {
      tocarSom()

      setPedidos((prev) => {
        const jaExiste = prev.find(p => p.id === pedido.id)
        if (jaExiste) return prev
        return [pedido, ...prev]
      })
    })

    socket.on("pedido_atualizado", (pedidoAtualizado) => {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoAtualizado.id ? pedidoAtualizado : p
        )
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  /* ========================= */
  /* SOM AUTOMÁTICO A CADA 60s */
  /* ========================= */

  useEffect(() => {

    const temPedidoNovo = pedidos.some(p => p.status === "RECEBIDO")

    // se tiver pedido aguardando
    if (temPedidoNovo) {

      // evita duplicar intervalos
      if (!intervaloSom.current) {

        intervaloSom.current = setInterval(() => {
          console.log("🔔 Lembrete de pedido pendente")
          tocarSom()
        }, 60000) // 60 segundos

      }

    } else {
      // se não tiver mais pedidos RECEBIDO → parar som
      if (intervaloSom.current) {
        clearInterval(intervaloSom.current)
        intervaloSom.current = null
      }
    }

    return () => {}
  }, [pedidos])

  function tocarSom() {
    try {
      const audio = new Audio("/novo-pedido.mp3")
      audio.play()
    } catch {}
  }

  /* ========================= */
  /* RELÓGIO E RESET DIÁRIO    */
  /* ========================= */

  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date()
      setHora(agora)

      if (
        agora.getHours() === 0 &&
        agora.getMinutes() === 0 &&
        agora.getSeconds() === 0
      ) {
        console.log("⏰ Virou o dia! Transferindo dados para auditoria...")
        setPedidos([])
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function ordenar(lista: any[]) {
    return [...lista].sort(
      (a, b) =>
        new Date(a.criadoEm || a.createdAt).getTime() -
        new Date(b.criadoEm || b.createdAt).getTime()
    )
  }

  const novos = ordenar(pedidos.filter((p) => p.status === "RECEBIDO"))
  const preparo = ordenar(pedidos.filter((p) => p.status === "EM_PREPARO"))
  const prontos = ordenar(pedidos.filter((p) => p.status === "PRONTO"))
  const entregues = ordenar(pedidos.filter((p) => p.status === "ENTREGUE"))

  const diaSemana = hora.toLocaleDateString("pt-BR", { weekday: "long" })
  const data = hora.toLocaleDateString("pt-BR")
  const horaAtual = hora.toLocaleTimeString("pt-BR")

  return (
    <div style={{ padding: 20, background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 30 }}>
        {diaSemana} – {data} – {horaAtual}
      </h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <CardStatus titulo="🆕 Novos" valor={novos.length} cor="#f44336" />
        <CardStatus titulo="👨‍🍳 Em preparo" valor={preparo.length} cor="#ff9800" />
        <CardStatus titulo="✅ Prontos" valor={prontos.length} cor="#4caf50" />

        <div onClick={() => setMostrarEntregues(!mostrarEntregues)} style={{ cursor: "pointer" }}>
          <CardStatus titulo="📦 Entregues" valor={entregues.length} cor="#9e9e9e" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <Coluna titulo="🆕 Novos Pedidos" pedidos={novos} />
        <Coluna titulo="👨‍🍳 Em Preparo" pedidos={preparo} />
        <Coluna titulo="✅ Prontos" pedidos={prontos} />
      </div>

      {mostrarEntregues && (
        <div style={{ marginTop: 30 }}>
          <Coluna titulo="📦 Entregues" pedidos={entregues} reduzido />
        </div>
      )}
    </div>
  )
}

/* ========================= */
/* COMPONENTES               */
/* ========================= */

function CardStatus({ titulo, valor, cor }: any) {
  return (
    <div style={{
      background: cor,
      padding: 15,
      borderRadius: 10,
      minWidth: 120,
      textAlign: "center",
      color: "#fff",
      fontWeight: "bold"
    }}>
      <strong>{titulo}</strong>
      <div style={{ fontSize: 24 }}>{valor}</div>
    </div>
  )
}

function Coluna({ titulo, pedidos, reduzido }: any) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 10,
      padding: 20,
      minHeight: reduzido ? 200 : 400
    }}>
      <h2>{titulo}</h2>
      {pedidos.length === 0 && <p>Nenhum pedido</p>}
      {pedidos.map((p: any) => (
        <PedidoCard key={p.id} pedido={p} />
      ))}
    </div>
  )
}

function PedidoCard({ pedido }: any) {

  async function atualizarStatus(status: string) {
    await api.patch(`/pedidos/${pedido.id}/status`, { status })
  }

  return (
    <div style={{ padding: 15, border: "1px solid #ddd", marginBottom: 10 }}>
      <h3>Pedido #{pedido.id.slice(0, 6)}</h3>

      <p>Status: {pedido.status}</p>
      <p>Total: R$ {pedido.total}</p>

      {pedido.status === "RECEBIDO" && (
        <button onClick={() => atualizarStatus("EM_PREPARO")}>
          Iniciar preparo
        </button>
      )}

      {pedido.status === "PRONTO" && (
        <button onClick={() => atualizarStatus("ENTREGUE")}>
          QUITADO
        </button>
      )}
    </div>
  )
}

