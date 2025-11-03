import { supabase } from './supabase'

export interface FinancialConsolidadoData {
  totalReceitas: number
  totalDespesas: number
  lucroLiquido: number
  saldoAtual: number
  faturamentos: FaturamentoConsolidado[]
  despesas: DespesaConsolidada[]
}

export interface FaturamentoConsolidado {
  id: string
  data_pagamento: string
  obra_id: string
  obra_nome: string
  rua_nome: string
  valor_total: number
  numero_nota_fiscal?: string
  status: string
}

export interface DespesaConsolidada {
  id: string
  data_despesa: string
  obra_id?: string
  obra_nome?: string
  maquinario_id?: string
  maquinario_nome?: string
  categoria: string
  descricao: string
  valor: number
}

export interface SerieDiaValor {
  data: string
  receitas: number
  despesas: number
}

export interface DespesaCategoriaValor {
  categoria: string
  valor: number
}

/**
 * Busca dados financeiros consolidados da WorldPav para um determinado mês
 * @param mesAno Mês e ano para buscar dados (formato: { mes: 1-12, ano: YYYY })
 * @returns Dados consolidados de receitas, despesas e lucro
 */
export async function getFinancialConsolidado(mesAno: { mes: number; ano: number }): Promise<FinancialConsolidadoData> {
  // Calcular primeiro e último dia do mês
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // =============================
    // Receitas: Buscar RUAS EXECUTADAS (fonte primária de receita)
    // Se não houver ruas executadas, buscar faturamentos formais
    // =============================
    let faturamentos: any[] = []
    
    // Primeiro: Buscar ruas finalizadas com metragem executada
    const { data: ruasExecutadas, error: ruasError } = await supabase
      .from('obras_ruas')
      .select(`
        id,
        obra_id,
        name,
        metragem_executada,
        toneladas_utilizadas,
        preco_por_m2,
        valor_total,
        data_finalizacao,
        status,
        obra:obras(id, name, preco_por_m2)
      `)
      .eq('status', 'concluida')
      .not('metragem_executada', 'is', null)
      .gt('metragem_executada', 0)
      .is('deleted_at', null)
      .gte('data_finalizacao', dataInicio)
      .lte('data_finalizacao', dataFim)
      .order('data_finalizacao', { ascending: false })

    if (!ruasError && ruasExecutadas && ruasExecutadas.length > 0) {
      // Usar ruas executadas como fonte de receita
      faturamentos = ruasExecutadas.map((rua: any) => {
        const precoM2 = rua.preco_por_m2 || rua.obra?.preco_por_m2 || 0
        const metragem = rua.metragem_executada || 0
        const valorCalculado = metragem * precoM2

        return {
          id: rua.id,
          obra_id: rua.obra_id,
          rua_id: rua.id,
          data_finalizacao: rua.data_finalizacao,
          data_pagamento: rua.data_finalizacao,
          valor_total: rua.valor_total || valorCalculado,
          nota_fiscal: null,
          status: 'finalizado',
          obra: rua.obra,
          rua: { name: rua.name }
        }
      })
      console.log('📊 Receitas de ruas executadas:', faturamentos.length)
    } else {
      // Fallback: buscar faturamentos formais
      const fatQuery = await supabase
        .from('obras_financeiro_faturamentos')
        .select(`
          id,
          data_pagamento,
          data_finalizacao,
          obra_id,
          rua_id,
          valor_total,
          nota_fiscal,
          status,
          obra:obras(id, name),
          rua:obras_ruas(id, name)
        `)
        .is('deleted_at', null)
        .gte('data_finalizacao', dataInicio)
        .lte('data_finalizacao', dataFim)
        .order('data_finalizacao', { ascending: false })

      if (!fatQuery.error) {
        faturamentos = fatQuery.data || []
        console.log('📊 Faturamentos formais encontrados:', faturamentos.length)
      }
    }

    // =============================
    // Despesas: Buscar APENAS de obras_financeiro_despesas (fonte única)
    // =============================
    const { data: despesasObras, error: despesasError } = await supabase
      .from('obras_financeiro_despesas')
      .select(`
        id,
        data_despesa,
        obra_id,
        maquinario_id,
        categoria,
        descricao,
        valor
      `)
      .gte('data_despesa', dataInicio)
      .lte('data_despesa', dataFim)
      .order('data_despesa', { ascending: false })

    if (despesasError) throw despesasError

    console.log('📊 Total despesas para consolidado:', despesasObras?.length || 0)

    // Formatar faturamentos
    const faturamentosFormatados: FaturamentoConsolidado[] = (faturamentos || []).map(f => ({
      id: f.id,
      data_pagamento: f.data_pagamento || f.data_finalizacao,
      obra_id: f.obra_id,
      obra_nome: (f.obra?.name || f.obra?.nome) || 'Obra não identificada',
      rua_nome: f.rua?.name || 'Rua não identificada',
      valor_total: f.valor_total || 0,
      numero_nota_fiscal: f.nota_fiscal,
      status: f.status || 'finalizado'
    }))

    // Formatar despesas (APENAS da tabela obras_financeiro_despesas)
    const despesasFormatadas: DespesaConsolidada[] = (despesasObras || []).map(d => ({
      id: d.id,
      data_despesa: d.data_despesa,
      obra_id: d.obra_id,
      obra_nome: undefined,
      maquinario_id: d.maquinario_id,
      maquinario_nome: undefined,
      categoria: d.categoria,
      descricao: d.descricao,
      valor: d.valor
    }))

    // Calcular totais
    const totalReceitas = faturamentosFormatados.reduce((sum, f) => sum + f.valor_total, 0)
    const totalDespesas = despesasFormatadas.reduce((sum, d) => sum + d.valor, 0)
    const lucroLiquido = totalReceitas - totalDespesas

    return {
      totalReceitas,
      totalDespesas,
      lucroLiquido,
      saldoAtual: lucroLiquido, // Por enquanto, saldo = lucro do mês
      faturamentos: faturamentosFormatados,
      despesas: despesasFormatadas
    }
  } catch (error) {
    console.error('Erro ao buscar dados financeiros consolidados:', error)
    throw error
  }
}

