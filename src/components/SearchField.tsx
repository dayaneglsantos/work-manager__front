'use client'

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface SearchFieldProps {
  value?: string
  defaultValue?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export default function SearchField({
  value,
  defaultValue,
  onChange,
  placeholder = 'Buscar',
  label = 'Buscar',
  className
}: SearchFieldProps) {
  return (
    <label
      className={`flex min-h-10 w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-gray-600 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:focus-within:border-primary-light ${className ?? ''}`}
    >
      <span className="sr-only">{label}</span>
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      />
      <input
        type="search"
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-primary-dark outline-none placeholder:text-gray-400 dark:text-dark-text dark:placeholder:text-dark-muted/70"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
