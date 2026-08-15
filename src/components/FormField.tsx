import { type InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function FormField({
  label,
  error,
  id,
  className,
  ...inputProps
}: FormFieldProps) {
  const fieldId = id ?? inputProps.name

  return (
    <label htmlFor={fieldId} className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block text-sm font-medium text-primary-dark dark:text-dark-text">
        {label}
      </span>
      <input
        {...inputProps}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
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
