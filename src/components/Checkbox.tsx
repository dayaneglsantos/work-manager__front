'use client'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export default function Checkbox({
  label,
  checked,
  onChange,
  className
}: CheckboxProps) {
  return (
    <label
      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-primary-dark dark:text-dark-text ${className ?? ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        className="h-4 w-4 cursor-pointer accent-primary"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}
