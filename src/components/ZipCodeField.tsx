import { IMaskInput } from 'react-imask'

interface ZipCodeFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  name: string
  error?: string
}

export default function ZipCodeField({
  value,
  onChange,
  onBlur,
  name,
  error
}: ZipCodeFieldProps) {
  const fieldId = `field-${name}`

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 block text-sm font-medium text-primary-dark dark:text-dark-text">
        CEP
      </span>
      <IMaskInput
        id={fieldId}
        name={name}
        mask="00000-000"
        value={value}
        unmask
        inputMode="numeric"
        placeholder="00000-000"
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
