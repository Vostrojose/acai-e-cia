import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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
  const navigate = useNavigate()

  const [tvs, setTvs] = useState<TV[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const [id, setId] = useState('')
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [playlistId, setPlaylistId] = useState('')

  const [pesquisa, setPesquisa] = useState('')

  const [aba, setAba] = useState<'Configuração' | 'monitoramento'>(
    'Configuração',
  )

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

  async function salvar() {
    try {
      if (!id) return

      await axios.put(`${API_URL}/api/tvs/${id}`, {
        nome,
        codigo,
        playlistId: playlistId || null,
      })

      limpar()

      carregar()
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar TV.')
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

  const semPlaylist = tvs.filter((tv) => !tv.playlist).length

  const tvsFiltradas = tvs.filter((tv) => {
    const texto = pesquisa.toLowerCase()

    return (
      tv.nome.toLowerCase().includes(texto) ||
      tv.codigo.toLowerCase().includes(texto)
    )
  })

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
        {' '}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
            }}
          >
            Açaí & Company{' '}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 25,
            }}
          >
            <button style={menuButton} onClick={() => navigate('/cozinha')}>
              👨‍🍳 Cozinha
            </button>

            <button
              style={{
                ...menuButton,
                background: '#43a047',
              }}
              onClick={() => navigate('/tvs')}
            >
              📺 TVs
            </button>

            <button style={menuButton} onClick={() => navigate('/playlists')}>
              🎞️ Playlists
            </button>

            <button style={menuButton} onClick={() => navigate('/propagandas')}>
              📢 Propagandas
            </button>
          </div>

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

        <CardResumo titulo="⚠️ Sem Playlist" valor={semPlaylist} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <button
          style={{
            ...menuButton,
            background: aba === 'Configuração' ? '#43a047' : '#1c1c1c',
          }}
          onClick={() => setAba('Configuração')}
        >
          Configuração
        </button>

        <button
          style={{
            ...menuButton,
            background: aba === 'monitoramento' ? '#43a047' : '#1c1c1c',
          }}
          onClick={() => setAba('monitoramento')}
        >
          Monitoramento
        </button>
      </div>

      <input
        placeholder="Pesquisar por nome ou código..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        style={{
          ...inputStyle,
          marginBottom: 25,
        }}
      />

      {aba === 'Configuração' && (
        <div
          style={{
            background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
            padding: 24,
            borderRadius: 16,
            marginBottom: 25,
            border: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <h2>Configuração da TV</h2>

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
            disabled={!!id}
          />

          <select
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecione uma playlist</option>

            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.nome}
              </option>
            ))}
          </select>

          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >
            <button
              onClick={salvar}
              style={{
                ...botaoPrincipal,
                background: '#43a047',
                color: '#fff',
              }}
            >
              Salvar
            </button>

            <button onClick={limpar} style={botaoSecundario}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {aba === 'Configuração' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))',
            gap: 20,
            marginTop: 20,
          }}
        >
          {tvsFiltradas.map((tv) => (
            <div
              key={tv.id}
              style={{
                background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>📺 {tv.nome}</span>

                <span
                  style={{
                    fontSize: 12,
                    padding: '6px 10px',
                    borderRadius: 20,
                    background: tv.online ? '#2e7d32' : '#c62828',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                >
                  {tv.online ? 'ONLINE' : 'OFFLINE'}
                </span>
              </h3>

              {!tv.playlist && (
                <div
                  style={{
                    marginBottom: 15,
                    padding: 10,
                    borderRadius: 10,
                    background: '#ff9800',
                    color: '#000',
                    fontWeight: 'bold',
                  }}
                >
                  ⚠ TV aguardando configuração. Selecione uma playlist e clique
                  em Editar.
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 15,
                }}
              >
                <div
                  style={{
                    background: '#181818',
                    border: '1px solid #333',
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 6,
                    }}
                  >
                    Código
                  </div>

                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#90caf9',
                    }}
                  >
                    {tv.codigo}
                  </div>
                </div>

                <div
                  style={{
                    background: '#181818',
                    border: '1px solid #333',
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      marginBottom: 6,
                    }}
                  >
                    Playlist
                  </div>

                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 20,
                      background: tv.playlist ? '#2e7d32' : '#ef6c00',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  >
                    {tv.playlist?.nome ?? 'Sem Playlist'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#181818',
                  border: '1px solid #333',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 15,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    marginBottom: 6,
                  }}
                >
                  Última sincronização
                </div>

                <div
                  style={{
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  {tv.ultimaSync
                    ? new Date(tv.ultimaSync).toLocaleString('pt-BR')
                    : 'Nunca sincronizou'}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 15,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() => editar(tv)}
                  style={{
                    ...botaoPrincipal,
                    background: '#1976d2',
                    color: '#fff',
                  }}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {aba === 'monitoramento' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))',
            gap: 20,
            marginTop: 20,
          }}
        >
          {tvsFiltradas.map((tv) => (
            <div
              key={tv.id}
              style={{
                background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 15,
                }}
              >
                📺 {tv.nome}
              </h3>

              <div
                style={{
                  background: '#181818',
                  border: '1px solid #333',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    marginBottom: 4,
                  }}
                >
                  Código
                </div>

                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    letterSpacing: 1,
                    color: '#90caf9',
                  }}
                >
                  {tv.codigo}
                </div>
              </div>

              <p>
                <strong>Playlist:</strong> {tv.playlist?.nome ?? 'Sem Playlist'}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {tv.online ? '🟢 Online' : '🔴 Offline'}
              </p>

              <p>
                <strong>Última sincronização:</strong>
                <br />
                {tv.ultimaSync
                  ? new Date(tv.ultimaSync).toLocaleString('pt-BR')
                  : '-'}
              </p>

              <div
                style={{
                  marginTop: 15,
                  padding: 10,
                  borderRadius: 10,
                  background: tv.online ? '#2e7d32' : '#c62828',
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                {tv.online ? '🟢 ANDROID CONECTADO' : '🔴 ANDROID DESCONECTADO'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CardResumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
        padding: 20,
        borderRadius: 16,
        textAlign: 'center',
      }}
    >
      {' '}
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

const menuButton = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #555',
  background: '#1c1c1c',
  color: '#fff',
  cursor: 'pointer',
}
