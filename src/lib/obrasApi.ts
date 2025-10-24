import { supabase } from './supabase'

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface Obra {
  id: string
  company_id: string
  client_id?: string | null
  name: string
  description?: string | null
  status: 'planejamento' | 'andamento' | 'concluida' | 'cancelada'
  start_date?: string | null
  expected_end_date?: string | null
  end_date?: string | null
  contract_value?: number | null
  executed_value?: number | null
  location?: string | null
  city?: string | null
  state?: string | null
  observations?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  // Relacionamentos
  client?: {
    id: string
    name: string
  } | null
}

export interface ObraInsertData {
  company_id: string
  client_id?: string | null
  name: string
  description?: string | null
  status?: 'planejamento' | 'andamento' | 'concluida' | 'cancelada'
  start_date?: string | null
  expected_end_date?: string | null
  end_date?: string | null
  contract_value?: number | null
  executed_value?: number | null
  location?: string | null
  city?: string | null
  state?: string | null
  observations?: string | null
}

export interface ObraUpdateData {
  client_id?: string | null
  name?: string
  description?: string | null
  status?: 'planejamento' | 'andamento' | 'concluida' | 'cancelada'
  start_date?: string | null
  expected_end_date?: string | null
  end_date?: string | null
  contract_value?: number | null
  executed_value?: number | null
  location?: string | null
  city?: string | null
  state?: string | null
  observations?: string | null
}

export interface ObraFilters {
  search?: string
  status?: string
  client_id?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
}

export interface ObraStats {
  total: number
  planejamento: number
  andamento: number
  concluida: number
  cancelada: number
  valor_total_contratos: number
  valor_total_executado: number
  metragem_total: number
  metragem_executada: number
  media_metragem_por_rua: number
  media_toneladas_por_rua: number
  media_espessura_por_rua: number
  faturamento_previsto: number
  faturamento_bruto: number
}

// =====================================================
// FUNÇÕES DA API
// =====================================================

/**
 * Busca todas as obras com filtros e paginação
 */
