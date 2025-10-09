/**
 * API para gerenciamento de ruas das obras
 */

import { supabase } from './supabase'
import type { 
  ObraRua, 
  CreateRuaInput, 
  UpdateRuaInput,
  RuaStatus 
} from '../types/obras-financeiro'

/**
 * Lista todas as ruas de uma obra
 */
export async function getObrasRuas(obraId: string): Promise<ObraRua[]> {
  const { data, error } = await supabase
    .from('obras_ruas')
    .select('*')
    .eq('obra_id', obraId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar ruas da obra:', error)
    throw error
  }

  return data || []
}

/**
 * Cria uma nova rua
 */
export async function createRua(input: CreateRuaInput): Promise<ObraRua> {
  // Buscar a maior ordem atual para a obra
  const { data: maxOrdemData } = await supabase
    .from('obras_ruas')
    .select('ordem')
    .eq('obra_id', input.obra_id)
    .order('ordem', { ascending: false })
    .limit(1)
    .single()

  const novaOrdem = input.ordem ?? (maxOrdemData?.ordem ?? -1) + 1

  const { data, error } = await supabase
    .from('obras_ruas')
    .insert({
      ...input,
      ordem: novaOrdem,
      status: 'pendente'
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar rua:', error)
    throw error
  }

  return data
}

/**
 * Atualiza uma rua existente
 */
export async function updateRua(id: string, input: UpdateRuaInput): Promise<ObraRua> {
  const { data, error } = await supabase
    .from('obras_ruas')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar rua:', error)
    throw error
  }

  return data
}

/**
 * Deleta uma rua
 */
export async function deleteRua(id: string): Promise<void> {
  const { error } = await supabase
    .from('obras_ruas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar rua:', error)
    throw error
  }
}

/**
 * Atualiza apenas o status de uma rua
 */
export async function updateRuaStatus(id: string, status: RuaStatus): Promise<ObraRua> {
  return updateRua(id, { status })
}

/**
 * Reordena ruas de uma obra
 */
export async function reordenarRuas(updates: Array<{ id: string; ordem: number }>): Promise<void> {
  const promises = updates.map(update =>
    supabase
      .from('obras_ruas')
      .update({ ordem: update.ordem })
      .eq('id', update.id)
  )

  const results = await Promise.all(promises)
  const errors = results.filter(r => r.error)

  if (errors.length > 0) {
    console.error('Erro ao reordenar ruas:', errors)
    throw errors[0].error
  }
}

/**
 * Busca uma rua específica por ID
 */
export async function getRuaById(id: string): Promise<ObraRua | null> {
  const { data, error } = await supabase
    .from('obras_ruas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar rua:', error)
    return null
  }

  return data
}

/**
 * Conta quantas ruas tem cada status
 */
export async function contarRuasPorStatus(obraId: string): Promise<Record<RuaStatus, number>> {
  const ruas = await getObrasRuas(obraId)

  return {
    pendente: ruas.filter(r => r.status === 'pendente').length,
    em_andamento: ruas.filter(r => r.status === 'em_andamento').length,
    finalizada: ruas.filter(r => r.status === 'finalizada').length
  }
}


