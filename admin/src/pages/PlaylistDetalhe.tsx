import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://api.acaiecompanhia.com.br'

export default function PlaylistDetalhe() {
  const { id } = useParams()

  const [playlist, setPlaylist] = useState<any>(null)

  const [propagandas, setPropagandas] = useState<any[]>([])

  const [itens, setItens] = useState<any[]>([])

  async function carregar() {
    const [playlistRes, propagandaRes, itensRes] = await Promise.all([
      axios.get(`${API_URL}/api/playlists/${id}`),

      axios.get(`${API_URL}/api/propagandas`),

      axios.get(`${API_URL}/api/playlists/${id}/itens`),
    ])

    setPlaylist(playlistRes.data.data)

    setPropagandas(propagandaRes.data.data)

    setItens(itensRes.data.data)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function adicionar(propagandaId: string) {
    await axios.post(`${API_URL}/api/playlists/${id}/itens`, {
      propagandaId,
    })

    carregar()
  }

  async function remover(itemId: string) {
    await axios.delete(
      `${API_URL}/api/playlists/${id}/itens/${itemId}`,
    )

    carregar()
  }

  async function mover(
    index: number,
    direcao: 'up' | 'down',
  ) {
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

    await axios.put(
      `${API_URL}/api/playlists/${id}/reordenar`,
      {
        itens: payload,
      },
    )

    carregar()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Playlist: {playlist?.nome}</h1>

      <hr />

      <h2>Propagandas Disponíveis</h2>

      {propagandas.map((propaganda) => (
        <div
          key={propaganda.id}
          style={{
            border: '1px solid #ddd',
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <strong>{propaganda.nome}</strong>

          <br />

          <button
            onClick={() =>
              adicionar(propaganda.id)
            }
          >
            Adicionar
          </button>
        </div>
      ))}

      <hr />

      <h2>Itens da Playlist</h2>

      {itens.map((item, index) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ddd',
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>
                {item.propaganda.nome}
              </strong>

              <div>
                Ordem: {item.ordem}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                onClick={() =>
                  mover(index, 'up')
                }
              >
                ⬆
              </button>

              <button
                onClick={() =>
                  mover(index, 'down')
                }
              >
                ⬇
              </button>

              <button
                onClick={() =>
                  remover(item.id)
                }
              >
                🗑 Remover
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}