import { FaixaAsfalto } from './parceiros'

// Relatório Diário
export interface RelatorioDiario {
  id: string
  numero: string // RD-YYYY-001
  
  // Relacionamentos
  cliente_id: string
  cliente_nome?: string
  obra_id: string
  obra_nome?: string
  rua_id: string
  rua_nome?: string
  equipe_id?: string
  equipe_nome?: string
  equipe_is_terceira: boolean
  
  // Datas e horários
  data_inicio: string // YYYY-MM-DD
  data_fim?: string // YYYY-MM-DD
  horario_inicio: string // HH:MM
  
  // Metragem e toneladas
  metragem_feita: number
  toneladas_aplicadas: number
  espessura_calculada: number
  faixa_utilizada?: FaixaAsfalto // Tipo de faixa de asfalto utilizada
  
  // Observações
  observacoes?: string
  
  // Status
  status: 'finalizado'
  
  // Auditoria
  created_by?: string
  created_at: string
  updated_at: string
}

// Maquinário vinculado ao relatório
export interface RelatorioDiarioMaquinario {
  id: string
  relatorio_id: string
  maquinario_id: string
  maquinario_nome?: string
  is_terceiro: boolean
  parceiro_id?: string
  parceiro_nome?: string
  created_at: string
}

// Relatório completo (com maquinários)
export interface RelatorioDiarioCompleto extends RelatorioDiario {
  maquinarios: RelatorioDiarioMaquinario[]
}

// Dados para criar relatório
export interface CreateRelatorioDiarioData {
  cliente_id: string
  obra_id: string
  rua_id: string
  equipe_id?: string
  equipe_is_terceira?: boolean
  data_inicio: string
  data_fim?: string
  horario_inicio: string
  metragem_feita: number
  toneladas_aplicadas: number
  observacoes?: string
  maquinarios: {
    id: string
    is_terceiro: boolean
    parceiro_id?: string
  }[]
}

// Maquinário selecionável (próprio ou terceiro)
export interface MaquinarioSelecionavel {
  id: string
  nome: string
  tipo?: string
  placa?: string
  is_terceiro: boolean
  parceiro_id?: string
  parceiro_nome?: string
  valor_diaria?: number
}

// Equipe selecionável (própria ou terceira)
export interface EquipeSelecionavel {
  id: string
  nome: string
  is_terceira: boolean
  parceiro_id?: string
  parceiro_nome?: string
  quantidade_pessoas?: number
  especialidade?: string
  valor_diaria?: number
}

