import ThemeProvider from '@/providers/ThemeProvider'
import '@/global.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Meu Projeto',
  description: 'Descrição do projeto'
}

export default function CommonLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen text-foreground relative">
        <main className="flex w-lvw h-lvh">
          <Navbar />
          <div className="flex-1 pl-16">
            <Header />
            {/* Main Content */}
            <div className="p-6 flex flex-col items-center">
              <div className="flex-1 w-full 2xl:max-w-7xl">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
