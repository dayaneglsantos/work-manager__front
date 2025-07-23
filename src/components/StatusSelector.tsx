'use client'

import { TaskType } from '@/types/taskType'
import { useEffect, useRef, useState } from 'react'
import Badge from './Badge'
import { updateTask } from '@/services/task/taskServices'

interface StatusSelectorProps {
  task: TaskType
  statusList: {
    label: string
    value: string
    color: string
  }[]
}

export default function StatusSelector({
  task,

  statusList
}: StatusSelectorProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const statusFormat = (
    status: string
  ): {
    label: string
    color: 'info' | 'success' | 'warning' | 'default' | 'error'
  } => {
    switch (status) {
      case 'paused':
        return {
          label: 'Pausada',
          color: 'warning'
        }
      case 'inProgress':
        return {
          label: 'Em progresso',
          color: 'info'
        }
      case 'done':
        return {
          label: 'Concluída',
          color: 'success'
        }
      case 'todo':
        return {
          label: 'A Fazer',
          color: 'default'
        }
      default:
        return {
          label: 'Desconhecido',
          color: 'default'
        }
    }
  }

  const updateTaskStatus = (taskId: number, newStatus: TaskType['status']) => {
    updateTask(taskId, { status: newStatus })
    setIsOpen(false)
    task.status = newStatus
  }

  const handleClickOutsideStatus = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) // Verifica se o clique foi fora do dropdownRef
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleClickOutsideStatus)

    return () => {
      document.removeEventListener('mouseup', handleClickOutsideStatus)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <Badge
        name={statusFormat(task.status)?.label}
        color={statusFormat(task.status)?.color}
        fullWidth
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="cursor-pointer"
      />
      {isOpen && (
        <div className="absolute left-0 z-10 w-full flex flex-col mt-1 gap-1 p-1 bg-gray-300 dark:bg-gray-700 rounded-md ">
          {statusList
            .filter((item) => item.value !== task.status)
            .map((i) => (
              <Badge
                key={i.value}
                name={i.label}
                color={i.color as any}
                fullWidth
                className="cursor-pointer block"
                onClick={() => {
                  console.log('cliquei')
                  updateTaskStatus(task.id, i.value as TaskType['status'])
                }}
              />
            ))}
        </div>
      )}
    </div>
  )
}
