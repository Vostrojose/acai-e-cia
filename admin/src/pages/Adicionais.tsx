import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

type Adicional = {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

export default function Adicionais({ exigirLogin }: any) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState(0)

  const [editando, setEditando] = useState<string | null>(null)
  const [novoPreco, setNovoPreco] = useState(0)

  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)

  /* ============================= */
  /* CARREGAR                      */
  /* ============================= */

  async function carregar() {
    exigirLogin(async () => {
      try {
        if (!id) return

        setLoading(true)

        const res = await api.get(`/produtos/${id}`)

        console.log('📦 RESPOSTA API:', res.data)

        setAdicionais(res.data.data.adicionais || [])
      } catch (err) {
        console.error('🔥 ERRO AO CARREGAR:', err)
        alert('Erro ao carregar adicionais')
      } finally {
        setLoading(false)
      }
    })
  }

  useEffect(() => {
    if (id) carregar()
  }, [id])

  /* ============================= */
  /* CRIAR                         */
  /* ============================= */

  async function criar() {
    exigirLogin(async () => {
      try {
        if (!nome.trim() || preco <= 0) {
          alert('Preencha corretamente')
          return
        }

        if (!id) return

        setSalvando(true)
        console.log('API:', api)
        console.log('POST:', api.post)
        console.log('ID:', id)

        await api.post(`/produtos/${id}/adicionais`, {
          nome,
          preco,
        })

        setNome('')
        setPreco(0)

        await carregar()
      } catch (err) {
        console.error('🔥 ERRO AO CRIAR:', err)
        alert('Erro ao criar adicional')
      } finally {
        setSalvando(false)
      }
    })
  }

  /* ============================= */
  /* REMOVER                       */
  /* ============================= */

  async function remover(adicionalId: string) {
    exigirLogin(async () => {
      if (!confirm('Remover adicional?')) return

      try {
        await api.delete(`/adicionais/${adicionalId}`)
        await carregar()
      } catch (err) {
        console.error('🔥 ERRO AO REMOVER:', err)
        alert('Erro ao remover adicional')
      }
    })
  }

  /* ============================= */
  /* EDITAR PREÇO                  */
  /* ============================= */

  function iniciarEdicao(a: Adicional) {
    setEditando(a.id)
    setNovoPreco(a.preco)
  }

  async function salvarPreco(adicionalId: string) {
    exigirLogin(async () => {
      try {
        await api.put(`/adicionais/${adicionalId}`, {
          preco: novoPreco,
        })

        setEditando(null)
        await carregar()
      } catch (err) {
        console.error('🔥 ERRO AO EDITAR:', err)
        alert('Erro ao atualizar preço')
      }
    })
  }

  /* ============================= */
  /* STATUS                        */
  /* ============================= */

  async function toggleAtivo(a: Adicional) {
    exigirLogin(async () => {
      try {
        await api.patch(`/adicionais/${a.id}`, {
          ativo: !a.ativo,
        })

        await carregar()
      } catch (err) {
        console.error('🔥 ERRO AO ALTERAR STATUS:', err)
        alert('Erro ao alterar status')
      }
    })
  }

  /* ============================= */
  /* UI                            */
  /* ============================= */

  return (
    <div style={theme.page}>
      <button
        onClick={() => navigate(-1)}
        style={{ ...theme.button, ...theme.buttonPrimary, marginBottom: 20 }}
      >
        ← Voltar
      </button>

      <h1 style={{ ...theme.title, textAlign: 'center' }}>
        Adicionais do Produto
      </h1>

      {/* FORM */}
      <div style={theme.card}>
        <h3>Novo adicional</h3>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={input}
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(Number(e.target.value))}
          style={input}
        />

        <button
          onClick={criar}
          disabled={salvando}
          style={{ ...theme.button, ...theme.buttonSuccess }}
        >
          {salvando ? 'Salvando...' : '➕ Adicionar'}
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      {/* LISTA */}
      <div style={grid}>
        {adicionais.map((a) => (
          <div key={a.id} style={theme.card}>
            <strong style={{ fontSize: 18 }}>{a.nome}</strong>

            {editando === a.id ? (
              <>
                <input
                  type="number"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(Number(e.target.value))}
                  style={input}
                />

                <button
                  onClick={() => salvarPreco(a.id)}
                  style={{ ...theme.button, ...theme.buttonSuccess }}
                >
                  Salvar
                </button>
              </>
            ) : (
              <p style={theme.textMuted}>💰 R$ {Number(a.preco).toFixed(2)}</p>
            )}

            <div>
              {a.ativo ? (
                <span style={badgeVerde}>Ativo</span>
              ) : (
                <span style={badgeCinza}>Inativo</span>
              )}
            </div>

            <div style={acoes}>
              <button
                onClick={() => iniciarEdicao(a)}
                style={{ ...theme.button, ...theme.buttonPrimary }}
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => toggleAtivo(a)}
                style={{ ...theme.button, ...theme.buttonWarning }}
              >
                🔄 Status
              </button>

              <button
                onClick={() => remover(a.id)}
                style={{
                  ...theme.button,
                  background: '#e53935',
                  color: '#fff',
                }}
              >
                🗑 Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ========================= */
/* ESTILO LOCAL LIMPO        */
/* ========================= */

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: 20,
}

const input = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: 'none',
  fontSize: 16,
}

const acoes = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
  marginTop: 10,
}

const badgeVerde = {
  background: '#43a047',
  padding: '4px 10px',
  borderRadius: 6,
}

const badgeCinza = {
  background: '#777',
  padding: '4px 10px',
  borderRadius: 6,
}
