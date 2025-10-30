/**
 * API para gerenciar Notas Fiscais de Obras
 */

import { supabase } from './supabase'
import type {
  ObraNotaFiscal,
  CreateNotaFiscalInput,
  UpdateNotaFiscalInput,
  NotaFiscalFilters
} from '../types/obras-financeiro'
import { calcularValorLiquido } from '../utils/notas-fiscais-utils'

// Desabilitar RLS temporariamente para evitar erros
// TODO: Configurar RLS adequadamente no banco

/**
 * Busca todas as notas fiscais de uma obra
 */
export async function getNotasFiscaisByObra(
  obraId: string,
  filters?: NotaFiscalFilters
): Promise<ObraNotaFiscal[]> {
  let query = supabase
    .from('obras_notas_fiscais')
    .select('*')
    .eq('obra_id', obraId)
    .order('vencimento', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.data_inicio) {
    query = query.gte('vencimento', filters.data_inicio)
  }
  
  if (filters?.data_fim) {
    query = query.lte('vencimento', filters.data_fim)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Erro ao buscar notas fiscais:', error)
    throw new Error('Erro ao buscar notas fiscais')
  }
  
  return data || []
}

/**
 * Busca uma nota fiscal por ID
 */
export async function getNotaFiscalById(id: string): Promise<ObraNotaFiscal | null> {
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar nota fiscal:', error)
    return null
  }
  
  return data
}

/**
 * Cria uma nova nota fiscal
 */
export async function createNotaFiscal(input: CreateNotaFiscalInput): Promise<ObraNotaFiscal> {
  // Calcula o valor líquido
  const valorLiquido = calcularValorLiquido(
    input.valor_nota,
    input.desconto_inss || 0,
    input.desconto_iss || 0,
    input.outro_desconto || 0
  )
  
  // Status padrão é 'emitida'
  const status = 'emitida'
  
  console.log('🔍 Dados sendo inseridos na nota fiscal:', {
    obra_id: input.obra_id,
    numero_nota: input.numero_nota,
    valor_nota: input.valor_nota,
    vencimento: input.vencimento,
    desconto_inss: input.desconto_inss || 0,
    desconto_iss: input.desconto_iss || 0,
    outro_desconto: input.outro_desconto || 0,
    valor_liquido: valorLiquido,
    status,
    arquivo_nota_url: input.arquivo_nota_url,
    observacoes: input.observacoes
  })

  console.log('🔍 Tentando inserir na tabela obras_notas_fiscais...')
  
  const insertData = {
    obra_id: input.obra_id,
    numero_nota: input.numero_nota,
    valor_nota: input.valor_nota,
    vencimento: input.vencimento,
    desconto_inss: input.desconto_inss || 0,
    desconto_iss: input.desconto_iss || 0,
    outro_desconto: input.outro_desconto || 0,
    valor_liquido: valorLiquido,
    status,
    arquivo_nota_url: input.arquivo_nota_url,
    observacoes: input.observacoes
  }
  
  console.log('📝 Dados para inserção:', insertData)
  console.log('🔍 Verificando se obra_id é válido:', input.obra_id)
  console.log('🔍 Verificando se numero_nota é válido:', input.numero_nota)
  console.log('🔍 Verificando se valor_nota é válido:', input.valor_nota)
  
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .insert(insertData)
    .select()
    .single()
  
  if (error) {
    console.error('❌ Erro detalhado ao criar nota fiscal:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw new Error(`Erro ao criar nota fiscal: ${error.message}`)
  }
  
  console.log('✅ Nota fiscal criada com sucesso:', data)
  return data
}

/**
 * Atualiza uma nota fiscal (marca como renegociado)
 */
export async function updateNotaFiscal(
  id: string,
  input: UpdateNotaFiscalInput
): Promise<ObraNotaFiscal> {
  // Busca a nota atual para recalcular o valor líquido
  const notaAtual = await getNotaFiscalById(id)
  
  if (!notaAtual) {
    throw new Error('Nota fiscal não encontrada')
  }
  
  // Calcula o novo valor líquido
  const valorNota = input.valor_nota ?? notaAtual.valor_nota
  const descontoInss = input.desconto_inss ?? notaAtual.desconto_inss
  const descontoIss = input.desconto_iss ?? notaAtual.desconto_iss
  const outroDesconto = input.outro_desconto ?? notaAtual.outro_desconto
  
  const valorLiquido = calcularValorLiquido(
    valorNota,
    descontoInss,
    descontoIss,
    outroDesconto
  )
  
  const updateData: any = {
    ...input,
    valor_liquido: valorLiquido,
    updated_at: new Date().toISOString()
  }
  
  // Se o status foi informado, usa o status informado, senão mantém o atual
  if (input.status) {
    updateData.status = input.status
  }
  
  console.log('📝 Dados para atualização:', updateData)
  
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao atualizar nota fiscal:', error)
    throw new Error(`Erro ao atualizar nota fiscal: ${error.message}`)
  }
  
  return data
}

