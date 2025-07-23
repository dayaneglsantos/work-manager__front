import Avatar from '@/components/Avatar'
import DateInput from '@/components/DateInput'
import Modal from '@/components/Modal'
import SelectField from '@/components/SelectField'
import { TaskType } from '@/types/taskType'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface DetailsModalProps {
  open: boolean
  onClose: () => void
  task: TaskType
}

export default function TaskDetailsModal({
  task,
  open,
  onClose
}: DetailsModalProps) {
  const defaultValues = {
    name: task.title,
    description: task.description,
    status: task.status,
    deadline: task.deadline,
    priority: task.priority
  }

  const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
    status: z.enum(['todo', 'inProgress', 'paused', 'done']),
    deadline: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high'])
  })

  const methods = useForm({
    defaultValues,
    resolver: zodResolver(schema)
  })

  const {
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = methods

  const formValues = watch()

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl text-primary font-bold text-center mb-3">
        Detalhamento
      </h3>
      <div className="flex justify-around items-center mb-3">
        <p className="text-bold text-lg">Id: {task.id}</p>
        <div className="flex items-center">
          Criado por{' '}
          <div className="flex items-center bg-gray-700 p-1 px-1.5 rounded-lg mx-2">
            <Avatar
              src={task.creator.profileImage}
              size="sm"
              className="mr-2"
            />{' '}
            {task.creator.name}
          </div>
          em {formatDate(task.createdAt, 'dd/MM/yyyy h:mm', { locale: ptBR })}
        </div>
        {/* </div> */}
      </div>
      <input
        className="text-center text-2xl w-full p-1 outline-0"
        value={formValues.name}
        onChange={(e) => setValue('name', e.target.value)}
      />
      <textarea
        className="w-full p-2 outline-0 resize-none"
        rows={5}
        value={formValues.description}
        onChange={(e) => setValue('description', e.target.value)}
      />
      <div className="flex gap-3">
        <div>
          <span className="text-primary">Data limite:</span>
          <DateInput
            placeholder="Selecione uma data"
            onChange={(date) => setValue('deadline', date)}
            value={formValues.deadline}
            width={200}
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
    </Modal>
  )
}
