'use client'

import { useEffect, useId, useRef, useState } from 'react'

export interface AsyncSearchPage<Option> {
  options: Option[]
  hasNextPage: boolean
}

interface AsyncSearchSelectProps<Option> {
  label: string
  selected: Option | null
  onSelect: (option: Option) => void
  loadOptions: (query: string, page: number) => Promise<AsyncSearchPage<Option>>
  getOptionKey: (option: Option) => string | number
  getOptionLabel: (option: Option) => string
  minChars?: number
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export default function AsyncSearchSelect<Option>({
  label,
  selected,
  onSelect,
  loadOptions,
  getOptionKey,
  getOptionLabel,
  minChars = 3,
  required = false,
  disabled = false,
  placeholder = 'Digite para buscar'
}: AsyncSearchSelectProps<Option>) {
  const inputId = useId()
  const listId = useId()
  const requestId = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [options, setOptions] = useState<Option[]>([])
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [retry, setRetry] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const normalizedQuery = query.trim()

  useEffect(() => {
    if (disabled || normalizedQuery.length < minChars) {
      requestId.current += 1
      setOptions([])
      setHasNextPage(false)
      setLoading(false)
      setError(false)
      return
    }

    const currentRequest = ++requestId.current
    setLoading(true)
    setError(false)
    const timer = setTimeout(() => {
      loadOptions(normalizedQuery, page)
        .then((result) => {
          if (requestId.current !== currentRequest) return
          setOptions((current) => {
            const next =
              page === 1 ? result.options : [...current, ...result.options]
            return next.filter(
              (option, index, all) =>
                all.findIndex(
                  (candidate) =>
                    getOptionKey(candidate) === getOptionKey(option)
                ) === index
            )
          })
          setHasNextPage(result.hasNextPage)
          if (page === 1) setActiveIndex(0)
          setOpen(true)
        })
        .catch(() => {
          if (requestId.current === currentRequest) setError(true)
        })
        .finally(() => {
          if (requestId.current === currentRequest) setLoading(false)
        })
    }, 300)

    return () => {
      clearTimeout(timer)
      if (requestId.current === currentRequest) requestId.current += 1
    }
  }, [
    disabled,
    getOptionKey,
    loadOptions,
    minChars,
    normalizedQuery,
    page,
    retry
  ])

  const resetSearch = (value: string) => {
    setQuery(value)
    setPage(1)
    setOptions([])
    setOpen(true)
  }

  const selectOption = (option: Option) => {
    onSelect(option)
    setQuery('')
    setOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className="space-y-2"
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <label htmlFor={inputId} className="block font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && normalizedQuery.length >= minChars}
        aria-required={required}
        aria-activedescendant={
          open && options[activeIndex]
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => resetSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((current) =>
              Math.min(current + 1, Math.max(options.length - 1, 0))
            )
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((current) => Math.max(current - 1, 0))
          }
          if (event.key === 'Enter' && open && options[activeIndex]) {
            event.preventDefault()
            selectOption(options[activeIndex])
          }
        }}
        className="w-full rounded-xl border border-gray-300 bg-transparent p-3 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 dark:border-dark-border"
      />
      {normalizedQuery.length > 0 && normalizedQuery.length < minChars && (
        <p className="text-sm text-gray-500 dark:text-dark-muted">
          Digite pelo menos {minChars} caracteres para buscar.
        </p>
      )}
      {selected && (
        <p className="text-sm text-gray-600 dark:text-dark-muted">
          Selecionado: <strong>{getOptionLabel(selected)}</strong>
        </p>
      )}
      {open && normalizedQuery.length >= minChars && (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-dark-border">
          {error ? (
            <div className="space-y-2 p-3" role="alert">
              <p>Não foi possível carregar as opções.</p>
              <button
                type="button"
                className="font-semibold text-primary underline"
                onClick={() => setRetry((current) => current + 1)}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <ul
              id={listId}
              role="listbox"
              aria-label={`Resultados de ${label.toLowerCase()}`}
              onScroll={(event) => {
                const element = event.currentTarget
                const reachedEnd =
                  element.scrollTop + element.clientHeight >=
                  element.scrollHeight - 8
                if (reachedEnd && hasNextPage && !loading)
                  setPage((current) => current + 1)
              }}
              className="max-h-56 overflow-y-auto"
            >
              {options.map((option, index) => {
                const key = getOptionKey(option)
                const optionLabel = getOptionLabel(option)
                return (
                  <li key={key} role="none">
                    <button
                      id={`${listId}-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={
                        selected ? getOptionKey(selected) === key : false
                      }
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                      className={`w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-primary-light/10 focus-visible:outline-2 focus-visible:outline-primary dark:border-dark-border dark:hover:bg-dark-surface-hover ${activeIndex === index ? 'bg-primary-light/10 dark:bg-dark-surface-hover' : ''}`}
                    >
                      {optionLabel}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {loading && (
            <p role="status" className="p-3 text-sm">
              Carregando usuários...
            </p>
          )}
          {!loading && !error && options.length === 0 && (
            <p className="p-3 text-sm">Nenhum usuário ativo encontrado.</p>
          )}
        </div>
      )}
    </div>
  )
}
