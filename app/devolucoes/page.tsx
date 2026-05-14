'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Devolucao, Material, Cliente } from '@/lib/types'

export default function DevolucoesPage() {
  const [devolucoes, setDevolucoes] = useState<Devolucao[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    material_id: '',
    cliente_id: '',
    quantidade: 0,
    observacoes: '',
  })

  async function carregar() {
    setLoading(true)
    const { data: dev } = await supabase
      .from('devolucoes')
      .select('*')
      .order('data_devolucao', { ascending: false })
      .limit(50)

    const { data: mat } = await supabase
      .from('materiais')
      .select('*')
      .eq('ativo', true)

    const { data: cli } = await supabase
      .from('clientes')
      .select('*')
      .eq('ativo', true)

    setDevolucoes(dev || [])
    setMateriais(mat || [])
    setClientes(cli || [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar() {
    if (!form.material_id || !form.cliente_id || form.quantidade <= 0) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const material = materiais.find((m) => m.id === form.material_id)
    if (!material) {
      alert('Material não encontrado')
      return
    }

    // Registrar devolução
    await supabase.from('devolucoes').insert([
      {
        material_id: form.material_id,
        cliente_id: form.cliente_id,
        quantidade: form.quantidade,
        observacoes: form.observacoes,
      },
    ])

    // Atualizar estoque do material (somar de volta)
    const novo_estoque = material.estoque_atual + form.quantidade
    await supabase
      .from('materiais')
      .update({ estoque_atual: novo_estoque })
      .eq('id', form.material_id)

    setModalOpen(false)
    setForm({
      material_id: '',
      cliente_id: '',
      quantidade: 0,
      observacoes: '',
    })
    carregar()
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">↩️ Devoluções de Material</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Nova Devolução
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="border p-2 text-left">Data</th>
                <th className="border p-2 text-left">Material</th>
                <th className="border p-2 text-left">Cliente/Obra</th>
                <th className="border p-2 text-center">Quantidade</th>
                <th className="border p-2 text-left">Observações</th>
              </tr>
            </thead>
            <tbody>
              {devolucoes.map((d) => {
                const mat = materiais.find((m) => m.id === d.material_id)
                const cli = clientes.find((c) => c.id === d.cliente_id)
                return (
                  <tr key={d.id} className="border-b hover:bg-blue-50">
                    <td className="border p-2 text-sm">
                      {new Date(d.data_devolucao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="border p-2">{mat?.nome}</td>
                    <td className="border p-2">{cli?.nome}</td>
                    <td className="border p-2 text-center font-bold">
                      {d.quantidade}
                    </td>
                    <td className="border p-2 text-sm">{d.observacoes}</td>
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
            <h2 className="text-xl font-bold mb-4">Nova Devolução de Material</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Cliente/Obra *</label>
                <select
                  value={form.cliente_id}
                  onChange={(e) =>
                    setForm({ ...form, cliente_id: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.os_eloca})
                    </option>
                  ))}
                </select>
              </div>
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
              <div></div>
              <div className="col-span-2">
                <label className="label">Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) =>
                    setForm({ ...form, observacoes: e.target.value })
                  }
                  className="input-field"
                  rows={2}
                  placeholder="Ex: Algumas peças danificadas, etc"
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
                Registrar Devolução
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
