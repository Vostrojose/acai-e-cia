import { useEffect, useState } from 'react'


interface Props {
  value: number
  duration?: number
}

export default function AnimatedNumber({ value, duration = 500 }: Props) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    let start = 0
    const increment = value / (duration / 16)

    const animate = () => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
      } else {
        setDisplayValue(Math.floor(start))
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [value, duration])

  return <>{displayValue}</>
}
