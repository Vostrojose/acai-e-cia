import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function Clientes() {

  const navigate = useNavigate()

  /* ============================= */
  /* 🔒 REAUTENTICAÇÃO             */
  /* ============================= */

  const [mostrarLogin, setMostrarLogin] = useState(false)

  const [email, setEmail] = useState('')

  const [senha, setSenha] = useState('')

  const [acaoPendente, setAcaoPendente] =
    useState<null | (() => void)>(null)

  const [ultimoLoginSensivel, setUltimoLoginSensivel] =
    useState<number | null>(null)

  const TEMPO_REAUTENTICACAO = 5 * 60 * 1000

  /* ============================= */
  /* CLIENTES                      */
  /* ============================= */

  const [clientes, setClientes] = useState<any[]>([])

  const [valores, setValores] = useState<{
    [key: string]: string
  }>({})

  const [novoNome, setNovoNome] = useState('')

  const [novoCredito, setNovoCredito] = useState('')

  const [loading, setLoading] = useState(false)

  /* ============================= */
  /* CARREGAR CLIENTES             */
  /* ============================= */

  async function carregar() {

    try {

      setLoading(true)

      const res = await api.get('/clientes')

      setClientes(res.data.data || [])

    } catch {

      alert('Erro ao carregar clientes')

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    carregar()

  }, [])

  /* ============================= */
  /* LOGIN REAUTENTICAÇÃO          */
  /* ============================= */

  async function login() {

    try {

      await api.post('/auth/login', {
        email,
        senha,
      })

      setUltimoLoginSensivel(Date.now())

      setMostrarLogin(false)

      setSenha('')

      setEmail('')

      acaoPendente?.()

    } catch {

      alert('Senha inválida')

    }

  }

  /* ============================= */
  /* EXIGIR RELOGIN                */
  /* ============================= */

  function exigirReautenticacao(callback: () => void) {

    const agora = Date.now()

    if (
      ultimoLoginSensivel &&
      agora - ultimoLoginSensivel < TEMPO_REAUTENTICACAO
    ) {

      callback()

      return

    }

    setAcaoPendente(() => callback)

    setMostrarLogin(true)

  }

  /* ============================= */
  /* ADICIONAR CRÉDITO             */
  /* ============================= */

  async function adicionarCredito(id: string) {

    const valorNumber = Number(valores[id])

    if (!valorNumber || valorNumber <= 0) {

      alert('Valor inválido')

      return

    }

    try {

      await api.post(`/clientes/${id}/credito`, {
        valor: valorNumber,
      })

      setValores({
        ...valores,
        [id]: '',
      })

      carregar()

    } catch {

      alert('Erro ao adicionar crédito')

    }

  }

  /* ============================= */
  /* CRIAR CLIENTE                 */
  /* ============================= */

  async function criarCliente() {

    const credito = Number(novoCredito)

    if (!novoNome.trim()) {

      alert('Informe o nome')

      return

    }

    try {

      await api.post('/clientes', {

        nome: novoNome.toUpperCase().trim(),

        credito: credito || 0,

      })

      setNovoNome('')

      setNovoCredito('')

      carregar()

    } catch {

      alert('Erro ao criar cliente')

    }

  }

  return (

    <div style={theme.page}>

      <h1 style={theme.title}>
        💳 Clientes & Créditos
      </h1>

      {/* NOVO CLIENTE */}

      <div style={boxTopo}>

        <input
          placeholder="Nome do cliente"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          style={input}
        />

        <input
          placeholder="Crédito inicial"
          value={novoCredito}
          onChange={(e) => setNovoCredito(e.target.value)}
          style={input}
        />

        <button
          onClick={criarCliente}
          style={btnPrimary}
        >
          ➕ Criar cliente
        </button>

      </div>

      {loading && (
        <p>⏳ Carregando clientes...</p>
      )}

      {!loading && clientes.length === 0 && (
        <p>Nenhum cliente encontrado</p>
      )}

      {/* CLIENTES */}

      {clientes.map((c) => (

        <div
          key={c.id}
          style={cardCliente}
        >

          <strong>{c.nome}</strong>

          <div style={{ marginTop: 6 }}>

            Saldo:

            <strong
              style={{
                color: '#4ade80',
                marginLeft: 6,
              }}
            >
              R$ {Number(c.credito).toFixed(2)}
            </strong>

          </div>

          <div style={{ marginTop: 12 }}>

            <input
              placeholder="Valor"
              value={valores[c.id] || ''}
              onChange={(e) =>

                setValores({

                  ...valores,

                  [c.id]: e.target.value,

                })

              }
              style={input}
            />

            <button

              onClick={() =>

                exigirReautenticacao(() => {

                  adicionarCredito(c.id)

                })

              }

              style={btnSuccess}

            >
              ➕ Adicionar crédito
            </button>

          </div>

        </div>

      ))}

      {/* MODAL LOGIN */}

      {mostrarLogin && (

        <div style={overlay}>

          <div style={modal}>

            <h3>🔒 Confirme sua senha</h3>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={input}
            />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={input}
            />

            <button
              style={btnSuccess}
              onClick={login}
            >
              Confirmar
            </button>

          </div>

        </div>

      )}

    </div>

  )

}

/* ============================= */
/* STYLES                        */
/* ============================= */

const boxTopo: React.CSSProperties = {

  display: 'flex',

  flexDirection: 'column',

  gap: 12,

  marginBottom: 20,

}

const input: React.CSSProperties = {

  padding: 12,

  borderRadius: 12,

  border: '1px solid #333',

  background: '#1f1f1f',

  color: '#fff',

}

const cardCliente: React.CSSProperties = {

  background: '#1b1b1b',

  padding: 18,

  borderRadius: 16,

  marginBottom: 14,

  border: '1px solid rgba(255,255,255,.05)',

}

const btnPrimary: React.CSSProperties = {

  padding: 12,

  borderRadius: 12,

  border: 'none',

  background: '#2563eb',

  color: '#fff',

  fontWeight: 700,

  cursor: 'pointer',

}

const btnSuccess: React.CSSProperties = {

  padding: 12,

  borderRadius: 12,

  border: 'none',

  background: '#16a34a',

  color: '#fff',

  fontWeight: 700,

  cursor: 'pointer',

  marginTop: 10,

}

const overlay: React.CSSProperties = {

  position: 'fixed',

  inset: 0,

  background: 'rgba(0,0,0,.6)',

  display: 'flex',

  alignItems: 'center',

  justifyContent: 'center',

  zIndex: 9999,

}

const modal: React.CSSProperties = {

  background: '#1f1f1f',

  padding: 24,

  borderRadius: 16,

  width: 320,

  display: 'flex',

  flexDirection: 'column',

  gap: 12,

}
