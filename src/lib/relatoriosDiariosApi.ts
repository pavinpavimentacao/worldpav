import {
  RelatorioDiario,
  RelatorioDiarioCompleto,
  RelatorioDiarioMaquinario,
  CreateRelatorioDiarioData
} from '../types/relatorios-diarios'
import { calcularEspessura, gerarNumeroRelatorio } from '../utils/relatorios-diarios-utils'
import { supabase } from './supabase'

// Flag para usar mockups - REMOVER QUANDO PRONTO
const USE_MOCK = false

// ========== MOCKUPS ==========

const mockRelatorios: RelatorioDiario[] = [
  {
    id: 'rd-1',
    numero: 'RD-2024-001',
    cliente_id: 'cli-1',
    cliente_nome: 'Prefeitura de Osasco',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    rua_id: 'rua-1',
    rua_nome: 'Rua das Flores - Trecho 1',
    equipe_id: 'eq-1',
    equipe_nome: 'Equipe Alpha',
    equipe_is_terceira: false,
    data_inicio: '2024-02-15',
    data_fim: '2024-02-15',
    horario_inicio: '07:00',
    metragem_feita: 450,
    toneladas_aplicadas: 27, // 2.5 cm de espessura
    espessura_calculada: 2.5,
    faixa_utilizada: 'faixa_3',
    observacoes: 'Trabalho realizado sem intercorrências. Clima favorável. Camada final (Faixa 3).',
    status: 'finalizado',
    created_at: '2024-02-15T18:30:00',
    updated_at: '2024-02-15T18:30:00'
  },
  {
    id: 'rd-2',
    numero: 'RD-2024-002',
    cliente_id: 'cli-1',
    cliente_nome: 'Prefeitura de Osasco',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    rua_id: 'rua-2',
    rua_nome: 'Rua das Flores - Trecho 2',
    equipe_id: 'eq-parc-1',
    equipe_nome: 'Equipe Pavimentação Alpha (Pav Solutions)',
    equipe_is_terceira: true,
    data_inicio: '2024-02-16',
    data_fim: '2024-02-16',
    horario_inicio: '07:30',
    metragem_feita: 520,
    toneladas_aplicadas: 43.68, // 3.5 cm de espessura (média)
    espessura_calculada: 3.5,
    faixa_utilizada: 'faixa_4',
    observacoes: 'Utilizados maquinários terceiros. Equipe terceira realizou excelente trabalho. Camada de ligação (Faixa 4).',
    status: 'finalizado',
    created_at: '2024-02-16T19:00:00',
    updated_at: '2024-02-16T19:00:00'
  },
  {
    id: 'rd-3',
    numero: 'RD-2024-003',
    cliente_id: 'cli-2',
    cliente_nome: 'Construtora ABC',
    obra_id: '2',
    obra_nome: 'Avenida Central - Barueri',
    rua_id: 'rua-3',
    rua_nome: 'Avenida Central - Quadra A',
    equipe_id: 'eq-2',
    equipe_nome: 'Equipe Beta',
    equipe_is_terceira: false,
    data_inicio: '2024-02-20',
    data_fim: '2024-02-20',
    horario_inicio: '06:30',
    metragem_feita: 680,
    toneladas_aplicadas: 73.44, // 4.5 cm de espessura
    espessura_calculada: 4.5,
    faixa_utilizada: 'faixa_5',
    observacoes: 'Excelente produtividade da equipe. Camada estrutural (Faixa 5) para alto tráfego.',
    status: 'finalizado',
    created_at: '2024-02-20T17:45:00',
    updated_at: '2024-02-20T17:45:00'
  }
]

const mockRelatoriosMaquinarios: RelatorioDiarioMaquinario[] = [
  {
    id: 'rdm-1',
    relatorio_id: 'rd-1',
    maquinario_id: 'maq-1',
    maquinario_nome: 'Caminhão Munck MB 2726',
    is_terceiro: false,
    created_at: '2024-02-15T18:30:00'
  },
  {
    id: 'rdm-2',
    relatorio_id: 'rd-1',
    maquinario_id: 'maq-2',
    maquinario_nome: 'Rolo Compactador Dynapac',
    is_terceiro: false,
    created_at: '2024-02-15T18:30:00'
  },
  {
    id: 'rdm-3',
    relatorio_id: 'rd-2',
    maquinario_id: 'maq-parc-1',
    maquinario_nome: 'Caminhão Basculante Mercedes 2726',
    is_terceiro: true,
    parceiro_id: 'parc-3',
    parceiro_nome: 'Empreiteira Pav Solutions',
    created_at: '2024-02-16T19:00:00'
  },
  {
    id: 'rdm-4',
    relatorio_id: 'rd-2',
    maquinario_id: 'maq-parc-2',
    maquinario_nome: 'Rolo Compactador Dynapac CA25',
    is_terceiro: true,
    parceiro_id: 'parc-3',
    parceiro_nome: 'Empreiteira Pav Solutions',
    created_at: '2024-02-16T19:00:00'
  },
  {
    id: 'rdm-5',
    relatorio_id: 'rd-3',
    maquinario_id: 'maq-3',
    maquinario_nome: 'Pá Carregadeira CAT',
    is_terceiro: false,
    created_at: '2024-02-20T17:45:00'
  }
]

// ========== FUNÇÕES API ==========

/**
 * Busca todos os relatórios diários
 */
