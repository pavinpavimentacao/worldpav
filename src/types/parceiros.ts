// Tipos de nichos de parceiros
export type NichoParceiro = 'usina_asfalto' | 'usina_rr2c' | 'empreiteiro'

// Tipos de faixa de asfalto
export type FaixaAsfalto = 'faixa_3' | 'faixa_4' | 'faixa_5' | 'binder' | 'sma'

// Labels para faixas de asfalto
export const faixaAsfaltoLabels: Record<FaixaAsfalto, string> = {
  faixa_3: 'Faixa 3 (Camada Final)',
  faixa_4: 'Faixa 4 (Ligação)',
  faixa_5: 'Faixa 5 (Estrutural)',
  binder: 'Binder (Reforço)',
  sma: 'SMA (Premium)'
}

// Descrições das faixas
export const faixaAsfaltoDescricoes: Record<FaixaAsfalto, string> = {
  faixa_3: 'Camada final - onde o pneu toca o asfalto. Asfalto mais "fechado" e bonito.',
  faixa_4: 'Camada de ligação - intermediária entre base e acabamento.',
  faixa_5: 'Camada estrutural - mais grossa, usada em rodovias e vias de alto tráfego.',
  binder: 'Camada de reforço - usada entre Faixa 4 e 5, quando há necessidade de reforço adicional.',
  sma: 'Camada premium - muito usada em aeroportos e pistas de tráfego pesado.'
}

// Preço por faixa de asfalto
export interface PrecoFaixa {
  faixa: FaixaAsfalto
  preco_tonelada: number
}

// Parceiro base
export interface Parceiro {
  id: string
  nome: string
  nicho: NichoParceiro
  contato?: string
  telefone?: string
  email?: string
  endereco?: string
  cnpj?: string
  ativo: boolean
  created_at: string
  updated_at: string
  // Campos específicos para usinas de asfalto
  precos_faixas?: PrecoFaixa[] // Preços por faixa (para usinas de asfalto)
  // Campos específicos para usinas de RR2C
  capacidade_tanque?: number // Capacidade do tanque em litros
  estoque_atual?: number // Estoque atual em litros
}

// Maquinário de parceiro terceiro
export interface ParceiroMaquinario {
  id: string
  parceiro_id: string
  nome: string
  tipo: string // Ex: Caminhão, Rolo, Escavadeira
  placa?: string
  valor_diaria: number
  ativo: boolean
  created_at: string
  updated_at: string
}

// Equipe de parceiro terceiro
export interface ParceiroEquipe {
  id: string
  parceiro_id: string
  nome: string
  quantidade_pessoas?: number
  valor_diaria: number
  especialidade?: string // Ex: Pavimentação, Sinalização
  ativo: boolean
  created_at: string
  updated_at: string
}

// Parceiro com maquinários e equipes (para formulários)
export interface ParceiroCompleto extends Parceiro {
  maquinarios?: ParceiroMaquinario[]
  equipes?: ParceiroEquipe[]
}

// Labels para nichos
export const nichoLabels: Record<NichoParceiro, string> = {
  usina_asfalto: 'Usina de Asfalto',
  usina_rr2c: 'Usina de RR2C',
  empreiteiro: 'Empreiteiro Parceiro'
}

// Labels para tipos de maquinário
export const tiposMaquinario = [
  'Caminhão',
  'Rolo Compactador',
  'Retroescavadeira',
  'Pá Carregadeira',
  'Motoniveladora',
  'Caminhão Pipa',
  'Caminhão Basculante',
  'Outros'
]

// Labels para especialidades de equipe
export const especialidadesEquipe = [
  'Pavimentação',
  'Sinalização',
  'Drenagem',
  'Terraplenagem',
  'Meio-Fio',
  'Calçada',
  'Geral'
]

