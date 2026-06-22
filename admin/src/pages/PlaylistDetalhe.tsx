import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://api.acaiecompanhia.com.br'

interface Playlist {
  id: string
  nome: string
}

interface Propaganda {
  id: string
  nome: string
  tipo: string
  arquivo: string
  duracao: number
  ativo: boolean
}

interface PlaylistItem {
  id: string
  ordem: number

  propaganda: {
    id: string
    nome: string
    tipo: string
    arquivo: string
    duracao: number
  }
}

export default function PlaylistDetalhe() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [propagandas, setPropagandas] = useState<Propaganda[]>([])
  const [itens, setItens] = useState<PlaylistItem[]>([])

  async function carregar() {
    try {
      const [playlistRes, propagandaRes, itensRes] = await Promise.all([
        axios.get(`${API_URL}/api/playlists/${id}`),
        axios.get(`${API_URL}/api/propagandas`),
        axios.get(`${API_URL}/api/playlists/${id}/itens`),
      ])

      setPlaylist(playlistRes.data.data)
      setPropagandas(propagandaRes.data.data)
      setItens(itensRes.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function adicionar(propagandaId: string) {
    try {
      await axios.post(`${API_URL}/api/playlists/${id}/itens`, {
        propagandaId,
      })

      await carregar()
    } catch (error) {
      console.error(error)
      alert('Erro ao adicionar propaganda')
    }
  }

  async function remover(itemId: string) {
    try {
      await axios.delete(`${API_URL}/api/playlists/${id}/itens/${itemId}`)

      await carregar()
    } catch (error) {
      console.error(error)
      alert('Erro ao remover item')
    }
  }

  async function mover(index: number, direcao: 'up' | 'down') {
    const novosItens = [...itens]

    const novoIndex =
      direcao === 'up'
        ? index - 1
        : index + 1

    if (
      novoIndex < 0 ||
      novoIndex >= novosItens.length
    ) {
      return
    }

    ;[
      novosItens[index],
      novosItens[novoIndex],
    ] = [
      novosItens[novoIndex],
      novosItens[index],
    ]

    const payload = novosItens.map(
      (item, idx) => ({
        id: item.id,
        ordem: idx + 1,
      }),
    )

    try {
      await axios.put(
        `${API_URL}/api/playlists/${id}/reordenar`,
        {
          itens: payload,
        },
      )

      await carregar()
    } catch (error) {
      console.error(error)
      alert('Erro ao reordenar playlist')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111',
        color: '#fff',
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 25,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
            }}
          >
            Açaí & Company
          </h1>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 25,
            }}
          >
            <button
              style={menuButton}
              onClick={() => navigate('/cozinha')}
            >
              👨‍🍳 Cozinha
            </button>

            <button
              style={menuButton}
              onClick={() => navigate('/tvs')}
            >
              📺 TVs
            </button>

            <button
              style={{
                ...menuButton,
                background: '#43a047',
              }}
              onClick={() => navigate('/playlists')}
            >
              🎞️ Playlists
            </button>

            <button
              style={menuButton}
              onClick={() => navigate('/propagandas')}
            >
              📢 Propagandas
            </button>

            <button
              style={menuButton}
              onClick={() =>
                navigate('/monitoramento-tv')
              }
            >
              📡 Monitoramento
            </button>
          </div>

          <p
            style={{
              margin: 0,
              opacity: 0.8,
            }}
          >
            Gerenciamento da Playlist
          </p>

          <p
            style={{
              marginTop: 10,
              opacity: 0.8,
            }}
          >
            Playlist: {playlist?.nome}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: 20,
        }}
      >
        <div
          style={{
            background:
              'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
            borderRadius: 16,
            padding: 20,
            border:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <h2>Propagandas Disponíveis</h2>

          {propagandas.map((propaganda) => (
            <div
              key={propaganda.id}
              style={{
                background: '#111',
                borderRadius: 12,
                padding: 15,
                marginBottom: 10,
                border:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >
              <strong>
                {propaganda.nome}
              </strong>

              <p>
                Tipo: {propaganda.tipo}
              </p>

              <button
                onClick={() =>
                  adicionar(propaganda.id)
                }
                style={botaoPrincipal}
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            background:
              'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
            borderRadius: 16,
            padding: 20,
            border:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <h2>Itens da Playlist</h2>

          {itens.map((item, index) => (
            <div
              key={item.id}
              style={{
                background: '#111',
                borderRadius: 12,
                padding: 15,
                marginBottom: 10,
                border:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >
              <strong>
                {item.propaganda.nome}
              </strong>

              <p>
                Ordem: {item.ordem}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() =>
                    mover(index, 'up')
                  }
                  style={botaoSecundario}
                >
                  ⬆
                </button>

                <button
                  onClick={() =>
                    mover(index, 'down')
                  }
                  style={botaoSecundario}
                >
                  ⬇
                </button>

                <button
                  onClick={() =>
                    remover(item.id)
                  }
                  style={{
                    ...botaoSecundario,
                    borderColor: '#e53935',
                  }}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const botaoPrincipal = {
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
}

const botaoSecundario = {
  padding: '10px 16px',
  borderRadius: 10,
  background: 'transparent',
  color: '#fff',
  border: '1px solid #555',
  cursor: 'pointer',
}

const menuButton = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #555',
  background: '#1c1c1c',
  color: '#fff',
  cursor: 'pointer',
}