import { IMaskInput } from 'react-imask'

interface CpfFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  error?: string
  required?: boolean
}

export default function CpfField({
  value,
  onChange,
  onBlur,
  name,
  error,
  required
}: CpfFieldProps) {
  const fieldId = name ?? 'cpf'

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-primary-dark dark:text-dark-text">
        CPF
        {required && (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <IMaskInput
        id={fieldId}
        name={name}
        mask="000.000.000-00"
        value={value}
        unmask
        inputMode="numeric"
        placeholder="000.000.000-00"
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        onAccept={(nextValue) => onChange(nextValue)}
        onBlur={onBlur}
        className={`min-h-10 w-full rounded-xl border bg-white px-3 text-sm text-primary-dark outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted/70 ${error ? 'border-error' : 'border-gray-200 dark:border-dark-border'}`}
      />
      {error && (
        <span id={`${fieldId}-error`} className="mt-1 block text-xs text-error">
          {error}
        </span>
      )}
    </label>
  )
}
