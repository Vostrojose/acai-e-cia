import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Propaganda {
  id: string
  nome: string
  tipo: string
  arquivo: string
  url: string
  duracao: number
  ativo: boolean
}

interface Playlist {
  id: string
  nome: string
}
const API_URL = 'https://api.acaiecompanhia.com.br'

export default function Propagandas() {
  const navigate = useNavigate()

  const [propagandas, setPropagandas] = useState<Propaganda[]>([])

  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('IMAGEM')
  const [duracao, setDuracao] = useState(15)

  const [arquivo, setArquivo] = useState<File | null>(null)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro'>(
    'sucesso',
  )
  const [progressoUpload, setProgressoUpload] = useState(0)
  const [publicando, setPublicando] = useState(false)

  const [mostrarPublicacao, setMostrarPublicacao] = useState(false)

  const [playlistSelecionada, setPlaylistSelecionada] = useState('')

  const [propagandaSelecionada, setPropagandaSelecionada] =
    useState<Propaganda | null>(null)

  async function carregar() {
    try {
      const [propagandasRes, playlistsRes] = await Promise.all([
        axios.get(`${API_URL}/api/propagandas`),
        axios.get(`${API_URL}/api/playlists`),
      ])

      setPropagandas(propagandasRes.data.data)

      setPlaylists(playlistsRes.data.data)
    } catch (error) {
      console.error(error)
      alert('Erro ao carregar propagandas')
    }
  }

  async function remover(id: string) {
    const confirmar = confirm('Deseja realmente excluir esta propaganda?')

    if (!confirmar) {
      return
    }

    try {
      await axios.delete(`${API_URL}/api/propagandas/${id}`)

      await carregar()

      alert('Propaganda removida')
    } catch (error: any) {
      console.error(error)

      alert(
        error?.response?.data?.message ??
          error?.message ??
          'Erro ao remover propaganda',
      )
    }
  }

  async function salvar() {
    try {
      setPublicando(true)
      setProgressoUpload(0)
      if (!nome.trim()) {
        alert('Informe o nome da propaganda')
        return
      }

      if (!arquivo) {
        alert('Selecione um arquivo')
        return
      }

      const formData = new FormData()

      formData.append('arquivo', arquivo)

      const upload = await axios.post(
        `${API_URL}/api/propagandas/upload`,
        formData,
        {
          onUploadProgress: (evento) => {
            if (!evento.total) return

            const progresso = Math.round((evento.loaded * 100) / evento.total)

            setProgressoUpload(progresso)
          },
        },
      )

      await axios.post(`${API_URL}/api/propagandas`, {
        nome,
        tipo,
        duracao,
        arquivo: upload.data.arquivo,
      })

      setNome('')
      setTipo('IMAGEM')
      setDuracao(15)
      setArquivo(null)
      setMostrarFormulario(false)

      await carregar()

      mostrarMensagem('Propaganda publicada com sucesso.', 'sucesso')
    } catch (error) {
      console.error(error)

      mostrarMensagem('Erro ao publicar propaganda.', 'erro')
    } finally {
      setPublicando(false)
      setProgressoUpload(0)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const imagens = propagandas.filter((p) => p.tipo === 'IMAGEM').length

  const videos = propagandas.filter((p) => p.tipo === 'VIDEO').length

  function mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    setMensagem(texto)
    setTipoMensagem(tipo)

    setTimeout(() => {
      setMensagem('')
    }, 3000)
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
      {mensagem && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: tipoMensagem === 'sucesso' ? '#2e7d32' : '#c62828',
            color: '#fff',
            padding: '18px 24px',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,.35)',
            fontWeight: 'bold',
            minWidth: 300,
            animation: 'fadeIn .2s',
          }}
        >
          {mensagem}
        </div>
      )}
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

            <button style={menuButton} onClick={() => navigate('/tvs')}>
              📺 TVs
            </button>

            <button style={menuButton} onClick={() => navigate('/playlists')}>
              🎞️ Playlists
            </button>

            <button
              style={{
                ...menuButton,
                background: '#43a047',
              }}
              onClick={() => navigate('/propagandas')}
            >
              📢 Propagandas
            </button>

            <button
              style={menuButton}
              onClick={() => navigate('/monitoramento-tv')}
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
            Gerenciamento de Propagandas
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
        <CardResumo titulo="📢 Propagandas" valor={propagandas.length} />

        <CardResumo titulo="🖼 Imagens" valor={imagens} />

        <CardResumo titulo="🎬 Vídeos" valor={videos} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 26,
            }}
          >
            🎬 Biblioteca de Mídia
          </h2>

          <p
            style={{
              marginTop: 6,
              opacity: 0.7,
              fontSize: 14,
            }}
          >
            Gerencie vídeos e imagens que serão exibidos nas TVs.
          </p>
        </div>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{
            ...botaoPrincipal,
            background: '#43a047',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          {mostrarFormulario ? '✖ Fechar' : '⬆ Nova Mídia'}
        </button>
      </div>

      {mostrarFormulario && (
        <div
          style={{
            background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
            padding: 24,
            borderRadius: 16,
            marginBottom: 25,
            border: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <h2>Nova Propaganda</h2>

          <input
            placeholder="Nome da propaganda"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={inputStyle}
          />

          {tipo === 'IMAGEM' && (
            <input
              type="number"
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
              style={inputStyle}
              placeholder="Tempo da imagem (segundos)"
            />
          )}

          <input
            id="arquivoPropaganda"
            type="file"
            accept="image/*,video/mp4"
            onChange={(e) => {
              const file = e.target.files?.[0]

              if (!file) return

              setArquivo(file)

              if (file.type.startsWith('video')) {
                setTipo('VIDEO')
              } else {
                setTipo('IMAGEM')
              }

              if (!nome.trim()) {
                const nomeArquivo = file.name
                  .replace(/\.[^/.]+$/, '')
                  .replace(/[-_]/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())

                setNome(nomeArquivo)
              }
            }}
            style={{
              display: 'none',
            }}
          />

          <label
            htmlFor="arquivoPropaganda"
            style={{
              display: 'block',
              border: '2px dashed #555',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 20,
              transition: '.2s',
            }}
          >
            <div
              style={{
                fontSize: 50,
                marginBottom: 10,
              }}
            >
              ⬆
            </div>

            <h3
              style={{
                margin: 0,
              }}
            >
              Clique para selecionar
            </h3>

            <p
              style={{
                opacity: 0.7,
                marginTop: 10,
              }}
            >
              PNG • JPG • WEBP • MP4
            </p>

            <small
              style={{
                opacity: 0.6,
              }}
            >
              Máximo recomendado: 300 MB
            </small>
          </label>

          {arquivo && (
            <div
              style={{
                background: '#181818',
                border: '1px solid #333',
                borderRadius: 18,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 25,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: '#43a047',
                  }}
                >
                  Preview
                </h3>

                <p
                  style={{
                    opacity: 0.7,
                    marginTop: 8,
                  }}
                >
                  Confira a mídia antes de publicar
                </p>

                <div
                  style={{
                    marginTop: 20,
                  }}
                >
                  {arquivo.type.startsWith('image') ? (
                    <img
                      src={URL.createObjectURL(arquivo)}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: 380,
                        objectFit: 'contain',
                        borderRadius: 14,
                        background: '#000',
                      }}
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(arquivo)}
                      controls
                      style={{
                        width: '100%',
                        maxHeight: 380,
                        borderRadius: 14,
                        background: '#000',
                      }}
                    />
                  )}
                </div>
              </div>

              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid #333',
                  margin: '24px 0',
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr',
                  rowGap: 12,
                }}
              >
                <strong>Nome</strong>
                <span>{nome}</span>

                <strong>Arquivo</strong>
                <span>{arquivo.name}</span>

                <strong>Tipo</strong>
                <span>
                  {arquivo.type.startsWith('video') ? '🎬 Vídeo' : '🖼 Imagem'}
                </span>

                <strong>Tamanho</strong>
                <span>{(arquivo.size / 1024 / 1024).toFixed(2)} MB</span>

                {tipo === 'IMAGEM' && (
                  <>
                    <strong>Duração</strong>
                    <span>{duracao} segundos</span>
                  </>
                )}
              </div>

              {publicando && (
                <div
                  style={{
                    marginTop: 25,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      fontWeight: 'bold',
                    }}
                  >
                    Enviando mídia...
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: 12,
                      background: '#333',
                      borderRadius: 30,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${progressoUpload}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg,#43a047,#66bb6a)',
                        transition: '.2s',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      marginTop: 6,
                      fontWeight: 'bold',
                    }}
                  >
                    {progressoUpload}%
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={salvar}
            disabled={publicando}
            style={{
              ...botaoPrincipal,
              background: 'linear-gradient(135deg,#43a047,#2e7d32)',
              color: '#fff',
              width: '100%',
              padding: 18,
              fontSize: 18,
              fontWeight: 'bold',
              borderRadius: 12,
              boxShadow: '0 8px 20px rgba(0,0,0,.35)',
              opacity: publicando ? 0.7 : 1,
              cursor: publicando ? 'not-allowed' : 'pointer',
            }}
          >
            {publicando ? '⏳ Publicando...' : '🚀 Publicar Mídia'}
          </button>
        </div>
      )}

      {!mostrarFormulario && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(350px,1fr))',
            gap: 20,
          }}
        >
          {propagandas.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <h3>{item.nome}</h3>

              <div
                style={{
                  marginBottom: 15,
                }}
              >
                {item.tipo === 'IMAGEM' ? (
                  <img
                    src={item.url}
                    alt={item.nome}
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <video
                    src={item.url}
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      borderRadius: 10,
                    }}
                    muted
                  />
                )}
              </div>

              <p>
                <strong>Tipo:</strong> {item.tipo}
              </p>

              <p>
                <strong>Duração:</strong> {item.duracao}s
              </p>

              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: item.ativo ? '#1b5e20' : '#b71c1c',
                  fontWeight: 'bold',
                  marginBottom: 15,
                }}
              >
                {item.ativo ? '🟢 ATIVA' : '🔴 INATIVA'}
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 15,
                  }}
                >
                  <button
                    onClick={() => {
                      setPropagandaSelecionada(item)
                      setPlaylistSelecionada('')
                      setMostrarPublicacao(true)
                    }}
                    style={{
                      ...botaoPrincipal,
                      background: '#1976d2',
                      color: '#fff',
                      flex: 1,
                    }}
                  >
                    📤 Publicar
                  </button>

                  <button
                    onClick={() => remover(item.id)}
                    style={{
                      ...botaoSecundario,
                      borderColor: '#e53935',
                    }}
                  >
                    🗑 Excluir
                  </button>
                </div>
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
