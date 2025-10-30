import { supabase } from './supabase'

export interface Contrato {
  id: string
  company_id: string
  client_id: string
  obra_id?: string | null
  name: string
  type: 'contrato' | 'proposta' | 'termo' | 'aditivo'
  status: 'ativo' | 'vencido' | 'cancelado'
  value?: number | null
  start_date: string
  end_date?: string | null
  file_path?: string | null
  file_name?: string | null
  observations?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface ContratoWithDetails extends Contrato {
  cliente_nome?: string
  obra_nome?: string
}

export interface ContratoFormData {
  client_id: string
  obra_id?: string
  name: string
  type: 'contrato' | 'proposta' | 'termo' | 'aditivo'
  status: 'ativo' | 'vencido' | 'cancelado'
  value?: number
  start_date: string
  end_date?: string
  file_path?: string
  file_name?: string
  observations?: string
}

export class ContratosAPI {
  /**
   * Buscar contratos por cliente
   */
  static async getByClientId(clientId: string): Promise<ContratoWithDetails[]> {
    try {
      console.log('🔍 [ContratosAPI] Buscando contratos para cliente:', clientId)
      
      const { data: contratos, error } = await supabase
        .from('contratos')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          status,
          value,
          start_date,
          end_date,
          file_path,
          file_name,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [ContratosAPI] Erro ao buscar contratos:', error)
        throw new Error(`Erro ao buscar contratos: ${error.message}`)
      }

      if (!contratos || contratos.length === 0) {
        console.log('⚠️ [ContratosAPI] Nenhum contrato encontrado para o cliente')
        return []
      }

      // Buscar detalhes adicionais
      const contratosComDetalhes = await Promise.all(
        contratos.map(async (contrato) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('name')
            .eq('id', contrato.client_id)
            .single()
          
          if (cliente) {
            cliente_nome = cliente.name
          }

          // Buscar nome da obra se existir
          if (contrato.obra_id) {
            const { data: obra } = await supabase
              .from('obras')
              .select('name')
              .eq('id', contrato.obra_id)
              .single()
            
            if (obra) {
              obra_nome = obra.name
            }
          }

          return {
            ...contrato,
            cliente_nome,
            obra_nome
          }
        })
      )

