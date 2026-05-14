import type { Metadata } from 'next'
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
      <body>{children}</body>
    </html>
  )
}
