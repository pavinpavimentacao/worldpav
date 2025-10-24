import { supabase } from './supabase'
import { ServicoObra } from '../types/servicos'

// Interface para inserir serviço da obra
export interface ServicoObraInsert {
  obra_id: string
  servico_id: string
  servico_nome: string
  quantidade: number
  preco_unitario: number
  valor_total: number
  unidade: string
  observacoes?: string
}

// Salvar serviço da obra
export async function createServicoObra(servico: ServicoObraInsert): Promise<ServicoObra> {
  const { data, error } = await supabase
    .from('obras_servicos')
    .insert([servico])
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar serviço da obra: ${error.message}`)
  }

  return data
}

// Buscar serviços de uma obra
export async function getServicosObra(obraId: string): Promise<ServicoObra[]> {
  const { data, error } = await supabase
    .from('obras_servicos')
    .select('*')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erro ao buscar serviços da obra: ${error.message}`)
  }

  return data || []
}

/**
 * Calcula o preço por m² baseado nos serviços da obra
 * Soma apenas os preços unitários dos serviços por m²/m³
 * Exclui serviços por viagem (mobilização/imobilização por viagem)
 */
export async function calcularPrecoPorM2(obraId: string): Promise<number> {
  try {
    // Buscar os serviços da obra
    const servicos = await getServicosObra(obraId)
    
    // Filtrar apenas serviços por m²/m³ (excluir viagem e serviço)
    const servicosM2M3 = servicos.filter(s => s.unidade === 'm2' || s.unidade === 'm3')
    
    // Somar os preços unitários
    const precoPorM2 = servicosM2M3.reduce((total, servico) => total + (servico.preco_unitario || 0), 0)
    
    return precoPorM2
  } catch (error) {
    console.error('Erro ao calcular preço por m²:', error)
    return 0
  }
}

// Calcular o valor total dos serviços de uma obra
export async function calcularValorTotalServicos(obraId: string): Promise<number> {
  try {
    // Buscar os serviços da obra
    const servicos = await getServicosObra(obraId)
    
    let volumePrevisto = 0
    
    try {
      // Tentar buscar dados da obra para obter o volume previsto
      const { data: obra, error } = await supabase
        .from('obras')
        .select('*')  // Selecionamos todos os campos para evitar erro de coluna inexistente
        .eq('id', obraId)
        .single()
      
      if (!error && obra) {
        // Se a coluna existir, use-a; caso contrário, use 0
        volumePrevisto = obra.volume_planejamento || 0
      }
    } catch (err) {
      console.warn('A coluna volume_planejamento pode não existir ainda:', err)
      // Continuamos com volumePrevisto = 0
    }
    
    // Se não conseguirmos obter o volume previsto, simplesmente somamos os valores totais dos serviços
    if (volumePrevisto === 0) {
      return servicos.reduce((total, servico) => total + (servico.valor_total || 0), 0)
    }
    
    // Separar serviços por tipo
    const servicosM2M3 = servicos.filter(s => s.unidade === 'm2' || s.unidade === 'm3')
    const servicosMobilizacao = servicos.filter(s => s.unidade === 'servico' || s.unidade === 'viagem')
    
    // Calcular valor total por M²/M³
    const valorPorM2M3 = servicosM2M3.reduce((total, servico) => total + servico.preco_unitario, 0)
    
    // Multiplicar pelo volume previsto
    const previsaoFaturamentoM2M3 = valorPorM2M3 * volumePrevisto
    
    // Valor das mobilizações (fixo)
    const totalMobilizacao = servicosMobilizacao.reduce((total, servico) => total + servico.valor_total, 0)
    
    // Total previsto da obra
    const totalPrevistoObra = previsaoFaturamentoM2M3 + totalMobilizacao
    
    return totalPrevistoObra
  } catch (error) {
    console.error('Erro ao calcular valor total dos serviços:', error)
    return 0
  }
}

// Atualizar serviço da obra
export async function updateServicoObra(id: string, servico: Partial<ServicoObraInsert>): Promise<ServicoObra> {
  const { data, error } = await supabase
    .from('obras_servicos')
    .update(servico)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar serviço da obra: ${error.message}`)
  }

  return data
}

// Deletar serviço da obra (soft delete)
export async function deleteServicoObra(id: string): Promise<void> {
  const { error } = await supabase
    .from('obras_servicos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar serviço da obra: ${error.message}`)
  }
}

// Salvar múltiplos serviços de uma obra
export async function createServicosObra(obraId: string, servicos: ServicoObraInsert[]): Promise<ServicoObra[]> {
  const servicosComObraId = servicos.map(servico => ({
    ...servico,
    obra_id: obraId
  }))

  const { data, error } = await supabase
    .from('obras_servicos')
    .insert(servicosComObraId)
    .select()

  if (error) {
    throw new Error(`Erro ao criar serviços da obra: ${error.message}`)
  }

  return data || []
}