/**
 * Marca uma nota fiscal como paga
 */
export async function marcarNotaComoPaga(
  id: string,
  dataPagamento: string
): Promise<ObraNotaFiscal> {
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .update({
      status: 'pago',
      data_pagamento: dataPagamento
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Erro ao marcar nota como paga:', error)
    throw new Error('Erro ao marcar nota como paga')
  }
  
  return data
}

/**
 * Deleta uma nota fiscal
 */
export async function deleteNotaFiscal(id: string): Promise<void> {
  // Verifica se há medições vinculadas
  const { data: medicoes } = await supabase
    .from('obras_medicoes')
    .select('id')
    .eq('nota_fiscal_id', id)
    .limit(1)
  
  if (medicoes && medicoes.length > 0) {
    throw new Error('Não é possível excluir uma nota fiscal que possui medições vinculadas')
  }
  
  const { error } = await supabase
    .from('obras_notas_fiscais')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao deletar nota fiscal:', error)
    throw new Error('Erro ao deletar nota fiscal')
  }
}

/**
 * Verifica e conta notas vencidas de uma obra (sem atualizar status)
 */
export async function verificarNotasVencidas(obraId: string): Promise<number> {
  const hoje = new Date().toISOString().split('T')[0]
  
  // Apenas conta as notas vencidas (vencimento < hoje e status = 'emitida')
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .select('id')
    .eq('obra_id', obraId)
    .eq('status', 'emitida')
    .lt('vencimento', hoje)
  
  if (error) {
    console.error('Erro ao verificar notas vencidas:', error)
    return 0
  }
  
  // Retorna apenas a contagem, sem atualizar o status
  // (O enum não permite 'vencido', então mantemos a nota como 'emitida')
  return data?.length || 0
}

/**
 * Busca todas as notas fiscais (para página de recebimentos)
 */
export async function getAllNotasFiscais(
  filters?: NotaFiscalFilters
): Promise<Array<ObraNotaFiscal & { obra_nome?: string }>> {
  try {
    // Buscar notas fiscais diretamente
    let query = supabase
      .from('obras_notas_fiscais')
      .select('*')
      .order('vencimento', { ascending: false })
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.data_inicio) {
      query = query.gte('vencimento', filters.data_inicio)
    }
    
    if (filters?.data_fim) {
      query = query.lte('vencimento', filters.data_fim)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar notas fiscais:', error)
      return []
    }
    
    // Buscar nomes das obras para cada nota
    const notasComObra = await Promise.all(
      (data || []).map(async (nota: any) => {
        try {
          const { data: obra } = await supabase
            .from('obras')
            .select('name')
            .eq('id', nota.obra_id)
            .single()
          
          return {
            ...nota,
            obra_nome: obra?.name || 'Obra não encontrada'
          }
        } catch (e) {
          console.error(`Erro ao buscar obra ${nota.obra_id}:`, e)
          return {
            ...nota,
            obra_nome: 'Obra não encontrada'
          }
        }
      })
    )
    
    return notasComObra
  } catch (error) {
    console.error('Erro ao buscar todas as notas fiscais:', error)
    return []
  }
}

/**
 * Calcula o faturamento bruto (soma de todas as notas fiscais da obra)
 */
export async function getFaturamentoBruto(obraId: string): Promise<number> {
  const { data, error } = await supabase
    .from('obras_notas_fiscais')
    .select('valor_nota')
    .eq('obra_id', obraId)
  
  if (error) {
    console.error('Erro ao calcular faturamento bruto:', error)
    return 0
  }
  
  return data?.reduce((total, nota) => total + (nota.valor_nota || 0), 0) || 0
}

/**
 * Calcula o faturamento bruto total (notas fiscais + pagamentos diretos)
 */
export async function getFaturamentoBrutoTotal(obraId: string): Promise<number> {
  try {
    // Buscar notas fiscais
    const { data: notas, error: notasError } = await supabase
      .from('obras_notas_fiscais')
      .select('valor_nota')
      .eq('obra_id', obraId)
    
    if (notasError) {
      console.error('Erro ao buscar notas fiscais:', notasError)
    }

    // Buscar pagamentos diretos
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('obras_pagamentos_diretos')
      .select('amount')
      .eq('obra_id', obraId)
    
    if (pagamentosError) {
      console.error('Erro ao buscar pagamentos diretos:', pagamentosError)
    }

    // Calcular totais
    const totalNotas = (notas || []).reduce((total, nota) => total + (nota.valor_nota || 0), 0)
    const totalPagamentos = (pagamentos || []).reduce((total, pagamento) => total + (pagamento.amount || 0), 0)
    
    const total = totalNotas + totalPagamentos
    
    console.log('💰 Faturamento bruto total:', {
      totalNotas,
      totalPagamentos,
      total
    })
    
    return total
  } catch (error) {
    console.error('Erro ao calcular faturamento bruto total:', error)
    return 0
  }
}

