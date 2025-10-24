// Tipos para Obras
export type ObraStatus = 'planejamento' | 'andamento' | 'concluida' | 'cancelada'
export type EmpresaResponsavel = 'WorldPav' | 'Pavin'
export type RuaStatus = 'planejada' | 'liberada' | 'em_andamento' | 'pavimentada' | 'concluida'
export type UnidadeCobranca = 'm2' | 'm3' | 'diaria' | 'servico'

// Importar tipos de serviços
import { ServicoObra, Servico } from './servicos'

export interface Rua {
  id: string
  obra_id: string
  nome_rua: string
  endereco_completo: string
  cep: string
  status: RuaStatus
  volume_previsto: number
  volume_realizado: number
  metragem_planejada?: number
  toneladas_previstas?: number
  imagem_trecho?: string // URL da imagem
  data_liberacao?: string
  data_inicio?: string
  data_conclusao?: string
  observacoes?: string
  created_at: string
}

export interface Obra {
  id: string
  nome: string
  descricao?: string
  cliente_id: string
  cliente_nome: string // Para facilitar exibição
  status: ObraStatus
  empresa_responsavel: EmpresaResponsavel
  
  // Dados da obra (região, não endereço específico)
  regiao: string // "Centro - Osasco"
  cidade: string
  estado: string
  
  // CNPJ específico da obra (pode ser diferente do cliente)
  cnpj_obra?: string
  razao_social_obra?: string
  
  // Unidade de cobrança
  unidade_cobranca: UnidadeCobranca
  
  // Volumes e valores (podem variar conforme unidade de cobrança)
  volume_total_previsto: number // m², m³, dias ou serviços total da obra
  volume_realizado: number // m², m³, dias ou serviços já aplicado
  valor_total_previsto: number
  valor_realizado: number
  valor_por_unidade: number // Valor por m², m³, dia ou serviço
  
  // Datas
  data_inicio_prevista: string
  data_inicio_real?: string
  data_conclusao_prevista: string
  data_conclusao_real?: string
  
  // Controle de ruas
  total_ruas: number // Total de ruas da obra
  ruas_liberadas: number // Ruas já liberadas pelo cliente
  ruas_pavimentadas: number // Ruas já pavimentadas
  
  // Ruas da obra
  ruas: Rua[]
  
  // Serviços da obra
  servicos: ServicoObra[]
  
  // Observações
  observacoes?: string
  company_id: string
  created_at: string
  updated_at: string
}

export interface ObraWithProgress extends Obra {
  progresso_percentual: number
  progresso_ruas_percentual: number
  dias_restantes?: number
  status_alertas: 'ok' | 'atraso' | 'atencao'
}

