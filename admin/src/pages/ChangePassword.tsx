import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ChangePassword() {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const timeoutRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)
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
    window.addEventListener('input', resetarTimeout)

    return () => {
      clearTimeout(timeoutRef.current)

      window.removeEventListener('pointerdown', resetarTimeout)
      window.removeEventListener('keydown', resetarTimeout)
      window.removeEventListener('click', resetarTimeout)
      window.removeEventListener('touchstart', resetarTimeout)
      window.removeEventListener('input', resetarTimeout)
    }
  }, [])
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (novaSenha !== confirmarSenha) {
      alert('As senhas não coincidem')
      return
    }

    const token = localStorage.getItem('token')

    try {
      setLoading(true)

      await axios.put(
        'http://localhost:3000/api/auth/change-password',
        {
          senhaAtual,
          novaSenha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      alert('Senha alterada com sucesso!')

      localStorage.removeItem('token')
      window.location.href = '/login'
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#111',
        padding: 20,

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: 24,
          color: '#fff',
          fontSize: 28,
          fontWeight: 'bold',
        }}
      >
        🔐 Alterar Senha
      </h2>
      <div
        style={{
          maxWidth: 450,
          margin: '0 auto',
          background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
          padding: 24,
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,.35)',
          border: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            type="password"
            placeholder="Senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...btnSalvar,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: '1px solid #444',
  background: '#1a1a1a',
  color: '#fff',
  boxSizing: 'border-box',
}
const btnSalvar: React.CSSProperties = {
  width: '100%',
  padding: 14,
  border: 'none',
  borderRadius: 10,
  background: '#22c55e',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: 10,
}
