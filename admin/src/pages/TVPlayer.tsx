import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import splashLogo from '../assets/img/splash-acai-company.png'

interface Propaganda {
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

export default function TVPlayer() {
  const { codigo } = useParams()

  const [itens, setItens] = useState<Propaganda[]>([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [carregando, setCarregando] = useState(true)

  async function carregarPlaylist() {
    try {
      const response = await axios.get(
        `https://api.acaiecompanhia.com.br/api/tv/player/${codigo}`,
      )

      setItens(response.data.data.itens)
    } catch (error) {
      console.error(error)
    } finally {
      setTimeout(() => {
        setCarregando(false)
      }, 3000)
    }
  }

  useEffect(() => {
    carregarPlaylist()
  }, [codigo])

  useEffect(() => {
    if (!itens.length) return

    const item = itens[indiceAtual]

    const tempo = (item.propaganda.duracao || 10) * 1000

    const timer = setTimeout(() => {
      setIndiceAtual((atual) => (atual + 1 >= itens.length ? 0 : atual + 1))
    }, tempo)

    return () => clearTimeout(timer)
  }, [indiceAtual, itens])
  if (carregando) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#111',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={splashLogo}
          alt="Açaí & Company"
          style={{
            maxWidth: '1000px',
            width: '80%',
            marginBottom: 30,
          }}
        />

        <p
          style={{
            fontSize: 24,
            opacity: 0.8,
          }}
        >
          Carregando conteúdo...
        </p>
      </div>
    )
  }

  if (!itens.length) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#111',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 30,
        }}
      >
        Nenhuma propaganda disponível
      </div>
    )
  }

  const item = itens[indiceAtual]

  const arquivoUrl = `https://api.acaiecompanhia.com.br/uploads/propagandas/${item.propaganda.arquivo}`

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {item.propaganda.tipo === 'VIDEO' ? (
        <video
          src={arquivoUrl}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <img
          src={arquivoUrl}
          alt={item.propaganda.nome}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  )
}