export interface ObraDetalhesFinanceiros {
  id: string
  nome: string
  status: string
  totalFaturado: number
  totalDespesas: number
  lucro: number
  faturamentos: Array<{
    id: string
    rua_nome: string
    valor_total: number
    data_finalizacao: string
    data_pagamento?: string
    status: string
  }>
  despesas: Array<{
    id: string
    categoria: string
    descricao: string
    valor: number
    data_despesa: string
  }>
}

/**
 * Busca lista de obras ativas com resumo financeiro
 */
export async function getObrasComResumoFinanceiro(mesAno: { mes: number; ano: number }) {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // Buscar obras ativas (usar valores corretos do enum status_obra)
    const { data: obras, error } = await supabase
      .from('obras')
      .select('id, name, status, preco_por_m2')
      .in('status', ['andamento', 'concluida', 'planejamento'])
      .is('deleted_at', null)

    if (error) throw error

    // Para cada obra, buscar resumo financeiro
    const obrasComResumo = await Promise.all(
      (obras || []).map(async (obra) => {
        // Receitas: Buscar ruas executadas da obra
        const { data: ruasObra } = await supabase
          .from('obras_ruas')
          .select('metragem_executada, preco_por_m2, valor_total, data_finalizacao')
          .eq('obra_id', obra.id)
          .eq('status', 'concluida')
          .not('metragem_executada', 'is', null)
          .gt('metragem_executada', 0)
          .is('deleted_at', null)
          .gte('data_finalizacao', dataInicio)
          .lte('data_finalizacao', dataFim)
        
        // Calcular faturamento das ruas executadas
        const faturamentos = (ruasObra || []).map((rua: any) => {
          const preco = rua.preco_por_m2 || obra.preco_por_m2 || 0
          const metragem = rua.metragem_executada || 0
          return {
            valor_total: rua.valor_total || (metragem * preco)
          }
        })

        // Despesas da obra
        const { data: despesas } = await supabase
          .from('obras_financeiro_despesas')
          .select('valor')
          .eq('obra_id', obra.id)
          .gte('data_despesa', dataInicio)
          .lte('data_despesa', dataFim)

        const totalFaturado = (faturamentos || []).reduce((sum, f) => sum + f.valor_total, 0)
        const totalDespesas = (despesas || []).reduce((sum, d) => sum + d.valor, 0)
        const lucro = totalFaturado - totalDespesas

        return {
          id: obra.id,
          nome: (obra.name || obra.nome),
          status: obra.status,
          totalFaturado,
          totalDespesas,
          lucro
        }
      })
    )

    return obrasComResumo.filter(o => o.totalFaturado > 0 || o.totalDespesas > 0)
  } catch (error) {
    console.error('Erro ao buscar obras com resumo financeiro:', error)
    throw error
  }
}