// Dados mock para demonstração
export const mockObras: Obra[] = [
  {
    id: '1',
    nome: 'Pavimentação Região Centro - Osasco',
    descricao: 'Pavimentação completa da região Centro de Osasco com aplicação de massa asfáltica',
    cliente_id: '1',
    cliente_nome: 'Prefeitura de Osasco',
    status: 'em_andamento',
    empresa_responsavel: 'WorldPav',
    regiao: 'Centro - Osasco',
    cidade: 'Osasco',
    estado: 'SP',
    cnpj_obra: '12.345.678/0001-90', // Mesmo CNPJ do cliente
    razao_social_obra: 'Prefeitura de Osasco',
    unidade_cobranca: 'm2',
    volume_total_previsto: 500, // 500 m²
    volume_realizado: 300, // 300 m²
    valor_total_previsto: 125000,
    valor_realizado: 75000,
    valor_por_unidade: 250, // R$ 250,00 por m²
    data_inicio_prevista: '2024-01-15',
    data_inicio_real: '2024-01-15',
    data_conclusao_prevista: '2024-02-15',
    total_ruas: 10,
    ruas_liberadas: 8,
    ruas_pavimentadas: 6,
    ruas: [
      {
        id: 'r1',
        obra_id: '1',
        nome_rua: 'Rua das Flores',
        endereco_completo: 'Rua das Flores, 100-200, Centro, Osasco/SP',
        cep: '06023-100',
        status: 'pavimentada',
        volume_previsto: 50,
        volume_realizado: 50,
        data_liberacao: '2024-01-15',
        data_inicio: '2024-01-16',
        data_conclusao: '2024-01-18',
        observacoes: 'Rua concluída dentro do prazo',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 'r2',
        obra_id: '1',
        nome_rua: 'Rua das Palmeiras',
        endereco_completo: 'Rua das Palmeiras, 50-150, Centro, Osasco/SP',
        cep: '06023-200',
        status: 'pavimentada',
        volume_previsto: 45,
        volume_realizado: 45,
        data_liberacao: '2024-01-15',
        data_inicio: '2024-01-19',
        data_conclusao: '2024-01-21',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 'r3',
        obra_id: '1',
        nome_rua: 'Rua da Liberdade',
        endereco_completo: 'Rua da Liberdade, 200-300, Centro, Osasco/SP',
        cep: '06023-300',
        status: 'em_andamento',
        volume_previsto: 60,
        volume_realizado: 30,
        data_liberacao: '2024-01-20',
        data_inicio: '2024-01-22',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 'r4',
        obra_id: '1',
        nome_rua: 'Rua das Margaridas',
        endereco_completo: 'Rua das Margaridas, 300-400, Centro, Osasco/SP',
        cep: '06023-400',
        status: 'liberada',
        volume_previsto: 55,
        volume_realizado: 0,
        data_liberacao: '2024-01-25',
        created_at: '2024-01-10T10:00:00Z'
      },
      {
        id: 'r5',
        obra_id: '1',
        nome_rua: 'Rua Nova Esperança',
        endereco_completo: 'Rua Nova Esperança, 400-500, Centro, Osasco/SP',
        cep: '06023-500',
        status: 'planejada',
        volume_previsto: 40,
        volume_realizado: 0,
        created_at: '2024-01-10T10:00:00Z'
      }
    ],
    servicos: [
      {
        id: 's1',
        obra_id: '1',
        servico_id: '1',
        servico_nome: 'Aplicação de Massa Asfáltica C.B.U.Q.',
        quantidade: 500,
        preco_unitario: 7.50,
        valor_total: 3750,
        unidade: 'm2',
        observacoes: 'Serviço incluído no contrato',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 's2',
        obra_id: '1',
        servico_id: '5',
        servico_nome: 'Mobilização',
        quantidade: 2,
        preco_unitario: 1500.00,
        valor_total: 3000,
        unidade: 'diaria',
        observacoes: 'Mobilização inicial e final',
        created_at: '2024-01-01T00:00:00Z'
      }
    ],
    observacoes: 'Cliente liberando ruas conforme cronograma',
    company_id: '1',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-25T15:30:00Z'
  },
  {
    id: '2',
    nome: 'Pavimentação Região Industrial - Osasco',
    descricao: 'Pavimentação da região Industrial de Osasco - Consórcio ABC/DEF',
    cliente_id: '2',
    cliente_nome: 'Construtora ABC Ltda',
    status: 'planejada',
    empresa_responsavel: 'Pavin',
    regiao: 'Industrial - Osasco',
    cidade: 'Osasco',
    estado: 'SP',
    cnpj_obra: '98.765.432/0001-10', // CNPJ específico do consórcio
    razao_social_obra: 'Consórcio ABC/DEF Pavimentação Ltda',
    unidade_cobranca: 'm3',
    volume_total_previsto: 800, // 800 m³
    volume_realizado: 0,
    valor_total_previsto: 200000,
    valor_realizado: 0,
    valor_por_unidade: 250, // R$ 250,00 por m³
    data_inicio_prevista: '2024-03-01',
    data_conclusao_prevista: '2024-03-30',
    total_ruas: 8,
    ruas_liberadas: 0,
    ruas_pavimentadas: 0,
    ruas: [
      {
        id: 'r6',
        obra_id: '2',
        nome_rua: 'Rua Industrial A',
        endereco_completo: 'Rua Industrial A, 100-300, Industrial, Osasco/SP',
        cep: '06080-100',
        status: 'planejada',
        volume_previsto: 100,
        volume_realizado: 0,
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        id: 'r7',
        obra_id: '2',
        nome_rua: 'Rua Industrial B',
        endereco_completo: 'Rua Industrial B, 200-400, Industrial, Osasco/SP',
        cep: '06080-200',
        status: 'planejada',
        volume_previsto: 120,
        volume_realizado: 0,
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        id: 'r8',
        obra_id: '2',
        nome_rua: 'Rua Industrial C',
        endereco_completo: 'Rua Industrial C, 300-500, Industrial, Osasco/SP',
        cep: '06080-300',
        status: 'planejada',
        volume_previsto: 80,
        volume_realizado: 0,
        created_at: '2024-02-01T10:00:00Z'
      }
    ],
    servicos: [
      {
        id: 's3',
        obra_id: '2',
        servico_id: '2',
        servico_nome: 'Aplicação de Binder',
        quantidade: 800,
        preco_unitario: 7.50,
        valor_total: 6000,
        unidade: 'm2',
        observacoes: 'Serviço principal da obra',
        created_at: '2024-02-01T00:00:00Z'
      },
      {
        id: 's4',
        obra_id: '2',
        servico_id: '5',
        servico_nome: 'Mobilização',
        quantidade: 3,
        preco_unitario: 1500.00,
        valor_total: 4500,
        unidade: 'diaria',
        observacoes: 'Mobilização para obra industrial',
        created_at: '2024-02-01T00:00:00Z'
      }
    ],
    observacoes: 'Aguardando liberação do cliente - Consórcio ABC/DEF',
    company_id: '1',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  },
  {
    id: '3',
    nome: 'Pavimentação Região Residencial - Guarulhos',
    descricao: 'Pavimentação completa da região residencial',
    cliente_id: '3',
    cliente_nome: 'Empresa XYZ',
    status: 'concluida',
    empresa_responsavel: 'WorldPav',
    regiao: 'Residencial - Guarulhos',
    cidade: 'Guarulhos',
    estado: 'SP',
    unidade_cobranca: 'diaria',
    volume_total_previsto: 20, // 20 dias
    volume_realizado: 20, // 20 dias
    valor_total_previsto: 45000,
    valor_realizado: 45000,
    valor_por_unidade: 2250, // R$ 2.250,00 por dia
    data_inicio_prevista: '2024-01-01',
    data_inicio_real: '2024-01-01',
    data_conclusao_prevista: '2024-01-20',
    data_conclusao_real: '2024-01-20',
    total_ruas: 3,
    ruas_liberadas: 3,
    ruas_pavimentadas: 3,
    ruas: [
      {
        id: 'r9',
        obra_id: '3',
        nome_rua: 'Rua Residencial A',
        endereco_completo: 'Rua Residencial A, 100-200, Residencial, Guarulhos/SP',
        cep: '07032-100',
        status: 'concluida',
        volume_previsto: 70,
        volume_realizado: 70,
        data_liberacao: '2024-01-01',
        data_inicio: '2024-01-01',
        data_conclusao: '2024-01-15',
        created_at: '2023-12-15T09:00:00Z'
      },
      {
        id: 'r10',
        obra_id: '3',
        nome_rua: 'Rua Residencial B',
        endereco_completo: 'Rua Residencial B, 200-300, Residencial, Guarulhos/SP',
        cep: '07032-200',
        status: 'concluida',
        volume_previsto: 65,
        volume_realizado: 65,
        data_liberacao: '2024-01-01',
        data_inicio: '2024-01-16',
        data_conclusao: '2024-01-20',
        created_at: '2023-12-15T09:00:00Z'
      },
      {
        id: 'r11',
        obra_id: '3',
        nome_rua: 'Rua Residencial C',
        endereco_completo: 'Rua Residencial C, 300-400, Residencial, Guarulhos/SP',
        cep: '07032-300',
        status: 'concluida',
        volume_previsto: 65,
        volume_realizado: 65,
        data_liberacao: '2024-01-01',
        data_inicio: '2024-01-10',
        data_conclusao: '2024-01-18',
        created_at: '2023-12-15T09:00:00Z'
      }
    ],
    servicos: [
      {
        id: 's5',
        obra_id: '3',
        servico_id: '1',
        servico_nome: 'Aplicação de Massa Asfáltica C.B.U.Q.',
        quantidade: 20,
        preco_unitario: 2250.00,
        valor_total: 45000,
        unidade: 'diaria',
        observacoes: 'Serviço por diária - obra concluída',
        created_at: '2023-12-15T00:00:00Z'
      }
    ],
    observacoes: 'Obra concluída dentro do prazo',
    company_id: '1',
    created_at: '2023-12-15T09:00:00Z',
    updated_at: '2024-01-20T17:00:00Z'
  },
  {
    id: '4',
    nome: 'Pavimentação Região Sul - Osasco',
    descricao: 'Pavimentação da região Sul de Osasco com aplicação de massa asfáltica',
    cliente_id: '1',
    cliente_nome: 'Prefeitura de Osasco',
    status: 'em_andamento',
    empresa_responsavel: 'WorldPav',
    regiao: 'Sul - Osasco',
    cidade: 'Osasco',
    estado: 'SP',
    unidade_cobranca: 'servico',
    volume_total_previsto: 10, // 10 serviços
    volume_realizado: 4, // 4 serviços
    valor_total_previsto: 95000,
    valor_realizado: 35000,
    valor_por_unidade: 9500, // R$ 9.500,00 por serviço
    data_inicio_prevista: '2024-01-20',
    data_inicio_real: '2024-01-22',
    data_conclusao_prevista: '2024-02-28',
    total_ruas: 7,
    ruas_liberadas: 4,
    ruas_pavimentadas: 2,
    ruas: [
      {
        id: 'r12',
        obra_id: '4',
        nome_rua: 'Rua Sul A',
        endereco_completo: 'Rua Sul A, 100-200, Sul, Osasco/SP',
        cep: '06025-100',
        status: 'pavimentada',
        volume_previsto: 60,
        volume_realizado: 60,
        data_liberacao: '2024-01-20',
        data_inicio: '2024-01-22',
        data_conclusao: '2024-01-25',
        created_at: '2024-01-18T11:00:00Z'
      },
      {
        id: 'r13',
        obra_id: '4',
        nome_rua: 'Rua Sul B',
        endereco_completo: 'Rua Sul B, 200-300, Sul, Osasco/SP',
        cep: '06025-200',
        status: 'pavimentada',
        volume_previsto: 55,
        volume_realizado: 55,
        data_liberacao: '2024-01-20',
        data_inicio: '2024-01-26',
        data_conclusao: '2024-01-28',
        created_at: '2024-01-18T11:00:00Z'
      },
      {
        id: 'r14',
        obra_id: '4',
        nome_rua: 'Rua Sul C',
        endereco_completo: 'Rua Sul C, 300-400, Sul, Osasco/SP',
        cep: '06025-300',
        status: 'em_andamento',
        volume_previsto: 70,
        volume_realizado: 35,
        data_liberacao: '2024-01-25',
        data_inicio: '2024-01-29',
        created_at: '2024-01-18T11:00:00Z'
      },
      {
        id: 'r15',
        obra_id: '4',
        nome_rua: 'Rua Sul D',
        endereco_completo: 'Rua Sul D, 400-500, Sul, Osasco/SP',
        cep: '06025-400',
        status: 'liberada',
        volume_previsto: 65,
        volume_realizado: 0,
        data_liberacao: '2024-01-30',
        created_at: '2024-01-18T11:00:00Z'
      }
    ],
    servicos: [
      {
        id: 's6',
        obra_id: '4',
        servico_id: '1',
        servico_nome: 'Aplicação de Massa Asfáltica C.B.U.Q.',
        quantidade: 10,
        preco_unitario: 9500.00,
        valor_total: 95000,
        unidade: 'servico',
        observacoes: 'Serviço por unidade - em andamento',
        created_at: '2024-01-18T00:00:00Z'
      }
    ],
    observacoes: 'Cliente liberando ruas gradualmente',
    company_id: '1',
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  }
]

