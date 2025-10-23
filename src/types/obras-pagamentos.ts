// =====================================================
// TYPES: Pagamentos Diretos (PIX, Transferência, etc.)
// =====================================================

export type FormaPagamento = 'pix' | 'transferencia' | 'dinheiro' | 'cheque' | 'outro'

export interface ObraPagamentoDireto {
  id: string
  obra_id: string
  descricao: string
  valor: number
  data_pagamento: string
  forma_pagamento: FormaPagamento
  comprovante_url?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface CreatePagamentoDiretoInput {
  obra_id: string
  descricao: string
  valor: number
  data_pagamento: string
  forma_pagamento: FormaPagamento
  comprovante_url?: string
  observacoes?: string
}

export interface UpdatePagamentoDiretoInput {
  descricao?: string
  valor?: number
  data_pagamento?: string
  forma_pagamento?: FormaPagamento
  comprovante_url?: string
  observacoes?: string
}

export interface PagamentoDiretoFilters {
  obra_id?: string
  forma_pagamento?: FormaPagamento
  data_inicio?: string
  data_fim?: string
  valor_min?: number
  valor_max?: number
}

// =====================================================
// TYPES: Resumo Financeiro Consolidado
// =====================================================

export interface ResumoFinanceiroObra {
  obra_id: string
  obra_nome: string
  
  // Faturamento por Notas Fiscais
  faturamento_notas_fiscais: {
    total_emitido: number
    total_pago: number
    total_pendente: number
    total_vencido: number
  }
  
  // Pagamentos Diretos
  pagamentos_diretos: {
    total_pago: number
    quantidade: number
  }
  
  // Resumo Geral
  faturamento_total: number
  total_recebido: number
  total_a_receber: number
}

// =====================================================
// TYPES: KPIs de Recebimentos
// =====================================================

export interface RecebimentosKPIs {
  // Notas Fiscais
  total_notas_fiscais: number
  total_notas_pagas: number
  total_notas_pendentes: number
  total_notas_vencidas: number
  
  // Pagamentos Diretos
  total_pagamentos_diretos: number
  total_pix: number
  total_transferencias: number
  total_dinheiro: number
  
  // Valores
  faturamento_bruto: number
  recebido_notas_fiscais: number
  recebido_pagamentos_diretos: number
  total_recebido: number
  total_a_receber: number
}





