import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import splashLogo from '../assets/img/splash-acai-company.png'

const API_URL = 'https://api.acaiecompanhia.com.br'

interface PropagandaItem {
  id: string
  ordem: number

  propaganda: {
    id: string
    nome: string
    tipo: 'IMAGEM' | 'VIDEO'
    arquivo: string
    duracao: number
  }
}

export default function TVPlayer() {
  const { codigo } = useParams()

  const [itens, setItens] = useState<PropagandaItem[]>([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregarPlaylist() {
    try {
      const response = await axios.get(
        `${API_URL}/api/tv/player/${codigo}`,
      )

      const novosItens =
        response.data?.data?.itens ?? []

      setItens(novosItens)

      setErro('')
    } catch (error) {
      console.error(error)

      setErro(
        'Não foi possível carregar a playlist.',
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarPlaylist()
  }, [codigo])

  useEffect(() => {
    const interval = setInterval(() => {
      carregarPlaylist()
    }, 30000)

    return () => clearInterval(interval)
  }, [codigo])

  useEffect(() => {
    if (
      itens.length > 0 &&
      indiceAtual >= itens.length
    ) {
      setIndiceAtual(0)
    }
  }, [itens, indiceAtual])

  useEffect(() => {
    if (!itens.length) return

    const item = itens[indiceAtual]

    if (item.propaganda.tipo !== 'IMAGEM') {
      return
    }

    const tempo =
      (item.propaganda.duracao || 10) * 1000

    const timer = setTimeout(() => {
      setIndiceAtual((atual) =>
        atual + 1 >= itens.length
          ? 0
          : atual + 1,
      )
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
            width: '80%',
            maxWidth: 1000,
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

  if (erro) {
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
          fontSize: 28,
        }}
      >
        {erro}
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

  const arquivoUrl =
    `${API_URL}/uploads/propagandas/${item.propaganda.arquivo}`

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
          key={arquivoUrl}
          src={arquivoUrl}
          autoPlay
          muted
          playsInline
          onEnded={() =>
            setIndiceAtual((atual) =>
              atual + 1 >= itens.length
                ? 0
                : atual + 1,
            )
          }
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