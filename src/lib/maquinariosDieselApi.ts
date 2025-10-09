/**
 * API para gerenciamento de diesel dos maquinários
 */

import { supabase } from './supabase'
import type {
  MaquinarioDiesel,
  CreateDieselInput,
  UpdateDieselInput,
  DieselStats,
  DieselFilters
} from '../types/maquinarios-diesel'
import { 
  calcularValorAbastecimento, 
  calcularConsumoMedio,
  agruparAbastecimentosPorMes 
} from '../utils/diesel-calculations'
import { createDespesaObra } from './obrasFinanceiroApi'

/**
 * Lista abastecimentos de um maquinário com filtros opcionais
 */
export async function getMaquinarioDiesel(
  maquinarioId: string,
  filters?: DieselFilters
): Promise<MaquinarioDiesel[]> {
  let query = supabase
    .from('maquinarios_diesel')
    .select(`
      *,
      maquinario:maquinarios(id, nome),
      obra:obras(id, nome)
    `)
    .eq('maquinario_id', maquinarioId)
    .order('data_abastecimento', { ascending: false })

  if (filters?.data_inicio) {
    query = query.gte('data_abastecimento', filters.data_inicio)
  }

  if (filters?.data_fim) {
    query = query.lte('data_abastecimento', filters.data_fim)
  }

  if (filters?.obra_id) {
    query = query.eq('obra_id', filters.obra_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar diesel do maquinário:', error)
    throw error
  }

  return data || []
}

/**
 * Cria um novo abastecimento de diesel
 * Se obra_id for informada, cria automaticamente a despesa na obra
 */
export async function createAbastecimentoDiesel(
  input: CreateDieselInput
): Promise<MaquinarioDiesel> {
  const valor_total = calcularValorAbastecimento(
    input.quantidade_litros,
    input.preco_por_litro
  )

  const abastecimentoData: any = {
    maquinario_id: input.maquinario_id,
    obra_id: input.obra_id || null,
    quantidade_litros: input.quantidade_litros,
    preco_por_litro: input.preco_por_litro,
    valor_total,
    data_abastecimento: input.data_abastecimento,
    posto: input.posto,
    km_hodometro: input.km_hodometro || null,
    observacoes: input.observacoes || null
  }

  // Se tem obra vinculada, criar a despesa primeiro
  let despesaId: string | undefined

  if (input.obra_id) {
    try {
      const despesa = await createDespesaObra({
        obra_id: input.obra_id,
        categoria: 'diesel',
        descricao: `Abastecimento - ${input.posto}`,
        valor: valor_total,
        data_despesa: input.data_abastecimento,
        maquinario_id: input.maquinario_id,
        fornecedor: input.posto,
        sincronizado_financeiro_principal: true
      })
      despesaId = despesa.id
      abastecimentoData.despesa_obra_id = despesaId
    } catch (err) {
      console.error('Erro ao criar despesa da obra:', err)
      // Continua criando o abastecimento mesmo se a despesa falhar
    }
  }

  const { data, error } = await supabase
    .from('maquinarios_diesel')
    .insert(abastecimentoData)
    .select(`
      *,
      maquinario:maquinarios(id, nome),
      obra:obras(id, nome)
    `)
    .single()

  if (error) {
    console.error('Erro ao criar abastecimento:', error)
    throw error
  }

  return data
}

/**
 * Atualiza um abastecimento existente
 */
export async function updateAbastecimentoDiesel(
  id: string,
  input: UpdateDieselInput
): Promise<MaquinarioDiesel> {
  const updateData: any = { ...input }

  // Recalcular valor_total se quantidade ou preço mudaram
  if (input.quantidade_litros !== undefined || input.preco_por_litro !== undefined) {
    const { data: current } = await supabase
      .from('maquinarios_diesel')
      .select('quantidade_litros, preco_por_litro')
      .eq('id', id)
      .single()

    if (current) {
      const novaQuantidade = input.quantidade_litros ?? current.quantidade_litros
      const novoPreco = input.preco_por_litro ?? current.preco_por_litro
      updateData.valor_total = calcularValorAbastecimento(novaQuantidade, novoPreco)
    }
  }

  const { data, error } = await supabase
    .from('maquinarios_diesel')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      maquinario:maquinarios(id, nome),
      obra:obras(id, nome)
    `)
    .single()

  if (error) {
    console.error('Erro ao atualizar abastecimento:', error)
    throw error
  }

  // TODO: Atualizar também a despesa vinculada se existir

  return data
}

/**
 * Deleta um abastecimento
 */
export async function deleteAbastecimentoDiesel(id: string): Promise<void> {
  // Buscar a despesa vinculada antes de deletar
  const { data: abastecimento } = await supabase
    .from('maquinarios_diesel')
    .select('despesa_obra_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('maquinarios_diesel')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar abastecimento:', error)
    throw error
  }

  // TODO: Deletar também a despesa vinculada se existir
  // if (abastecimento?.despesa_obra_id) {
  //   await deleteDespesaObra(abastecimento.despesa_obra_id)
  // }
}

/**
 * Retorna estatísticas de consumo de diesel do maquinário
 */
export async function getMaquinarioDieselStats(
  maquinarioId: string,
  periodo?: { data_inicio: string; data_fim: string }
): Promise<DieselStats> {
  const filters: DieselFilters = {}
  
  if (periodo) {
    filters.data_inicio = periodo.data_inicio
    filters.data_fim = periodo.data_fim
  }

  const abastecimentos = await getMaquinarioDiesel(maquinarioId, filters)
  
  return calcularConsumoMedio(abastecimentos)
}

/**
 * Lista abastecimentos de diesel de todas as obras ativas
 */
export async function getDieselTodasObras(): Promise<MaquinarioDiesel[]> {
  const { data, error } = await supabase
    .from('maquinarios_diesel')
    .select(`
      *,
      maquinario:maquinarios(id, nome),
      obra:obras(id, nome)
    `)
    .not('obra_id', 'is', null)
    .order('data_abastecimento', { ascending: false })

  if (error) {
    console.error('Erro ao buscar diesel de todas as obras:', error)
    throw error
  }

  return data || []
}

/**
 * Busca um abastecimento específico por ID
 */
export async function getDieselById(id: string): Promise<MaquinarioDiesel | null> {
  const { data, error } = await supabase
    .from('maquinarios_diesel')
    .select(`
      *,
      maquinario:maquinarios(id, nome),
      obra:obras(id, nome)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar abastecimento:', error)
    return null
  }

  return data
}

/**
 * Retorna dados mensais de consumo para gráficos
 */
export async function getDieselMensal(
  maquinarioId: string,
  ano: number
): Promise<Array<{ mes: string; litros: number; valor: number }>> {
  const abastecimentos = await getMaquinarioDiesel(maquinarioId, {
    data_inicio: `${ano}-01-01`,
    data_fim: `${ano}-12-31`
  })

  const agrupados = agruparAbastecimentosPorMes(abastecimentos)

  const meses = Array.from({ length: 12 }, (_, i) => {
    const mes = String(i + 1).padStart(2, '0')
    return `${ano}-${mes}`
  })

  return meses.map(mes => {
    const abastecimentosMes = agrupados[mes] || []
    return {
      mes,
      litros: abastecimentosMes.reduce((sum, a) => sum + a.quantidade_litros, 0),
      valor: abastecimentosMes.reduce((sum, a) => sum + a.valor_total, 0)
    }
  })
}


