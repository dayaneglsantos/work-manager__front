import { createTag, getTags } from '@/services/tags/tagsService'
import Button from './Button'
import InputField from './InputField'
import Modal from './Modal'
import Badge from './Badge'
import { TagType, TaskType } from '@/types/taskType'
import SelectField from './SelectField'
import { useEffect, useState } from 'react'
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import EmptyContent from './EmptyContent'
import { set } from 'date-fns'

interface TagsModalProps {
  open: boolean
  onClose: () => void
  task: TaskType
}

export default function TagsModal({ open, onClose, task }: TagsModalProps) {
  const [availableTags, setAvailableTags] = useState<
    { value: number | string; label: string }[]
  >([])
  const [newTagName, setNewTagName] = useState<string | null>(null)
  const [taskTags, setTaskTags] = useState(task.tags || [])

  const fetchTags = async () => {
    const data = await getTags()
    setAvailableTags(
      data.map((tag: TagType) => {
        return { value: tag.id, label: tag.name }
      })
    )
  }

  const handleCreateTag = async () => {
    if (!newTagName) return
    const newTag = await createTag(task.id, newTagName)
    setTaskTags((prev: any) => [...prev, newTag])
    setNewTagName(null)
    fetchTags()
  }

  useEffect(() => {
    if (open) {
      fetchTags()
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={() => {
        setNewTagName(null)
        onClose()
      }}
      className="mt-4 md:w-[600] h-[500]"
    >
      <h3 className="text-xl text-primary font-bold text-center mb-3">
        Gerenciamento de Tags
      </h3>
      <Button
        onClick={() => setNewTagName('')}
        title="Criar nova tag"
        className="mt-5 mb-3 ml-auto block"
        disabled={newTagName !== null}
      />

      <div className="flex gap-3 items-center">
        <SelectField
          options={availableTags}
          placeholder="Selecione uma tag"
          className="w-full"
        />
        <FontAwesomeIcon
          icon={faCirclePlus}
          className="text-primary cursor-pointer text-[20px]"
          onClick={() => {}}
        />
      </div>
      {newTagName !== null && (
        <div className="flex gap-3 justify-between items-center">
          <InputField
            type="text"
            placeholder="Nome da nova tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <FontAwesomeIcon
            icon={faCirclePlus}
            className="text-primary cursor-pointer text-[20px]"
            onClick={handleCreateTag}
          />
        </div>
      )}
      {taskTags.length === 0 && (
        <EmptyContent title="Essa tarefa ainda não possui tags." />
      )}
      {taskTags.map((tag: any) => (
        <Badge key={tag.id} name={tag.name} className="cursor-pointer" />
      ))}
    </Modal>
  )
}