/**
 * Busca detalhes financeiros completos de todas as obras com movimentação no período
 */
export async function getObrasDetalhesFinanceiros(mesAno: { mes: number; ano: number }): Promise<ObraDetalhesFinanceiros[]> {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // Buscar obras ativas
    const { data: obras, error } = await supabase
      .from('obras')
      .select('id, name, status, preco_por_m2')
      .is('deleted_at', null)

    if (error) throw error

    // Para cada obra, buscar detalhes completos
    const obrasComDetalhes = await Promise.all(
      (obras || []).map(async (obra): Promise<ObraDetalhesFinanceiros | null> => {
        // Receitas: Buscar ruas executadas da obra com detalhes
        const { data: ruasExecutadasObra } = await supabase
          .from('obras_ruas')
          .select(`
            id,
            name,
            metragem_executada,
            toneladas_utilizadas,
            preco_por_m2,
            valor_total,
            data_finalizacao,
            status
          `)
          .eq('obra_id', obra.id)
          .eq('status', 'concluida')
          .not('metragem_executada', 'is', null)
          .gt('metragem_executada', 0)
          .is('deleted_at', null)
          .gte('data_finalizacao', dataInicio)
          .lte('data_finalizacao', dataFim)
          .order('data_finalizacao', { ascending: false })

        // Calcular faturamento de cada rua
        const faturamentos = (ruasExecutadasObra || []).map((rua: any) => {
          const preco = rua.preco_por_m2 || obra.preco_por_m2 || 0
          const metragem = rua.metragem_executada || 0
          return {
            id: rua.id,
            valor_total: rua.valor_total || (metragem * preco),
            data_finalizacao: rua.data_finalizacao,
            data_pagamento: rua.data_finalizacao,
            status: 'finalizado',
            rua: { name: rua.name }
          }
        })

        // Despesas da obra com detalhes
        const { data: despesas } = await supabase
          .from('obras_financeiro_despesas')
          .select('id, categoria, descricao, valor, data_despesa')
          .eq('obra_id', obra.id)
          .gte('data_despesa', dataInicio)
          .lte('data_despesa', dataFim)
          .order('data_despesa', { ascending: false })

        const totalFaturado = (faturamentos || []).reduce((sum, f) => sum + f.valor_total, 0)
        const totalDespesas = (despesas || []).reduce((sum, d) => sum + d.valor, 0)
        const lucro = totalFaturado - totalDespesas

        // Só retornar se tiver movimentação
        if (totalFaturado === 0 && totalDespesas === 0) {
          return null
        }

        return {
          id: obra.id,
          nome: (obra.name || obra.nome || 'Obra sem nome'),
          status: obra.status,
          totalFaturado,
          totalDespesas,
          lucro,
          faturamentos: (faturamentos || []).map(f => ({
            id: f.id,
            rua_nome: f.rua?.name || 'Rua não identificada',
            valor_total: f.valor_total,
            data_finalizacao: f.data_finalizacao,
            data_pagamento: f.data_pagamento,
            status: f.status
          })),
          despesas: despesas || []
        }
      })
    )

    return obrasComDetalhes.filter((o): o is ObraDetalhesFinanceiros => o !== null)
  } catch (error) {
    console.error('Erro ao buscar detalhes financeiros das obras:', error)
    throw error
  }
}

