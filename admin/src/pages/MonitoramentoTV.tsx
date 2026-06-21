import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL =
'https://api.acaiecompanhia.com.br'

interface TVStatus {
id: string
nome: string
codigo: string
playlist: string | null
online: boolean
ultimaSync: string | null
}

export default function MonitoramentoTV() {
const [tvs, setTvs] = useState<
TVStatus[]

> ([])

async function carregar() {
try {
const response = await axios.get(
`${API_URL}/api/tvs/status`,
)


  setTvs(response.data.data)
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


      <p
        style={{
          margin: 0,
          opacity: 0.8,
        }}
      >
        Monitoramento de TVs
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

  <div
    style={{
      background:
        'linear-gradient(135deg,#1e1e1e,#2a2a2a)',
      padding: 20,
      borderRadius: 16,
      marginBottom: 25,
      border:
        '1px solid rgba(255,255,255,.08)',
    }}
  >
    Atualização automática a cada
    10 segundos
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
        <h3
          style={{
            marginTop: 0,
          }}
        >
          {tv.nome}
        </h3>

        <p>
          <strong>
            Código:
          </strong>{' '}
          {tv.codigo}
        </p>

        <p>
          <strong>
            Playlist:
          </strong>{' '}
          {tv.playlist ??
            'Não vinculada'}
        </p>

        <div
          style={{
            display:
              'inline-block',

            padding:
              '8px 12px',

            borderRadius: 10,

            background:
              tv.online
                ? '#1b5e20'
                : '#b71c1c',

            fontWeight:
              'bold',

            marginBottom: 15,
          }}
        >
          {tv.online
            ? '🟢 ONLINE'
            : '🔴 OFFLINE'}
        </div>

        <p>
          <strong>
            Última Sync:
          </strong>

          <br />

          {tv.ultimaSync
            ? new Date(
                tv.ultimaSync,
              ).toLocaleString()
            : '-'}
        </p>
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
