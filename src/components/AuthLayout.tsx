import bgImage from '@/assets/images/login-bg.jpg'
import Image from 'next/image'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  className?: string
}

export default function AuthLayout({
  children,
  className = ''
}: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-8 text-white sm:px-6">
      <Image
        src={bgImage}
        alt=""
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/80" aria-hidden="true" />

      <section
        className={`relative z-10 w-full rounded-2xl border border-white/10 bg-gray-400/15 p-6 shadow-2xl backdrop-blur-sm sm:p-8 ${className}`}
      >
        {children}
      </section>
    </main>
  )
}
