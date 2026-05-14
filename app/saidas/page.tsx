'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Saida, Material } from '@/lib/types'

export default function SaidasPage() {
  const [saidas, setSaidas] = useState<Saida[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    material_id: '',
    quantidade: 0,
    obra_nome: '',
    cliente_nome: '',
    responsavel: '',
    observacoes: '',
  })

  async function carregar() {
    setLoading(true)
    const { data: said } = await supabase
      .from('saidas')
      .select('*')
      .order('data_saida', { ascending: false })
      .limit(50)

    const { data: mat } = await supabase
      .from('materiais')
      .select('*')
      .eq('ativo', true)

    setSaidas(said || [])
    setMateriais(mat || [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar() {
    if (!form.material_id || form.quantidade <= 0) {
      alert('Preencha Material e Quantidade')
      return
    }

    const material = materiais.find((m) => m.id === form.material_id)
    if (!material || material.estoque_atual < form.quantidade) {
      alert('Estoque insuficiente')
      return
    }

    // Registrar saída
    await supabase.from('saidas').insert([
      {
        material_id: form.material_id,
        quantidade: form.quantidade,
        obra_nome: form.obra_nome,
        cliente_nome: form.cliente_nome,
        responsavel: form.responsavel,
        observacoes: form.observacoes,
      },
    ])

    // Atualizar estoque
    const novo_estoque = material.estoque_atual - form.quantidade
    await supabase
      .from('materiais')
      .update({ estoque_atual: novo_estoque })
      .eq('id', form.material_id)

    setModalOpen(false)
    setForm({
      material_id: '',
      quantidade: 0,
      obra_nome: '',
      cliente_nome: '',
      responsavel: '',
      observacoes: '',
    })
    carregar()
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📤 Saídas de Material</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + Nova Saída
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
                <th className="border p-2 text-center">Quantidade</th>
                <th className="border p-2 text-left">Obra</th>
                <th className="border p-2 text-left">Cliente</th>
                <th className="border p-2 text-left">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {saidas.map((s) => {
                const mat = materiais.find((m) => m.id === s.material_id)
                return (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="border p-2 text-sm">
                      {new Date(s.data_saida).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="border p-2">{mat?.nome}</td>
                    <td className="border p-2 text-center font-bold">
                      {s.quantidade}
                    </td>
                    <td className="border p-2">{s.obra_nome}</td>
                    <td className="border p-2">{s.cliente_nome}</td>
                    <td className="border p-2">{s.responsavel}</td>
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
            <h2 className="text-xl font-bold mb-4">Nova Saída de Material</h2>

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
                      {m.nome} (Est: {m.estoque_atual})
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
              <div className="col-span-2">
                <label className="label">Obra/Projeto</label>
                <input
                  type="text"
                  value={form.obra_nome}
                  onChange={(e) =>
                    setForm({ ...form, obra_nome: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Cliente</label>
                <input
                  type="text"
                  value={form.cliente_nome}
                  onChange={(e) =>
                    setForm({ ...form, cliente_nome: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Responsável</label>
                <input
                  type="text"
                  value={form.responsavel}
                  onChange={(e) =>
                    setForm({ ...form, responsavel: e.target.value })
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
                Registrar Saída
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
