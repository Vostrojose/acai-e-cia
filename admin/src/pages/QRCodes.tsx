import QRCode from 'react-qr-code'

export default function QRCodes() {
  const base = 'https://acaiecompanhia.com.br/m'
  const locais = ['coworking', 'panfleto', 'evento', 'empresaA']

  return (
    <div style={{ padding: 40 }}>
      <h1>🔳 QR Codes de Pedido</h1>
      {locais.map((local) => {
        const url = `${base}/${local}`
        return (
          <div key={local} style={{ marginBottom: 40 }}>
            <h3>{local}</h3>
            <QRCode value={url} size={200} />
            <p>{url}</p>
          </div>
        )
      })}
    </div>
  )
}