export async function getObras(
  companyId: string,
  filters: ObraFilters = {}
): Promise<{ data: Obra[]; total: number }> {
  try {
    let query = supabase
      .from('obras')
      .select(`
        *,
        client:client_id (
          id,
          name
        )
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)

    // Aplicar filtros
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters.start_date) {
      query = query.gte('start_date', filters.start_date)
    }

    if (filters.end_date) {
      query = query.lte('expected_end_date', filters.end_date)
    }

    // Ordenação
    query = query.order('created_at', { ascending: false })

    // Paginação
    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar obras:', error)
      throw new Error(`Erro ao buscar obras: ${error.message}`)
    }

    return {
      data: data || [],
      total: count || 0
    }
  } catch (error) {
    console.error('Erro ao buscar obras:', error)
    throw error
  }
}

/**
 * Busca uma obra específica por ID
 */
export async function getObraById(obraId: string): Promise<Obra | null> {
  try {
    const { data, error } = await supabase
      .from('obras')
      .select(`
        *,
        client:client_id (
          id,
          name
        )
      `)
      .eq('id', obraId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Obra não encontrada
      }
      console.error('Erro ao buscar obra:', error)
      throw new Error(`Erro ao buscar obra: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar obra:', error)
    throw error
  }
}

/**
 * Cria uma nova obra
 */
export async function createObra(obraData: ObraInsertData): Promise<Obra> {
  try {
    const { data, error } = await supabase
      .from('obras')
      .insert(obraData)
      .select(`
        *,
        client:client_id (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao criar obra:', error)
      throw new Error(`Erro ao criar obra: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao criar obra:', error)
    throw error
  }
}

/**
 * Atualiza uma obra existente
 */
export async function updateObra(obraId: string, obraData: ObraUpdateData): Promise<Obra> {
  try {
    const { data, error } = await supabase
      .from('obras')
      .update({
        ...obraData,
        updated_at: new Date().toISOString()
      })
      .eq('id', obraId)
      .select(`
        *,
        client:client_id (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar obra:', error)
      throw new Error(`Erro ao atualizar obra: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar obra:', error)
    throw error
  }
}

/**
 * Exclui uma obra (soft delete)
 */
export async function deleteObra(obraId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('obras')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', obraId)

    if (error) {
      console.error('Erro ao excluir obra:', error)
      throw new Error(`Erro ao excluir obra: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro ao excluir obra:', error)
    throw error
  }
}

/**
 * Busca estatísticas das obras
 */
export async function getEstatisticasObras(companyId: string): Promise<ObraStats> {
  try {
    console.log('🔍 Buscando estatísticas para companyId:', companyId)
    
    // Buscar obras com todos os campos necessários para estatísticas
    const { data, error } = await supabase
      .from('obras')
      .select(`
        id,
        status,
        contract_value,
        executed_value
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (error) {
      console.error('❌ Erro ao buscar estatísticas:', error)
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }

    console.log('📊 Obras encontradas para estatísticas:', data?.length || 0)

    const obras = data || []
    const total = obras.length

    // Contar por status
    const statusCount = obras.reduce((acc, obra) => {
      acc[obra.status] = (acc[obra.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calcular valores totais
    const valor_total_contratos = obras.reduce((total, obra) => 
      total + (obra.contract_value || 0), 0
    )
    
    const valor_total_executado = obras.reduce((total, obra) => 
      total + (obra.executed_value || 0), 0
    )

    // Buscar dados reais de faturamentos para calcular metragem e médias
    let metragem_total = 0
    let metragem_executada = 0
    let media_metragem_por_rua = 0
    let media_toneladas_por_rua = 0
    let media_espessura_por_rua = 0
    let faturamento_previsto = 0
    let faturamento_bruto = 0

    try {
      // Buscar faturamentos com dados completos
      const { data: faturamentos, error: fatError } = await supabase
        .from('obras_financeiro_faturamentos')
        .select('metragem_executada, toneladas_utilizadas, espessura_calculada, valor_total')
        .in('obra_id', obras.map(o => o.id))

      if (!fatError && faturamentos) {
        metragem_executada = faturamentos.reduce((total, fat) => total + (fat.metragem_executada || 0), 0)
        faturamento_bruto = faturamentos.reduce((total, fat) => total + (fat.valor_total || 0), 0)
      }

      // Buscar ruas criadas para calcular médias (não apenas concluídas)
      const { data: ruas, error: ruasError } = await supabase
        .from('obras_ruas')
        .select('metragem_planejada, toneladas_planejadas, status')
        .in('obra_id', obras.map(o => o.id))
        .is('deleted_at', null)

      if (!ruasError && ruas) {
        metragem_total = ruas.reduce((total, rua) => total + (rua.metragem_planejada || 0), 0)
        
        // Calcular médias baseadas em todas as ruas criadas (não apenas concluídas)
        if (ruas.length > 0) {
          // Média de metragem por rua criada
          const totalMetragemCriadas = ruas.reduce((total, rua) => total + (rua.metragem_planejada || 0), 0)
          media_metragem_por_rua = totalMetragemCriadas / ruas.length
          
          // Média de toneladas por rua criada
          const totalToneladasCriadas = ruas.reduce((total, rua) => total + (rua.toneladas_planejadas || 0), 0)
          media_toneladas_por_rua = totalToneladasCriadas / ruas.length
          
          // Média de espessura por rua criada (baseada nos faturamentos)
          if (faturamentos && faturamentos.length > 0) {
            const totalEspessura = faturamentos.reduce((total, fat) => total + (fat.espessura_calculada || 0), 0)
            media_espessura_por_rua = totalEspessura / faturamentos.length
          }
        }
      }

      // Calcular faturamento previsto (valor total dos contratos)
      faturamento_previsto = obras.reduce((total, obra) => total + (obra.contract_value || 0), 0)

    } catch (error) {
      console.error('Erro ao buscar metragem:', error)
      // Manter valores padrão se houver erro
    }

    const stats = {
      total,
      planejamento: statusCount.planejamento || 0,
      andamento: statusCount.andamento || 0,
      concluida: statusCount.concluida || 0,
      cancelada: statusCount.cancelada || 0,
      valor_total_contratos,
      valor_total_executado,
      metragem_total,
      metragem_executada,
      media_metragem_por_rua,
      media_toneladas_por_rua,
      media_espessura_por_rua,
      faturamento_previsto,
      faturamento_bruto
    }

    console.log('📈 Estatísticas calculadas:', stats)
    return stats
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }
}

/**
 * Busca obras simples para dropdowns
 */
export async function getObrasSimples(companyId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data, error } = await supabase
      .from('obras')
      .select('id, name')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name')

    if (error) {
      console.error('Erro ao buscar obras simples:', error)
      throw new Error(`Erro ao buscar obras simples: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar obras simples:', error)
    throw error
  }
}

/**
 * Atualiza status de uma obra
 */
export async function updateObraStatus(
  obraId: string, 
  status: 'planejamento' | 'andamento' | 'concluida' | 'cancelada'
): Promise<Obra> {
  try {
    const updateData: ObraUpdateData = { status }
    
    // Se está sendo concluída, definir data de conclusão
    if (status === 'concluida') {
      updateData.end_date = new Date().toISOString().split('T')[0]
    }

    return await updateObra(obraId, updateData)
  } catch (error) {
    console.error('Erro ao atualizar status da obra:', error)
    throw error
  }
}
