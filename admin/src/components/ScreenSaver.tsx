import { useEffect, useState } from 'react'

export default function ScreenSaver() {
  const [hora, setHora] = useState(new Date())

  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const relogio = setInterval(() => {
      setHora(new Date())
    }, 1000)

    return () => clearInterval(relogio)
  }, [])

  useEffect(() => {
    const movimento = setInterval(() => {
      setOffset({
        x: Math.random() * 700 - 350,
        y: Math.random() * 400 - 200,
      })
    }, 15000)

    return () => clearInterval(movimento)
  }, [])

  const horaFormatada = hora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const dataFormatada = hora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,

        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 70%)',

        zIndex: 999999,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'hidden',

        pointerEvents: 'none',

        transition: 'all 1s ease',
      }}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,

          transition: 'transform 15s linear',

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
            width: 220,

            opacity: 0.92,

            marginBottom: 40,

            animation: 'pulseLogo 6s ease-in-out infinite',

            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.15))',
          }}
        />

        <div
          style={{
            fontSize: 120,

            fontWeight: 'bold',

            letterSpacing: 6,

            textShadow: '0 0 20px rgba(255,255,255,0.15)',
          }}
        >
          {horaFormatada}
        </div>

        <div
          style={{
            marginTop: 18,

            fontSize: 28,

            opacity: 0.72,

            textTransform: 'capitalize',
          }}
        >
          {dataFormatada}
        </div>

        <div
          style={{
            marginTop: 30,

            fontSize: 14,

            opacity: 0.4,

            letterSpacing: 3,
          }}
        >
          SISTEMA OPERACIONAL • AÇAÍ & COMPANY
        </div>
      </div>

      <style>
        {`
          @keyframes pulseLogo {

            0% {
              transform: scale(1);
              opacity: 0.88;
            }

            50% {
              transform: scale(1.04);
              opacity: 1;
            }

            100% {
              transform: scale(1);
              opacity: 0.88;
            }
          }
        `}
      </style>
    </div>
  )
}
