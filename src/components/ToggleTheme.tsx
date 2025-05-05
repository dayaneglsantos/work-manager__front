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

  if (!mounted) return null // Evita o erro visual até o tema estar carregado

  return (
    <div>
      <input
        type="checkbox"
        className="opacity-0 absolute peer"
        id="checkbox"
        onChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      />
      <label
        htmlFor="checkbox"
        className="bg-primary-dark w-12 h-6 rounded-2xl relative p-2 cursor-pointer flex justify-between items-center"
      >
        {resolvedTheme === 'dark' ? (
          <FontAwesomeIcon
            icon={faMoon}
            className="text-yellow-400 mx-5 w-5 h-5"
          />
        ) : (
          <FontAwesomeIcon icon={faSun} className="text-yellow-400" />
        )}
        <span
          className={`bg-white w-5 h-5 absolute left-0.5 top-0.5 rounded-full transition-transform duration-200 ease-linear ${
            resolvedTheme === 'dark' ? 'translate-x-0' : 'translate-x-6'
          }`}
        ></span>
      </label>
    </div>
  )
}
