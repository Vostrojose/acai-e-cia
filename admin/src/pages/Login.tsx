import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Login() {

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const navigate = useNavigate()

  async function entrar(e: any) {

    e.preventDefault()

    try {

      const res = await api.post("/login", {
        email,
        senha
      })

      localStorage.setItem("token", res.data.token)

      navigate("/dashboard")

    } catch {

      alert("Login inválido")

    }

  }

  return (

    <div style={{ padding: 40 }}>

      <h1>Painel Admin</h1>

      <form onSubmit={entrar}>

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e)=>setSenha(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Entrar
        </button>

      </form>

    </div>

  )
}