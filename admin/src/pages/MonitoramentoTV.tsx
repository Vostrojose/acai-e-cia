import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = 'https://api.acaiecompanhia.com.br'

export default function MonitoramentoTV() {
  const [tvs, setTvs] = useState<any[]>([])

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Monitoramento de TVs</h1>

      <p>
        Atualização automática a cada
        10 segundos
      </p>

      {tvs.map((tv) => (
        <div
          key={tv.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 20,
            marginBottom: 15,
          }}
        >
          <h3>{tv.nome}</h3>

          <p>
            <strong>Código:</strong>{' '}
            {tv.codigo}
          </p>

          <p>
            <strong>Playlist:</strong>{' '}
            {tv.playlist ?? '-'}
          </p>

          <p>
            <strong>Status:</strong>{' '}
            {tv.online
              ? '🟢 ONLINE'
              : '🔴 OFFLINE'}
          </p>

          <p>
            <strong>
              Última Sync:
            </strong>{' '}
            {tv.ultimaSync
              ? new Date(
                  tv.ultimaSync,
                ).toLocaleString()
              : '-'}
          </p>
        </div>
      ))}
    </div>
  )
}