export async function getRelatoriosDiarios(filtros?: {
  cliente_id?: string
  obra_id?: string
  data_inicio?: string
  data_fim?: string
}): Promise<RelatorioDiario[]> {
  try {
    console.log('🔍 [RelatoriosDiariosApi] Buscando relatórios com filtros:', filtros)
    
    // Buscar todas as colunas para compatibilidade com estrutura antiga
    let query = supabase
      .from('relatorios_diarios')
      .select('*')
      .order('data_inicio', { ascending: false })

    // Aplicar filtros
    if (filtros?.cliente_id) {
      query = query.eq('cliente_id', filtros.cliente_id)
    }

    if (filtros?.obra_id) {
      query = query.eq('obra_id', filtros.obra_id)
    }

    if (filtros?.data_inicio) {
      query = query.gte('data_inicio', filtros.data_inicio)
    }

    if (filtros?.data_fim) {
      query = query.lte('data_inicio', filtros.data_fim)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao buscar relatórios:', error)
      throw new Error(`Erro ao buscar relatórios: ${error.message}`)
    }

    console.log('✅ [RelatoriosDiariosApi] Relatórios encontrados:', data?.length || 0)

    // Buscar nomes relacionados separadamente
    const relatorios: RelatorioDiario[] = await Promise.all(
      (data || []).map(async (item: any) => {
        let clienteNome = 'N/A'
        let obraNome = 'N/A'
        let ruaNome = 'N/A'
        let equipeNome = 'Equipe não informada'

        // Buscar nome do cliente
        if (item.cliente_id) {
          const { data: cliente, error: clienteError } = await supabase
            .from('clients')
            .select('name')
            .eq('id', item.cliente_id)
            .single()
          if (clienteError) {
            console.error(`❌ [RelatoriosDiariosApi] Erro ao buscar cliente:`, clienteError)
          }
          if (cliente) clienteNome = cliente.name
        }

        // Buscar nome da obra
        if (item.obra_id) {
          const { data: obra, error: obraError } = await supabase
            .from('obras')
            .select('name')
            .eq('id', item.obra_id)
            .single()
          if (obraError) {
            console.error(`❌ [RelatoriosDiariosApi] Erro ao buscar obra:`, obraError)
          }
          if (obra) obraNome = obra.name
        }

        // Buscar nome da rua
        if (item.rua_id) {
          const { data: rua, error: ruaError } = await supabase
            .from('obras_ruas')
            .select('name')
            .eq('id', item.rua_id)
            .single()
          if (ruaError) {
            console.error(`❌ [RelatoriosDiariosApi] Erro ao buscar rua:`, ruaError)
          }
          if (rua) ruaNome = rua.name
        }

        // ✅ Buscar informações da equipe da tabela equipes
        console.log(`🔍 [RelatoriosDiariosApi] Verificando equipe_id do item:`, item.equipe_id)
        
        if (item.equipe_id) {
          console.log(`🔍 [RelatoriosDiariosApi] item.equipe_id:`, item.equipe_id)
          
          // Primeiro, tentar buscar diretamente na tabela equipes (caso o equipe_id seja um ID de equipe)
          const { data: equipeDireta, error: equipeDiretaError } = await supabase
            .from('equipes')
            .select('id, name, prefixo')
            .eq('id', item.equipe_id)
            .is('deleted_at', null)
            .single()
          
          if (equipeDireta && !equipeDiretaError) {
            equipeNome = equipeDireta.name || equipeDireta.prefixo || 'Equipe sem nome'
            console.log(`✅ [RelatoriosDiariosApi] Equipe encontrada diretamente: ${equipeNome}`)
          } else {
            // Log detalhado do erro de busca direta
            if (equipeDiretaError) {
              console.log(`ℹ️ [RelatoriosDiariosApi] Não encontrado diretamente na tabela equipes:`, equipeDiretaError.code, equipeDiretaError.message)
            }
            
            // Se não encontrou diretamente, tentar buscar via colaborador
            console.log(`🔍 [RelatoriosDiariosApi] Tentando buscar como colaborador_id: ${item.equipe_id}`)
            
            // item.equipe_id é o ID do colaborador responsável
            // Buscar o colaborador para pegar seu equipe_id (que aponta para a tabela equipes)
            const { data: colaborador, error: colaboradorError } = await supabase
              .from('colaboradores')
              .select('equipe_id, name, id')
              .eq('id', item.equipe_id)
              .single()
            
            if (colaboradorError) {
              console.error(`❌ [RelatoriosDiariosApi] Erro ao buscar colaborador:`, {
                code: colaboradorError.code,
                message: colaboradorError.message,
                details: colaboradorError.details
              })
              equipeNome = 'Equipe não informada'
            } else if (colaborador) {
              console.log(`✅ [RelatoriosDiariosApi] Colaborador encontrado:`, {
                id: colaborador.id,
                name: colaborador.name,
                equipe_id: colaborador.equipe_id
              })
              
              if (colaborador.equipe_id) {
                // Buscar a equipe na tabela equipes
                const { data: equipe, error: equipeError } = await supabase
                  .from('equipes')
                  .select('id, name, prefixo')
                  .eq('id', colaborador.equipe_id)
                  .is('deleted_at', null)
                  .single()
                
                if (equipeError) {
                  console.error(`❌ [RelatoriosDiariosApi] Erro ao buscar equipe do colaborador:`, {
                    code: equipeError.code,
                    message: equipeError.message,
                    equipe_id: colaborador.equipe_id
                  })
                  equipeNome = 'Equipe não informada'
                } else if (equipe) {
                  equipeNome = equipe.name || equipe.prefixo || 'Equipe sem nome'
                  console.log(`✅ [RelatoriosDiariosApi] Equipe encontrada via colaborador: ${equipeNome}`)
                } else {
                  console.warn(`⚠️ [RelatoriosDiariosApi] Equipe não encontrada para ID: ${colaborador.equipe_id}`)
                  equipeNome = 'Equipe não informada'
                }
              } else {
                console.warn(`⚠️ [RelatoriosDiariosApi] Colaborador ${colaborador.name} (${colaborador.id}) não tem equipe_id vinculado`)
                equipeNome = 'Equipe não informada'
              }
            } else {
              console.warn(`⚠️ [RelatoriosDiariosApi] Colaborador não encontrado para ID: ${item.equipe_id}`)
              equipeNome = 'Equipe não informada'
            }
          }
        } else {
          console.log(`ℹ️ [RelatoriosDiariosApi] Relatório sem equipe_id`)
          equipeNome = 'Equipe não informada'
        }

        return {
          id: item.id,
          numero: item.numero || `RD-${new Date(item.data_inicio).getFullYear()}-${item.id.substring(0, 8)}`, // Fallback se não houver número
          cliente_id: item.cliente_id,
          cliente_nome: clienteNome,
          obra_id: item.obra_id,
          obra_nome: obraNome,
          rua_id: item.rua_id,
          rua_nome: ruaNome,
          equipe_id: item.equipe_id,
          equipe_nome: equipeNome,
          equipe_is_terceira: item.equipe_is_terceira || false,
          data_inicio: item.data_inicio,
          data_fim: item.data_fim,
          horario_inicio: item.horario_inicio,
          metragem_feita: parseFloat(item.metragem_feita),
          toneladas_aplicadas: parseFloat(item.toneladas_aplicadas),
          espessura_calculada: parseFloat(item.espessura_calculada || '0'),
          observacoes: item.observacoes,
          status: 'finalizado',
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      })
    )

    return relatorios
  } catch (error) {
    console.error('❌ [RelatoriosDiariosApi] Erro geral:', error)
    throw error
  }
}

/**
 * Busca relatório por ID (completo com maquinários)
 */
export async function getRelatorioDiarioById(id: string): Promise<RelatorioDiarioCompleto | null> {
  try {
    console.log('🔍 [RelatoriosDiariosApi] Buscando relatório:', id)
    
    // Buscar relatório (sem especificar número para compatibilidade com estrutura antiga)
    const { data: relatorio, error: relatorioError } = await supabase
      .from('relatorios_diarios')
      .select('*')
      .eq('id', id)
      .single()

    if (relatorioError) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao buscar relatório:', relatorioError)
      throw new Error(`Erro ao buscar relatório: ${relatorioError.message}`)
    }

    if (!relatorio) {
      return null
    }

    // Buscar maquinários vinculados
    const { data: maquinarios, error: maquinariosError } = await supabase
      .from('relatorios_diarios_maquinarios')
      .select('*')
      .eq('relatorio_id', id)

    if (maquinariosError) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao buscar maquinários:', maquinariosError)
      throw new Error(`Erro ao buscar maquinários: ${maquinariosError.message}`)
    }

    // Mapear maquinários e buscar seus nomes
    const maquinariosFormatados: RelatorioDiarioMaquinario[] = []
    
    for (const item of maquinarios || []) {
      let maquinarioNome = 'Não informado'
      let parceiroNome = 'Não informado'
      
      // Buscar nome do maquinário se não for terceiro
      if (!item.is_terceiro && item.maquinario_id) {
        // Tentar buscar na tabela maquinarios primeiro
        const { data: maq } = await supabase
          .from('maquinarios')
          .select('name')
          .eq('id', item.maquinario_id)
          .single()
        
        if (maq) {
          maquinarioNome = maq.name
        } else {
          // Fallback para tabela pumps
          const { data: pump } = await supabase
            .from('pumps')
            .select('name')
            .eq('id', item.maquinario_id)
            .single()
          
          if (pump) maquinarioNome = pump.name
        }
      } else if (item.is_terceiro && item.parceiro_id) {
        // Se for terceiro, buscar nome do parceiro
        const { data: parceiro } = await supabase
          .from('parceiros')
          .select('name')
          .eq('id', item.parceiro_id)
          .single()
        
        if (parceiro) parceiroNome = parceiro.name
      }
      
      maquinariosFormatados.push({
        id: item.id,
        relatorio_id: item.relatorio_id,
        maquinario_id: item.maquinario_id,
        maquinario_nome: maquinarioNome,
        is_terceiro: item.is_terceiro || false,
        parceiro_id: item.parceiro_id,
        parceiro_nome: parceiroNome,
        created_at: item.created_at
      })
    }

    // Buscar nomes relacionados
    let clienteNome = 'N/A'
    let obraNome = 'N/A'
    let ruaNome = 'N/A'
    let equipeNome = 'Não informada'

    // Buscar nome do cliente
    if (relatorio.cliente_id) {
      const { data: cliente } = await supabase
        .from('clients')
        .select('name')
        .eq('id', relatorio.cliente_id)
        .single()
      if (cliente) clienteNome = cliente.name
    }

    // Buscar nome da obra
    if (relatorio.obra_id) {
      const { data: obra } = await supabase
        .from('obras')
        .select('name')
        .eq('id', relatorio.obra_id)
        .single()
      if (obra) obraNome = obra.name
    }

    // Buscar nome da rua
    if (relatorio.rua_id) {
      const { data: rua } = await supabase
        .from('obras_ruas')
        .select('name')
        .eq('id', relatorio.rua_id)
        .single()
      if (rua) ruaNome = rua.name
    }

    // ✅ Buscar nome da equipe da tabela equipes
    console.log(`🔍 [RelatoriosDiariosApi] Verificando equipe_id do relatório:`, relatorio.equipe_id)
    
    if (relatorio.equipe_id) {
      console.log(`🔍 [RelatoriosDiariosApi] relatorio.equipe_id:`, relatorio.equipe_id)
      
      // Primeiro, tentar buscar diretamente na tabela equipes (caso o equipe_id seja um ID de equipe)
      const { data: equipeDireta, error: equipeDiretaError } = await supabase
        .from('equipes')
        .select('id, name, prefixo')
        .eq('id', relatorio.equipe_id)
        .is('deleted_at', null)
        .single()
      
      if (equipeDireta && !equipeDiretaError) {
        equipeNome = equipeDireta.name || equipeDireta.prefixo || 'Equipe sem nome'
        console.log(`✅ [RelatoriosDiariosApi] Equipe encontrada diretamente: ${equipeNome}`)
      } else {
        // Log detalhado do erro de busca direta
        if (equipeDiretaError) {
          console.log(`ℹ️ [RelatoriosDiariosApi] Não encontrado diretamente na tabela equipes:`, equipeDiretaError.code, equipeDiretaError.message)
        }
        
        // Se não encontrou diretamente, tentar buscar via colaborador
        console.log(`🔍 [RelatoriosDiariosApi] Tentando buscar como colaborador_id: ${relatorio.equipe_id}`)
        
        // relatorio.equipe_id é o ID do colaborador responsável
        // Buscar o colaborador para pegar seu equipe_id (que aponta para a tabela equipes)
        const { data: colaborador, error: colaboradorError } = await supabase
          .from('colaboradores')
          .select('equipe_id, name, id')
          .eq('id', relatorio.equipe_id)
          .single()
        
        if (colaboradorError) {
          console.error(`❌ [RelatoriosDiariosApi] Erro ao buscar colaborador:`, {
            code: colaboradorError.code,
            message: colaboradorError.message,
            details: colaboradorError.details
          })
          equipeNome = 'Equipe não informada'
        } else if (colaborador) {
          console.log(`✅ [RelatoriosDiariosApi] Colaborador encontrado:`, {
            id: colaborador.id,
            name: colaborador.name,
            equipe_id: colaborador.equipe_id
          })
          
          if (colaborador.equipe_id) {
            // Buscar a equipe na tabela equipes
            const { data: equipe, error: equipeError } = await supabase
              .from('equipes')
              .select('id, name, prefixo')
              .eq('id', colaborador.equipe_id)
              .is('deleted_at', null)
              .single()
            
            if (equipeError) {
              console.error(`❌ [RelatoriosDiariosApi] Erro ao buscar equipe do colaborador:`, {
                code: equipeError.code,
                message: equipeError.message,
                equipe_id: colaborador.equipe_id
              })
              equipeNome = 'Equipe não informada'
            } else if (equipe) {
              equipeNome = equipe.name || equipe.prefixo || 'Equipe sem nome'
              console.log(`✅ [RelatoriosDiariosApi] Equipe encontrada via colaborador: ${equipeNome}`)
            } else {
              console.warn(`⚠️ [RelatoriosDiariosApi] Equipe não encontrada para ID: ${colaborador.equipe_id}`)
              equipeNome = 'Equipe não informada'
            }
          } else {
            console.warn(`⚠️ [RelatoriosDiariosApi] Colaborador ${colaborador.name} (${colaborador.id}) não tem equipe_id vinculado`)
            equipeNome = 'Equipe não informada'
          }
        } else {
          console.warn(`⚠️ [RelatoriosDiariosApi] Colaborador não encontrado para ID: ${relatorio.equipe_id}`)
          equipeNome = 'Equipe não informada'
        }
      }
    } else {
      console.log(`ℹ️ [RelatoriosDiariosApi] Relatório sem equipe_id`)
      equipeNome = 'Equipe não informada'
    }

    // Montar relatório completo
    const relatorioCompleto: RelatorioDiarioCompleto = {
      id: relatorio.id,
      numero: relatorio.numero || `RD-${new Date(relatorio.data_inicio).getFullYear()}-${relatorio.id.substring(0, 8)}`, // Usar ID se não houver número
      cliente_id: relatorio.cliente_id,
      cliente_nome: clienteNome,
      obra_id: relatorio.obra_id,
      obra_nome: obraNome,
      rua_id: relatorio.rua_id,
      rua_nome: ruaNome,
      equipe_id: relatorio.equipe_id,
      equipe_nome: equipeNome,
      equipe_is_terceira: relatorio.equipe_is_terceira || false,
      data_inicio: relatorio.data_inicio,
      data_fim: relatorio.data_fim,
      horario_inicio: relatorio.horario_inicio,
      metragem_feita: parseFloat(relatorio.metragem_feita),
      toneladas_aplicadas: parseFloat(relatorio.toneladas_aplicadas),
      espessura_calculada: parseFloat(relatorio.espessura_calculada || '0'),
      observacoes: relatorio.observacoes,
      status: 'finalizado',
      created_at: relatorio.created_at,
      updated_at: relatorio.updated_at,
      maquinarios: maquinariosFormatados
    }

    console.log('✅ [RelatoriosDiariosApi] Relatório encontrado com', maquinariosFormatados.length, 'maquinários')
    return relatorioCompleto
  } catch (error) {
    console.error('❌ [RelatoriosDiariosApi] Erro geral:', error)
    throw error
  }
}

