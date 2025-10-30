import { supabase } from './supabase'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'
import type { DashboardKPIs, ProgramacaoItem, ProximaProgramacao, DashboardData } from '../types/dashboard-pavimentacao'

// 🎭 MODO MOCK DESATIVADO - USANDO BANCO DE DADOS REAL
const USE_MOCK = false

// Timezone do projeto
const TIMEZONE = 'America/Sao_Paulo'

/**
 * Converte uma data para o timezone de São Paulo
 */
function toSaoPauloTime(date: Date): Date {
  // São Paulo está UTC-3 (ou UTC-2 no horário de verão)
  // Para simplificar, vamos usar UTC-3 (offset de -180 minutos)
  const offset = -180 // minutos
  return new Date(date.getTime() + (offset * 60 * 1000))
}

/**
 * Converte uma data/hora local de São Paulo para UTC
 */
function fromSaoPauloTime(dateStr: string, timeStr: string): Date {
  // Criar data no timezone de São Paulo
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  
  // Criar data local (assumindo que é São Paulo)
  const localDate = new Date(year, month - 1, day, hour, minute, 0)
  
  // Converter para UTC (adicionar 3 horas)
  return new Date(localDate.getTime() + (3 * 60 * 60 * 1000))
}

/**
 * API para Dashboard de Pavimentação
 * Foco exclusivo em pavimentação asfáltica (não bombas de concreto)
 */
