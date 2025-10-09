/**
 * Types para Sistema de Diesel dos Maquinários
 */

export interface MaquinarioDiesel {
  id: string
  maquinario_id: string
  maquinario?: {
    id: string
    nome: string
  }
  obra_id?: string
  obra?: {
    id: string
    nome: string
  }
  quantidade_litros: number
  preco_por_litro: number
  valor_total: number
  data_abastecimento: string
  posto: string
  km_hodometro?: number
  observacoes?: string
  despesa_obra_id?: string
  created_at: string
  updated_at: string
}

export interface CreateDieselInput {
  maquinario_id: string
  obra_id?: string
  quantidade_litros: number
  preco_por_litro: number
  data_abastecimento: string
  posto: string
  km_hodometro?: number
  observacoes?: string
}

export interface UpdateDieselInput {
  obra_id?: string
  quantidade_litros?: number
  preco_por_litro?: number
  data_abastecimento?: string
  posto?: string
  km_hodometro?: number
  observacoes?: string
}

export interface DieselStats {
  total_litros: number
  total_gasto: number
  media_preco_litro: number
  consumo_medio?: number
  abastecimentos_count: number
}

export interface DieselFilters {
  data_inicio?: string
  data_fim?: string
  obra_id?: string
}


