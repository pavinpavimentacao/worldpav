/**
 * API para gerenciamento de Clientes
 * Conecta com a tabela 'clients' no Supabase
 * 
 * Gerencia clientes da empresa com informações de pavimentação
 */

import { supabase } from './supabase'

// ============================================================================
// TIPOS PARA CLIENTES (Baseados nos campos reais do banco)
// ============================================================================

export interface Cliente {
  id: string
  company_id: string
  name: string
  cpf_cnpj?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  observations?: string | null
  // Novos campos
  representante?: string | null
  empresa?: string | null
  tipo_cliente?: string | null
  area_atuacao?: string | null
  empresa_responsavel_id?: string | null
  // Relacionamento
  empresa_responsavel?: {
    id: string
    name: string
  } | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface ClienteInsertData {
  company_id: string
  name: string
  cpf_cnpj?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  observations?: string | null
  // Novos campos
  representante?: string | null
  empresa?: string | null
  tipo_cliente?: string | null
  area_atuacao?: string | null
  empresa_responsavel_id?: string | null
}

export interface ClienteUpdateData {
  name?: string
  cpf_cnpj?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  observations?: string | null
  // Novos campos
  representante?: string | null
  empresa?: string | null
  tipo_cliente?: string | null
  area_atuacao?: string | null
  empresa_responsavel_id?: string | null
}

export interface ClienteFilters {
  searchTerm?: string
  client_type?: 'construtora' | 'prefeitura' | 'empresa_privada' | 'incorporadora' | 'todos'
  responsible_company?: 'WorldPav' | 'Pavin' | 'todos'
}

export interface ClienteStats {
  total: number
  worldpav: number
  pavin: number
  por_tipo: Array<{
    tipo: string
    quantidade: number
  }>
}

// ============================================================================
// FUNÇÕES DA API
// ============================================================================

/**
 * Busca todos os clientes com filtros opcionais
 */
export async function getClientes(
  companyId: string,
  filters?: ClienteFilters
): Promise<Cliente[]> {
  try {
    let query = supabase
      .from('clients')
      .select(`
        id,
        company_id,
        name,
        cpf_cnpj,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        observations,
        representante,
        empresa,
        tipo_cliente,
        area_atuacao,
        empresa_responsavel_id,
        empresa_responsavel:empresa_responsavel_id (
          id,
          name
        ),
        created_at,
        updated_at,
        deleted_at
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    // Aplicar filtros
    if (filters) {
      // Filtro de tipo de cliente
      if (filters.client_type && filters.client_type !== 'todos') {
        query = query.eq('client_type', filters.client_type)
      }

      // Filtro de empresa responsável
      if (filters.responsible_company && filters.responsible_company !== 'todos') {
        query = query.eq('responsible_company', filters.responsible_company)
      }

      // Busca por nome, empresa, representante, email ou telefone
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const term = filters.searchTerm.trim()
        query = query.or(
          `name.ilike.%${term}%,empresa.ilike.%${term}%,representante.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
        )
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar clientes:', error)
      throw new Error(`Erro ao buscar clientes: ${error.message}`)
    }

    console.log('Clientes encontrados:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    throw error
  }
}

/**
 * Busca cliente por ID
 */
export async function getClienteById(
  id: string
): Promise<Cliente | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        id,
        company_id,
        name,
        cpf_cnpj,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        observations,
        representante,
        empresa,
        tipo_cliente,
        area_atuacao,
        empresa_responsavel_id,
        empresa_responsavel:empresa_responsavel_id (
          id,
          name
        ),
        created_at,
        updated_at,
        deleted_at
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Não encontrado
      }
      console.error('Erro ao buscar cliente:', error)
      throw new Error(`Erro ao buscar cliente: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    throw error
  }
}

/**
 * Cria novo cliente
 */
export async function createCliente(
  data: ClienteInsertData
): Promise<Cliente> {
  try {
    // Garantir que o campo 'name' seja preenchido
    const insertData = {
      ...data,
      name: data.name || data.company_name || data.rep_name || 'Cliente sem nome'
    }

    const { data: created, error } = await supabase
      .from('clients')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar cliente:', error)
      throw new Error(`Erro ao criar cliente: ${error.message}`)
    }

    return created
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    throw error
  }
}

/**
 * Atualiza cliente existente
 */
export async function updateCliente(
  id: string,
  data: ClienteUpdateData
): Promise<Cliente> {
  try {
    // Garantir que o campo 'name' seja preenchido se necessário
    const updateData = {
      ...data,
      ...(data.name || data.company_name || data.rep_name ? {
        name: data.name || data.company_name || data.rep_name
      } : {})
    }

    const { data: updated, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw new Error(`Erro ao atualizar cliente: ${error.message}`)
    }

    return updated
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    throw error
  }
}

/**
 * Deleta cliente (soft delete)
 */
export async function deleteCliente(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar cliente:', error)
      throw new Error(`Erro ao deletar cliente: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    throw error
  }
}

/**
 * Busca estatísticas de clientes
 */
export async function getEstatisticasClientes(
  companyId: string
): Promise<ClienteStats> {
  try {
    // Buscar clientes com todos os campos necessários para estatísticas
    const { data, error, count } = await supabase
      .from('clients')
      .select(`
        id,
        empresa_responsavel_id,
        tipo_cliente,
        empresa_responsavel:empresa_responsavel_id (
          id,
          name
        )
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
    }

    const clientes = data || []
    const total = clientes.length

    // Contar por empresa responsável
    let worldpav = 0
    let pavin = 0

    clientes.forEach(cliente => {
      if (cliente.empresa_responsavel_id === companyId) {
        worldpav++
      } else if (cliente.empresa_responsavel?.name === 'Pavin') {
        pavin++
      }
    })

    // Contar por tipo de cliente
    const tiposCount: { [key: string]: number } = {}
    clientes.forEach(cliente => {
      const tipo = cliente.tipo_cliente || 'Não informado'
      tiposCount[tipo] = (tiposCount[tipo] || 0) + 1
    })

    const por_tipo = Object.entries(tiposCount).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }))

    return {
      total,
      worldpav,
      pavin,
      por_tipo
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }
}

/**
 * Busca clientes para selects (retorna apenas id e nome)
 */
export async function getClientesSimples(
  companyId: string
): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar clientes simples:', error)
      throw new Error(`Erro ao buscar clientes simples: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar clientes simples:', error)
    throw error
  }
}

/**
 * Busca obras de um cliente (helper para dashboard)
 */
export async function getObrasDoCliente(
  clienteId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('obras')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', clienteId)
      .is('deleted_at', null)

    if (error) {
      console.error('Erro ao buscar obras do cliente:', error)
      throw new Error(`Erro ao buscar obras do cliente: ${error.message}`)
    }

    return count || 0
  } catch (error) {
    console.error('Erro ao buscar obras do cliente:', error)
    throw error
  }
}

