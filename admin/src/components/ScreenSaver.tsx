import { useEffect, useState } from 'react'

export default function ScreenSaver() {

  const [hora, setHora] = useState(new Date())
  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {

    const timer = setInterval(() => {
      setHora(new Date())

      setOffset({
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
      })

    }, 60000)

    return () => clearInterval(timer)

  }, [])

  const horaFormatada = hora.toLocaleTimeString(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )

  const dataFormatada = hora.toLocaleDateString(
    'pt-BR',
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,

        background: '#000',

        zIndex: 999999,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        pointerEvents: 'none',
      }}
    >

      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,

          transition: 'transform 60s linear',

          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',

          color: '#fff',
        }}
      >

        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: 180,
            opacity: 0.9,
            marginBottom: 30,
          }}
        />

        <div
          style={{
            fontSize: 110,
            fontWeight: 'bold',
            letterSpacing: 4,
          }}
        >
          {horaFormatada}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 28,
            opacity: 0.7,
          }}
        >
          {dataFormatada}
        </div>

      </div>
    </div>
  )
}