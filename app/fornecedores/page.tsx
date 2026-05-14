'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Fornecedor } from '@/lib/types'

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    materiais_principais: '',
  })
  const [editando, setEditando] = useState<Fornecedor | null>(null)

  async function carregarFornecedores() {
    setLoading(true)
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (!error) {
      setFornecedores(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    carregarFornecedores()
  }, [])

  async function salvar() {
    if (editando) {
      await supabase
        .from('fornecedores')
        .update({ ...form, atualizado_em: new Date().toISOString() })
        .eq('id', editando.id)
    } else {
      await supabase
        .from('fornecedores')
        .insert([{ ...form, ativo: true }])
    }
    setModalOpen(false)
    setForm({
      nome: '',
      cnpj: '',
      contato: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      materiais_principais: '',
    })
    setEditando(null)
    carregarFornecedores()
  }

  function abrirModal(f?: Fornecedor) {
    if (f) {
      setEditando(f)
      setForm({
        nome: f.nome,
        cnpj: f.cnpj || '',
        contato: f.contato || '',
        email: f.email || '',
        telefone: f.telefone || '',
        endereco: f.endereco || '',
        cidade: f.cidade || '',
        estado: f.estado || '',
        cep: f.cep || '',
        materiais_principais: f.materiais_principais || '',
      })
    } else {
      setEditando(null)
      setForm({
        nome: '',
        cnpj: '',
        contato: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        materiais_principais: '',
      })
    }
    setModalOpen(true)
  }

  async function deletar(id: string) {
    if (confirm('Tem certeza que deseja deletar?')) {
      await supabase
        .from('fornecedores')
        .update({ ativo: false })
        .eq('id', id)
      carregarFornecedores()
    }
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Fornecedores</h1>
        <button onClick={() => abrirModal()} className="btn-primary">
          + Novo Fornecedor
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {fornecedores.length === 0 ? (
            <p className="text-gray-400">Nenhum fornecedor cadastrado</p>
          ) : (
            fornecedores.map((f) => (
              <div key={f.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{f.nome}</h3>
                    <p className="text-sm text-gray-600">CNPJ: {f.cnpj}</p>
                    <p className="text-sm text-gray-600">Email: {f.email}</p>
                    <p className="text-sm text-gray-600">Tel: {f.telefone}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {f.materiais_principais}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModal(f)}
                      className="btn-secondary text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deletar(f.id)}
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
              {editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input-field"
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <label className="label">CNPJ</label>
                <input
                  type="text"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  className="input-field"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
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
                />
              </div>
              <div className="col-span-2">
                <label className="label">Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) =>
                    setForm({ ...form, endereco: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Cidade</label>
                <input
                  type="text"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Estado</label>
                <input
                  type="text"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="input-field"
                  maxLength={2}
                />
              </div>
              <div className="col-span-2">
                <label className="label">Materiais Principais</label>
                <textarea
                  value={form.materiais_principais}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      materiais_principais: e.target.value,
                    })
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Liste os materiais que você geralmente compra"
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
