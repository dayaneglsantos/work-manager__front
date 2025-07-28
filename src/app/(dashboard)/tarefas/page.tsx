import TasksPage from './TaskPage'
import { getTasks } from '@/services/task/taskServices'

export default async function Page() {
  const { data, meta } = await getTasks()

  return (
    <>
      <TasksPage data={data} meta={meta} />
    </>
  )
}
