import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Playlist {
  id: string
  nome: string
  ativa: boolean

  itens?: {
    id: string
  }[]
}

const API_URL = 'https://api.acaiecompanhia.com.br'

export default function Playlists() {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [nome, setNome] = useState('')

  async function carregar() {
    const response = await axios.get(`${API_URL}/api/playlists`)

    setPlaylists(response.data.data)
  }

  async function criar() {
    if (!nome.trim()) {
      return
    }

    await axios.post(`${API_URL}/api/playlists`, {
      nome,
    })

    setNome('')

    carregar()
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Playlists</h1>

      <div
        style={{
          border: '1px solid #ddd',
          padding: 20,
          marginBottom: 20,
        }}
      >
        <input
          placeholder="Nome da playlist"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <button onClick={criar}>Criar Playlist</button>
      </div>

      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          style={{
            border: '1px solid #ddd',
            padding: 20,
            marginBottom: 15,
          }}
        >
          <h3>{playlist.nome}</h3>

          <p>Itens: {playlist.itens?.length ?? 0}</p>

          <button onClick={() => navigate(`/playlists/${playlist.id}`)}>
            Gerenciar
          </button>
        </div>
      ))}
    </div>
  )
}
