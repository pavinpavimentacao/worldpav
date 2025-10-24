/**
 * API para gerenciamento financeiro de obras
 * Inclui faturamentos e despesas
 */

import { supabase } from './supabase'
import type {
  ObraFaturamento,
  ObraDespesa,
  ObraResumoFinanceiro,
  ObraRua,
  CreateFaturamentoInput,
  CreateDespesaInput,
  DespesaFilters
} from '../types/obras-financeiro'
import { calcularEspessura, calcularFaturamentoRua, agruparPorMesCivil } from '../utils/financeiro-obras-utils'
import { updateRuaStatus } from './obrasRuasApi'
import { calcularFaturamentoPrevisto } from '../utils/notas-fiscais-utils'

// ============================================
// FATURAMENTOS
// ============================================

/**
 * Lista faturamentos de uma obra
 */
export async function getObraFaturamentos(obraId: string): Promise<ObraFaturamento[]> {
  const { data, error } = await supabase
    .from('obras_financeiro_faturamentos')
    .select(`
      *,
      rua:obras_ruas(*)
    `)
    .eq('obra_id', obraId)
    .order('data_finalizacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar faturamentos:', error)
    throw error
  }

  return data || []
}

/**
 * Cria um faturamento ao finalizar uma rua
 * Calcula automaticamente a espessura e valor total
 * Inclui serviços por viagem (mobilização/imobilização por viagem)
 */
export async function createFaturamentoRua(input: CreateFaturamentoInput): Promise<ObraFaturamento> {
  // Calcular espessura
  const espessura_calculada = calcularEspessura(
    input.toneladas_utilizadas,
    input.metragem_executada
  )

  // Calcular valor total baseado na metragem
  const valorBase = calcularFaturamentoRua(
    input.metragem_executada,
    input.preco_por_m2
  )

  // Buscar serviços por viagem da obra (mobilização/imobilização por viagem)
  const { data: servicosViagem, error: errorServicos } = await supabase
    .from('obras_servicos')
    .select('*')
    .eq('obra_id', input.obra_id)
    .eq('unidade', 'viagem')

  let valorServicosViagem = 0
  if (!errorServicos && servicosViagem) {
    valorServicosViagem = servicosViagem.reduce((total, servico) => total + (servico.valor_total || 0), 0)
  }

  // Valor total = valor base + serviços por viagem
  const valor_total = valorBase + valorServicosViagem

  const data_finalizacao = input.data_finalizacao || new Date().toISOString().split('T')[0]

  // Criar faturamento
  const { data, error } = await supabase
    .from('obras_financeiro_faturamentos')
    .insert({
      obra_id: input.obra_id,
      rua_id: input.rua_id,
      metragem_executada: input.metragem_executada,
      toneladas_utilizadas: input.toneladas_utilizadas,
      espessura_calculada,
      preco_por_m2: input.preco_por_m2,
      valor_total,
      data_finalizacao,
      observacoes: input.observacoes
    })
    .select(`
      *,
      rua:obras_ruas(*)
    `)
    .single()

  if (error) {
    console.error('Erro ao criar faturamento:', error)
    throw error
  }

  // Atualizar status da rua para finalizada
  try {
    await updateRuaStatus(input.rua_id, 'finalizada')
  } catch (err) {
    console.error('Erro ao atualizar status da rua:', err)
  }

  return data
}

/**
 * Calcula o faturamento total da obra incluindo serviços por obra inteira
 * Esta função deve ser chamada no fechamento da obra
 */
export async function calcularFaturamentoTotalObra(obraId: string): Promise<{
  faturamentoRuas: number
  servicosObraInteira: number
  total: number
}> {
  try {
    // Buscar faturamentos das ruas
    const faturamentos = await getObraFaturamentos(obraId)
    const faturamentoRuas = faturamentos.reduce((total, fat) => total + (fat.valor_total || 0), 0)

    // Buscar serviços por obra inteira (mobilização/imobilização por obra)
    const { data: servicosObra, error: errorServicos } = await supabase
      .from('obras_servicos')
      .select('*')
      .eq('obra_id', obraId)
      .eq('unidade', 'servico')

    let servicosObraInteira = 0
    if (!errorServicos && servicosObra) {
      servicosObraInteira = servicosObra.reduce((total, servico) => total + (servico.valor_total || 0), 0)
    }

    const total = faturamentoRuas + servicosObraInteira

    return {
      faturamentoRuas,
      servicosObraInteira,
      total
    }
  } catch (error) {
    console.error('Erro ao calcular faturamento total da obra:', error)
    return {
      faturamentoRuas: 0,
      servicosObraInteira: 0,
      total: 0
    }
  }
}

/**
 * Deleta um faturamento
 */
export async function deleteFaturamento(id: string): Promise<void> {
  const { error } = await supabase
    .from('obras_financeiro_faturamentos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar faturamento:', error)
    throw error
  }
}

// ============================================
// DESPESAS
// ============================================

/**
 * Lista despesas de uma obra com filtros opcionais
 */
