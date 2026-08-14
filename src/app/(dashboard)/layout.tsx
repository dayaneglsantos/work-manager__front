import '@/global.css'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'
import { Toaster } from 'react-hot-toast'
import { ProtectRoute } from '@/components/ProtectRoute'

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
    <>
      <Toaster />
      <ProtectRoute>
        <div className="flex min-h-screen text-foreground relative">
          <main className="flex w-full h-full">
            <Navbar />
            <div className="flex-1 md:pl-[68px]">
              <Header />
              {/* Main Content */}
              <div className="p-6 flex flex-col items-center ">
                <div className="flex-1 w-full 2xl:max-w-7xl">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </ProtectRoute>
    </>
  )
}
