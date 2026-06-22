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

async function carregar() {
try {
const [tvsRes, playlistsRes, statusRes] =
await Promise.all([
axios.get(`${API_URL}/api/tvs`),
axios.get(`${API_URL}/api/playlists`),
axios.get(`${API_URL}/api/tvs/status`),
])


  const statusMap = new Map<string, TVStatus>(
    statusRes.data.data.map(
      (tv: TVStatus) => [tv.id, tv],
    ),
  )

  const tvsComStatus: TV[] =
    tvsRes.data.data.map((tv: TV) => {
      const status = statusMap.get(tv.id)

      return {
        ...tv,
        online: status?.online ?? false,
        ultimaSync:
          status?.ultimaSync ?? null,
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


const interval = setInterval(
  carregar,
  10000,
)

return () =>
  clearInterval(interval)


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
    await axios.put(
      `${API_URL}/api/tvs/${id}`,
      payload,
    )

    alert(
      'TV atualizada com sucesso',
    )
  } else {
    await axios.post(
      `${API_URL}/api/tvs`,
      payload,
    )

    alert(
      'TV cadastrada com sucesso',
    )
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
setPlaylistId(
tv.playlistId ?? '',
)


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
  await axios.delete(
    `${API_URL}/api/tvs/${id}`,
  )

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

const online = tvs.filter(
(tv) => tv.online,
).length

const offline =
tvs.length - online

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
> <div>
<h1
style={{
margin: 0,
fontSize: 30,
}}
>
Açaí & Company </h1>

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
          onClick={() =>
            navigate('/cozinha')
          }
        >
          👨‍🍳 Cozinha
        </button>

        <button
          style={{
            ...menuButton,
            background: '#43a047',
          }}
          onClick={() =>
            navigate('/tvs')
          }
        >
          📺 TVs
        </button>

        <button
          style={menuButton}
          onClick={() =>
            navigate('/playlists')
          }
        >
          🎞️ Playlists
        </button>

        <button
          style={menuButton}
          onClick={() =>
            navigate('/propagandas')
          }
        >
          📢 Propagandas
        </button>

        <button
          style={menuButton}
          onClick={() =>
            navigate(
              '/monitoramento-tv',
            )
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
    <CardResumo
      titulo="📺 TVs"
      valor={tvs.length}
    />

    <CardResumo
      titulo="🟢 Online"
      valor={online}
    />

    <CardResumo
      titulo="🔴 Offline"
      valor={offline}
    />
  </div>

  {/* restante do seu código permanece igual daqui para baixo */}
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
