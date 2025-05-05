import Card from '@/components/Card'
import WeekCalendarIcon from '@/assets/icons/week-calendar.png'
import AttentionIcon from '@/assets/icons/attention.png'
import DeadlineIcon from '@/assets/icons/deadline.png'
import TaskListIcon from '@/assets/icons/task-list.png'
import Image from 'next/image'
import Calendar from '@/components/Calendar'
import avatarImage from '@/assets/images/avatar.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleDown } from '@fortawesome/free-regular-svg-icons'

const tasksData = [
  { title: 'Tarefas para esta semana', icon: WeekCalendarIcon, count: 15 },
  { title: 'Tarefas vencendo hoje', icon: DeadlineIcon, count: 15 },
  { title: 'Tarefas pendentes', icon: TaskListIcon, count: 15 },
  { title: 'Tarefas vencidas', icon: AttentionIcon, count: 15 }
]

export default function Home() {
  return (
    <>
      <div className="flex flex-wrap  gap-3">
        {tasksData.map((item, index) => (
          <Card
            className="flex items-center justify-around gap-3 flex-1 min-w-[250px] max-w-1/4"
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
          <Card className="flex-1">
            <p className="font-bold text-center mb-3">Aniversariantes do mês</p>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={avatarImage}
                alt="Calendário da semana"
                className="w-10 h-10 rounded-full "
              />
              <div className="flex flex-col gap-1">
                <span>05/05 - Dayane Santos</span>
                <span className="text-sm">Financeiro</span>
              </div>
              <div className="ml-auto flex items-center bg-light-background p-2 rounded-full text-sm">
                <span>Enviar mensagem </span>
                <FontAwesomeIcon icon={faCircleDown} />
              </div>
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
