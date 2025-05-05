'use client'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { ptBR } from 'date-fns/locale'

export default function Calendar() {
  const today = new Date()
  const [selectedDay, setSelectedDay] = useState<Date>(today)

  return (
    <div>
      <DayPicker
        animate
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
        className="text-sm"
        locale={ptBR}
        required
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
