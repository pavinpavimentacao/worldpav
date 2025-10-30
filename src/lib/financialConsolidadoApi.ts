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
    // Receitas (preferência: faturamentos pagos). Se colunas não existirem, usar obras_financeiro
    // =============================
    let faturamentos: any[] = []
    try {
      const fatQuery = await supabase
        .from('obras_financeiro_faturamentos')
        .select(`
          id,
          data_pagamento,
          obra_id,
          valor_total,
          nota_fiscal,
          status
        `)
        .eq('status', 'pago')
        .gte('data_pagamento', dataInicio)
        .lte('data_pagamento', dataFim)
        .order('data_pagamento', { ascending: false })

      if (fatQuery.error) throw fatQuery.error
      faturamentos = fatQuery.data || []
    } catch {
      // Fallback: usar obras_financeiro (type='receita')
      const { data: recOF, error: recErr } = await supabase
        .from('obras_financeiro')
        .select('id, obra_id, description, amount, date')
        .eq('type', 'receita')
        .gte('date', dataInicio)
        .lte('date', dataFim)
      if (recErr) throw recErr
      faturamentos = (recOF || []).map((r: any) => ({
        id: r.id,
        data_pagamento: r.date,
        obra_id: r.obra_id,
        valor_total: r.amount,
        nota_fiscal: null,
        status: 'pago',
        obra: r.obra,
        rua: { nome: r.description }
      }))
    }

    // =============================
    // Despesas (tabela principal + diesel + contas_pagar vinculadas)
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
        valor,
        sincronizado_financeiro_principal
      `)
      .eq('sincronizado_financeiro_principal', true)
      .gte('data_despesa', dataInicio)
      .lte('data_despesa', dataFim)
      .order('data_despesa', { ascending: false })

    if (despesasError) throw despesasError

    // Diesel
    const { data: diesel } = await supabase
      .from('maquinarios_diesel')
      .select('obra_id, valor_total, data_abastecimento')
      .not('obra_id', 'is', null)
      .gte('data_abastecimento', dataInicio)
      .lte('data_abastecimento', dataFim)

    // Contas pagas vinculadas a obra
    const { data: cp } = await supabase
      .from('contas_pagar')
      .select('obra_id, amount, payment_date, status')
      .eq('status', 'pago')
      .not('obra_id', 'is', null)
      .gte('payment_date', dataInicio)
      .lte('payment_date', dataFim)

    // Formatar faturamentos
    const faturamentosFormatados: FaturamentoConsolidado[] = (faturamentos || []).map(f => ({
      id: f.id,
      data_pagamento: f.data_pagamento,
      obra_id: f.obra_id,
      obra_nome: (f.obra?.name || f.obra?.nome) || 'Obra não identificada',
      rua_nome: f.rua?.nome || 'Rua não identificada',
      valor_total: f.valor_total,
      numero_nota_fiscal: f.nota_fiscal,
      status: f.status
    }))

    // Formatar despesas
    // Base: despesas da tabela de despesas
    const despesasLista: DespesaConsolidada[] = (despesasObras || []).map(d => ({
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

    // Somar diesel
    ;(diesel || []).forEach((row: any, idx: number) => {
      despesasLista.push({
        id: `diesel-${idx}`,
        data_despesa: row.data_abastecimento,
        obra_id: row.obra_id,
        obra_nome: undefined,
        maquinario_id: undefined,
        maquinario_nome: undefined,
        categoria: 'diesel',
        descricao: 'Abastecimento',
        valor: row.valor_total || 0,
      })
    })

    // Somar contas a pagar pagas
    ;(cp || []).forEach((row: any, idx: number) => {
      despesasLista.push({
        id: `cp-${idx}`,
        data_despesa: row.payment_date,
        obra_id: row.obra_id,
        obra_nome: undefined,
        maquinario_id: undefined,
        maquinario_nome: undefined,
        categoria: 'conta_paga',
        descricao: 'Conta paga vinculada à obra',
        valor: row.amount || 0,
      })
    })

    const despesasFormatadas = despesasLista

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

/**
 * Busca lista de obras ativas com resumo financeiro
 */
export async function getObrasComResumoFinanceiro(mesAno: { mes: number; ano: number }) {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  try {
    // Buscar obras ativas
    const { data: obras, error } = await supabase
      .from('obras')
      .select('id, name, status')
      .in('status', ['em_andamento', 'concluida'])

    if (error) throw error

    // Para cada obra, buscar resumo financeiro
    const obrasComResumo = await Promise.all(
      (obras || []).map(async (obra) => {
        // Faturamentos da obra
        const { data: faturamentos } = await supabase
          .from('obras_financeiro_faturamentos')
          .select('valor_total')
          .eq('obra_id', obra.id)
          .eq('status', 'pago')
          .gte('data_pagamento', dataInicio)
          .lte('data_pagamento', dataFim)

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
 * Agrega receitas por dia no período informado
 * Considera: obras_financeiro_faturamentos (status 'pago')
 *            obras_pagamentos_diretos (todas)
 */
export async function getReceitasPorDia(
  mesAno: { mes: number; ano: number }
): Promise<Array<{ data: string; valor: number }>> {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  // Faturamentos pagos (data_pagamento)
  const { data: fat } = await supabase
    .from('obras_financeiro_faturamentos')
    .select('data_pagamento, valor_total')
    .eq('status', 'pago')
    .gte('data_pagamento', dataInicio)
    .lte('data_pagamento', dataFim)

  // Pagamentos diretos (payment_date)
  const { data: pd } = await supabase
    .from('obras_pagamentos_diretos')
    .select('payment_date, amount')
    .gte('payment_date', dataInicio)
    .lte('payment_date', dataFim)

  // Movimentações gerais marcadas como receita (date)
  const { data: rec } = await supabase
    .from('obras_financeiro')
    .select('date, amount, type')
    .eq('type', 'receita')
    .gte('date', dataInicio)
    .lte('date', dataFim)

  const mapa = new Map<string, number>()

  ;(fat || []).forEach((f: any) => {
    const dia = String(f.data_pagamento)
    mapa.set(dia, (mapa.get(dia) || 0) + Number(f.valor_total || 0))
  })

  ;(pd || []).forEach((p: any) => {
    const dia = String(p.payment_date)
    mapa.set(dia, (mapa.get(dia) || 0) + Number(p.amount || 0))
  })

  ;(rec || []).forEach((r: any) => {
    const dia = String(r.date)
    mapa.set(dia, (mapa.get(dia) || 0) + Number(r.amount || 0))
  })

  return Array.from(mapa.entries())
    .map(([data, valor]) => ({ data, valor }))
    .sort((a, b) => a.data.localeCompare(b.data))
}

/**
 * Agrega despesas por dia e por categoria no período informado
 * Considera: obras_financeiro_despesas (data_despesa)
 *            maquinarios_diesel (data_abastecimento como categoria 'diesel')
 *            contas_pagar (payment_date quando status = 'pago' e obra_id não nulo)
 */
export async function getDespesasPorDiaECategoria(
  mesAno: { mes: number; ano: number }
): Promise<{ porDia: Array<{ data: string; valor: number }>; porCategoria: DespesaCategoriaValor[] }> {
  const dataInicio = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(mesAno.ano, mesAno.mes, 0).getDate()
  const dataFim = `${mesAno.ano}-${String(mesAno.mes).padStart(2, '0')}-${ultimoDia}`

  const { data: despesasObra } = await supabase
    .from('obras_financeiro_despesas')
    .select('data_despesa, categoria, valor')
    .gte('data_despesa', dataInicio)
    .lte('data_despesa', dataFim)

  const { data: diesel } = await supabase
    .from('maquinarios_diesel')
    .select('data_abastecimento, valor_total, obra_id')
    .not('obra_id', 'is', null)
    .gte('data_abastecimento', dataInicio)
    .lte('data_abastecimento', dataFim)

  // Movimentações gerais marcadas como despesa
  const { data: movDesp } = await supabase
    .from('obras_financeiro')
    .select('date, amount, category, type')
    .eq('type', 'despesa')
    .gte('date', dataInicio)
    .lte('date', dataFim)

  const { data: cp } = await supabase
    .from('contas_pagar')
    .select('payment_date, amount, status, obra_id')
    .eq('status', 'pago')
    .not('obra_id', 'is', null)
    .gte('payment_date', dataInicio)
    .lte('payment_date', dataFim)

  const porDiaMap = new Map<string, number>()
  const porCategoriaMap = new Map<string, number>()

  const add = (dia: string | null | undefined, valor: number, categoria?: string) => {
    if (!dia) return
    porDiaMap.set(dia, (porDiaMap.get(dia) || 0) + Number(valor || 0))
    if (categoria) porCategoriaMap.set(categoria, (porCategoriaMap.get(categoria) || 0) + Number(valor || 0))
  }

  ;(despesasObra || []).forEach((d: any) => add(String(d.data_despesa), d.valor, d.categoria || 'outros'))
  ;(diesel || []).forEach((d: any) => add(String(d.data_abastecimento), d.valor_total, 'diesel'))
  ;(cp || []).forEach((d: any) => add(String(d.payment_date), d.amount, 'contas_pagar'))
  ;(movDesp || []).forEach((d: any) => add(String(d.date), d.amount, d.category || 'outros'))

  const porDia = Array.from(porDiaMap.entries())
    .map(([data, valor]) => ({ data, valor }))
    .sort((a, b) => a.data.localeCompare(b.data))

  const porCategoria: DespesaCategoriaValor[] = Array.from(porCategoriaMap.entries())
    .map(([categoria, valor]) => ({ categoria, valor }))

  return { porDia, porCategoria }
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


