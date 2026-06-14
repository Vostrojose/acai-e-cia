import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = 'https://api.acaiecompanhia.com.br'

export default function TVs() {
  const [tvs, setTvs] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])

  const [id, setId] = useState('')
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [playlistId, setPlaylistId] = useState('')

  async function carregar() {
    const [tvsRes, playlistsRes, statusRes] = await Promise.all([
      axios.get(`${API_URL}/api/tvs`),
      axios.get(`${API_URL}/api/playlists`),
      axios.get(`${API_URL}/api/tvs/status`),
    ])

    const statusMap = new Map<string, any>(
      statusRes.data.data.map((tv: any) => [tv.id, tv]),
    )

    const tvsComStatus = tvsRes.data.data.map((tv: any) => ({
      ...tv,
      online: (statusMap.get(tv.id) as any)?.online ?? false,

      ultimaSync: (statusMap.get(tv.id) as any)?.ultimaSync ?? null,
    }))

    setTvs(tvsComStatus)

    setPlaylists(playlistsRes.data.data)
  }

  useEffect(() => {
    carregar()

    const interval = setInterval(carregar, 10000)

    return () => clearInterval(interval)
  }, [])

  async function salvar() {
    try {
      if (!nome.trim()) {
        alert('Informe o nome da TV')
        return
      }

      if (!codigo.trim()) {
        alert('Informe o código da TV')
        return
      }

      if (!playlistId) {
        alert('Selecione uma playlist')
        return
      }

      const payload = {
        nome,
        codigo,
        playlistId,
      }

      if (id) {
        await axios.put(`${API_URL}/api/tvs/${id}`, payload)

        alert('TV atualizada')
      } else {
        await axios.post(`${API_URL}/api/tvs`, payload)

        alert('TV cadastrada')
      }

      limpar()

      await carregar()
    } catch (error) {
      console.error(error)

      alert('Erro ao salvar TV')
    }
  }

  function editar(tv: any) {
    setId(tv.id)
    setNome(tv.nome)
    setCodigo(tv.codigo)
    setPlaylistId(tv.playlistId ?? '')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function remover(id: string) {
    const confirmar = confirm('Deseja realmente excluir esta TV?')

    if (!confirmar) {
      return
    }

    try {
      await axios.delete(`${API_URL}/api/tvs/${id}`)

      await carregar()

      alert('TV removida')
    } catch (error) {
      console.error(error)

      alert('Erro ao remover TV')
    }
  }

  function limpar() {
    setId('')
    setNome('')
    setCodigo('')
    setPlaylistId('')
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>TVs</h1>

      <div
        style={{
          border: '1px solid #ddd',
          padding: 20,
          marginBottom: 20,
          borderRadius: 8,
        }}
      >
        <h2>{id ? 'Editar TV' : 'Nova TV'}</h2>

        <input
          placeholder="Nome da TV"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <br />
        <br />

        <input
          placeholder="Código da TV"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <br />
        <br />

        <select
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
        >
          <option value="">Selecione uma Playlist</option>

          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.nome}
            </option>
          ))}
        </select>

        <br />
        <br />

        <button onClick={salvar}>{id ? 'Atualizar' : 'Salvar'}</button>

        {id && (
          <>
            {' '}
            <button onClick={limpar}>Cancelar</button>
          </>
        )}
      </div>

      {tvs.map((tv) => (
        <div
          key={tv.id}
          style={{
            border: '1px solid #ddd',
            padding: 20,
            marginBottom: 15,
            borderRadius: 8,
          }}
        >
          <h3>{tv.nome}</h3>

          <p>
            <strong>Código:</strong> {tv.codigo}
          </p>

          <p>
            <strong>Playlist:</strong> {tv.playlist?.nome ?? '-'}
          </p>

          <p>
            <strong>Status:</strong> {tv.online ? '🟢 ONLINE' : '🔴 OFFLINE'}
          </p>

          <p>
            <strong>Última Sync:</strong>{' '}
            {tv.ultimaSync ? new Date(tv.ultimaSync).toLocaleString() : '-'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 15,
            }}
          >
            <button onClick={() => window.open(`/tv/${tv.codigo}`, '_blank')}>
              Abrir Player
            </button>

            <button onClick={() => editar(tv)}>Editar</button>

            <button onClick={() => remover(tv.id)}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  )
}