// Funções utilitárias para formatação de unidades
export function getUnidadeLabel(unidade: UnidadeCobranca): string {
  switch (unidade) {
    case 'm2': return 'm²'
    case 'm3': return 'm³'
    case 'diaria': return 'dia(s)'
    case 'servico': return 'serviço(s)'
    default: return 'unidade(s)'
  }
}

export function formatVolume(volume: number, unidade: UnidadeCobranca): string {
  const label = getUnidadeLabel(unidade)
  
  switch (unidade) {
    case 'm2':
    case 'm3':
      return `${volume.toFixed(1)} ${label}`
    case 'diaria':
      return `${Math.round(volume)} ${label}`
    case 'servico':
      return `${Math.round(volume)} ${label}`
    default:
      return `${volume.toFixed(1)} ${label}`
  }
}

export function formatValorPorUnidade(valor: number, unidade: UnidadeCobranca): string {
  const label = getUnidadeLabel(unidade)
  
  switch (unidade) {
    case 'm2':
    case 'm3':
      return `R$ ${valor.toFixed(2)}/${label}`
    case 'diaria':
    case 'servico':
      return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/${label}`
    default:
      return `R$ ${valor.toFixed(2)}/${label}`
  }
}

// Função para calcular progresso e alertas
export function calculateObraProgress(obra: Obra): ObraWithProgress {
  const progresso_percentual = obra.volume_total_previsto > 0 
    ? Math.round((obra.volume_realizado / obra.volume_total_previsto) * 100)
    : 0

  const progresso_ruas_percentual = obra.total_ruas > 0
    ? Math.round((obra.ruas_pavimentadas / obra.total_ruas) * 100)
    : 0

  // Calcular dias restantes
  const hoje = new Date()
  const dataConclusao = new Date(obra.data_conclusao_prevista)
  const dias_restantes = Math.ceil((dataConclusao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  // Determinar status de alertas
  let status_alertas: 'ok' | 'atraso' | 'atencao' = 'ok'
  
  if (dias_restantes < 0) {
    status_alertas = 'atraso'
  } else if (dias_restantes <= 7 || (obra.ruas_liberadas < obra.total_ruas && obra.status === 'em_andamento')) {
    status_alertas = 'atencao'
  }

  return {
    ...obra,
    progresso_percentual,
    progresso_ruas_percentual,
    dias_restantes: dias_restantes > 0 ? dias_restantes : 0,
    status_alertas
  }
}

// Função para obter obras por cliente
export function getObrasByCliente(cliente_id: string): ObraWithProgress[] {
  return mockObras
    .filter(obra => obra.cliente_id === cliente_id)
    .map(calculateObraProgress)
}

// Função para obter todas as obras com progresso
export function getAllObrasWithProgress(): ObraWithProgress[] {
  return mockObras.map(calculateObraProgress)
}








