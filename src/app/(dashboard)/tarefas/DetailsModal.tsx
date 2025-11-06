import Avatar from '@/components/Avatar'
import DateInput from '@/components/DateInput'
import InputField from '@/components/InputField'
import Modal from '@/components/Modal'
import SelectField from '@/components/SelectField'
import StatusSelector from '@/components/StatusSelector'
import { TaskType } from '@/types/taskType'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatDate, isValid, parse, set } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { statusList } from './TaskPage'
import { getDepartments } from '@/services/departmentServices'
import { useEffect, useState } from 'react'
import { DepartmentType } from '@/types/departmentType'
import { getUsers } from '@/services/userServices'
import { UserType } from '@/types/userType'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBolt,
  faCirclePlus,
  faFolderOpen,
  faLock,
  faLockOpen
} from '@fortawesome/free-solid-svg-icons'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import TagsModal from '@/components/TagsModal'
import toast from 'react-hot-toast'
import { api } from '@/utils/axios'

interface DetailsModalProps {
  open: boolean
  onClose: () => void
  task: TaskType
  updateList: () => void
}

export default function TaskDetailsModal({
  task,
  open,
  onClose,
  updateList
}: DetailsModalProps) {
  const [departments, setDepartments] = useState<DepartmentType[]>([])
  const [usersList, setUsersList] = useState<UserType[]>([])
  const [openTagsModal, setOpenTagsModal] = useState(false)

  const defaultValues = {
    title: task.title,
    description: task.description,
    status: task.status,
    deadline: task.deadline,
    priority: task.priority,
    departmentId: task?.department?.id,
    assigneeId: task?.assignee?.id
  }

  const schema = z.object({
    title: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
    status: z.enum(['todo', 'inProgress', 'paused', 'done']),
    deadline: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
    departmentId: z.number().min(1, 'Campo obrigatório'),
    assigneeId: z.number().optional()
  })

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(schema)
  })

  const {
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    handleSubmit
  } = methods

  const formValues = watch()

  const submit = async (formData: any) => {
    try {
      const { data, status } = await api.put(`tasks/${task.id}`, formData)
      if (status === 200) {
        toast.success('Tarefa atualizada com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao atualizar a tarefa.')
    }
  }

  useEffect(() => {
    const fetchDepartments = async () => {
      const data = await getDepartments()
      setDepartments(data)
    }
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (task && departments.length > 0) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
        priority: task.priority,
        departmentId: task.department ? task.department.id : undefined,
        assigneeId: task.assignee ? task.assignee.id : undefined
      })
    }
  }, [task, departments])

  useEffect(() => {
    if (formValues.departmentId) {
      const fetchUsers = async () => {
        const { data } = await getUsers({
          departmentId: formValues.departmentId
        })
        setUsersList(data)
      }
      fetchUsers()
    }
  }, [formValues.departmentId])

  useEffect(() => {
    if (usersList.length > 0 && task) {
      const assigneeExists = usersList.find(
        (user) => user.id === task.assignee.id
      )
      setValue('assigneeId', assigneeExists ? task.assignee.id : undefined)
    }
  }, [usersList])

  const userOptions =
    usersList?.map((user) => ({
      label: user.name,
      value: user.id,
      avatar: user.profileImage
    })) || []

  console.log(formValues)

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col h-full">
        <h3 className="text-xl text-primary font-bold text-center mb-3">
          Detalhamento
        </h3>
        <div className="flex items-center gap-1 mb-3 font-bold text-lg cursor-pointer ">
          <FontAwesomeIcon icon={faBolt} className="text-yellow-300" />
          <span>{task.id}</span>
        </div>
        <div className="overflow-y-auto grow pr-2">
          <div className="flex items-center text-sm py-2">
            Criado por{' '}
            <div className="flex items-center p-0.5 pr-1 rounded-4xl mx-2 font-bold shadow-[0_0_5px_rgba(0,0,0,0.3)] dark:shadow-[0_0_5px_rgba(255,255,255,0.2)]">
              <Avatar
                src={task.creator.profileImage}
                size="sm"
                className="mr-2 "
              />{' '}
              {task.creator.name}
            </div>
            em{' '}
            {formatDate(task.createdAt, 'dd/MM/yyyy hh:mm', { locale: ptBR })}
          </div>

          <form>
            {task.parentTask && (
              <div className="mt-3 ">
                <span className="text-primary">Tarefa pai:</span>
                <div
                  className="w-full flex items-center mt-1 rounded-md
             hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                >
                  <div className="px-2 rounded-l-md text-center">
                    {task.parentTask.id}
                  </div>
                  <div title={task.title} className="px-2 grow ">
                    <span className="truncate block">
                      {task.parentTask.title}
                    </span>
                  </div>

                  <div className="px-2 w-[130px]">
                    <StatusSelector
                      task={task.parentTask}
                      statusList={statusList}
                      updateList={updateList}
                    />
                  </div>
                  <div className="rounded-r-md text-center p-1">
                    <FontAwesomeIcon
                      icon={faFolderOpen}
                      className="bg-gray-300 p-1.5 rounded-full text-gray-800 hover:bg-gray-400 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            )}
            <hr className="my-3 border-gray-200  dark:border-gray-700" />
            <span className="text-primary">Título:</span>
            <InputField
              type="text"
              placeholder="Nome da tarefa"
              value={formValues.title}
              onChange={(e) => setValue('title', e.target.value)}
              transparentUntilFocus
            />
            <span className="text-primary">Descrição:</span>
            <textarea
              className="w-full rounded-[8px] p-2 outline-0 resize-none transition-all duration-300 dark:focus-within:bg-gray-700 focus-within:bg-gray-200 "
              rows={5}
              value={formValues.description}
              onChange={(e) => setValue('description', e.target.value)}
            />
            <div className="w-48">
              <span className="text-primary">Status:</span>
              <StatusSelector task={task} statusList={statusList} />
            </div>
            <div className="grid lg:grid-cols-2 gap-3 my-3">
              <div>
                <span className="text-primary">Setor:</span>
                <SelectField
                  options={departments?.map((item: DepartmentType) => {
                    return { label: item.name, value: item.id }
                  })}
                  placeholder="Departamento"
                  value={formValues.departmentId}
                  onChange={(value: any) => setValue('departmentId', value)}
                />
              </div>
              <div>
                <span className="text-primary">Responsável:</span>
                <SelectField
                  options={userOptions}
                  placeholder="Responsável"
                  value={formValues.assigneeId}
                  onChange={(value: any) => setValue('assigneeId', value)}
                />
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-3">
              <div>
                <span className="text-primary">Data limite:</span>
                <DateInput
                  placeholder="Selecione uma data"
                  setDate={(date: any) => setValue('deadline', date)}
                  value={formValues.deadline}
                />
              </div>
              <div>
                <span className="text-primary">Prioridade:</span>
                <SelectField
                  options={[
                    { label: 'Baixa', value: 'low' },
                    { label: 'Média', value: 'medium' },
                    { label: 'Alta', value: 'high' }
                  ]}
                  placeholder="Prioridade"
                  value={formValues.priority}
                  onChange={(value: any) => setValue('priority', value)}
                />
              </div>
            </div>

            {task.blocking && (
              <div className="mt-3 ">
                <span className="text-primary">Bloqueada por:</span>
                <div
                  className="w-full flex items-center mt-1 rounded-md
             hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                >
                  <div className="px-2 rounded-l-md text-center w-16">
                    <FontAwesomeIcon
                      icon={faBolt}
                      className="text-yellow-300 mr-1"
                    />
                    <span>{task.id}</span>
                  </div>
                  <div
                    className="hidden md:flex px-2 grow max-w-[180px] py-1"
                    title={
                      task.blocking.assignee
                        ? task.blocking.assignee.name
                        : 'Não atribuído'
                    }
                  >
                    <div className="flex items-center gap-2 max-w-[150px] ">
                      {task.blocking.assignee ? (
                        <Avatar
                          src={task.blocking.assignee?.profileImage}
                          size="sm"
                        />
                      ) : (
                        <div className="p-2 bg-primary rounded-full w-10 h-10 text-center text-xl text-white">
                          ?
                        </div>
                      )}
                      <span className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                        {task.blocking.assignee
                          ? task.blocking.assignee.name
                          : 'Não atribuído'}
                      </span>
                    </div>
                  </div>
                  <div title={task.title} className="px-2 grow max-w-[300px]">
                    <span className="truncate block">
                      {task.blocking.title}
                    </span>
                  </div>

                  <div className="px-2 text-center w-[40px]">
                    {task.blocking && (
                      <FontAwesomeIcon
                        icon={
                          task?.blocking?.status === 'done'
                            ? faLockOpen
                            : faLock
                        }
                        className={`text-gray-400`}
                      />
                    )}
                  </div>
                  <div className="px-2 w-[130px]">
                    <StatusSelector task={task} statusList={statusList} />
                  </div>
                  <div className="rounded-r-md text-center p-1">
                    <FontAwesomeIcon
                      icon={faFolderOpen}
                      className="bg-gray-300 p-1.5 rounded-full text-gray-800 hover:bg-gray-400 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            )}
            {task.subtasks.length > 0 && (
              <div className="mt-3 ">
                <span className="text-primary">Subtarefas:</span>

                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="w-full flex items-center mt-1 rounded-md
             hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="px-2 rounded-l-md text-center w-16">
                      <FontAwesomeIcon
                        icon={faBolt}
                        className="text-yellow-300 mr-1"
                      />
                      <span>{task.id}</span>
                    </div>
                    <div
                      className="hidden md:flex px-2 grow max-w-[180px] py-1"
                      title={
                        subtask.assignee
                          ? subtask.assignee.name
                          : 'Não atribuído'
                      }
                    >
                      <div className="flex items-center gap-2 max-w-[150px] ">
                        {subtask.assignee ? (
                          <Avatar
                            src={subtask.assignee?.profileImage}
                            size="sm"
                          />
                        ) : (
                          <div className="p-2 bg-primary rounded-full w-10 h-10 text-center text-xl text-white">
                            ?
                          </div>
                        )}
                        <span className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                          {subtask.assignee
                            ? subtask.assignee.name
                            : 'Não atribuído'}
                        </span>
                      </div>
                    </div>
                    <div title={task.title} className="px-2 grow max-w-[300px]">
                      <span className="truncate block">{subtask.title}</span>
                    </div>

                    <div className="px-2 text-center w-[40px]">
                      {subtask && (
                        <FontAwesomeIcon
                          icon={
                            subtask?.blocking?.status === 'done'
                              ? faLockOpen
                              : faLock
                          }
                          className={`text-gray-400`}
                        />
                      )}
                    </div>
                    <div className="px-2 w-[130px]">
                      <StatusSelector task={task} statusList={statusList} />
                    </div>
                    <div className="rounded-r-md text-center p-1">
                      <FontAwesomeIcon
                        icon={faFolderOpen}
                        className="bg-gray-300 p-1.5 rounded-full text-gray-800 hover:bg-gray-400 transition-colors duration-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <div className="flex items-center gap-5">
                <span className="text-primary">Tags</span>
                <FontAwesomeIcon
                  icon={faCirclePlus}
                  className="text-primary cursor-pointer text-[20px]"
                  onClick={() => setOpenTagsModal(true)}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-1">
                {task?.tags?.map((tag) => (
                  <Badge
                    key={tag.id}
                    name={tag.name}
                    className="cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </form>
        </div>

        <Button
          title="Salvar"
          className="sticky bottom-0 mt-4 w-24 ml-auto mr-8"
          onClick={handleSubmit(submit)}
        />
      </div>
      <TagsModal
        open={openTagsModal}
        onClose={() => setOpenTagsModal(false)}
        task={task}
      />
    </Modal>
  )
}
