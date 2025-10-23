/**
 * API para gerenciar Medições de Obras
 */

import { supabase } from './supabase'
import type { ObraMedicao, CreateMedicaoInput } from '../types/obras-financeiro'

/**
 * Busca todas as medições de uma obra
 */
export async function getMedicoesByObra(obraId: string): Promise<ObraMedicao[]> {
  const { data, error } = await supabase
    .from('obras_medicoes')
    .select('*')
    .eq('obra_id', obraId)
    .order('data_medicao', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar medições:', error)
    throw new Error('Erro ao buscar medições')
  }
  
  return data || []
}

/**
 * Busca uma medição por ID
 */
export async function getMedicaoById(id: string): Promise<ObraMedicao | null> {
  const { data, error } = await supabase
    .from('obras_medicoes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar medição:', error)
    return null
  }
  
  return data
}

/**
 * Cria uma nova medição
 */
export async function createMedicao(input: CreateMedicaoInput): Promise<ObraMedicao> {
  const { data, error } = await supabase
    .from('obras_medicoes')
    .insert({
      obra_id: input.obra_id,
      nota_fiscal_id: input.nota_fiscal_id,
      descricao: input.descricao,
      arquivo_medicao_url: input.arquivo_medicao_url,
      data_medicao: input.data_medicao
    })
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao criar medição:', error)
    throw new Error('Erro ao criar medição')
  }
  
  return data
}

/**
 * Atualiza uma medição
 */
export async function updateMedicao(
  id: string,
  input: Partial<CreateMedicaoInput>
): Promise<ObraMedicao> {
  const { data, error } = await supabase
    .from('obras_medicoes')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar medição:', error)
    throw new Error('Erro ao atualizar medição')
  }
  
  return data
}

/**
 * Deleta uma medição
 */
export async function deleteMedicao(id: string): Promise<void> {
  const { error } = await supabase
    .from('obras_medicoes')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar medição:', error)
    throw new Error('Erro ao deletar medição')
  }
}

/**
 * Busca medições vinculadas a uma nota fiscal
 */
export async function getMedicoesByNotaFiscal(notaFiscalId: string): Promise<ObraMedicao[]> {
  const { data, error } = await supabase
    .from('obras_medicoes')
    .select('*')
    .eq('nota_fiscal_id', notaFiscalId)
    .order('data_medicao', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar medições por nota fiscal:', error)
    throw new Error('Erro ao buscar medições por nota fiscal')
  }
  
  return data || []
}

/**
 * Conta quantas medições uma obra possui
 */
export async function countMedicoesByObra(obraId: string): Promise<number> {
  const { count, error } = await supabase
    .from('obras_medicoes')
    .select('*', { count: 'exact', head: true })
    .eq('obra_id', obraId)
  
  if (error) {
    console.error('Erro ao contar medições:', error)
    return 0
  }
  
  return count || 0
}






