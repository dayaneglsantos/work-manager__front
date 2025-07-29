'use client'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { ptBR } from 'date-fns/locale'
import { formatDate } from 'date-fns'

export default function Calendar() {
  const today = new Date()
  const [selectedDay, setSelectedDay] = useState<Date>(today)
  console.log(formatDate(selectedDay, 'dd/MM/yyyy', { locale: ptBR }))

  return (
    <div>
      <DayPicker
        animate
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
        className="text-sm mb-2"
        locale={ptBR}
        required
        styles={{
          day_button: {
            width: '50px',
            height: '50px'
          }
        }}
      />
      <div className="flex flex-col gap-2 pt-4 border-t border-t-gray-300/50 text-sm max-w-[400px]">
        <span>- aniversário de joaozinho</span>
        <span>- Treinamento de segurança da informaçãoooooooooo</span>
        <span>- Reunião de entrega trimestral</span>
        <span>- Reunião da empresa realizada no Vegas</span>
      </div>
    </div>
  )
}
