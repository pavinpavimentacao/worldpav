/**
 * Tipos TypeScript para o módulo de Contas a Pagar
 * Sistema WorldPav - Gestão de Asfalto
 */

import { Database } from '../../lib/supabase'

// ============================================
// TIPOS DO BANCO DE DADOS
// ============================================

export type ContaPagar = Database['public']['Tables']['contas_pagar']['Row']
export type ContaPagarInsert = Database['public']['Tables']['contas_pagar']['Insert']
export type ContaPagarUpdate = Database['public']['Tables']['contas_pagar']['Update']

// ============================================
// TIPOS DE STATUS
// ============================================

export type StatusContaPagar = 'Pendente' | 'Paga' | 'Atrasada' | 'Cancelada'

// ============================================
// TIPOS DE CATEGORIAS (SUGESTÕES)
// ============================================

export const CATEGORIAS_CONTA_PAGAR = [
  'Materiais',
  'Serviços',
  'Combustível',
  'Manutenção',
  'Ferramentas',
  'Equipamentos',
  'Aluguel',
  'Energia',
  'Água',
  'Telefonia',
  'Internet',
  'Seguros',
  'Impostos',
  'Salários',
  'Benefícios',
  'Transporte',
  'Alimentação',
  'Consultoria',
  'Software',
  'Outros',
] as const

export type CategoriaContaPagar = typeof CATEGORIAS_CONTA_PAGAR[number]

// ============================================
// TIPOS DE FORMAS DE PAGAMENTO
// ============================================

export const FORMAS_PAGAMENTO = [
  'Dinheiro',
  'PIX',
  'Transferência Bancária',
  'Boleto',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Cheque',
  'Outro',
] as const

export type FormaPagamento = typeof FORMAS_PAGAMENTO[number]

// ============================================
// INTERFACE PARA FORMULÁRIO
// ============================================

export interface ContaPagarFormData {
  numero_nota: string
  valor: number
  data_emissao: string
  data_vencimento: string
  status: StatusContaPagar
  fornecedor?: string
  descricao?: string
  categoria?: string
  data_pagamento?: string
  valor_pago?: number
  forma_pagamento?: string
  observacoes?: string
  anexo?: File | null
}

// ============================================
// INTERFACE PARA FILTROS
// ============================================

export interface ContaPagarFiltros {
  status?: StatusContaPagar[]
  fornecedor?: string
  categoria?: string
  data_inicio?: string
  data_fim?: string
  numero_nota?: string
}

// ============================================
// INTERFACE PARA ESTATÍSTICAS
// ============================================

export interface ContaPagarEstatisticas {
  total_contas: number
  total_pendente: number
  total_pago: number
  total_atrasado: number
  valor_total_pendente: number
  valor_total_pago: number
  valor_total_atrasado: number
  valor_total_geral: number
}

// ============================================
// INTERFACE PARA PAGAMENTO
// ============================================

export interface PagamentoContaData {
  data_pagamento: string
  valor_pago: number
  forma_pagamento: FormaPagamento
  observacoes?: string
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface ContaPagarComAnexo extends ContaPagar {
  anexo_presente: boolean
  dias_para_vencimento?: number
  status_vencimento?: 'em_dia' | 'proximo_vencimento' | 'vencido'
}

// ============================================
// CONSTANTES
// ============================================

export const STATUS_COLORS: Record<StatusContaPagar, { bg: string; text: string; badge: string }> = {
  Pendente: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  Paga: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  Atrasada: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  Cancelada: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
  },
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcula os dias restantes até o vencimento
 */
export function calcularDiasParaVencimento(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const vencimento = new Date(dataVencimento)
  vencimento.setHours(0, 0, 0, 0)
  
  const diffTime = vencimento.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Retorna o status de vencimento baseado na data
 */
export function obterStatusVencimento(dataVencimento: string, status: StatusContaPagar): 'em_dia' | 'proximo_vencimento' | 'vencido' {
  if (status === 'Paga' || status === 'Cancelada') {
    return 'em_dia'
  }
  
  const dias = calcularDiasParaVencimento(dataVencimento)
  
  if (dias < 0) {
    return 'vencido'
  } else if (dias <= 7) {
    return 'proximo_vencimento'
  } else {
    return 'em_dia'
  }
}

/**
 * Formata o número da nota fiscal
 */
export function formatarNumeroNota(numero: string): string {
  return numero.toUpperCase().trim()
}

/**
 * Valida se a data de vencimento é posterior à data de emissão
 */
export function validarDatas(dataEmissao: string, dataVencimento: string): boolean {
  const emissao = new Date(dataEmissao)
  const vencimento = new Date(dataVencimento)
  
  return vencimento >= emissao
}