export class DashboardPavimentacaoApi {
  /**
   * Buscar todos os dados do dashboard de uma vez
   */
  static async getDashboardData(): Promise<DashboardData> {
    // 🎭 MOCKUP: Retornar dados simulados
    if (USE_MOCK) {
      return this.getMockDashboardData()
    }

    try {
      const [kpis, proximaProgramacao, programacoesHoje, programacoesAmanha] = await Promise.all([
        this.getKPIs(),
        this.getProximaProgramacao(),
        this.getProgramacaoHoje(),
        this.getProgramacaoAmanha()
      ])

      return {
        kpis,
        proxima_programacao: proximaProgramacao,
        programacoes_hoje: programacoesHoje,
        programacoes_amanha: programacoesAmanha
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      throw error
    }
  }

  /**
   * 🎭 MOCKUP: Dados simulados do dashboard
   */
  private static getMockDashboardData(): DashboardData {
    const hoje = format(new Date(), 'yyyy-MM-dd')
    const amanha = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    
    return {
      kpis: {
        programacao_hoje: 5,
        programacao_amanha: 8,
        faturamento_mes: 245780.50,
        despesas_mes: 87450.30,
        metragem_mes: 3250.75,
        toneladas_mes: 487.25
      },
      proxima_programacao: {
        id: 'mock-1',
        data: hoje,
        horario: '14:30',
        endereco_completo: 'Rua das Acácias, 450, Jardim Paulista, Osasco/SP',
        cliente_nome: 'Prefeitura de Osasco',
        obra_nome: 'Pavimentação Região Sul',
        tempo_restante: '2h 15min',
        minutos_restantes: 135
      },
      programacoes_hoje: [
        {
          id: 'mock-hoje-1',
          data: hoje,
          horario: '08:00',
          endereco: 'Rua das Flores',
          numero: '123',
          bairro: 'Centro',
          cidade: 'Osasco',
          cliente_nome: 'Prefeitura de Osasco',
          obra_nome: 'Pavimentação Centro',
          metragem_planejada: 120,
          status: 'confirmada'
        },
        {
          id: 'mock-hoje-2',
          data: hoje,
          horario: '10:30',
          endereco: 'Avenida Industrial',
          numero: '890',
          bairro: 'Industrial',
          cidade: 'Osasco',
          cliente_nome: 'Construtora ABC',
          obra_nome: 'Pavimentação Industrial',
          metragem_planejada: 250,
          status: 'confirmada'
        },
        {
          id: 'mock-hoje-3',
          data: hoje,
          horario: '14:30',
          endereco: 'Rua das Acácias',
          numero: '450',
          bairro: 'Jardim Paulista',
          cidade: 'Osasco',
          cliente_nome: 'Prefeitura de Osasco',
          obra_nome: 'Pavimentação Região Sul',
          metragem_planejada: 180,
          status: 'confirmada'
        },
        {
          id: 'mock-hoje-4',
          data: hoje,
          horario: '16:00',
          endereco: 'Rua dos Girassóis',
          numero: '321',
          bairro: 'Jardim das Flores',
          cidade: 'Osasco',
          cliente_nome: 'Empresa XYZ',
          obra_nome: 'Pavimentação Condomínio Verde',
          metragem_planejada: 95,
          status: 'em_andamento'
        },
        {
          id: 'mock-hoje-5',
          data: hoje,
          horario: '17:30',
          endereco: 'Avenida Central',
          numero: '1500',
          bairro: 'Centro',
          cidade: 'Osasco',
          cliente_nome: 'Shopping Center',
          obra_nome: 'Pavimentação Estacionamento',
          metragem_planejada: 300,
          status: 'confirmada'
        }
      ],
      programacoes_amanha: [
        {
          id: 'mock-amanha-1',
          data: amanha,
          horario: '07:00',
          endereco: 'Rua das Palmeiras',
          numero: '234',
          bairro: 'Jardim Tropical',
          cidade: 'Osasco',
          cliente_nome: 'Prefeitura de Osasco',
          obra_nome: 'Pavimentação Jardim Tropical',
          metragem_planejada: 150,
          status: 'confirmada'
        },
        {
          id: 'mock-amanha-2',
          data: amanha,
          horario: '09:30',
          endereco: 'Avenida Paulista',
          numero: '678',
          bairro: 'Vila Nova',
          cidade: 'Osasco',
          cliente_nome: 'Construtora DEF',
          obra_nome: 'Pavimentação Vila Nova',
          metragem_planejada: 200,
          status: 'confirmada'
        },
        {
          id: 'mock-amanha-3',
          data: amanha,
          horario: '11:00',
          endereco: 'Rua da Liberdade',
          numero: '456',
          bairro: 'Centro',
          cidade: 'Osasco',
          cliente_nome: 'Prefeitura de Osasco',
          obra_nome: 'Pavimentação Centro Histórico',
          metragem_planejada: 175,
          status: 'confirmada'
        },
        {
          id: 'mock-amanha-4',
          data: amanha,
          horario: '13:30',
          endereco: 'Rua das Margaridas',
          numero: '789',
          bairro: 'Jardim Primavera',
          cidade: 'Osasco',
          cliente_nome: 'Construtora GHI',
          obra_nome: 'Pavimentação Residencial',
          metragem_planejada: 140,
          status: 'confirmada'
        },
        {
          id: 'mock-amanha-5',
          data: amanha,
          horario: '15:00',
          endereco: 'Avenida dos Estados',
          numero: '2100',
          bairro: 'Industrial',
          cidade: 'Osasco',
          cliente_nome: 'Empresa JKL',
          obra_nome: 'Pavimentação Logística',
          metragem_planejada: 400,
          status: 'confirmada'
        },
        {
          id: 'mock-amanha-6',
          data: amanha,
          horario: '16:30',
          endereco: 'Rua Nova Esperança',
          numero: '567',
          bairro: 'Vila Esperança',
          cidade: 'Osasco',
          cliente_nome: 'Prefeitura de Osasco',
          obra_nome: 'Pavimentação Vila Esperança',
          metragem_planejada: 110,
          status: 'confirmada'
        },
        {
          id: 'mock-amanha-7',
          data: amanha,
          horario: '17:45',
          endereco: 'Rua do Progresso',
          numero: '890',
          bairro: 'Jardim Progresso',
          cidade: 'Osasco',
          cliente_nome: 'Construtora MNO',
          obra_nome: 'Pavimentação Jardim',
          metragem_planejada: 130,
          status: 'confirmada'
        },
        {
          id: 'mock-amanha-8',
          data: amanha,
          horario: '18:30',
          endereco: 'Avenida Brasil',
          numero: '3450',
          bairro: 'Centro',
          cidade: 'Osasco',
          cliente_nome: 'Shopping Mall',
          obra_nome: 'Pavimentação Shopping',
          metragem_planejada: 280,
          status: 'confirmada'
        }
      ]
    }
  }

  /**
   * Buscar todos os KPIs do dashboard
   */
  static async getKPIs(): Promise<DashboardKPIs> {
    // Usar timezone de São Paulo
    const agora = new Date()
    const hojeSaoPaulo = toSaoPauloTime(agora)
    const amanhaSaoPaulo = toSaoPauloTime(addDays(agora, 1))
    
    const today = format(hojeSaoPaulo, 'yyyy-MM-dd')
    const tomorrow = format(amanhaSaoPaulo, 'yyyy-MM-dd')
    const mesInicio = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const mesFim = format(endOfMonth(new Date()), 'yyyy-MM-dd')

    try {
      const [
        programacaoHoje,
        programacaoAmanha,
        faturamentoMes,
        despesasMes,
        metragemMes,
        toneladasMes
      ] = await Promise.all([
        this.countProgramacaoDia(today),
        this.countProgramacaoDia(tomorrow),
        this.getFaturamentoMes(mesInicio, mesFim),
        this.getDespesasMes(mesInicio, mesFim),
        this.getMetragemMes(mesInicio, mesFim),
        this.getToneladasMes(mesInicio, mesFim)
      ])

      return {
        programacao_hoje: programacaoHoje,
        programacao_amanha: programacaoAmanha,
        faturamento_mes: faturamentoMes,
        despesas_mes: despesasMes,
        metragem_mes: metragemMes,
        toneladas_mes: toneladasMes
      }
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error)
      throw error
    }
  }

