import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function BannerAcompanhamento() {
  const navigate = useNavigate()
  const timeoutRef = useRef<any>(null)
  const wakeLockRef = useRef<any>(null)
  const carregouInicial = useRef(false)
  const autoSalvoTimeoutRef = useRef<any>(null)

  const [titulo, setTitulo] = useState('')
  const [itensTexto, setItensTexto] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [autoSalvando, setAutoSalvando] = useState(false)
  const [autoSalvo, setAutoSalvo] = useState(false)

  useEffect(() => {
    carregarBanner()
  }, [])
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
    if (!carregouInicial.current) {
      carregouInicial.current = true
      return
    }

    if (!titulo.trim() && !itensTexto.trim()) return

    const timer = setTimeout(() => {
      salvarAutomaticamente()
    }, 3000)

    return () => clearTimeout(timer)
  }, [titulo, itensTexto])
  async function carregarBanner() {
    try {
      const res = await api.get('/configuracoes/banner-acompanhamento')

      setTitulo(res.data.titulo || '')

      setItensTexto((res.data.itens || []).join('\n'))
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar banner')
    }
  }
  useEffect(() => {
    resetarTimeout()

    window.addEventListener('pointerdown', resetarTimeout)
    window.addEventListener('keydown', resetarTimeout)
    window.addEventListener('click', resetarTimeout)
    window.addEventListener('touchstart', resetarTimeout)
    window.addEventListener('input', resetarTimeout)

    return () => {
      clearTimeout(timeoutRef.current)
      clearTimeout(autoSalvoTimeoutRef.current)

      window.removeEventListener('pointerdown', resetarTimeout)
      window.removeEventListener('keydown', resetarTimeout)
      window.removeEventListener('click', resetarTimeout)
      window.removeEventListener('touchstart', resetarTimeout)
      window.removeEventListener('input', resetarTimeout)
    }
  }, [])

  async function salvar() {
    try {
      setSalvando(true)

      await api.put('/configuracoes/banner-acompanhamento', {
        titulo,

        itens: itensTexto
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      })

      setMensagem('Banner atualizado com sucesso')

      setTimeout(() => {
        setMensagem('')
      }, 3000)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar banner')
    } finally {
      setSalvando(false)
    }
  }
  async function salvarAutomaticamente() {
    try {
      setAutoSalvando(true)

      await api.put('/configuracoes/banner-acompanhamento', {
        titulo,
        itens: itensTexto
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      })
      setAutoSalvo(true)

      clearTimeout(autoSalvoTimeoutRef.current)

      autoSalvoTimeoutRef.current = setTimeout(() => {
        setAutoSalvo(false)
      }, 2000)
    } catch (err) {
      console.error('Erro no autosave', err)
    } finally {
      setAutoSalvando(false)
    }
  }
  function resetarTimeout() {
    clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(
      () => {
        navigate('/cozinha')
      },
      3 * 60 * 1000,
    )
  }
  return (
    <div style={theme.page}>
      <CardMenu navigate={navigate} />

      <h1
        style={{
          ...theme.title,
          textAlign: 'center',
        }}
      >
        📢 Banner Acompanhamento
      </h1>

      <div
        style={{
          background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
          padding: 24,
          borderRadius: 16,
          color: '#fff',
          maxWidth: 700,
          width: '100%',
          margin: '0 auto',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 12px rgba(0,0,0,.35)',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <label style={label}>📝 Título do banner</label>

          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={input}
            placeholder="Digite o título"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={label}>📋 Itens do banner</label>

          <textarea
            value={itensTexto}
            onChange={(e) => setItensTexto(e.target.value)}
            style={textarea}
            placeholder="Um item por linha"
          />
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          style={{
            ...theme.button,
            ...theme.buttonPrimary,
            width: '100%',
          }}
        >
          {salvando ? 'Salvando...' : '💾 Salvar banner'}
        </button>
        {autoSalvando && (
          <p
            style={{
              marginTop: 10,
              color: '#facc15',
              textAlign: 'center',
            }}
          >
            💾 Salvando automaticamente...
          </p>
        )}
        {autoSalvo && (
          <p
            style={{
              marginTop: 10,
              color: '#22c55e',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            ✅ Salvo automaticamente
          </p>
        )}

        {mensagem && (
          <p
            style={{
              marginTop: 16,
              color: '#22c55e',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            ✅ {mensagem}
          </p>
        )}
      </div>
    </div>
  )
}

function CardMenu({ navigate }: any) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
      }}
    >
      <div
        style={{
          background: '#000',
          padding: 10,
          borderRadius: 10,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button style={btnMenu} onClick={() => navigate('/cozinha')}>
          👨‍🍳
        </button>

        <button style={btnMenu} onClick={() => navigate('/pedidos')}>
          📦
        </button>

        <button style={btnMenu} onClick={() => navigate('/produtos')}>
          🛒
        </button>

        <button style={btnMenu} onClick={() => navigate('/dashboard')}>
          📋
        </button>

        <button style={btnMenu} onClick={() => navigate('/auditoria')}>
          📊
        </button>

        <button
          style={{
            ...btnMenu,
            background: '#2563eb',
          }}
        >
          📢
        </button>
      </div>
    </div>
  )
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: 'none',
  marginTop: 8,
}

const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: 220,
  padding: 12,
  borderRadius: 8,
  border: 'none',
  marginTop: 8,
  resize: 'vertical',
}

const label: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: 14,
}

const btnMenu: React.CSSProperties = {
  background: '#333',
  color: '#fff',
  border: 'none',
  padding: '12px 16px',
  minWidth: 48,
  minHeight: 48,
  borderRadius: 6,
  fontSize: 18,
  cursor: 'pointer',
}
