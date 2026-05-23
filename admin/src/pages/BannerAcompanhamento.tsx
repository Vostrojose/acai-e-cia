import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { theme } from '../assets/styles/adminTheme'

export default function BannerAcompanhamento() {
  const navigate = useNavigate()

  const [titulo, setTitulo] = useState('')
  const [itensTexto, setItensTexto] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    carregarBanner()
  }, [])

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
  padding: '10px 12px',
  borderRadius: 6,
  fontSize: 16,
  cursor: 'pointer',
}
