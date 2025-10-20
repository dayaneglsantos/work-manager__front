import EmptyIcon from '@/assets/icons/empty'

export default function EmptyContent({
  title,
  description
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="h-40 w-full flex flex-col justify-center items-center gap-2 text-gray-400 my-5">
      <h4>{title || 'Nenhum conteúdo disponível'}</h4>
      <EmptyIcon className="h-20 text-primary" />
      <p>{description}</p>
    </div>
  )
}
