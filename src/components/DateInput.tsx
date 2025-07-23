import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { format } from 'path'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'

interface DateInputProps {
  placeholder?: string
  value?: string
  onChange?: (date: string) => void
  width?: string | number
}

export default function DateInput({
  placeholder = 'Selecione uma data',
  onChange,
  value,
  width
}: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false)

  return (
    <div className="relative" style={{ width: width || '100%' }}>
      <input
        type="text"
        placeholder={placeholder}
        onFocus={() => setShowCalendar(true)}
        onChange={() => {}}
        className="border border-gray-400 p-2 rounded w-full text-center"
        value={
          value
            ? formatDate(new Date(value), 'dd/MM/yyyy', { locale: ptBR })
            : ''
        }
      />
      {showCalendar && (
        <div
          className="absolute z-20 border bg-gray-900 border-primary p-2 mt-0.5 rounded-2xl"
          onBlur={() => setShowCalendar(false)}
        >
          <DayPicker
            className="text-[14px]"
            locale={ptBR}
            mode="single"
            selected={value ? new Date(value) : undefined}
            onDayClick={(day) => {
              onChange?.(day.toISOString())
              setShowCalendar(false)
            }}
            styles={{
              day_button: {
                width: '40px',
                height: '40px'
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
