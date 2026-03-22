import { useEffect, useState } from "react"
import api from "../services/api"

export default function Dashboard(){

  const [produtos,setProdutos] = useState(0)
  const [pedidos,setPedidos] = useState(0)

  useEffect(()=>{

    async function carregar(){

      const p = await api.get("/produtos")
      setProdutos(p.data.length)

      const pe = await api.get("/pedidos")
      setPedidos(pe.data.length)

    }

    carregar()

  },[])

  return(

    <div style={{padding:40}}>

      <h1>Dashboard</h1>

      <div style={{display:"flex",gap:20}}>

        <div style={{
          padding:20,
          background:"#eee",
          borderRadius:10
        }}>
          <h2>Produtos</h2>
          <h3>{produtos}</h3>
        </div>

        <div style={{
          padding:20,
          background:"#eee",
          borderRadius:10
        }}>
          <h2>Pedidos</h2>
          <h3>{pedidos}</h3>
        </div>

      </div>

    </div>

  )

}