      console.log('✅ [ContratosAPI] Contratos encontrados:', contratosComDetalhes.length)
      return contratosComDetalhes

    } catch (error) {
      console.error('❌ [ContratosAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar contratos por obra
   */
  static async getByObraId(obraId: string): Promise<ContratoWithDetails[]> {
    try {
      console.log('🔍 [ContratosAPI] Buscando contratos para obra:', obraId)
      
      const { data: contratos, error } = await supabase
        .from('contratos')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          status,
          value,
          start_date,
          end_date,
          file_path,
          file_name,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq('obra_id', obraId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [ContratosAPI] Erro ao buscar contratos:', error)
        throw new Error(`Erro ao buscar contratos: ${error.message}`)
      }

      if (!contratos || contratos.length === 0) {
        console.log('⚠️ [ContratosAPI] Nenhum contrato encontrado para a obra')
        return []
      }

      // Buscar detalhes adicionais
      const contratosComDetalhes = await Promise.all(
        contratos.map(async (contrato) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('name')
            .eq('id', contrato.client_id)
            .single()
          
          if (cliente) {
            cliente_nome = cliente.name
          }

          // Buscar nome da obra
          const { data: obra } = await supabase
            .from('obras')
            .select('name')
            .eq('id', contrato.obra_id)
            .single()
          
          if (obra) {
            obra_nome = obra.name
          }

          return {
            ...contrato,
            cliente_nome,
            obra_nome
          }
        })
      )

      console.log('✅ [ContratosAPI] Contratos encontrados:', contratosComDetalhes.length)
      return contratosComDetalhes

    } catch (error) {
      console.error('❌ [ContratosAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar todos os contratos da empresa
   */
  static async getAll(): Promise<ContratoWithDetails[]> {
    try {
      console.log('🔍 [ContratosAPI] Buscando todos os contratos')
      
      const { data: contratos, error } = await supabase
        .from('contratos')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          status,
          value,
          start_date,
          end_date,
          file_path,
          file_name,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [ContratosAPI] Erro ao buscar contratos:', error)
        throw new Error(`Erro ao buscar contratos: ${error.message}`)
      }

      if (!contratos || contratos.length === 0) {
        console.log('⚠️ [ContratosAPI] Nenhum contrato encontrado')
        return []
      }

      // Buscar detalhes adicionais
      const contratosComDetalhes = await Promise.all(
        contratos.map(async (contrato) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('name')
            .eq('id', contrato.client_id)
            .single()
          
          if (cliente) {
            cliente_nome = cliente.name
          }

          // Buscar nome da obra se existir
          if (contrato.obra_id) {
            const { data: obra } = await supabase
              .from('obras')
              .select('name')
              .eq('id', contrato.obra_id)
              .single()
            
            if (obra) {
              obra_nome = obra.name
            }
          }

          return {
            ...contrato,
            cliente_nome,
            obra_nome
          }
        })
      )

      console.log('✅ [ContratosAPI] Contratos encontrados:', contratosComDetalhes.length)
      return contratosComDetalhes

    } catch (error) {
      console.error('❌ [ContratosAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar contrato por ID
   */
  static async getById(id: string): Promise<ContratoWithDetails | null> {
    try {
      console.log('🔍 [ContratosAPI] Buscando contrato por ID:', id)
      
      const { data: contrato, error } = await supabase
        .from('contratos')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          status,
          value,
          start_date,
          end_date,
          file_path,
          file_name,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) {
        console.error('❌ [ContratosAPI] Erro ao buscar contrato:', error)
        throw new Error(`Erro ao buscar contrato: ${error.message}`)
      }

      if (!contrato) {
        console.log('⚠️ [ContratosAPI] Contrato não encontrado')
        return null
      }

      // Buscar detalhes adicionais
      let cliente_nome = 'Cliente não informado'
      let obra_nome = 'Obra não informada'

      // Buscar nome do cliente
      const { data: cliente } = await supabase
        .from('clients')
        .select('name')
        .eq('id', contrato.client_id)
        .single()
      
      if (cliente) {
        cliente_nome = cliente.name
      }

      // Buscar nome da obra se existir
      if (contrato.obra_id) {
        const { data: obra } = await supabase
          .from('obras')
          .select('name')
          .eq('id', contrato.obra_id)
          .single()
        
        if (obra) {
          obra_nome = obra.name
        }
      }

      const contratoComDetalhes = {
        ...contrato,
        cliente_nome,
        obra_nome
      }

      console.log('✅ [ContratosAPI] Contrato encontrado')
      return contratoComDetalhes

    } catch (error) {
      console.error('❌ [ContratosAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Criar novo contrato
   */
  static async create(data: ContratoFormData): Promise<Contrato> {
    try {
      console.log('🔍 [ContratosAPI] Criando novo contrato:', data)
      
      // Buscar company_id do cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('clients')
        .select('company_id')
        .eq('id', data.client_id)
        .single()
      
      if (clienteError || !cliente) {
        console.error('❌ [ContratosAPI] Erro ao buscar company_id do cliente:', clienteError)
        throw new Error('Erro ao buscar dados do cliente')
      }
      
      const { data: contrato, error } = await supabase
        .from('contratos')
        .insert([{
          company_id: cliente.company_id,
          client_id: data.client_id,
          obra_id: data.obra_id || null,
          name: data.name,
          type: data.type,
          status: data.status,
          value: data.value || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
          file_path: data.file_path || null,
          file_name: data.file_name || null,
          observations: data.observations || null
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ [ContratosAPI] Erro ao criar contrato:', error)
        throw new Error(`Erro ao criar contrato: ${error.message}`)
      }

      console.log('✅ [ContratosAPI] Contrato criado com sucesso')
      return contrato

    } catch (error) {
      console.error('❌ [ContratosAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Atualizar contrato
   */
  static async update(id: string, data: Partial<ContratoFormData>): Promise<Contrato> {
    try {
      console.log('🔍 [ContratosAPI] Atualizando contrato:', id, data)
      
      const { data: contrato, error } = await supabase
        .from('contratos')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ [ContratosAPI] Erro ao atualizar contrato:', error)
        throw new Error(`Erro ao atualizar contrato: ${error.message}`)
      }

      console.log('✅ [ContratosAPI] Contrato atualizado com sucesso')
      return contrato

    } catch (error) {
      console.error('❌ [ContratosAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Deletar contrato (soft delete)
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('🔍 [ContratosAPI] Deletando contrato:', id)
      
      const { error } = await supabase
        .from('contratos')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ [ContratosAPI] Erro ao deletar contrato:', error)
        throw new Error(`Erro ao deletar contrato: ${error.message}`)
      }

      console.log('✅ [ContratosAPI] Contrato deletado com sucesso')

    } catch (error) {
      console.error('❌ [ContratosAPI] Erro geral:', error)
      throw error
    }
  }
}
