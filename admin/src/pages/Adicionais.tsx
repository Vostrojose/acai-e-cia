import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

type Adicional = {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

export default function Adicionais() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState(0)

  const [editando, setEditando] = useState<string | null>(null)
  const [novoPreco, setNovoPreco] = useState(0)

  const [loading, setLoading] = useState(false)

  /* ============================= */
  /* CARREGAR ADICIONAIS           */
  /* ============================= */
  async function carregar() {
    try {
      setLoading(true)

      const res = await api.get(`/produtos/${id}`)
      setAdicionais(res.data.data.adicionais || [])

    } catch (err) {
      console.error('Erro ao carregar adicionais')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  /* ============================= */
  /* CRIAR                         */
  /* ============================= */
  async function criar() {
    if (!nome || preco <= 0) {
      alert('Preencha nome e preço corretamente')
      return
    }

    await api.post('/adicionais', {
      nome,
      preco,
      produtoId: id
    })

    setNome('')
    setPreco(0)
    carregar()
  }

  /* ============================= */
  /* REMOVER                       */
  /* ============================= */
  async function remover(adicionalId: string) {
    if (!confirm('Deseja remover este adicional?')) return

    await api.delete(`/adicionais/${adicionalId}`)
    carregar()
  }

  /* ============================= */
  /* EDITAR PREÇO                  */
  /* ============================= */
  function iniciarEdicao(a: Adicional) {
    setEditando(a.id)
    setNovoPreco(a.preco)
  }

  async function salvarPreco(adicionalId: string) {
    await api.put(`/adicionais/${adicionalId}`, {
      preco: novoPreco
    })

    setEditando(null)
    carregar()
  }

  /* ============================= */
  /* ATIVAR / DESATIVAR            */
  /* ============================= */
  async function toggleAtivo(a: Adicional) {
    await api.patch(`/adicionais/${a.id}/status`, {
      ativo: !a.ativo
    })

    carregar()
  }

  return (
    <div style={page}>

      <button onClick={() => navigate('/produtos')} style={btnVoltar}>
        ← Voltar
      </button>

      <h1 style={title}>Adicionais do Produto</h1>

      {/* ========================= */}
      {/* FORM                     */}
      {/* ========================= */}
      <div style={card}>
        <h3>Novo adicional</h3>

        <input
          placeholder="Nome (Ex: Ovo)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={input}
        />

        <input
          type="number"
          placeholder="Preço (Ex: 2)"
          value={preco}
          onChange={(e) => setPreco(Number(e.target.value))}
          style={input}
        />

        <button onClick={criar} style={btnVerde}>
          ➕ Adicionar
        </button>
      </div>

      {/* ========================= */}
      {/* LISTA                    */}
      {/* ========================= */}
      {loading && <p>Carregando...</p>}

      <div style={grid}>
        {adicionais.map((a) => (
          <div key={a.id} style={cardItem}>

            <strong>{a.nome}</strong>

            {/* PREÇO */}
            {editando === a.id ? (
              <div>
                <input
                  type="number"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(Number(e.target.value))}
                  style={input}
                />
                <button onClick={() => salvarPreco(a.id)} style={btnVerde}>
                  Salvar
                </button>
              </div>
            ) : (
              <p>💰 R$ {Number(a.preco).toFixed(2)}</p>
            )}

            {/* STATUS */}
            <div>
              {a.ativo ? (
                <span style={badgeVerde}>Ativo</span>
              ) : (
                <span style={badgeCinza}>Inativo</span>
              )}
            </div>

            {/* AÇÕES */}
            <div style={acoes}>
              <button onClick={() => iniciarEdicao(a)} style={btnAzul}>
                ✏️ Editar preço
              </button>

              <button onClick={() => toggleAtivo(a)} style={btnAmarelo}>
                🔄 Ativar/Desativar
              </button>

              <button onClick={() => remover(a.id)} style={btnVermelho}>
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
/* ESTILO                   */
/* ========================= */

const page = {
  padding: 20,
  background: '#5e00ff',
  minHeight: '100vh',
  color: '#fff'
}

const title = {
  textAlign: 'center' as const
}

const card = {
  background: '#ffffff22',
  padding: 20,
  borderRadius: 10,
  marginBottom: 20
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: 20
}

const cardItem = {
  background: '#ffffff22',
  padding: 15,
  borderRadius: 10
}

const input = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: 'none'
}

const acoes = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 5,
  marginTop: 10
}

/* BOTÕES */
const btnVerde = { background: '#4caf50', color: '#fff', padding: 8 }
const btnAzul = { background: '#2196f3', color: '#fff', padding: 8 }
const btnAmarelo = { background: '#ff9800', color: '#fff', padding: 8 }
const btnVermelho = { background: '#f44336', color: '#fff', padding: 8 }
const btnVoltar = { marginBottom: 10 }

/* BADGES */
const badgeVerde = {
  background: '#4caf50',
  padding: '4px 8px',
  borderRadius: 6
}

const badgeCinza = {
  background: '#999',
  padding: '4px 8px',
  borderRadius: 6
}