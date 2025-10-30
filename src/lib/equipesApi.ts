/**
 * API para gerenciamento de Equipes
 */

import { supabase } from './supabase'

export interface Equipe {
  id: string
  company_id: string
  name: string
  prefixo?: string | null
  descricao?: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface EquipeInsert {
  company_id: string
  name: string
  prefixo?: string | null
  descricao?: string | null
  ativo?: boolean
}

export interface EquipeUpdate {
  name?: string
  prefixo?: string | null
  descricao?: string | null
  ativo?: boolean
}

/**
 * Buscar todas as equipes de uma empresa
 */
export async function getEquipes(companyId: string): Promise<Equipe[]> {
  try {
    console.log('🔍 [EquipesApi] Buscando equipes para companyId:', companyId)
    
    const { data, error } = await supabase
      .from('equipes')
      .select('*')
      .eq('company_id', companyId)
      // Removido filtro de ativo para debug - verificar se há equipe com ativo=false
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ [EquipesApi] Erro ao buscar equipes:', error)
      throw error
    }

    console.log(`✅ [EquipesApi] Equipes encontradas: ${data?.length || 0}`)
    if (data && data.length > 0) {
      data.forEach((eq, i) => {
        console.log(`  ${i + 1}. ${eq.name} (ID: ${eq.id}, ativo: ${eq.ativo}, deleted_at: ${eq.deleted_at})`)
      })
    }

    return data || []
  } catch (error) {
    console.error('❌ [EquipesApi] Erro ao buscar equipes:', error)
    throw error
  }
}

/**
 * Buscar uma equipe específica por ID
 */
export async function getEquipeById(equipeId: string): Promise<Equipe | null> {
  try {
    const { data, error } = await supabase
      .from('equipes')
      .select('*')
      .eq('id', equipeId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Erro ao buscar equipe:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar equipe:', error)
    throw error
  }
}

/**
 * Criar uma nova equipe
 */
export async function createEquipe(equipe: EquipeInsert): Promise<Equipe> {
  try {
    const { data, error } = await supabase
      .from('equipes')
      .insert(equipe)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao criar equipe:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao criar equipe:', error)
    throw error
  }
}

/**
 * Atualizar uma equipe existente
 */
export async function updateEquipe(equipeId: string, equipe: EquipeUpdate): Promise<Equipe> {
  try {
    const { data, error } = await supabase
      .from('equipes')
      .update(equipe)
      .eq('id', equipeId)
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao atualizar equipe:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar equipe:', error)
    throw error
  }
}

/**
 * Deletar uma equipe (soft delete)
 */
export async function deleteEquipe(equipeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('equipes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', equipeId)

    if (error) {
      console.error('Erro ao deletar equipe:', error)
      throw error
    }
  } catch (error) {
    console.error('Erro ao deletar equipe:', error)
    throw error
  }
}

/**
 * Buscar equipe por prefixo ou nome
 */
export async function getEquipeByPrefixo(prefixed_equipe: string, companyId: string): Promise<Equipe | null> {
  try {
    console.log('🔍 [EquipesApi] Buscando equipe por prefixo:', prefixed_equipe, 'para companyId:', companyId)
    
    // Tentar buscar por nome primeiro (já que o prefixo pode estar salvo no campo name)
    const { data: dataPorName, error: errorPorName } = await supabase
      .from('equipes')
      .select('*')
      .eq('company_id', companyId)
      .ilike('name', `%${prefixed_equipe}%`)
      .is('deleted_at', null)
      .limit(1)

    if (!errorPorName && dataPorName && dataPorName.length > 0) {
      console.log('✅ [EquipesApi] Equipe encontrada por nome:', dataPorName[0].name)
      return dataPorName[0]
    }

    // Tentar buscar por prefixo
    const { data: dataPorPrefixo, error: errorPorPrefixo } = await supabase
      .from('equipes')
      .select('*')
      .eq('company_id', companyId)
      .eq('prefixo', prefixed_equipe)
      .is('deleted_at', null)
      .single()

    if (errorPorPrefixo) {
      if (errorPorPrefixo.code === 'PGRST116') {
        console.log('ℹ️ [EquipesApi] Nenhuma equipe encontrada para o prefixo:', prefixed_equipe)
        return null
      }
      console.error('❌ [EquipesApi] Erro ao buscar equipe por prefixo:', errorPorPrefixo)
      throw errorPorPrefixo
    }

    if (dataPorPrefixo) {
      console.log('✅ [EquipesApi] Equipe encontrada por prefixo:', dataPorPrefixo.name)
      return dataPorPrefixo
    }

    console.log('ℹ️ [EquipesApi] Nenhuma equipe encontrada')
    return null
  } catch (error) {
    console.error('❌ [EquipesApi] Erro geral ao buscar equipe por prefixo:', error)
    throw error
  }
}

/**
 * Buscar colaboradores de uma equipe
 */
export async function getColaboradoresByEquipe(equipeId: string): Promise<any[]> {
  try {
    console.log('🔍 [EquipesApi] Buscando colaboradores da equipe:', equipeId);
    
    if (!equipeId || equipeId.trim().length === 0) {
      console.warn('⚠️ [EquipesApi] equipeId inválido:', equipeId);
      return [];
    }
    
    const { data, error } = await supabase
      .from('colaboradores')
      .select('id, name, position, email, phone, cpf, status, equipe_id, tipo_equipe, company_id, created_at, updated_at')
      .eq('equipe_id', equipeId)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ [EquipesApi] Erro ao buscar colaboradores da equipe:', error);
      console.error('❌ [EquipesApi] Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Tentar buscar com cast de tipo se necessário
      if (error.code === '42883' && error.message?.includes('operator does not exist')) {
        console.log('🔄 [EquipesApi] Tentando buscar com cast de tipo...');
        const { data: dataAlternativa, error: errorAlternativa } = await supabase
          .from('colaboradores')
          .select('id, name, position, email, phone, cpf, status, equipe_id, tipo_equipe, company_id, created_at, updated_at')
          .eq('equipe_id::text', equipeId)
          .is('deleted_at', null)
          .order('name', { ascending: true });
        
        if (errorAlternativa) {
          console.error('❌ [EquipesApi] Erro na busca alternativa:', errorAlternativa);
          throw errorAlternativa;
        }
        
        console.log(`✅ [EquipesApi] Colaboradores encontrados (busca alternativa): ${dataAlternativa?.length || 0}`);
        return dataAlternativa || [];
      }
      
      throw error;
    }

    console.log(`✅ [EquipesApi] Colaboradores encontrados: ${data?.length || 0}`);
    if (data && data.length > 0) {
      console.log('📋 [EquipesApi] Colaboradores:', data.map(c => ({
        id: c.id,
        name: c.name,
        position: c.position,
        equipe_id: c.equipe_id
      })));
    } else {
      console.log('ℹ️ [EquipesApi] Nenhum colaborador encontrado para esta equipe');
    }
    
    return data || []
  } catch (error) {
    console.error('❌ [EquipesApi] Erro geral ao buscar colaboradores da equipe:', error)
    throw error
  }
}


