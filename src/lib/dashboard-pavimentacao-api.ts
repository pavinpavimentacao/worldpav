import { supabase } from './supabase'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'
import type { 
  DashboardKPIs, 
  ProgramacaoItem, 
  ProximaProgramacao, 
  DashboardData,
  MaiorRuaDia,
  DiariaRecente,
  RuaFaturamento,
  MaquinarioUso,
  Alerta
} from '../types/dashboard-pavimentacao'

// 🎭 MODO MOCK DESATIVADO - USANDO BANCO DE DADOS REAL
const USE_MOCK = false

// Timezone do projeto
const TIMEZONE = 'America/Sao_Paulo'

/**
 * Converte uma data UTC para o timezone de São Paulo
 * São Paulo = UTC-3 (ou UTC-2 no horário de verão, mas usando UTC-3 fixo)
 */
function toSaoPauloTime(date: Date): Date {
  // Para converter DE UTC PARA São Paulo, precisamos SUBTRAIR 3 horas
  // Mas como Date já está em UTC no servidor, apenas retornamos
  // A conversão real será feita ao formatar a data
  return date
}

/**
 * Converte uma data/hora local de São Paulo para UTC
 * Para armazenar no banco (que usa UTC)
 */
function fromSaoPauloTime(dateStr: string, timeStr: string): Date {
  // Criar data no timezone de São Paulo
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  
  // Criar data local (assumindo que já estamos em São Paulo)
  const localDate = new Date(year, month - 1, day, hour, minute, 0)
  
  // Se estamos em São Paulo e queremos UTC, ADICIONAR 3 horas
  // Mas como new Date() já cria em horário local, retornamos direto
  return localDate
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
      const hoje = format(new Date(), 'yyyy-MM-dd')
      const mesInicio = format(startOfMonth(new Date()), 'yyyy-MM-dd')
      const mesFim = format(endOfMonth(new Date()), 'yyyy-MM-dd')

      const [
        kpis, 
        proximaProgramacao, 
        programacoesHoje, 
        programacoesAmanha,
        maiorRuaDia,
        ultimasDiarias,
        topRuasFaturamento,
        maquinariosMaisUsados,
        alertas
      ] = await Promise.all([
        this.getKPIs(),
        this.getProximaProgramacao(),
        this.getProgramacaoHoje(),
        this.getProgramacaoAmanha(),
        this.getMaiorRuaDia(hoje),
        this.getUltimasDiarias(5),
        this.getTopRuasFaturamento(mesInicio, mesFim, 5),
        this.getMaquinariosMaisUsados(mesInicio, mesFim, 5),
        this.getAlertas()
      ])

      return {
        kpis,
        proxima_programacao: proximaProgramacao,
        programacoes_hoje: programacoesHoje,
        programacoes_amanha: programacoesAmanha,
        maior_rua_dia: maiorRuaDia,
        ultimas_diarias: ultimasDiarias,
        top_ruas_faturamento: topRuasFaturamento,
        maquinarios_mais_usados: maquinariosMaisUsados,
        alertas: alertas
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
    // Usar horário local (já está em São Paulo no browser)
    const agora = new Date()
    
    const today = format(agora, 'yyyy-MM-dd')
    const tomorrow = format(addDays(agora, 1), 'yyyy-MM-dd')
    const mesInicio = format(startOfMonth(agora), 'yyyy-MM-dd')
    const mesFim = format(endOfMonth(agora), 'yyyy-MM-dd')

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
    const today = format(new Date(), 'yyyy-MM-dd')
    return this.getProgramacoesDia(today)
  }

  /**
   * Buscar programações de amanhã
   */
  static async getProgramacaoAmanha(): Promise<ProgramacaoItem[]> {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
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
      // Usar horário local do browser (São Paulo)
      const agora = new Date()
      const hojeStr = format(agora, 'yyyy-MM-dd')
      const horaAtual = agora.getHours() * 60 + agora.getMinutes()

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

      // Calcular tempo restante
      const [hora, minuto] = proximaProg.horario_inicio.split(':').map(Number)
      const dataProgramacao = new Date(proximaProg.date + 'T' + proximaProg.horario_inicio + ':00')
      
      const diffMs = dataProgramacao.getTime() - agora.getTime()
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
   * Buscar faturamento do mês (RUAS EXECUTADAS - não apenas pagas)
   * Agora busca o valor de ruas finalizadas, independente de pagamento
   */
  private static async getFaturamentoMes(mesInicio: string, mesFim: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('obras_ruas')
        .select('valor_total, created_at')
        .eq('status', 'concluida')
        .gte('created_at', mesInicio)
        .lte('created_at', mesFim)

      if (error) throw error

      const total = (data || []).reduce((sum, item) => sum + (Number(item.valor_total) || 0), 0)
      console.log(`💰 Faturamento executado do mês: R$ ${total} (${data?.length || 0} ruas finalizadas)`)
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
   * Buscar metragem pavimentada do mês (RUAS FINALIZADAS)
   */
  private static async getMetragemMes(mesInicio: string, mesFim: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('obras_ruas')
        .select('metragem_executada, created_at')
        .eq('status', 'concluida')
        .gte('created_at', mesInicio)
        .lte('created_at', mesFim)

      if (error) throw error

      const total = (data || []).reduce((sum, item) => sum + (Number(item.metragem_executada) || 0), 0)
      console.log(`📏 Metragem do mês: ${total} m² (${data?.length || 0} ruas finalizadas)`)
      return total
    } catch (error) {
      console.error('Erro ao buscar metragem do mês:', error)
      return 0
    }
  }

  /**
   * Buscar toneladas aplicadas do mês (RUAS FINALIZADAS)
   */
  private static async getToneladasMes(mesInicio: string, mesFim: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('obras_ruas')
        .select('toneladas_utilizadas, created_at')
        .eq('status', 'concluida')
        .gte('created_at', mesInicio)
        .lte('created_at', mesFim)

      if (error) throw error

      const total = (data || []).reduce((sum, item) => sum + (Number(item.toneladas_utilizadas) || 0), 0)
      console.log(`⚖️ Toneladas do mês: ${total} ton (${data?.length || 0} ruas finalizadas)`)
      return total
    } catch (error) {
      console.error('Erro ao buscar toneladas do mês:', error)
      return 0
    }
  }

  /**
   * 🏆 Buscar maior rua executada do dia (a partir dos relatórios diários)
   */
  static async getMaiorRuaDia(data: string): Promise<MaiorRuaDia | null> {
    try {
      const { data: relatorios, error } = await supabase
        .from('relatorios_diarios')
        .select(`
          metragem_feita,
          toneladas_aplicadas,
          data_inicio,
          rua:obras_ruas(name, valor_total),
          obra:obras(name)
        `)
        .eq('data_inicio', data)
        .order('metragem_feita', { ascending: false })
        .limit(1)

      if (error) throw error
      if (!relatorios || relatorios.length === 0) return null

      const relatorio = relatorios[0]
      
      return {
        rua_nome: relatorio.rua?.name || 'Rua sem nome',
        obra_nome: relatorio.obra?.name || 'Obra não informada',
        metragem: relatorio.metragem_feita || 0,
        toneladas: relatorio.toneladas_aplicadas || 0,
        valor: relatorio.rua?.valor_total || 0,
        data_conclusao: relatorio.data_inicio || data
      }
    } catch (error) {
      console.error('Erro ao buscar maior rua do dia:', error)
      return null
    }
  }

  /**
   * 💼 Buscar últimas diárias de guardas
   */
  static async getUltimasDiarias(limite: number = 5): Promise<DiariaRecente[]> {
    try {
      const { data: diarias, error } = await supabase
        .from('diarias_guarda_seguranca')
        .select(`
          data_diaria,
          valor_diaria,
          guarda:guardas_seguranca(nome, empresa:empresas_guarda(nome))
        `)
        .order('data_diaria', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limite)

      if (error) throw error

      return (diarias || []).map((d: any) => ({
        colaborador_nome: d.guarda?.nome || 'Guarda não informado',
        equipe_nome: d.guarda?.empresa?.nome || 'Empresa não informada',
        data: d.data_diaria,
        valor: d.valor_diaria || 0,
        tem_hora_extra: false
      }))
    } catch (error) {
      console.error('Erro ao buscar últimas diárias de guardas:', error)
      return []
    }
  }

  /**
   * 📊 Buscar top 5 ruas por faturamento
   */
  static async getTopRuasFaturamento(mesInicio: string, mesFim: string, limite: number = 5): Promise<RuaFaturamento[]> {
    try {
      const { data: ruas, error } = await supabase
        .from('obras_ruas')
        .select(`
          name,
          metragem_executada,
          valor_total,
          data_finalizacao,
          obra:obras(name, client:clients(name))
        `)
        .eq('status', 'concluida')
        .gte('data_finalizacao', mesInicio)
        .lte('data_finalizacao', mesFim)
        .order('valor_total', { ascending: false })
        .limit(limite)

      if (error) throw error

      return (ruas || []).map((r: any) => ({
        rua_nome: r.name || 'Rua sem nome',
        obra_nome: r.obra?.name || 'Obra não informada',
        cliente_nome: r.obra?.client?.name || 'Cliente não informado',
        valor_total: r.valor_total || 0,
        metragem: r.metragem_executada || 0,
        valor_por_m2: r.metragem_executada > 0 ? (r.valor_total / r.metragem_executada) : 0,
        data_conclusao: r.data_finalizacao || ''
      }))
    } catch (error) {
      console.error('Erro ao buscar top ruas por faturamento:', error)
      return []
    }
  }

  /**
   * 🚛 Buscar maquinários mais utilizados do mês (a partir dos relatórios diários)
   */
  static async getMaquinariosMaisUsados(mesInicio: string, mesFim: string, limite: number = 5): Promise<MaquinarioUso[]> {
    try {
      // Buscar todos os maquinários
      const { data: maquinarios, error } = await supabase
        .from('maquinarios')
        .select('id, name, type')

      if (error) throw error

      // Para cada maquinário, contar usos nos relatórios diários
      const maquinariosComUso = await Promise.all(
        (maquinarios || []).map(async (maq) => {
          // Buscar relatórios que incluem este maquinário via tabela de vinculação
          const { data: vinculos, error: errorVinculos } = await supabase
            .from('relatorios_diarios_maquinarios')
            .select(`
              relatorio:relatorios_diarios(data_inicio, obra_id)
            `)
            .eq('maquinario_id', maq.id)

          if (errorVinculos) {
            console.error('Erro ao buscar vínculos:', errorVinculos)
            return null
          }

          // Filtrar por data e contar dias/obras únicos
          const relatoriosNoMes = (vinculos || [])
            .filter((v: any) => {
              const dataRelatorio = v.relatorio?.data_inicio
              return dataRelatorio >= mesInicio && dataRelatorio <= mesFim
            })

          const diasUnicos = new Set(relatoriosNoMes.map((v: any) => v.relatorio?.data_inicio))
          const obrasUnicas = new Set(relatoriosNoMes.map((v: any) => v.relatorio?.obra_id).filter(Boolean))

          return {
            maquinario_nome: maq.name,
            tipo: maq.type || 'Não especificado',
            dias_uso_mes: diasUnicos.size,
            obras_utilizadas: obrasUnicas.size
          }
        })
      )

      // Filtrar nulls e ordenar por dias de uso
      return maquinariosComUso
        .filter((m): m is MaquinarioUso => m !== null && m.dias_uso_mes > 0)
        .sort((a, b) => b.dias_uso_mes - a.dias_uso_mes)
        .slice(0, limite)

    } catch (error) {
      console.error('Erro ao buscar maquinários mais usados:', error)
      return []
    }
  }

  /**
   * 🚨 Buscar alertas e pendências
   */
  static async getAlertas(): Promise<Alerta[]> {
    try {
      const hoje = format(new Date(), 'yyyy-MM-dd')
      const proximos30Dias = format(addDays(new Date(), 30), 'yyyy-MM-dd')

      const alertas: Alerta[] = []

      // 1. Manutenções VENCIDAS (alta urgência)
      try {
        const { data: manutencoesVencidas } = await supabase
          .from('maquinarios')
          .select('name, data_proxima_manutencao')
          .lt('data_proxima_manutencao', hoje)
          .neq('status', 'inativo')

        if (manutencoesVencidas && manutencoesVencidas.length > 0) {
          alertas.push({
            tipo: 'manutencao',
            mensagem: 'Manutenções VENCIDAS',
            urgencia: 'alta',
            quantidade: manutencoesVencidas.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar manutenções vencidas:', err)
      }

      // 1.1 Manutenções próximas (30 dias)
      try {
        const { data: manutencoesProximas } = await supabase
          .from('maquinarios')
          .select('name, data_proxima_manutencao')
          .gte('data_proxima_manutencao', hoje)
          .lte('data_proxima_manutencao', proximos30Dias)
          .neq('status', 'inativo')

        if (manutencoesProximas && manutencoesProximas.length > 0) {
          alertas.push({
            tipo: 'manutencao',
            mensagem: 'Manutenções vencem em 30 dias',
            urgencia: 'media',
            quantidade: manutencoesProximas.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar manutenções próximas:', err)
      }

      // 2. Contas atrasadas (status pendente OU atrasado)
      try {
        const { data: contasAtrasadas } = await supabase
          .from('contas_pagar')
          .select('amount, status')
          .in('status', ['pendente', 'pago', 'atrasado', 'cancelado'])
          .lt('due_date', hoje)
          .neq('status', 'pago')
          .neq('status', 'cancelado')

        if (contasAtrasadas && contasAtrasadas.length > 0) {
          alertas.push({
            tipo: 'conta',
            mensagem: 'Contas atrasadas',
            urgencia: 'alta',
            quantidade: contasAtrasadas.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar contas atrasadas:', err)
      }

      // 3. Contas pendentes a vencer em 7 dias
      try {
        const { data: contasVencer } = await supabase
          .from('contas_pagar')
          .select('amount, status')
          .eq('status', 'pendente')
          .gte('due_date', hoje)
          .lte('due_date', format(addDays(new Date(), 7), 'yyyy-MM-dd'))

        if (contasVencer && contasVencer.length > 0) {
          alertas.push({
            tipo: 'conta',
            mensagem: 'Contas vencem em 7 dias',
            urgencia: 'media',
            quantidade: contasVencer.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar contas a vencer:', err)
      }

      // 4. Todas as contas pendentes (não pagas)
      try {
        const { data: todasPendentes } = await supabase
          .from('contas_pagar')
          .select('amount, status')
          .in('status', ['pendente', 'atrasado'])

        // Só adicionar se não houver alertas específicos de vencimento
        if (todasPendentes && todasPendentes.length > 0 && alertas.filter(a => a.tipo === 'conta').length === 0) {
          alertas.push({
            tipo: 'conta',
            mensagem: 'Contas pendentes',
            urgencia: 'media',
            quantidade: todasPendentes.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar todas as pendentes:', err)
      }

      // 5. Licenças VENCIDAS de maquinários (alta urgência)
      try {
        const { data: licencasVencidas } = await supabase
          .from('maquinarios_licencas')
          .select('tipo, validade')
          .lt('validade', hoje)

        if (licencasVencidas && licencasVencidas.length > 0) {
          alertas.push({
            tipo: 'licenca',
            mensagem: 'Licenças VENCIDAS',
            urgencia: 'alta',
            quantidade: licencasVencidas.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar licenças vencidas:', err)
      }

      // 6. Licenças próximas do vencimento (30 dias)
      try {
        const { data: licencasProximas } = await supabase
          .from('maquinarios_licencas')
          .select('tipo, validade')
          .gte('validade', hoje)
          .lte('validade', proximos30Dias)

        if (licencasProximas && licencasProximas.length > 0) {
          alertas.push({
            tipo: 'licenca',
            mensagem: 'Licenças vencem em 30 dias',
            urgencia: 'media',
            quantidade: licencasProximas.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar licenças próximas:', err)
      }

      // 7. Seguros VENCIDOS (alta urgência)
      try {
        const { data: segurosVencidos } = await supabase
          .from('maquinarios_seguros')
          .select('maquinario_id, validade')
          .lt('validade', hoje)

        if (segurosVencidos && segurosVencidos.length > 0) {
          alertas.push({
            tipo: 'documento',
            mensagem: 'Seguros VENCIDOS',
            urgencia: 'alta',
            quantidade: segurosVencidos.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar seguros vencidos:', err)
      }

      // 8. Seguros próximos do vencimento (30 dias)
      try {
        const { data: segurosProximos } = await supabase
          .from('maquinarios_seguros')
          .select('maquinario_id, validade')
          .gte('validade', hoje)
          .lte('validade', proximos30Dias)

        if (segurosProximos && segurosProximos.length > 0) {
          alertas.push({
            tipo: 'documento',
            mensagem: 'Seguros vencem em 30 dias',
            urgencia: 'media',
            quantidade: segurosProximos.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar seguros próximos:', err)
      }

      // 9. Certificados de colaboradores VENCIDOS
      try {
        const { data: certificadosVencidos } = await supabase
          .from('colaboradores_certificados')
          .select('colaborador_id, validade, tipo')
          .lt('validade', hoje)

        if (certificadosVencidos && certificadosVencidos.length > 0) {
          alertas.push({
            tipo: 'documento',
            mensagem: 'Certificados VENCIDOS',
            urgencia: 'alta',
            quantidade: certificadosVencidos.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar certificados vencidos:', err)
      }

      // 10. Certificados próximos do vencimento (30 dias)
      try {
        const { data: certificadosProximos } = await supabase
          .from('colaboradores_certificados')
          .select('colaborador_id, validade, tipo')
          .gte('validade', hoje)
          .lte('validade', proximos30Dias)

        if (certificadosProximos && certificadosProximos.length > 0) {
          alertas.push({
            tipo: 'documento',
            mensagem: 'Certificados vencem em 30 dias',
            urgencia: 'media',
            quantidade: certificadosProximos.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar certificados próximos:', err)
      }

      // 11. Documentos pessoais VENCIDOS (RG, CNH, etc)
      try {
        const { data: documentosVencidos } = await supabase
          .from('colaboradores_documentos')
          .select('colaborador_id, document_type, expiry_date')
          .not('expiry_date', 'is', null)
          .lt('expiry_date', hoje)

        if (documentosVencidos && documentosVencidos.length > 0) {
          alertas.push({
            tipo: 'documento',
            mensagem: 'Documentos pessoais VENCIDOS',
            urgencia: 'alta',
            quantidade: documentosVencidos.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar documentos vencidos:', err)
      }

      // 12. Documentos pessoais próximos do vencimento (30 dias)
      try {
        const { data: documentosProximos } = await supabase
          .from('colaboradores_documentos')
          .select('colaborador_id, document_type, expiry_date')
          .not('expiry_date', 'is', null)
          .gte('expiry_date', hoje)
          .lte('expiry_date', proximos30Dias)

        if (documentosProximos && documentosProximos.length > 0) {
          alertas.push({
            tipo: 'documento',
            mensagem: 'Documentos pessoais vencem em 30 dias',
            urgencia: 'media',
            quantidade: documentosProximos.length
          })
        }
      } catch (err) {
        console.warn('Aviso ao buscar documentos próximos:', err)
      }

      console.log(`🚨 Alertas encontrados: ${alertas.length}`, alertas)
      return alertas
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
      return []
    }
  }
}

