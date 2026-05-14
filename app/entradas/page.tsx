'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Entrada, Material, Fornecedor } from '@/lib/types'

export default function EntradassPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    material_id: '',
    fornecedor_id: '',
    quantidade: 0,
    preco_unitario: 0,
    numero_nf: '',
    observacoes: '',
  })

  async function carregar() {
    setLoading(true)
    const { data: ent } = await supabase
      .from('entradas')
      .select('*')
      .order('data_entrada', { ascending: false })
      .limit(50)

    const { data: mat } = await supabase
      .from('materiais')
      .select('*')
      .eq('ativo', true)

    const { data: forn } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('ativo', true)

    setEntradas(ent || [])
    setMateriais(mat || [])
    setFornecedores(forn || [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar() {
    if (!form.material_id || !form.fornecedor_id || form.quantidade <= 0) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const preco_total = form.quantidade * form.preco_unitario

    // Registrar entrada
    await supabase.from('entradas').insert([
      {
        material_id: form.material_id,
        fornecedor_id: form.fornecedor_id,
        quantidade: form.quantidade,
        preco_unitario: form.preco_unitario,
        preco_total: preco_total,
        numero_nf: form.numero_nf,
        observacoes: form.observacoes,
      },
    ])

    // Atualizar estoque do material
    const material = materiais.find((m) => m.id === form.material_id)
    if (material) {
      const novo_estoque = material.estoque_atual + form.quantidade
      await supabase
        .from('materiais')
        .update({ estoque_atual: novo_estoque })
        .eq('id', form.material_id)
    }

    setModalOpen(false)
    setForm({
      material_id: '',
      fornecedor_id: '',
      quantidade: 0,
      preco_unitario: 0,
      numero_nf: '',
      observacoes: '',
    })
    carregar()
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📥 Entradas de Material</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Nova Entrada
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Data</th>
                <th className="border p-2 text-left">Material</th>
                <th className="border p-2 text-left">Fornecedor</th>
                <th className="border p-2 text-center">Quantidade</th>
                <th className="border p-2 text-right">Valor Unit.</th>
                <th className="border p-2 text-right">Total</th>
                <th className="border p-2 text-left">NF</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((e) => {
                const mat = materiais.find((m) => m.id === e.material_id)
                const forn = fornecedores.find((f) => f.id === e.fornecedor_id)
                return (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="border p-2 text-sm">
                      {new Date(e.data_entrada).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="border p-2">{mat?.nome}</td>
                    <td className="border p-2">{forn?.nome}</td>
                    <td className="border p-2 text-center">{e.quantidade}</td>
                    <td className="border p-2 text-right">
                      R$ {e.preco_unitario?.toFixed(2)}
                    </td>
                    <td className="border p-2 text-right font-bold">
                      R$ {e.preco_total?.toFixed(2)}
                    </td>
                    <td className="border p-2 text-sm">{e.numero_nf}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nova Entrada de Material</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Material *</label>
                <select
                  value={form.material_id}
                  onChange={(e) =>
                    setForm({ ...form, material_id: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Selecione...</option>
                  {materiais.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Fornecedor *</label>
                <select
                  value={form.fornecedor_id}
                  onChange={(e) =>
                    setForm({ ...form, fornecedor_id: e.target.value })
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
              <div>
                <label className="label">Quantidade *</label>
                <input
                  type="number"
                  value={form.quantidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantidade: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
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
              <div className="col-span-2">
                <label className="label">Número NF</label>
                <input
                  type="text"
                  value={form.numero_nf}
                  onChange={(e) =>
                    setForm({ ...form, numero_nf: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div className="col-span-2">
                <label className="label">Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm({ ...form, observacoes: e.target.value })
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
                Registrar Entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
