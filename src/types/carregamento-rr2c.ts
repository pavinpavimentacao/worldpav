// Tipos para controle de estoque de RR2C

export interface CarregamentoRR2C {
  id: string
  parceiro_id: string
  data_carregamento: string
  quantidade_kg: number
  valor_total: number
  numero_nota_fiscal?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ConsumoRR2C {
  id: string
  parceiro_id: string
  obra_id?: string
  obra_nome?: string
  rua_nome?: string
  data_consumo: string
  metragem_aplicada: number
  quantidade_consumida: number // em kg
  created_at: string
}

export interface EstoqueRR2C {
  parceiro_id: string
  parceiro_nome: string
  total_carregado: number // kg
  total_consumido: number // kg
  estoque_atual: number // kg
  ultimo_carregamento?: CarregamentoRR2C
}

// Cálculo padrão: 1 kg de RR2C para cada 1 m²
export const CONSUMO_RR2C_POR_M2 = 1 // 1 kg por m²

export function calcularConsumoRR2C(metragem: number): number {
  return metragem * CONSUMO_RR2C_POR_M2
}