  /**
   * Contar programações de um dia específico
   */
  private static async countProgramacaoDia(data: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('programacao_pavimentacao')
        .select('*', { count: 'exact', head: true })
        .eq('date', data)
        .eq('status', 'programado')

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Erro ao contar programações:', error)
      return 0
    }
  }

  /**
   * Buscar programações de hoje
   */
  static async getProgramacaoHoje(): Promise<ProgramacaoItem[]> {
    const agora = new Date()
    const hojeSaoPaulo = toSaoPauloTime(agora)
    const today = format(hojeSaoPaulo, 'yyyy-MM-dd')
    return this.getProgramacoesDia(today)
  }

  /**
   * Buscar programações de amanhã
   */
  static async getProgramacaoAmanha(): Promise<ProgramacaoItem[]> {
    const agora = new Date()
    const amanhaSaoPaulo = toSaoPauloTime(addDays(agora, 1))
    const tomorrow = format(amanhaSaoPaulo, 'yyyy-MM-dd')
    return this.getProgramacoesDia(tomorrow)
  }

  /**
   * Buscar programações de um dia específico
   */
  private static async getProgramacoesDia(data: string): Promise<ProgramacaoItem[]> {
    try {
      const { data: programacoes, error } = await supabase
        .from('programacao_pavimentacao')
        .select(`
          id,
          date,
          horario_inicio,
          metragem_prevista,
          status,
          obra_id,
          rua_id
        `)
        .eq('date', data)
        .eq('status', 'programado')
        .order('horario_inicio', { ascending: true })
        .limit(10)

      if (error) throw error

      // Buscar nomes de clientes e obras
      const programacoesComDetalhes = await Promise.all(
        (programacoes || []).map(async (prog) => {
          let cliente_nome = 'Cliente não informado'
          let obra_nome = 'Obra não informada'

          // Buscar obra e cliente
          if (prog.obra_id) {
            const { data: obra } = await supabase
              .from('obras')
              .select('name, client_id')
              .eq('id', prog.obra_id)
              .single()
            
            if (obra) {
              obra_nome = obra.name
              
              // Buscar cliente
              if (obra.client_id) {
                const { data: cliente } = await supabase
                  .from('clients')
                  .select('name')
                  .eq('id', obra.client_id)
                  .single()
                
                if (cliente) cliente_nome = cliente.name
              }
            }
          }

          // Buscar rua
          let rua_nome = 'Rua não informada'
          if (prog.rua_id) {
            const { data: rua } = await supabase
              .from('obras_ruas')
              .select('name')
              .eq('id', prog.rua_id)
              .single()
            
            if (rua) rua_nome = rua.name
          }

          return {
            id: prog.id,
            data: prog.date,
            horario: prog.horario_inicio,
            endereco: rua_nome,
            numero: '',
            bairro: '',
            cidade: '',
            cliente_nome,
            obra_nome,
            metragem_planejada: prog.metragem_prevista,
            status: prog.status
          }
        })
      )

      return programacoesComDetalhes
    } catch (error) {
      console.error('Erro ao buscar programações do dia:', error)
      return []
    }
  }

  /**
   * Buscar próxima programação com contagem regressiva
   */
  static async getProximaProgramacao(): Promise<ProximaProgramacao | null> {
    try {
      // Usar timezone de São Paulo
      const agora = new Date()
      const hojeSaoPaulo = toSaoPauloTime(agora)
      const hojeStr = format(hojeSaoPaulo, 'yyyy-MM-dd')
      const horaAtual = hojeSaoPaulo.getHours() * 60 + hojeSaoPaulo.getMinutes()

      // Buscar programações de hoje e amanhã
      const { data: programacoes, error } = await supabase
        .from('programacao_pavimentacao')
        .select(`
          id,
          date,
          horario_inicio,
          obra_id,
          rua_id,
          espessura_media_solicitada
        `)
        .gte('date', hojeStr)
        .lte('date', format(addDays(agora, 1), 'yyyy-MM-dd'))
        .eq('status', 'programado')
        .order('date', { ascending: true })
        .order('horario_inicio', { ascending: true })

      if (error) throw error
      if (!programacoes || programacoes.length === 0) return null

      // Filtrar programações futuras
      let proximaProg = null
      for (const prog of programacoes) {
        if (!prog.horario_inicio) continue
        
        const [hora, minuto] = prog.horario_inicio.split(':').map(Number)
        const horaProgramacao = hora * 60 + minuto

        // Se for hoje, verificar se é futura
        if (prog.date === hojeStr && horaProgramacao <= horaAtual) {
          continue
        }

        proximaProg = prog
        break
      }

      if (!proximaProg) return null

      // Calcular tempo restante usando timezone de São Paulo
      const dataProgramacaoUTC = fromSaoPauloTime(proximaProg.date, proximaProg.horario_inicio)
      
      const diffMs = dataProgramacaoUTC.getTime() - agora.getTime()
      const diffMinutos = Math.floor(diffMs / (1000 * 60))
      
      let tempoRestante = ''
      if (diffMinutos < 0) {
        // Programação já passou
        const minutosAtraso = Math.abs(diffMinutos)
        if (minutosAtraso < 60) {
          tempoRestante = `Atrasado ${minutosAtraso}min`
        } else if (minutosAtraso < 1440) {
          const horas = Math.floor(minutosAtraso / 60)
          const mins = minutosAtraso % 60
          tempoRestante = `Atrasado ${horas}h ${mins}min`
        } else {
          const dias = Math.floor(minutosAtraso / 1440)
          tempoRestante = `Atrasado ${dias} dia${dias > 1 ? 's' : ''}`
        }
      } else if (diffMinutos < 60) {
        tempoRestante = `${diffMinutos}min`
      } else if (diffMinutos < 1440) { // menos de 24h
        const horas = Math.floor(diffMinutos / 60)
        const mins = diffMinutos % 60
        tempoRestante = `${horas}h ${mins}min`
      } else {
        const dias = Math.floor(diffMinutos / 1440)
        tempoRestante = dias === 1 ? '1 dia' : `${dias} dias`
      }

      // Buscar detalhes do cliente e obra
      let cliente_nome = 'Cliente não especificado'
      let obra_nome = 'Obra não especificada'
      let rua_nome = 'Rua não especificada'

      if (proximaProg.obra_id) {
        const { data: obra } = await supabase
          .from('obras')
          .select('name, client_id')
          .eq('id', proximaProg.obra_id)
          .single()
        
        if (obra) {
          obra_nome = obra.name
          
          // Buscar cliente
          if (obra.client_id) {
            const { data: cliente } = await supabase
              .from('clients')
              .select('name')
              .eq('id', obra.client_id)
              .single()
            
            if (cliente) cliente_nome = cliente.name
          }
        }
      }

      // Buscar rua
      if (proximaProg.rua_id) {
        const { data: rua } = await supabase
          .from('obras_ruas')
          .select('name')
          .eq('id', proximaProg.rua_id)
          .single()
        
        if (rua) rua_nome = rua.name
      }

      const endereco_completo = rua_nome

      return {
        id: proximaProg.id,
        data: proximaProg.date,
        horario: proximaProg.horario_inicio,
        endereco_completo,
        cliente_nome,
        obra_nome,
        tempo_restante: tempoRestante,
        minutos_restantes: diffMinutos,
        espessura_media_solicitada: proximaProg.espessura_media_solicitada
      }
    } catch (error) {
      console.error('Erro ao buscar próxima programação:', error)
      return null
    }
  }

  /**
   * Buscar faturamento do mês (obras pagas)
   */
  private static async getFaturamentoMes(mesInicio: string, mesFim: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('obras_financeiro_faturamentos')
        .select('valor_total')
        .eq('status', 'pago')
        .gte('data_finalizacao', mesInicio)
        .lte('data_finalizacao', mesFim)

      if (error) throw error

      const total = (data || []).reduce((sum, item) => sum + (Number(item.valor_total) || 0), 0)
      return total
    } catch (error) {
      console.error('Erro ao buscar faturamento do mês:', error)
      return 0
    }
  }

  /**
   * Buscar despesas do mês
   */
  private static async getDespesasMes(mesInicio: string, mesFim: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('obras_financeiro_despesas')
        .select('valor')
        .gte('data_despesa', mesInicio)
        .lte('data_despesa', mesFim)

      if (error) throw error

      const total = (data || []).reduce((sum, item) => sum + (Number(item.valor) || 0), 0)
      return total
    } catch (error) {
      console.error('Erro ao buscar despesas do mês:', error)
      return 0
    }
  }

  /**
   * Buscar metragem pavimentada do mês
   */
  private static async getMetragemMes(mesInicio: string, mesFim: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('obras_financeiro_faturamentos')
        .select('metragem_executada')
        .gte('data_finalizacao', mesInicio)
        .lte('data_finalizacao', mesFim)

      if (error) throw error

      const total = (data || []).reduce((sum, item) => sum + (Number(item.metragem_executada) || 0), 0)
      return total
    } catch (error) {
      console.error('Erro ao buscar metragem do mês:', error)
      return 0
    }
  }

  /**
   * Buscar toneladas aplicadas do mês
   */
  private static async getToneladasMes(mesInicio: string, mesFim: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('obras_financeiro_faturamentos')
        .select('toneladas_utilizadas')
        .gte('data_finalizacao', mesInicio)
        .lte('data_finalizacao', mesFim)

      if (error) throw error

      const total = (data || []).reduce((sum, item) => sum + (Number(item.toneladas_utilizadas) || 0), 0)
      return total
    } catch (error) {
      console.error('Erro ao buscar toneladas do mês:', error)
      return 0
    }
  }
}

