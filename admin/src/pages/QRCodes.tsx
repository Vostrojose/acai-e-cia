import { useState } from 'react'
import QRCode from 'react-qr-code'
import { theme } from '../assets/styles/adminTheme'

export default function QRCodes() {
  const base = 'https://acaiecompanhia.com.br/m'
  const locais = ['coworking', 'panfleto', 'evento', 'empresaA']

  const [mostrarHelp, setMostrarHelp] = useState(false)

  function copiar(url: string) {
    navigator.clipboard.writeText(url)
    alert('Link copiado!')
  }

  function baixarQR(local: string) {
    const svg = document.getElementById(`qr-${local}`)
    if (!svg) return

    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `qr-${local}.svg`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div style={theme.page}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={theme.title}>🔳 QR Codes de Pedido</h1>

        <button
          onClick={() => setMostrarHelp(true)}
          style={{ ...theme.button, ...theme.buttonPrimary, width: 120 }}
        >
          ❓ Ajuda
        </button>
      </div>

      {/* GRID */}
      <div style={grid}>
        {locais.map((local) => {
          const url = `${base}/${local}`

          return (
            <div key={local} style={theme.card}>

              <h3 style={{ marginBottom: 10 }}>{local}</h3>

              <div style={qrBox}>
                <QRCode
                  id={`qr-${local}`}
                  value={url}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <p style={link}>{url}</p>

              <div style={acoes}>
                <button
                  onClick={() => copiar(url)}
                  style={{ ...theme.button, ...theme.buttonPrimary }}
                >
                  📋 Copiar
                </button>

                <button
                  onClick={() => baixarQR(local)}
                  style={{ ...theme.button, ...theme.buttonSuccess }}
                >
                  ⬇️ Baixar
                </button>
              </div>

            </div>
          )
        })}
      </div>

      {/* POPUP HELP */}
      {mostrarHelp && (
        <div style={overlay}>
          <div style={modal}>

            <h2 style={theme.title}>📖 Como usar os QR Codes</h2>

            <div style={{ marginTop: 10, lineHeight: 1.6 }}>
              <p>✔ Cada QR Code representa uma origem de cliente.</p>

              <p>Exemplos:</p>
              <ul>
                <li>📄 Panfletos → "panfleto"</li>
                <li>🏢 Empresas → "empresaA"</li>
                <li>🎉 Eventos → "evento"</li>
                <li>💻 Coworking → "coworking"</li>
              </ul>

              <p>
                Quando o cliente escaneia, o sistema registra de onde ele veio.
              </p>

              <p>
                Isso permite analisar qual canal traz mais vendas.
              </p>

              <p><strong>💡 Dica:</strong> imprima e coloque em locais estratégicos.</p>
            </div>

            <button
              onClick={() => setMostrarHelp(false)}
              style={{
                ...theme.button,
                ...theme.buttonPrimary,
                marginTop: 20
              }}
            >
              Fechar
            </button>

          </div>
        </div>
      )}

    </div>
  )
}

/* ========================= */
/* ESTILOS                   */
/* ========================= */

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: 20
}

const qrBox = {
  background: '#fff',
  padding: 10,
  borderRadius: 10,
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 10
}

const link = {
  fontSize: 12,
  color: '#ccc',
  wordBreak: 'break-all' as const,
  marginBottom: 10
}

const acoes = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8
}

/* MODAL */

const overlay = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999
}

const modal = {
  background: '#111',
  padding: 25,
  borderRadius: 12,
  maxWidth: 500,
  width: '90%',
  color: '#fff'
}