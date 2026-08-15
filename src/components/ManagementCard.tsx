import Image, { type StaticImageData } from 'next/image'
import Button from './Button'

interface ManagementCardProps {
  title: string
  description: string
  image: StaticImageData
  href?: string
}

export default function ManagementCard({
  title,
  description,
  image,
  href
}: ManagementCardProps) {
  return (
    <article className="group relative flex min-h-64 flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-primary-dark/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-light/40 hover:shadow-xl hover:shadow-primary-dark/10 dark:border-dark-border dark:bg-dark-surface dark:shadow-none dark:hover:border-primary-light/30 dark:hover:bg-dark-surface-hover">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary-light/10 blur-3xl transition-colors group-hover:bg-primary-light/20 dark:bg-primary/10" />

      <div className="relative flex h-28 items-center justify-center">
        <Image
          src={image}
          alt=""
          className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="112px"
        />
      </div>

      <div className="relative mt-5 flex flex-1 flex-col">
        <h2 className="text-xl font-bold text-primary-dark dark:text-dark-text">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-dark-muted">
          {description}
        </p>

        <Button
          title={href ? 'Acessar' : 'Em breve'}
          href={href}
          disabled={!href}
          variant={href ? 'primary' : 'outline'}
          className="mt-5 w-full"
        />
      </div>
    </article>
  )
}
