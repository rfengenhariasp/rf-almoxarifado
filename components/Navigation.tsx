'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🏭 Almoxarifado RF
          </Link>

          <div className="flex gap-6">
            <Link
              href="/fornecedores"
              className={`font-medium transition-colors ${
                isActive('/fornecedores')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Fornecedores
            </Link>
            <Link
              href="/materiais"
              className={`font-medium transition-colors ${
                isActive('/materiais')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Materiais
            </Link>
            <Link
              href="/entradas"
              className={`font-medium transition-colors ${
                isActive('/entradas')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Entradas
            </Link>
            <Link
              href="/saidas"
              className={`font-medium transition-colors ${
                isActive('/saidas')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Saídas
            </Link>
            <Link
              href="/relatorios"
              className={`font-medium transition-colors ${
                isActive('/relatorios')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Relatórios
            </Link>
            <Link
              href="/importar"
              className={`font-medium transition-colors ${
                isActive('/importar')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Importar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