export async function getObraDespesas(
  obraId: string,
  filters?: DespesaFilters
): Promise<ObraDespesa[]> {
  let query = supabase
    .from('obras_financeiro_despesas')
    .select('*')
    .eq('obra_id', obraId)
    .order('data_despesa', { ascending: false })

  if (filters?.categoria) {
    query = query.eq('categoria', filters.categoria)
  }

  if (filters?.data_inicio) {
    query = query.gte('data_despesa', filters.data_inicio)
  }

  if (filters?.data_fim) {
    query = query.lte('data_despesa', filters.data_fim)
  }

  if (filters?.maquinario_id) {
    query = query.eq('maquinario_id', filters.maquinario_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar despesas:', error)
    throw error
  }

  return data || []
}

/**
 * Cria uma despesa para a obra
 */
export async function createDespesaObra(input: CreateDespesaInput): Promise<ObraDespesa> {
  const { data, error } = await supabase
    .from('obras_financeiro_despesas')
    .insert({
      ...input,
      sincronizado_financeiro_principal: input.sincronizado_financeiro_principal ?? true
    })
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao criar despesa:', error)
    throw error
  }

  // TODO: Se sincronizado_financeiro_principal for true, criar também em expenses
  // Isso será implementado quando integrar com a tabela expenses

  return data
}

/**
 * Atualiza uma despesa
 */
export async function updateDespesaObra(
  id: string,
  input: Partial<CreateDespesaInput>
): Promise<ObraDespesa> {
  const { data, error } = await supabase
    .from('obras_financeiro_despesas')
    .update(input)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao atualizar despesa:', error)
    throw error
  }

  return data
}

/**
 * Deleta uma despesa
 */
export async function deleteDespesaObra(id: string): Promise<void> {
  const { error } = await supabase
    .from('obras_financeiro_despesas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar despesa:', error)
    throw error
  }
}

// ============================================
// RESUMOS E ESTATÍSTICAS
// ============================================

/**
 * Retorna o resumo financeiro de uma obra
 * Opcionalmente filtrado por mês/ano
 */
export async function getObraResumoFinanceiro(
  obraId: string,
  mesAno?: { mes: number; ano: number }
): Promise<ObraResumoFinanceiro> {
  let faturamentos = await getObraFaturamentos(obraId)
  let despesas = await getObraDespesas(obraId)

  // Filtrar por mês se especificado
  if (mesAno) {
    faturamentos = faturamentos.filter(f => {
      const data = new Date(f.data_finalizacao)
      return data.getMonth() + 1 === mesAno.mes && data.getFullYear() === mesAno.ano
    })

    despesas = despesas.filter(d => {
      const data = new Date(d.data_despesa)
      return data.getMonth() + 1 === mesAno.mes && data.getFullYear() === mesAno.ano
    })
  }

  // Total faturado = soma de todas as ruas finalizadas
  const total_faturado = faturamentos.reduce((sum, f) => sum + f.valor_total, 0)

  const total_despesas = despesas.reduce((sum, d) => sum + d.valor, 0)

  const despesas_por_categoria = despesas.reduce((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] || 0) + d.valor
    return acc
  }, {} as Record<string, number>)

  const lucro_liquido = total_faturado - total_despesas

  return {
    total_faturado,
    total_pendente: 0, // Não usado mais, mantido para compatibilidade
    total_despesas,
    lucro_liquido,
    despesas_por_categoria
  }
}

/**
 * Retorna dados mensais de faturamento e despesas para gráficos
 */
export async function getObraFinanceiroMensal(
  obraId: string,
  ano: number
): Promise<{
  faturamentos_por_mes: Array<{ mes: string; valor: number }>
  despesas_por_mes: Array<{ mes: string; valor: number }>
}> {
  const faturamentos = await getObraFaturamentos(obraId)

  const despesas = await getObraDespesas(obraId, {
    data_inicio: `${ano}-01-01`,
    data_fim: `${ano}-12-31`
  })

  // Filtrar faturamentos do ano especificado
  const faturamentosDoAno = faturamentos.filter(f => {
    const data = new Date(f.data_finalizacao)
    return data.getFullYear() === ano
  })

  const faturamentosAgrupados = agruparPorMesCivil(
    faturamentosDoAno,
    'data_finalizacao'
  )

  const despesasAgrupadas = agruparPorMesCivil(despesas, 'data_despesa')

  const meses = Array.from({ length: 12 }, (_, i) => {
    const mes = String(i + 1).padStart(2, '0')
    return `${ano}-${mes}`
  })

  const faturamentos_por_mes = meses.map(mes => ({
    mes,
    valor: (faturamentosAgrupados[mes] || []).reduce((sum, f) => sum + f.valor_total, 0)
  }))

  const despesas_por_mes = meses.map(mes => ({
    mes,
    valor: (despesasAgrupadas[mes] || []).reduce((sum, d) => sum + d.valor, 0)
  }))

  return {
    faturamentos_por_mes,
    despesas_por_mes
  }
}

/**
 * Busca um faturamento específico por ID
 */
export async function getFaturamentoById(id: string): Promise<ObraFaturamento | null> {
  const { data, error } = await supabase
    .from('obras_financeiro_faturamentos')
    .select(`
      *,
      rua:obras_ruas(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar faturamento:', error)
    return null
  }

  return data
}

/**
 * Calcula o faturamento previsto de uma obra
 * Baseado nas ruas planejadas × preço por m²
 */
export async function getFaturamentoPrevisto(obraId: string, precoPorM2: number): Promise<number> {
  const { data: ruas, error } = await supabase
    .from('obras_ruas')
    .select('metragem_planejada')
    .eq('obra_id', obraId)
  
  if (error) {
    console.error('Erro ao buscar ruas para calcular faturamento previsto:', error)
    return 0
  }
  
  return calcularFaturamentoPrevisto(ruas as ObraRua[], precoPorM2)
}


