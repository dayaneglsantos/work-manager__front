import handleEscKey from '@/utils/handleEscKey'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { format } from 'path'
import { useEffect, useRef, useState } from 'react'
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
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation()
      handleEscKey(e, () => setShowCalendar(false))
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) // Verifica se o clique foi fora do selectRef
      ) {
        setShowCalendar(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className="relative"
      style={{ width: width || '100%' }}
      ref={selectRef}
    >
      <input
        type="text"
        placeholder={placeholder}
        // onFocus={() => setShowCalendar(true)}
        onChange={() => {}}
        onClick={() => setShowCalendar(!showCalendar)}
        className="border border-gray-400 p-2 rounded w-full text-center cursor-pointer"
        value={
          value
            ? formatDate(new Date(value), 'dd/MM/yyyy', { locale: ptBR })
            : ''
        }
      />
      {showCalendar && (
        <div className="absolute z-20 border text-gray-400 bg-gray-100 dark:bg-gray-900 border-primary p-2 mt-0.5 rounded-2xl">
          <DayPicker
            className="text-[14px]"
            locale={ptBR}
            mode="single"
            selected={value ? new Date(value) : undefined}
            onDayClick={(day) => {
              onChange?.(day.toISOString())
              setShowCalendar(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
