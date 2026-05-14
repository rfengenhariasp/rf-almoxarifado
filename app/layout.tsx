import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Almoxarifado - RF Engenharia',
  description: 'Sistema de Controle de Almoxarifado',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