/**
 * Cria novo relatório diário
 */
export async function createRelatorioDiario(data: CreateRelatorioDiarioData): Promise<RelatorioDiarioCompleto> {
  try {
    console.log('🔍 [RelatoriosDiariosApi] Criando relatório:', data)
    console.log('📋 [RelatoriosDiariosApi] Dados recebidos:')
    console.log('  - cliente_id:', data.cliente_id)
    console.log('  - obra_id:', data.obra_id)
    console.log('  - rua_id:', data.rua_id)
    console.log('  - equipe_id:', data.equipe_id)
    console.log('  - equipe_is_terceira:', data.equipe_is_terceira)
    
    // Calcular espessura (será calculado pelo trigger, mas aqui também)
    const espessura_calculada = calcularEspessura(data.metragem_feita, data.toneladas_aplicadas)
    
    // ✅ Tentar normalizar equipe_id: se for colaborador_id, buscar o equipe_id real
    let equipeIdFinal = data.equipe_id
    
    if (data.equipe_id) {
      console.log('🔍 [RelatoriosDiariosApi] Verificando equipe_id fornecido:', data.equipe_id)
      
      // Primeiro, verificar se é um equipe_id direto (está na tabela equipes)
      const { data: equipeDireta, error: equipeDiretaError } = await supabase
        .from('equipes')
        .select('id, name')
        .eq('id', data.equipe_id)
        .is('deleted_at', null)
        .single()
      
      if (equipeDireta && !equipeDiretaError) {
        console.log('✅ [RelatoriosDiariosApi] equipe_id é um ID de equipe válido:', equipeDireta.name)
        equipeIdFinal = equipeDireta.id
      } else {
        // Se não é equipe_id, pode ser colaborador_id - buscar o equipe_id do colaborador
        console.log('🔍 [RelatoriosDiariosApi] Tentando como colaborador_id:', data.equipe_id)
        
        const { data: colaboradorData, error: colaboradorError } = await supabase
          .from('colaboradores')
          .select('id, name, equipe_id')
          .eq('id', data.equipe_id)
          .single()
        
        if (colaboradorError) {
          console.error('❌ [RelatoriosDiariosApi] Erro ao buscar colaborador:', colaboradorError)
          // Manter o equipe_id original mesmo com erro
        } else if (colaboradorData) {
          console.log('✅ [RelatoriosDiariosApi] Colaborador encontrado:', {
            id: colaboradorData.id,
            name: colaboradorData.name,
            equipe_id: colaboradorData.equipe_id
          })
          
          if (colaboradorData.equipe_id) {
            // ✅ PREFERIR: Salvar o equipe_id da equipe em vez do colaborador_id
            console.log('✅ [RelatoriosDiariosApi] Usando equipe_id da equipe:', colaboradorData.equipe_id)
            equipeIdFinal = colaboradorData.equipe_id
            
            // Verificar se a equipe existe
            const { data: equipeData, error: equipeError } = await supabase
              .from('equipes')
              .select('id, name, prefixo')
              .eq('id', colaboradorData.equipe_id)
              .single()
            
            if (equipeError) {
              console.error('❌ [RelatoriosDiariosApi] Erro ao verificar equipe:', equipeError)
            } else if (equipeData) {
              console.log('✅ [RelatoriosDiariosApi] Equipe confirmada:', equipeData.name)
            }
          } else {
            console.warn('⚠️ [RelatoriosDiariosApi] Colaborador sem equipe_id vinculado, usando colaborador_id')
            // Manter o colaborador_id como fallback
          }
        } else {
          console.warn('⚠️ [RelatoriosDiariosApi] Colaborador não encontrado para ID:', data.equipe_id)
          // Manter o equipe_id original
        }
      }
    } else {
      console.warn('⚠️ [RelatoriosDiariosApi] Nenhum equipe_id foi fornecido')
    }
    
    console.log('📝 [RelatoriosDiariosApi] [SAVE] equipe_id final a ser salvo:', equipeIdFinal)
    console.log('📝 [RelatoriosDiariosApi] [SAVE] equipe_id original recebido:', data.equipe_id)
    
    // ✅ Verificação final: garantir que o equipeIdFinal existe na tabela equipes
    if (equipeIdFinal) {
      const { data: verificacaoEquipe, error: verificacaoError } = await supabase
        .from('equipes')
        .select('id, name, prefixo')
        .eq('id', equipeIdFinal)
        .is('deleted_at', null)
        .single()
      
      if (verificacaoEquipe && !verificacaoError) {
        console.log('✅ [RelatoriosDiariosApi] [SAVE] Equipe confirmada antes de salvar:', verificacaoEquipe.name)
      } else {
        console.error('❌ [RelatoriosDiariosApi] [SAVE] ATENÇÃO: equipe_id não existe na tabela equipes!', {
          equipeIdFinal,
          error: verificacaoError
        })
        // Tentar buscar via colaborador como último recurso
        if (data.equipe_id && data.equipe_id !== equipeIdFinal) {
          console.log('🔍 [RelatoriosDiariosApi] [SAVE] Tentando buscar equipe via colaborador original...')
          const { data: colData } = await supabase
            .from('colaboradores')
            .select('equipe_id')
            .eq('id', data.equipe_id)
            .single()
          
          if (colData && colData.equipe_id) {
            console.log('✅ [RelatoriosDiariosApi] [SAVE] Equipe encontrada via colaborador:', colData.equipe_id)
            equipeIdFinal = colData.equipe_id
          }
        }
      }
    }
    
    // Inserir relatório (sem joins problemáticos)
    const insertData: any = {
      company_id: '39cf8b61-6737-4aa5-af3f-51fba9f12345', // Company ID padrão
      cliente_id: data.cliente_id,
      obra_id: data.obra_id,
      rua_id: data.rua_id,
      equipe_id: equipeIdFinal, // ✅ Usar equipe_id normalizado (preferindo equipe_id sobre colaborador_id)
      tipo_equipe: data.tipo_equipe, // ✅ Salvar tipo de equipe
      equipe_is_terceira: data.equipe_is_terceira || false,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim || data.data_inicio,
      horario_inicio: data.horario_inicio,
      metragem_feita: data.metragem_feita,
      toneladas_aplicadas: data.toneladas_aplicadas,
      espessura_calculada: espessura_calculada,
      status: 'finalizado'
    }
    
    console.log('📝 [RelatoriosDiariosApi] Dados que serão inseridos:', insertData)
    
    // Tentar ambos os nomes de coluna (observacoes ou observations)
    if (data.observacoes) {
      insertData.observacoes = data.observacoes
      insertData.observations = data.observacoes
    }
    
    const { data: novoRelatorio, error: insertError } = await supabase
      .from('relatorios_diarios')
      .insert(insertData)
      .select('*')
      .single()

    if (insertError) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao criar relatório:', insertError)
      throw new Error(`Erro ao criar relatório: ${insertError.message}`)
    }

    console.log('✅ [RelatoriosDiariosApi] Relatório criado:', novoRelatorio.id)
    console.log('📄 [RelatoriosDiariosApi] Relatório salvo no banco:', {
      id: novoRelatorio.id,
      equipe_id: novoRelatorio.equipe_id,
      equipe_is_terceira: novoRelatorio.equipe_is_terceira
    })

    // Inserir maquinários vinculados
    const maquinariosInseridos: RelatorioDiarioMaquinario[] = []
    
    if (data.maquinarios && data.maquinarios.length > 0) {
      const maquinariosInsert = data.maquinarios.map(maq => ({
        relatorio_id: novoRelatorio.id,
        maquinario_id: maq.id,
        is_terceiro: maq.is_terceiro || false,
        parceiro_id: maq.parceiro_id || null
      }))

      const { data: maquinariosData, error: maquinariosError } = await supabase
        .from('relatorios_diarios_maquinarios')
        .insert(maquinariosInsert)
        .select('*')

      if (maquinariosError) {
        console.error('❌ [RelatoriosDiariosApi] Erro ao inserir maquinários:', maquinariosError)
        throw new Error(`Erro ao inserir maquinários: ${maquinariosError.message}`)
      }

      maquinariosInseridos.push(...(maquinariosData || []).map((item: any) => ({
        id: item.id,
        relatorio_id: item.relatorio_id,
        maquinario_id: item.maquinario_id,
        is_terceiro: item.is_terceiro,
        parceiro_id: item.parceiro_id,
        created_at: item.created_at
      })))

      console.log('✅ [RelatoriosDiariosApi]', maquinariosInseridos.length, 'maquinários vinculados')
    }

    // ✅ Buscar nomes relacionados (mesma lógica do getRelatorioDiarioById)
    let clienteNome = 'N/A'
    let obraNome = 'N/A'
    let ruaNome = 'N/A'
    let equipeNome = 'Equipe não informada'
    
    // Buscar nome do cliente
    if (novoRelatorio.cliente_id) {
      const { data: cliente } = await supabase
        .from('clients')
        .select('name')
        .eq('id', novoRelatorio.cliente_id)
        .single()
      if (cliente) clienteNome = cliente.name
    }

    // Buscar nome da obra
    if (novoRelatorio.obra_id) {
      const { data: obra } = await supabase
        .from('obras')
        .select('name')
        .eq('id', novoRelatorio.obra_id)
        .single()
      if (obra) obraNome = obra.name
    }

    // Buscar nome da rua
    if (novoRelatorio.rua_id) {
      const { data: rua } = await supabase
        .from('obras_ruas')
        .select('name')
        .eq('id', novoRelatorio.rua_id)
        .single()
      if (rua) ruaNome = rua.name
    }

    // ✅ Buscar nome da equipe (mesma lógica do getRelatorioDiarioById)
    if (novoRelatorio.equipe_id) {
      console.log(`🔍 [RelatoriosDiariosApi] [CREATE] Buscando nome da equipe para equipe_id:`, novoRelatorio.equipe_id)
      console.log(`🔍 [RelatoriosDiariosApi] [CREATE] Tipo do equipe_id:`, typeof novoRelatorio.equipe_id)
      
      // Primeiro, tentar buscar diretamente na tabela equipes
      const { data: equipeDireta, error: equipeDiretaError } = await supabase
        .from('equipes')
        .select('id, name, prefixo')
        .eq('id', novoRelatorio.equipe_id)
        .is('deleted_at', null)
        .single()
      
      console.log(`🔍 [RelatoriosDiariosApi] [CREATE] Resultado busca direta:`, {
        equipeDireta,
        equipeDiretaError: equipeDiretaError ? {
          code: equipeDiretaError.code,
          message: equipeDiretaError.message,
          details: equipeDiretaError.details
        } : null
      })
      
      if (equipeDireta && !equipeDiretaError) {
        equipeNome = equipeDireta.name || equipeDireta.prefixo || 'Equipe sem nome'
        console.log(`✅ [RelatoriosDiariosApi] [CREATE] Equipe encontrada diretamente: ${equipeNome}`)
      } else {
        // Se não encontrou diretamente, tentar buscar via colaborador
        console.log(`🔍 [RelatoriosDiariosApi] [CREATE] Tentando buscar como colaborador_id: ${novoRelatorio.equipe_id}`)
        
        const { data: colaborador, error: colaboradorError } = await supabase
          .from('colaboradores')
          .select('equipe_id, name, id')
          .eq('id', novoRelatorio.equipe_id)
          .single()
        
        console.log(`🔍 [RelatoriosDiariosApi] [CREATE] Resultado busca colaborador:`, {
          colaborador,
          colaboradorError: colaboradorError ? {
            code: colaboradorError.code,
            message: colaboradorError.message
          } : null
        })
        
        if (!colaboradorError && colaborador && colaborador.equipe_id) {
          console.log(`✅ [RelatoriosDiariosApi] [CREATE] Colaborador encontrado, equipe_id: ${colaborador.equipe_id}`)
          
          const { data: equipe, error: equipeError } = await supabase
            .from('equipes')
            .select('id, name, prefixo')
            .eq('id', colaborador.equipe_id)
            .is('deleted_at', null)
            .single()
          
          console.log(`🔍 [RelatoriosDiariosApi] [CREATE] Resultado busca equipe via colaborador:`, {
            equipe,
            equipeError: equipeError ? {
              code: equipeError.code,
              message: equipeError.message
            } : null
          })
          
          if (!equipeError && equipe) {
            equipeNome = equipe.name || equipe.prefixo || 'Equipe sem nome'
            console.log(`✅ [RelatoriosDiariosApi] [CREATE] Equipe encontrada via colaborador: ${equipeNome}`)
          } else {
            console.warn(`⚠️ [RelatoriosDiariosApi] [CREATE] Equipe não encontrada para ID: ${colaborador.equipe_id}`)
          }
        } else {
          console.warn(`⚠️ [RelatoriosDiariosApi] [CREATE] Colaborador não encontrado ou sem equipe_id para ID: ${novoRelatorio.equipe_id}`)
          if (colaboradorError) {
            console.error(`❌ [RelatoriosDiariosApi] [CREATE] Erro ao buscar colaborador:`, colaboradorError)
          }
        }
      }
    } else {
      console.log(`ℹ️ [RelatoriosDiariosApi] [CREATE] Relatório sem equipe_id`)
    }

    // Montar resposta completa com nomes buscados
    const relatorioCompleto: RelatorioDiarioCompleto = {
      id: novoRelatorio.id,
      numero: novoRelatorio.numero || `RD-${new Date(novoRelatorio.data_inicio).getFullYear()}-${novoRelatorio.id.substring(0, 8)}`,
      cliente_id: novoRelatorio.cliente_id,
      cliente_nome: clienteNome,
      obra_id: novoRelatorio.obra_id,
      obra_nome: obraNome,
      rua_id: novoRelatorio.rua_id,
      rua_nome: ruaNome,
      equipe_id: novoRelatorio.equipe_id,
      equipe_nome: equipeNome, // ✅ Nome da equipe buscado corretamente
      equipe_is_terceira: novoRelatorio.equipe_is_terceira || false,
      data_inicio: novoRelatorio.data_inicio,
      data_fim: novoRelatorio.data_fim,
      horario_inicio: novoRelatorio.horario_inicio,
      metragem_feita: parseFloat(novoRelatorio.metragem_feita),
      toneladas_aplicadas: parseFloat(novoRelatorio.toneladas_aplicadas),
      espessura_calculada: parseFloat(novoRelatorio.espessura_calculada || espessura_calculada.toString()),
      observacoes: novoRelatorio.observacoes,
      status: 'finalizado',
      created_at: novoRelatorio.created_at,
      updated_at: novoRelatorio.updated_at,
      maquinarios: maquinariosInseridos
    }

    console.log('✅ [RelatoriosDiariosApi] Relatório completo criado:', {
      id: relatorioCompleto.id,
      equipe_id: relatorioCompleto.equipe_id,
      equipe_nome: relatorioCompleto.equipe_nome
    })
    
    // ✅ Buscar o relatório completo do banco para garantir dados frescos (incluindo equipe)
    // Isso garante que quando redirecionar, os dados já estarão corretos
    try {
      console.log('🔍 [RelatoriosDiariosApi] Buscando relatório recém-criado do banco para garantir dados atualizados...')
      const relatorioAtualizado = await getRelatorioDiarioById(relatorioCompleto.id)
      
      if (relatorioAtualizado) {
        console.log('✅ [RelatoriosDiariosApi] Relatório atualizado retornado:', {
          id: relatorioAtualizado.id,
          equipe_id: relatorioAtualizado.equipe_id,
          equipe_nome: relatorioAtualizado.equipe_nome
        })
        return relatorioAtualizado
      } else {
        console.warn('⚠️ [RelatoriosDiariosApi] Não foi possível buscar relatório atualizado, retornando dados criados')
        return relatorioCompleto
      }
    } catch (error) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao buscar relatório atualizado:', error)
      console.log('⚠️ [RelatoriosDiariosApi] Retornando dados criados mesmo com erro')
      return relatorioCompleto
    }
  } catch (error) {
    console.error('❌ [RelatoriosDiariosApi] Erro geral ao criar relatório:', error)
    throw error
  }
}

