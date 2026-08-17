'use client'

import { useEffect } from 'react'

export default function NumberInputGuard() {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const target = event.target

      // Quando um campo numérico focado recebe rolagem, ele perde o foco antes que o navegador altere o valor; a página pode continuar rolando normalmente
      if (
        target instanceof HTMLInputElement &&
        target.type === 'number' &&
        target === document.activeElement
      ) {
        target.blur()
      }
    }

    document.addEventListener('wheel', handleWheel, { capture: true })

    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true })
    }
  }, [])

  return null
}
