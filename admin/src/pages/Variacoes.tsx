import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

type Variacao = {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

export default function Variacoes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const timeoutRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)

  const [variacoes, setVariacoes] = useState<Variacao[]>([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState(0)

  const [editando, setEditando] = useState<string | null>(null)
  const [novoPreco, setNovoPreco] = useState(0)

  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    try {
      if (!id) return
      setLoading(true)
      const res = await api.get(`/variacoes/produto/${id}`)
      setVariacoes(res.data.data || [])
    } catch (err: any) {
      console.error(err)
      alert('Erro ao carregar variacoes')
    } finally {
      setLoading(false)
    }
  }
  function resetarTimeout() {
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(
      () => {
        navigate('/cozinha')
      },
      3 * 60 * 1000,
    )
  }
  useEffect(() => {
    if (id) carregar()
  }, [id])
  useEffect(() => {
    async function ativarWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.error('WakeLock error:', err)
      }
    }

    ativarWakeLock()

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.error(err)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)

      wakeLockRef.current?.release()
    }
  }, [])
  useEffect(() => {
    resetarTimeout()

    window.addEventListener('pointerdown', resetarTimeout)
    window.addEventListener('keydown', resetarTimeout)
    window.addEventListener('click', resetarTimeout)
    window.addEventListener('touchstart', resetarTimeout)
    window.addEventListener('scroll', resetarTimeout)
    window.addEventListener('input', resetarTimeout)

    return () => {
      clearTimeout(timeoutRef.current)

      window.removeEventListener('pointerdown', resetarTimeout)
      window.removeEventListener('keydown', resetarTimeout)
      window.removeEventListener('click', resetarTimeout)
      window.removeEventListener('touchstart', resetarTimeout)
      window.removeEventListener('scroll', resetarTimeout)
      window.removeEventListener('input', resetarTimeout)
    }
  }, [])

  async function criar() {
    try {
      if (!nome || preco < 0) {
        alert('Preencha corretamente')
        return
      }

      if (!id) return

      setSalvando(true)

      await api.post('/variacoes', {
        nome,
        preco,
        produtoId: id,
      })

      setNome('')
      setPreco(0)

      await carregar()
    } finally {
      setSalvando(false)
    }
  }

  async function remover(variacaoId: string) {
    if (!confirm('Remover variacao?')) return

    await api.delete(`/variacoes/${variacaoId}`)
    await carregar()
  }

  function iniciarEdicao(a: Variacao) {
    setEditando(a.id)
    setNovoPreco(a.preco)
  }

  async function salvarPreco(variacaoId: string) {
    await api.put(`/variacoes/${variacaoId}`, {
      preco: novoPreco,
    })

    setEditando(null)
    await carregar()
  }

  async function toggleAtivo(a: Variacao) {
    await api.patch(`/variacoes/${a.id}/status`, {
      ativo: !a.ativo,
    })

    await carregar()
  }
  return (
    <div style={theme.page}>
      <h1 style={{ ...theme.title, textAlign: 'center' }}>
        Variações do Produto
      </h1>

      {/* FORM */}
      <div style={theme.card}>
        <h3>Nova variação</h3>

        <input
          placeholder="Ex: 300ml"
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
        {variacoes.map((v) => (
          <div key={v.id} style={theme.card}>
            <strong style={{ fontSize: 18 }}>{v.nome}</strong>

            {editando === v.id ? (
              <>
                <input
                  type="number"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(Number(e.target.value))}
                  style={input}
                />

                <button
                  onClick={() => salvarPreco(v.id)}
                  style={{ ...theme.button, ...theme.buttonSuccess }}
                >
                  Salvar
                </button>
              </>
            ) : (
              <p style={theme.textMuted}>💰 R$ {Number(v.preco).toFixed(2)}</p>
            )}

            <div>
              {v.ativo ? (
                <span style={badgeVerde}>Ativo</span>
              ) : (
                <span style={badgeCinza}>Inativo</span>
              )}
            </div>

            <div style={acoes}>
              <button
                onClick={() => iniciarEdicao(v)}
                style={{ ...theme.button, ...theme.buttonPrimary }}
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => toggleAtivo(v)}
                style={{ ...theme.button, ...theme.buttonWarning }}
              >
                🔄 Status
              </button>

              <button
                onClick={() => remover(v.id)}
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 30,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => navigate('/produtos')}
          style={{
            ...theme.button,
            ...theme.buttonSuccess,
            minWidth: 220,
            fontSize: 18,
            padding: '14px 20px',
          }}
        >
          ✅ Salvar
        </button>
      </div>
    </div>
  )
}
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
