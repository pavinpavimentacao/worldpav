import {
  RelatorioDiario,
  RelatorioDiarioCompleto,
  RelatorioDiarioMaquinario,
  CreateRelatorioDiarioData
} from '../types/relatorios-diarios'
import { calcularEspessura, gerarNumeroRelatorio } from '../utils/relatorios-diarios-utils'

// Flag para usar mockups
const USE_MOCK = true

// ========== MOCKUPS ==========

const mockRelatorios: RelatorioDiario[] = [
  {
    id: 'rd-1',
    numero: 'RD-2024-001',
    cliente_id: 'cli-1',
    cliente_nome: 'Prefeitura de Osasco',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    rua_id: 'rua-1',
    rua_nome: 'Rua das Flores - Trecho 1',
    equipe_id: 'eq-1',
    equipe_nome: 'Equipe Alpha',
    equipe_is_terceira: false,
    data_inicio: '2024-02-15',
    data_fim: '2024-02-15',
    horario_inicio: '07:00',
    metragem_feita: 450,
    toneladas_aplicadas: 27, // 2.5 cm de espessura
    espessura_calculada: 2.5,
    faixa_utilizada: 'faixa_3',
    observacoes: 'Trabalho realizado sem intercorrências. Clima favorável. Camada final (Faixa 3).',
    status: 'finalizado',
    created_at: '2024-02-15T18:30:00',
    updated_at: '2024-02-15T18:30:00'
  },
  {
    id: 'rd-2',
    numero: 'RD-2024-002',
    cliente_id: 'cli-1',
    cliente_nome: 'Prefeitura de Osasco',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    rua_id: 'rua-2',
    rua_nome: 'Rua das Flores - Trecho 2',
    equipe_id: 'eq-parc-1',
    equipe_nome: 'Equipe Pavimentação Alpha (Pav Solutions)',
    equipe_is_terceira: true,
    data_inicio: '2024-02-16',
    data_fim: '2024-02-16',
    horario_inicio: '07:30',
    metragem_feita: 520,
    toneladas_aplicadas: 43.68, // 3.5 cm de espessura (média)
    espessura_calculada: 3.5,
    faixa_utilizada: 'faixa_4',
    observacoes: 'Utilizados maquinários terceiros. Equipe terceira realizou excelente trabalho. Camada de ligação (Faixa 4).',
    status: 'finalizado',
    created_at: '2024-02-16T19:00:00',
    updated_at: '2024-02-16T19:00:00'
  },
  {
    id: 'rd-3',
    numero: 'RD-2024-003',
    cliente_id: 'cli-2',
    cliente_nome: 'Construtora ABC',
    obra_id: '2',
    obra_nome: 'Avenida Central - Barueri',
    rua_id: 'rua-3',
    rua_nome: 'Avenida Central - Quadra A',
    equipe_id: 'eq-2',
    equipe_nome: 'Equipe Beta',
    equipe_is_terceira: false,
    data_inicio: '2024-02-20',
    data_fim: '2024-02-20',
    horario_inicio: '06:30',
    metragem_feita: 680,
    toneladas_aplicadas: 73.44, // 4.5 cm de espessura
    espessura_calculada: 4.5,
    faixa_utilizada: 'faixa_5',
    observacoes: 'Excelente produtividade da equipe. Camada estrutural (Faixa 5) para alto tráfego.',
    status: 'finalizado',
    created_at: '2024-02-20T17:45:00',
    updated_at: '2024-02-20T17:45:00'
  }
]

const mockRelatoriosMaquinarios: RelatorioDiarioMaquinario[] = [
  {
    id: 'rdm-1',
    relatorio_id: 'rd-1',
    maquinario_id: 'maq-1',
    maquinario_nome: 'Caminhão Munck MB 2726',
    is_terceiro: false,
    created_at: '2024-02-15T18:30:00'
  },
  {
    id: 'rdm-2',
    relatorio_id: 'rd-1',
    maquinario_id: 'maq-2',
    maquinario_nome: 'Rolo Compactador Dynapac',
    is_terceiro: false,
    created_at: '2024-02-15T18:30:00'
  },
  {
    id: 'rdm-3',
    relatorio_id: 'rd-2',
    maquinario_id: 'maq-parc-1',
    maquinario_nome: 'Caminhão Basculante Mercedes 2726',
    is_terceiro: true,
    parceiro_id: 'parc-3',
    parceiro_nome: 'Empreiteira Pav Solutions',
    created_at: '2024-02-16T19:00:00'
  },
  {
    id: 'rdm-4',
    relatorio_id: 'rd-2',
    maquinario_id: 'maq-parc-2',
    maquinario_nome: 'Rolo Compactador Dynapac CA25',
    is_terceiro: true,
    parceiro_id: 'parc-3',
    parceiro_nome: 'Empreiteira Pav Solutions',
    created_at: '2024-02-16T19:00:00'
  },
  {
    id: 'rdm-5',
    relatorio_id: 'rd-3',
    maquinario_id: 'maq-3',
    maquinario_nome: 'Pá Carregadeira CAT',
    is_terceiro: false,
    created_at: '2024-02-20T17:45:00'
  }
]

