'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'

export default function ImportarMateriaisPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    sucesso: number
    erros: Array<{ linha: number; erro: string }>
  } | null>(null)

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResultado(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const dados = results.data as any[]
        const erros: Array<{ linha: number; erro: string }> = []
        let sucesso = 0

        for (let i = 0; i < dados.length; i++) {
          const linha = i + 2 // +2 porque começa em 1 e tem header

          try {
            const row = dados[i]

            // Validação obrigatória
            if (!row.nome || !row.nome.trim()) {
              erros.push({ linha, erro: 'Nome é obrigatório' })
              continue
            }

            // Preparar dados
            const material = {
              nome: row.nome.trim(),
              descricao: row.descricao?.trim() || null,
              categoria: row.categoria?.trim() || null,
              unidade: row.unidade?.trim() || null,
              estoque_minimo: parseInt(row.estoque_minimo) || 0,
              estoque_maximo: parseInt(row.estoque_maximo) || 0,
              estoque_atual: parseInt(row.estoque_atual) || 0,
              preco_unitario: parseFloat(row.preco_unitario) || 0,
              fornecedor_principal: row.fornecedor_principal?.trim() || null,
              sku: row.sku?.trim() || null,
              ativo: true,
            }

            // Inserir no banco
            const { error } = await supabase
              .from('materiais')
              .insert([material])

            if (error) {
              erros.push({ linha, erro: error.message })
            } else {
              sucesso++
            }
          } catch (err) {
            erros.push({
              linha,
              erro: err instanceof Error ? err.message : 'Erro desconhecido',
            })
          }
        }

        setResultado({ sucesso, erros })
        setLoading(false)
      },
      error: (error) => {
        setResultado({
          sucesso: 0,
          erros: [{ linha: 0, erro: `Erro ao ler arquivo: ${error.message}` }],
        })
        setLoading(false)
      },
    })
  }

  function downloadTemplate() {
    const template = `nome,descricao,categoria,unidade,estoque_minimo,estoque_maximo,estoque_atual,preco_unitario,fornecedor_principal,sku
Barra Roscada M12,Barra roscada métrica 12mm,Ancoragem,m,10,50,15,25.50,,BAR-M12-1M
Olho 5cm,Olho de ancoragem 5cm,Ancoragem,un,20,100,45,15.00,,OLH-5CM
Cinta de Ancoragem,Cinta de poliéster para ancoragem,Ancoragem,un,30,150,80,12.50,,CINTA-50MM
Pino de Segurança,Pino de segurança para equipamentos,Ancoragem,un,50,200,120,8.00,,PINO-SEG`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'template-materiais.csv')
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">📥 Importar Materiais</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-bold mb-2">Como funciona?</h2>
          <ol className="text-sm space-y-2 text-gray-700">
            <li>1. Baixe o template clicando no botão abaixo</li>
            <li>2. Preencha com seus materiais (as colunas obrigatórias são: <strong>nome</strong>)</li>
            <li>3. Salve o arquivo como CSV</li>
            <li>4. Clique em "Selecionar arquivo" e escolha seu CSV</li>
            <li>5. Pronto! Os materiais serão importados em lote</li>
          </ol>
        </div>

        <div className="space-y-4">
          <button
            onClick={downloadTemplate}
            className="w-full btn-primary text-left"
          >
            📋 Baixar Template CSV
          </button>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="btn-primary inline-block"
            >
              {loading ? '⏳ Processando...' : '📁 Selecionar Arquivo CSV'}
            </button>

            <p className="text-gray-500 text-sm mt-2">
              ou arraste o arquivo aqui
            </p>
          </div>
        </div>

        {resultado && (
          <div className="mt-6 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Resultado da Importação</h3>
              {resultado.erros.length === 0 && (
                <span className="text-green-600 text-sm">✅ Tudo certo!</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Importados com sucesso</p>
                <p className="text-3xl font-bold text-green-600">
                  {resultado.sucesso}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <p className="text-sm text-gray-600">Erros encontrados</p>
                <p className="text-3xl font-bold text-red-600">
                  {resultado.erros.length}
                </p>
              </div>
            </div>

            {resultado.erros.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h4 className="font-bold text-red-800 mb-2">Erros:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {resultado.erros.map((erro, i) => (
                    <div key={i} className="text-sm text-red-700">
                      <strong>Linha {erro.linha}:</strong> {erro.erro}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold mb-4">📝 Colunas do CSV</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                nome
              </span>
              <span className="text-red-600 font-bold ml-2">*obrigatório</span>
              <p className="text-gray-600 mt-1">
                Nome do material (ex: Barra Roscada M12)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                descricao
              </span>
              <p className="text-gray-600 mt-1">
                Descrição detalhada do material
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                categoria
              </span>
              <p className="text-gray-600 mt-1">
                Categoria (ex: Ancoragem, Estrutura Metálica, etc)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                unidade
              </span>
              <p className="text-gray-600 mt-1">
                Unidade de medida (ex: un, m, kg, m²)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                estoque_minimo
              </span>
              <p className="text-gray-600 mt-1">
                Quantidade mínima em estoque (número)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                estoque_maximo
              </span>
              <p className="text-gray-600 mt-1">
                Quantidade máxima em estoque (número)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                estoque_atual
              </span>
              <p className="text-gray-600 mt-1">
                Quantidade atual em estoque (número)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                preco_unitario
              </span>
              <p className="text-gray-600 mt-1">
                Preço unitário (ex: 25.50)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                fornecedor_principal
              </span>
              <p className="text-gray-600 mt-1">
                Nome do fornecedor principal (opcional)
              </p>
            </div>

            <div>
              <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                sku
              </span>
              <p className="text-gray-600 mt-1">
                Código SKU do material (ex: BAR-M12-1M)
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
