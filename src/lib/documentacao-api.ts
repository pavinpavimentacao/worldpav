import { supabase } from './supabase'

export interface Documentacao {
  id: string
  company_id: string
  client_id: string
  obra_id?: string | null
  name: string
  type: 'nrs' | 'licenca' | 'certificado' | 'outros'
  category?: string | null
  valid_from?: string | null
  valid_until?: string | null
  file_path?: string | null
  file_name?: string | null
  status: 'ativo' | 'vencido' | 'proximo_vencimento'
  observations?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface DocumentacaoWithDetails extends Documentacao {
  cliente_nome?: string
  obra_nome?: string
}

export interface DocumentacaoFormData {
  client_id: string
  obra_id?: string
  name: string
  type: 'nrs' | 'licenca' | 'certificado' | 'outros'
  category?: string
  valid_from?: string
  valid_until?: string
  file_path?: string
  file_name?: string
  status: 'ativo' | 'vencido' | 'proximo_vencimento'
  observations?: string
}

export class DocumentacaoAPI {
  /**
   * Buscar documentação por cliente
   */
  static async getByClientId(clientId: string): Promise<DocumentacaoWithDetails[]> {
    try {
      console.log('🔍 [DocumentacaoAPI] Buscando documentação para cliente:', clientId)
      
      const { data: documentacao, error } = await supabase
        .from('documentacao')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          category,
          valid_from,
          valid_until,
          file_path,
          file_name,
          status,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao buscar documentação:', error)
        throw new Error(`Erro ao buscar documentação: ${error.message}`)
      }

      if (!documentacao || documentacao.length === 0) {
        console.log('⚠️ [DocumentacaoAPI] Nenhuma documentação encontrada para o cliente')
        return []
      }

      // Buscar detalhes adicionais
      const documentacaoComDetalhes = await Promise.all(
        documentacao.map(async (doc) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('name')
            .eq('id', doc.client_id)
            .single()
          
          if (cliente) {
            cliente_nome = cliente.name
          }

          // Buscar nome da obra se existir
          if (doc.obra_id) {
            const { data: obra } = await supabase
              .from('obras')
              .select('name')
              .eq('id', doc.obra_id)
              .single()
            
            if (obra) {
              obra_nome = obra.name
            }
          }

          return {
            ...doc,
            cliente_nome,
            obra_nome
          }
        })
      )

