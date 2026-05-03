import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

/* ========================= */
/* TIPOS                     */
/* ========================= */

type Adicional = {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

type Props = {
  exigirLogin?: (callback: () => Promise<void>) => Promise<void> | void
}

/* ========================= */
/* COMPONENTE                */
/* ========================= */

export default function Adicionais({ exigirLogin }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState<number | ''>('')

  const [editando, setEditando] = useState<string | null>(null)
  const [novoPreco, setNovoPreco] = useState<number | ''>('')

  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)

  /* ============================= */
  /* EXECUTOR SEGURO               */
  /* ============================= */
  async function executarComOuSemLogin(callback: () => Promise<void>) {
    try {
      if (typeof exigirLogin === 'function') {
        await exigirLogin(callback)
      } else {
        await callback()
      }
    } catch (err) {
      console.error('Erro no executor:', err)
    }
  }

  /* ============================= */
  /* VALIDAÇÃO ID                  */
  /* ============================= */
  useEffect(() => {
    if (!id) {
      navigate('/produtos')
    }
  }, [id, navigate])

  if (!id) return null

  /* ============================= */
  /* CARREGAR                      */
  /* ============================= */
  async function carregar() {
    try {
      setLoading(true)

      const res = await api.get(`/produtos/${id}`)

      setAdicionais(res.data.data.adicionais || [])
    } catch (err) {
      console.error('Erro ao carregar adicionais:', err)
      alert('Erro ao carregar adicionais')
    } finally {
      setLoading(false)
    }
  }

  /* ============================= */
  /* ATUALIZAR LISTA (🔥 NOVO)     */
  /* ============================= */
  async function atualizarLista() {
    await carregar()
  }

  useEffect(() => {
    carregar()
  }, [id])

  /* ============================= */
  /* CRIAR                         */
  /* ============================= */
  async function criar() {
    await executarComOuSemLogin(async () => {
      try {
        if (!nome.trim() || Number(preco) <= 0) {
          alert('Preencha corretamente')
          return
        }

        setSalvando(true)

        await api.post(`/produtos/${id}/adicionais`, {
          nome,
          preco: Number(preco),
        })

        setNome('')
        setPreco('')

        await atualizarLista()
      } catch (err) {
        console.error('Erro ao criar adicional:', err)
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
    await executarComOuSemLogin(async () => {
      if (!confirm('Remover adicional?')) return

      try {
        await api.delete(`/adicionais/${adicionalId}`)
        await atualizarLista()
      } catch (err) {
        console.error('Erro ao remover adicional:', err)
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
    await executarComOuSemLogin(async () => {
      try {
        if (Number(novoPreco) <= 0) {
          alert('Preço inválido')
          return
        }

        await api.put(`/adicionais/${adicionalId}`, {
          preco: Number(novoPreco),
        })

        setEditando(null)
        await atualizarLista()
      } catch (err) {
        console.error('Erro ao atualizar preço:', err)
        alert('Erro ao atualizar preço')
      }
    })
  }

  /* ============================= */
  /* STATUS                        */
  /* ============================= */
  async function toggleAtivo(a: Adicional) {
    await executarComOuSemLogin(async () => {
      try {
        await api.patch(`/adicionais/${a.id}`, {
          ativo: !a.ativo,
        })

        await atualizarLista()
      } catch (err) {
        console.error('Erro ao alterar status:', err)
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
          onChange={(e) =>
            setPreco(e.target.value === '' ? '' : Number(e.target.value))
          }
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
                  onChange={(e) =>
                    setNovoPreco(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
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
              <p style={theme.textMuted}>
                💰 R$ {Number(a.preco).toFixed(2)}
              </p>
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
/* ESTILO                    */
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