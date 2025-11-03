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

export interface MaiorRuaDia {
  rua_nome: string
  obra_nome: string
  metragem: number
  toneladas: number
  valor: number
  data_conclusao: string
}

export interface DiariaRecente {
  colaborador_nome: string
  equipe_nome: string
  data: string
  valor: number
  tem_hora_extra: boolean
}

export interface RuaFaturamento {
  rua_nome: string
  obra_nome: string
  cliente_nome: string
  valor_total: number
  metragem: number
  valor_por_m2: number
  data_conclusao: string
}

export interface MaquinarioUso {
  maquinario_nome: string
  tipo: string
  dias_uso_mes: number
  obras_utilizadas: number
}

export interface Alerta {
  tipo: 'manutencao' | 'documento' | 'conta' | 'licenca'
  mensagem: string
  urgencia: 'alta' | 'media' | 'baixa'
  quantidade: number
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
  // NOVOS KPIs
  maior_rua_dia: MaiorRuaDia | null
  ultimas_diarias: DiariaRecente[]
  top_ruas_faturamento: RuaFaturamento[]
  maquinarios_mais_usados: MaquinarioUso[]
  alertas: Alerta[]
}



