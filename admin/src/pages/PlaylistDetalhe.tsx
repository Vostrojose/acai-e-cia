import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
const { id } = useParams()

const [playlist, setPlaylist] =
useState<Playlist | null>(null)

const [propagandas, setPropagandas] =
useState<Propaganda[]>([])

const [itens, setItens] =
useState<PlaylistItem[]>([])

async function carregar() {
try {
const [
playlistRes,
propagandaRes,
itensRes,
] = await Promise.all([
axios.get(
`${API_URL}/api/playlists/${id}`,
),
    axios.get(
      `${API_URL}/api/propagandas`,
    ),

    axios.get(
      `${API_URL}/api/playlists/${id}/itens`,
    ),
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

async function adicionar(
propagandaId: string,
) {
try {
await axios.post(
`${API_URL}/api/playlists/${id}/itens`,
{
propagandaId,
},
)
  await carregar()
} catch (error) {
  console.error(error)
  alert('Erro ao adicionar propaganda')
}

}

async function remover(itemId: string) {
try {
await axios.delete(
`${API_URL}/api/playlists/${id}/itens/${itemId}`,
)
  await carregar()
} catch (error) {
  console.error(error)
  alert('Erro ao remover item')
}

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
marginBottom: 25,
}}
>
<h1
style={{
margin: 0,
fontSize: 30,
}}
>
Playlist </h1>
    <p
      style={{
        margin: 0,
        opacity: 0.8,
      }}
    >
      {playlist?.nome}
    </p>
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
      }}
    >
      <h2>
        Propagandas Disponíveis
      </h2>

      {propagandas.map(
        (propaganda) => (
          <div
            key={propaganda.id}
            style={{
              background: '#111',
              borderRadius: 12,
              padding: 15,
              marginBottom: 10,
            }}
          >
            <strong>
              {propaganda.nome}
            </strong>

            <p>
              {propaganda.tipo}
            </p>

            <button
              onClick={() =>
                adicionar(
                  propaganda.id,
                )
              }
              style={botaoPrincipal}
            >
              Adicionar
            </button>
          </div>
        ),
      )}
    </div>

    <div
      style={{
        background:
          'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
        borderRadius: 16,
        padding: 20,
      }}
    >
      <h2>Itens da Playlist</h2>

      {itens.map(
        (item, index) => (
          <div
            key={item.id}
            style={{
              background: '#111',
              borderRadius: 12,
              padding: 15,
              marginBottom: 10,
            }}
          >
            <strong>
              {
                item.propaganda
                  .nome
              }
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
                  mover(
                    index,
                    'up',
                  )
                }
                style={
                  botaoSecundario
                }
              >
                ⬆
              </button>

              <button
                onClick={() =>
                  mover(
                    index,
                    'down',
                  )
                }
                style={
                  botaoSecundario
                }
              >
                ⬇
              </button>

              <button
                onClick={() =>
                  remover(item.id)
                }
                style={{
                  ...botaoSecundario,
                  borderColor:
                    '#e53935',
                }}
              >
                Remover
              </button>
            </div>
          </div>
        ),
      )}
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
