import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://api.acaiecompanhia.com.br'

interface Playlist {
id: string
nome: string
ativa: boolean

itens?: {
id: string
}[]
}

export default function Playlists() {
const navigate = useNavigate()

const [playlists, setPlaylists] =
useState<Playlist[]>([])

const [nome, setNome] = useState('')

async function carregar() {
try {
const response = await axios.get(
`${API_URL}/api/playlists`,
)


  setPlaylists(response.data.data)
} catch (error) {
  console.error(error)
  alert('Erro ao carregar playlists')
}


}

async function criar() {
try {
if (!nome.trim()) {
alert(
'Informe o nome da playlist',
)
return
}


  await axios.post(
    `${API_URL}/api/playlists`,
    {
      nome,
    },
  )

  setNome('')

  await carregar()

  alert(
    'Playlist criada com sucesso',
  )
} catch (error) {
  console.error(error)
  alert('Erro ao criar playlist')
}


}

useEffect(() => {
carregar()
}, [])

const totalPlaylists =
playlists.length

const totalItens = playlists.reduce(
(total, playlist) =>
total +
(playlist.itens?.length ?? 0),
0,
)

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
      Gerenciamento de Playlists
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
    <CardResumo
      titulo="🎞️ Playlists"
      valor={totalPlaylists}
    />

    <CardResumo
      titulo="📦 Itens"
      valor={totalItens}
    />
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
    <h2>Nova Playlist</h2>

    <input
      placeholder="Nome da playlist"
      value={nome}
      onChange={(e) =>
        setNome(e.target.value)
      }
      style={inputStyle}
    />

    <button
      onClick={criar}
      style={botaoPrincipal}
    >
      Criar Playlist
    </button>
  </div>

  <div
    style={{
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fill,minmax(350px,1fr))',
      gap: 20,
    }}
  >
    {playlists.map((playlist) => (
      <div
        key={playlist.id}
        style={{
          background:
            'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
          borderRadius: 16,
          padding: 20,
          border:
            '1px solid rgba(255,255,255,.08)',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 15,
          }}
        >
          {playlist.nome}
        </h3>

        <p>
          <strong>Itens:</strong>{' '}
          {playlist.itens?.length ??
            0}
        </p>

        <div
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: 10,
            background:
              playlist.ativa
                ? '#1b5e20'
                : '#424242',
            fontWeight: 'bold',
            marginBottom: 15,
          }}
        >
          {playlist.ativa
            ? '🟢 ATIVA'
            : '⚪ INATIVA'}
        </div>

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
              navigate(
                `/playlists/${playlist.id}`,
              )
            }
            style={botaoPrincipal}
          >
            Gerenciar
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
> <div>{titulo}</div>

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
const menuButton = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #555',
  background: '#1c1c1c',
  color: '#fff',
  cursor: 'pointer',
}
