'use client'

import FiltersList from '@/components/FiltersList'
import { useEffect, useState } from 'react'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Avatar from '@/components/Avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesDown,
  faAnglesUp,
  faBolt,
  faEquals,
  faFolderOpen,
  faLock,
  faLockOpen
} from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { getTasks } from '@/services/task/taskServices'
import { TasksMetaType, TaskType } from '@/types/taskType'
import StatusSelector from '@/components/StatusSelector'
import Pagination from '@/components/Pagination'
import TaskDetailsModal from './DetailsModal'
import Dropdown from '@/components/Dropdown/Dropdown'

interface FiltersType {
  name: string
  value: string | string[]
}

export const statusList = [
  { label: 'A Fazer', value: 'todo', color: 'default' },
  { label: 'Em Progresso', value: 'inProgress', color: 'info' },
  { label: 'Pausada', value: 'paused', color: 'warning' },
  { label: 'Concluída', value: 'done', color: 'success' }
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [tasksMeta, setTasksMeta] = useState<TasksMetaType | null>(null)
  const [filters, setFilters] = useState<FiltersType[]>([])
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false)
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)

  const statusFilter = filters.find((filter) => filter.name === 'status')
  const searchFilter = filters.find((filter) => filter.name === 'search')

  const filtersList = [
    {
      type: 'search',
      name: 'search',
      placeholder: 'Pesquisar tarefa',
      width: 300
    },
    {
      type: 'select',
      multiple: true,
      name: 'status',
      placeholder: 'Status',
      options: statusList,
      width: 300
    }
  ]

  const getTasksList = async (
    page: number = 1,
    pageSize: number = 10,
    status: string = '',
    search: string = ''
  ) => {
    try {
      const { data, meta } = await getTasks({
        page,
        pageSize,
        status,
        search
      })
      setTasks(data)
      setTasksMeta(meta)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao buscar tarefas')
    }
  }

  // Verifica se a tarefa está atrasada
  const lateTask = (deadline: string) => {
    const today = new Date()
    const taskDate = new Date(deadline)
    return taskDate < today
  }

  useEffect(() => {
    if (filtersApplied) {
      let statusValue = ''
      let searchValue = ''

      if (statusFilter && statusFilter?.value?.length > 0) {
        statusValue = Array.isArray(statusFilter?.value)
          ? statusFilter.value.join(',')
          : statusFilter?.value || ''
      }
      if (searchFilter && searchFilter?.value) {
        searchValue = (searchFilter?.value as string) || ''
      }
      getTasksList(1, 10, statusValue, searchValue)
    }
  }, [statusFilter, searchFilter])

  useEffect(() => {
    getTasksList()
  }, [])

  return (
    <>
      <FiltersList
        list={filtersList}
        setFilters={setFilters}
        setFiltersApplied={setFiltersApplied}
      />

      <div className="w-full mt-4 overflow-x-auto">
        <table className="w-full table-auto border-separate border-spacing-y-2">
          <thead>
            <tr className="text-sm">
              <th className="px-2">Id</th>
              <th className="px-2 max-w-[180px]">Responsável</th>
              <th className="px-2 min-w-[180px] max-w-[300px]">Título</th>
              <th className="px-2 min-w-[130px]">Data limite</th>
              <th className="px-2 w-[90px]">Prioridade</th>
              <th className="px-2 w-[40px]"></th>
              <th className="px-2 min-w-[130px]">Status</th>
              <th className="px-2 w-[110px]">Ver detalhes</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <td className="flex items-center gap-2 px-2 rounded-l-md text-center">
                  <FontAwesomeIcon icon={faBolt} className="text-yellow-300" />{' '}
                  <span>{task.id}</span>
                </td>
                <td
                  className="px-2 max-w-[180px] py-1"
                  title={task.assignee ? task.assignee.name : 'Não atribuído'}
                >
                  <div className="flex items-center gap-2">
                    {task.assignee ? (
                      <Avatar src={task.assignee?.profileImage} size="sm" />
                    ) : (
                      <div className="p-2 bg-primary rounded-full w-10 h-10 text-center text-xl text-white">
                        ?
                      </div>
                    )}
                    <span className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                      {task.assignee ? task.assignee.name : 'Não atribuído'}
                    </span>
                  </div>
                </td>
                <td title={task.title} className="px-2 max-w-[300px]">
                  <span className="truncate block">{task.title}</span>
                </td>
                <td
                  className={`px-2 text-center ${task.deadline ? lateTask(task.deadline) && 'text-red-800' : ''}`}
                >
                  {task.deadline
                    ? formatDate(task.deadline, 'dd/MM/yyyy', {
                        locale: ptBR
                      })
                    : '--'}
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
                <td className="px-2 text-center w-[40px]">
                  {task.blocking && (
                    <FontAwesomeIcon
                      icon={
                        task?.blocking?.status === 'done' ? faLockOpen : faLock
                      }
                      className={`text-gray-400`}
                    />
                  )}
                </td>
                <td className="px-2 w-[130px]">
                  <StatusSelector task={task} statusList={statusList} />
                </td>
                <td className="rounded-r-md text-center p-1">
                  <FontAwesomeIcon
                    icon={faFolderOpen}
                    className="bg-gray-300 p-1.5 rounded-full text-gray-800 hover:bg-gray-400 transition-colors duration-200"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasksMeta && (
        <Pagination metaData={tasksMeta} updateList={getTasksList} />
      )}

      {selectedTask && (
        <TaskDetailsModal
          open={true}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </>
  )
}
