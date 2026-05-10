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

      const res = await api.post("/auth/login", { // ✅ CORREÇÃO
        email,
        senha
      })

      //localStorage.setItem("token", res.data.token)
      sessionStorage.setItem("token", res.data.token)

      //navigate("/dashboard")
      navigate("/", { replace: true })

    } catch (err: any) {

      console.error("Erro login:", err.response?.data || err.message)

      alert("Login inválido")

    }

  }

  return (

    <div style={{ padding: 40 }}>

      <h1>Painel Admin teste</h1>

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