'use client'

import { useTheme } from 'next-themes'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Só ativa a renderização do componente após a montagem no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className="block h-8 w-14 rounded-full border border-gray-200 bg-purple-50"
      />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group relative flex h-8 w-14 cursor-pointer items-center rounded-full border border-purple-200 bg-purple-50 transition-all duration-300 hover:border-primary-light hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-dark-border dark:bg-dark-surface-hover dark:hover:border-primary dark:hover:bg-[#2a213b] dark:focus-visible:ring-offset-dark-background"
    >
      <span
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm shadow-primary-dark/10 transition-transform duration-300 ease-out dark:bg-primary ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      />

      <FontAwesomeIcon
        icon={faSun}
        className={`absolute left-2 z-10 h-3.5 w-3.5 transition-colors duration-300 ${
          isDark ? 'text-dark-muted/60' : 'text-amber-500'
        }`}
      />
      <FontAwesomeIcon
        icon={faMoon}
        className={`absolute right-2 z-10 h-3.5 w-3.5 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-primary/50'
        }`}
      />

      <span className="sr-only">
        {isDark ? 'Tema escuro ativo' : 'Tema claro ativo'}
      </span>
    </button>
  )
}
