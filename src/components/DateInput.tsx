import handleEscKey from '@/utils/handleEscKey'
import { format, formatDate, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { IMaskInput } from 'react-imask'

interface DateInputProps {
  placeholder?: string
  value?: string
  setDate: (date: any) => void
  width?: string | number
}

export default function DateInput({
  placeholder = 'Selecione uma data',
  setDate,
  value,
  width
}: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState('')
  const [calendarPosition, setCalendarPosition] = useState<'up' | 'down'>(
    'down'
  ) // Função para calcular a posição do calendário

  // ------------------------------------------------------------------------------------------------
  const calculatePosition = () => {
    if (selectRef.current) {
      const inputRect = selectRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - inputRect.bottom

      if (spaceBelow < 250) {
        // Não há espaço suficiente, posiciona para cima
        setCalendarPosition('up')
      } else {
        // Padrão: há espaço, posiciona para baixo
        setCalendarPosition('down')
      }
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Atualiza o valor exibido quando a prop value muda
  useEffect(() => {
    if (value) {
      const date = parse(value, 'yyyy-MM-dd', new Date())
      if (isValid(date)) {
        setDisplayValue(formatDate(date, 'dd/MM/yyyy', { locale: ptBR }))
      } else {
        setDisplayValue('')
      }
    } else {
      setDisplayValue('')
    }
  }, [value])

  // ------------------------------------------------------------------------------------------------
  // Fecha o calendário ao clicar fora ou pressionar Esc
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

  // ------------------------------------------------------------------------------------------------
  // Manipula a mudança no input de texto
  const handleInputChange = (value: string) => {
    setDisplayValue(value)
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date())
    if (isValid(parsedDate)) {
      setDate(format(parsedDate, 'yyyy-MM-dd'))
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Manipula a seleção de um dia no calendário
  const handleDaySelect = (day: Date) => {
    if (isValid(day)) {
      setDate(format(day, 'yyyy-MM-dd'))
      setDisplayValue(formatDate(day, 'dd/MM/yyyy', { locale: ptBR }))
    }
    setShowCalendar(false)
  }

  // ------------------------------------------------------------------------------------------------

  const selectedDate = value
    ? parse(value, 'yyyy-MM-dd', new Date())
    : undefined

  // Determina as classes de posicionamento dinamicamente
  const calendarClasses =
    calendarPosition === 'up'
      ? 'bottom-full mb-1 left-0' // Posiciona acima do input
      : 'top-full mt-0.5 left-0' // Posiciona abaixo do input (padrão)

  return (
    <div
      className="relative"
      style={{ width: width || '100%' }}
      ref={selectRef}
    >
      <IMaskInput
        mask="00/00/0000"
        type="text"
        placeholder={placeholder}
        onFocus={() => {
          setShowCalendar(true)
          calculatePosition()
        }}
        onAccept={(value: string) => handleInputChange(value)}
        className="border border-gray-400 p-2 rounded w-full cursor-pointer"
        value={displayValue}
      />
      {showCalendar && (
        <div
          className={`absolute z-50 overflow-visible border text-gray-400 bg-gray-100 dark:bg-gray-900 border-primary p-2 rounded-2xl shadow-lg  ${calendarClasses}`}
        >
          <DayPicker
            className="text-[14px] "
            locale={ptBR}
            mode="single"
            selected={selectedDate}
            onDayClick={(day) => handleDaySelect(day)}
          />
        </div>
      )}
    </div>
  )
}
