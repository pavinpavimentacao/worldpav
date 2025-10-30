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
      maquinario:maquinarios(id, name),
      obra:obras(id, name),
      rua:obras_ruas!rua_id(id, name)
    `)
    .eq('maquinario_id', maquinarioId)
    .order('date', { ascending: false })

  if (filters?.data_inicio) {
    query = query.gte('date', filters.data_inicio)
  }

  if (filters?.data_fim) {
    query = query.lte('date', filters.data_fim)
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
  const total_amount = calcularValorAbastecimento(
    input.liters,
    input.price_per_liter
  )

  const abastecimentoData: any = {
    maquinario_id: input.maquinario_id,
    obra_id: input.obra_id || null,
    liters: input.liters,
    price_per_liter: input.price_per_liter,
    total_amount,
    date: input.date,
    gas_station: input.gas_station,
    odometer: input.odometer || null,
    observacoes: input.observacoes || null
  }

  // Se tem obra vinculada, criar a despesa primeiro
  let despesaId: string | undefined

  if (input.obra_id) {
    try {
      const despesa = await createDespesaObra({
        obra_id: input.obra_id,
        categoria: 'diesel',
        descricao: `Abastecimento - ${input.gas_station}`,
        valor: total_amount,
        data_despesa: input.date,
        maquinario_id: input.maquinario_id,
        fornecedor: input.gas_station,
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
      maquinario:maquinarios(id, name),
      obra:obras(id, name),
      rua:obras_ruas!rua_id(id, name)
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

  // Recalcular total_amount se quantidade ou preço mudaram
  if (input.liters !== undefined || input.price_per_liter !== undefined) {
    const { data: current } = await supabase
      .from('maquinarios_diesel')
      .select('liters, price_per_liter')
      .eq('id', id)
      .single()

    if (current) {
      const novaQuantidade = input.liters ?? current.liters
      const novoPreco = input.price_per_liter ?? current.price_per_liter
      updateData.total_amount = calcularValorAbastecimento(novaQuantidade, novoPreco)
    }
  }

  const { data, error } = await supabase
    .from('maquinarios_diesel')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      maquinario:maquinarios(id, name),
      obra:obras(id, name),
      rua:obras_ruas!rua_id(id, name)
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
      maquinario:maquinarios(id, name),
      obra:obras(id, name),
      rua:obras_ruas!rua_id(id, name)
    `)
    .not('obra_id', 'is', null)
    .order('date', { ascending: false })

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
      maquinario:maquinarios(id, name),
      obra:obras(id, name),
      rua:obras_ruas!rua_id(id, name)
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
      litros: abastecimentosMes.reduce((sum, a) => sum + a.liters, 0),
      valor: abastecimentosMes.reduce((sum, a) => sum + a.total_amount, 0)
    }
  })
}