/**
 * Busca ruas executadas com cálculo automático de faturamento
 * Combina ruas finalizadas da tabela obras_ruas com faturamentos formais
 */
export async function getRuasExecutadasComFaturamento(mesAno: { mes: number; ano: number }) {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // Buscar ruas finalizadas/concluídas com metragem executada
    const { data: ruas, error } = await supabase
      .from('obras_ruas')
      .select(`
        id,
        obra_id,
        name,
        metragem_executada,
        toneladas_utilizadas,
        preco_por_m2,
        valor_total,
        data_finalizacao,
        status,
        obra:obras(id, name, preco_por_m2)
      `)
      .eq('status', 'concluida')
      .not('metragem_executada', 'is', null)
      .gt('metragem_executada', 0)
      .is('deleted_at', null)
      .gte('data_finalizacao', dataInicio)
      .lte('data_finalizacao', dataFim)
      .order('data_finalizacao', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar ruas executadas:', error)
      throw error
    }

    console.log('📊 Ruas executadas encontradas:', ruas?.length || 0)

    return (ruas || []).map(rua => {
      // Usar preço da rua, ou da obra como fallback, ou 0
      const precoM2 = rua.preco_por_m2 || rua.obra?.preco_por_m2 || 0
      const metragem = rua.metragem_executada || 0
      const valorCalculado = metragem * precoM2

      return {
        id: rua.id,
        obra_id: rua.obra_id,
        obra_nome: rua.obra?.name || 'Obra não identificada',
        rua_nome: rua.name || 'Rua não identificada',
        metragem_executada: metragem,
        toneladas_utilizadas: rua.toneladas_utilizadas || 0,
        preco_por_m2: precoM2,
        valor_executado: rua.valor_total || valorCalculado,
        data_finalizacao: rua.data_finalizacao,
        status: 'finalizado'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar ruas executadas:', error)
    return []
  }
}

/**
 * Busca todos os faturamentos do período (consolidado)
 */
export async function getTodosFaturamentos(mesAno: { mes: number; ano: number }) {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    const { data, error } = await supabase
      .from('obras_financeiro_faturamentos')
      .select(`
        id,
        valor_total,
        data_finalizacao,
        data_pagamento,
        status,
        obra:obras(id, name),
        rua:obras_ruas(name)
      `)
      .is('deleted_at', null)
      .gte('data_finalizacao', dataInicio)
      .lte('data_finalizacao', dataFim)
      .order('data_finalizacao', { ascending: false })

    if (error) throw error

    return (data || []).map(f => ({
      id: f.id,
      obra_id: f.obra?.id,
      obra_nome: f.obra?.name || 'Obra não identificada',
      rua_nome: f.rua?.name || 'Rua não identificada',
      valor_total: f.valor_total,
      data_finalizacao: f.data_finalizacao,
      data_pagamento: f.data_pagamento,
      status: f.status
    }))
  } catch (error) {
    console.error('Erro ao buscar todos os faturamentos:', error)
    return []
  }
}

/**
 * Busca KPIs de recebimentos (notas fiscais pagas + pagamentos diretos)
 */
export async function getRecebimentosKPIs(mesAno: { mes: number; ano: number }) {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // Buscar TODAS as notas fiscais e filtrar no código
    const { data: todasNotas } = await supabase
      .from('obras_notas_fiscais')
      .select('valor_liquido, data_pagamento, vencimento, status')
    
    // Filtrar apenas as pagas no período
    const notasPagas = (todasNotas || []).filter((nota: any) => {
      if (nota.status !== 'paga') return false
      const dataRef = nota.data_pagamento || nota.vencimento
      if (!dataRef) return false
      return dataRef >= dataInicio && dataRef <= dataFim
    })

    // Buscar TODOS os pagamentos diretos e filtrar no código
    const { data: todosPagamentos } = await supabase
      .from('obras_pagamentos_diretos')
      .select('amount, payment_date, valor, data_pagamento')
    
    // Filtrar apenas os do período
    const pagamentosDiretos = (todosPagamentos || []).filter((pag: any) => {
      const dataRef = pag.payment_date || pag.data_pagamento
      if (!dataRef) return false
      return dataRef >= dataInicio && dataRef <= dataFim
    })

    const totalNotasPagas = notasPagas.reduce((sum: number, n: any) => sum + (n.valor_liquido || 0), 0)
    const totalPagamentosDiretos = pagamentosDiretos.reduce((sum: number, p: any) => sum + (p.amount || p.valor || 0), 0)
    const totalRecebido = totalNotasPagas + totalPagamentosDiretos

    console.log('📊 [getRecebimentosKPIs] Período:', { dataInicio, dataFim })
    console.log('📊 [getRecebimentosKPIs] Notas pagas:', notasPagas.length, 'Total:', totalNotasPagas)
    console.log('📊 [getRecebimentosKPIs] Pagamentos diretos:', pagamentosDiretos.length, 'Total:', totalPagamentosDiretos)

    return {
      totalRecebido,
      totalNotasPagas,
      totalPagamentosDiretos,
      quantidadeNotas: notasPagas.length,
      quantidadePagamentos: pagamentosDiretos.length,
      quantidadeTotal: notasPagas.length + pagamentosDiretos.length
    }
  } catch (error) {
    console.error('Erro ao buscar KPIs de recebimentos:', error)
    return {
      totalRecebido: 0,
      totalNotasPagas: 0,
      totalPagamentosDiretos: 0,
      quantidadeNotas: 0,
      quantidadePagamentos: 0,
      quantidadeTotal: 0
    }
  }
}

