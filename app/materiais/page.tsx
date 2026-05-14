'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Material, Fornecedor } from '@/lib/types'

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    unidade: '',
    estoque_minimo: 0,
    estoque_maximo: 0,
    preco_unitario: 0,
    fornecedor_principal: '',
    sku: '',
  })
  const [editando, setEditando] = useState<Material | null>(null)

  async function carregar() {
    setLoading(true)
    const { data: mat } = await supabase
      .from('materiais')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    const { data: forn } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    setMateriais(mat || [])
    setFornecedores(forn || [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar() {
    if (editando) {
      await supabase
        .from('materiais')
        .update({ ...form, atualizado_em: new Date().toISOString() })
        .eq('id', editando.id)
    } else {
      await supabase.from('materiais').insert([{ ...form, ativo: true }])
    }
    setModalOpen(false)
    resetForm()
    carregar()
  }

  function abrirModal(m?: Material) {
    if (m) {
      setEditando(m)
      setForm({
        nome: m.nome,
        descricao: m.descricao || '',
        categoria: m.categoria || '',
        unidade: m.unidade || '',
        estoque_minimo: m.estoque_minimo,
        estoque_maximo: m.estoque_maximo,
        preco_unitario: m.preco_unitario || 0,
        fornecedor_principal: m.fornecedor_principal || '',
        sku: m.sku || '',
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  function resetForm() {
    setEditando(null)
    setForm({
      nome: '',
      descricao: '',
      categoria: '',
      unidade: '',
      estoque_minimo: 0,
      estoque_maximo: 0,
      preco_unitario: 0,
      fornecedor_principal: '',
      sku: '',
    })
  }

  async function deletar(id: string) {
    if (confirm('Tem certeza?')) {
      await supabase.from('materiais').update({ ativo: false }).eq('id', id)
      carregar()
    }
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Materiais</h1>
        <button onClick={() => abrirModal()} className="btn-primary">
          + Novo Material
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Nome</th>
                <th className="border p-2 text-left">SKU</th>
                <th className="border p-2 text-center">Estoque</th>
                <th className="border p-2 text-center">Mín</th>
                <th className="border p-2 text-center">Máx</th>
                <th className="border p-2 text-right">Valor Unit.</th>
                <th className="border p-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="border p-2">
                    <div>
                      <p className="font-bold">{m.nome}</p>
                      <p className="text-xs text-gray-500">{m.descricao}</p>
                    </div>
                  </td>
                  <td className="border p-2 text-sm">{m.sku}</td>
                  <td className="border p-2 text-center font-bold">
                    {m.estoque_atual}
                  </td>
                  <td className="border p-2 text-center">{m.estoque_minimo}</td>
                  <td className="border p-2 text-center">{m.estoque_maximo}</td>
                  <td className="border p-2 text-right">
                    R$ {m.preco_unitario?.toFixed(2)}
                  </td>
                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() => abrirModal(m)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deletar(m.id)}
                      className="text-red-600 hover:underline"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editando ? 'Editar Material' : 'Novo Material'}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Categoria</label>
                <input
                  type="text"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  className="input-field"
                  placeholder="Ex: Ancoragem"
                />
              </div>
              <div>
                <label className="label">Unidade</label>
                <input
                  type="text"
                  value={form.unidade}
                  onChange={(e) =>
                    setForm({ ...form, unidade: e.target.value })
                  }
                  className="input-field"
                  placeholder="un, m, kg"
                />
              </div>
              <div>
                <label className="label">Preço Unitário</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.preco_unitario}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preco_unitario: parseFloat(e.target.value),
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Estoque Mínimo</label>
                <input
                  type="number"
                  value={form.estoque_minimo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estoque_minimo: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Estoque Máximo</label>
                <input
                  type="number"
                  value={form.estoque_maximo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estoque_maximo: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Fornecedor Principal</label>
                <select
                  value={form.fornecedor_principal}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fornecedor_principal: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  className="input-field"
                  rows={2}
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
