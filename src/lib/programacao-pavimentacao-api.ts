
import { supabase } from './supabase'
import type { ProgramacaoPavimentacao } from '../types/programacao-pavimentacao'

export interface ProgramacaoPavimentacaoWithDetails extends ProgramacaoPavimentacao {
  obra_nome?: string
  cliente_nome?: string
  rua_nome?: string
  obra_id?: string
  maquinarios_nomes?: string[]
}

export class ProgramacaoPavimentacaoAPI {
  /**
   * Buscar programações por cliente
   */
  static async getByClientId(clientId: string): Promise<ProgramacaoPavimentacaoWithDetails[]> {
    // Buscar obras do cliente primeiro
    const { data: obras } = await supabase
      .from('obras')
      .select('id')
      .eq('client_id', clientId)

    if (!obras || obras.length === 0) {
      return []
    }

    const obraIds = obras.map(o => o.id)

    return this.getAll().then(programacoes => 
      programacoes.filter(p => obraIds.includes(p.obra_id))
    )
  }

  /**
   * Buscar programações por obra
   */
  static async getByObraId(obraId: string): Promise<ProgramacaoPavimentacaoWithDetails[]> {
    return this.getAll().then(programacoes => 
      programacoes.filter(p => p.obra_id === obraId)
    )
  }

  /**
   * Buscar todas as programações da empresa
   */
  static async getAll(): Promise<ProgramacaoPavimentacaoWithDetails[]> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Buscando todas as programações')
      
      // Buscar todos os maquinários primeiro para mapear IDs para nomes
      const { data: maquinarios, error: maquinariosError } = await supabase
        .from('maquinarios')
        .select('id, name')
      
