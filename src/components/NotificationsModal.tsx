const notifications = [
  {
    id: 1,
    title: 'Notificação 1',
    message: 'Mensagem da notificação 1'
  },
  {
    id: 2,
    title: 'Notificação 2',
    message: 'Mensagem da notificação 2'
  },
  {
    id: 3,
    title: 'Notificação 3',
    message: 'Mensagem da notificação 3'
  },
  {
    id: 4,
    title: 'Notificação 4',
    message:
      'Mensagem da notificação 4 que dix que dfasfd asdfasdfa asdfasdf asfdsadfsa asdfasf'
  }
]

export default function NotificationsModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <div
      className={`fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-screen w-screen ${open ? 'block' : 'hidden'} flex items-center justify-center`}
      onClick={onClose}
    >
      <div
        className={`shadow-lg ${open ? 'blobk' : 'hidden'} absolute top-13 right-2 max-w-96 rounded-lg bg-white dark:bg-primary-dark `}
      >
        <p className="p-3 pb-0 text-center font-bold">Notificações</p>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`p-3 border-gray-200 dark:border-gray-700 ${index !== notifications.length - 1 ? 'border-b-[0.5px]' : ''} ${index === notifications.length - 1 ? 'rounded-b-lg' : ''}`}
          >
            <span className="italic">{notification.title}</span>
            <p className="text-sm">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
