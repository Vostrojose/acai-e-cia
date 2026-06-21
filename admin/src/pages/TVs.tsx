import { useEffect, useState } from 'react'
import axios from 'axios'
import logo from '../assets/img/logo.png'

const API_URL = 'https://api.acaiecompanhia.com.br'

interface Playlist {
  id: string
  nome: string
}

interface TV {
  id: string
  nome: string
  codigo: string
  ativa: boolean
  playlistId: string | null
  ultimaSync: string | null
  online?: boolean
  playlist: Playlist | null
}

interface TVStatus {
  id: string
  online: boolean
  ultimaSync: string | null
}

export default function TVs() {
  const [tvs, setTvs] = useState<TV[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const [id, setId] = useState('')
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [playlistId, setPlaylistId] = useState('')

  async function carregar() {
    try {
      const [tvsRes, playlistsRes, statusRes] = await Promise.all([
        axios.get(`${API_URL}/api/tvs`),
        axios.get(`${API_URL}/api/playlists`),
        axios.get(`${API_URL}/api/tvs/status`),
      ])

      const statusMap = new Map<string, TVStatus>(
        statusRes.data.data.map((tv: TVStatus) => [tv.id, tv]),
      )

      const tvsComStatus: TV[] = tvsRes.data.data.map((tv: TV) => {
        const status = statusMap.get(tv.id)

        return {
          ...tv,
          online: status?.online ?? false,
          ultimaSync: status?.ultimaSync ?? null,
        }
      })

      setTvs(tvsComStatus)
      setPlaylists(playlistsRes.data.data)
    } catch (error) {
      console.error(error)
    }
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
        alert('TV atualizada com sucesso')
      } else {
        await axios.post(`${API_URL}/api/tvs`, payload)
        alert('TV cadastrada com sucesso')
      }

      limpar()
      await carregar()
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar TV')
    }
  }

  function editar(tv: TV) {
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
    const confirmar = confirm(
      'Deseja realmente excluir esta TV?',
    )

    if (!confirmar) return

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

  const online = tvs.filter((tv) => tv.online).length
  const offline = tvs.length - online

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
        <img
          src={logo}
          alt="Açaí & Company"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
          }}
        />

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
            }}
          >
            Açaí & Company
          </h1>

          <p
            style={{
              margin: 0,
              opacity: 0.8,
            }}
          >
            Gerenciamento de TVs
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 15,
          marginBottom: 25,
        }}
      >
        <CardResumo titulo="📺 TVs" valor={tvs.length} />
        <CardResumo titulo="🟢 Online" valor={online} />
        <CardResumo titulo="🔴 Offline" valor={offline} />
      </div>

      <div
        style={{
          background:
            'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
          padding: 24,
          borderRadius: 16,
          marginBottom: 25,
          border:
            '1px solid rgba(255,255,255,.08)',
        }}
      >
        <h2>
          {id ? 'Editar TV' : 'Nova TV'}
        </h2>

        <input
          placeholder="Nome da TV"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Código da TV"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={inputStyle}
        />

        <select
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
          style={inputStyle}
        >
          <option value="">
            Selecione uma Playlist
          </option>

          {playlists.map((playlist) => (
            <option
              key={playlist.id}
              value={playlist.id}
            >
              {playlist.nome}
            </option>
          ))}
        </select>

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 15,
          }}
        >
          <button
            onClick={salvar}
            style={botaoPrincipal}
          >
            {id ? 'Atualizar TV' : 'Cadastrar TV'}
          </button>

          {id && (
            <button
              onClick={limpar}
              style={botaoSecundario}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill,minmax(350px,1fr))',
          gap: 20,
        }}
      >
        {tvs.map((tv) => (
          <div
            key={tv.id}
            style={{
              background:
                'linear-gradient(135deg,#1e1e1e,#2a2a2a)',

              borderRadius: 16,

              padding: 20,

              border: `1px solid ${
                tv.online
                  ? '#43a047'
                  : '#e53935'
              }`,
            }}
          >
            <h3>{tv.nome}</h3>

            <p>
              <strong>Código:</strong>{' '}
              {tv.codigo}
            </p>

            <p>
              <strong>Playlist:</strong>{' '}
              {tv.playlist?.nome ?? '-'}
            </p>

            <div
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 10,
                background: tv.online
                  ? '#1b5e20'
                  : '#b71c1c',
                fontWeight: 'bold',
                marginBottom: 15,
              }}
            >
              {tv.online
                ? '🟢 ONLINE'
                : '🔴 OFFLINE'}
            </div>

            <p>
              <strong>Última Sync:</strong>
              <br />
              {tv.ultimaSync
                ? new Date(
                    tv.ultimaSync,
                  ).toLocaleString()
                : '-'}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginTop: 15,
              }}
            >
              <button
                onClick={() =>
                  window.open(
                    `/tv/${tv.codigo}`,
                    '_blank',
                  )
                }
                style={botaoPrincipal}
              >
                Player
              </button>

              <button
                onClick={() => editar(tv)}
                style={botaoSecundario}
              >
                Editar
              </button>

              <button
                onClick={() => remover(tv.id)}
                style={{
                  ...botaoSecundario,
                  borderColor: '#e53935',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardResumo({
  titulo,
  valor,
}: {
  titulo: string
  valor: number
}) {
  return (
    <div
      style={{
        flex: 1,
        background:
          'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
        padding: 20,
        borderRadius: 16,
        textAlign: 'center',
      }}
    >
      <div>{titulo}</div>

      <h2>{valor}</h2>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: '1px solid #333',
  background: '#111',
  color: '#fff',
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
