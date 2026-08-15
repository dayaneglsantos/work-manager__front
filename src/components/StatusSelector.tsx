'use client'

import { TaskType } from '@/types/taskType'
import { useEffect, useRef, useState } from 'react'
import Badge, { type BadgeVariant } from './Badge'
import { updateTask } from '@/services/task/taskServices'
import handleEscKey from '@/utils/handleEscKey'

interface StatusSelectorProps {
  task: TaskType
  statusList: {
    label: string
    value: string
    variant: BadgeVariant
  }[]
  updateList?: () => void
}

export default function StatusSelector({
  task,
  statusList,
  updateList
}: StatusSelectorProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down')

  const statusFormat = (
    status: string
  ): {
    label: string
    variant: BadgeVariant
  } => {
    switch (status) {
      case 'paused':
        return {
          label: 'Pausada',
          variant: 'warning'
        }
      case 'inProgress':
        return {
          label: 'Em progresso',
          variant: 'info'
        }
      case 'done':
        return {
          label: 'Concluída',
          variant: 'success'
        }
      case 'todo':
        return {
          label: 'A Fazer',
          variant: 'default'
        }
      default:
        return {
          label: 'Desconhecido',
          variant: 'default'
        }
    }
  }

  const updateTaskStatus = async (
    taskId: number,
    newStatus: TaskType['status']
  ) => {
    await updateTask(taskId, { status: newStatus })
    setIsOpen(false)
    task.status = newStatus
    if (updateList) {
      updateList()
    }
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
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation()
      handleEscKey(e, () => setIsOpen(false))
    }

    document.addEventListener('mouseup', handleClickOutsideStatus)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mouseup', handleClickOutsideStatus)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect() // Pega as dimensões e posição do item clicado
      const spaceBelow = window.innerHeight - rect.bottom // Espaço disponível abaixo do item
      const spaceAbove = rect.top // Espaço disponível acima do item

      // Se o espaço abaixo for menor que 150px e houver mais espaço acima, abre para cima
      if (spaceBelow < 150 && spaceAbove > spaceBelow) {
        setOpenDirection('up')
      } else {
        setOpenDirection('down')
      }
    }
  }, [isOpen])

  const handleClick = (e: any) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Badge
        name={statusFormat(task.status)?.label}
        variant={statusFormat(task.status)?.variant}
        fullWidth
        onClick={(e) => handleClick(e)}
        className="cursor-pointer"
      />
      {isOpen && (
        <div
          className={`absolute left-0 z-10 w-full flex flex-col mt-1 gap-2 p-1 py-2.5 bg-white dark:bg-dark rounded-md shadow-lg dark:shadow-black/30
            ${openDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}
        >
          {statusList
            .filter((item) => item.value !== task.status)
            .map((i) => (
              <Badge
                key={i.value}
                name={i.label}
                variant={i.variant}
                fullWidth
                className="cursor-pointer block h-5"
                onClick={(e) => {
                  e.stopPropagation()
                  updateTaskStatus(task.id, i.value as TaskType['status'])
                }}
              />
            ))}
        </div>
      )}
    </div>
  )
}
