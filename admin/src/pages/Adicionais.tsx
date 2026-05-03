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

type Props = {
  exigirLogin?: (callback: () => Promise<void>) => Promise<void> | void
}

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

  useEffect(() => {
    if (!id) navigate('/produtos')
  }, [id, navigate])

  if (!id) return null

  async function carregar() {
    try {
      setLoading(true)
      const res = await api.get(`/produtos/${id}`)
      setAdicionais(res.data.data.adicionais || [])
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar adicionais')
    } finally {
      setLoading(false)
    }
  }

  async function atualizarLista() {
    await carregar()
  }

  useEffect(() => {
    carregar()
  }, [id])

  async function criar() {
    await executarComOuSemLogin(async () => {
      if (!nome.trim() || Number(preco) <= 0) {
        alert('Preencha corretamente')
        return
      }

      try {
        setSalvando(true)

        await api.post(`/produtos/${id}/adicionais`, {
          nome,
          preco: Number(preco),
        })

        setNome('')
        setPreco('')
        await atualizarLista()
      } catch {
        alert('Erro ao criar adicional')
      } finally {
        setSalvando(false)
      }
    })
  }

  async function remover(adicionalId: string) {
    await executarComOuSemLogin(async () => {
      if (!confirm('Remover adicional?')) return

      try {
        await api.delete(`/adicionais/${adicionalId}`)
        await atualizarLista()
      } catch {
        alert('Erro ao remover adicional')
      }
    })
  }

  function iniciarEdicao(a: Adicional) {
    setEditando(a.id)
    setNovoPreco(a.preco)
  }

  async function salvarPreco(adicionalId: string) {
    await executarComOuSemLogin(async () => {
      if (Number(novoPreco) <= 0) {
        alert('Preço inválido')
        return
      }

      try {
        await api.put(`/adicionais/${adicionalId}`, {
          preco: Number(novoPreco),
        })

        setEditando(null)
        await atualizarLista()
      } catch {
        alert('Erro ao atualizar preço')
      }
    })
  }

  async function toggleAtivo(a: Adicional) {
    await executarComOuSemLogin(async () => {
      try {
        await api.patch(`/adicionais/${a.id}`, {
          ativo: !a.ativo,
        })
        await atualizarLista()
      } catch {
        alert('Erro ao alterar status')
      }
    })
  }

  return (
    <div style={theme.page}>
      <button
        onClick={() => navigate(-1)}
        style={{ ...buttonBase, ...theme.buttonPrimary, marginBottom: 20 }}
      >
        ← Voltar
      </button>

      <h1 style={{ ...theme.title, textAlign: 'center' }}>
        Adicionais do Produto
      </h1>

      <div style={card}>
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
          style={{
            ...buttonBase,
            ...theme.buttonSuccess,
            opacity: salvando ? 0.6 : 1,
          }}
          onMouseEnter={(e) =>
            Object.assign(e.currentTarget.style, buttonHover)
          }
          onMouseLeave={(e) =>
            Object.assign(e.currentTarget.style, {
              transform: 'scale(1)',
              opacity: '1',
            })
          }
          onMouseDown={(e) =>
            Object.assign(e.currentTarget.style, buttonActive)
          }
          onMouseUp={(e) =>
            Object.assign(e.currentTarget.style, buttonHover)
          }
        >
          {salvando ? 'Salvando...' : '➕ Adicionar'}
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      <div style={grid}>
        {adicionais.map((a) => (
          <div key={a.id} style={card}>
            <strong>{a.nome}</strong>

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
                  style={{ ...buttonBase, ...theme.buttonSuccess }}
                >
                  Salvar
                </button>
              </>
            ) : (
              <p>💰 R$ {Number(a.preco).toFixed(2)}</p>
            )}

            <span style={a.ativo ? badgeVerde : badgeCinza}>
              {a.ativo ? 'Ativo' : 'Inativo'}
            </span>

            <div style={acoes}>
              <button
                onClick={() => iniciarEdicao(a)}
                style={{ ...buttonBase, ...theme.buttonPrimary }}
              >
                ✏️
              </button>

              <button
                onClick={() => toggleAtivo(a)}
                style={{ ...buttonBase, ...theme.buttonWarning }}
              >
                🔄
              </button>

              <button
                onClick={() => remover(a.id)}
                style={{ ...buttonBase, background: '#e53935', color: '#fff' }}
              >
                🗑
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

const card = {
  ...theme.card,
  borderRadius: 16,
  boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 24,
}

const input = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: '#1e1e2f',
  color: '#fff',
}

const acoes = {
  display: 'flex',
  gap: 8,
  marginTop: 12,
  flexWrap: 'wrap' as const,
}

const badgeVerde = {
  background: 'rgba(67,160,71,0.2)',
  color: '#4caf50',
  padding: '4px 10px',
  borderRadius: 20,
}

const badgeCinza = {
  background: 'rgba(255,255,255,0.1)',
  color: '#aaa',
  padding: '4px 10px',
  borderRadius: 20,
}

const buttonBase = {
  borderRadius: 10,
  padding: '10px 14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: 'none',
}

const buttonHover = {
  transform: 'scale(1.03)',
  opacity: 0.9,
}

const buttonActive = {
  transform: 'scale(0.98)',
}
