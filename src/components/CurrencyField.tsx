import { type FocusEventHandler, useEffect, useRef, useState } from 'react'

const formatDisplayValue = (value: number) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    : ''

const formatEditingValue = (value: number) =>
  Number.isFinite(value) ? value.toFixed(2).replace('.', ',') : ''

const normalizeInput = (input: string) => {
  const sanitized = input.replace(/[^\d,.]/g, '')

  if (!sanitized.includes(',')) {
    return sanitized
  }

  const [integerPart = '', ...decimalParts] = sanitized.split(',')
  const decimalPart = decimalParts.join('').replace(/\D/g, '').slice(0, 2)

  return `${integerPart},${decimalPart}`
}

const parseValue = (value: string) => {
  if (!value) return 0

  let normalizedValue: string

  if (value.includes(',')) {
    normalizedValue = value.replaceAll('.', '').replace(',', '.')
  } else {
    const parts = value.split('.')
    const hasThousandsSeparator =
      parts.length > 2 || (parts.length === 2 && parts[1].length === 3)

    normalizedValue = hasThousandsSeparator ? parts.join('') : value
  }

  const numericValue = Number(normalizedValue)
  return Number.isFinite(numericValue) ? numericValue : 0
}

interface CurrencyFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  onBlur?: FocusEventHandler<HTMLInputElement>
  name?: string
  id?: string
  error?: string
  required?: boolean
  className?: string
}

export default function CurrencyField({
  label,
  value,
  onChange,
  onBlur,
  name,
  id,
  error,
  required,
  className
}: CurrencyFieldProps) {
  const fieldId = id ?? name
  const [displayValue, setDisplayValue] = useState(() =>
    formatDisplayValue(value)
  )
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) {
      setDisplayValue(formatDisplayValue(value))
    }
  }, [value])

  return (
    <label htmlFor={fieldId} className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block text-sm font-medium text-primary-dark dark:text-dark-text">
        {label}
        {required && (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-primary-dark dark:text-dark-text">
          R$
        </span>
        <input
          id={fieldId}
          name={name}
          type="text"
          value={displayValue}
          inputMode="decimal"
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          onChange={(event) => {
            const normalizedValue = normalizeInput(event.target.value)
            setDisplayValue(normalizedValue)
            onChange(parseValue(normalizedValue))
          }}
          onFocus={() => {
            isFocused.current = true
            setDisplayValue(value === 0 ? '' : formatEditingValue(value))
          }}
          onBlur={(event) => {
            isFocused.current = false
            setDisplayValue(formatDisplayValue(value))
            onBlur?.(event)
          }}
          className={`min-h-10 w-full rounded-xl border bg-white pr-3 pl-10 text-sm text-primary-dark outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted/70 ${error ? 'border-error' : 'border-gray-200 dark:border-dark-border'}`}
        />
      </div>
      {error && (
        <span id={`${fieldId}-error`} className="mt-1 block text-xs text-error">
          {error}
        </span>
      )}
    </label>
  )
}
