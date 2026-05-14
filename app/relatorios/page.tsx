'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Material, Entrada, Saida } from '@/lib/types'

export default function RelatoriosPage() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [saidas, setSaidas] = useState<Saida[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'critico' | 'entrada' | 'saida'>('critico')
  const [categoria, setCategoria] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  async function carregar() {
    setLoading(true)

    const { data: mat } = await supabase
      .from('materiais')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    const { data: ent } = await supabase
      .from('entradas')
      .select('*')
      .order('data_entrada', { ascending: false })

    const { data: said } = await supabase
      .from('saidas')
      .select('*')
      .order('data_saida', { ascending: false })

    setMateriais(mat || [])
    setEntradas(ent || [])
    setSaidas(said || [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  // Relatório: Estoque Crítico
  const materiaisCriticos = materiais.filter((m) => {
    const percentualEstoque =
      (m.estoque_atual / m.estoque_minimo) * 100 || 0
    return percentualEstoque <= 100 && m.estoque_minimo > 0
  })

  // Relatório: Filtrar entradas por período e categoria
  const entradasFiltradas = entradas.filter((e) => {
    let passa = true

    if (categoria) {
      const mat = materiais.find((m) => m.id === e.material_id)
      passa = passa && mat?.categoria?.toLowerCase().includes(categoria.toLowerCase())
    }

    if (dataInicio) {
      passa = passa && new Date(e.data_entrada) >= new Date(dataInicio)
    }

    if (dataFim) {
      passa = passa && new Date(e.data_entrada) <= new Date(dataFim)
    }

    return passa
  })

  // Relatório: Filtrar saídas por período e categoria
  const saidasFiltradas = saidas.filter((s) => {
    let passa = true

    if (categoria) {
      const mat = materiais.find((m) => m.id === s.material_id)
      passa = passa && mat?.categoria?.toLowerCase().includes(categoria.toLowerCase())
    }

    if (dataInicio) {
      passa = passa && new Date(s.data_saida) >= new Date(dataInicio)
    }

    if (dataFim) {
      passa = passa && new Date(s.data_saida) <= new Date(dataFim)
    }

    return passa
  })

  // Função para exportar CSV
  function exportarCSV(dados: any[], nome: string) {
    const csv = [
      Object.keys(dados[0] || {}).join(','),
      ...dados.map((d) => Object.values(d).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nome}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) return <main className="p-6">Carregando...</main>

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Relatórios</h1>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setTab('critico')}
          className={`px-4 py-2 font-medium ${
            tab === 'critico'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Estoque Crítico
        </button>
        <button
          onClick={() => setTab('entrada')}
          className={`px-4 py-2 font-medium ${
            tab === 'entrada'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Entradas
        </button>
        <button
          onClick={() => setTab('saida')}
          className={`px-4 py-2 font-medium ${
            tab === 'saida'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Saídas
        </button>
      </div>

      {/* RELATÓRIO ESTOQUE CRÍTICO */}
      {tab === 'critico' && (
        <div>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="text-xl font-bold mb-2">⚠️ Materiais com Estoque Crítico</h2>
            <p className="text-gray-600">
              Estes materiais estão com estoque em nível crítico ou abaixo do mínimo
            </p>
          </div>

          {materiaisCriticos.length === 0 ? (
            <p className="text-gray-500">Nenhum material em nível crítico</p>
          ) : (
            <>
              <button
                onClick={() =>
                  exportarCSV(
                    materiaisCriticos.map((m) => ({
                      Material: m.nome,
                      Estoque_Atual: m.estoque_atual,
                      Estoque_Minimo: m.estoque_minimo,
                      Necessario_Comprar:
                        m.estoque_minimo - m.estoque_atual,
                      Categoria: m.categoria,
                    })),
                    'estoque-critico'
                  )
                }
                className="btn-primary mb-4"
              >
                📥 Exportar CSV
              </button>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-red-100">
                      <th className="border p-3 text-left">Material</th>
                      <th className="border p-3 text-center">Estoque Atual</th>
                      <th className="border p-3 text-center">Mínimo</th>
                      <th className="border p-3 text-center">Máximo</th>
                      <th className="border p-3 text-center text-red-600 font-bold">
                        Necessário Comprar
                      </th>
                      <th className="border p-3 text-left">Categoria</th>
                      <th className="border p-3 text-right">Valor Unit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiaisCriticos.map((m) => {
                      const necessario = m.estoque_minimo - m.estoque_atual
                      const valor_compra = necessario * (m.preco_unitario || 0)
                      return (
                        <tr key={m.id} className="border-b hover:bg-red-50">
                          <td className="border p-3">
                            <div>
                              <p className="font-bold">{m.nome}</p>
                              <p className="text-xs text-gray-500">{m.sku}</p>
                            </div>
                          </td>
                          <td className="border p-3 text-center">{m.estoque_atual}</td>
                          <td className="border p-3 text-center">{m.estoque_minimo}</td>
                          <td className="border p-3 text-center">{m.estoque_maximo}</td>
                          <td className="border p-3 text-center font-bold text-red-600">
                            {necessario} {m.unidade}
                          </td>
                          <td className="border p-3">{m.categoria}</td>
                          <td className="border p-3 text-right">
                            R$ {valor_compra.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h3 className="font-bold mb-2">Resumo de Compras Necessárias:</h3>
                <p className="text-lg font-bold text-blue-600">
                  Valor total para repor estoque:{' '}
                  <span className="text-2xl">
                    R${' '}
                    {materiaisCriticos
                      .reduce(
                        (total, m) =>
                          total + (m.estoque_minimo - m.estoque_atual) * (m.preco_unitario || 0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* RELATÓRIO ENTRADAS */}
      {tab === 'entrada' && (
        <div>
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label">Categoria (ex: Ancoragem)</label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="input-field"
                  placeholder="Digite a categoria..."
                />
              </div>
              <div className="flex-1">
                <label className="label">De</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex-1">
                <label className="label">Até</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={() =>
                exportarCSV(
                  entradasFiltradas.map((e) => {
                    const mat = materiais.find((m) => m.id === e.material_id)
                    return {
                      Data: new Date(e.data_entrada).toLocaleDateString('pt-BR'),
                      Material: mat?.nome,
                      Quantidade: e.quantidade,
                      Valor_Unit: e.preco_unitario,
                      Total: e.preco_total,
                      NF: e.numero_nf,
                    }
                  }),
                  'entradas'
                )
              }
              className="btn-primary"
            >
              📥 Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-100">
                  <th className="border p-3 text-left">Data</th>
                  <th className="border p-3 text-left">Material</th>
                  <th className="border p-3 text-center">Qtd</th>
                  <th className="border p-3 text-right">Valor Unit.</th>
                  <th className="border p-3 text-right">Total</th>
                  <th className="border p-3 text-left">NF</th>
                </tr>
              </thead>
              <tbody>
                {entradasFiltradas.map((e) => {
                  const mat = materiais.find((m) => m.id === e.material_id)
                  return (
                    <tr key={e.id} className="border-b hover:bg-green-50">
                      <td className="border p-3">
                        {new Date(e.data_entrada).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="border p-3">{mat?.nome}</td>
                      <td className="border p-3 text-center">{e.quantidade}</td>
                      <td className="border p-3 text-right">
                        R$ {e.preco_unitario?.toFixed(2)}
                      </td>
                      <td className="border p-3 text-right font-bold">
                        R$ {e.preco_total?.toFixed(2)}
                      </td>
                      <td className="border p-3">{e.numero_nf}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {entradasFiltradas.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded">
              <p className="font-bold">
                Total de Entradas:{' '}
                <span className="text-lg text-green-600">
                  R${' '}
                  {entradasFiltradas
                    .reduce((total, e) => total + (e.preco_total || 0), 0)
                    .toFixed(2)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* RELATÓRIO SAÍDAS */}
      {tab === 'saida' && (
        <div>
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="label">Categoria (ex: Ancoragem)</label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="input-field"
                  placeholder="Digite a categoria..."
                />
              </div>
              <div className="flex-1">
                <label className="label">De</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex-1">
                <label className="label">Até</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={() =>
                exportarCSV(
                  saidasFiltradas.map((s) => {
                    const mat = materiais.find((m) => m.id === s.material_id)
                    return {
                      Data: new Date(s.data_saida).toLocaleDateString('pt-BR'),
                      Material: mat?.nome,
                      Quantidade: s.quantidade,
                      Obra: s.obra_nome,
                      Cliente: s.cliente_nome,
                      Responsavel: s.responsavel,
                    }
                  }),
                  'saidas'
                )
              }
              className="btn-primary"
            >
              📥 Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-orange-100">
                  <th className="border p-3 text-left">Data</th>
                  <th className="border p-3 text-left">Material</th>
                  <th className="border p-3 text-center">Qtd</th>
                  <th className="border p-3 text-left">Obra</th>
                  <th className="border p-3 text-left">Cliente</th>
                  <th className="border p-3 text-left">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {saidasFiltradas.map((s) => {
                  const mat = materiais.find((m) => m.id === s.material_id)
                  return (
                    <tr key={s.id} className="border-b hover:bg-orange-50">
                      <td className="border p-3">
                        {new Date(s.data_saida).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="border p-3">{mat?.nome}</td>
                      <td className="border p-3 text-center font-bold">
                        {s.quantidade}
                      </td>
                      <td className="border p-3">{s.obra_nome}</td>
                      <td className="border p-3">{s.cliente_nome}</td>
                      <td className="border p-3">{s.responsavel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {saidasFiltradas.length > 0 && (
            <div className="mt-6 p-4 bg-orange-50 rounded">
              <p className="font-bold">
                Total de Saídas:{' '}
                <span className="text-lg text-orange-600">
                  {saidasFiltradas.reduce((total, s) => total + s.quantidade, 0)} unidades
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
