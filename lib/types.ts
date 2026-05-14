export interface Fornecedor {
  id: string
  nome: string
  cnpj?: string
  contato?: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  materiais_principais?: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Material {
  id: string
  nome: string
  descricao?: string
  categoria?: string
  unidade?: string
  estoque_minimo: number
  estoque_maximo: number
  estoque_atual: number
  preco_unitario?: number
  fornecedor_principal?: string
  sku?: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Entrada {
  id: string
  material_id: string
  fornecedor_id: string
  quantidade: number
  preco_unitario?: number
  preco_total?: number
  data_entrada: string
  numero_nf?: string
  observacoes?: string
  criado_em: string
}

export interface Saida {
  id: string
  material_id: string
  quantidade: number
  obra_nome?: string
  cliente_nome?: string
  responsavel?: string
  data_saida: string
  observacoes?: string
  criado_em: string
}