      console.log('✅ [DocumentacaoAPI] Documentação encontrada:', documentacaoComDetalhes.length)
      return documentacaoComDetalhes

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar documentação por obra
   */
  static async getByObraId(obraId: string): Promise<DocumentacaoWithDetails[]> {
    try {
      console.log('🔍 [DocumentacaoAPI] Buscando documentação para obra:', obraId)
      
      const { data: documentacao, error } = await supabase
        .from('documentacao')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          category,
          valid_from,
          valid_until,
          file_path,
          file_name,
          status,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq('obra_id', obraId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao buscar documentação:', error)
        throw new Error(`Erro ao buscar documentação: ${error.message}`)
      }

      if (!documentacao || documentacao.length === 0) {
        console.log('⚠️ [DocumentacaoAPI] Nenhuma documentação encontrada para a obra')
        return []
      }

      // Buscar detalhes adicionais
      const documentacaoComDetalhes = await Promise.all(
        documentacao.map(async (doc) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('name')
            .eq('id', doc.client_id)
            .single()
          
          if (cliente) {
            cliente_nome = cliente.name
          }

          // Buscar nome da obra
          const { data: obra } = await supabase
            .from('obras')
            .select('name')
            .eq('id', doc.obra_id)
            .single()
          
          if (obra) {
            obra_nome = obra.name
          }

          return {
            ...doc,
            cliente_nome,
            obra_nome
          }
        })
      )

      console.log('✅ [DocumentacaoAPI] Documentação encontrada:', documentacaoComDetalhes.length)
      return documentacaoComDetalhes

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar todas as documentações da empresa
   */
  static async getAll(): Promise<DocumentacaoWithDetails[]> {
    try {
      console.log('🔍 [DocumentacaoAPI] Buscando toda a documentação')
      
      const { data: documentacao, error } = await supabase
        .from('documentacao')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          category,
          valid_from,
          valid_until,
          file_path,
          file_name,
          status,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao buscar documentação:', error)
        throw new Error(`Erro ao buscar documentação: ${error.message}`)
      }

      if (!documentacao || documentacao.length === 0) {
        console.log('⚠️ [DocumentacaoAPI] Nenhuma documentação encontrada')
        return []
      }

      // Buscar detalhes adicionais
      const documentacaoComDetalhes = await Promise.all(
        documentacao.map(async (doc) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('name')
            .eq('id', doc.client_id)
            .single()
          
          if (cliente) {
            cliente_nome = cliente.name
          }

          // Buscar nome da obra se existir
          if (doc.obra_id) {
            const { data: obra } = await supabase
              .from('obras')
              .select('name')
              .eq('id', doc.obra_id)
              .single()
            
            if (obra) {
              obra_nome = obra.name
            }
          }

          return {
            ...doc,
            cliente_nome,
            obra_nome
          }
        })
      )

      console.log('✅ [DocumentacaoAPI] Documentação encontrada:', documentacaoComDetalhes.length)
      return documentacaoComDetalhes

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar documentação por ID
   */
  static async getById(id: string): Promise<DocumentacaoWithDetails | null> {
    try {
      console.log('🔍 [DocumentacaoAPI] Buscando documentação por ID:', id)
      
      const { data: doc, error } = await supabase
        .from('documentacao')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          category,
          valid_from,
          valid_until,
          file_path,
          file_name,
          status,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao buscar documentação:', error)
        throw new Error(`Erro ao buscar documentação: ${error.message}`)
      }

      if (!doc) {
        console.log('⚠️ [DocumentacaoAPI] Documentação não encontrada')
        return null
      }

      // Buscar detalhes adicionais
      let cliente_nome = 'Cliente não informado'
      let obra_nome = 'Obra não informada'

      // Buscar nome do cliente
      const { data: cliente } = await supabase
        .from('clients')
        .select('name')
        .eq('id', doc.client_id)
        .single()
      
      if (cliente) {
        cliente_nome = cliente.name
      }

      // Buscar nome da obra se existir
      if (doc.obra_id) {
        const { data: obra } = await supabase
          .from('obras')
          .select('name')
          .eq('id', doc.obra_id)
          .single()
        
        if (obra) {
          obra_nome = obra.name
        }
      }

      const documentacaoComDetalhes = {
        ...doc,
        cliente_nome,
        obra_nome
      }

      console.log('✅ [DocumentacaoAPI] Documentação encontrada')
      return documentacaoComDetalhes

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Criar nova documentação
   */
  static async create(data: DocumentacaoFormData): Promise<Documentacao> {
    try {
      console.log('🔍 [DocumentacaoAPI] Criando nova documentação:', data)
      
      // Buscar company_id do cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('clients')
        .select('company_id')
        .eq('id', data.client_id)
        .single()
      
      if (clienteError || !cliente) {
        console.error('❌ [DocumentacaoAPI] Erro ao buscar company_id do cliente:', clienteError)
        throw new Error('Erro ao buscar dados do cliente')
      }
      
      const { data: doc, error } = await supabase
        .from('documentacao')
        .insert([{
          company_id: cliente.company_id,
          client_id: data.client_id,
          obra_id: data.obra_id || null,
          name: data.name,
          type: data.type,
          category: data.category || null,
          valid_from: data.valid_from || null,
          valid_until: data.valid_until || null,
          file_path: data.file_path || null,
          file_name: data.file_name || null,
          status: data.status,
          observations: data.observations || null
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao criar documentação:', error)
        throw new Error(`Erro ao criar documentação: ${error.message}`)
      }

      console.log('✅ [DocumentacaoAPI] Documentação criada com sucesso')
      return doc

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Atualizar documentação
   */
  static async update(id: string, data: Partial<DocumentacaoFormData>): Promise<Documentacao> {
    try {
      console.log('🔍 [DocumentacaoAPI] Atualizando documentação:', id, data)
      
      const { data: doc, error } = await supabase
        .from('documentacao')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao atualizar documentação:', error)
        throw new Error(`Erro ao atualizar documentação: ${error.message}`)
      }

      console.log('✅ [DocumentacaoAPI] Documentação atualizada com sucesso')
      return doc

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Deletar documentação (soft delete)
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('🔍 [DocumentacaoAPI] Deletando documentação:', id)
      
      const { error } = await supabase
        .from('documentacao')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao deletar documentação:', error)
        throw new Error(`Erro ao deletar documentação: ${error.message}`)
      }

      console.log('✅ [DocumentacaoAPI] Documentação deletada com sucesso')

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Verificar documentações próximas do vencimento
   */
  static async getProximasVencimento(days: number = 30): Promise<DocumentacaoWithDetails[]> {
    try {
      console.log('🔍 [DocumentacaoAPI] Buscando documentações próximas do vencimento:', days, 'dias')
      
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      const futureDateStr = futureDate.toISOString().split('T')[0]

      const { data: documentacao, error } = await supabase
        .from('documentacao')
        .select(`
          id,
          company_id,
          client_id,
          obra_id,
          name,
          type,
          category,
          valid_from,
          valid_until,
          file_path,
          file_name,
          status,
          observations,
          created_at,
          updated_at,
          deleted_at
        `)
        .lte('valid_until', futureDateStr)
        .gte('valid_until', new Date().toISOString().split('T')[0])
        .is('deleted_at', null)
        .order('valid_until', { ascending: true })

      if (error) {
        console.error('❌ [DocumentacaoAPI] Erro ao buscar documentações próximas do vencimento:', error)
        throw new Error(`Erro ao buscar documentações próximas do vencimento: ${error.message}`)
      }

      if (!documentacao || documentacao.length === 0) {
        console.log('⚠️ [DocumentacaoAPI] Nenhuma documentação próxima do vencimento encontrada')
        return []
      }

      // Buscar detalhes adicionais
      const documentacaoComDetalhes = await Promise.all(
        documentacao.map(async (doc) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar nome do cliente
          const { data: cliente } = await supabase
            .from('clients')
            .select('name')
            .eq('id', doc.client_id)
            .single()
          
          if (cliente) {
            cliente_nome = cliente.name
          }

          // Buscar nome da obra se existir
          if (doc.obra_id) {
            const { data: obra } = await supabase
              .from('obras')
              .select('name')
              .eq('id', doc.obra_id)
              .single()
            
            if (obra) {
              obra_nome = obra.name
            }
          }

          return {
            ...doc,
            cliente_nome,
            obra_nome
          }
        })
      )

      console.log('✅ [DocumentacaoAPI] Documentações próximas do vencimento encontradas:', documentacaoComDetalhes.length)
      return documentacaoComDetalhes

    } catch (error) {
      console.error('❌ [DocumentacaoAPI] Erro geral:', error)
      throw error
    }
  }
}
