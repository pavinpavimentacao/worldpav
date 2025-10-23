import { supabase } from './supabase'

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface ObraRua {
  id: string
  obra_id: string
  name: string
  length?: number | null
  width?: number | null
  area?: number | null
  status: 'planejada' | 'em_execucao' | 'concluida'
  start_date?: string | null
  end_date?: string | null
  observations?: string | null
  created_at: string
  deleted_at?: string | null
}

export interface ObraRuaInsertData {
  obra_id: string
  name: string
  length?: number | null
  width?: number | null
  area?: number | null
  status?: 'planejada' | 'em_execucao' | 'concluida'
  start_date?: string | null
  end_date?: string | null
  observations?: string | null
}

export interface ObraRuaUpdateData {
  name?: string
  length?: number | null
  width?: number | null
  area?: number | null
  status?: 'planejada' | 'em_execucao' | 'concluida'
  start_date?: string | null
  end_date?: string | null
  observations?: string | null
}

// =====================================================
// FUNÇÕES DA API
// =====================================================

/**
 * Busca todas as ruas de uma obra
 */
export async function getRuasByObra(obraId: string): Promise<ObraRua[]> {
  try {
    const { data, error } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar ruas:', error)
      throw new Error(`Erro ao buscar ruas: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar ruas:', error)
    throw error
  }
}

/**
 * Busca uma rua específica por ID
 */
export async function getRuaById(ruaId: string): Promise<ObraRua | null> {
  try {
    const { data, error } = await supabase
      .from('obras_ruas')
      .select('*')
      .eq('id', ruaId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar rua:', error)
      throw new Error(`Erro ao buscar rua: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar rua:', error)
    throw error
  }
}

/**
 * Cria uma nova rua
 */
export async function createRua(ruaData: ObraRuaInsertData): Promise<ObraRua> {
  try {
    const { data, error } = await supabase
      .from('obras_ruas')
      .insert(ruaData)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao criar rua:', error)
      throw new Error(`Erro ao criar rua: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao criar rua:', error)
    throw error
  }
}

/**
 * Atualiza uma rua existente
 */
export async function updateRua(ruaId: string, ruaData: ObraRuaUpdateData): Promise<ObraRua> {
  try {
    const { data, error } = await supabase
      .from('obras_ruas')
      .update(ruaData)
      .eq('id', ruaId)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao atualizar rua:', error)
      throw new Error(`Erro ao atualizar rua: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar rua:', error)
    throw error
  }
}

/**
 * Exclui uma rua (soft delete)
 */
export async function deleteRua(ruaId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('obras_ruas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', ruaId)

    if (error) {
      console.error('Erro ao excluir rua:', error)
      throw new Error(`Erro ao excluir rua: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro ao excluir rua:', error)
    throw error
  }
}

/**
 * Atualiza status de uma rua
 */
export async function updateRuaStatus(
  ruaId: string, 
  status: 'planejada' | 'em_execucao' | 'concluida'
): Promise<ObraRua> {
  try {
    const updateData: ObraRuaUpdateData = { status }
    
    // Se está sendo concluída, definir data de conclusão
    if (status === 'concluida') {
      updateData.end_date = new Date().toISOString().split('T')[0]
    }

    return await updateRua(ruaId, updateData)
  } catch (error) {
    console.error('Erro ao atualizar status da rua:', error)
    throw error
  }
}

/**
 * Alias para compatibilidade com código existente
 */
export const getObrasRuas = getRuasByObra
export const getObraRuas = getRuasByObra

/**
 * Conta ruas por status
 */
export async function contarRuasPorStatus(obraId: string): Promise<{
  pendente: number
  em_andamento: number
  finalizada: number
}> {
  try {
    const ruas = await getRuasByObra(obraId)
    
    return {
      pendente: ruas.filter(r => r.status === 'planejada').length,
      em_andamento: ruas.filter(r => r.status === 'em_execucao').length,
      finalizada: ruas.filter(r => r.status === 'concluida').length
    }
  } catch (error) {
    console.error('Erro ao contar ruas por status:', error)
    throw error
  }
}

/**
 * Reordena ruas (não implementado no banco - apenas para compatibilidade)
 */
export async function reordenarRuas(ordens: Array<{ id: string; ordem: number }>): Promise<void> {
  // TODO: Implementar se necessário adicionar coluna 'ordem' na tabela
  console.log('Reordenação de ruas não implementada ainda')
}