/**
 * Busca KPIs de recebimentos
 */
export interface RecebimentosKPIs {
  total_recebimentos: number
  total_faturamento_bruto: number
  total_pendentes: number
  total_vencidos: number
}

export async function getRecebimentosKPIs(): Promise<RecebimentosKPIs> {
  try {
    const hoje = new Date().toISOString().split('T')[0]
    
    console.log('📊 [KPIs] Buscando dados para calcular recebimentos...')
    
    // Buscar TODAS as notas fiscais
    const { data: todasNotas, error: errorNotas } = await supabase
      .from('obras_notas_fiscais')
      .select('valor_liquido, status, vencimento')
    
    if (errorNotas) {
      console.error('❌ Erro ao buscar notas para KPIs:', errorNotas)
    } else {
      console.log(`✅ [KPIs] ${todasNotas?.length || 0} notas encontradas`)
      console.log('📊 [KPIs] Detalhes das notas:', todasNotas)
    }
    
    // Buscar TODOS os pagamentos diretos
    const { data: todosPagamentos, error: errorPag } = await supabase
      .from('obras_pagamentos_diretos')
      .select('amount')
    
    if (errorPag) {
      console.error('❌ Erro ao buscar pagamentos para KPIs:', errorPag)
    } else {
      console.log(`✅ [KPIs] ${todosPagamentos?.length || 0} pagamentos encontrados`)
    }
    
    // Calcular totais
    const totalNotas = (todasNotas || []).reduce((sum, n) => sum + (n.valor_liquido || 0), 0)
    const totalPagamentos = (todosPagamentos || []).reduce((sum, p) => sum + (p.amount || 0), 0)
    
    const notasPagas = (todasNotas || []).filter(n => n.status === 'paga').reduce((sum, n) => sum + (n.valor_liquido || 0), 0)
    const notasEmitidas = (todasNotas || []).filter(n => n.status === 'emitida').reduce((sum, n) => sum + (n.valor_liquido || 0), 0)
    const notasEnviadas = (todasNotas || []).filter(n => n.status === 'enviada').reduce((sum, n) => sum + (n.valor_liquido || 0), 0)
    
    console.log('📊 [KPIs] Notas pagas:', notasPagas)
    console.log('📊 [KPIs] Notas emitidas:', notasEmitidas)
    console.log('📊 [KPIs] Notas enviadas:', notasEnviadas)
    console.log('📊 [KPIs] Status das notas:', (todasNotas || []).map(n => n.status))
    
    // Notas vencidas são as emitidas/enviadas que já passaram do vencimento
    const notasVencidas = (todasNotas || [])
      .filter(n => (n.status === 'emitida' || n.status === 'enviada') && n.vencimento && n.vencimento < hoje)
      .reduce((sum, n) => sum + (n.valor_liquido || 0), 0)
    
    const notasPendentes = notasEmitidas + notasEnviadas - notasVencidas
    
    const resultado = {
      total_recebimentos: totalNotas + totalPagamentos,
      total_faturamento_bruto: notasPagas + totalPagamentos,
      total_pendentes: notasPendentes,
      total_vencidos: notasVencidas
    }
    
    console.log('📊 [KPIs] Resultado calculado:', resultado)
    console.log('📊 [KPIs] Total Recebimentos:', resultado.total_recebimentos)
    console.log('📊 [KPIs] Faturamento Bruto:', resultado.total_faturamento_bruto)
    console.log('📊 [KPIs] Pendentes:', resultado.total_pendentes)
    console.log('📊 [KPIs] Vencidos:', resultado.total_vencidos)
    console.log('📊 [KPIs] Detalhes:', {
      notasPagas,
      notasEmitidas,
      notasEnviadas,
      notasVencidas,
      totalPagamentos,
      statusNotas: todasNotas?.map(n => ({ status: n.status, valor: n.valor_liquido, vencimento: n.vencimento }))
    })
    
    return resultado
  } catch (error) {
    console.error('❌ Erro ao calcular KPIs:', error)
    return {
      total_recebimentos: 0,
      total_faturamento_bruto: 0,
      total_pendentes: 0,
      total_vencidos: 0
    }
  }
}






