/**
 * Types para Sistema Financeiro de Obras
 */

export type RuaStatus = 'pendente' | 'em_andamento' | 'finalizada'
export type DespesaCategoria = 'diesel' | 'materiais' | 'manutencao' | 'outros'
export type NotaFiscalStatus = 'emitida' | 'enviada' | 'paga'

export interface ObraRua {
  id: string
  obra_id: string
  nome: string
  metragem_planejada?: number
  toneladas_previstas?: number
  imagem_trecho?: string // URL da imagem
  status: RuaStatus
  ordem: number
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ObraFaturamento {
  id: string
  obra_id: string
  rua_id: string
  rua?: ObraRua
  metragem_executada: number
  toneladas_utilizadas: number
  espessura_calculada: number
  preco_por_m2: number
  valor_total: number
  data_finalizacao: string
  nota_fiscal_id?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ObraDespesa {
  id: string
  obra_id: string
  categoria: DespesaCategoria
  descricao: string
  valor: number
  data_despesa: string
  maquinario_id?: string
  maquinario?: {
    id: string
    nome: string
  }
  fornecedor?: string
  comprovante_url?: string
  sincronizado_financeiro_principal: boolean
  financeiro_principal_id?: string
  created_at: string
  updated_at: string
}

export interface ObraResumoFinanceiro {
  total_faturado: number
  total_pendente: number
  total_despesas: number
  lucro_liquido: number
  despesas_por_categoria: Record<DespesaCategoria, number>
  faturamentos_por_mes?: Array<{
    mes: string
    valor: number
  }>
  despesas_por_mes?: Array<{
    mes: string
    valor: number
  }>
}

export interface CreateRuaInput {
  obra_id: string
  nome: string
  metragem_planejada?: number
  observacoes?: string
  ordem?: number
}

export interface UpdateRuaInput {
  nome?: string
  metragem_planejada?: number
  status?: RuaStatus
  observacoes?: string
  ordem?: number
}

export interface CreateFaturamentoInput {
  obra_id: string
  rua_id: string
  metragem_executada: number
  toneladas_utilizadas: number
  preco_por_m2: number
  data_finalizacao?: string
  observacoes?: string
}

export interface CreateDespesaInput {
  obra_id: string
  categoria: DespesaCategoria
  descricao: string
  valor: number
  data_despesa: string
  maquinario_id?: string
  fornecedor?: string
  comprovante_url?: string
  sincronizado_financeiro_principal?: boolean
}

export interface DespesaFilters {
  categoria?: DespesaCategoria
  data_inicio?: string
  data_fim?: string
  maquinario_id?: string
}

// ============================================
// Notas Fiscais e Medições
// ============================================

export interface ObraNotaFiscal {
  id: string
  obra_id: string
  numero_nota: string
  valor_nota: number
  vencimento: string
  desconto_inss: number
  desconto_iss: number
  outro_desconto: number
  valor_liquido: number
  status: NotaFiscalStatus
  data_pagamento?: string
  arquivo_nota_url?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ObraMedicao {
  id: string
  obra_id: string
  nota_fiscal_id?: string
  descricao: string
  arquivo_medicao_url: string
  data_medicao: string
  created_at: string
  updated_at: string
}

export interface CreateNotaFiscalInput {
  obra_id: string
  numero_nota: string
  valor_nota: number
  vencimento: string
  desconto_inss?: number
  desconto_iss?: number
  outro_desconto?: number
  arquivo_nota_url?: string
  observacoes?: string
}

export interface UpdateNotaFiscalInput {
  numero_nota?: string
  valor_nota?: number
  vencimento?: string
  desconto_inss?: number
  desconto_iss?: number
  outro_desconto?: number
  arquivo_nota_url?: string
  observacoes?: string
}

export interface CreateMedicaoInput {
  obra_id: string
  nota_fiscal_id?: string
  descricao: string
  arquivo_medicao_url: string
  data_medicao: string
}

export interface NotaFiscalFilters {
  status?: NotaFiscalStatus
  data_inicio?: string
  data_fim?: string
}