/**
 * Busca todas as despesas do período (consolidado)
 */
export async function getTodasDespesas(mesAno: { mes: number; ano: number }) {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    const { data, error } = await supabase
      .from('obras_financeiro_despesas')
      .select(`
        id,
        categoria,
        descricao,
        valor,
        data_despesa,
        obra:obras(id, name)
      `)
      .gte('data_despesa', dataInicio)
      .lte('data_despesa', dataFim)
      .order('data_despesa', { ascending: false })

    if (error) throw error

    return (data || []).map(d => ({
      id: d.id,
      obra_id: d.obra?.id,
      obra_nome: d.obra?.name || 'Obra não identificada',
      categoria: d.categoria,
      descricao: d.descricao,
      valor: d.valor,
      data_despesa: d.data_despesa
    }))
  } catch (error) {
    console.error('Erro ao buscar todas as despesas:', error)
    return []
  }
}


/**
 * Agrega receitas por dia no período informado
 * Fonte: Ruas executadas (obras_ruas com status concluida)
 */
export async function getReceitasPorDia(
  mesAno: { mes: number; ano: number }
): Promise<Array<{ data: string; valor: number }>> {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // Buscar ruas executadas com obra para pegar preco_por_m2
    const { data: ruas, error } = await supabase
      .from('obras_ruas')
      .select(`
        data_finalizacao,
        metragem_executada,
        preco_por_m2,
        valor_total,
        obra:obras(preco_por_m2)
      `)
      .eq('status', 'concluida')
      .not('metragem_executada', 'is', null)
      .gt('metragem_executada', 0)
      .is('deleted_at', null)
      .gte('data_finalizacao', dataInicio)
      .lte('data_finalizacao', dataFim)

    if (error) throw error

    const mapa = new Map<string, number>()

    ;(ruas || []).forEach((rua: any) => {
      const dia = String(rua.data_finalizacao)
      const preco = rua.preco_por_m2 || rua.obra?.preco_por_m2 || 0
      const metragem = rua.metragem_executada || 0
      const valor = rua.valor_total || (metragem * preco)
      mapa.set(dia, (mapa.get(dia) || 0) + Number(valor || 0))
    })

    return Array.from(mapa.entries())
      .map(([data, valor]) => ({ data, valor }))
      .sort((a, b) => a.data.localeCompare(b.data))
  } catch (error) {
    console.error('❌ Erro ao buscar receitas por dia:', error)
    return []
  }
}