/**
 * Atualiza status da rua para finalizada
 */
export async function finalizarRua(
  rua_id: string,
  relatorio_id: string,
  data_finalizacao: string,
  metragem_executada: number,
  toneladas_executadas: number
): Promise<void> {
  try {
    console.log('🔍 [RelatoriosDiariosApi] Finalizando rua:', {
      rua_id,
      relatorio_id,
      data_finalizacao,
      metragem_executada,
      toneladas_executadas
    })

    // Atualizar rua
    const { error } = await supabase
      .from('obras_ruas')
      .update({
        status: 'concluida', // Valor correto para o enum status_rua
        relatorio_diario_id: relatorio_id,
        data_finalizacao: data_finalizacao,
        metragem_executada: metragem_executada,
        toneladas_executadas: toneladas_executadas
      })
      .eq('id', rua_id)

    if (error) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao finalizar rua:', error)
      throw new Error(`Erro ao finalizar rua: ${error.message}`)
    }

    console.log('✅ [RelatoriosDiariosApi] Rua finalizada com sucesso')
  } catch (error) {
    console.error('❌ [RelatoriosDiariosApi] Erro geral ao finalizar rua:', error)
    throw error
  }
}

/**
 * Cria faturamento automático ao finalizar rua
 */
export async function criarFaturamentoRua(
  obra_id: string,
  rua_id: string,
  metragem_faturada: number,
  valor_m2: number
): Promise<void> {
  try {
    console.log('🔍 [RelatoriosDiariosApi] Criando faturamento:', {
      obra_id,
      rua_id,
      metragem_faturada,
      valor_m2
    })

    // Calcular valores
    const valor_total = metragem_faturada * valor_m2

    // Buscar relatório relacionado para pegar espessura
    const { data: rua } = await supabase
      .from('obras_ruas')
      .select('relatorio_diario_id, toneladas_executadas')
      .eq('id', rua_id)
      .single()

    let espessura_calculada = 0
    let toneladas_utilizadas = 0

    if (rua) {
      toneladas_utilizadas = parseFloat(rua.toneladas_executadas || '0')
      espessura_calculada = calcularEspessura(metragem_faturada, toneladas_utilizadas)
    } else {
      // Se não tiver relatório, calcular espessura padrão
      espessura_calculada = calcularEspessura(metragem_faturada, 0)
    }

    // Inserir faturamento
    const { error } = await supabase
      .from('obras_financeiro_faturamentos')
      .insert({
        obra_id,
        rua_id,
        metragem_executada: metragem_faturada,
        toneladas_utilizadas: toneladas_utilizadas || 0,
        espessura_calculada,
        preco_por_m2: valor_m2,
        valor_total,
        data_finalizacao: new Date().toISOString().split('T')[0]
      })

    if (error) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao criar faturamento:', error)
      throw new Error(`Erro ao criar faturamento: ${error.message}`)
    }

    console.log('✅ [RelatoriosDiariosApi] Faturamento criado com sucesso. Valor total:', valor_total)
  } catch (error) {
    console.error('❌ [RelatoriosDiariosApi] Erro geral ao criar faturamento:', error)
    throw error
  }
}

