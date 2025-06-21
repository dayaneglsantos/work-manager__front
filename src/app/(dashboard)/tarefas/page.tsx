'use client'

import Card from '@/components/Card'
import FiltersList from '@/components/FiltersList'
import { useState } from 'react'

interface FiltersType {
  name: string
  value: string | string[]
}

export default function TasksPage() {
  const [filters, setFilters] = useState<FiltersType[]>([])

  const list = [
    { type: 'search', name: 'task name', placeholder: 'Pesquisar tarefa' },
    {
      type: 'select',
      multiple: true,
      name: 'status',
      placeholder: 'Status',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Em progresso', value: 'in_progress' },
        { label: 'Concluída', value: 'completed' }
      ]
    }
  ]

  return (
    <Card className="w-full">
      <FiltersList list={list} setFilters={setFilters} />
    </Card>
  )
}