// ========== FUNÇÕES API ==========

/**
 * Busca todos os relatórios diários
 */
export async function getRelatoriosDiarios(filtros?: {
  cliente_id?: string
  obra_id?: string
  data_inicio?: string
  data_fim?: string
}): Promise<RelatorioDiario[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let resultado = [...mockRelatorios]
    
    if (filtros?.cliente_id) {
      resultado = resultado.filter(r => r.cliente_id === filtros.cliente_id)
    }
    
    if (filtros?.obra_id) {
      resultado = resultado.filter(r => r.obra_id === filtros.obra_id)
    }
    
    if (filtros?.data_inicio) {
      resultado = resultado.filter(r => r.data_inicio >= filtros.data_inicio!)
    }
    
    if (filtros?.data_fim) {
      resultado = resultado.filter(r => r.data_inicio <= filtros.data_fim!)
    }
    
    return resultado.sort((a, b) => b.data_inicio.localeCompare(a.data_inicio))
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Busca relatório por ID (completo com maquinários)
 */
export async function getRelatorioDiarioById(id: string): Promise<RelatorioDiarioCompleto | null> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const relatorio = mockRelatorios.find(r => r.id === id)
    if (!relatorio) return null
    
    const maquinarios = mockRelatoriosMaquinarios.filter(m => m.relatorio_id === id)
    
    return {
      ...relatorio,
      maquinarios
    }
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Cria novo relatório diário
 */
export async function createRelatorioDiario(data: CreateRelatorioDiarioData): Promise<RelatorioDiarioCompleto> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Gera número sequencial
    const ano = new Date().getFullYear()
    const ultimoNumero = mockRelatorios.length
    const numero = gerarNumeroRelatorio(ano, ultimoNumero + 1)
    
    // Calcula espessura
    const espessura_calculada = calcularEspessura(data.metragem_feita, data.toneladas_aplicadas)
    
    // Cria relatório
    const novoRelatorio: RelatorioDiario = {
      id: `rd-${Date.now()}`,
      numero,
      cliente_id: data.cliente_id,
      obra_id: data.obra_id,
      rua_id: data.rua_id,
      equipe_id: data.equipe_id,
      equipe_is_terceira: data.equipe_is_terceira || false,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim,
      horario_inicio: data.horario_inicio,
      metragem_feita: data.metragem_feita,
      toneladas_aplicadas: data.toneladas_aplicadas,
      espessura_calculada,
      observacoes: data.observacoes,
      status: 'finalizado',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockRelatorios.push(novoRelatorio)
    
    // Vincula maquinários
    const maquinarios: RelatorioDiarioMaquinario[] = []
    
    for (const maq of data.maquinarios) {
      const vinculo: RelatorioDiarioMaquinario = {
        id: `rdm-${Date.now()}-${maq.id}`,
        relatorio_id: novoRelatorio.id,
        maquinario_id: maq.id,
        is_terceiro: maq.is_terceiro,
        parceiro_id: maq.parceiro_id,
        created_at: new Date().toISOString()
      }
      
      mockRelatoriosMaquinarios.push(vinculo)
      maquinarios.push(vinculo)
    }
    
    return {
      ...novoRelatorio,
      maquinarios
    }
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Atualiza status da rua para finalizada
 * (Será implementado na API de obras)
 */
export async function finalizarRua(
  rua_id: string,
  relatorio_id: string,
  data_finalizacao: string,
  metragem_executada: number,
  toneladas_executadas: number
): Promise<void> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('Rua finalizada:', {
      rua_id,
      relatorio_id,
      data_finalizacao,
      metragem_executada,
      toneladas_executadas
    })
    
    // Implementação real atualizará o banco
    return
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Cria faturamento automático ao finalizar rua
 * (Será implementado na API financeira)
 */
export async function criarFaturamentoRua(
  obra_id: string,
  rua_id: string,
  metragem_faturada: number,
  valor_m2: number
): Promise<void> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const valor_total = metragem_faturada * valor_m2
    
    console.log('Faturamento criado:', {
      obra_id,
      rua_id,
      metragem_faturada,
      valor_m2,
      valor_total,
      status: 'pendente'
    })
    
    // Implementação real criará no banco
    return
  }
  
  throw new Error('Implementação real pendente')
}

