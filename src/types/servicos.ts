// Tipos para Serviços
export type TipoServico = 
  | 'pavimentacao' 
  | 'imprimacao' 
  | 'impermeabilizante' 
  | 'mobilizacao' 
  | 'imobilizacao' 
  | 'outros'

export type UnidadeServico = 'm2' | 'm3' | 'ton' | 'diaria' | 'viagem' | 'servico'

export interface Servico {
  id: string
  nome: string
  descricao?: string
  tipo: TipoServico
  unidade_padrao: UnidadeServico
  preco_base?: number
  ativo: boolean
  created_at: string
}

export interface ServicoObra {
  id: string
  obra_id: string
  servico_id: string
  servico_nome: string
  quantidade: number
  preco_unitario: number
  valor_total: number
  unidade: UnidadeServico
  observacoes?: string
  created_at?: string
}

// Serviços disponíveis no sistema (mock data)
export const SERVICOS_DISPONIVEIS: Servico[] = [
  {
    id: '1',
    nome: 'Pavimentação CBUQ',
    descricao: 'Pavimentação com concreto betuminoso usinado a quente',
    tipo: 'pavimentacao',
    unidade_padrao: 'm2',
    preco_base: 45.00,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Recapeamento Asfáltico',
    descricao: 'Recapeamento de via existente',
    tipo: 'pavimentacao',
    unidade_padrao: 'm2',
    preco_base: 35.00,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    nome: 'Imprimação',
    descricao: 'Aplicação de emulsão asfáltica para impermeabilização',
    tipo: 'imprimacao',
    unidade_padrao: 'm2',
    preco_base: 8.50,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    nome: 'Pintura de Ligação',
    descricao: 'Aplicação de emulsão entre camadas',
    tipo: 'imprimacao',
    unidade_padrao: 'm2',
    preco_base: 6.00,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    nome: 'Impermeabilizante',
    descricao: 'Aplicação de produto impermeabilizante',
    tipo: 'impermeabilizante',
    unidade_padrao: 'm2',
    preco_base: 12.00,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    nome: 'Mobilização de Equipamentos',
    descricao: 'Transporte e mobilização de equipamentos para a obra',
    tipo: 'mobilizacao',
    unidade_padrao: 'servico',
    preco_base: 2500.00,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    nome: 'Imobilização de Equipamentos',
    descricao: 'Desmobilização e retorno de equipamentos',
    tipo: 'imobilizacao',
    unidade_padrao: 'servico',
    preco_base: 1500.00,
    ativo: true,
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    nome: 'Serviços Diversos',
    descricao: 'Outros serviços complementares',
    tipo: 'outros',
    unidade_padrao: 'servico',
    preco_base: 0,
    ativo: true,
    created_at: new Date().toISOString()
  }
]

/**
 * Retorna lista de serviços ativos
 */
export function getServicosAtivos(): Servico[] {
  return SERVICOS_DISPONIVEIS.filter(s => s.ativo)
}

/**
 * Retorna um serviço pelo ID
 */
export function getServicoById(id: string): Servico | undefined {
  return SERVICOS_DISPONIVEIS.find(s => s.id === id)
}

/**
 * Formata o preço de um serviço
 */
export function formatPrecoServico(preco: number, unidade: UnidadeServico): string {
  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(preco)

  const unidadeLabel = getUnidadeServicoLabel(unidade)
  return `${precoFormatado}/${unidadeLabel}`
}

/**
 * Retorna o label da unidade de serviço
 */
export function getUnidadeServicoLabel(unidade: UnidadeServico): string {
  const labels: Record<UnidadeServico, string> = {
    'm2': 'm²',
    'm3': 'm³',
    'ton': 'ton',
    'diaria': 'diária',
    'viagem': 'viagem',
    'servico': 'serviço'
  }
  return labels[unidade] || unidade
}

/**
 * Calcula o valor total de um serviço
 */
export function calcularValorServico(
  quantidade: number,
  precoUnitario: number
): number {
  return quantidade * precoUnitario
}

/**
 * Calcula o valor total de todos os serviços de uma obra
 */
export function calcularValorTotalServicos(servicos: ServicoObra[]): number {
  return servicos.reduce((total, servico) => total + servico.valor_total, 0)
}

/**
 * Retorna a cor do badge baseado no tipo de serviço
 */
export function getTipoServicoColor(tipo: TipoServico): string {
  const colors: Record<TipoServico, string> = {
    'pavimentacao': 'bg-blue-100 text-blue-800 border-blue-300',
    'imprimacao': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'impermeabilizante': 'bg-green-100 text-green-800 border-green-300',
    'mobilizacao': 'bg-purple-100 text-purple-800 border-purple-300',
    'imobilizacao': 'bg-orange-100 text-orange-800 border-orange-300',
    'outros': 'bg-gray-100 text-gray-800 border-gray-300'
  }
  return colors[tipo] || colors.outros
}

/**
 * Retorna o label do tipo de serviço
 */
export function getTipoServicoLabel(tipo: TipoServico): string {
  const labels: Record<TipoServico, string> = {
    'pavimentacao': 'Pavimentação',
    'imprimacao': 'Imprimação',
    'impermeabilizante': 'Impermeabilizante',
    'mobilizacao': 'Mobilização',
    'imobilizacao': 'Imobilização',
    'outros': 'Outros'
  }
  return labels[tipo] || tipo
}

/**
 * Valida se um serviço está completo
 */
export function validarServico(servico: Partial<ServicoObra>): boolean {
  return !!(
    servico.servico_id &&
    servico.servico_nome &&
    servico.quantidade &&
    servico.quantidade > 0 &&
    servico.preco_unitario !== undefined &&
    servico.preco_unitario >= 0 &&
    servico.valor_total !== undefined &&
    servico.valor_total >= 0 &&
    servico.unidade
  )
}

/**
 * Formata a quantidade com a unidade
 */
export function formatQuantidadeServico(quantidade: number, unidade: UnidadeServico): string {
  const quantidadeFormatada = quantidade.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
  const unidadeLabel = getUnidadeServicoLabel(unidade)
  return `${quantidadeFormatada} ${unidadeLabel}`
}

/**
 * Cria um serviço vazio para formulário
 */
export function criarServicoVazio(): Omit<ServicoObra, 'obra_id' | 'created_at'> {
  return {
    id: `temp_${Date.now()}`,
    servico_id: '',
    servico_nome: '',
    quantidade: 0,
    preco_unitario: 0,
    valor_total: 0,
    unidade: 'm2',
    observacoes: ''
  }
}

// Alias para compatibilidade com código existente
export const mockServicos = SERVICOS_DISPONIVEIS

