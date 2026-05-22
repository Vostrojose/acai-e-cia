import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TEMPO_INATIVIDADE = 3 * 60 * 1000 // 3 minutos

export default function AdminIdleManager() {

  const navigate = useNavigate()
  const location = useLocation()

  const timeoutRef = useRef<any>(null)

  function resetTimer() {

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {

      /* ============================= */
      /* NÃO REDIRECIONA SE JÁ ESTIVER */
      /* NA COZINHA                   */
      /* ============================= */

      if (location.pathname !== '/cozinha') {

        console.log(
          '⏰ Inatividade detectada → voltando cozinha',
        )

        navigate('/cozinha')
      }

    }, TEMPO_INATIVIDADE)
  }

  useEffect(() => {

    const eventos = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ]

    eventos.forEach((evento) => {
      window.addEventListener(evento, resetTimer)
    })

    /* inicia contador */
    resetTimer()

    return () => {

      eventos.forEach((evento) => {
        window.removeEventListener(evento, resetTimer)
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

  }, [location.pathname])

  return null
}