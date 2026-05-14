'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Cliente } from '@/lib/types'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    os_eloca: '',
  })
  const [editando, setEditando] = useState<Cliente | null>(null)

  async function carregarClientes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (!error) {
      setClientes(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  async function salvar() {
    if (editando) {
      await supabase
        .from('clientes')
        .update({ ...form, atualizado_em: new Date().toISOString() })
        .eq('id', editando.id)
    } else {
      await supabase
        .from('clientes')
        .insert([{ ...form, ativo: true }])
    }
    setModalOpen(false)
    setForm({
      nome: '',
      telefone: '',
      endereco: '',
      os_eloca: '',
    })
    setEditando(null)
    carregarClientes()
  }

  function abrirModal(c?: Cliente) {
    if (c) {
      setEditando(c)
      setForm({
        nome: c.nome,
        telefone: c.telefone || '',
        endereco: c.endereco || '',
        os_eloca: c.os_eloca || '',
      })
    } else {
      setEditando(null)
      setForm({
        nome: '',
        telefone: '',
        endereco: '',
        os_eloca: '',
      })
    }
    setModalOpen(true)
  }

  async function deletar(id: string) {
    if (confirm('Tem certeza que deseja deletar?')) {
      await supabase
        .from('clientes')
        .update({ ativo: false })
        .eq('id', id)
      carregarClientes()
    }
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🏢 Clientes/Obras</h1>
        <button onClick={() => abrirModal()} className="btn-primary">
          + Novo Cliente
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {clientes.length === 0 ? (
            <p className="text-gray-400">Nenhum cliente cadastrado</p>
          ) : (
            clientes.map((c) => (
              <div key={c.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{c.nome}</h3>
                    <p className="text-sm text-gray-600">Tel: {c.telefone}</p>
                    <p className="text-sm text-gray-600">End: {c.endereco}</p>
                    <p className="text-sm text-blue-600 font-bold mt-2">
                      OS Eloca: {c.os_eloca}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModal(c)}
                      className="btn-secondary text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deletar(c.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editando ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input-field"
                  placeholder="Nome do cliente/obra"
                />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                  className="input-field"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="label">Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) =>
                    setForm({ ...form, endereco: e.target.value })
                  }
                  className="input-field"
                  placeholder="Rua, número, cidade"
                />
              </div>
              <div>
                <label className="label">OS Eloca</label>
                <input
                  type="text"
                  value={form.os_eloca}
                  onChange={(e) =>
                    setForm({ ...form, os_eloca: e.target.value })
                  }
                  className="input-field"
                  placeholder="Número da OS no sistema Eloca"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button onClick={salvar} className="btn-primary">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
