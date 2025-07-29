import Card from '@/components/Card'
import WeekCalendarIcon from '@/assets/icons/week-calendar.png'
import AttentionIcon from '@/assets/icons/attention.png'
import DeadlineIcon from '@/assets/icons/deadline.png'
import TaskListIcon from '@/assets/icons/task-list.png'
import Image from 'next/image'
import Calendar from '@/components/Calendar'
import avatarImage from '@/assets/images/default-avatar.svg'
import Button from '@/components/Button'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'
import Carousel from '@/components/Carousel'

const tasksData = [
  { title: 'Tarefas da semana', icon: WeekCalendarIcon, count: 15 },
  { title: 'Tarefas vencendo hoje', icon: DeadlineIcon, count: 15 },
  { title: 'Tarefas pendentes', icon: TaskListIcon, count: 15 },
  { title: 'Tarefas vencidas', icon: AttentionIcon, count: 15 }
]

export default function Home() {
  return (
    <>
      <Card className="mb-3 w-full">
        <Carousel />
      </Card>
      <div className="flex flex-wrap gap-3">
        {tasksData.map((item, index) => (
          <Card
            className="flex items-center justify-around gap-3 flex-1 min-w-[300px]"
            key={index}
          >
            <Image
              src={item.icon}
              alt="Calendário da semana"
              className="w-12 h-12"
            />
            <div className="flex flex-col gap-1 items-center">
              <span className="text-xl text-primary-dark dark:text-white text-center">
                {item.title}
              </span>
              <span className="font-bold text-3xl text-primary-dark dark:text-white">
                {item.count}
              </span>
            </div>
          </Card>
        ))}

        <div className="flex flex-wrap gap-3 w-full">
          <Card className="flex-1 min-w-md">
            <p className="font-bold text-center mb-3 text-lg">
              Aniversariantes do mês
            </p>
            <div className="flex flex-wrap justify-between items-center max-h-[400] pr-2">
              <div className="flex items-center gap-3 ">
                <Image
                  src={avatarImage}
                  alt="Calendário da semana"
                  className="w-10 h-10 rounded-full "
                />
                <div className="flex flex-col gap-1">
                  <span>05/05 - Dayane Santos</span>
                  <span className="text-sm">Financeiro</span>
                </div>
              </div>
              <Button title="Enviar mensagem" icon={faCommentDots} size="sm" />
            </div>
          </Card>
          <Card>
            <Calendar />
          </Card>
        </div>
      </div>
    </>
  )
}
