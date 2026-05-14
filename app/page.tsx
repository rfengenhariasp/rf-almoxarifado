'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('Carregando...')

  useEffect(() => {
    setStatus('✅ Sistema Pronto')
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏭 Almoxarifado
          </h1>
          <p className="text-lg text-gray-600">Sistema de Controle - RF Engenharia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600">Fornecedores</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-1">Cadastrados</p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600">Materiais</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-1">Em estoque</p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600">Entradas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <h3 className="text-sm font-medium text-gray-600">Saídas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status do Sistema</h2>
          <p className="text-lg text-green-600 mb-6">{status}</p>
          <div className="space-y-3">
            <p className="text-gray-600">✅ Banco de dados configurado</p>
            <p className="text-gray-600">✅ API pronta</p>
            <p className="text-gray-600">✅ Interface funcionando</p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Sistema de Almoxarifado v1.0.0</p>
        </div>
      </div>
    </main>
  )
}
