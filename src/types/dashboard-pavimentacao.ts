// Tipos para o Dashboard de Pavimentação

export interface ProgramacaoItem {
  id: string
  data: string
  horario: string
  endereco: string
  numero?: string
  bairro?: string
  cidade?: string
  cliente_nome?: string
  obra_nome?: string
  metragem_planejada?: number
  status: string
  tempo_restante?: string
}

export interface DashboardKPIs {
  programacao_hoje: number
  programacao_amanha: number
  faturamento_mes: number
  despesas_mes: number
  metragem_mes: number // m² pavimentados
  toneladas_mes: number // toneladas aplicadas
}

export interface ProximaProgramacao {
  id: string
  data: string
  horario: string
  endereco_completo: string
  cliente_nome?: string
  obra_nome?: string
  tempo_restante: string
  minutos_restantes: number
  espessura_media_solicitada?: number
}

export interface DashboardData {
  kpis: DashboardKPIs
  proxima_programacao: ProximaProgramacao | null
  programacoes_hoje: ProgramacaoItem[]
  programacoes_amanha: ProgramacaoItem[]
}



