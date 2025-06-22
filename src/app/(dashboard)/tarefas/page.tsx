'use client'

import Card from '@/components/Card'
import FiltersList from '@/components/FiltersList'
import { useEffect, useRef, useState } from 'react'
import mock from '@/mocks/tasks.json'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Badge from '@/components/Badge'
import Avatar from '@/components/Avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesDown,
  faAnglesUp,
  faCaretLeft,
  faCaretRight,
  faEquals
} from '@fortawesome/free-solid-svg-icons'

interface FiltersType {
  name: string
  value: string | string[]
}

export default function TasksPage() {
  const [filters, setFilters] = useState<FiltersType[]>([])
  const [openStatusOptions, setOpenStatusOptions] = useState(false)
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  const statusRef = useRef<HTMLTableCellElement>(null)

  // ============= PAGINAÇÃO ==============
  const [page, setPage] = useState(1)
  const pagesPerGroup = 5
  const totalTasks = 147
  const totalPages = Math.ceil(totalTasks / 10) // Math.ceil arredondar para cima.
  const [groupStart, setGroupStart] = useState(1) // Qual página o grupo atual começa

  // Calcula as páginas do grupo atual
  const currentGroup = Array.from(
    { length: Math.min(pagesPerGroup, totalPages - groupStart + 1) },
    (_, i) => groupStart + i
  )

  const handlePrevGroup = () => {
    if (groupStart > 1) {
      setGroupStart(groupStart - pagesPerGroup)
      setPage(groupStart - pagesPerGroup > 0 ? groupStart - pagesPerGroup : 1)
    }
  }

  const handleNextGroup = () => {
    if (groupStart + pagesPerGroup <= totalPages) {
      setGroupStart(groupStart + pagesPerGroup)
      setPage(groupStart + pagesPerGroup)
    }
  }

  const statusList = [
    { label: 'A Fazer', value: 'todo', color: 'default' },
    { label: 'Em Progresso', value: 'inProgress', color: 'info' },
    { label: 'Pausada', value: 'paused', color: 'warning' },
    { label: 'Concluída', value: 'done', color: 'success' }
  ]

  const filtersList = [
    { type: 'search', name: 'task name', placeholder: 'Pesquisar tarefa' },
    {
      type: 'select',
      multiple: true,
      name: 'status',
      placeholder: 'Status',
      options: statusList
    }
  ]

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

  const lateTask = (deadline: string) => {
    const today = new Date()
    const taskDate = new Date(deadline)
    return taskDate < today
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node) // Verifica se o clique foi fora do statusRef
      ) {
        setOpenStatusOptions(false)
      }
    }

    document.addEventListener('mouseup', handleClickOutside)

    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  }, [])

  console.log(openStatusOptions)

  return (
    <Card className="w-full">
      <FiltersList list={filtersList} setFilters={setFilters} />
      <div>
        <table className="w-full table-auto max-w-full mt-4 border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="px-2">Id</th>
              <th className="px-2 max-w-[180px]">Responsável</th>
              <th className="px-2 max-w-[300px]">Nome da tarefa</th>
              <th className="px-2">Data limite</th>
              <th className="px-2 w-[90px]">Prioridade</th>
              <th className="px-2 w-[130px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {mock.map((task) => (
              <tr key={task.id}>
                <td className="px-2">{task.id}</td>
                <td className="px-2 max-w-[180px]" title={task.assignee.name}>
                  <div className="flex items-center gap-2">
                    <Avatar src={task.assignee.profileImage} size="sm" />
                    <span className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {task?.assignee?.name ?? ''}
                    </span>
                  </div>
                </td>
                <td title={task.title} className="px-2 max-w-[300px]">
                  <span className="truncate block">{task.title}</span>
                </td>
                <td
                  className={`px-2 text-center ${lateTask(task.deadline) ? 'text-red-800' : ''}`}
                >
                  {formatDate(task.deadline, 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="px-2 text-center w-[90px]">
                  <FontAwesomeIcon
                    icon={
                      task.priority === 'high'
                        ? faAnglesUp
                        : task.priority === 'medium'
                          ? faEquals
                          : faAnglesDown
                    }
                    className={`${task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-gray-600' : 'text-cyan-400'}`}
                  />
                </td>
                <td className="px-2 w-[130px]">
                  <div className="relative" ref={statusRef}>
                    <Badge
                      name={statusFormat(task.status)?.label}
                      color={statusFormat(task.status)?.color}
                      fullWidth
                      onClick={() => {
                        setSelectedTask((prev) =>
                          prev === task.id ? null : task.id
                        )
                        setOpenStatusOptions(
                          (prev) => selectedTask !== task.id || !prev
                        )
                      }}
                      className="cursor-pointer"
                    />
                    {openStatusOptions && selectedTask === task.id && (
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
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="w-48 mt-4 flex m-auto gap-2 items-center justify-center">
          <FontAwesomeIcon
            icon={faCaretLeft}
            className={`transition-transform duration-200 text-2xl ${
              groupStart === 1
                ? 'opacity-30 cursor-default'
                : 'hover:scale-125 cursor-pointer'
            }`}
            onClick={handlePrevGroup}
          />
          {currentGroup.map((pg) => (
            <span
              key={pg}
              onClick={() => setPage(pg)}
              className={`text-center block w-6 h-6 rounded-full cursor-pointer ${page === pg ? 'bg-primary hover:bg-primary text-white' : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 hover:dark:bg-gray-500'}`}
            >
              {pg}
            </span>
          ))}

          <FontAwesomeIcon
            icon={faCaretRight}
            className={`transition-transform duration-200 text-2xl ${
              groupStart + pagesPerGroup > totalPages
                ? 'opacity-30 cursor-default'
                : 'hover:scale-125 cursor-pointer'
            }`}
            onClick={handleNextGroup}
          />
        </div>
      </div>
    </Card>
  )
}
