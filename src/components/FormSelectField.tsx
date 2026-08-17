import SelectField, { type SelectFieldProps } from './SelectField'

interface FormSelectFieldProps extends SelectFieldProps {
  label: string
  error?: string
  required?: boolean
}

export default function FormSelectField({
  label,
  error,
  required,
  className,
  ...selectProps
}: FormSelectFieldProps) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-sm font-medium text-primary-dark dark:text-dark-text">
        {label}
        {required && (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <SelectField {...selectProps} required={required} />
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </div>
  )
}
