import SelectField, { type SelectFieldProps } from './SelectField'

interface FormSelectFieldProps extends SelectFieldProps {
  label: string
  error?: string
}

export default function FormSelectField({
  label,
  error,
  className,
  ...selectProps
}: FormSelectFieldProps) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-sm font-medium text-primary-dark dark:text-dark-text">
        {label}
      </span>
      <SelectField {...selectProps} />
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </div>
  )
}
