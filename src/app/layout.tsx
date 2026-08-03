import { AuthProvider } from '@/contexts/AuthContext'
import ThemeProvider from '@/providers/ThemeProvider'
import '@/global.css'
import type { Metadata } from 'next'
import { Imprima } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Meu Projeto',
  description: 'Descrição do projeto'
}

const font = Imprima({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mako',
  display: 'swap'
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" className={font.className} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
