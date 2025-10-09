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
    // Buscar faturamentos pagos de obras no período
    const { data: faturamentos, error: faturamentosError } = await supabase
      .from('obras_financeiro_faturamentos')
      .select(`
        id,
        data_pagamento,
        obra_id,
        valor_total,
        numero_nota_fiscal,
        status,
        obra:obras(id, nome),
        rua:obras_ruas(nome)
      `)
      .eq('status', 'pago')
      .gte('data_pagamento', dataInicio)
      .lte('data_pagamento', dataFim)
      .order('data_pagamento', { ascending: false })

    if (faturamentosError) throw faturamentosError

    // Buscar despesas sincronizadas de obras no período
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
        sincronizado_financeiro_principal,
        obra:obras(id, nome),
        maquinario:maquinarios(id, nome)
      `)
      .eq('sincronizado_financeiro_principal', true)
      .gte('data_despesa', dataInicio)
      .lte('data_despesa', dataFim)
      .order('data_despesa', { ascending: false })

    if (despesasError) throw despesasError

    // Formatar faturamentos
    const faturamentosFormatados: FaturamentoConsolidado[] = (faturamentos || []).map(f => ({
      id: f.id,
      data_pagamento: f.data_pagamento,
      obra_id: f.obra_id,
      obra_nome: f.obra?.nome || 'Obra não identificada',
      rua_nome: f.rua?.nome || 'Rua não identificada',
      valor_total: f.valor_total,
      numero_nota_fiscal: f.numero_nota_fiscal,
      status: f.status
    }))

    // Formatar despesas
    const despesasFormatadas: DespesaConsolidada[] = (despesasObras || []).map(d => ({
      id: d.id,
      data_despesa: d.data_despesa,
      obra_id: d.obra_id,
      obra_nome: d.obra?.nome,
      maquinario_id: d.maquinario_id,
      maquinario_nome: d.maquinario?.nome,
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
      .select('id, nome, status')
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
          nome: obra.nome,
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


