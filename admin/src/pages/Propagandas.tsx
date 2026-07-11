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

const API_URL = 'https://api.acaiecompanhia.com.br'

export default function Propagandas() {
  const navigate = useNavigate()

  const [propagandas, setPropagandas] = useState<Propaganda[]>([])

  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('IMAGEM')
  const [duracao, setDuracao] = useState(15)

  const [arquivo, setArquivo] = useState<File | null>(null)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  async function carregar() {
    try {
      const response = await axios.get(`${API_URL}/api/propagandas`)

      setPropagandas(response.data.data)
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

      await carregar()

      alert('Propaganda cadastrada com sucesso')
    } catch (error) {
      console.error(error)

      alert('Erro ao cadastrar propaganda')
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const imagens = propagandas.filter((p) => p.tipo === 'IMAGEM').length

  const videos = propagandas.filter((p) => p.tipo === 'VIDEO').length

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
        <h2
          style={{
            margin: 0,
          }}
        >
          Biblioteca de Propagandas
        </h2>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{
            ...botaoPrincipal,
            background: '#43a047',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          {mostrarFormulario ? 'Fechar' : '+ Nova Propaganda'}
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

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={inputStyle}
          >
            <option value="IMAGEM">IMAGEM</option>

            <option value="VIDEO">VIDEO</option>
          </select>

          <input
            type="number"
            value={duracao}
            onChange={(e) => setDuracao(Number(e.target.value))}
            style={inputStyle}
          />

          <input
            id="arquivoPropaganda"
            type="file"
            accept="image/*,video/mp4"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
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
            <p>
              Arquivo selecionado: <strong>{arquivo.name}</strong>
            </p>
          )}

          <button
            onClick={salvar}
            style={{
              ...botaoPrincipal,
              background: '#43a047',
              color: '#fff',
              width: '100%',
              padding: 16,
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            💾 Salvar Propaganda
          </button>
        </div>
      )}

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
              <button
                onClick={() => remover(item.id)}
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