/**
 * Edita um relatório diário existente
 */
export async function updateRelatorioDiario(
  id: string,
  data: Partial<CreateRelatorioDiarioData>
): Promise<RelatorioDiarioCompleto> {
  try {
    console.log('🔍 [RelatoriosDiariosApi] Editando relatório:', id)
    console.log('📋 [RelatoriosDiariosApi] Dados para atualizar:', data)
    
    // Calcular nova espessura se metragem ou toneladas mudarem
    let espessura_calculada = null
    if (data.metragem_feita && data.toneladas_aplicadas) {
      espessura_calculada = calcularEspessura(data.metragem_feita, data.toneladas_aplicadas)
    }
    
    const updateData: any = {}
    
    if (data.cliente_id) updateData.cliente_id = data.cliente_id
    if (data.obra_id) updateData.obra_id = data.obra_id
    if (data.rua_id) updateData.rua_id = data.rua_id
    if (data.equipe_id !== undefined) updateData.equipe_id = data.equipe_id
    if (data.tipo_equipe) updateData.tipo_equipe = data.tipo_equipe  // ✅ Salvar tipo de equipe
    if (data.equipe_is_terceira !== undefined) updateData.equipe_is_terceira = data.equipe_is_terceira
    if (data.data_inicio) updateData.data_inicio = data.data_inicio
    if (data.data_fim) updateData.data_fim = data.data_fim
    if (data.horario_inicio) updateData.horario_inicio = data.horario_inicio
    if (data.metragem_feita !== undefined) updateData.metragem_feita = data.metragem_feita
    if (data.toneladas_aplicadas !== undefined) updateData.toneladas_aplicadas = data.toneladas_aplicadas
    if (espessura_calculada) updateData.espessura_calculada = espessura_calculada
    
    if (data.observacoes) {
      updateData.observacoes = data.observacoes
      updateData.observations = data.observacoes
    }
    
    console.log('📝 [RelatoriosDiariosApi] Dados que serão atualizados:', updateData)
    
    const { data: relatorioAtualizado, error: updateError } = await supabase
      .from('relatorios_diarios')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()
    
    if (updateError) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao atualizar relatório:', updateError)
      throw new Error(`Erro ao atualizar relatório: ${updateError.message}`)
    }
    
    console.log('✅ [RelatoriosDiariosApi] Relatório atualizado:', relatorioAtualizado.id)
    
    // Buscar dados completos atualizados
    const relatorioCompleto = await getRelatorioDiarioById(id)
    if (!relatorioCompleto) {
      throw new Error('Relatório não encontrado após atualização')
    }
    
    return relatorioCompleto
  } catch (error) {
    console.error('❌ [RelatoriosDiariosApi] Erro geral ao editar relatório:', error)
    throw error
  }
}

/**
 * Exclui um relatório diário
 */
export async function deleteRelatorioDiario(id: string): Promise<void> {
  try {
    console.log('🔍 [RelatoriosDiariosApi] Excluindo relatório:', id)
    
    const { error } = await supabase
      .from('relatorios_diarios')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ [RelatoriosDiariosApi] Erro ao excluir relatório:', error)
      throw new Error(`Erro ao excluir relatório: ${error.message}`)
    }
    
    console.log('✅ [RelatoriosDiariosApi] Relatório excluído com sucesso')
  } catch (error) {
    console.error('❌ [RelatoriosDiariosApi] Erro geral ao excluir relatório:', error)
    throw error
  }
}