/**
 * Agrega despesas por dia e por categoria no período informado
 * Considera APENAS: obras_financeiro_despesas (fonte única para evitar duplicação)
 */
export async function getDespesasPorDiaECategoria(
  mesAno: { mes: number; ano: number }
): Promise<{ porDia: Array<{ data: string; valor: number }>; porCategoria: DespesaCategoriaValor[] }> {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // Buscar APENAS de obras_financeiro_despesas para evitar duplicação
    const { data: despesasObra, error } = await supabase
      .from('obras_financeiro_despesas')
      .select('data_despesa, categoria, valor, obra_id')
      .gte('data_despesa', dataInicio)
      .lte('data_despesa', dataFim)

    if (error) {
      console.error('❌ Erro ao buscar despesas:', error)
      throw error
    }

    console.log('📊 Despesas encontradas para gráfico:', despesasObra?.length || 0)

    const porDiaMap = new Map<string, number>()
    const porCategoriaMap = new Map<string, number>()

    const add = (dia: string | null | undefined, valor: number, categoria?: string) => {
      if (!dia) return
      const valorNum = Number(valor || 0)
      porDiaMap.set(dia, (porDiaMap.get(dia) || 0) + valorNum)
      if (categoria) porCategoriaMap.set(categoria, (porCategoriaMap.get(categoria) || 0) + valorNum)
    }

    // Adicionar apenas despesas de obras_financeiro_despesas
    ;(despesasObra || []).forEach((d: any) => {
      add(String(d.data_despesa), d.valor, d.categoria || 'outros')
    })

    const porDia = Array.from(porDiaMap.entries())
      .map(([data, valor]) => ({ data, valor }))
      .sort((a, b) => a.data.localeCompare(b.data))

    const porCategoria: DespesaCategoriaValor[] = Array.from(porCategoriaMap.entries())
      .map(([categoria, valor]) => ({ categoria, valor }))

    console.log('📊 Total despesas agregadas:', porDia.reduce((sum, d) => sum + d.valor, 0))

    return { porDia, porCategoria }
  } catch (error) {
    console.error('❌ Erro ao agregar despesas:', error)
    return { porDia: [], porCategoria: [] }
  }
}

/**
 * Retorna série combinada Receitas x Despesas por dia para gráficos
 */
export async function getSerieReceitasDespesas(
  mesAno: { mes: number; ano: number }
): Promise<SerieDiaValor[]> {
  const [receitas, despesas] = await Promise.all([
    getReceitasPorDia(mesAno),
    getDespesasPorDiaECategoria(mesAno)
  ])

  const dias = new Set<string>([
    ...receitas.map(r => r.data),
    ...despesas.porDia.map(d => d.data)
  ])

  const byDay = (arr: Array<{ data: string; valor: number }>) => {
    const m = new Map(arr.map(i => [i.data, i.valor]))
    return (dia: string) => Number(m.get(dia) || 0)
  }

  const getR = byDay(receitas)
  const getD = byDay(despesas.porDia)

  return Array.from(dias)
    .sort((a, b) => a.localeCompare(b))
    .map(dia => ({ data: dia, receitas: getR(dia), despesas: getD(dia) }))
}


