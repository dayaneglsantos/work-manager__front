import Image from 'next/image'
import comingSoonImage from '@/assets/images/coming-soon.png'
import Card from './Card'
import Badge from './Badge'

interface ComingSoonProps {
  title: string
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <Card className="relative w-full max-w-md overflow-hidden border border-purple-100 bg-white/95 px-8 py-9 text-center shadow-xl shadow-primary-dark/5 dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
        <div className="absolute -top-20 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-primary-light/15 blur-3xl dark:bg-primary/10" />

        <Image
          src={comingSoonImage}
          alt="Funcionalidade em desenvolvimento"
          priority
          className="relative mx-auto h-auto w-48 sm:w-56"
        />

        <Badge
          name="Novidade em construção"
          variant="default"
          className="relative mt-5 tracking-wide"
        />

        <h1 className="relative mt-4 text-2xl font-bold text-primary-dark dark:text-dark-text">
          {title}
        </h1>

        <p className="relative mt-2 text-lg font-semibold text-primary dark:text-primary-light">
          Em breve
        </p>
        <p className="relative mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-600 dark:text-dark-muted">
          Estamos trabalhando para trazer esta funcionalidade até você.
        </p>
      </Card>
    </div>
  )
}
