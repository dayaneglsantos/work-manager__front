'use client'

import Card from '@/components/Card'
import TasksPage from './TaskPage'
import { getTasks } from '@/services/task/taskServices'
import Tabs from '@/components/Tabs'
import { useState, useEffect } from 'react'

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<string>('all')
  const [data, setData] = useState<any>(null)
  const [meta, setMeta] = useState<any>(null)

  // useEffect(() => {
  //   console.log('result')
  //   async function fetchTasks() {
  //     const result = await getTasks()
  //     setData(result.data)
  //     setMeta(result.meta)
  //   }
  //   fetchTasks()
  // }, [])

  console.log(data)

  return (
    <Card className="w-full max-w-[calc(100vw-48px)] md:max-w-[calc(100vw-112px)]">
      <Tabs
        list={[
          { value: 'all', label: 'Todas' },
          { value: 'completed', label: 'Concluídas' },
          { value: 'in-progress', label: 'Em Progresso' },
          { value: 'paused', label: 'Pausadas' }
        ]}
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
      <TasksPage />
    </Card>
  )
}
