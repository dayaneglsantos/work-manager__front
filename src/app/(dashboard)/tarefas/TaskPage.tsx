'use client'

import Card from '@/components/Card'
import FiltersList from '@/components/FiltersList'
import { useEffect, useState } from 'react'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Avatar from '@/components/Avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesDown,
  faAnglesUp,
  faEquals,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { getTasks } from '@/services/task/taskServices'
import { TasksMetaType, TaskType } from '@/types/taskType'
import StatusSelector from '@/components/StatusSelector'
import Pagination from '@/components/Pagination'
import TaskDetailsModal from './DetailsModal'

interface FiltersType {
  name: string
  value: string | string[]
}

export default function TasksPage({
  data,
  meta
}: {
  data: TaskType[]
  meta: TasksMetaType
}) {
  const [tasks, setTasks] = useState<TaskType[]>(data)
  const [tasksMeta, setTasksMeta] = useState<TasksMetaType | null>(meta)
  const [filters, setFilters] = useState<FiltersType[]>([])
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false)
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)

  const statusFilter = filters.find((filter) => filter.name === 'status')
  const searchFilter = filters.find((filter) => filter.name === 'search')

  const statusList = [
    { label: 'A Fazer', value: 'todo', color: 'default' },
    { label: 'Em Progresso', value: 'inProgress', color: 'info' },
    { label: 'Pausada', value: 'paused', color: 'warning' },
    { label: 'Concluída', value: 'done', color: 'success' }
  ]

  const filtersList = [
    { type: 'search', name: 'search', placeholder: 'Pesquisar tarefa' },
    {
      type: 'select',
      multiple: true,
      name: 'status',
      placeholder: 'Status',
      options: statusList
    }
  ]

  const getTasksList = async (
    page: number = 1,
    status: string = '',
    search: string = ''
  ) => {
    try {
      const { data, meta } = await getTasks({ page, status, search })
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
      getTasksList(1, statusValue, searchValue)
    }
  }, [statusFilter, searchFilter])

  return (
    <>
      <Card className="w-full">
        <FiltersList
          list={filtersList}
          setFilters={setFilters}
          setFiltersApplied={setFiltersApplied}
        />

        <div>
          <table className="w-full table-auto max-w-full mt-4 border-separate border-spacing-y-2 ">
            <thead>
              <tr>
                <th className="px-2">Id</th>
                <th className="px-2 max-w-[180px]">Responsável</th>
                <th className="px-2 max-w-[300px]">Nome da tarefa</th>
                <th className="px-2">Data limite</th>
                <th className="px-2 w-[90px]">Prioridade</th>
                <th className="px-2 w-[130px]">Status</th>
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
                  <td className="px-2 rounded-l-md">{task.id}</td>
                  <td
                    className="px-2 max-w-[180px] py-1"
                    title={task.assignee.name}
                  >
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
                  <td className="px-2 w-[130px] ">
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
          {tasksMeta && (
            <Pagination metaData={tasksMeta} updateList={getTasksList} />
          )}
        </div>
      </Card>
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