      // Criar mapa de ID para nome
      const maquinariosMap = new Map()
      if (maquinariosError) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar maquinários:', maquinariosError)
      }
      
      if (maquinarios) {
        console.log('✅ [ProgramacaoPavimentacaoAPI] Maquinários encontrados:', maquinarios.length)
        maquinarios.forEach(m => maquinariosMap.set(m.id, m.name))
      } else {
        console.warn('⚠️ [ProgramacaoPavimentacaoAPI] Nenhum maquinário encontrado')
      }
      
      const { data: programacoes, error } = await supabase
        .from('programacao_pavimentacao')
        .select(`
          id,
          date,
          status,
          team,
          equipment,
          observations,
          company_id,
          created_at,
          updated_at,
          obra_id,
          metragem_prevista,
          quantidade_toneladas,
          faixa_realizar,
          horario_inicio,
          espessura_media_solicitada,
          tipo_servico,
          rua_id
        `)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar programações:', error)
        throw new Error(`Erro ao buscar programações: ${error.message}`)
      }

      if (!programacoes || programacoes.length === 0) {
        console.log('⚠️ [ProgramacaoPavimentacaoAPI] Nenhuma programação encontrada')
        return []
      }

      console.log('📋 [ProgramacaoPavimentacaoAPI] Programações encontradas (raw):', programacoes.length)

      // Buscar detalhes adicionais das obras
      const programacoesComDetalhes = await Promise.all(
        programacoes.map(async (prog) => {
          console.log('🔍 [ProgramacaoPavimentacaoAPI] Processando programação:', prog.id, 'obra_id:', prog.obra_id)
          let obra_nome = 'Obra não informada'
          let cliente_nome = 'Cliente não informado'
          let cliente_id = ''

          // Se temos obra_id, buscar detalhes da obra
          if (prog.obra_id) {
            const { data: obra, error: obraError } = await supabase
              .from('obras')
              .select('name, client_id')
              .eq('id', prog.obra_id)
              .single()
            
            if (obraError) {
              console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar obra:', obraError)
            }
            
            if (obra) {
              obra_nome = obra.name || 'Obra não informada'
              cliente_id = obra.client_id || ''
              console.log('✅ [ProgramacaoPavimentacaoAPI] Obra encontrada:', obra_nome, 'cliente_id:', cliente_id)
              
              // Buscar cliente
              if (obra.client_id) {
                // Debug para verificar o ID do cliente
                console.log('🔍 [ProgramacaoPavimentacaoAPI] Tentando buscar cliente com ID:', obra.client_id)
                
                const { data: cliente, error: clienteError } = await supabase
                  .from('clients')
                  .select('name')
                  .eq('id', obra.client_id)
                  .single()
                
                if (clienteError) {
                  console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar cliente:', clienteError)
                }
                
                if (cliente && cliente.name) {
                  cliente_nome = cliente.name
                  console.log('✅ [ProgramacaoPavimentacaoAPI] Cliente encontrado:', cliente_nome)
                } else {
                  console.warn('⚠️ [ProgramacaoPavimentacaoAPI] Cliente não encontrado para ID:', obra.client_id)
                }
              }
            } else {
              console.warn('⚠️ [ProgramacaoPavimentacaoAPI] Obra não encontrada para ID:', prog.obra_id)
            }
          }

          // Buscar rua se tiver rua_id
          let rua_nome = ''
          if (prog.rua_id) {
            const { data: rua } = await supabase
              .from('obras_ruas')
              .select('name')
              .eq('id', prog.rua_id)
              .is('deleted_at', null)
              .single()
            
            if (rua) {
              rua_nome = rua.name
            }
          }
          
          // Mapear IDs de maquinários para nomes
          let maquinarios_nomes: string[] = []
          if (prog.equipment && Array.isArray(prog.equipment)) {
            console.log('🔍 [ProgramacaoPavimentacaoAPI] Mapeando equipamentos para programação:', prog.id)
            maquinarios_nomes = prog.equipment.map(id => {
              const nome = maquinariosMap.get(id)
              console.log(`🔍 [ProgramacaoPavimentacaoAPI] Mapeando equipamento: ${id} -> ${nome || 'não encontrado'}`)
              return nome || id // Se não encontrar o nome, usa o ID
            })
            console.log('✅ [ProgramacaoPavimentacaoAPI] Equipamentos mapeados:', maquinarios_nomes)
          }

          return {
            id: prog.id,
            data: prog.date || '',
            cliente_id,
            cliente_nome,
            obra: obra_nome,
            obra_id: prog.obra_id, // ✅ Preservar o ID da obra
            obra_nome: obra_nome,
            rua: rua_nome,
            rua_id: prog.rua_id, // ✅ Preservar o ID da rua
            rua_nome: rua_nome,
            prefixo_equipe: prog.team || '',
            maquinarios: prog.equipment || [],
            maquinarios_nomes: maquinarios_nomes,
            metragem_prevista: prog.metragem_prevista || 0,
            quantidade_toneladas: prog.quantidade_toneladas || 0,
            faixa_realizar: prog.faixa_realizar || '',
            horario_inicio: prog.horario_inicio || '',
            espessura_media_solicitada: prog.espessura_media_solicitada,
            tipo_servico: prog.tipo_servico,
            observacoes: prog.observations || '',
            status: prog.status as any,
            confirmada: prog.status === 'concluido',
            company_id: prog.company_id,
            created_at: prog.created_at,
            updated_at: prog.updated_at
          } as ProgramacaoPavimentacaoWithDetails
        })
      )

      console.log('✅ [ProgramacaoPavimentacaoAPI] Programações encontradas:', programacoesComDetalhes.length)
      return programacoesComDetalhes

    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar programação por ID
   */
  static async getById(id: string): Promise<ProgramacaoPavimentacaoWithDetails | null> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Buscando programação por ID:', id)
      
      // Buscar todos os maquinários primeiro para mapear IDs para nomes
      const { data: maquinarios, error: maquinariosError } = await supabase
        .from('maquinarios')
        .select('id, name')
      
      // Criar mapa de ID para nome
      const maquinariosMap = new Map()
      if (maquinariosError) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar maquinários:', maquinariosError)
      }
      
      if (maquinarios) {
        console.log('✅ [ProgramacaoPavimentacaoAPI] Maquinários encontrados:', maquinarios.length)
        maquinarios.forEach(m => maquinariosMap.set(m.id, m.name))
      } else {
        console.warn('⚠️ [ProgramacaoPavimentacaoAPI] Nenhum maquinário encontrado')
      }
      
      const { data: programacao, error } = await supabase
        .from('programacao_pavimentacao')
        .select(`
          id,
          date,
          status,
          team,
          equipment,
          observations,
          company_id,
          created_at,
          updated_at,
          obra_id,
          metragem_prevista,
          quantidade_toneladas,
          faixa_realizar,
          horario_inicio,
          espessura_media_solicitada,
          tipo_servico,
          rua_id
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar programação:', error)
        throw new Error(`Erro ao buscar programação: ${error.message}`)
      }

      if (!programacao) {
        console.log('⚠️ [ProgramacaoPavimentacaoAPI] Programação não encontrada')
        return null
      }

      // Buscar detalhes adicionais da obra
      let obra_nome = 'Obra não informada'
      let cliente_nome = 'Cliente não informado'
      let cliente_id = ''

      if (programacao.obra_id) {
        const { data: obra, error: obraError } = await supabase
          .from('obras')
          .select('name, client_id')
          .eq('id', programacao.obra_id)
          .single()
        
        if (obraError) {
          console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar obra:', obraError)
        }
        
        if (obra) {
          obra_nome = obra.name || 'Obra não informada'
          cliente_id = obra.client_id || ''
          
          if (obra.client_id) {
            const { data: cliente, error: clienteError } = await supabase
              .from('clientes')
              .select('name')
              .eq('id', obra.client_id)
              .single()
            
            if (clienteError) {
              console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar cliente:', clienteError)
            }
            
            if (cliente && cliente.name) {
              cliente_nome = cliente.name
            } else {
              console.warn('⚠️ [ProgramacaoPavimentacaoAPI] Cliente não encontrado para ID:', obra.client_id)
            }
          }
        } else {
          console.warn('⚠️ [ProgramacaoPavimentacaoAPI] Obra não encontrada para ID:', programacao.obra_id)
        }
      }

      // Buscar rua se tiver rua_id
      let rua_nome = ''
      if (programacao.rua_id) {
        const { data: rua } = await supabase
          .from('obras_ruas')
          .select('name')
          .eq('id', programacao.rua_id)
          .is('deleted_at', null)
          .single()
        
        if (rua) {
          rua_nome = rua.name
        }
      }
      
      // Mapear IDs de maquinários para nomes
      let maquinarios_nomes: string[] = []
      if (programacao.equipment && Array.isArray(programacao.equipment)) {
        console.log('🔍 [ProgramacaoPavimentacaoAPI] Mapeando equipamentos para programação (getById):', programacao.id)
        maquinarios_nomes = programacao.equipment.map(id => {
          const nome = maquinariosMap.get(id)
          console.log(`🔍 [ProgramacaoPavimentacaoAPI] Mapeando equipamento (getById): ${id} -> ${nome || 'não encontrado'}`)
          return nome || id // Se não encontrar o nome, usa o ID
        })
        console.log('✅ [ProgramacaoPavimentacaoAPI] Equipamentos mapeados (getById):', maquinarios_nomes)
      }

      return {
        id: programacao.id,
        data: programacao.date || '',
        cliente_id,
        cliente_nome,
        obra: obra_nome,
        rua: rua_nome,
        prefixo_equipe: programacao.team || '',
        maquinarios: programacao.equipment || [],
        maquinarios_nomes: maquinarios_nomes,
        metragem_prevista: programacao.metragem_prevista || 0,
        quantidade_toneladas: programacao.quantidade_toneladas || 0,
        faixa_realizar: programacao.faixa_realizar || '',
        horario_inicio: programacao.horario_inicio || '',
        espessura_media_solicitada: programacao.espessura_media_solicitada,
        tipo_servico: programacao.tipo_servico,
        observacoes: programacao.observations || '',
        status: programacao.status as any,
        confirmada: programacao.status === 'concluido',
        company_id: programacao.company_id,
        created_at: programacao.created_at,
        updated_at: programacao.updated_at,
        obra_id: programacao.obra_id,
        obra_nome,
        rua_nome
      } as ProgramacaoPavimentacaoWithDetails

    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Criar nova programação
   */
  static async create(data: any): Promise<ProgramacaoPavimentacao> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Criando programação:', data)
      
      // Converter dados para formato do banco
      const insertData = {
        company_id: data.company_id,
        obra_id: data.obra_id,
        date: data.data,
        status: data.status || 'programado',
        team: data.prefixo_equipe,
        equipment: data.maquinarios || [],
        observations: data.observacoes,
        // ✅ Adicionar TODOS os campos enviados pelo formulário
        metragem_prevista: data.metragem_prevista || 0,
        quantidade_toneladas: data.quantidade_toneladas || 0,
        faixa_realizar: data.faixa_realizar || '',
        rua_id: data.rua_id || null,
        horario_inicio: data.horario_inicio || null,
        tipo_servico: data.tipo_servico || null,
        espessura_media_solicitada: data.espessura_media_solicitada ? parseFloat(data.espessura_media_solicitada) : null
      }

      console.log('📝 [ProgramacaoPavimentacaoAPI] Dados para inserção:', insertData)

      const { data: programacao, error } = await supabase
        .from('programacao_pavimentacao')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao criar:', error)
        throw new Error(`Erro ao criar programação: ${error.message}`)
      }

      console.log('✅ [ProgramacaoPavimentacaoAPI] Programação criada:', programacao)
      return this.getById(programacao.id) as any
    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Deletar programação
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Deletando programação:', id)
      
      const { error } = await supabase
        .from('programacao_pavimentacao')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao deletar:', error)
        throw new Error(`Erro ao deletar programação: ${error.message}`)
      }

      console.log('✅ [ProgramacaoPavimentacaoAPI] Programação deletada')
    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Confirmar programação
   */
  static async confirmar(id: string, data: any): Promise<ProgramacaoPavimentacao> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Confirmando programação:', id)
      
      const updateData: any = {
        status: 'concluido'
      }

      const { error } = await supabase
        .from('programacao_pavimentacao')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao confirmar:', error)
        throw new Error(`Erro ao confirmar programação: ${error.message}`)
      }

      console.log('✅ [ProgramacaoPavimentacaoAPI] Programação confirmada')
      return this.getById(id) as any
    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro geral:', error)
      throw error
    }
  }

  /**
   * Buscar equipes - ATUALIZADO: busca da tabela equipes
   */
  static async getEquipes(): Promise<Array<{ id: string; name: string; prefixo: string; tipo_equipe?: string }>> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Buscando equipes')
      
      // Buscar equipes ativas
      const { data, error } = await supabase
        .from('equipes')
        .select('id, name, prefixo')
        .eq('ativo', true)
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar equipes:', error)
        // Fallback: tentar buscar de colaboradores se tabela equipes não existe
        console.log('⚠️ [ProgramacaoPavimentacaoAPI] Tentando fallback para colaboradores...')
        return []
      }
      
      console.log('✅ [ProgramacaoPavimentacaoAPI] Equipes encontradas:', data?.length || 0)
      
      return (data || []).map(eq => ({
        id: eq.id,
        name: eq.name,
        prefixo: eq.prefixo || '',
        tipo_equipe: undefined // Não usado mais
      }))
    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar equipes:', error)
      return []
    }
  }

  /**
   * Buscar maquinários
   */
  static async getMaquinarios(): Promise<Array<{ id: string; nome: string; tipo: string; prefixo?: string }>> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Buscando maquinários')
      
      const { data, error } = await supabase
        .from('maquinarios')
        .select('id, name, type, plate')
        .is('deleted_at', null)
        .eq('status', 'ativo')
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar maquinários:', error)
        throw error
      }
      
      console.log('✅ [ProgramacaoPavimentacaoAPI] Maquinários encontrados:', data?.length || 0)
      
      return (data || []).map(m => ({
        id: m.id,
        nome: m.name,
        tipo: m.type || '',
        prefixo: m.plate || ''
      }))
    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar maquinários:', error)
      return []
    }
  }

  /**
   * Buscar obras por cliente
   */
  static async getObras(clienteId: string): Promise<Array<{ id: string; name: string; cliente_id: string }>> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('id, name, client_id')
        .eq('client_id', clienteId)

      if (error) throw error
      return (data || []).map(o => ({ ...o, cliente_id: o.client_id }))
    } catch (error) {
      console.error('Erro ao buscar obras:', error)
      return []
    }
  }

  /**
   * Buscar ruas por obra - CORRIGIDO: busca em obras_ruas
   */
  static async getRuas(obraId: string): Promise<Array<{ id: string; name: string; obra_id: string; metragem?: number; espessura?: string; faixa?: string }>> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Buscando ruas para obra:', obraId)
      
      const { data, error } = await supabase
        .from('obras_ruas')
        .select('id, name, obra_id, metragem_planejada, espessura_calculada')
        .eq('obra_id', obraId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar ruas:', error)
        throw error
      }
      
      console.log('✅ [ProgramacaoPavimentacaoAPI] Ruas encontradas:', data?.length || 0)
      
      // Mapear para o formato esperado
      return (data || []).map(rua => ({
        id: rua.id,
        name: rua.name,
        obra_id: rua.obra_id,
        metragem: rua.metragem_planejada ? parseFloat(rua.metragem_planejada) : undefined,
        espessura: rua.espessura_calculada ? rua.espessura_calculada.toString() : undefined,
        faixa: undefined // Campo não existe em obras_ruas
      }))
    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar ruas:', error)
      return []
    }
  }

  /**
   * Buscar detalhes da rua - CORRIGIDO: busca em obras_ruas
   */
  static async getRuaDetails(ruaId: string): Promise<any> {
    try {
      console.log('🔍 [ProgramacaoPavimentacaoAPI] Buscando detalhes da rua:', ruaId)
      
      const { data, error } = await supabase
        .from('obras_ruas')
        .select('*')
        .eq('id', ruaId)
        .is('deleted_at', null)
        .single()

      if (error) {
        console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar detalhes da rua:', error)
        throw error
      }
      
      console.log('✅ [ProgramacaoPavimentacaoAPI] Detalhes da rua encontrados')
      
      return data
    } catch (error) {
      console.error('❌ [ProgramacaoPavimentacaoAPI] Erro ao buscar detalhes da rua:', error)
      return null
    }
  }

  /**
   * Buscar clientes
   */
  static async getClientes(): Promise<Array<{ id: string; name: string; company_name: string | null }>> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, empresa')

      if (error) throw error
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        company_name: item.empresa
      }))
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return []
    }
  }

  /**
   * Alias para getAll() - mantém compatibilidade
   */
  static async list(): Promise<ProgramacaoPavimentacaoWithDetails[]> {
    return this.getAll()
  }
}