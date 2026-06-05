import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Fiados() {
  const timeoutRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)

  const [fiados, setFiados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function carregar() {
    try {
      setLoading(true)
      const res = await api.get('/pedidos/fiados')

      setFiados(res.data.data || [])
    } catch (err) {
      console.error('Erro ao carregar fiados:', err)
      alert('Erro ao carregar fiados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])
  function resetarTimeout() {
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(
      () => {
        navigate('/cozinha')
      },
      3 * 60 * 1000,
    )
  }
  useEffect(() => {
    async function ativarWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.error('WakeLock error:', err)
      }
    }

    ativarWakeLock()

    const handleVisibility = async () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (err) {
          console.error(err)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)

      wakeLockRef.current?.release()
    }
  }, [])

  useEffect(() => {
    resetarTimeout()

    window.addEventListener('pointerdown', resetarTimeout)
    window.addEventListener('keydown', resetarTimeout)
    window.addEventListener('click', resetarTimeout)
    window.addEventListener('touchstart', resetarTimeout)
    window.addEventListener('scroll', resetarTimeout)
    window.addEventListener('input', resetarTimeout)

    return () => {
      clearTimeout(timeoutRef.current)

      window.removeEventListener('pointerdown', resetarTimeout)
      window.removeEventListener('keydown', resetarTimeout)
      window.removeEventListener('click', resetarTimeout)
      window.removeEventListener('touchstart', resetarTimeout)
      window.removeEventListener('scroll', resetarTimeout)
      window.removeEventListener('input', resetarTimeout)
    }
  }, [])

  async function marcarComoPago(id: string) {
    try {
      resetarTimeout()

      await api.patch(`/pedidos/${id}/pagar`)

      carregar()
    } catch (err) {
      console.error('Erro ao marcar como pago:', err)
      alert('Erro ao atualizar pedido')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>💰 Fiados</h1>

      {loading && <p>Carregando...</p>}

      {!loading && fiados.length === 0 && <p>Nenhum fiado encontrado</p>}

      {fiados.map((p) => (
        <div
          key={p.id}
          style={{
            marginBottom: 12,
            padding: 12,
            background: '#f5f5f5',
            borderRadius: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <div>
            <strong>{p.clienteNome || 'Sem nome'}</strong>
          </div>
          <div>
            Valor: <strong>R$ {Number(p.total).toFixed(2)}</strong>
          </div>
          {p.criadoEm && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {new Date(p.criadoEm).toLocaleString()}
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => marcarComoPago(p.id)}
              style={{
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              ✔ Marcar como pago
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
